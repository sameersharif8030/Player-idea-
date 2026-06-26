package com.retrobeats.core.playback

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AudioFocusManager @Inject constructor(
    private val audioEngine: AudioEngine
) {
    private var audioManager: AudioManager? = null
    private var hasFocus = false
    private var playOnFocusGain = false
    private var currentVolume = 1.0f

    private val noisyReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == AudioManager.ACTION_AUDIO_BECOMING_NOISY) {
                pausePlayback()
            }
        }
    }

    fun initialize(context: Context) {
        audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }

    fun requestFocus(): Boolean {
        val manager = audioManager ?: return false
        val result = manager.requestAudioFocus(
            focusChangeListener,
            AudioManager.STREAM_MUSIC,
            AudioManager.AUDIOFOCUS_GAIN
        )
        hasFocus = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
        return hasFocus
    }

    fun abandonFocus() {
        val manager = audioManager ?: return
        manager.abandonAudioFocus(focusChangeListener)
        hasFocus = false
    }

    fun pausePlayback() {
        if (audioEngine.isPlaying) {
            audioEngine.pause()
            playOnFocusGain = true
        }
    }

    fun resumePlayback() {
        if (playOnFocusGain && hasFocus) {
            audioEngine.play()
            playOnFocusGain = false
        }
    }

    fun duckVolume() {
        currentVolume = 0.2f
        // ExoPlayer handles ducking via AudioAttributes
    }

    fun restoreVolume() {
        currentVolume = 1.0f
    }

    fun registerNoisyReceiver(context: Context) {
        val filter = IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY)
        context.registerReceiver(noisyReceiver, filter)
    }

    fun unregisterNoisyReceiver(context: Context) {
        try {
            context.unregisterReceiver(noisyReceiver)
        } catch (_: Exception) {
            // Already unregistered
        }
    }

    private val focusChangeListener = AudioManager.OnAudioFocusChangeListener { focusChange ->
        when (focusChange) {
            AudioManager.AUDIOFOCUS_GAIN -> {
                hasFocus = true
                resumePlayback()
                restoreVolume()
            }
            AudioManager.AUDIOFOCUS_LOSS -> {
                hasFocus = false
                playOnFocusGain = false
                pausePlayback()
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                pausePlayback()
                playOnFocusGain = true
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> {
                duckVolume()
            }
        }
    }
}
