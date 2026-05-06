---
name: transcribe-captions
description: 在Remotion中转录音频以生成字幕
metadata:
  tags: captions, transcribe, whisper, audio, speech-to-text
---

# 转录音频

Remotion 提供了多种内置的音频转录选项，用于生成字幕：

* `@remotion/install-whisper-cpp` - 在服务器上使用 Whisper.cpp 进行本地转录。快速且免费，但需要服务器基础设施。
  <https://remotion.dev/docs/install-whisper-cpp>

* `@remotion/whisper-web` - 在浏览器中使用 WebAssembly 进行转录。无需服务器且免费，但由于 WASM 开销，速度较慢。
  <https://remotion.dev/docs/whisper-web>

* `@remotion/openai-whisper` - 使用 OpenAI Whisper API 进行云端转录。快速且无需服务器，但需要付费。
  <https://remotion.dev/docs/openai-whisper/openai-whisper-api-to-captions>
