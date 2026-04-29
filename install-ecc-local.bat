@echo off
setlocal enabledelayedexpansion

:: Determine source directory (ECC repo directory)
set "SOURCE_DIR=%~dp0"
set "SOURCE_DIR=%SOURCE_DIR:~0,-1%"

:: Get target directory from drag-and-drop parameter %1
set "TARGET_DIR=%~1"

if "%TARGET_DIR%"=="" (
    color 0C
    echo [ERROR] NO TARGET DIRECTORY DETECTED!
    echo.
    echo Instructions:
    echo Please drag and drop your project folder onto this .bat file.
    echo.
    pause
    exit /b 1
)

:: Remove extra quotes if any
set "TARGET_DIR=%TARGET_DIR:"=%"

if not exist "%TARGET_DIR%\" (
    color 0C
    echo [ERROR] The dropped path is not a valid directory!
    pause
    exit /b 1
)

color 0A
echo ========================================================
echo    INSTALL EVERYTHING CLAUDE CODE (PROJECT-LEVEL)
echo ========================================================
echo TARGET PROJECT: %TARGET_DIR%
echo.

:: Ask user for project stack
echo Available language rules:
echo typescript, python, golang, web, swift, php, ...
echo.
echo Enter the programming language of your project.
echo (Type 'all' to copy ALL rules, or press Enter for 'common' rules only):
set /p LANG="Language (all, typescript, python...): "

echo.
echo [1/4] Creating .claude directory structure...
set "CLAUDE_DIR=%TARGET_DIR%\.claude"
if not exist "%CLAUDE_DIR%\rules" mkdir "%CLAUDE_DIR%\rules"
if not exist "%CLAUDE_DIR%\skills" mkdir "%CLAUDE_DIR%\skills"
if not exist "%CLAUDE_DIR%\agents" mkdir "%CLAUDE_DIR%\agents"
if not exist "%CLAUDE_DIR%\commands" mkdir "%CLAUDE_DIR%\commands"

echo [2/4] Copying Rules...
if /I "!LANG!"=="all" (
    echo   - Copying ALL language rules...
    xcopy "%SOURCE_DIR%\rules" "%CLAUDE_DIR%\rules\" /E /I /Y /Q >nul
) else (
    if exist "%SOURCE_DIR%\rules\common" (
        xcopy "%SOURCE_DIR%\rules\common" "%CLAUDE_DIR%\rules\common\" /E /I /Y /Q >nul
    )
    if not "!LANG!"=="" (
        if exist "%SOURCE_DIR%\rules\!LANG!" (
            xcopy "%SOURCE_DIR%\rules\!LANG!" "%CLAUDE_DIR%\rules\!LANG!\" /E /I /Y /Q >nul
            echo   - Copied rules for !LANG!.
        ) else (
            echo   - [WARNING] rules\!LANG! not found in ECC, skipping...
        )
    )
)

echo [3/4] Copying Skills...
if exist "%SOURCE_DIR%\.agents\skills" (
    xcopy "%SOURCE_DIR%\.agents\skills" "%CLAUDE_DIR%\skills\" /E /I /Y /Q >nul
)
if exist "%SOURCE_DIR%\skills\search-first" (
    xcopy "%SOURCE_DIR%\skills\search-first" "%CLAUDE_DIR%\skills\search-first\" /E /I /Y /Q >nul
)

echo [4/4] Copying Agents ^& Commands...
if exist "%SOURCE_DIR%\agents" (
    xcopy "%SOURCE_DIR%\agents\*.md" "%CLAUDE_DIR%\agents\" /Y /Q >nul
)
if exist "%SOURCE_DIR%\commands" (
    xcopy "%SOURCE_DIR%\commands\*.md" "%CLAUDE_DIR%\commands\" /Y /Q >nul
)

echo.
echo ========================================================
echo DONE! INSTALLATION SUCCESSFUL.
echo ECC configuration has been copied to:
echo %CLAUDE_DIR%
echo ========================================================
pause
exit /b 0
