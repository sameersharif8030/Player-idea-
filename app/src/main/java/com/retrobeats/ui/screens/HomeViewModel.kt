package com.retrobeats.ui.screens

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.retrobeats.data.MusicLibrary
import com.retrobeats.data.model.Song
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val songs: List<Song> = emptyList(),
    val isLoading: Boolean = true,
    val currentSongIndex: Int = -1,
    val isPlaying: Boolean = false,
    val searchQuery: String = "",
    val selectedTab: Int = 0
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    application: Application,
    private val musicLibrary: MusicLibrary
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadSongs()
    }

    private fun loadSongs() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            // Use mock data since MediaStore scan needs permission
            val mockSongs = getMockSongs()
            _uiState.value = _uiState.value.copy(
                songs = mockSongs,
                isLoading = false
            )
        }
    }

    fun scanLibrary() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val songs = musicLibrary.scanMusic()
            _uiState.value = _uiState.value.copy(
                songs = songs.ifEmpty { getMockSongs() },
                isLoading = false
            )
        }
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun onTabSelected(tab: Int) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun onSongSelected(index: Int) {
        _uiState.value = _uiState.value.copy(
            currentSongIndex = index,
            isPlaying = true
        )
    }

    fun togglePlayPause() {
        _uiState.value = _uiState.value.copy(isPlaying = !_uiState.value.isPlaying)
    }

    val filteredSongs: List<Song>
        get() {
            val state = _uiState.value
            val query = state.searchQuery.lowercase()
            return if (query.isBlank()) state.songs
            else state.songs.filter {
                it.title.lowercase().contains(query) ||
                it.artist.lowercase().contains(query) ||
                it.album.lowercase().contains(query)
            }
        }

    val sortedSongs: List<Song>
        get() = filteredSongs

    private fun getMockSongs(): List<Song> {
        val titles = listOf(
            "Midnight Drive" to "Synthwave Generator",
            "Neon Dreams" to "Cassette Runner",
            "Retro Funk" to "Laser King",
            "Electric Sunset" to "Pixel Drift",
            "Chrome Highway" to "Void Echo",
            "Tape Hiss Lo-Fi" to "Reel-to-Reel",
            "VHS Tracking" to "Magnetic Fields",
            "Analog Heart" to "Capacitor",
            "Warm Tubes" to "Transistor",
            "Bit Crusher" to "Lo-Fi Cartridge",
            "FM Synthesis" to "Yamaha Dreams",
            "Cassette Tape" to "1984",
            "Overdrive" to "Distortion Plus",
            "Phaser Flange" to "Chorus King",
            "Reverb Chamber" to "Spring Theory",
            "Delay Echo" to "Tape Head",
            "Wah Wah pedal" to "Funkadelic",
            "Power Chord" to "Amplifier",
            "Distortion" to "Overload",
            "Treble Boost" to "Bass Crunch",
            "Mid Scoop" to "Frequency",
            "Low Pass" to "High Cut",
            "Band Pass" to "Filter Sweep",
            "Notch Filter" to "Resonance",
            "Envelope Follower" to "Attack Decay",
            "LFO Rate" to "Vibrato",
            "Portamento" to "Glide Pitch",
            "Tremolo" to "Panning",
            "Vibrato" to "Mod Wheel",
            "Pitch Bend" to "Aftertouch"
        )
        return titles.mapIndexed { index, (title, artist) ->
            Song(
                id = index.toLong(),
                title = title,
                artist = artist,
                album = "Echo",
                albumId = 1L,
                duration = (180000L + (index * 15000L)),
                path = "/sdcard/Download/Echo/Liked Music/$title.m4a",
                contentUri = "content://media/external/audio/media/${1000 + index}",
                albumArtUri = "",
                size = 4500000L + (index * 120000L),
                dateAdded = System.currentTimeMillis() - (index * 86400000L)
            )
        }
    }
}
