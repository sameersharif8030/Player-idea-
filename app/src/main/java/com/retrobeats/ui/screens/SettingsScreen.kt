package com.retrobeats.ui.screens

import android.widget.Toast
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.retrobeats.core.playback.StealthModeManager
import com.retrobeats.data.AccentColor
import com.retrobeats.data.SammyAnimationStyle
import com.retrobeats.data.ThemeVariant
import com.retrobeats.data.VisualizerStyle
import com.retrobeats.ui.components.NeonBarsVisualizer
import com.retrobeats.ui.components.OrbitRingVisualizer
import com.retrobeats.ui.components.SammyDedication
import com.retrobeats.ui.components.StarburstVisualizer
import com.retrobeats.ui.theme.AccentAmber
import com.retrobeats.ui.theme.AccentCyan
import com.retrobeats.ui.theme.AccentGreen
import com.retrobeats.ui.theme.AccentMagenta
import com.retrobeats.ui.theme.RetroAmber
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark
import com.retrobeats.ui.theme.getAccentColor
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: androidx.navigation.NavController
) {
    val scope = rememberCoroutineScope()
    var stealthEnabled by remember { mutableStateOf(false) }

    val appContext = LocalContext.current.applicationContext
    val stealthManager = remember { StealthModeManager(appContext) }

    LaunchedEffect(Unit) {
        stealthManager.isStealthEnabledFlow.collect { stealthEnabled = it }
    }

    // State for settings
    var selectedTheme by remember { mutableStateOf(ThemeVariant.DARK_SYNTHWAVE) }
    var selectedVisualizer by remember { mutableStateOf(VisualizerStyle.NEON_BARS) }
    var selectedAccent by remember { mutableStateOf(AccentColor.AMBER) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", color = RetroAmber, fontWeight = FontWeight.Bold) },
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

            // ═══════════════════════════════════════════
            // APPEARANCE SECTION - Theme Selector
            // ═══════════════════════════════════════════
            SectionHeader("APPEARANCE")

            Spacer(Modifier.height(8.dp))

            ThemeVariant.entries.forEach { theme ->
                val isSelected = selectedTheme == theme
                val themeName = when (theme) {
                    ThemeVariant.DARK_SYNTHWAVE -> "Dark Synthwave"
                    ThemeVariant.CASSETTE_DECK -> "Cassette Deck"
                    ThemeVariant.CRT_TERMINAL -> "CRT Terminal"
                }
                val themeDescription = when (theme) {
                    ThemeVariant.DARK_SYNTHWAVE -> "Deep purples and neon ambers"
                    ThemeVariant.CASSETTE_DECK -> "Warm analog cassette vibes"
                    ThemeVariant.CRT_TERMINAL -> "Green phosphor terminal glow"
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable { selectedTheme = theme }
                        .then(
                            if (isSelected) Modifier.border(
                                2.dp,
                                RetroAmber,
                                RoundedCornerShape(12.dp)
                            ) else Modifier
                        ),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) RetroAmber.copy(alpha = 0.1f)
                        else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { selectedTheme = theme },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = RetroAmber,
                                unselectedColor = RetroCream.copy(alpha = 0.5f)
                            )
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                themeName,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) RetroAmber else RetroCream
                            )
                            Text(
                                themeDescription,
                                style = MaterialTheme.typography.bodySmall,
                                color = RetroCream.copy(alpha = 0.6f)
                            )
                        }
                        // Theme preview color box
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(
                                    when (theme) {
                                        ThemeVariant.DARK_SYNTHWAVE -> Color(0xFF0D0D1A)
                                        ThemeVariant.CASSETTE_DECK -> Color(0xFF2C1810)
                                        ThemeVariant.CRT_TERMINAL -> Color(0xFF001000)
                                    }
                                )
                                .border(
                                    1.dp,
                                    when (theme) {
                                        ThemeVariant.DARK_SYNTHWAVE -> RetroAmber.copy(alpha = 0.5f)
                                        ThemeVariant.CASSETTE_DECK -> Color(0xFFFFAB40).copy(alpha = 0.5f)
                                        ThemeVariant.CRT_TERMINAL -> Color(0xFF00FF00).copy(alpha = 0.5f)
                                    },
                                    RoundedCornerShape(6.dp)
                                )
                        )
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ═══════════════════════════════════════════
            // VISUALIZER SECTION
            // ═══════════════════════════════════════════
            SectionHeader("VISUALIZER")

            Spacer(Modifier.height(8.dp))

            VisualizerStyle.entries.forEach { visualizer ->
                val isSelected = selectedVisualizer == visualizer
                val visualizerName = when (visualizer) {
                    VisualizerStyle.NEON_BARS -> "Neon Bars"
                    VisualizerStyle.OSCILLOSCOPE -> "Oscilloscope"
                    VisualizerStyle.ORBIT_RING -> "Orbit Ring"
                    VisualizerStyle.STARBURST -> "Starburst"
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable { selectedVisualizer = visualizer }
                        .then(
                            if (isSelected) Modifier.border(
                                2.dp,
                                RetroAmber,
                                RoundedCornerShape(12.dp)
                            ) else Modifier
                        ),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) RetroAmber.copy(alpha = 0.1f)
                        else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = isSelected,
                                onClick = { selectedVisualizer = visualizer },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = RetroAmber,
                                    unselectedColor = RetroCream.copy(alpha = 0.5f)
                                )
                            )
                            Spacer(Modifier.width(12.dp))
                            Text(
                                visualizerName,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) RetroAmber else RetroCream
                            )
                        }

                        if (isSelected) {
                            Spacer(Modifier.height(8.dp))
                            // Small preview area
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(80.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(RetroDark.copy(alpha = 0.5f))
                            ) {
                                when (visualizer) {
                                    VisualizerStyle.NEON_BARS -> NeonBarsVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp),
                                        barCount = 16,
                                        activeColor = RetroAmber
                                    )
                                    VisualizerStyle.OSCILLOSCOPE -> {
                                        com.retrobeats.ui.components.OscilloscopeVisualizer(
                                            modifier = Modifier.fillMaxSize().padding(4.dp),
                                            waveColor = RetroAmber,
                                            glowColor = RetroAmber.copy(alpha = 0.3f)
                                        )
                                    }
                                    VisualizerStyle.ORBIT_RING -> OrbitRingVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp),
                                        ringColor = RetroAmber,
                                        particleColor = RetroAmber
                                    )
                                    VisualizerStyle.STARBURST -> StarburstVisualizer(
                                        modifier = Modifier.fillMaxSize().padding(4.dp),
                                        burstColor = RetroAmber,
                                        rayCount = 16
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ═══════════════════════════════════════════
            // ACCENT COLOR SECTION
            // ═══════════════════════════════════════════
            SectionHeader("ACCENT COLOR")

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                AccentColorOption(
                    color = AccentAmber,
                    label = "Amber",
                    isSelected = selectedAccent == AccentColor.AMBER,
                    onClick = { selectedAccent = AccentColor.AMBER }
                )
                AccentColorOption(
                    color = AccentCyan,
                    label = "Cyan",
                    isSelected = selectedAccent == AccentColor.CYAN,
                    onClick = { selectedAccent = AccentColor.CYAN }
                )
                AccentColorOption(
                    color = AccentMagenta,
                    label = "Magenta",
                    isSelected = selectedAccent == AccentColor.MAGENTA,
                    onClick = { selectedAccent = AccentColor.MAGENTA }
                )
                AccentColorOption(
                    color = AccentGreen,
                    label = "Green",
                    isSelected = selectedAccent == AccentColor.GREEN,
                    onClick = { selectedAccent = AccentColor.GREEN }
                )
            }

            Spacer(Modifier.height(24.dp))

            // ═══════════════════════════════════════════
            // PLAYBACK SECTION
            // ═══════════════════════════════════════════
            SectionHeader("PLAYBACK")

            Spacer(Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.VisibilityOff,
                        contentDescription = null,
                        tint = RetroAmber,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Stealth Mode",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = RetroCream
                        )
                        Text(
                            "Hide notification and lock screen controls. Headphone buttons still work.",
                            style = MaterialTheme.typography.bodySmall,
                            color = RetroCream.copy(alpha = 0.6f)
                        )
                    }
                    Switch(
                        checked = stealthEnabled,
                        onCheckedChange = { enabled ->
                            scope.launch {
                                stealthManager.setStealthMode(enabled)
                                stealthEnabled = enabled
                            }
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = RetroDark,
                            checkedTrackColor = RetroAmber,
                            uncheckedThumbColor = RetroCream.copy(alpha = 0.5f),
                            uncheckedTrackColor = RetroCream.copy(alpha = 0.2f)
                        )
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // ═══════════════════════════════════════════
            // LIBRARY SECTION
            // ═══════════════════════════════════════════
            SectionHeader("LIBRARY")

            Spacer(Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // Add Local Audio button
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable {
                                Toast
                                    .makeText(appContext, "Opening file picker...", Toast.LENGTH_SHORT)
                                    .show()
                            }
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = null,
                            tint = RetroAmber,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(Modifier.width(16.dp))
                        Text(
                            "Add Local Audio",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = RetroCream
                        )
                    }

                    HorizontalDivider(
                        color = RetroCream.copy(alpha = 0.1f),
                        modifier = Modifier.padding(vertical = 4.dp)
                    )

                    // Scan Library button
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable {
                                Toast
                                    .makeText(appContext, "Scanning library...", Toast.LENGTH_SHORT)
                                    .show()
                            }
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.LibraryMusic,
                            contentDescription = null,
                            tint = RetroAmber,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(Modifier.width(16.dp))
                        Text(
                            "Scan Library",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = RetroCream
                        )
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ═══════════════════════════════════════════
            // ABOUT SECTION
            // ═══════════════════════════════════════════
            SectionHeader("ABOUT")

            Spacer(Modifier.height(12.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    SammyDedication(
                        modifier = Modifier.size(120.dp),
                        animationStyle = SammyAnimationStyle.ORBIT_TEXT,
                        textColor = RetroAmber
                    )
                    Spacer(Modifier.height(16.dp))
                    Text(
                        "RetroBeats v1.0",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = RetroCream
                    )
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        title,
        style = MaterialTheme.typography.titleSmall,
        color = RetroAmber,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(vertical = 8.dp)
    )
}

@Composable
private fun AccentColorOption(
    color: Color,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick).padding(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(color)
                .then(
                    if (isSelected) Modifier.border(3.dp, Color.White, CircleShape)
                    else Modifier
                )
        )
        Spacer(Modifier.height(4.dp))
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            color = if (isSelected) color else RetroCream.copy(alpha = 0.6f)
        )
    }
}
