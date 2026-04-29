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

:: Auto-update ECC source if it's a git repository
if exist "%SOURCE_DIR%\.git\" (
    echo [0/4] Checking for latest ECC updates from GitHub...
    pushd "%SOURCE_DIR%"
    git pull
    popd
    echo.
)

:: Auto-detect language
set "DETECTED_LANG="
if exist "%TARGET_DIR%\package.json" set "DETECTED_LANG=typescript"
if exist "%TARGET_DIR%\tsconfig.json" set "DETECTED_LANG=typescript"
if exist "%TARGET_DIR%\go.mod" set "DETECTED_LANG=golang"
if exist "%TARGET_DIR%\requirements.txt" set "DETECTED_LANG=python"
if exist "%TARGET_DIR%\pyproject.toml" set "DETECTED_LANG=python"
if exist "%TARGET_DIR%\composer.json" set "DETECTED_LANG=php"
if exist "%TARGET_DIR%\Package.swift" set "DETECTED_LANG=swift"
if exist "%TARGET_DIR%\Cargo.toml" set "DETECTED_LANG=rust"
if exist "%TARGET_DIR%\pom.xml" set "DETECTED_LANG=java"
if exist "%TARGET_DIR%\build.gradle" set "DETECTED_LANG=java"
if exist "%TARGET_DIR%\build.gradle.kts" set "DETECTED_LANG=kotlin"
if exist "%TARGET_DIR%\*.csproj" set "DETECTED_LANG=csharp"
if exist "%TARGET_DIR%\*.sln" set "DETECTED_LANG=csharp"
if exist "%TARGET_DIR%\CMakeLists.txt" set "DETECTED_LANG=cpp"

echo Available language rules:
echo typescript, python, golang, rust, cpp, java, csharp, web, swift, php, ...
echo.

if not "!DETECTED_LANG!"=="" (
    echo [AUTO-DETECT] Found project files suggesting language: !DETECTED_LANG!
)

echo Enter the programming language of your project.
echo (Type 'all' to copy ALL rules, 'auto' or press Enter to auto-detect/common):
set /p LANG="Language (all, auto, typescript, python...): "

if "!LANG!"=="" set "LANG=auto"

if /I "!LANG!"=="auto" (
    if not "!DETECTED_LANG!"=="" (
        set "LANG=!DETECTED_LANG!"
    ) else (
        set "LANG=common-only"
    )
)

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
        echo   - Copied 'common' rules.
    )
    if not "!LANG!"=="common-only" (
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
