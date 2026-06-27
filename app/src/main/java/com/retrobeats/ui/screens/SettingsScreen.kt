package com.retrobeats.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.retrobeats.core.playback.StealthModeManager
import com.retrobeats.data.AccentColor
import com.retrobeats.data.SammyAnimationStyle
import com.retrobeats.data.ThemeType
import com.retrobeats.data.VisualizerStyle
import com.retrobeats.ui.components.NeonBarsVisualizer
import kotlinx.coroutines.launch
import com.retrobeats.ui.components.OrbitRingVisualizer
import com.retrobeats.ui.components.SammyDedication
import com.retrobeats.ui.components.StarburstVisualizer
import com.retrobeats.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: androidx.navigation.NavController,
    playerViewModel: PlayerViewModel = hiltViewModel()
) {
    val scope = rememberCoroutineScope()
    var stealthEnabled by remember { mutableStateOf(false) }

    val appContext = LocalContext.current.applicationContext
    val stealthManager = remember { StealthModeManager(appContext) }

    LaunchedEffect(Unit) {
        stealthManager.isStealthEnabledFlow.collect { stealthEnabled = it }
    }

    var selectedTheme by remember { mutableStateOf(ThemeType.DARK) }
    var selectedVisualizer by remember { mutableStateOf(VisualizerStyle.NEON_BARS) }
    var selectedAccent by remember { mutableStateOf(AccentColor.PINK) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", color = SynthwavePink, fontWeight = FontWeight.Bold) },
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
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(Modifier.height(16.dp))

            // APPEARANCE
            SectionHeader("APPEARANCE")
            Spacer(Modifier.height(8.dp))

            ThemeType.entries.forEach { theme ->
                val isSelected = selectedTheme == theme
                val themeName = theme.name.replace("_", " ").lowercase()
                    .replaceFirstChar { it.uppercase() }
                val themeDescription = when (theme) {
                    ThemeType.DARK -> "Pink & purple neon glow on deep black"
                    ThemeType.LIGHT -> "Clean light mode with violet accents"
                    ThemeType.HACKER -> "Green phosphor terminal hack vibes"
                    ThemeType.SUNSET -> "Warm orange sunset atmosphere"
                    ThemeType.HATSUNE_MIKU -> "Cyan & pink Miku aesthetic"
                }
                val themeColor = when (theme) {
                    ThemeType.DARK -> SynthwavePink
                    ThemeType.LIGHT -> LightAccent
                    ThemeType.HACKER -> HackerAccent
                    ThemeType.SUNSET -> SunsetAccent
                    ThemeType.HATSUNE_MIKU -> MikuAccent
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable { selectedTheme = theme }
                        .then(
                            if (isSelected) Modifier.border(2.dp, themeColor, RoundedCornerShape(12.dp))
                            else Modifier
                        ),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) themeColor.copy(alpha = 0.1f)
                        else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { selectedTheme = theme },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = themeColor,
                                unselectedColor = RetroCream.copy(alpha = 0.5f)
                            )
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(themeName, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold,
                                color = if (isSelected) themeColor else RetroCream)
                            Text(themeDescription, style = MaterialTheme.typography.bodySmall,
                                color = RetroCream.copy(alpha = 0.6f))
                        }
                        Box(
                            modifier = Modifier.size(32.dp).clip(RoundedCornerShape(6.dp))
                                .background(themeColor).border(1.dp, themeColor.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                        )
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // VISUALIZER
            SectionHeader("VISUALIZER")
            Spacer(Modifier.height(8.dp))

            VisualizerStyle.entries.forEach { visualizer ->
                val isSelected = selectedVisualizer == visualizer
                val visualizerName = when (visualizer) {
                    VisualizerStyle.NEON_BARS -> "Neon Bars"
                    VisualizerStyle.OSCILLOSCOPE -> "Oscilloscope"
                    VisualizerStyle.ORBIT_RING -> "Orbit Ring"
                    VisualizerStyle.STARBURST -> "Starburst"
                    VisualizerStyle.DANCING_PARTICLES -> "Dancing Particles"
                }

                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                        .clickable { selectedVisualizer = visualizer }
                        .then(if (isSelected) Modifier.border(2.dp, SynthwavePink, RoundedCornerShape(12.dp)) else Modifier),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) SynthwavePink.copy(alpha = 0.1f)
                        else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = isSelected,
                                onClick = { selectedVisualizer = visualizer },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = SynthwavePink,
                                    unselectedColor = RetroCream.copy(alpha = 0.5f)
                                )
                            )
                            Spacer(Modifier.width(12.dp))
                            Text(visualizerName, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold,
                                color = if (isSelected) SynthwavePink else RetroCream)
                        }
                        if (isSelected) {
                            Spacer(Modifier.height(8.dp))
                            Box(modifier = Modifier.fillMaxWidth().height(80.dp)
                                .clip(RoundedCornerShape(8.dp)).background(RetroDark.copy(alpha = 0.5f))) {
                                when (visualizer) {
                                    VisualizerStyle.NEON_BARS -> NeonBarsVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp), barCount = 16, activeColor = SynthwavePink
                                    )
                                    VisualizerStyle.OSCILLOSCOPE -> com.retrobeats.ui.components.OscilloscopeVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp), waveColor = SynthwavePink, glowColor = SynthwavePink.copy(alpha = 0.3f)
                                    )
                                    VisualizerStyle.ORBIT_RING -> OrbitRingVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp), ringColor = SynthwavePurple, particleColor = SynthwavePink
                                    )
                                    VisualizerStyle.STARBURST -> StarburstVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp), burstColor = SynthwavePink, rayCount = 16
                                    )
                                    VisualizerStyle.DANCING_PARTICLES -> com.retrobeats.ui.components.DancingParticlesVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp), particleColor = SynthwavePink
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ACCENT COLOR
            SectionHeader("ACCENT COLOR")
            Spacer(Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                AccentOption(AccentPink, "Pink", selectedAccent == AccentColor.PINK) { selectedAccent = AccentColor.PINK }
                AccentOption(AccentCyan, "Cyan", selectedAccent == AccentColor.CYAN) { selectedAccent = AccentColor.CYAN }
                AccentOption(AccentMagenta, "Magenta", selectedAccent == AccentColor.MAGENTA) { selectedAccent = AccentColor.MAGENTA }
                AccentOption(AccentGreen, "Green", selectedAccent == AccentColor.GREEN) { selectedAccent = AccentColor.GREEN }
            }

            Spacer(Modifier.height(24.dp))

            // PLAYBACK
            SectionHeader("PLAYBACK")
            Spacer(Modifier.height(8.dp))
            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))) {
                Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.VisibilityOff, contentDescription = null, tint = SynthwavePink, modifier = Modifier.size(28.dp))
                    Spacer(Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Stealth Mode", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium, color = RetroCream)
                        Text("Hide notification & lock screen. Bluetooth controls still work.",
                            style = MaterialTheme.typography.bodySmall, color = RetroCream.copy(alpha = 0.6f))
                    }
                    Switch(checked = stealthEnabled, onCheckedChange = { enabled ->
                        scope.launch {
                            stealthManager.setStealthMode(enabled)
                            stealthEnabled = enabled
                        }
                    }, colors = SwitchDefaults.colors(
                        checkedThumbColor = RetroDark, checkedTrackColor = SynthwavePink,
                        uncheckedThumbColor = RetroCream.copy(alpha = 0.5f), uncheckedTrackColor = RetroCream.copy(alpha = 0.2f)
                    ))
                }
            }

            Spacer(Modifier.height(24.dp))

            // LIBRARY
            SectionHeader("LIBRARY")
            Spacer(Modifier.height(8.dp))
            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Row(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp))
                        .clickable {
                            Toast.makeText(appContext, "Scanning music library...", Toast.LENGTH_SHORT).show()
                            playerViewModel.loadSongs()
                        }.padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LibraryMusic, contentDescription = null, tint = SynthwavePink, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(16.dp))
                        Text("Scan Library", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium, color = RetroCream)
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ABOUT
            SectionHeader("ABOUT")
            Spacer(Modifier.height(12.dp))
            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))) {
                Column(modifier = Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    SammyDedication(modifier = Modifier.size(120.dp), animationStyle = SammyAnimationStyle.ORBIT_TEXT, textColor = SynthwavePink)
                    Spacer(Modifier.height(16.dp))
                    Text("TapeDeck v1.2", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = RetroCream)
                    Text("Premium retro music player with Bluetooth controls",
                        style = MaterialTheme.typography.bodySmall, color = RetroCream.copy(alpha = 0.6f))
                }
            }
            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(title, style = MaterialTheme.typography.labelLarge, color = SynthwavePink.copy(alpha = 0.7f),
        fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
}

@Composable
private fun AccentOption(color: Color, label: String, isSelected: Boolean, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable(onClick = onClick)) {
        Box(modifier = Modifier.size(40.dp).clip(androidx.compose.foundation.shape.CircleShape)
            .background(color)
            .then(if (isSelected) Modifier.border(3.dp, Color.White, androidx.compose.foundation.shape.CircleShape) else Modifier))
        Spacer(Modifier.height(4.dp))
        Text(label, style = MaterialTheme.typography.labelSmall,
            color = if (isSelected) color else RetroCream.copy(alpha = 0.6f))
    }
}
