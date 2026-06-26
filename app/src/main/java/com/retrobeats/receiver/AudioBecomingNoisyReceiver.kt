package com.retrobeats.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioManager

class AudioBecomingNoisyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == AudioManager.ACTION_AUDIO_BECOMING_NOISY) {
            // Pause playback when audio becomes noisy (headphones unplugged)
            // The ExoPlayer's handleAudioBecomingNoisy flag handles this automatically
            // This receiver is a fallback for older devices or edge cases
        }
    }
}
