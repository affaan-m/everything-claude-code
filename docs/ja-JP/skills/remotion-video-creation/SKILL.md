---
name: remotion-video-creation
description: Remotion のベストプラクティス — React での動画制作。3D、アニメーション、音声、キャプション、チャート、トランジションなどを網羅した 29 のドメイン固有ルール。
metadata:
  tags: remotion, video, react, animation, composition, three.js, lottie
---

## 使うタイミング

Remotion のコードを扱う際は、このスキルを使ってドメイン固有の知識を取得してください。

## 使い方

詳細な説明とコード例は個別のルールファイルを参照してください：

- [rules/3d.md](../../../../skills/remotion-video-creation/rules/3d.md) - Three.js と React Three Fiber を使った Remotion の 3D コンテンツ
- [rules/animations.md](../../../../skills/remotion-video-creation/rules/animations.md) - Remotion のアニメーション基礎
- [rules/assets.md](../../../../skills/remotion-video-creation/rules/assets.md) - 画像、動画、音声、フォントを Remotion に取り込む
- [rules/audio.md](../../../../skills/remotion-video-creation/rules/audio.md) - Remotion での音声使用 — インポート、トリミング、音量、速度、ピッチ
- [rules/calculate-metadata.md](../../../../skills/remotion-video-creation/rules/calculate-metadata.md) - コンポジションの長さ、サイズ、props を動的に設定
- [rules/can-decode.md](../../../../skills/remotion-video-creation/rules/can-decode.md) - Mediabunny でブラウザがデコードできるかチェック
- [rules/charts.md](../../../../skills/remotion-video-creation/rules/charts.md) - Remotion 向けのチャートとデータ可視化パターン
- [rules/compositions.md](../../../../skills/remotion-video-creation/rules/compositions.md) - コンポジション、スチル、フォルダ、デフォルト props、動的メタデータの定義
- [rules/display-captions.md](../../../../skills/remotion-video-creation/rules/display-captions.md) - TikTok スタイルのページと単語ハイライト付きキャプション表示
- [rules/extract-frames.md](../../../../skills/remotion-video-creation/rules/extract-frames.md) - Mediabunny で特定タイムスタンプからフレーム抽出
- [rules/fonts.md](../../../../skills/remotion-video-creation/rules/fonts.md) - Google Fonts とローカルフォントの読み込み
- [rules/get-audio-duration.md](../../../../skills/remotion-video-creation/rules/get-audio-duration.md) - Mediabunny で音声ファイルの長さを秒単位で取得
- [rules/get-video-dimensions.md](../../../../skills/remotion-video-creation/rules/get-video-dimensions.md) - Mediabunny で動画ファイルの幅と高さを取得
- [rules/get-video-duration.md](../../../../skills/remotion-video-creation/rules/get-video-duration.md) - Mediabunny で動画ファイルの長さを秒単位で取得
- [rules/gifs.md](../../../../skills/remotion-video-creation/rules/gifs.md) - Remotion のタイムラインと同期した GIF 表示
- [rules/images.md](../../../../skills/remotion-video-creation/rules/images.md) - Img コンポーネントによる画像埋め込み
- [rules/import-srt-captions.md](../../../../skills/remotion-video-creation/rules/import-srt-captions.md) - @remotion/captions で .srt 字幕ファイルをインポート
- [rules/lottie.md](../../../../skills/remotion-video-creation/rules/lottie.md) - Lottie アニメーションの埋め込み
- [rules/measuring-dom-nodes.md](../../../../skills/remotion-video-creation/rules/measuring-dom-nodes.md) - DOM 要素のサイズ計測
- [rules/measuring-text.md](../../../../skills/remotion-video-creation/rules/measuring-text.md) - テキストサイズの計測、コンテナへのフィット、オーバーフロー確認
- [rules/sequencing.md](../../../../skills/remotion-video-creation/rules/sequencing.md) - シーケンシングパターン — 遅延、トリム、再生時間制限
- [rules/tailwind.md](../../../../skills/remotion-video-creation/rules/tailwind.md) - Remotion での TailwindCSS 使用
- [rules/text-animations.md](../../../../skills/remotion-video-creation/rules/text-animations.md) - タイポグラフィとテキストアニメーションのパターン
- [rules/timing.md](../../../../skills/remotion-video-creation/rules/timing.md) - 補間カーブ — linear、easing、spring アニメーション
- [rules/transcribe-captions.md](../../../../skills/remotion-video-creation/rules/transcribe-captions.md) - 音声を文字起こししてキャプションを生成
- [rules/transitions.md](../../../../skills/remotion-video-creation/rules/transitions.md) - シーントランジションパターン
- [rules/trimming.md](../../../../skills/remotion-video-creation/rules/trimming.md) - トリミングパターン — アニメーションの先頭/末尾を切り詰める
- [rules/videos.md](../../../../skills/remotion-video-creation/rules/videos.md) - 動画の埋め込み — トリミング、音量、速度、ループ、ピッチ
