@echo off
REM Everything Claude Code - Quick Start for Windows
REM This script automates the setup process

echo ========================================
echo Everything Claude Code - Quick Start
echo ========================================
echo.

REM Check if running from the repo directory
if not exist "agents" (
    echo [ERROR] Please run this script from the everything-claude-code directory
    pause
    exit /b 1
)

REM Set Claude config directory
set CLAUDE_DIR=%USERPROFILE%\.claude

echo [Step 1/4] Creating Claude config directories...
if not exist "%CLAUDE_DIR%" mkdir "%CLAUDE_DIR%"
if not exist "%CLAUDE_DIR%\agents" mkdir "%CLAUDE_DIR%\agents"
if not exist "%CLAUDE_DIR%\rules" mkdir "%CLAUDE_DIR%\rules"
if not exist "%CLAUDE_DIR%\commands" mkdir "%CLAUDE_DIR%\commands"
if not exist "%CLAUDE_DIR%\skills" mkdir "%CLAUDE_DIR%\skills"
echo [OK] Directories created
echo.

echo [Step 2/4] Copying agents...
xcopy /Y /Q "agents\*.md" "%CLAUDE_DIR%\agents\" >nul
echo [OK] Copied agents
echo.

echo [Step 3/4] Copying rules...
xcopy /Y /Q "rules\*.md" "%CLAUDE_DIR%\rules\" >nul
echo [OK] Copied rules
echo.

echo [Step 4/4] Copying commands...
xcopy /Y /Q "commands\*.md" "%CLAUDE_DIR%\commands\" >nul
echo [OK] Copied commands
echo.

echo [Step 5/7] Copying skills...
xcopy /Y /E /Q "skills\*" "%CLAUDE_DIR%\skills\" >nul
echo [OK] Copied skills
echo.

REM Ask about copying hooks to settings.json
echo [Step 6/7] Configure hooks in settings.json
echo.
echo *** WARNING ***
echo This will copy hooks configuration to your settings.json
set SETTINGS_FILE=%CLAUDE_DIR%\settings.json
if exist "%SETTINGS_FILE%" (
    echo CAUTION: %SETTINGS_FILE% already exists!
    echo Your current settings will be OVERWRITTEN (backup will be created)
    echo.
    set /p COPY_HOOKS="Do you want to continue? (y/n): "
) else (
    echo This will create a new settings.json file.
    echo.
    set /p COPY_HOOKS="Do you want to continue? (y/n): "
)

if /i "%COPY_HOOKS%"=="y" (
    if exist "%SETTINGS_FILE%" (
        echo Creating backup: %SETTINGS_FILE%.backup
        copy "%SETTINGS_FILE%" "%SETTINGS_FILE%.backup" >nul
    )
    copy "hooks\hooks.json" "%SETTINGS_FILE%" >nul
    echo [OK] Hooks copied to settings.json
) else (
    echo [SKIPPED] You can manually copy hooks from: %CD%\hooks\hooks.json
)
echo.

REM Ask about copying MCP configs
echo [Step 7/7] Configure MCP servers
echo.
echo *** WARNING ***
echo This will copy MCP server configurations to your .claude.json
set MCP_FILE=%USERPROFILE%\.claude.json
if exist "%MCP_FILE%" (
    echo CAUTION: %MCP_FILE% already exists!
    echo Your current MCP configurations will be OVERWRITTEN (backup will be created)
    echo.
    set /p COPY_MCP="Do you want to continue? (y/n): "
) else (
    echo This will create a new .claude.json file.
    echo.
    set /p COPY_MCP="Do you want to continue? (y/n): "
)

if /i "%COPY_MCP%"=="y" (
    if exist "%MCP_FILE%" (
        echo Creating backup: %MCP_FILE%.backup
        copy "%MCP_FILE%" "%MCP_FILE%.backup" >nul
    )
    copy "mcp-configs\mcp-servers.json" "%MCP_FILE%" >nul
    echo [OK] MCP configs copied to .claude.json
    echo.
    echo IMPORTANT: Remember to replace YOUR_*_HERE placeholders with your actual API keys!
) else (
    echo [SKIPPED] You can manually copy MCP configs from: %CD%\mcp-configs\mcp-servers.json
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Files copied to: %CLAUDE_DIR%
echo.
echo *** NEXT STEPS ***
echo.
echo 1. If you copied MCP configs, edit %MCP_FILE%
echo    and replace YOUR_*_HERE with your actual API keys
echo.
echo 2. Read the guides to understand how to use these configs:
echo    - Shorthand Guide: https://x.com/affaanmustafa/status/2012378465664745795
echo    - Longform Guide: https://x.com/affaanmustafa/status/2014040193557471352
echo.
echo Opening configuration directories...
start "" "%CD%\hooks"
start "" "%CD%\mcp-configs"
start "" "%CLAUDE_DIR%"
echo.
pause
