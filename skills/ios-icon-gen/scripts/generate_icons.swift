#!/usr/bin/env swift

import AppKit
import Foundation

// MARK: - Configuration

struct IconSpec {
    let symbolName: String
    let assetName: String
    let baseSize: CGFloat
    let color: NSColor
    let weight: NSFont.Weight
}

func parseColor(_ hex: String) -> NSColor {
    var hex = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    if hex.hasPrefix("#") { hex.removeFirst() }
    guard hex.count == 6, let value = UInt64(hex, radix: 16) else {
        return NSColor(red: 142/255, green: 142/255, blue: 147/255, alpha: 1.0)
    }
    return NSColor(
        red: CGFloat((value >> 16) & 0xFF) / 255,
        green: CGFloat((value >> 8) & 0xFF) / 255,
        blue: CGFloat(value & 0xFF) / 255,
        alpha: 1.0
    )
}

func parseWeight(_ name: String) -> NSFont.Weight {
    switch name.lowercased() {
    case "ultralight": return .ultraLight
    case "thin": return .thin
    case "light": return .light
    case "regular": return .regular
    case "medium": return .medium
    case "semibold": return .semibold
    case "bold": return .bold
    case "heavy": return .heavy
    case "black": return .black
    default: return .thin
    }
}

// MARK: - Generation

func generateIcon(_ spec: IconSpec, outputDir: String) {
    let dir = "\(outputDir)/\(spec.assetName).imageset"
    try! FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)

    let scales: [(suffix: String, multiplier: CGFloat)] = [("", 1), ("@2x", 2), ("@3x", 3)]

    for scale in scales {
        let pixelSize = spec.baseSize * scale.multiplier
        let imageSize = NSSize(width: pixelSize, height: pixelSize)

        let config = NSImage.SymbolConfiguration(
            pointSize: pixelSize * 0.40,
            weight: spec.weight,
            scale: .large
        )

        guard let symbol = NSImage(systemSymbolName: spec.symbolName, accessibilityDescription: nil) else {
            print("ERROR: SF Symbol '\(spec.symbolName)' not found. Run 'SF Symbols' app to browse available names.")
            return
        }

        let configured = symbol.withSymbolConfiguration(config)!

        let image = NSImage(size: imageSize, flipped: false) { rect in
            let symSize = configured.size
            let x = (rect.width - symSize.width) / 2
            let y = (rect.height - symSize.height) / 2
            let drawRect = NSRect(x: x, y: y, width: symSize.width, height: symSize.height)

            let tinted = NSImage(size: symSize, flipped: false) { tintRect in
                configured.draw(in: tintRect)
                spec.color.set()
                tintRect.fill(using: .sourceAtop)
                return true
            }

            tinted.draw(in: drawRect, from: .zero, operation: .sourceOver, fraction: 1.0)
            return true
        }

        guard let tiffData = image.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiffData),
              let pngData = bitmap.representation(using: .png, properties: [:]) else {
            print("ERROR: Failed to create PNG for \(spec.assetName)\(scale.suffix)")
            return
        }

        let fileName = "\(spec.assetName)\(scale.suffix).png"
        try! pngData.write(to: URL(fileURLWithPath: "\(dir)/\(fileName)"))
        print("  \(fileName) (\(Int(pixelSize))x\(Int(pixelSize)))")
    }

    // Write Contents.json
    let json = """
    {
      "images" : [
        {
          "filename" : "\(spec.assetName).png",
          "idiom" : "universal",
          "scale" : "1x"
        },
        {
          "filename" : "\(spec.assetName)@2x.png",
          "idiom" : "universal",
          "scale" : "2x"
        },
        {
          "filename" : "\(spec.assetName)@3x.png",
          "idiom" : "universal",
          "scale" : "3x"
        }
      ],
      "info" : {
        "author" : "xcode",
        "version" : 1
      }
    }
    """
    try! json.write(toFile: "\(dir)/Contents.json", atomically: true, encoding: .utf8)
}

// MARK: - CLI

let args = CommandLine.arguments

if args.count < 3 || args.contains("--help") || args.contains("-h") {
    print("""
    Usage: generate_icons.swift <sf-symbol-name> <asset-name> [options]

    Options:
      --size <pt>       Base size in points (default: 68)
      --color <hex>     Color hex code (default: 8E8E93)
      --weight <name>   Font weight: ultralight|thin|light|regular|medium|semibold|bold|heavy|black (default: thin)
      --output <dir>    Output directory (default: /tmp/icons)

    Examples:
      generate_icons.swift doc.text.below.ecg editTool_expenseReport
      generate_icons.swift person.crop.rectangle editTool_businessCard --color 007AFF --weight regular
      generate_icons.swift receipt myReceipt --size 48 --output ./Assets.xcassets/icons

    Browse SF Symbol names: open the SF Symbols app (free from Apple) or https://developer.apple.com/sf-symbols/
    """)
    exit(0)
}

let symbolName = args[1]
let assetName = args[2]

var baseSize: CGFloat = 68
var colorHex = "8E8E93"
var weightName = "thin"
var outputDir = "/tmp/icons"

var i = 3
while i < args.count {
    switch args[i] {
    case "--size":
        i += 1; baseSize = CGFloat(Double(args[i]) ?? 68)
    case "--color":
        i += 1; colorHex = args[i]
    case "--weight":
        i += 1; weightName = args[i]
    case "--output":
        i += 1; outputDir = args[i]
    default:
        break
    }
    i += 1
}

let spec = IconSpec(
    symbolName: symbolName,
    assetName: assetName,
    baseSize: baseSize,
    color: parseColor(colorHex),
    weight: parseWeight(weightName)
)

print("Generating \(assetName) from SF Symbol '\(symbolName)':")
generateIcon(spec, outputDir: outputDir)
print("Output: \(outputDir)/\(assetName).imageset/")
