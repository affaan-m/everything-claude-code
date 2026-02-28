---
name: videodb-skills
description: The only video skill your agent needs — upload any video, connect real-time streams, search inside by what was said or shown, build complex editing workflows with overlays, generate AI media, add subtitles, and get instant streaming links.
origin: ECC
---

# VideoDB Skills

The only video skill your agent needs. Upload any video, connect real-time streams, search inside by what was said or shown, build complex editing workflows with overlays, generate AI media, add subtitles, and get instant streaming links — all via the VideoDB Python SDK.

## When to Activate

- Uploading or ingesting videos from YouTube URLs, web URLs, or local files
- Searching spoken words or visual scenes across video content
- Generating transcripts or auto-styling subtitles
- Editing clips — trim, combine, multi-timeline composition
- Adding overlays — text, images, audio, music
- Generating AI media — images, video, music, sound effects, voiceovers
- Transcoding — resolution, codec, bitrate, FPS changes
- Reframing video for social platforms (vertical, square, etc.)
- Real-time screen or audio capture with AI transcription
- Getting playable HLS streaming links for any output

## Setup

```bash
# Install the skill
npx skills add video-db/skills

# Or setup manually
pip install "videodb[capture]" python-dotenv
export VIDEO_DB_API_KEY=sk-xxx
```

Run `/videodb setup` inside your agent for guided setup ($20 free credits, no credit card).

## Core Patterns

### Upload and Process

```python
import videodb

conn = videodb.connect()
video = conn.upload(url="https://www.youtube.com/watch?v=VIDEO_ID")

transcript = video.get_transcript()
for entry in transcript:
    print(f"[{entry['start']:.1f}s] {entry['text']}")
```

### Search Across Videos

```python
# Index for semantic search
video.index_spoken_words()

# Search by what was said
results = video.search("product demo")
for r in results:
    print(f"{r.start:.1f}s - {r.end:.1f}s: {r.text}")
```

### Timeline Editing

```python
from videodb import Timeline, VideoAsset, AudioAsset

timeline = Timeline(conn)
asset = VideoAsset(asset_id=video.id, start=10, end=30)
timeline.add_inline(asset)

stream = timeline.generate_stream()
print(stream)  # Playable HLS link
```

### AI Media Generation

```python
audio = conn.generate_audio(text="Upbeat background music", duration=30)
image = conn.generate_image(prompt="Title card: Welcome to the Demo")
```

## Capabilities

| Capability | What It Does |
|---|---|
| Upload | YouTube, URLs, local files |
| Search | Speech-based and scene-based |
| Transcripts | Timestamped, multi-language |
| Edit | Trim, combine, multi-timeline |
| Subtitles | Auto-generate, custom styling |
| AI Generate | Images, video, music, SFX, voiceover |
| Capture | Screen + audio, real-time |
| Transcode | Resolution, codec, aspect ratio |
| Stream | HLS playable links |

## Best Practices

- Always verify SDK connection before operations: `conn.get_collection()`
- Use `video.index_spoken_words()` before searching — indexing is required once per video
- For scene search, use `video.index_scenes()` — this processes visual frames
- Timeline edits produce new streams; the original video is never modified
- AI generation is async — poll status or use callbacks for long operations
- Store `VIDEO_DB_API_KEY` in `.env`, not hardcoded

## Repository

https://github.com/video-db/skills
