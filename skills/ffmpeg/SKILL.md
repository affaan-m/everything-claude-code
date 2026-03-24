---
name: ffmpeg
description: Complete FFmpeg toolkit for video/audio manipulation, analysis, and production. Covers probing, trim, concat, convert, scale, effects, audio ops, quality metrics, platform encoding, HLS, GIF, hardware acceleration, video analysis with sub-agents, and batch workflows.
origin: community
---

# FFmpeg Toolkit

Production-ready patterns for video and audio manipulation. Combines best practices from 9 community skills into one comprehensive reference.

## When to Activate

- User wants to trim, cut, concat, or re-encode video/audio files
- Converting between formats (MP4, WebM, ProRes, MKV, etc.)
- Encoding for a specific platform (YouTube, TikTok, Instagram, LinkedIn)
- Extracting frames, generating GIFs, or creating thumbnails
- Analyzing video quality (PSNR, SSIM, VMAF)
- User says "ffmpeg", "transcode", "trim video", "convert video", or "compress video"

## Prerequisites

- **FFmpeg 5.0+**: `ffmpeg -version`
- **Hardware accel**: `ffmpeg -hwaccels`
- Install: `brew install ffmpeg` (macOS) | `sudo apt install ffmpeg` (Debian) | `sudo dnf install ffmpeg` (Fedora)

---

## 1. Probe & Inspect

```bash
# Full metadata (JSON)
ffprobe -v quiet -print_format json -show_format -show_streams "input.mp4"

# Duration only
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "input.mp4"

# Resolution
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "input.mp4"

# FPS
ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "input.mp4"

# Codec info
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,pix_fmt -of default "input.mp4"

# Validate file has video stream
ffprobe -v error -select_streams v:0 -show_entries stream=codec_type -of csv=p=0 "file.mp4" 2>/dev/null
# Returns "video" if valid
```

---

## 2. Trim & Cut

```bash
# Fast trim (stream copy, keyframe-aligned — not frame-accurate)
# Both -ss and -to before -i so they reference input timestamps
ffmpeg -ss 00:01:30 -to 00:02:45 -i input.mp4 -c copy output.mp4

# Frame-accurate trim (re-encodes, -ss after -i for precise seek)
ffmpeg -i input.mp4 -ss 00:01:30 -t 00:01:15 -c:v libx264 -crf 18 -c:a aac output.mp4

# Extract by frame range
ffmpeg -i input.mp4 -vf "select=between(n\,100\,500)" -vsync vfr output.mp4

# First N seconds
ffmpeg -i input.mp4 -t 30 -c copy first30.mp4

# Last N seconds (requires knowing duration)
# dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.mp4)
# start=$(echo "$dur - 30" | bc)
# ffmpeg -ss $start -i input.mp4 -c copy last30.mp4
```

**Note:** `-ss` before `-i` = fast seek (keyframe). `-ss` after `-i` = slow but frame-accurate.

---

## 3. Concatenation

```bash
# Same codecs — concat demuxer (fast, no re-encode)
# Create filelist.txt:
#   file 'clip1.mp4'
#   file 'clip2.mp4'
#   file 'clip3.mp4'
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4

# Different codecs — concat filter (re-encodes)
ffmpeg -i clip1.mp4 -i clip2.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1" output.mp4

# Three inputs
ffmpeg -i a.mp4 -i b.mp4 -i c.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1" output.mp4
```

---

## 4. Format Conversion

```bash
# Any → H.264 MP4 (web-friendly universal)
ffmpeg -i input.avi -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k output.mp4

# Any → H.265/HEVC (smaller files, newer compatibility)
ffmpeg -i input.mp4 -c:v libx265 -crf 28 -c:a aac -b:a 128k output.mp4

# MP4 → ProRes MOV (for Final Cut Pro)
ffmpeg -i input.mp4 -c:v prores_ks -profile:v 3 -c:a pcm_s16le output.mov

# MP4 → WebM/VP9 (web, open format)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm

# MKV → MP4 (remux, no re-encode)
ffmpeg -i input.mkv -c copy -movflags faststart output.mp4

# GIF → MP4 (Remotion-compatible)
ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4
```

### ProRes Profiles (Final Cut Pro)

| Profile | Flag | Quality | Use Case |
|---------|------|---------|----------|
| Proxy | `-profile:v 0` | Low | Offline editing |
| LT | `-profile:v 1` | Medium | Light grading |
| Standard | `-profile:v 2` | High | General editing |
| HQ | `-profile:v 3` | Very High | Final delivery |
| 4444 | `-profile:v 4` | Highest | VFX/compositing |

### Codec Selection Guide

| Use Case | Video Codec | Audio Codec | Container |
|----------|-------------|-------------|-----------|
| Web delivery | libx264 | aac | mp4 |
| Smaller web | libx265 | aac | mp4 |
| Open web | libvpx-vp9 | libopus | webm |
| Final Cut Pro | prores_ks | pcm_s16le | mov |
| Archive/lossless | ffv1 | flac | mkv |
| Quick preview | libx264 -preset ultrafast | aac | mp4 |
| Social media | libx264 -crf 20 | aac -b:a 192k | mp4 |

---

## 5. Scaling & Resolution

```bash
# Exact resolution
ffmpeg -i input.mp4 -vf "scale=1920:1080" output.mp4

# Scale width, auto height (maintain aspect ratio)
ffmpeg -i input.mp4 -vf "scale=1920:-1" output.mp4

# Even dimensions (required for H.264)
ffmpeg -i input.mp4 -vf "scale=1920:-2" output.mp4

# Fit within bounds (no upscale)
ffmpeg -i input.mp4 -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" output.mp4

# Pad to exact size (letterbox/pillarbox)
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" output.mp4

# Crop to aspect ratio (center crop)
ffmpeg -i input.mp4 -vf "crop=ih*16/9:ih" output.mp4
```

---

## 6. Audio Operations

```bash
# Extract audio only
ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3
ffmpeg -i video.mp4 -vn -c:a pcm_s16le audio.wav
ffmpeg -i video.mp4 -vn -c:a aac -b:a 192k audio.m4a
ffmpeg -i video.mp4 -vn -c:a flac audio.flac

# Replace audio track
ffmpeg -i video.mp4 -i new_audio.mp3 -c:v copy -map 0:v:0 -map 1:a:0 output.mp4

# Mix/overlay audio tracks
ffmpeg -i video.mp4 -i music.mp3 \
  -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map 0:v -map "[a]" -c:v copy output.mp4

# Adjust volume
ffmpeg -i input.mp4 -af "volume=1.5" output.mp4
ffmpeg -i input.mp4 -af "volume=0.5" output.mp4  # reduce

# Normalize audio (EBU R128 loudness)
ffmpeg -i input.mp4 -af loudnorm=I=-16:TP=-1.5:LRA=11 output.mp4

# Convert audio format
ffmpeg -i audio.m4a -c:a libmp3lame -q:a 2 audio.mp3

# Fade audio in/out
ffmpeg -i input.mp4 -af "afade=t=in:st=0:d=2,afade=t=out:st=58:d=2" output.mp4

# Remove audio
ffmpeg -i input.mp4 -an -c:v copy output_silent.mp4
```

---

## 7. Video Effects & Filters

```bash
# Fade in/out (video)
ffmpeg -i input.mp4 -vf "fade=t=in:st=0:d=1,fade=t=out:st=9:d=1" output.mp4

# Speed up (2x) — video + audio
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
  -map "[v]" -map "[a]" output.mp4

# Speed up (4x) — chain atempo (max 2.0 per filter)
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]setpts=0.25*PTS[v];[0:a]atempo=2.0,atempo=2.0[a]" \
  -map "[v]" -map "[a]" output.mp4

# Slow down (0.5x)
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" \
  -map "[v]" -map "[a]" output.mp4

# Text overlay (centered title)
ffmpeg -i input.mp4 \
  -vf "drawtext=text='Title':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=50" output.mp4

# Color correction
ffmpeg -i input.mp4 -vf "eq=brightness=0.1:saturation=1.2:contrast=1.1" output.mp4

# Rotate 90° clockwise
ffmpeg -i input.mp4 -vf "transpose=1" output.mp4

# Picture-in-picture
ffmpeg -i main.mp4 -i overlay.mp4 \
  -filter_complex "[1:v]scale=320:-1[pip];[0:v][pip]overlay=W-w-10:H-h-10" output.mp4

# Stabilize (two-pass)
ffmpeg -i shaky.mp4 -vf vidstabdetect -f null -
ffmpeg -i shaky.mp4 -vf vidstabtransform output.mp4
```

### Speed Reference

| Speed | setpts | atempo |
|-------|--------|--------|
| 0.25x (slow) | `4.0*PTS` | `atempo=0.5,atempo=0.5` |
| 0.5x | `2.0*PTS` | `atempo=0.5` |
| 1.5x | `0.667*PTS` | `atempo=1.5` |
| 2x | `0.5*PTS` | `atempo=2.0` |
| 4x | `0.25*PTS` | `atempo=2.0,atempo=2.0` |
| 8x | `0.125*PTS` | `atempo=2.0,atempo=2.0,atempo=2.0` |

---

## 8. GIF Creation

```bash
# High-quality GIF (two-pass with palette)
ffmpeg -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i input.mp4 -i palette.png \
  -filter_complex "[0:v]fps=15,scale=480:-1:flags=lanczos[v];[v][1:v]paletteuse" output.gif

# Quick GIF (lower quality, single pass)
ffmpeg -i input.mp4 -vf "fps=10,scale=320:-1" -t 5 output.gif

# GIF from time range
ffmpeg -ss 5 -t 3 -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -ss 5 -t 3 -i input.mp4 -i palette.png \
  -filter_complex "[0:v]fps=15,scale=480:-1:flags=lanczos[v];[v][1:v]paletteuse" output.gif
```

---

## 9. Thumbnails & Frame Extraction

```bash
# Single thumbnail at timestamp
ffmpeg -ss 00:00:10 -i input.mp4 -vframes 1 -q:v 2 thumb.jpg

# Thumbnail every N seconds
ffmpeg -i input.mp4 -vf "fps=1/10" thumb_%04d.jpg

# Keyframe extraction (scene changes)
ffmpeg -i input.mp4 -vf "select=eq(pict_type\,I)" -vsync vfr keyframe_%04d.jpg

# Scene detection (configurable threshold 0.0-1.0)
ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)'" -vsync vfr scene_%04d.jpg

# Contact sheet / sprite sheet
ffmpeg -i input.mp4 -vf "fps=1/10,scale=160:-1,tile=5x4" contact_sheet.jpg

# Extract frame at specific resolution
ffmpeg -ss 5 -i input.mp4 -vframes 1 -vf "scale=1280:-1" frame.jpg
```

---

## 10. Platform-Specific Encoding

### YouTube (recommended)
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart -pix_fmt yuv420p youtube.mp4
```

### Twitter/X (max 512MB, 140s, 1920x1200)
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 \
  -vf "scale='min(1920,iw)':'min(1200,ih)':force_original_aspect_ratio=decrease" \
  -c:a aac -b:a 128k -t 140 -movflags +faststart twitter.mp4
```

### LinkedIn (max 5GB, 10min, prefer 1080p)
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 20 \
  -vf "scale=-2:1080" -c:a aac -b:a 192k \
  -movflags +faststart -t 600 linkedin.mp4
```

### Instagram Reels (9:16, max 90s)
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 20 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
  -c:a aac -b:a 128k -t 90 -movflags +faststart reel.mp4
```

### Web Embed (small, fast-loading)
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 28 \
  -vf "scale=-2:720" -c:a aac -b:a 96k \
  -movflags +faststart -maxrate 2M -bufsize 4M web.mp4
```

### Platform Quick Reference

| Platform | Max Res | Max Size | Max Duration | Aspect |
|----------|---------|----------|-------------|--------|
| YouTube | 8K | 256GB | 12h | 16:9 |
| Twitter/X | 1920x1200 | 512MB | 2:20 | 16:9/1:1 |
| LinkedIn | 4096x2304 | 5GB | 10min | 16:9/1:1 |
| Instagram Reels | 1080x1920 | — | 90s | 9:16 |
| TikTok | 1080x1920 | — | 10min | 9:16 |

---

## 11. HLS Streaming

```bash
# Create HLS stream from video
ffmpeg -i input.mp4 -c:v libx264 -c:a aac -f hls \
  -hls_time 10 -hls_list_size 0 -hls_segment_filename "segment_%03d.ts" \
  playlist.m3u8

# Multi-bitrate HLS (adaptive)
ffmpeg -i input.mp4 \
  -map 0:v -map 0:a -map 0:v -map 0:a \
  -c:v libx264 -c:a aac \
  -b:v:0 5M -s:v:0 1920x1080 \
  -b:v:1 2M -s:v:1 1280x720 \
  -f hls -hls_time 10 -hls_list_size 0 \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0 v:1,a:1" \
  stream_%v/playlist.m3u8

# Download HLS stream
ffmpeg -i "https://example.com/playlist.m3u8" -c copy output.mp4

# Download with auth headers
ffmpeg -headers "Authorization: Bearer TOKEN\r\n" \
  -i "https://example.com/playlist.m3u8" \
  -c copy -protocol_whitelist http,https,tcp,tls,crypto output.mp4
```

---

## 12. Quality Metrics

```bash
# PSNR (Peak Signal-to-Noise Ratio) — higher is better
ffmpeg -i compressed.mp4 -i original.mp4 -lavfi psnr -f null -

# SSIM (Structural Similarity) — closer to 1.0 is better
ffmpeg -i compressed.mp4 -i original.mp4 -lavfi ssim -f null -

# VMAF (Netflix perceptual quality) — 0-100 scale
# Default model (FFmpeg 5.0+, uses built-in vmaf_v0.6.1)
ffmpeg -i compressed.mp4 -i original.mp4 -lavfi libvmaf -f null -
```

### Quality Interpretation

| Metric | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| PSNR | >40 dB | 35-40 | 30-35 | <30 |
| SSIM | >0.95 | 0.90-0.95 | 0.80-0.90 | <0.80 |
| VMAF | >90 | 75-90 | 60-75 | <60 |

---

## 13. Hardware Acceleration

```bash
# macOS (VideoToolbox)
ffmpeg -hwaccel videotoolbox -i input.mp4 -c:v h264_videotoolbox -q:v 50 output.mp4

# Linux NVIDIA (NVENC)
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -preset p4 -cq 23 output.mp4

# Intel Quick Sync (QSV)
ffmpeg -hwaccel qsv -i input.mp4 -c:v h264_qsv -global_quality 23 output.mp4

# Check available hardware acceleration
ffmpeg -hwaccels

# Check available encoders
ffmpeg -encoders | grep -E "videotoolbox|nvenc|qsv"
```

---

## 14. Multi-Pass Encoding

```bash
# Two-pass for target bitrate (best quality at file size)
ffmpeg -i input.mp4 -c:v libx264 -b:v 5M -pass 1 -f null /dev/null
ffmpeg -i input.mp4 -c:v libx264 -b:v 5M -pass 2 -c:a aac -b:a 192k output.mp4

# Target file size calculation
# target_bitrate = (target_size_MB * 8192) / duration_seconds - audio_bitrate
# Example: 50MB file, 120s video, 128k audio:
# video_bitrate = (50 * 8192) / 120 - 128 ≈ 3285 kbps
```

---

## 15. Video Analysis (Sub-Agent Pattern)

For analyzing video content by extracting frames and using AI vision:

### Frame Extraction Strategy (by duration)

| Duration | Strategy | Command |
|----------|----------|---------|
| 0-60s | 1 frame/2s | `ffmpeg -i input.mp4 -vf "fps=0.5" frames/%04d.jpg` |
| 1-10min | Scene detection | `ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)'" -vsync vfr frames/%04d.jpg` |
| 10-30min | Keyframes only | `ffmpeg -i input.mp4 -vf "select=eq(pict_type\,I)" -vsync vfr frames/%04d.jpg` |
| 30min+ | Thumbnail filter | `ffmpeg -i input.mp4 -vf "fps=1/30,scale=640:-1" frames/%04d.jpg` |

### Workflow

1. Create temp dir: `/tmp/video-analysis-$(date +%s)`
2. Extract metadata with `ffprobe`
3. Choose frame extraction strategy based on duration
4. Cap at ~60 frames max. If >100 frames, increase scene threshold or reduce fps
5. **Sub-agent delegation**: Split frames into batches of 8-10, spawn parallel sub-agents to analyze each batch using vision. Each writes `batch_N_analysis.md`. Main agent reads only text summaries — saves ~90% context.
6. Synthesize: metadata table + timeline segments + key moments (3-7) + summary (2-5 sentences)
7. Cleanup temp directory

### Higher Detail Mode
- Double frame rate from strategy table
- Lower scene detection threshold to 0.2
- Add `scale=1920:-1` for better text/detail capture

---

## 16. Batch Processing

```bash
# Convert all files in directory
for f in *.avi; do
  ffmpeg -i "$f" -c:v libx264 -crf 23 -c:a aac "${f%.avi}.mp4"
done

# Batch with GNU parallel (faster)
ls *.avi | parallel -j4 'ffmpeg -i {} -c:v libx264 -crf 23 -c:a aac {.}.mp4'

# Multi-platform export from single source
export_all() {
  local input="$1"
  local base="${input%.*}"
  ffmpeg -i "$input" -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 192k -movflags +faststart "${base}_youtube.mp4" &
  ffmpeg -i "$input" -c:v libx264 -crf 23 -vf "scale='min(1920,iw)':'min(1200,ih)':force_original_aspect_ratio=decrease" -c:a aac -b:a 128k -t 140 -movflags +faststart "${base}_twitter.mp4" &
  ffmpeg -i "$input" -c:v libx264 -crf 20 -vf "scale=-2:1080" -c:a aac -b:a 192k -movflags +faststart "${base}_linkedin.mp4" &
  wait
  echo "All exports complete"
}
# Usage: export_all input.mp4
```

---

## 17. Common Patterns & Tips

### Quality Guidelines

| Use Case | CRF | Preset | Notes |
|----------|-----|--------|-------|
| Archival | 15-18 | slow | Large files, maximum quality |
| Production | 18-22 | medium | Good balance |
| Web/sharing | 23-28 | medium | Smaller files |
| Preview/draft | 30-35 | ultrafast | Fast encoding, lower quality |

### Useful Flags

| Flag | Purpose |
|------|---------|
| `-movflags +faststart` | Web playback (moov atom at start) |
| `-pix_fmt yuv420p` | Maximum compatibility |
| `-threads 0` | Auto-detect CPU threads |
| `-max_muxing_queue_size 1024` | Fix muxing queue overflow |
| `-y` | Overwrite output without asking |
| `-n` | Never overwrite |
| `-hide_banner` | Suppress version info |
| `-progress pipe:1` | Machine-readable progress |

### Validation Helper

```bash
validate_video() {
  local file="$1"
  if ffprobe -v error -select_streams v:0 -show_entries stream=codec_type -of csv=p=0 "$file" 2>/dev/null | grep -q "video"; then
    echo "✓ Valid: $(ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$file" 2>/dev/null)"
    return 0
  else
    echo "✗ Invalid or missing video stream"
    return 1
  fi
}
```

---

## Related Tools

- **Whisper/WhisperX** — Transcription from extracted audio
- **yt-dlp** — Download source video (`yt-dlp -f bestvideo+bestaudio URL`)
- **ImageMagick** — Static image manipulation (use ffmpeg for video frames, ImageMagick for post-processing stills)
- **Remotion** — Programmatic video rendering (ffmpeg for encoding final output)
