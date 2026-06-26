package com.retrobeats.core.playback

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.stealthDataStore: DataStore<Preferences> by preferencesDataStore(name = "retrobeats_settings")

@Singleton
class StealthModeManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val STEALTH_MODE_KEY = booleanPreferencesKey("stealth_mode_enabled")
    }

    val isStealthEnabledFlow: Flow<Boolean> = context.stealthDataStore.data.map { prefs ->
        prefs[STEALTH_MODE_KEY] ?: false
    }

    suspend fun isStealthEnabled(): Boolean {
        return context.stealthDataStore.data.map { prefs ->
            prefs[STEALTH_MODE_KEY] ?: false
        }.first()
    }

    suspend fun toggleStealthMode(): Boolean {
        var newValue = false
        context.stealthDataStore.edit { prefs ->
            newValue = !(prefs[STEALTH_MODE_KEY] ?: false)
            prefs[STEALTH_MODE_KEY] = newValue
        }
        return newValue
    }

    suspend fun setStealthMode(enabled: Boolean) {
        context.stealthDataStore.edit { prefs ->
            prefs[STEALTH_MODE_KEY] = enabled
        }
    }
}
