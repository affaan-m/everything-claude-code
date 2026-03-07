# AppleScript Recipes for StreamDock Macros

Ready-to-use AppleScript templates. Save as `.applescript`, compile with:
```bash
osacompile -o "~/Library/Application Support/HotSpot/StreamDock/scripts/Name.app" source.applescript
```

---

## Toggle Dark Mode

```applescript
tell application "System Events"
    tell appearance preferences
        set dark mode to not dark mode
    end tell
end tell
```

---

## Toggle Do Not Disturb

```applescript
-- Requires a Shortcut named "DND Toggle" that toggles Focus/DND
do shell script "shortcuts run 'DND Toggle'"
```

Or create the Shortcut: Shortcuts app → New → Add "Set Focus" action → Toggle.

---

## Toggle App Full Screen (Any App)

```applescript
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
    tell process frontApp
        try
            set isFS to (value of attribute "AXFullScreen" of window 1)
            if isFS then
                set value of attribute "AXFullScreen" of window 1 to false
            else
                set value of attribute "AXFullScreen" of window 1 to true
            end if
        on error
            keystroke "f" using {command down, control down}
        end try
    end tell
end tell
```

---

## Chrome Immersive Full Screen (Hide Everything)

```applescript
tell application "Google Chrome" to activate
delay 0.5
tell application "System Events"
    tell process "Google Chrome"
        set viewMenu to menu "View" of menu bar 1
        set menuItemNames to name of every menu item of viewMenu
        set isFullScreen to ("Exit Full Screen" is in menuItemNames)

        if not isFullScreen then
            -- Hide bookmarks bar if showing
            try
                set bmItem to menu item "Always Show Bookmarks Bar" of viewMenu
                if (value of attribute "AXMenuItemMarkChar" of bmItem) is "✓" then
                    click bmItem
                    delay 0.2
                end if
            end try
            -- Hide toolbar in full screen
            try
                set tbItem to menu item "Always Show Toolbar in Full Screen" of viewMenu
                if (value of attribute "AXMenuItemMarkChar" of tbItem) is "✓" then
                    click tbItem
                    delay 0.2
                end if
            end try
            keystroke "f" using {command down, control down}
        else
            keystroke "f" using {command down, control down}
            delay 0.5
            set viewMenu2 to menu "View" of menu bar 1
            try
                set bmItem2 to menu item "Always Show Bookmarks Bar" of viewMenu2
                if (value of attribute "AXMenuItemMarkChar" of bmItem2) is not "✓" then
                    click bmItem2
                end if
            end try
            try
                set tbItem2 to menu item "Always Show Toolbar in Full Screen" of viewMenu2
                if (value of attribute "AXMenuItemMarkChar" of tbItem2) is not "✓" then
                    click tbItem2
                end if
            end try
        end if
    end tell
end tell
```

---

## Switch Audio Output Device

Requires: `brew install switchaudio-osx`

```applescript
-- Toggle between two output devices
set currentDevice to do shell script "SwitchAudioSource -c"
if currentDevice is "MacBook Pro Speakers" then
    do shell script "SwitchAudioSource -s 'External Headphones'"
else
    do shell script "SwitchAudioSource -s 'MacBook Pro Speakers'"
end if
```

To list available devices: `SwitchAudioSource -a`

---

## Window: Snap Left Half

```applescript
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
end tell
tell application frontApp
    set bounds of front window to {0, 25, 960, 1080}
end tell
```

---

## Window: Snap Right Half

```applescript
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
end tell
tell application frontApp
    set bounds of front window to {960, 25, 1920, 1080}
end tell
```

---

## Window: Center and Resize

```applescript
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
end tell
tell application frontApp
    set bounds of front window to {240, 100, 1680, 980}
end tell
```

---

## Kill and Restart App

```applescript
set appName to "Safari"
try
    do shell script "killall " & quoted form of appName
    delay 1
end try
tell application appName to activate
```

---

## Open URL in Specific Browser

```applescript
-- In Chrome
tell application "Google Chrome"
    activate
    open location "https://example.com"
end tell

-- In Safari
tell application "Safari"
    activate
    open location "https://example.com"
end tell
```

---

## Launch Multi-App Workspace

```applescript
-- Open dev environment
tell application "Google Chrome" to activate
delay 0.5
tell application "Terminal" to activate
delay 0.3
tell application "Visual Studio Code" to activate
delay 0.3

-- Arrange windows (customize bounds for your display)
tell application "Google Chrome"
    set bounds of front window to {960, 25, 1920, 1080}
end tell
tell application "Visual Studio Code"
    set bounds of front window to {0, 25, 960, 600}
end tell
tell application "Terminal"
    set bounds of front window to {0, 600, 960, 1080}
end tell
```

---

## Toggle Screen Brightness

Requires: `brew install brightness`

```applescript
set brewPrefix to do shell script "brew --prefix"
set brightnessBin to brewPrefix & "/bin/brightness"
set currentBrightness to do shell script brightnessBin & " -l 2>&1 | grep 'display 0' | awk '{print $NF}'"
set brightnessVal to currentBrightness as number

if brightnessVal > 0.5 then
    do shell script brightnessBin & " 0.2"
else
    do shell script brightnessBin & " 1.0"
end if
```

---

## Run Shortcuts.app Shortcut

```applescript
-- Simple run
do shell script "shortcuts run 'Shortcut Name'"

-- Run with input
do shell script "shortcuts run 'Shortcut Name' <<< 'input text'"
```

---

## Safe Template (Error Handling + State Detection)

Use this as a starting point for any new macro:

```applescript
on run
    try
        -- Check if target app is running
        tell application "System Events"
            set isRunning to (exists process "TargetApp")
        end tell

        if not isRunning then
            tell application "TargetApp" to activate
            delay 1.0
        else
            tell application "TargetApp" to activate
            delay 0.3
        end if

        tell application "System Events"
            tell process "TargetApp"
                -- YOUR AUTOMATION HERE
                -- Use try blocks for each action
                -- Detect state before toggling
            end tell
        end tell

    on error errMsg number errNum
        display notification "Macro failed: " & errMsg with title "StreamDock"
    end try
end run
```

---

## Tips

- **Test with osascript first**: `osascript script.applescript` before compiling
- **Delays**: 0.3s after app activate, 0.2s between menu clicks, 0.5s after full screen transitions
- **State detection**: Use `AXFullScreen`, `AXMinimized`, `AXMenuItemMarkChar` attributes
- **Error notifications**: Use `display notification` for user feedback on failures
- **Avoid loops with delays**: Burns CPU. Use idle handlers for continuous monitoring.
- **Sequoia users**: May need to re-authorize Accessibility monthly
