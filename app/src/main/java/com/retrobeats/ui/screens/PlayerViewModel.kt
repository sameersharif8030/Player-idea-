package com.retrobeats.ui.screens

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.retrobeats.core.playback.AudioEngine
import com.retrobeats.data.MusicLibrary
import com.retrobeats.data.model.Song
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PlayerState(
    val songs: List<Song> = emptyList(),
    val currentIndex: Int = -1,
    val isPlaying: Boolean = false,
    val currentPosition: Long = 0L,
    val duration: Long = 0L,
    val isShuffle: Boolean = false,
    val repeatMode: Int = 0, // 0=off, 1=all, 2=one
    val isLoading: Boolean = false
) {
    val currentSong: Song? get() = songs.getOrNull(currentIndex)
}

@HiltViewModel
class PlayerViewModel @Inject constructor(
    private val audioEngine: AudioEngine,
    private val musicLibrary: MusicLibrary
) : ViewModel() {

    private val _state = MutableStateFlow(PlayerState())
    val state: StateFlow<PlayerState> = _state.asStateFlow()

    private var originalQueue: List<Song> = emptyList()

    init {
        // Monitor playback state
        viewModelScope.launch {
            while (true) {
                val player = audioEngine.getPlayer()
                _state.value = _state.value.copy(
                    isPlaying = player.isPlaying,
                    currentPosition = player.currentPosition,
                    duration = player.duration.coerceAtLeast(0L),
                    currentIndex = player.currentMediaItemIndex
                )
                kotlinx.coroutines.delay(500)
            }
        }
    }

    fun loadSongs() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val songs = musicLibrary.scanMusic()
            originalQueue = songs
            _state.value = _state.value.copy(songs = songs, isLoading = false)
        }
    }

    fun playSong(index: Int) {
        val songs = _state.value.songs
        if (index < 0 || index >= songs.size) return

        val uris = songs.map { it.contentUri }
        audioEngine.setMediaItems(uris)
        audioEngine.seekTo(0L)
        // Seek to correct index by setting media items then moving to index
        val player = audioEngine.getPlayer()
        // ExoPlayer should already be prepared with all items, just play at index
        player.seekToDefaultPosition(index)
        player.play()

        _state.value = _state.value.copy(
            currentIndex = index,
            isPlaying = true
        )
    }

    fun playPause() {
        val player = audioEngine.getPlayer()
        if (player.isPlaying) {
            player.pause()
        } else {
            player.play()
        }
    }

    fun seekTo(positionMs: Long) {
        audioEngine.seekTo(positionMs)
    }

    fun skipNext() {
        val current = _state.value.currentIndex
        val songs = _state.value.songs
        if (songs.isEmpty()) return

        val next = if (_state.value.isShuffle) {
            (0 until songs.size).random()
        } else {
            when {
                current + 1 < songs.size -> current + 1
                _state.value.repeatMode == 1 -> 0
                else -> return
            }
        }
        playSong(next)
    }

    fun skipPrevious() {
        val current = _state.value.currentIndex
        val songs = _state.value.songs
        if (songs.isEmpty()) return

        val prev = when {
            current - 1 >= 0 -> current - 1
            _state.value.repeatMode == 1 -> songs.size - 1
            else -> return
        }
        playSong(prev)
    }

    fun toggleShuffle() {
        _state.value = _state.value.copy(isShuffle = !_state.value.isShuffle)
    }

    fun toggleRepeat() {
        _state.value = _state.value.copy(repeatMode = (_state.value.repeatMode + 1) % 3)
    }

    fun addSongs(uris: List<Uri>) {
        viewModelScope.launch {
            val newSongs = musicLibrary.scanFromUris(uris)
            val updatedSongs = _state.value.songs + newSongs
            originalQueue = updatedSongs
            _state.value = _state.value.copy(songs = updatedSongs)
        }
    }
}
