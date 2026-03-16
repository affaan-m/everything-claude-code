#!/usr/bin/env pwsh
# uninstall.ps1 — Windows-native entrypoint for the ECC uninstaller.
#
# This wrapper resolves the real repo/package root when invoked through a
# symlinked path, then delegates to the Node-based uninstall runtime.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-LinkedScriptPath {
    param(
        [Parameter(Mandatory = $true)]
        [string] $InitialPath,

        [int] $MaxLinkDepth = 32
    )

    $currentPath = [System.IO.Path]::GetFullPath($InitialPath)
    $visitedPaths = @{}

    for ($depth = 0; $depth -le $MaxLinkDepth; $depth += 1) {
        if ($visitedPaths.ContainsKey($currentPath)) {
            throw "Detected symlink cycle while resolving script path: $currentPath"
        }

        $visitedPaths[$currentPath] = $true
        $item = Get-Item -LiteralPath $currentPath -Force

        if (-not $item.LinkType) {
            return $currentPath
        }

        $targetPath = $item.Target
        if ($targetPath -is [array]) {
            $targetPath = $targetPath[0]
        }

        if (-not $targetPath) {
            throw "Unable to resolve symlink target for script path: $currentPath"
        }

        if (-not [System.IO.Path]::IsPathRooted($targetPath)) {
            $targetPath = Join-Path -Path $item.DirectoryName -ChildPath $targetPath
        }

        $currentPath = [System.IO.Path]::GetFullPath($targetPath)
    }

    throw "Exceeded symlink resolution depth limit ($MaxLinkDepth) while resolving script path: $InitialPath"
}

$scriptPath = Resolve-LinkedScriptPath -InitialPath $PSCommandPath
$scriptDir = Split-Path -Parent $scriptPath
$uninstallerScript = Join-Path -Path (Join-Path -Path $scriptDir -ChildPath 'scripts') -ChildPath 'uninstall.js'

& node $uninstallerScript @args
exit $LASTEXITCODE
