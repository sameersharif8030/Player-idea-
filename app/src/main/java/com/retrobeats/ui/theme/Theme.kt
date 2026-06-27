package com.retrobeats.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.retrobeats.data.AccentColor
import com.retrobeats.data.ThemeType

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

private val LightColorScheme = lightColorScheme(
    primary = LightAccent,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEDE9FE),
    onPrimaryContainer = Color(0xFF1E1B4B),
    secondary = Color(0xFF6366F1),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF5F3FF),
    onSecondaryContainer = Color(0xFF1E1B4B),
    tertiary = Color(0xFFEC4899),
    onTertiary = Color.White,
    background = LightBackground,
    onBackground = LightText,
    surface = LightSurface,
    onSurface = LightText,
    surfaceVariant = Color(0xFFF5F5F4),
    onSurfaceVariant = Color(0xFF525252),
    outline = LightAccent.copy(alpha = 0.3f),
    outlineVariant = Color(0xFFD4D4D8),
    error = RetroRed,
    onError = Color.White
)

private val HackerColorScheme = darkColorScheme(
    primary = HackerAccent,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF14532D),
    onPrimaryContainer = HackerText,
    secondary = Color(0xFF16A34A),
    onSecondary = Color.Black,
    secondaryContainer = HackerSurface,
    onSecondaryContainer = HackerText,
    tertiary = Color(0xFF86EFAC),
    onTertiary = Color.Black,
    background = HackerBackground,
    onBackground = HackerText,
    surface = HackerSurface,
    onSurface = HackerText,
    surfaceVariant = Color(0xFF0F2E16),
    onSurfaceVariant = Color(0xFF86EFAC),
    outline = HackerAccent.copy(alpha = 0.3f),
    outlineVariant = Color(0xFF166534),
    error = Color(0xFFFF0000),
    onError = Color.White
)

private val SunsetColorScheme = darkColorScheme(
    primary = SunsetAccent,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF7C2D12),
    onPrimaryContainer = SunsetText,
    secondary = Color(0xFFEA580C),
    onSecondary = Color.Black,
    secondaryContainer = SunsetSurface,
    onSecondaryContainer = SunsetText,
    tertiary = Color(0xFFFACC15),
    onTertiary = Color.Black,
    background = SunsetBackground,
    onBackground = SunsetText,
    surface = SunsetSurface,
    onSurface = SunsetText,
    surfaceVariant = Color(0xFF291505),
    onSurfaceVariant = Color(0xFFFDBA74),
    outline = SunsetAccent.copy(alpha = 0.3f),
    outlineVariant = Color(0xFF9A3412),
    error = Color(0xFFFF0000),
    onError = Color.White
)

private val MikuColorScheme = darkColorScheme(
    primary = MikuAccent,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF0F292F),
    onPrimaryContainer = MikuText,
    secondary = MikuPink,
    onSecondary = Color.White,
    secondaryContainer = MikuSurface,
    onSecondaryContainer = MikuText,
    tertiary = Color(0xFF00E1D9),
    onTertiary = Color.Black,
    background = MikuBackground,
    onBackground = MikuText,
    surface = MikuSurface,
    onSurface = MikuText,
    surfaceVariant = Color(0xFF0A2E33),
    onSurfaceVariant = Color(0xFF1C7E77),
    outline = MikuAccent.copy(alpha = 0.3f),
    outlineVariant = Color(0xFF39C5BB).copy(alpha = 0.15f),
    error = Color(0xFFFF0000),
    onError = Color.White
)

fun getAccentColor(accent: AccentColor): Color {
    return when (accent) {
        AccentColor.PINK -> AccentPink
        AccentColor.AMBER -> AccentAmber
        AccentColor.CYAN -> AccentCyan
        AccentColor.MAGENTA -> AccentMagenta
        AccentColor.GREEN -> AccentGreen
    }
}

@Composable
fun RetroBeatsTheme(
    themeVariant: ThemeType = ThemeType.DARK,
    accentColor: AccentColor = AccentColor.PINK,
    content: @Composable () -> Unit
) {
    val baseScheme = when (themeVariant) {
        ThemeType.DARK -> DarkSynthwaveColorScheme
        ThemeType.LIGHT -> LightColorScheme
        ThemeType.HACKER -> HackerColorScheme
        ThemeType.SUNSET -> SunsetColorScheme
        ThemeType.HATSUNE_MIKU -> MikuColorScheme
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
