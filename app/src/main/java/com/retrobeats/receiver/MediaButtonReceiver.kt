package com.retrobeats.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.view.KeyEvent
import com.retrobeats.core.playback.PlaybackService

class MediaButtonReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_MEDIA_BUTTON) {
            val keyEvent = intent.getParcelableExtra<KeyEvent>(Intent.EXTRA_KEY_EVENT)
            if (keyEvent != null && keyEvent.action == KeyEvent.ACTION_DOWN) {
                when (keyEvent.keyCode) {
                    KeyEvent.KEYCODE_MEDIA_PLAY,
                    KeyEvent.KEYCODE_MEDIA_PAUSE,
                    KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
                    KeyEvent.KEYCODE_HEADSETHOOK -> {
                        val serviceIntent = Intent(context, PlaybackService::class.java)
                        serviceIntent.action = Intent.ACTION_MEDIA_BUTTON
                        serviceIntent.putExtra(Intent.EXTRA_KEY_EVENT, keyEvent)
                        context.startService(serviceIntent)
                    }
                }
            }
        }
    }
}
