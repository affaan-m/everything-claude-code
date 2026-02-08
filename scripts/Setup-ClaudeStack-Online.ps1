#Requires -Version 7.0

<#
.SYNOPSIS
    One-shot online Windows 11 ARM64 setup for Claude Desktop MCP servers.

.DESCRIPTION
    Installs and configures Claude Desktop MCP servers using online resources.
    Configures filesystem, memory, playwright, github, and powershell MCP servers.
    Idempotent - safe to re-run multiple times.

.PARAMETER GitHubPat
    GitHub Personal Access Token for GitHub MCP server.
    If not provided, uses GITHUB_PAT environment variable.

.EXAMPLE
    .\Setup-ClaudeStack-Online.ps1 -GitHubPat "ghp_xxxxx"
    
.EXAMPLE
    $env:GITHUB_PAT = "ghp_xxxxx"
    .\Setup-ClaudeStack-Online.ps1

.NOTES
    Version: 1.0.0
    Date: 2026-02-08
    Requires: PowerShell 7+, Windows 11 ARM64
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubPat
)

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

function Test-CommandExists {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Convert-PathsToForwardSlashes {
    param([Parameter(ValueFromPipeline=$true)]$Object)
    
    if ($null -eq $Object) {
        return $null
    }
    
    if ($Object -is [string]) {
        # Convert backslashes to forward slashes
        return $Object -replace '\\', '/'
    }
    elseif ($Object -is [array]) {
        return @($Object | ForEach-Object { Convert-PathsToForwardSlashes $_ })
    }
    elseif ($Object -is [hashtable]) {
        $newHash = @{}
        foreach ($key in $Object.Keys) {
            $newHash[$key] = Convert-PathsToForwardSlashes $Object[$key]
        }
        return $newHash
    }
    
    return $Object
}

#endregion

#region Phase 1: Prerequisites Check

function Test-Prerequisites {
    Write-Status "=== PHASE 1: PREREQUISITES CHECK ===" "INFO"
    
    # Check Node.js
    Write-Status "Checking for Node.js..."
    if (-not (Test-CommandExists "node")) {
        Write-Status "Node.js not found. Installing via winget..." "WARN"
        try {
            winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            
            if (-not (Test-CommandExists "node")) {
                throw "Node.js installation failed or not in PATH. Please restart your shell and try again."
            }
            Write-Status "Node.js installed successfully" "SUCCESS"
        }
        catch {
            throw "Failed to install Node.js: $_"
        }
    }
    else {
        $nodeVersion = node --version
        Write-Status "Node.js found: $nodeVersion" "SUCCESS"
    }
    
    # Check npm
    if (-not (Test-CommandExists "npm")) {
        throw "npm not found. Node.js installation may be incomplete."
    }
    
    # Check npx
    if (-not (Test-CommandExists "npx")) {
        throw "npx not found. Node.js installation may be incomplete."
    }
    
    # Check Docker daemon
    Write-Status "Checking for Docker daemon..."
    if (-not (Test-CommandExists "docker")) {
        Write-Status "Docker not found. Installing via winget..." "WARN"
        try {
            winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            
            if (-not (Test-CommandExists "docker")) {
                throw "Docker installation failed or not in PATH. Please restart your shell and try again."
            }
            Write-Status "Docker installed successfully" "SUCCESS"
            
            # Try to start Docker Desktop
            Write-Status "Starting Docker Desktop..."
            $dockerDesktopPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
            if (Test-Path $dockerDesktopPath) {
                Start-Process $dockerDesktopPath
            }
        }
        catch {
            throw "Failed to install Docker: $_"
        }
    }
    
    # Wait up to 180 seconds for Docker daemon to be ready
    Write-Status "Waiting for Docker daemon to start (up to 180 seconds)..."
    $maxWaitSeconds = 180
    $waitInterval = 5
    $elapsedSeconds = 0
    $dockerReady = $false
    
    while ($elapsedSeconds -lt $maxWaitSeconds) {
        try {
            $dockerInfo = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockerReady = $true
                break
            }
        }
        catch {
            # Ignore errors during wait loop
        }
        
        Start-Sleep -Seconds $waitInterval
        $elapsedSeconds += $waitInterval
        Write-Status "Waiting for Docker... ($elapsedSeconds/$maxWaitSeconds seconds)"
    }
    
    if (-not $dockerReady) {
        throw "Docker daemon failed to start within $maxWaitSeconds seconds. Please start Docker Desktop manually and try again."
    }
    
    Write-Status "Docker daemon is running" "SUCCESS"
    
    # Install PowerShell.MCP module
    Write-Status "Installing PowerShell.MCP module..."
    try {
        $existingModule = Get-Module -ListAvailable -Name PowerShell.MCP -ErrorAction SilentlyContinue
        if ($existingModule) {
            Write-Status "PowerShell.MCP module already installed" "SUCCESS"
        }
        else {
            Install-Module PowerShell.MCP -Scope CurrentUser -Force -AllowClobber
            Write-Status "PowerShell.MCP module installed" "SUCCESS"
        }
        
        Import-Module PowerShell.MCP -ErrorAction Stop
        Write-Status "PowerShell.MCP module imported" "SUCCESS"
    }
    catch {
        throw "Failed to install/import PowerShell.MCP module: $_"
    }
    
    # Verify GitHub PAT
    $pat = $GitHubPat
    if ([string]::IsNullOrWhiteSpace($pat)) {
        $pat = $env:GITHUB_PAT
    }
    
    if ([string]::IsNullOrWhiteSpace($pat)) {
        Write-Status "GitHub Personal Access Token not found" "WARN"
        $securePat = Read-Host "Please enter your GitHub PAT" -AsSecureString
        $pat = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePat))
        
        if ([string]::IsNullOrWhiteSpace($pat)) {
            throw "GitHub Personal Access Token is required to continue."
        }
    }
    
    Write-Status "GitHub PAT provided" "SUCCESS"
    
    return $pat
}

#endregion

#region Phase 2: Configure Claude Desktop

function Update-ClaudeDesktopConfig {
    param([string]$GitHubToken)
    
    Write-Status "=== PHASE 2: CONFIGURE CLAUDE DESKTOP ===" "INFO"
    
    $configDir = Join-Path $env:APPDATA "Claude"
    $configPath = Join-Path $configDir "claude_desktop_config.json"
    
    # Ensure config directory exists
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        Write-Status "Created config directory: $configDir"
    }
    
    # Backup existing config
    if (Test-Path $configPath) {
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $backupPath = "$configPath.bak.$timestamp"
        Copy-Item -Path $configPath -Destination $backupPath -Force
        Write-Status "Backed up existing config to: $backupPath" "SUCCESS"
    }
    
    # Load existing config or create new
    $config = if (Test-Path $configPath) {
        try {
            Get-Content $configPath -Raw | ConvertFrom-Json -AsHashtable
        }
        catch {
            Write-Status "Failed to parse existing config, creating new one" "WARN"
            @{}
        }
    }
    else {
        @{}
    }
    
    # Ensure mcpServers key exists
    if (-not $config.ContainsKey('mcpServers')) {
        $config['mcpServers'] = @{}
    }
    
    # Create workspace directories
    $workspaceRoot = Join-Path $env:USERPROFILE "ClaudeStack\workspace"
    $downloadsRoot = Join-Path $env:USERPROFILE "Downloads"
    $repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
    
    if (-not (Test-Path $workspaceRoot)) {
        New-Item -ItemType Directory -Path $workspaceRoot -Force | Out-Null
        Write-Status "Created workspace directory: $workspaceRoot"
    }
    
    # Configure filesystem MCP server
    Write-Status "Configuring filesystem MCP server..."
    $config.mcpServers['filesystem'] = @{
        command = "npx"
        args = @(
            "-y",
            "@modelcontextprotocol/server-filesystem",
            $workspaceRoot,
            $repoRoot
        )
    }
    
    # Configure memory MCP server
    Write-Status "Configuring memory MCP server..."
    $config.mcpServers['memory'] = @{
        command = "npx"
        args = @(
            "-y",
            "@modelcontextprotocol/server-memory"
        )
    }
    
    # Configure playwright MCP server
    Write-Status "Configuring playwright MCP server..."
    $config.mcpServers['playwright'] = @{
        command = "npx"
        args = @(
            "-y",
            "@playwright/mcp@latest"
        )
    }
    
    # Configure github MCP server
    Write-Status "Configuring github MCP server..."
    $config.mcpServers['github'] = @{
        command = "docker"
        args = @(
            "run",
            "-i",
            "--rm",
            "-e",
            "GITHUB_PERSONAL_ACCESS_TOKEN",
            "ghcr.io/github/github-mcp-server"
        )
        env = @{
            GITHUB_PERSONAL_ACCESS_TOKEN = $GitHubToken
        }
    }
    
    # Configure powershell MCP server
    Write-Status "Configuring powershell MCP server..."
    try {
        $proxyPath = Get-MCPProxyPath -Escape
        
        # Normalize path - strip wrapping quotes if any and get absolute path
        $proxyPath = $proxyPath.Trim('"', "'")
        $proxyPath = [System.IO.Path]::GetFullPath($proxyPath)
        
        if (-not (Test-Path $proxyPath)) {
            throw "PowerShell MCP proxy not found at: $proxyPath"
        }
        
        $config.mcpServers['powershell'] = @{
            command = $proxyPath
            args = @()
        }
        
        Write-Status "PowerShell MCP proxy located at: $proxyPath" "SUCCESS"
    }
    catch {
        throw "Failed to configure PowerShell MCP server: $_"
    }
    
    # Validate and write config
    try {
        # Normalize all Windows paths to forward slashes
        $normalizedConfig = Convert-PathsToForwardSlashes $config
        
        $jsonText = $normalizedConfig | ConvertTo-Json -Depth 10
        # Validate JSON can be parsed back
        $null = $jsonText | ConvertFrom-Json
        
        # Write atomically
        $tempPath = "$configPath.tmp"
        $jsonText | Set-Content -Path $tempPath -Encoding UTF8 -NoNewline
        Move-Item -Path $tempPath -Destination $configPath -Force
        
        Write-Status "Claude Desktop config updated: $configPath" "SUCCESS"
    }
    catch {
        throw "Failed to write config: $_"
    }
    
    return @{
        ConfigPath = $configPath
        Servers = @("filesystem", "memory", "playwright", "github", "powershell")
    }
}

#endregion

#region Main Execution

try {
    Write-Status "=== CLAUDE DESKTOP MCP SETUP (ONLINE) ===" "INFO"
    Write-Status "Date: $(Get-Date -Format 'yyyy-MM-dd')" "INFO"
    Write-Status "PowerShell Version: $($PSVersionTable.PSVersion)" "INFO"
    
    # Verify PowerShell 7+
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        throw "PowerShell 7+ required. Current version: $($PSVersionTable.PSVersion)"
    }
    
    # Verify Windows
    if (-not $IsWindows) {
        throw "This script requires Windows"
    }
    
    # Phase 1: Prerequisites
    $githubToken = Test-Prerequisites
    
    # Phase 2: Configure Claude Desktop
    $result = Update-ClaudeDesktopConfig -GitHubToken $githubToken
    
    # Final summary
    Write-Status "=== DONE ===" "SUCCESS"
    Write-Host ""
    Write-Status "Config path: $($result.ConfigPath)" "INFO"
    Write-Host ""
    Write-Status "Configured servers:" "INFO"
    foreach ($server in $result.Servers) {
        Write-Status "  - $server" "INFO"
    }
    Write-Host ""
    
    exit 0
}
catch {
    Write-Status "FATAL ERROR: $_" "ERROR"
    Write-Status $_.ScriptStackTrace "ERROR"
    exit 1
}

#endregion
