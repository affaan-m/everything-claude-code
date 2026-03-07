---
name: streamdock
description: Build and manage StreamDock (VSD) macro buttons — app launchers, website shortcuts, hotkey combos, AppleScript automation, and multi-action sequences. Use when the user mentions "streamdock", "stream dock", "VSD", "macro button", "deck button", or asks about adding/changing/removing buttons on their physical button deck.
---

# StreamDock Macro Builder

## Cost Routing
StreamDock manifest edits, icon generation, and script compilation are mechanical — route to Sonnet when available.

## Workflow

1. **Read current manifest** — ALWAYS first, GUI may have changed it
2. **Present layout** as grid so user picks a slot
3. **Build the button** — launcher, website, hotkey, AppleScript macro, or multi-action
4. **Update manifest** and create supporting files (scripts, images)
5. **Remind user** to reload profile (switch away and back, or restart StreamDock app)

## Device Setup

| Property | Value |
|----------|-------|
| Primary device | VSDM18 (serial: `0300D0783922`) |
| Secondary device | VSDN1 (serial: `C771C7782E02`) |
| Device model | `20GBA9901` |
| Grid | 5 rows × 3 columns — positions `"0,0"` (top-left) to `"4,2"` (bottom-right) |
| Position format | **`"row,col"`** — row first, then column |

## File Paths

```
BASE = ~/Library/Application Support/HotSpot/StreamDock/

Profiles:       {BASE}/profiles/*.sdProfile/manifest.json
Sub-pages:      {BASE}/profiles/*.sdProfile/profiles/*.sdProfile/manifest.json
Config:         {BASE}/config/StreamDockConfig.plist
Plugins:        {BASE}/config/PluginsConfig.plist
Custom scripts: {BASE}/scripts/
Plugins dir:    {BASE}/plugins/*.sdPlugin/
```

### Primary Profile (user's daily driver)

```
{BASE}/profiles/VY0T6616-BT63-FKT3-Q1V6-MJ3033S515L3.sdProfile/
  profiles/U9M1FDKT-D4U7-RD8Q-1328-BGDS6EZK3I0T.sdProfile/manifest.json
```

## Manifest Structure

```json
{
  "Actions": {
    "row,col": {
      "ActionID": "unique-uuid-style-id",
      "Controller": "Keypad",
      "Name": "Open",
      "Settings": { ... },
      "State": 0,
      "States": [{
        "FontFamily": "HarmonyOS Sans",
        "FontSize": 8,
        "FontStyle": "Regular",
        "FontUnderline": false,
        "Image": "HASHNAME.png",
        "MultiActionImage": "",
        "Name": "",
        "ShowTitle": true,
        "Title": "Button Label",
        "TitleAlignment": "bottom",
        "TitleColor": "#ffffff"
      }],
      "UUID": "com.hotspot.streamdock.system.open"
    }
  },
  "DeviceModel": "20GBA9901",
  "DeviceUUID": "VSDM18",
  "Name": "Profile Name",
  "AppIdentifier": "None",
  "Pages": {
    "Current": "UUID.sdProfile",
    "Pages": ["UUID.sdProfile"]
  },
  "Version": "1.0"
}
```

## Action Types — Quick Reference

### App Launcher
```json
"UUID": "com.hotspot.streamdock.system.open",
"Settings": { "path": "/Applications/AppName.app" }
```

### Website
```json
"UUID": "com.hotspot.streamdock.system.website",
"Settings": { "openInBrowser": true, "path": "https://example.com" }
```

### Hotkey
```json
"UUID": "com.hotspot.streamdock.system.hotkey",
"Settings": {
  "Coalesce": true,
  "Hotkeys": [{
    "KeyCmd": true, "KeyCtrl": false, "KeyShift": true, "KeyOption": false,
    "KeyCmd_Mac": true, "KeyShift_Mac": true,
    "VKeyCode": 116, "VKeyCode_Mac": 20,
    "KeyModifiers": 65536,
    "NativeCode": -1, "QTKeyCode": -1,
    "RKeyCmd": false, "RKeyCtrl": false, "RKeyShift": false, "RKeyOption": false
  }],
  "hotkeyRadioButtonIndex": 0
}
```

### AppleScript Macro
```json
"UUID": "com.hotspot.streamdock.system.open",
"Settings": { "path": "{BASE}/scripts/MacroName.app" }
```

### Multi-Action Sequence
```json
"UUID": "com.hotspot.streamdock.multiactions.ActionTrigger"
```

### Folder / Group Button
```json
"UUID": "com.hotspot.streamdock.profile.openchild",
"Settings": { "ProfileUUID": "CHILD-UUID.sdProfile" }
```

### Scene Shift (Profile Switch)
```json
"UUID": "com.hotspot.streamdock.profile.rotate",
"Settings": { "DeviceUUID": "", "ProfileUUID": "TARGET-UUID" }
```

See `actions-reference.md` in this directory for the complete 60+ action UUID catalog.

## AppleScript Macro Build Process

### Build Steps
1. Write source to `{BASE}/scripts/macro-name.applescript`
2. Compile: `osacompile -o "{BASE}/scripts/Macro Name.app" source.applescript`
3. Set button's `Settings.path` to the compiled `.app`
4. First run triggers Accessibility permission prompt — appears as generic "applet"

### Template with Best Practices

```applescript
-- Check if app is running before trying to control it
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
        -- Detect state BEFORE acting (idempotent toggle)
        try
            set isFullScreen to (value of attribute "AXFullScreen" of window 1)
        on error
            set isFullScreen to false
        end try

        if not isFullScreen then
            keystroke "f" using {command down, control down}
        end if
    end tell
end tell
```

### Key Patterns
- **Always wrap in try/on error** — apps may not be running or support the action
- **Detect state before acting** — use `AXFullScreen`, `AXMinimized` attributes for idempotent toggles
- **Use delays sparingly** — 0.3s between app activate and commands, 0.2s between menu clicks
- **Menu clicking**: `click menu item "Name" of menu "MenuName" of menu bar 1`
- **Check menu state**: `value of attribute "AXMenuItemMarkChar" of menuItem` returns `"✓"` if checked

See `applescript-recipes.md` for ready-to-use recipes (dark mode, DND, audio switch, window management, etc.)

### Alternative: Shortcuts.app Integration

For complex workflows, Shortcuts.app is often simpler than AppleScript:
```applescript
tell application "Shortcuts Events"
    run the shortcut named "My Shortcut"
end tell
```
Or compile a one-liner: `do shell script "shortcuts run 'My Shortcut'"`

## macOS Permissions

| Permission | When Needed | Path |
|-----------|-------------|------|
| Accessibility | Any System Events / UI scripting | Settings > Privacy > Accessibility |
| Full Disk Access | Reading files outside standard locations | Settings > Privacy > Full Disk Access |
| Screen Recording | Some GUI automation on Sequoia | Settings > Privacy > Screen & System Audio |

**Sequoia (15.0+) WARNING:** Accessibility permissions may require monthly re-authorization and re-auth after reboot.

**Sonoma fix for stuck permissions:** Toggle OFF all script-related entries in Accessibility, quit System Settings, toggle back ON.

**Better naming:** Compiled `.app` shows as "applet" in Accessibility list. To improve: code-sign the app with `codesign -s - "Macro Name.app"` after compiling.

## Icon Guidelines

| Context | Size | Notes |
|---------|------|-------|
| Button icon | 144×144 px | @2x for Retina |
| Standard | 72×72 px | Minimum |
| Format | PNG, SVG | PNG preferred for buttons |

- **Desaturate colors** — LCD displays wash out vibrant colors. Use darker/muted versions.
- **Transparent backgrounds** with white/light foreground elements work best.
- **Generate with Python PIL** if no custom icon available.
- **NEVER leave Image empty** — causes animated/flickering button.

## Rules

1. **ALWAYS read manifest before editing** — GUI may have changed it
2. **Reuse existing ActionIDs** when replacing a button at the same position
3. **NEVER leave Image empty** — generate a static PNG if needed
4. **Store scripts** in `{BASE}/scripts/`, images alongside manifest
5. **After editing**, remind user to reload profile
6. **Recommend closing StreamDock app** before editing manifests
7. **Position format is `"row,col"`** — row first, column second
8. **Auto-switching profiles**: Set `AppIdentifier` to app bundle ID (e.g., `com.google.Chrome`)
9. **Multi-state buttons**: States array supports 2-3 entries for toggle/tri-state visuals
10. **Test AppleScript manually first** with `osascript` before compiling to `.app`

## SDK & Plugin Resources

- **Plugin SDK docs**: https://sdk.key123.vip/en/guide/overview.html
- **GitHub SDK**: https://github.com/MiraboxSpace/StreamDock-Plugin-SDK
- **Device SDK**: https://github.com/MiraboxSpace/StreamDock-Device-SDK
- **Plugin store**: https://space.key123.vip/StreamDock/plugins
- **VSD Craft app**: https://www.vsdinside.com/pages/download
- **Icon packs**: https://www.vsdinside.com/blogs/tutorial/find-and-download-your-favorite-icons

## Supporting Files in This Directory

- `actions-reference.md` — Complete catalog of 60+ action UUIDs with settings schemas
- `applescript-recipes.md` — Ready-to-use AppleScript recipes for common macro buttons
