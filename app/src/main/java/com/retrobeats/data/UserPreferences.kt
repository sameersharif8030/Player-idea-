package com.retrobeats.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.userPrefsDataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

@Singleton
class UserPreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val THEME_VARIANT_KEY = stringPreferencesKey("theme_variant")
        private val ACCENT_COLOR_KEY = stringPreferencesKey("accent_color")
        private val VISUALIZER_STYLE_KEY = stringPreferencesKey("visualizer_style")
        private val SAMMY_ANIMATION_KEY = stringPreferencesKey("sammy_animation")
        private val SORT_ORDER_KEY = stringPreferencesKey("sort_order")
    }

    val themeVariantFlow: Flow<ThemeVariant> = context.userPrefsDataStore.data.map { prefs ->
        when (prefs[THEME_VARIANT_KEY]) {
            "CASSETTE_DECK" -> ThemeVariant.CASSETTE_DECK
            "CRT_TERMINAL" -> ThemeVariant.CRT_TERMINAL
            else -> ThemeVariant.DARK_SYNTHWAVE
        }
    }

    val accentColorFlow: Flow<AccentColor> = context.userPrefsDataStore.data.map { prefs ->
        when (prefs[ACCENT_COLOR_KEY]) {
            "CYAN" -> AccentColor.CYAN
            "MAGENTA" -> AccentColor.MAGENTA
            "GREEN" -> AccentColor.GREEN
            else -> AccentColor.AMBER
        }
    }

    val visualizerStyleFlow: Flow<VisualizerStyle> = context.userPrefsDataStore.data.map { prefs ->
        when (prefs[VISUALIZER_STYLE_KEY]) {
            "OSCILLOSCOPE" -> VisualizerStyle.OSCILLOSCOPE
            "ORBIT_RING" -> VisualizerStyle.ORBIT_RING
            "STARBURST" -> VisualizerStyle.STARBURST
            else -> VisualizerStyle.NEON_BARS
        }
    }

    val sammyAnimationFlow: Flow<SammyAnimationStyle> = context.userPrefsDataStore.data.map { prefs ->
        when (prefs[SAMMY_ANIMATION_KEY]) {
            "ORBIT_TEXT" -> SammyAnimationStyle.ORBIT_TEXT
            "FLASH_STAGGER" -> SammyAnimationStyle.FLASH_STAGGER
            else -> SammyAnimationStyle.BLUR_MORPH
        }
    }

    suspend fun setThemeVariant(variant: ThemeVariant) {
        context.userPrefsDataStore.edit { prefs ->
            prefs[THEME_VARIANT_KEY] = variant.name
        }
    }

    suspend fun setAccentColor(color: AccentColor) {
        context.userPrefsDataStore.edit { prefs ->
            prefs[ACCENT_COLOR_KEY] = color.name
        }
    }

    suspend fun setVisualizerStyle(style: VisualizerStyle) {
        context.userPrefsDataStore.edit { prefs ->
            prefs[VISUALIZER_STYLE_KEY] = style.name
        }
    }

    suspend fun setSammyAnimation(style: SammyAnimationStyle) {
        context.userPrefsDataStore.edit { prefs ->
            prefs[SAMMY_ANIMATION_KEY] = style.name
        }
    }
}
