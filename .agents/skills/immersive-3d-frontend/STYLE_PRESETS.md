# 3D Style Presets

Reference presets for immersive-3d-frontend. Each preset defines scene mood, color palette, geometry preference, material style, lighting rig, and post-processing.

---

## 1. `cosmic` — Deep Space & Nebula
**Mood**: epic, infinite, wonder
**Palette**: `#0a0a1a` bg · `#7c3aed` accent · `#a78bfa` highlight · `#e0f2fe` star white
**Geometry**: sphere with wireframe, particles, torus knot
**Material**: `MeshStandardMaterial` metalness 1.0, roughness 0.1 + emissive glow
**Lighting**: single purple `PointLight` + ambient `0x0a0a1a`
**Post**: Bloom (high intensity) + ChromaticAberration + Vignette

---

## 2. `minimal-glass` — Frosted Liquid Glass
**Mood**: premium, calm, modern SaaS
**Palette**: `#ffffff` bg · `#e2e8f0` surface · `#6366f1` accent · `#1e1b4b` type
**Geometry**: icosahedron, rounded box, torus
**Material**: `MeshPhysicalMaterial` transmission: 0.9, roughness: 0.05, ior: 1.5, thickness: 1.0
**Lighting**: three-point HDRI + soft `RectAreaLight`
**Post**: Bloom (low) + SSAO

---

## 3. `brutalist-geo` — Hard Edge Geometry
**Mood**: bold, architectural, editorial
**Palette**: `#f5f0e8` bg · `#1a1a1a` stroke · `#ff3c00` accent
**Geometry**: box, cylinder, cone — grid-arranged, edges visible
**Material**: `MeshNormalMaterial` or flat `MeshBasicMaterial` with `wireframe: true`
**Lighting**: orthographic camera, no shadows — flat render
**Post**: None or subtle film grain

---

## 4. `liquid-organic` — Fluid Morphing Shapes
**Mood**: alive, natural, flowing
**Palette**: `#0f172a` bg · `#06b6d4` cyan · `#8b5cf6` violet · `#f0abfc` pink
**Geometry**: `SphereGeometry` with vertex displacement shader, metaballs via SDF
**Material**: custom ShaderMaterial with animated normals
**Lighting**: `HemisphereLight` sky/ground + colored `SpotLight`
**Post**: Bloom + lens distortion

---

## 5. `cyber-grid` — Neon Wireframe Grid
**Mood**: hacker, retro-futurist, cyberpunk
**Palette**: `#000000` bg · `#00ff88` primary neon · `#ff00aa` secondary · `#0066ff` tertiary
**Geometry**: `GridHelper`, `PlaneGeometry` with grid shader, floating wireframe boxes
**Material**: `MeshBasicMaterial` + custom emissive ShaderMaterial
**Lighting**: only emissive — no scene lights needed
**Post**: Bloom (very high, luminanceThreshold 0.2) + Scanline + Glitch (subtle)

---

## Viewport-Safe Canvas CSS Base
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%; height: 100%;
  overflow-x: hidden;
  background: #000;
}

canvas {
  display: block;
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
}

.overlay {
  position: relative;
  z-index: 10;
  pointer-events: none;
}

.overlay a, .overlay button { pointer-events: auto; }
```

## Common Gotchas
- **Black screen**: forgot `renderer.render(scene, camera)` inside the loop, or camera is inside geometry
- **Blurry canvas on Retina**: missing `setPixelRatio(Math.min(devicePixelRatio, 2))`
- **Memory leak in React**: always return cleanup in `useEffect` — call `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`
- **Shader uniform not updating**: uniforms must be mutated as `.value`, not reassigned: `u.uTime.value = t` vs `u.uTime = t`
- **Post-processing kills alpha**: set `renderer.setClearColor(0x000000, 0)` and `alpha: true` in WebGLRenderer for transparent canvas
