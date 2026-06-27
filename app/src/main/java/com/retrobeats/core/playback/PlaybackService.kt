package com.retrobeats.core.playback

import android.content.Intent
import androidx.media3.common.Player
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class PlaybackService : MediaSessionService() {

    @Inject
    lateinit var audioEngine: AudioEngine

    @Inject
    lateinit var mediaSessionManager: MediaSessionManager

    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val player = audioEngine.getPlayer().apply {
            addListener(object : Player.Listener {
                override fun onPlayWhenReadyChanged(playWhenReady: Boolean, reason: Int) {
                    mediaSessionManager.onPlayerStateChanged()
                }

                override fun onMediaItemTransition(mediaItem: androidx.media3.common.MediaItem?, reason: Int) {
                    mediaSessionManager.onPlayerStateChanged()
                }
            })
        }

        // MediaSession handles Bluetooth/headphone controls automatically
        // via the system MediaButtonDispatcher. No custom callback needed.
        mediaSession = MediaSession.Builder(this, player).build()
        mediaSessionManager.initialize(mediaSession!!, audioEngine)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.action?.let { action ->
            val player = audioEngine.getPlayer()
            when (action) {
                "ACTION_PLAY" -> {
                    player.play()
                    mediaSessionManager.onPlayerStateChanged()
                }
                "ACTION_PAUSE" -> {
                    player.pause()
                    mediaSessionManager.onPlayerStateChanged()
                }
                "ACTION_NEXT" -> {
                    if (player.hasNextMediaItem()) {
                        player.seekToNextMediaItem()
                        player.play()
                    }
                }
                "ACTION_PREV" -> {
                    if (player.hasPreviousMediaItem()) {
                        player.seekToPreviousMediaItem()
                        player.play()
                    }
                }
                "stop" -> {
                    player.stop()
                }
            }
        }
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        val player = mediaSession?.player
        if (player != null && !player.playWhenReady) {
            stopSelf()
        }
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
        }
        mediaSession = null
        super.onDestroy()
    }
}
