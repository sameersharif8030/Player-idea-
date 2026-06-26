package com.retrobeats.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.retrobeats.data.AccentColor
import com.retrobeats.data.ThemeVariant

private val DarkSynthwaveColorScheme = darkColorScheme(
    primary = SynthwavePink,
    onPrimary = Color.Black,
    primaryContainer = SynthwavePinkDark,
    onPrimaryContainer = RetroCream,
    secondary = SynthwavePurple,
    onSecondary = Color.Black,
    secondaryContainer = SynthwaveSurface,
    onSecondaryContainer = RetroCream,
    tertiary = SynthwavePurpleLight,
    onTertiary = Color.Black,
    background = SynthwaveBackground,
    onBackground = RetroCream,
    surface = SynthwaveSurface,
    onSurface = RetroCream,
    surfaceVariant = RetroDarkCard,
    onSurfaceVariant = RetroCream.copy(alpha = 0.8f),
    outline = SynthwavePink.copy(alpha = 0.3f),
    outlineVariant = RetroCream.copy(alpha = 0.2f),
    error = RetroRed,
    onError = Color.White
)

private val CassetteDeckColorScheme = darkColorScheme(
    primary = CassetteAccent,
    onPrimary = Color.Black,
    primaryContainer = RetroBrown,
    onPrimaryContainer = RetroCream,
    secondary = RetroOrange,
    onSecondary = Color.Black,
    secondaryContainer = CassetteSurface,
    onSecondaryContainer = RetroCream,
    tertiary = RetroAmber,
    onTertiary = Color.Black,
    background = CassetteBackground,
    onBackground = RetroCream,
    surface = CassetteSurface,
    onSurface = RetroCream,
    surfaceVariant = RetroBrown,
    onSurfaceVariant = RetroCream.copy(alpha = 0.8f),
    outline = CassetteAccent.copy(alpha = 0.3f),
    outlineVariant = RetroCream.copy(alpha = 0.2f),
    error = RetroRed,
    onError = Color.White
)

private val CRTTerminalColorScheme = darkColorScheme(
    primary = CRTAccent,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF004000),
    onPrimaryContainer = CRTAccent,
    secondary = Color(0xFF00CC00),
    onSecondary = Color.Black,
    secondaryContainer = CRTSurface,
    onSecondaryContainer = CRTAccent,
    tertiary = Color(0xFFFFFF00),
    onTertiary = Color.Black,
    background = CRTBackground,
    onBackground = CRTAccent,
    surface = CRTSurface,
    onSurface = CRTAccent,
    surfaceVariant = Color(0xFF003000),
    onSurfaceVariant = CRTAccent.copy(alpha = 0.8f),
    outline = CRTAccent.copy(alpha = 0.3f),
    outlineVariant = CRTAccent.copy(alpha = 0.15f),
    error = Color(0xFFFF0000),
    onError = Color.White
)

fun getAccentColor(accent: AccentColor): Color {
    return when (accent) {
        AccentColor.AMBER -> AccentAmber
        AccentColor.CYAN -> AccentCyan
        AccentColor.MAGENTA -> SynthwavePink
        AccentColor.GREEN -> AccentGreen
    }
}

@Composable
fun RetroBeatsTheme(
    themeVariant: ThemeVariant = ThemeVariant.DARK_SYNTHWAVE,
    accentColor: AccentColor = AccentColor.MAGENTA,
    content: @Composable () -> Unit
) {
    val baseScheme = when (themeVariant) {
        ThemeVariant.DARK_SYNTHWAVE -> DarkSynthwaveColorScheme
        ThemeVariant.CASSETTE_DECK -> CassetteDeckColorScheme
        ThemeVariant.CRT_TERMINAL -> CRTTerminalColorScheme
    }

    val accent = getAccentColor(accentColor)
    val colorScheme = baseScheme.copy(
        primary = accent,
        primaryContainer = accent.copy(alpha = 0.7f),
        inversePrimary = accent
    )

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = RetroTypography,
        content = content
    )
}
