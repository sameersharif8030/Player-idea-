package com.retrobeats.core.playback

import android.content.Context
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AudioEngine @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var exoPlayer: ExoPlayer? = null

    @androidx.annotation.OptIn(UnstableApi::class)
    fun getPlayer(): ExoPlayer {
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(context)
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
                        .setUsage(C.USAGE_MEDIA)
                        .build(),
                    true
                )
                .setHandleAudioBecomingNoisy(true)
                .build()
        }
        return exoPlayer!!
    }

    fun release() {
        exoPlayer?.release()
        exoPlayer = null
    }

    fun play() {
        getPlayer().play()
    }

    fun pause() {
        getPlayer().pause()
    }

    fun stop() {
        getPlayer().stop()
    }

    fun seekTo(positionMs: Long) {
        getPlayer().seekTo(positionMs)
    }

    fun setMediaItem(uri: String) {
        val mediaItem = androidx.media3.common.MediaItem.fromUri(uri)
        getPlayer().setMediaItem(mediaItem)
        getPlayer().prepare()
    }

    fun setMediaItems(uris: List<String>) {
        val mediaItems = uris.map { androidx.media3.common.MediaItem.fromUri(it) }
        getPlayer().setMediaItems(mediaItems)
        getPlayer().prepare()
    }

    val currentPosition: Long
        get() = getPlayer().currentPosition

    val duration: Long
        get() = getPlayer().duration.coerceAtLeast(0L)

    val isPlaying: Boolean
        get() = getPlayer().isPlaying

    val currentMediaItemIndex: Int
        get() = getPlayer().currentMediaItemIndex
}
