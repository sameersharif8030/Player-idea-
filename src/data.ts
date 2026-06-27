import { Track } from './types';

export const PRELOADED_TRACKS: Track[] = [
  {
    id: 'sunset-cruise',
    title: 'Sunset Cruise',
    artist: 'Sammy Dreamer',
    album: 'Synthwave Horizons',
    duration: 180,
    coverColor: 'from-orange-500 to-pink-600',
    folder: 'Synthwave'
  },
  {
    id: 'neon-horizon',
    title: 'Neon Horizon',
    artist: 'GridRider',
    album: 'Outrun Odyssey',
    duration: 220,
    coverColor: 'from-blue-600 to-indigo-800',
    folder: 'Outrun'
  },
  {
    id: 'cyberpunk-grid',
    title: 'Cyberpunk Grid',
    artist: 'RetroOperator',
    album: 'Mega-City Echoes',
    duration: 150,
    coverColor: 'from-purple-800 to-red-700',
    folder: 'Industrial'
  },
  {
    id: 'sammys-jam',
    title: "Sammy's Jam",
    artist: 'Sammy & The Oscillators',
    album: 'Memory Lane',
    duration: 200,
    coverColor: 'from-yellow-400 to-amber-600',
    folder: 'Personal'
  }
];

export const ANDROID_STEALTH_MODE_KOTLIN_CODE = `// TapeDeck Android Music Player - Stealth Mode Implementation
// Location: com/sammy/tapedeck/service/PlaybackService.kt

package com.sammy.tapedeck.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.media3.session.MediaSessionService
import androidx.media3.session.MediaSession
import androidx.media3.common.MediaMetadata

class PlaybackService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private var isStealthModeEnabled = false

    override fun onCreate() {
        super.onCreate()
        initializeMediaSession()
    }

    /**
     * Toggles "Stealth Mode" dynamically.
     * When active:
     * 1. Lowers notification channel priority so it minimizes and hides from status bar.
     * 2. Clears system MediaMetadata so the lock screen displays NO active music overlay.
     * 3. Retains MediaSession action key listeners so bluetooth headphones (Play/Pause/Next) control playback perfectly.
     */
    fun setStealthMode(enabled: Boolean) {
        isStealthModeEnabled = enabled
        
        if (enabled) {
            // 1. Reconfigure Notification with MINIMUM importance (hides icon, silent, bottom of shade)
            configureStealthNotificationChannel()
            
            // 2. Hide media detail from the OS Lockscreen by wiping published metadata
            val emptyMetadata = MediaMetadata.Builder()
                .setTitle("") // Blank prevents lockscreen widget layout activation
                .setArtist("")
                .setAlbumTitle("")
                .build()
            mediaSession?.player?.setPlaylistMetadata(emptyMetadata)
        } else {
            // Restore normal behavior and full metadata
            restoreNormalNotificationChannel()
            restoreCurrentTrackMetadata()
        }
        
        // 3. Keep MediaSession active so MediaButtonReceiver still processes Bluetooth key events!
        mediaSession?.isActive = true 
    }

    private fun configureStealthNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channel = NotificationChannel(
                "stealth_playback_channel",
                "Silent Playback Service",
                NotificationManager.IMPORTANCE_MIN // Minimizes footprint, hides status icon & lockscreen card
            ).apply {
                lockscreenVisibility = NotificationCompat.VISIBILITY_SECRET // Hidden completely on locked device
                setShowBadge(false)
                enableLights(false)
            }
            manager.createNotificationChannel(channel)
        }
    }

    private fun restoreNormalNotificationChannel() {
        // Restore standard audio playback notification settings
    }

    private fun restoreCurrentTrackMetadata() {
        // Re-inject real track title and artist into mediaSession?.player
    }
}`;
