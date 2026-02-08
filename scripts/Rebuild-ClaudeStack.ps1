#Requires -Version 7.0
# Date context pinned to 2026-02-08; future-dated requests ignored.

<#
.SYNOPSIS
    Deterministic Claude Desktop + MCP Stack Rebuild
.DESCRIPTION
    Idempotent PowerShell 7 script for Windows 11 ARM64 that rebuilds Claude Desktop 
    MCP infrastructure from LOCAL-ONLY pinned .tgz packages with comprehensive backup,
    quarantine, validation, and snapshot capabilities.
.NOTES
    Version: 1.1.0
    Date: 2026-02-08
    Requires: PowerShell 7+, Windows 11 ARM64, Node.js (absolute path resolution)
    
    Offline npm install strategy (Strategy B):
      This script requires a pre-seeded npm cache archive at:
        <script_dir>/mcp_packages/npm-cache.zip
      The archive is unzipped into <StackRoot>/mcp/.npm-cache before npm install.
      To create the archive, run on an online machine:
        npm cache clean --force
        npm install @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-memory --cache ./npm-cache
        Compress-Archive -Path ./npm-cache/* -DestinationPath npm-cache.zip
      Then place npm-cache.zip into scripts/mcp_packages/.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

#region Helper Functions

function Write-Status {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Get-AbsolutePath {
    param([string]$Path)
    return [System.IO.Path]::GetFullPath($Path)
}

function New-ZipArchive {
    param(
        [string]$SourcePath,
        [string]$DestinationPath
    )
    if (Test-Path $DestinationPath) {
        Remove-Item $DestinationPath -Force
    }
    Compress-Archive -Path $SourcePath -DestinationPath $DestinationPath -CompressionLevel Optimal
    if (-not (Test-Path $DestinationPath)) {
        throw "Failed to create ZIP archive: $DestinationPath"
    }
    $zipSize = (Get-Item $DestinationPath).Length
    if ($zipSize -eq 0) {
        throw "ZIP archive is empty: $DestinationPath"
    }
    Write-Status "Created ZIP archive: $DestinationPath ($zipSize bytes)" "SUCCESS"
}

function Find-NodeExecutable {
    $candidates = @(
        "$env:ProgramFiles\nodejs\node.exe",
        "$env:ProgramFiles(x86)\nodejs\node.exe",
        "${env:ProgramFiles(ARM)}\nodejs\node.exe",
        "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
        "$env:APPDATA\npm\node.exe"
    )
    
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            Write-Status "Found Node.js: $candidate" "SUCCESS"
            return Get-AbsolutePath $candidate
        }
    }
    
    throw "Node.js executable not found in standard locations. Please install Node.js."
}

function Find-NpmCli {
    param([string]$NodeExePath)
    
    $nodeDir = Split-Path -Parent $NodeExePath
    $npmCliPath = Join-Path $nodeDir "node_modules\npm\bin\npm-cli.js"
    
    if (Test-Path $npmCliPath) {
        Write-Status "Found npm-cli.js: $npmCliPath" "SUCCESS"
        return Get-AbsolutePath $npmCliPath
    }
    
    throw "npm-cli.js not found relative to Node.js installation: $npmCliPath"
}

function Invoke-NodeCommand {
    param(
        [string]$NodeExe,
        [string[]]$Arguments,
        [string]$WorkingDirectory = $PWD
    )
    
    $process = Start-Process -FilePath $NodeExe -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory -NoNewWindow -Wait -PassThru `
        -RedirectStandardOutput "$env:TEMP\node_stdout.txt" `
        -RedirectStandardError "$env:TEMP\node_stderr.txt"
    
    $stdout = if (Test-Path "$env:TEMP\node_stdout.txt") { 
        Get-Content "$env:TEMP\node_stdout.txt" -Raw 
    } else { "" }
    $stderr = if (Test-Path "$env:TEMP\node_stderr.txt") { 
        Get-Content "$env:TEMP\node_stderr.txt" -Raw 
    } else { "" }
    
    return @{
        ExitCode = $process.ExitCode
        StdOut = $stdout
        StdErr = $stderr
    }
}

function Test-McpServer {
    param(
        [string]$NodeExe,
        [string]$ServerScript,
        [int]$TimeoutSeconds = 10
    )
    
    Write-Status "Testing MCP server: $ServerScript"
    
    # MCP protocol version: 2025-06-18
    $initRequest = @{
        jsonrpc = "2.0"
        id = 1
        method = "initialize"
        params = @{
            protocolVersion = "2025-06-18"
            capabilities = @{}
            clientInfo = @{
                name = "rebuild-test"
                version = "1.0.0"
            }
        }
    } | ConvertTo-Json -Compress
    
    $initializedNotification = @{
        jsonrpc = "2.0"
        method = "initialized"
    } | ConvertTo-Json -Compress
    
    $toolsRequest = @{
        jsonrpc = "2.0"
        id = 2
        method = "tools/list"
    } | ConvertTo-Json -Compress
    
    $input = "$initRequest`n$initializedNotification`n$toolsRequest`n"
    
    try {
        $job = Start-Job -ScriptBlock {
            param($NodeExe, $ServerScript, $Input)
            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = $NodeExe
            $psi.Arguments = $ServerScript
            $psi.UseShellExecute = $false
            $psi.RedirectStandardInput = $true
            $psi.RedirectStandardOutput = $true
            $psi.RedirectStandardError = $true
            $psi.CreateNoWindow = $true
            
            $process = [System.Diagnostics.Process]::Start($psi)
            $process.StandardInput.Write($Input)
            $process.StandardInput.Close()
            
            $output = $process.StandardOutput.ReadToEnd()
            $error = $process.StandardError.ReadToEnd()
            $process.WaitForExit(5000) | Out-Null
            
            if (-not $process.HasExited) {
                $process.Kill()
            }
            
            return @{
                Output = $output
                Error = $error
                ExitCode = $process.ExitCode
            }
        } -ArgumentList $NodeExe, $ServerScript, $input
        
        $result = Wait-Job -Job $job -Timeout $TimeoutSeconds | Receive-Job
        Remove-Job -Job $job -Force
        
        if ($null -eq $result) {
            Write-Status "MCP server test timed out after ${TimeoutSeconds}s" "WARN"
            return $false
        }
        
        if ($result.Output -match '"result"') {
            Write-Status "MCP server test PASSED" "SUCCESS"
            return $true
        }
        else {
            Write-Status "MCP server test FAILED - no valid response" "WARN"
            Write-Status "Output: $($result.Output)" "WARN"
            Write-Status "Error: $($result.Error)" "WARN"
            return $false
        }
    }
    catch {
        Write-Status "MCP server test FAILED with exception: $_" "WARN"
        return $false
    }
}

# Resolve-TarballMatch: Enforces EXACTLY ONE tarball match per package.
# npm pack produces files like:
#   modelcontextprotocol-server-filesystem-<version>.tgz
#   modelcontextprotocol-server-memory-<version>.tgz
# (scoped @org/pkg becomes org-pkg-version.tgz)
function Resolve-TarballMatch {
    param(
        [string]$PackagesDir,
        [string]$GlobPattern,
        [string]$PackageLabel
    )
    $matches = @(Get-ChildItem -Path $PackagesDir -Filter $GlobPattern)
    if ($matches.Count -eq 0) {
        throw "Required tarball not found: no file matching '$GlobPattern' in $PackagesDir for package $PackageLabel"
    }
    if ($matches.Count -gt 1) {
        $names = ($matches | ForEach-Object { $_.Name }) -join ', '
        throw "Ambiguous tarball match: found $($matches.Count) files matching '$GlobPattern' in $PackagesDir for package $PackageLabel`: $names. Exactly one is required."
    }
    return $matches[0]
}

#endregion

#region Phase 1: Backup & Quarantine

function Invoke-BackupPhase {
    param([string]$StackRoot)
    
    Write-Status "=== PHASE 1: BACKUP & QUARANTINE ===" "INFO"
    
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupFileName = "claude_stack_backup_$timestamp.zip"
    $backupPath = Join-Path $env:USERPROFILE $backupFileName
    
    # Collect items to backup
    $itemsToBackup = @()
    $potentialItems = @(
        (Join-Path $StackRoot ".claude-plugin"),
        (Join-Path $StackRoot "workspace"),
        (Join-Path $StackRoot "repos"),
        (Join-Path $StackRoot "mcp")
    )
    
    foreach ($item in $potentialItems) {
        if (Test-Path $item) {
            $itemsToBackup += $item
        }
    }
    
    if ($itemsToBackup.Count -gt 0) {
        Write-Status "Creating backup of existing stack..."
        
        $tempBackupDir = Join-Path $env:TEMP "claude_stack_backup_$timestamp"
        New-Item -ItemType Directory -Path $tempBackupDir -Force | Out-Null
        
        foreach ($item in $itemsToBackup) {
            $itemName = Split-Path -Leaf $item
            $destPath = Join-Path $tempBackupDir $itemName
            Copy-Item -Path $item -Destination $destPath -Recurse -Force
        }
        
        New-ZipArchive -SourcePath "$tempBackupDir\*" -DestinationPath $backupPath
        Remove-Item -Path $tempBackupDir -Recurse -Force
    }
    else {
        Write-Status "No existing stack items to backup" "INFO"
    }
    
    # Quarantine existing items
    $quarantineDir = Join-Path $StackRoot "quarantine\$timestamp"
    
    $itemsToQuarantine = @(
        (Join-Path $StackRoot "mcp"),
        (Join-Path $StackRoot ".claude-plugin")
    )
    
    # Find all node_modules under StackRoot
    if (Test-Path $StackRoot) {
        Get-ChildItem -Path $StackRoot -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | 
            ForEach-Object { $itemsToQuarantine += $_.FullName }
    }
    
    $movedCount = 0
    foreach ($item in $itemsToQuarantine) {
        if (Test-Path $item) {
            New-Item -ItemType Directory -Path $quarantineDir -Force | Out-Null
            
            # Encode the relative path to avoid quarantine collisions.
            # Multiple node_modules from different subtrees would otherwise collide.
            # We replace path separators with '__' to flatten the relative path.
            $relativePath = $item
            if ($item.StartsWith($StackRoot)) {
                $relativePath = $item.Substring($StackRoot.Length).TrimStart('\', '/')
            }
            $encodedName = $relativePath -replace '[\\\/]', '__'
            $destPath = Join-Path $quarantineDir $encodedName
            
            Write-Status "Moving to quarantine: $item -> $destPath"
            try {
                Move-Item -Path $item -Destination $destPath -Force
            }
            catch {
                throw "Failed to quarantine '$item': $_"
            }
            $movedCount++
        }
    }
    
    if ($movedCount -gt 0) {
        Write-Status "Quarantined $movedCount item(s) to: $quarantineDir" "SUCCESS"
    }
    
    return @{
        BackupPath = $backupPath
        QuarantineDir = $quarantineDir
        Timestamp = $timestamp
    }
}

#endregion

#region Phase 2: Directory Rebuild

function Invoke-DirectoryRebuild {
    param([string]$StackRoot)
    
    Write-Status "=== PHASE 2: DETERMINISTIC DIRECTORY REBUILD ===" "INFO"
    
    $directories = @(
        $StackRoot,
        (Join-Path $StackRoot "workspace"),
        (Join-Path $StackRoot "repos"),
        (Join-Path $StackRoot "mcp"),
        (Join-Path $StackRoot "scripts"),
        (Join-Path $StackRoot "logs"),
        (Join-Path $StackRoot ".claude-plugin"),
        (Join-Path $StackRoot ".claude-plugin\agents"),
        (Join-Path $StackRoot ".claude-plugin\skills"),
        (Join-Path $StackRoot ".claude-plugin\hooks")
    )
    
    foreach ($dir in $directories) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Status "Created: $dir"
    }
    
    Write-Status "Directory structure rebuilt successfully" "SUCCESS"
}

#endregion

#region Phase 3: Offline MCP Install

function Invoke-McpInstall {
    param(
        [string]$StackRoot,
        [string]$ScriptDir,
        [string]$NodeExe,
        [string]$NpmCli
    )
    
    Write-Status "=== PHASE 3: OFFLINE MCP INSTALL ===" "INFO"
    
    $packagesDir = Join-Path $ScriptDir "mcp_packages"
    if (-not (Test-Path $packagesDir)) {
        throw "Required packages directory not found: $packagesDir"
    }
    
    # --- Strategy B: Pre-seeded npm cache archive ---
    # Require npm-cache.zip in mcp_packages/ and unzip into <StackRoot>/mcp/.npm-cache
    # This ensures all transitive dependencies are available offline.
    $npmCacheZip = Join-Path $packagesDir "npm-cache.zip"
    $mcpDir = Join-Path $StackRoot "mcp"
    $npmCache = Join-Path $mcpDir ".npm-cache"

    if (-not (Test-Path $npmCacheZip)) {
        throw "Required pre-seeded npm cache archive not found: $npmCacheZip. See scripts/mcp_packages/README.md for instructions."
    }

    Write-Status "Extracting pre-seeded npm cache from: $npmCacheZip"
    if (Test-Path $npmCache) {
        Remove-Item -Path $npmCache -Recurse -Force
    }
    New-Item -ItemType Directory -Path $npmCache -Force | Out-Null
    Expand-Archive -Path $npmCacheZip -DestinationPath $npmCache -Force
    Write-Status "npm cache seeded at: $npmCache" "SUCCESS"

    # Find required tarballs using correct npm-pack naming convention.
    # npm pack @modelcontextprotocol/server-filesystem produces:
    #   modelcontextprotocol-server-filesystem-<version>.tgz
    # npm pack @modelcontextprotocol/server-memory produces:
    #   modelcontextprotocol-server-memory-<version>.tgz
    $filesystemTgz = Resolve-TarballMatch -PackagesDir $packagesDir `
        -GlobPattern "modelcontextprotocol-server-filesystem-*.tgz" `
        -PackageLabel "@modelcontextprotocol/server-filesystem"

    $memoryTgz = Resolve-TarballMatch -PackagesDir $packagesDir `
        -GlobPattern "modelcontextprotocol-server-memory-*.tgz" `
        -PackageLabel "@modelcontextprotocol/server-memory"
    
    $npmPrefix = Join-Path $mcpDir ".npm-prefix"
    $npmrc = Join-Path $mcpDir ".npmrc"
    
    # Create npm config
    @"
cache=$($npmCache -replace '\\', '/')
prefix=$($npmPrefix -replace '\\', '/')
offline=true
audit=false
fund=false
progress=false
"@ | Set-Content -Path $npmrc -Encoding UTF8
    
    # Install packages
    $packages = @(
        @{ Name = "server-filesystem"; Tgz = $filesystemTgz.FullName }
        @{ Name = "server-memory"; Tgz = $memoryTgz.FullName }
    )
    
    foreach ($pkg in $packages) {
        Write-Status "Installing $($pkg.Name) from $($pkg.Tgz)..."
        
        $installDir = Join-Path $mcpDir $pkg.Name
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
        
        $npmArgs = @(
            $NpmCli,
            "install",
            $pkg.Tgz,
            "--offline",
            "--no-audit",
            "--no-fund",
            "--progress=false",
            "--ignore-scripts",
            "--userconfig=$npmrc",
            "--prefix=$installDir"
        )
        
        $result = Invoke-NodeCommand -NodeExe $NodeExe -Arguments $npmArgs -WorkingDirectory $installDir
        
        if ($result.ExitCode -ne 0) {
            Write-Status "npm install failed for $($pkg.Name)" "ERROR"
            Write-Status "StdOut: $($result.StdOut)" "ERROR"
            Write-Status "StdErr: $($result.StdErr)" "ERROR"
            throw "Failed to install $($pkg.Name)"
        }
        
        Write-Status "Installed $($pkg.Name) successfully" "SUCCESS"
        
        # Create wrapper entrypoint
        $wrapperPath = Join-Path $installDir "index.mjs"
        $packageJsonPath = Get-ChildItem -Path $installDir -Recurse -Filter "package.json" | 
            Where-Object { $_.FullName -notmatch "node_modules\\node_modules" } |
            Select-Object -First 1
        
        if ($packageJsonPath) {
            $packageJson = Get-Content $packageJsonPath.FullName | ConvertFrom-Json
            $entryPoint = $null
            
            # Resolve entry point: bin > main > exports
            if ($packageJson.bin) {
                if ($packageJson.bin -is [string]) {
                    $entryPoint = $packageJson.bin
                }
                elseif ($packageJson.bin -is [hashtable]) {
                    $entryPoint = $packageJson.bin.Values | Select-Object -First 1
                }
            }
            elseif ($packageJson.main) {
                $entryPoint = $packageJson.main
            }
            elseif ($packageJson.exports) {
                if ($packageJson.exports -is [string]) {
                    $entryPoint = $packageJson.exports
                }
                elseif ($packageJson.exports.'.' -is [string]) {
                    $entryPoint = $packageJson.exports.'.'
                }
            }
            
            if ($entryPoint) {
                $realEntryPath = Join-Path (Split-Path $packageJsonPath.FullName) $entryPoint
                $realEntryPath = Get-AbsolutePath $realEntryPath
                $relativeEntry = $realEntryPath.Replace($installDir, '.').Replace('\', '/')
                
                @"
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const entryPath = resolve(__dirname, '$relativeEntry');
await import(entryPath);
"@ | Set-Content -Path $wrapperPath -Encoding UTF8
                
                Write-Status "Created wrapper: $wrapperPath" "SUCCESS"
            }
        }
    }
}

#endregion

#region Phase 4: Claude Desktop Config Merge

function Invoke-ConfigMerge {
    param(
        [string]$StackRoot,
        [string]$NodeExe,
        [hashtable]$BuildInfo
    )
    
    Write-Status "=== PHASE 4: CLAUDE DESKTOP CONFIG MERGE ===" "INFO"
    
    $configDir = Join-Path $env:APPDATA "Claude"
    $configPath = Join-Path $configDir "claude_desktop_config.json"
    
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Backup existing config
    if (Test-Path $configPath) {
        $timestamp = $BuildInfo.Timestamp
        $backupPath = "$configPath.bak.$timestamp"
        Copy-Item -Path $configPath -Destination $backupPath -Force
        Write-Status "Backed up config to: $backupPath"
    }
    
    # Load existing config or create new
    $config = if (Test-Path $configPath) {
        Get-Content $configPath -Raw | ConvertFrom-Json -AsHashtable
    }
    else {
        @{}
    }
    
    # Ensure mcpServers key exists
    if (-not $config.ContainsKey('mcpServers')) {
        $config['mcpServers'] = @{}
    }
    
    # Build MCP server configs
    $filesystemWrapper = Join-Path $StackRoot "mcp\server-filesystem\index.mjs"
    $memoryWrapper = Join-Path $StackRoot "mcp\server-memory\index.mjs"
    
    $config.mcpServers['filesystem'] = @{
        command = $NodeExe.Replace('\', '/')
        args = @($filesystemWrapper.Replace('\', '/'))
    }
    
    $config.mcpServers['memory'] = @{
        command = $NodeExe.Replace('\', '/')
        args = @($memoryWrapper.Replace('\', '/'))
    }
    
    # Validate JSON serialization
    $jsonText = $config | ConvertTo-Json -Depth 10
    $null = $jsonText | ConvertFrom-Json
    
    # Write atomically
    $tempPath = "$configPath.tmp"
    $jsonText | Set-Content -Path $tempPath -Encoding UTF8
    Move-Item -Path $tempPath -Destination $configPath -Force
    
    Write-Status "Claude Desktop config updated successfully" "SUCCESS"
}

#endregion

#region Phase 5: Validation, Logging & Snapshot

function Invoke-ValidationPhase {
    param(
        [string]$StackRoot,
        [string]$NodeExe,
        [hashtable]$BuildInfo
    )
    
    Write-Status "=== PHASE 5: VALIDATION, LOGGING & SNAPSHOT ===" "INFO"
    
    # Test MCP servers
    $filesystemWrapper = Join-Path $StackRoot "mcp\server-filesystem\index.mjs"
    $memoryWrapper = Join-Path $StackRoot "mcp\server-memory\index.mjs"
    
    $filesystemTest = $false
    $memoryTest = $false
    
    if (Test-Path $filesystemWrapper) {
        $filesystemTest = Test-McpServer -NodeExe $NodeExe -ServerScript $filesystemWrapper
    }
    else {
        Write-Status "Filesystem wrapper not found: $filesystemWrapper" "WARN"
    }
    
    if (Test-Path $memoryWrapper) {
        $memoryTest = Test-McpServer -NodeExe $NodeExe -ServerScript $memoryWrapper
    }
    else {
        Write-Status "Memory wrapper not found: $memoryWrapper" "WARN"
    }
    
    # Build rebuild log
    $timestamp = $BuildInfo.Timestamp
    $logPath = Join-Path $StackRoot "logs\rebuild-log-$timestamp.json"
    
    $rebuildLog = @{
        timestamp = Get-Date -Format "o"
        stackRoot = $StackRoot
        nodeExecutable = $NodeExe
        backupPath = $BuildInfo.BackupPath
        quarantineDir = $BuildInfo.QuarantineDir
        validation = @{
            filesystemServer = $filesystemTest
            memoryServer = $memoryTest
        }
        absolutePaths = @{
            filesystemWrapper = $filesystemWrapper
            memoryWrapper = $memoryWrapper
        }
    }
    
    $rebuildLog | ConvertTo-Json -Depth 10 | Set-Content -Path $logPath -Encoding UTF8
    Write-Status "Rebuild log saved: $logPath" "SUCCESS"
    
    # Create final snapshot
    $snapshotName = "stack_snapshot_$timestamp.zip"
    $snapshotPath = Join-Path $env:USERPROFILE $snapshotName
    
    Write-Status "Creating final snapshot..."
    New-ZipArchive -SourcePath "$StackRoot\*" -DestinationPath $snapshotPath
    
    return @{
        LogPath = $logPath
        SnapshotPath = $snapshotPath
        FilesystemTest = $filesystemTest
        MemoryTest = $memoryTest
    }
}

#endregion

#region Main Execution

try {
    Write-Status "=== CLAUDE DESKTOP MCP STACK REBUILD ===" "INFO"
    Write-Status "Date Context: 2026-02-08 (Deterministic Mode)" "INFO"
    Write-Status "PowerShell Version: $($PSVersionTable.PSVersion)" "INFO"
    
    # Verify PowerShell 7+
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        throw "PowerShell 7+ required. Current version: $($PSVersionTable.PSVersion)"
    }
    
    # Verify Windows
    if (-not $IsWindows) {
        throw "This script requires Windows 11 ARM64"
    }
    
    # Initialize paths
    $stackRoot = Join-Path $env:USERPROFILE "ClaudeStack"
    $scriptDir = Split-Path -Parent $PSCommandPath
    
    Write-Status "Stack Root: $stackRoot"
    Write-Status "Script Dir: $scriptDir"
    
    # Find Node.js and npm
    $nodeExe = Find-NodeExecutable
    $npmCli = Find-NpmCli -NodeExePath $nodeExe
    
    # Phase 1: Backup & Quarantine
    $backupInfo = Invoke-BackupPhase -StackRoot $stackRoot
    
    # Phase 2: Directory Rebuild
    Invoke-DirectoryRebuild -StackRoot $stackRoot
    
    # Phase 3: Offline MCP Install
    Invoke-McpInstall -StackRoot $stackRoot -ScriptDir $scriptDir -NodeExe $nodeExe -NpmCli $npmCli
    
    # Phase 4: Claude Desktop Config Merge
    Invoke-ConfigMerge -StackRoot $stackRoot -NodeExe $nodeExe -BuildInfo $backupInfo
    
    # Phase 5: Validation, Logging & Snapshot
    $validationResult = Invoke-ValidationPhase -StackRoot $stackRoot -NodeExe $nodeExe -BuildInfo $backupInfo
    
    # Final summary
    Write-Status "=== REBUILD COMPLETE ===" "SUCCESS"
    Write-Status "Backup: $($backupInfo.BackupPath)"
    Write-Status "Quarantine: $($backupInfo.QuarantineDir)"
    Write-Status "Log: $($validationResult.LogPath)"
    Write-Status "Snapshot: $($validationResult.SnapshotPath)"
    Write-Status "Filesystem Server: $(if ($validationResult.FilesystemTest) { 'PASS' } else { 'FAIL' })"
    Write-Status "Memory Server: $(if ($validationResult.MemoryTest) { 'PASS' } else { 'FAIL' })"
    
    exit 0
}
catch {
    Write-Status "FATAL ERROR: $_" "ERROR"
    Write-Status $_.ScriptStackTrace "ERROR"
    exit 1
}

#endregion
