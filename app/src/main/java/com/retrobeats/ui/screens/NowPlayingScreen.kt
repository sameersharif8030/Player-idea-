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
import com.retrobeats.ui.components.CassetteReel
import com.retrobeats.ui.components.NeonBarsVisualizer
import com.retrobeats.ui.components.OscilloscopeVisualizer
import com.retrobeats.ui.components.OrbitRingVisualizer
import com.retrobeats.ui.components.StarburstVisualizer
import com.retrobeats.ui.theme.RetroAmber
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark

private enum class NowPlayingVisualizer(val label: String) {
    NEON("Neon"), WAVE("Wave"), ORBIT("Orbit"), STAR("Star")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NowPlayingScreen(
    navController: androidx.navigation.NavController
) {
    var isPlaying by remember { mutableStateOf(false) }
    var currentPosition by remember { mutableFloatStateOf(0f) }
    var duration by remember { mutableFloatStateOf(187f) } // 3:07
    var isShuffle by remember { mutableStateOf(false) }
    var repeatMode by remember { mutableIntStateOf(0) } // 0=off, 1=all, 2=one
    var selectedVisualizer by remember { mutableStateOf(NowPlayingVisualizer.NEON) }

    // Simulate progress when playing
    LaunchedEffect(isPlaying) {
        while (isPlaying) {
            currentPosition = (currentPosition + 1f).coerceAtMost(duration)
            kotlinx.coroutines.delay(1000)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Now Playing", color = RetroAmber, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = RetroCream)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.surface
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(16.dp))

            // Album art placeholder with cassette reel behind
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(RetroDark, RetroDark.copy(alpha = 0.8f), RetroDark)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                // Cassette reel behind the art area
                CassetteReel(
                    modifier = Modifier.size(240.dp),
                    isSpinning = isPlaying
                )
                // Music note icon in center
                Icon(
                    Icons.Default.MusicNote,
                    contentDescription = "Album Art",
                    modifier = Modifier.size(48.dp),
                    tint = RetroCream.copy(alpha = 0.5f)
                )
            }

            Spacer(Modifier.height(24.dp))

            // Visualizer section
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(RetroDark.copy(alpha = 0.6f)),
                contentAlignment = Alignment.Center
            ) {
                when (selectedVisualizer) {
                    NowPlayingVisualizer.NEON -> NeonBarsVisualizer(
                        modifier = Modifier.fillMaxSize(),
                        barCount = 24,
                        activeColor = RetroAmber
                    )
                    NowPlayingVisualizer.WAVE -> OscilloscopeVisualizer(
                        modifier = Modifier.fillMaxSize(),
                        waveColor = RetroAmber,
                        glowColor = RetroAmber.copy(alpha = 0.3f)
                    )
                    NowPlayingVisualizer.ORBIT -> OrbitRingVisualizer(
                        modifier = Modifier.fillMaxSize(),
                        ringColor = RetroAmber,
                        particleColor = RetroAmber
                    )
                    NowPlayingVisualizer.STAR -> StarburstVisualizer(
                        modifier = Modifier.fillMaxSize(),
                        burstColor = RetroAmber,
                        rayCount = 20
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Visualizer switcher chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                NowPlayingVisualizer.entries.forEach { visualizer ->
                    val isSelected = selectedVisualizer == visualizer
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .clickable { selectedVisualizer = visualizer },
                        color = if (isSelected) RetroAmber.copy(alpha = 0.2f) else Color.Transparent,
                        shape = RoundedCornerShape(16.dp),
                        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, RetroAmber)
                        else androidx.compose.foundation.BorderStroke(1.dp, RetroCream.copy(alpha = 0.3f))
                    ) {
                        Text(
                            visualizer.label,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            color = if (isSelected) RetroAmber else RetroCream.copy(alpha = 0.7f),
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // Song title + artist in large retro typography
            Text(
                "Sweet Dreams",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = RetroCream
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "Echo",
                style = MaterialTheme.typography.titleLarge,
                color = RetroCream.copy(alpha = 0.7f)
            )

            Spacer(Modifier.height(24.dp))

            // Progress/seek bar with amber color
            Slider(
                value = currentPosition,
                onValueChange = { currentPosition = it },
                valueRange = 0f..duration,
                modifier = Modifier.fillMaxWidth(),
                colors = SliderDefaults.colors(
                    thumbColor = RetroAmber,
                    activeTrackColor = RetroAmber,
                    inactiveTrackColor = RetroAmber.copy(alpha = 0.3f)
                )
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    formatTime((currentPosition * 1000).toLong()),
                    style = MaterialTheme.typography.labelSmall,
                    color = RetroCream.copy(alpha = 0.6f)
                )
                Text(
                    formatTime((duration * 1000).toLong()),
                    style = MaterialTheme.typography.labelSmall,
                    color = RetroCream.copy(alpha = 0.6f)
                )
            }

            Spacer(Modifier.height(16.dp))

            // Control row: shuffle, prev, play/pause (large center), next, repeat
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { isShuffle = !isShuffle }) {
                    Icon(
                        Icons.Default.Shuffle,
                        contentDescription = "Shuffle",
                        tint = if (isShuffle) RetroAmber else RetroCream.copy(alpha = 0.7f),
                        modifier = Modifier.size(28.dp)
                    )
                }

                IconButton(onClick = { /* Previous */ }) {
                    Icon(
                        Icons.Default.SkipPrevious,
                        contentDescription = "Previous",
                        tint = RetroCream,
                        modifier = Modifier.size(36.dp)
                    )
                }

                FilledIconButton(
                    onClick = { isPlaying = !isPlaying },
                    modifier = Modifier.size(72.dp),
                    shape = CircleShape,
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = RetroAmber,
                        contentColor = RetroDark
                    )
                ) {
                    Icon(
                        if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        modifier = Modifier.size(36.dp)
                    )
                }

                IconButton(onClick = { /* Next */ }) {
                    Icon(
                        Icons.Default.SkipNext,
                        contentDescription = "Next",
                        tint = RetroCream,
                        modifier = Modifier.size(36.dp)
                    )
                }

                IconButton(onClick = {
                    repeatMode = (repeatMode + 1) % 3
                }) {
                    Icon(
                        if (repeatMode == 2) Icons.Default.RepeatOne else Icons.Default.Repeat,
                        contentDescription = "Repeat",
                        tint = if (repeatMode > 0) RetroAmber else RetroCream.copy(alpha = 0.7f),
                        modifier = Modifier.size(28.dp)
                    )
                }
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

private fun formatTime(ms: Long): String {
    val totalSeconds = ms / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%d:%02d".format(minutes, seconds)
}
