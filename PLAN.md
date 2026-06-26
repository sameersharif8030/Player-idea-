# RetroBeats — Retro-Style Android Music Player

## PROJECT VISION

A retro-styled, feature-rich Android music player with a signature "Stealth Mode" — play music invisibly (no notification, no lock screen controls) while still responding to headphone/Bluetooth button controls.

---

## 1. WHAT I INFER FROM YOUR IDEA

You want a music player that:
- **Looks retro** — not Material Design 3 templates. Think: cassette decks, VU meters, CRT phosphor glow, vinyl spin, 8-bit pixel aesthetics, or boombox/ghetto-blaster vibes
- **Works modern** — equalizer, gapless playback, queue management, playlist support, lyrics, search, folder browsing — all the stuff you'd expect from Poweramp or Musicolet
- **Has a killer feature** — Stealth Mode is the differentiator. This alone makes it niche and interesting
- **Is YOUR app** — not a remix of some template. Something you'd actually use daily
- **Audio source** — you want your music, whether local files or streamed

---

## 2. STEALTH MODE — THE TECHNICAL DEEP DIVE

### How it works (Android APIs)

| Component | Purpose | Stealth Role |
|---|---|---|
| **MediaSession** | Central media control hub | Stays ACTIVE even without notification — receives Bluetooth/headphone buttons via `onPlay()`, `onPause()`, `onSkipToNext()` |
| **NotificationManager** | Shows media notification | In stealth: DON'T post notification, or post with `IMPORTANCE_MIN` then cancel immediately |
| **AudioManager** | Audio focus, media button routing | Register as media button receiver so headphone controls still work |
| **BroadcastReceiver** | `ACTION_MEDIA_BUTTON` intent | Backup handler for headset key events (KEYCODE_HEADSETHOOK, KEYCODE_MEDIA_PLAY, etc.) |
| **Foreground Service** | Keeps app alive in background | Required for background playback. Use `FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK` (Android 14+) |

### Stealth Mode Toggle Implementation

```
Normal Mode:
  Foreground Service → MediaStyle Notification → Lock Screen Controls → Full Visibility

Stealth Mode:
  Foreground Service → Low-priority notification (IMPORTANCE_MIN)
  → startForeground() then notificationManager.cancel()
  → MediaSession stays ACTIVE (receives Bluetooth AVRCP commands)
  → BroadcastReceiver for ACTION_MEDIA_BUTTON as fallback
  → Result: Audio plays, headphone controls work, NO notification, NO lock screen widget
```

### Android Version Gotchas

| Android Version | Issue |
|---|---|
| Android 10+ | Needs foreground service for background playback |
| Android 13+ | `POST_NOTIFICATIONS` runtime permission — user can deny it (which HELPS stealth) |
| Android 14+ | Must declare `FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK` in manifest |
| Android 14+ | System may show a small "media playing" indicator — CAN'T hide without root |
| OEM ROMs | Xiaomi/Huawei/Samsung may kill services without visible notification — need battery optimization exemption |

### Caveat: Android 14+ System Indicator
On Android 14+, the system may show a minimal media playback chip in the status bar even without your notification. This is a SYSTEM-LEVEL UI that apps cannot remove without root. Most users won't notice it, but it's worth documenting in the app.

---

## 3. RECOMMENDED FEATURE SET

### Core Features (MVP)
- [ ] Local audio file playback (MP3, FLAC, OGG, WAV, AAC, M4A)
- [ ] Media3/ExoPlayer engine (gapless playback, crossfade)
- [ ] Stealth Mode toggle (hide notification + lock screen controls)
- [ ] Headphone/Bluetooth button controls (play/pause/next/prev)
- [ ] Playlist management (create, edit, delete, reorder)
- [ ] Music library scan (by artist, album, genre, folder)
- [ ] Search (by title, artist, album)
- [ ] Now Playing screen with retro UI
- [ ] Mini player bar (bottom of screen)
- [ ] Audio focus handling (duck/pause on calls, navigation)
- [ ] Sleep timer
- [ ] Shuffle & repeat modes

### Enhanced Features
- [ ] 7-band equalizer with presets (Bass Boost, Rock, Jazz, Classical, etc.)
- [ ] Lyrics display (LRC file + online lookup)
- [ ] Crossfade between tracks
- [ ] Playback speed control (0.5x — 2.0x)
- [ ] Bookmarks / favorites
- [ ] Queue management (drag to reorder, play next, add to queue)
- [ ] Widget (home screen — retro cassette widget)
- [ ] Genre filters & smart playlists (most played, recently added)
- [ ] Album art download (from MusicBrainz/Last.fm)
- [ ] Batch tag editor
- [ ] Export/import playlists (M3U, PLS)

### Advanced / Signature Features
- [ ] **Stealth Mode** (primary differentiator)
- [ ] **Retro visualizers** — VU meters, cassette reel animation, vinyl spin, CRT waveform, LED spectrum, 8-bit equalizer
- [ ] **Retro theme variants** — Cassette Deck, Vinyl Turntable, CRT Terminal, Boombox, Walkman, Game Boy
- [ ] **Ambient mode** — screen-off playback with retro clock + track info
- [ ] **Audio recorder** — record from mic in retro style (tape recorder aesthetic)
- [ ] **Podcast/audiobook support** — chapter marks, resume position, variable speed

### Additional Ideas (I'm suggesting these)
- [ ] **Auto-stealth schedule** — auto-enable stealth at certain times (e.g., at work 9-5)
- [ ] **Fade on stealth toggle** — smooth audio fade when switching modes to prevent audio glitches
- [ ] **Fake notification** — option to show a DIFFERENT notification (e.g., "Timer running") instead of media notification — decoy mode
- [ ] **Gestures** — swipe up on album art for queue, swipe down for lyrics, double-tap to favorite
- [ ] **Retro boot animation** — CRT power-on effect when opening the app
- [ ] **Haptic feedback patterns** — subtle clicks like pressing real buttons
- [ ] **Car mode** — large buttons, landscape-optimized, for driving
- [ ] **Stats/Scrobble** — Last.fm scrobbling, listening statistics with retro charts

---

## 4. ARCHITECTURE & TECH STACK

### App Architecture
```
RetroBeats/
├── app/
│   ├── src/main/
│   │   ├── java/com/retrobeats/
│   │   │   ├── core/              # Core playback engine
│   │   │   │   ├── PlaybackService.kt      # Foreground service + stealth logic
│   │   │   │   ├── MediaSessionManager.kt  # MediaSession + callbacks
│   │   │   │   ├── StealthModeManager.kt   # Toggle stealth, manage notification
│   │   │   │   ├── AudioEngine.kt          # ExoPlayer/Media3 wrapper
│   │   │   │   └── AudioFocusManager.kt    # Audio focus handling
│   │   │   ├── data/              # Data layer
│   │   │   │   ├── MusicLibrary.kt         # MediaStore scanner
│   │   │   │   ├── PlaylistRepository.kt   # Room DB for playlists
│   │   │   │   ├── SettingsRepository.kt   # SharedPreferences/DataStore
│   │   │   │   └── EqualizerRepository.kt  # EQ preset storage
│   │   │   ├── ui/                # UI layer (Jetpack Compose)
│   │   │   │   ├── screens/
│   │   │   │   │   ├── HomeScreen.kt
│   │   │   │   │   ├── NowPlayingScreen.kt
│   │   │   │   │   ├── LibraryScreen.kt
│   │   │   │   │   ├── PlaylistScreen.kt
│   │   │   │   │   ├── SettingsScreen.kt
│   │   │   │   │   └── EqualizerScreen.kt
│   │   │   │   ├── components/
│   │   │   │   │   ├── VuMeter.kt           # Animated VU meter
│   │   │   │   │   ├── CassetteReel.kt      # Spinning cassette reels
│   │   │   │   │   ├── VinylDisc.kt         # Spinning vinyl
│   │   │   │   │   ├── RetroSlider.kt       # Knob/slider with retro feel
│   │   │   │   │   ├── LedSpectrum.kt       # LED bar spectrum
│   │   │   │   │   └── CrtEffect.kt         # CRT scanlines + phosphor glow
│   │   │   │   └── theme/
│   │   │   │       ├── RetroTheme.kt
│   │   │   │       └── ThemeVariant.kt       # Cassette/Vinyl/CRT/Boombox
│   │   │   └── receiver/
│   │   │       ├── MediaButtonReceiver.kt   # Headset button fallback
│   │   │       └── AudioBecomingNoisyReceiver.kt  # Headphone disconnect
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── gradle/
└── build.gradle.kts
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | Kotlin | Modern Android standard, null safety, coroutines |
| **UI** | Jetpack Compose | Modern declarative UI, easy animations, custom drawing for retro components |
| **Playback** | AndroidX Media3 (ExoPlayer) | Google's official media library, MediaSession extension, gapless, crossfade |
| **Architecture** | MVVM + Clean Architecture | Separation of concerns, testable |
| **DI** | Hilt | Google's recommended DI, works well with ViewModels |
| **Database** | Room | Playlists, favorites, EQ presets, listening stats |
| **Async** | Kotlin Coroutines + Flow | Reactive data streams, non-blocking |
| **Settings** | DataStore (Preferences) | Modern replacement for SharedPreferences |
| **Navigation** | Compose Navigation | Type-safe, integrated with Compose |
| **Images** | Coil | Image loading for album art (Compose-native) |
| **Tag parsing** | JAudioTagger | Read/write ID3, Vorbis, FLAC tags |
| **Lyrics** | LRCParser + UI | .lrc file parsing, online lookup |
| **Scrobbling** | Last.fm API (optional) | Listening stats |

### Minimum SDK: 24 (Android 7.0)
### Target SDK: 36 (Android 16)
### Compile SDK: 36

---

## 5. 21ST.DEV COMPONENTS — WHAT'S USABLE

21st.dev has React/web components, not Android native. However, we can use them for:

1. **Design INSPIRATION** — Music Player Card, Spotify Card, Playlist Carousel components give layout/UX ideas that we replicate in Compose
2. **MAGIC CHAT** — 21st.dev's AI chat can generate Compose code from their component descriptions
3. **Shaders** — They have GLSL shaders (Celestial Ink, etc.) that can be adapted to Android via AGI runtime or Compose shaders
4. **Animations** — Framer Motion patterns can be translated to Compose animations

**Practical approach:** Browse 21st.dev for visual inspiration, then build equivalent Compose components. The retro aesthetic is CUSTOM — no template will give you VU meters and cassette reels. That's all hand-drawn in Compose Canvas.

---

## 6. AI MODELS I'D USE

| Task | Model | Why |
|---|---|---|
| **Code generation** | Claude Sonnet 4 (via OpenRouter) | Best at Kotlin, understands Android patterns, writes clean architecture |
| **UI/Compose code** | Claude Sonnet 4 | Strongest at Compose, Canvas drawing, animations |
| **Code review** | Gemini 2.5 Flash | Fast, cheap, good at catching bugs and style issues |
| **Retro design concepts** | Gemini 2.5 Pro or GPT-4o | Visual reasoning, UI/UX suggestions |
| **Documentation** | Gemini 2.5 Flash | Quick, adequate for docs |
| **Overall orchestration** | Hermes (owl-alpha) | Planning, multi-agent coordination, terminal access |

### Orchestration Flow
```
Hermes (orchestrator)
  ├── Agent 1: Claude Sonnet → writes Kotlin/Compose code
  ├── Agent 2: Claude Sonnet → writes different module in parallel
  ├── Agent 3: Gemini 2.5 Flash → reviews code, tests logic
  └── Hermes → integrates, builds, deploys to device
```

---

## 7. ACCESS I'LL NEED

| Access | Purpose | Status |
|---|---|---|
| **Android SDK** | Build the APK | ✅ Installed (API 34, 36, 36.1) |
| **JDK 21** | Compile Kotlin/Java | ✅ Bundled with Android Studio (JBR) |
| **Gradle** | Build system | ✅ 8.14.3 + 9.0.0 |
| **ADB** | Install APK to your phone | ✅ v37 installed |
| **Your Android phone** | Testing on real device | ❌ No device connected (USB debugging needed) |
| **Android Studio** | Layout inspector, debugging | ✅ Installed but I can't use the GUI |
| **OpenRouter API** | AI model access | ✅ Set |
| **Gemini API** | AI model access | ✅ Set (rate limited on some models) |
| **21st.dev** | Design inspiration | ✅ Browsable |
| **GitHub** | Version control (optional) | ✅ gh CLI installed |

### You need to do:
1. **Connect your Android phone via USB** with USB Debugging enabled (Settings → Developer Options → USB Debugging)
2. Or use the **Android emulator** (system image android-37.0 is installed)

---

## 8. HOW VIBECODERS BUILD APPS ONLINE

The "vibecoding" movement — using AI to build apps with natural language:

| Tool | How they work |
|---|---|
| **Claude Code** | Terminal-based, writes + iterates code, runs tests, git commits. Most popular for Android/Kotlin. |
| **OpenAI Codex** | Cloud-based, async, writes PRs. Good for larger codebases. |
| **Google AI Studio** | Vibe coding playground — describe app, get code. Native Gemini integration. |
| **Cursor/Windsurf** | IDE-based, inline AI editing. Good for iteration within a project. |
| **Bolt.new / Lovable** | Web apps from prompts. NOT for Android. |
| **v0 by Vercel** | React components from prompts. NOT for Android. |
| **Hermes 🔥** | Full agent: multi-model, parallel agents, terminal access, can build + test + deploy end-to-end. Best for Android because it can run gradle, adb, etc. |

**Typical vibecoder workflow for Android:**
1. Describe the app → AI scaffolds the project
2. AI generates screens one at a time → test on emulator
3. Iterate on UI → "make the VU meter glow more" → AI adjusts Compose code
4. Wire up functionality → AI connects Media3, Room, etc.
5. Build APK → `gradle assembleDebug` → `adb install`
6. Test on device → report bugs → AI fixes

**Our advantage with Hermes:** I can do ALL of this in one session — scaffold, code, build, install, test, fix. No context switching between tools.

---

## 9. AUDIO SOURCE — LOCAL VS YOUTUBE MUSIC

### Verdict: LOCAL FILES (primary) + optional streaming later

**Why local files win for this project:**

| Factor | Local Files | YouTube Music |
|---|---|---|
| **Legal** | ✅ 100% legal | ❌ ToS violation, gray area |
| **Reliable** | ✅ Always works | ❌ API breaks every 2-6 weeks |
| **Offline** | ✅ Always available | ❌ Stream URLs expire |
| **Quality** | ✅ Your FLAC/MP3 files | ❌ Compressed streams |
| **Speed** | ✅ Instant | ❌ Network dependent |
| **Stealth Mode** | ✅ Perfect fit | ⚠️ Network activity could expose |
| **Maintenance** | ✅ Zero | ❌ Constant API catch-up |
| **Privacy** | ✅ No tracking | ❌ Google sees everything |

**YouTube Music is NOT viable for a production app.** The unofficial API breaks constantly, violates ToS, risks account bans, and Google actively fights it. Projects like InnerTune got abandoned because maintenance was unsustainable.

**However,** for a FUTURE version, we could add:
- Spotify SDK integration (legal, official, requires Premium)
- Piped API (self-hosted, open-source YouTube proxy)
- Jellyfin/Navidrome (self-hosted music server)

**For now: Start with local files.** Most people who want a retro music player have their own music collection anyway — that's the whole point of a dedicated player.

---

## 10. RETRO THEME DESIGNS (Conceptual)

### Theme 1: Cassette Deck 📼
- Two spinning reels (Canvas animation synced to playback progress)
- LED counter (track time like a tape counter)
- Physical button styling (raised, with shadows)
- Color: warm amber, cream, matte black
- VU meters bouncing with audio

### Theme 2: Vinyl Turntable 🎵
- Spinning vinyl disc (speed = playback speed)
- Tonearm that moves toward center as track progresses
- Wood grain background
- Warm tube-amp color palette
-唱片 brush spinning animation

### Theme 3: CRT Terminal 👾
- Green/amber phosphor text on black
- Scanlines overlay
- ASCII-art album art (auto-generated)
- Monospace font (VT220 aesthetic)
- CRT power-on animation on app launch
- Glitch effects

### Theme 4: Boombox / Ghetto Blaster 🔊
- Large physical buttons (play/pause/stop/FF/RW)
- Graphic equalizer LED bars
- Chrome/silver trim
- Speaker grille pattern
- Heavy, tactile feel

### Theme 5: Walkman 🎧
- Minimal, compact layout
- Tape window showing reel position
- Metal/chrome body styling
- Side-mounted physical buttons
- Clean, 80s portable aesthetic

### Theme 6: Game Boy 🎮
- 8-bit pixel art everything
- Chiptune-style visualizer
- D-pad navigation
- Limited green palette (or DMG-style)
- Pixel font
- Lo-fi charm

---

## 11. PROJECT PHASES

### Phase 1: Foundation (Day 1)
- Scaffold Android project (Kotlin, Compose, Media3, Hilt, Room)
- Set up build system (Gradle, SDK versions)
- Create basic navigation structure
- Implement theme system base

### Phase 2: Core Playback (Day 2-3)
- AudioEngine with Media3/ExoPlayer
- PlaybackService (foreground, MediaSession)
- MediaSessionManager (callbacks, media buttons)
- AudioFocusManager
- MusicLibrary scanner (MediaStore)
- Basic Now Playing screen

### Phase 3: Stealth Mode (Day 3-4) ★
- StealthModeManager (toggle notification visibility)
- Notification channel with IMPORTANCE_MIN
- startForeground → cancel notification pattern
- MediaButtonReceiver as fallback
- Settings UI for stealth toggle
- Auto-stealth schedule (optional)

### Phase 4: Retro UI (Day 4-6) ★★
- Cassette Deck theme (primary)
- VU meter Compose component (Canvas + audio amplitude)
- Cassette reel animation
- Retro button/slider components
- Now Playing screen with full retro treatment
- Mini player bar
- Library/home screens with retro styling

### Phase 5: Features (Day 6-8)
- Playlist management (Room DB)
- Search
- Equalizer (Android Equalizer API)
- Sleep timer
- Shuffle & repeat
- Queue management
- Lyrics display

### Phase 6: Polish (Day 8-10)
- Additional retro themes (Vinyl, CRT, Boombox)
- App widget (retro cassette home screen widget)
- Smooth animations everywhere
- Settings screen (all options)
- Icons, splash screen (CRT boot animation)
- Performance optimization
- Build release APK

---

## 12. APP NAME OPTIONS

- **RetroBeats** ← (recommended, clean, memorable)
- **StealthPlayer** (emphasizes the killer feature)
- **CassetteDeck** (leans into the aesthetic)
- **GhostPlay** (stealth + playback)
- **PhantomAudio** (stealthy)
- **RetroWave Player** (synthwave vibes)
- **TapeDeck** (nostalgic)

---

*Plan created by Hermes Agent — ready for your green light to start building.*
