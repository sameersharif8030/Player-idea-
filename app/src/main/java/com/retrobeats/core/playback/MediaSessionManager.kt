package com.retrobeats.core.playback

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
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
        val player = session.player
        val currentItem = player.currentMediaItem
        val title = currentItem?.mediaMetadata?.title?.toString() ?: "TapeDeck"
        val artist = currentItem?.mediaMetadata?.artist?.toString() ?: ""

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ensureNotificationChannel(context)
        }

        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val playPauseTitle = if (player.isPlaying) "Pause" else "Play"
        val playPauseIntent = Intent(context, PlaybackService::class.java).apply {
            action = if (player.isPlaying) "ACTION_PAUSE" else "ACTION_PLAY"
        }
        val playPausePI = PendingIntent.getService(
            context, 1, playPauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val nextIntent = Intent(context, PlaybackService::class.java).apply {
            action = "ACTION_NEXT"
        }
        val nextPI = PendingIntent.getService(
            context, 2, nextIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val prevIntent = Intent(context, PlaybackService::class.java).apply {
            action = "ACTION_PREV"
        }
        val prevPI = PendingIntent.getService(
            context, 3, prevIntent,
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
            .setOngoing(player.isPlaying)
            .addAction(R.drawable.ic_launcher_foreground, "Previous", prevPI)
            .addAction(R.drawable.ic_launcher_foreground, playPauseTitle, playPausePI)
            .addAction(R.drawable.ic_launcher_foreground, "Next", nextPI)
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
                description = "TapeDeck playback controls"
                setShowBadge(false)
            }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
