package com.retrobeats.di

import android.content.Context
import androidx.room.Room
import com.retrobeats.core.playback.AudioEngine
import com.retrobeats.core.playback.AudioFocusManager
import com.retrobeats.core.playback.StealthModeManager
import com.retrobeats.data.MusicLibrary
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAudioEngine(@ApplicationContext context: Context): AudioEngine {
        return AudioEngine(context)
    }

    @Provides
    @Singleton
    fun provideAudioFocusManager(audioEngine: AudioEngine): AudioFocusManager {
        return AudioFocusManager(audioEngine)
    }

    @Provides
    @Singleton
    fun provideStealthModeManager(@ApplicationContext context: Context): StealthModeManager {
        return StealthModeManager(context)
    }

    @Provides
    @Singleton
    fun provideMusicLibrary(@ApplicationContext context: Context): MusicLibrary {
        return MusicLibrary(context)
    }
}
