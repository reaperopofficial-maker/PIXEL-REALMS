# PIXEL REALMS: Shadow of the Forgotten King (Part 1 Foundation)

Build a mobile-first 2D pixel-art dark fantasy RPG foundation powered by Phaser 3. Features procedural pixel-art rendering for a Shadow Knight hero, atmospheric parallax backdrop (starry night, ruined castle citadel, glowing torches, floating embers), responsive mobile arcade framing, modular Phaser scene management (Boot, TitleMenu, IntroCutscene, AdventurePreview, Settings, About), Web Audio procedural sound synth, and persistent settings.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed through user clarifications and domain best practices:

- **Hero Character Style**: Confirmed **Shadow Knight** featuring a glowing cyan runic broadsword, dark velvet cape with undulating wind physics, animated chest breathing, and an ethereal magical aura.
- **Audio System**: Confirmed **procedural Web Audio 8-bit retro sound generator** synthesizing crisp UI blips, button press clicks, modal transitions, and ambient dungeon wind, strictly respecting the user's audio settings and `localStorage`.
- **Display & Scaling Architecture**: Confirmed **mobile portrait arcade framing** (native 390x640 logical pixel resolution at crisp integer pixelArt scale) seamlessly centered with dark gothic stone borders and responsive letterboxing for both mobile touchscreens and desktop viewports.

---

## 1. Overview & Core Concept

- **What It Does**: Launches the complete foundational client for *Pixel Realms: Shadow of the Forgotten King*. Players arrive at an animated pixel-art main menu, inspect lore and prototype documentation, configure graphics and audio preferences, and transition through the narrative prologue into the Part 1 adventure staging arena.
- **Target Audience / Persona**: Retro RPG enthusiasts and mobile web gamers looking for a genuine classic 16-bit dark fantasy action RPG reminiscent of *Castlevania: Symphony of the Night*, *Chrono Trigger*, and *Dead Cells*.
- **Key Value**: Provides an authentic, high-performance canvas game engine architecture with zero external asset dependencies, crystal-clear pixel art rendering without blur, and clean state boundaries prepared for subsequent combat, dungeon crawling, and inventory modules.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                          MAIN MENU (Phaser)                            │
│  - Title: "PIXEL REALMS" (Gold pixel bevel)                            │
│  - Subtitle: "Shadow of the Forgotten King" (Cyan runic glow)          │
│  - Animated Shadow Knight Hero with cape & cyan runic blade            │
│  - Background: Stars, Moon, Silhouette Citadel, Flickering Torches     │
│  - Buttons: [PLAY GAME]  [SETTINGS]  [ABOUT]                           │
└───────────────┬────────────────────┬───────────────────┬───────────────┘
                │                    │                   │
                ▼                    ▼                   ▼
    ┌───────────────────────┐ ┌──────────────┐ ┌───────────────────┐
    │     INTRO SCREEN      │ │   SETTINGS   │ │       ABOUT       │
    │  - Kingdom Lore Text  │ │ - SFX / BGM  │ │ - Version v0.1    │
    │  - [CONTINUE] button  │ │ - FX Level   │ │ - Engine details  │
    │  - [BACK TO MENU]     │ │ - Red.Motion │ │ - Part 1 notes    │
    └───────────┬───────────┘ └──────┬───────┘ └─────────┬─────────┘
                ▼                    │                   │
    ┌───────────────────────┐        │                   │
    │   ADVENTURE PREVIEW   │        │                   │
    │  - Staging scene      │        │                   │
    │  - Ready notification │        │                   │
    │  - [BACK TO MENU]     │        │                   │
    └───────────┬───────────┘        │                   │
                └────────────────────┴───────────────────┘
                                     │
                                     ▼
                            Back to Title Menu
```

### Visual Identity & Theme
- **Aesthetic Direction**: 16-bit Dark Fantasy Pixel Art with high-contrast palette and zero-blur rendering (`pixelArt: true`, `roundPixels: true`).
- **Color Palette & Mood**:
  - Dominant Canvas: Midnight Blue (`#080a14`), Deep Obsidian (`#0f1226`)
  - Structural Dungeon Stone: Dark Purple Slate (`#1a1936`), Steel Gray (`#2e3252`)
  - Runic & Magic Accents: Ethereal Cyan (`#00f0ff`), Cerulean (`#0099db`)
  - Royal Heraldry: Ancient Gold (`#f0b232`), Amber Warmth (`#ff7a29`)
  - Combat / Danger: Crimson Ember (`#ff2a55`)
- **Typography**: Authentic bitmap/pixel-styled crisp typography using custom SVG pixel glyphs and clean high-legibility retro fonts with subtle golden/cyan runic text shadows.
- **Interactive Feedback**:
  - Tactile pixel button depress: 2px offset + bevel shift + synthesized 8-bit click sound.
  - Hover / Touch Highlight: Golden outer pixel frame, pulsating cyan core.
  - Torches & Embers: Dynamic procedural flickering with randomized per-particle lifespans.

---

## 3. Key Product Decisions & Trade-Offs

- **Procedural Canvas Pixel Art vs. External Sprite Sheets**:
  - *Chosen Approach*: Generate high-fidelity procedural pixel art textures dynamically on boot into Phaser's Texture Manager (character frames, torch anims, brick patterns, runic icons).
  - *Why*: Eliminates 404 network failures, cors issues, and external CDN dependencies while ensuring crisp 1:1 pixel rendering and immediate zero-latency startup.
- **Audio Synthesizer via Web Audio API**:
  - *Chosen Approach*: A lightweight, self-contained procedural chiptune synth for retro sound effects (button clicks, menu sweeps, ambient howling winds).
  - *Why*: Fully functional without external MP3 audio file dependencies; respects audio settings instantly.
- **Phaser 3 Canvas Lifecycle Integration**:
  - *Chosen Approach*: Cleanly encapsulate Phaser 3 inside a responsive React mount with standard DOM resize listeners, keeping Phaser scenes authoritative over state and rendering.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx / GameContainer                        │
│   - Viewport listener & aspect ratio framing                           │
│   - Mobile touch event handling (preventDefault on canvas scroll)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ mounts
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             Phaser Game                                │
│   - Config: Phaser.CANVAS / Phaser.AUTO, pixelArt: true                │
│   - Scale Mode: Phaser.Scale.FIT, AutoCenter.CENTER_BOTH               │
│                                                                        │
│   Scenes:                                                              │
│   1. BootScene: Builds procedural pixel textures & audio synth         │
│   2. MenuScene: Parallax dark fantasy background, animated Shadow     │
│                 Knight hero, torches, particles, navigation buttons     │
│   3. IntroScene: Narrative scroll with Continue & Back buttons         │
│   4. AdventurePreviewScene: Staging arena preview with Back button     │
│   5. SettingsScene: Audio toggles, FX intensity, motion reduction       │
│   6. AboutScene: Prototype information and architecture summary        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ persists / reads
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LocalStorage / SoundManager Bridge                   │
│   - sfxEnabled: boolean                                                │
│   - musicEnabled: boolean                                              │
│   - animationIntensity: 'full' | 'reduced' | 'minimal'                 │
│   - reducedMotion: boolean                                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Schema

```typescript
interface GameSettings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  animationIntensity: 'full' | 'reduced' | 'minimal';
  reducedMotion: boolean;
}
```

### Execution Strategy

1. **Dependencies & Setup**: Ensure Phaser 3 is loaded reliably (bundled or CDN fallback) and verify Tailwind config and viewport meta tags.
2. **Audio Synth Module**: Build `SoundSynthesizer.ts` providing 8-bit sound effects (select, click, back, ambient wind) using native browser Web Audio API.
3. **Texture Generator**: Build `PixelTextureGenerator.ts` to dynamically draw pixel-art assets:
   - Shadow Knight hero (idle poses, cape billow, cyan rune blade).
   - Castles, mountain silhouettes, brick fortress battlements, stone pedestals.
   - Animated torch fire spritesheet and magical floating orbs.
   - Pixel buttons and decorative runic frames.
4. **Phaser Scenes**:
   - `BootScene`: Initialize assets, load localStorage settings, register audio.
   - `MenuScene`: Sky, mountains, castle silhouette, animated hero, torches, dust/stars, interactive menu buttons.
   - `IntroScene`: Lore presentation with pixel scroll border, continue and back buttons.
   - `AdventurePreviewScene`: Adventure staging area with animated hero and upcoming feature overview.
   - `SettingsScene`: Interactive toggle switches for sound, music, particles, and reduced motion.
   - `AboutScene`: Prototype v0.1 info and architectural credits.
5. **Validation & Verification**: Verify responsive layout on portrait mobile (360x640, 390x844, 412x915) and desktop frames, verify button touch responsiveness, test localStorage persistence, and run `compile_applet`.
