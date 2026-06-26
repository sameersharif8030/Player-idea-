package com.retrobeats.core.playback

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.media3.common.Player
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaSession
import com.retrobeats.MainActivity
import com.retrobeats.R
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MediaSessionManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val stealthModeManager: StealthModeManager
) {
    private var mediaSession: MediaSession? = null
    private var audioEngine: AudioEngine? = null

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "retrobeats_playback"
        const val NOTIFICATION_ID = 1001
    }

    fun initialize(session: MediaSession, engine: AudioEngine) {
        this.mediaSession = session
        this.audioEngine = engine
    }

    fun onPlayerStateChanged() {
        updateNotification()
    }

    fun updateNotification() {
        val session = mediaSession ?: return
        val engine = audioEngine ?: return

        if (!engine.isPlaying) return

        val notification = buildNotification(session)
        showNotification(notification)
    }

    private fun buildNotification(session: MediaSession): Notification {
        val currentItem = session.player.currentMediaItem
        val title = currentItem?.mediaMetadata?.title?.toString() ?: "RetroBeats"
        val artist = currentItem?.mediaMetadata?.artist?.toString() ?: ""

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ensureNotificationChannel(context)
        }

        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun showNotification(notification: Notification) {
        if (runBlocking { stealthModeManager.isStealthEnabled() }) {
            hideNotification(context)
            return
        }

        val manager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun hideNotification(context: android.content.Context) {
        val manager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.cancel(NOTIFICATION_ID)
    }

    fun hideCurrentNotification() {
        hideNotification(context)
    }

    private fun ensureNotificationChannel(context: android.content.Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Media Playback",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "NowPlaying notifications"
                setShowBadge(false)
            }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createActionIntent(context: android.content.Context, action: String, requestCode: Int): PendingIntent {
        val intent = Intent(action, null, context, PlaybackService::class.java)
        return PendingIntent.getService(
            context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
