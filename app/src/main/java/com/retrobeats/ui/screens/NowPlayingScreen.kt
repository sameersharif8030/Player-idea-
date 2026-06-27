package com.retrobeats.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.retrobeats.data.ThemeType
import com.retrobeats.ui.components.CassetteReel
import com.retrobeats.ui.components.NeonBarsVisualizer
import com.retrobeats.ui.components.OscilloscopeVisualizer
import com.retrobeats.ui.components.OrbitRingVisualizer
import com.retrobeats.ui.components.StarburstVisualizer
import com.retrobeats.ui.components.DancingParticlesVisualizer
import com.retrobeats.ui.theme.*

private enum class NowPlayingVisualizer(val label: String) {
    NEON("Neon"), WAVE("Wave"), ORBIT("Orbit"), STAR("Star"), PARTICLES("Particles")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NowPlayingScreen(
    navController: androidx.navigation.NavController,
    viewModel: PlayerViewModel = hiltViewModel()
) {
    val playerState by viewModel.state.collectAsState()
    var selectedVisualizer by remember { mutableStateOf(NowPlayingVisualizer.NEON) }
    var selectedTheme by remember { mutableStateOf(ThemeType.DARK) }
    var showThemeMenu by remember { mutableStateOf(false) }
    var showVisualMenu by remember { mutableStateOf(false) }
    var showSleepMenu by remember { mutableStateOf(false) }
    var sleepMinutes by remember { mutableIntStateOf(0) }
    var isSleepTimerActive by remember { mutableStateOf(false) }
    var volume by remember { mutableFloatStateOf(0.7f) }
    var playbackSpeed by remember { mutableFloatStateOf(1.0f) }

    val song = playerState.currentSong
    val currentPosition = playerState.currentPosition / 1000f
    val duration = playerState.duration / 1000f

    // Sleep timer logic
    LaunchedEffect(isSleepTimerActive, sleepMinutes) {
        if (isSleepTimerActive && sleepMinutes > 0) {
            kotlinx.coroutines.delay(sleepMinutes * 60 * 1000L)
            viewModel.playPause()
            isSleepTimerActive = false
            sleepMinutes = 0
        }
    }

    // Theme colors
    val themeAccent = when (selectedTheme) {
        ThemeType.DARK -> SynthwavePink
        ThemeType.LIGHT -> LightAccent
        ThemeType.HACKER -> HackerAccent
        ThemeType.SUNSET -> SunsetAccent
        ThemeType.HATSUNE_MIKU -> MikuAccent
    }
    val themeSurface = when (selectedTheme) {
        ThemeType.DARK -> SynthwaveSurface
        ThemeType.LIGHT -> LightSurface
        ThemeType.HACKER -> HackerSurface
        ThemeType.SUNSET -> SunsetSurface
        ThemeType.HATSUNE_MIKU -> MikuSurface
    }
    val themeBackground = when (selectedTheme) {
        ThemeType.DARK -> SynthwaveBackground
        ThemeType.LIGHT -> LightBackground
        ThemeType.HACKER -> HackerBackground
        ThemeType.SUNSET -> SunsetBackground
        ThemeType.HATSUNE_MIKU -> MikuBackground
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Now Playing", color = themeAccent, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = RetroCream)
                    }
                },
                actions = {
                    // Theme switcher
                    Box {
                        IconButton(onClick = { showThemeMenu = true }) {
                            Icon(Icons.Default.Palette, contentDescription = "Theme", tint = themeAccent)
                        }
                        DropdownMenu(
                            expanded = showThemeMenu,
                            onDismissRequest = { showThemeMenu = false }
                        ) {
                            ThemeType.entries.forEach { theme ->
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            theme.name.replace("_", " "),
                                            color = if (theme == selectedTheme) themeAccent else RetroCream
                                        )
                                    },
                                    onClick = {
                                        selectedTheme = theme
                                        showThemeMenu = false
                                    },
                                    leadingIcon = {
                                        if (theme == selectedTheme) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = themeAccent)
                                        }
                                    }
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = themeBackground
                )
            )
        },
        containerColor = themeBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(12.dp))

            // Vinyl disc with visualizer
            Box(
                modifier = Modifier
                    .size(260.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(themeSurface),
                contentAlignment = Alignment.Center
            ) {
                CassetteReel(
                    modifier = Modifier.size(220.dp),
                    isSpinning = playerState.isPlaying
                )
                Icon(
                    Icons.Default.MusicNote,
                    contentDescription = "Album Art",
                    modifier = Modifier.size(48.dp),
                    tint = RetroCream.copy(alpha = 0.5f)
                )
            }

            Spacer(Modifier.height(16.dp))

            // Visualizer
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(themeSurface.copy(alpha = 0.6f)),
                contentAlignment = Alignment.Center
            ) {
                when (selectedVisualizer) {
                    NowPlayingVisualizer.NEON -> NeonBarsVisualizer(
                        modifier = Modifier.fillMaxSize(), barCount = 24, activeColor = themeAccent
                    )
                    NowPlayingVisualizer.WAVE -> OscilloscopeVisualizer(
                        modifier = Modifier.fillMaxSize(), waveColor = themeAccent, glowColor = themeAccent.copy(alpha = 0.3f)
                    )
                    NowPlayingVisualizer.ORBIT -> OrbitRingVisualizer(
                        modifier = Modifier.fillMaxSize(), ringColor = themeAccent, particleColor = themeAccent
                    )
                    NowPlayingVisualizer.STAR -> StarburstVisualizer(
                        modifier = Modifier.fillMaxSize(), burstColor = themeAccent, rayCount = 20
                    )
                    NowPlayingVisualizer.PARTICLES -> DancingParticlesVisualizer(
                        modifier = Modifier.fillMaxSize(), particleColor = themeAccent
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            // Visualizer selector chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                NowPlayingVisualizer.entries.forEach { visualizer ->
                    val isSelected = selectedVisualizer == visualizer
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { selectedVisualizer = visualizer },
                        color = if (isSelected) themeAccent.copy(alpha = 0.2f) else Color.Transparent,
                        shape = RoundedCornerShape(12.dp),
                        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, themeAccent)
                        else androidx.compose.foundation.BorderStroke(1.dp, RetroCream.copy(alpha = 0.3f))
                    ) {
                        Text(
                            visualizer.label,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            color = if (isSelected) themeAccent else RetroCream.copy(alpha = 0.7f),
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Song title + artist
            Text(
                song?.title ?: "No Song",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = RetroCream
            )
            Spacer(Modifier.height(4.dp))
            Text(
                song?.artist ?: "Unknown Artist",
                style = MaterialTheme.typography.titleLarge,
                color = RetroCream.copy(alpha = 0.7f)
            )

            Spacer(Modifier.height(16.dp))

            // Progress/seek bar
            Slider(
                value = currentPosition,
                onValueChange = { viewModel.seekTo((it * 1000).toLong()) },
                valueRange = 0f..duration.coerceAtLeast(1f),
                modifier = Modifier.fillMaxWidth(),
                colors = SliderDefaults.colors(
                    thumbColor = themeAccent,
                    activeTrackColor = themeAccent,
                    inactiveTrackColor = themeAccent.copy(alpha = 0.3f)
                )
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    formatTime(playerState.currentPosition),
                    style = MaterialTheme.typography.labelSmall,
                    color = RetroCream.copy(alpha = 0.6f)
                )
                Text(
                    formatTime(playerState.duration),
                    style = MaterialTheme.typography.labelSmall,
                    color = RetroCream.copy(alpha = 0.6f)
                )
            }

            Spacer(Modifier.height(8.dp))

            // Control row: shuffle, prev, play/pause, next, repeat
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { viewModel.toggleShuffle() }) {
                    Icon(
                        Icons.Default.Shuffle,
                        contentDescription = "Shuffle",
                        tint = if (playerState.isShuffle) themeAccent else RetroCream.copy(alpha = 0.7f),
                        modifier = Modifier.size(24.dp)
                    )
                }

                IconButton(onClick = { viewModel.skipPrevious() }) {
                    Icon(
                        Icons.Default.SkipPrevious,
                        contentDescription = "Previous",
                        tint = RetroCream,
                        modifier = Modifier.size(32.dp)
                    )
                }

                FilledIconButton(
                    onClick = { viewModel.playPause() },
                    modifier = Modifier.size(64.dp),
                    shape = CircleShape,
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = themeAccent,
                        contentColor = themeBackground
                    )
                ) {
                    Icon(
                        if (playerState.isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (playerState.isPlaying) "Pause" else "Play",
                        modifier = Modifier.size(32.dp)
                    )
                }

                IconButton(onClick = { viewModel.skipNext() }) {
                    Icon(
                        Icons.Default.SkipNext,
                        contentDescription = "Next",
                        tint = RetroCream,
                        modifier = Modifier.size(32.dp)
                    )
                }

                IconButton(onClick = { viewModel.toggleRepeat() }) {
                    Icon(
                        if (playerState.repeatMode == 2) Icons.Default.RepeatOne else Icons.Default.Repeat,
                        contentDescription = "Repeat",
                        tint = if (playerState.repeatMode > 0) themeAccent else RetroCream.copy(alpha = 0.7f),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Bottom row: volume, speed, sleep timer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Volume
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.VolumeUp, contentDescription = null, tint = RetroCream.copy(alpha = 0.6f), modifier = Modifier.size(18.dp))
                    Slider(
                        value = volume,
                        onValueChange = { volume = it },
                        modifier = Modifier.weight(1f),
                        colors = SliderDefaults.colors(
                            thumbColor = themeAccent,
                            activeTrackColor = themeAccent,
                            inactiveTrackColor = themeAccent.copy(alpha = 0.3f)
                        )
                    )
                }

                // Speed control
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Speed", style = MaterialTheme.typography.labelSmall, color = RetroCream.copy(alpha = 0.6f))
                    Spacer(Modifier.width(4.dp))
                    listOf(0.75f, 1.0f, 1.25f).forEach { speed ->
                        Surface(
                            modifier = Modifier
                                .padding(horizontal = 2.dp)
                                .clickable { playbackSpeed = speed }
                                .clip(RoundedCornerShape(4.dp)),
                            color = if (playbackSpeed == speed) themeAccent.copy(alpha = 0.2f) else Color.Transparent,
                            shape = RoundedCornerShape(4.dp),
                            border = if (playbackSpeed == speed) androidx.compose.foundation.BorderStroke(1.dp, themeAccent) else null
                        ) {
                            Text(
                                "${speed}x",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = if (playbackSpeed == speed) themeAccent else RetroCream.copy(alpha = 0.6f)
                            )
                        }
                    }
                }

                // Sleep timer
                Box {
                    IconButton(onClick = { showSleepMenu = true }) {
                        Icon(
                            Icons.Default.Bedtime,
                            contentDescription = "Sleep Timer",
                            tint = if (isSleepTimerActive) themeAccent else RetroCream.copy(alpha = 0.6f)
                        )
                    }
                    DropdownMenu(
                        expanded = showSleepMenu,
                        onDismissRequest = { showSleepMenu = false }
                    ) {
                        Text(
                            "Sleep Timer",
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = themeAccent
                        )
                        listOf(0, 15, 30, 45, 60).forEach { mins ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        if (mins == 0) "Cancel" else "$mins min",
                                        color = if (sleepMinutes == mins && isSleepTimerActive) themeAccent else RetroCream
                                    )
                                },
                                onClick = {
                                    if (mins == 0) {
                                        isSleepTimerActive = false
                                        sleepMinutes = 0
                                    } else {
                                        sleepMinutes = mins
                                        isSleepTimerActive = true
                                    }
                                    showSleepMenu = false
                                }
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))
        }
    }
}

private fun formatTime(ms: Long): String {
    val totalSeconds = ms / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%d:%02d".format(minutes, seconds)
}
