package com.retrobeats.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.retrobeats.data.model.Song
import com.retrobeats.ui.components.SammyDedication
import com.retrobeats.ui.theme.RetroAmber
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark

private val mockSongs = listOf(
    Song(id = 1, title = "House of Memories", artist = "Echo", album = "Echoes", albumId = 1, duration = 213000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 2, title = "Billie Jean", artist = "Echo", album = "Echoes", albumId = 1, duration = 294000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 3, title = "Sweet Dreams", artist = "Echo", album = "Echoes", albumId = 1, duration = 187000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 4, title = "Gangsta's Paradise", artist = "Echo", album = "Echoes", albumId = 1, duration = 256000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 5, title = "Smells Like Teen Spirit", artist = "Echo", album = "Echoes", albumId = 1, duration = 301000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 6, title = "Someone Like You", artist = "Echo", album = "Echoes", albumId = 1, duration = 285000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 7, title = "Without Me", artist = "Echo", album = "Echoes", albumId = 1, duration = 217000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 8, title = "For the Damaged Coda", artist = "Echo", album = "Echoes", albumId = 1, duration = 198000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 9, title = "Arcade", artist = "Echo", album = "Echoes", albumId = 1, duration = 243000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0),
    Song(id = 10, title = "No Surprises", artist = "Echo", album = "Echoes", albumId = 1, duration = 229000, path = "", contentUri = "", albumArtUri = "", size = 0, dateAdded = 0)
)

enum class SortOption(val label: String) {
    TITLE("Title"), ARTIST("Artist"), ALBUM("Album"), NEWEST("Newest"), DURATION("Duration")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: androidx.navigation.NavController
) {
    var songs by remember { mutableStateOf(mockSongs) }
    var isLoading by remember { mutableStateOf(false) }
    var currentlyPlayingIndex by remember { mutableIntStateOf(-1) }
    var isPlaying by remember { mutableStateOf(false) }
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }
    var sortMenuExpanded by remember { mutableStateOf(false) }
    var selectedSort by remember { mutableStateOf(SortOption.TITLE) }

    val tabs = listOf("Songs", "Albums", "Artists", "Folders")

    val filteredSongs = remember(searchQuery, selectedSort, songs) {
        val sorted = when (selectedSort) {
            SortOption.TITLE -> songs
            SortOption.ARTIST -> songs.sortedBy { it.artist }
            SortOption.ALBUM -> songs.sortedBy { it.album }
            SortOption.NEWEST -> songs.sortedByDescending { it.dateAdded }
            SortOption.DURATION -> songs.sortedByDescending { it.duration }
        }
        if (searchQuery.isBlank()) sorted
        else sorted.filter {
            it.title.contains(searchQuery, ignoreCase = true) ||
                    it.artist.contains(searchQuery, ignoreCase = true)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "RetroBeats",
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp
                    )
                },
                actions = {
                    Box {
                        IconButton(onClick = { sortMenuExpanded = true }) {
                            Icon(Icons.Default.Sort, contentDescription = "Sort", tint = RetroAmber)
                        }
                        DropdownMenu(
                            expanded = sortMenuExpanded,
                            onDismissRequest = { sortMenuExpanded = false }
                        ) {
                            SortOption.entries.forEach { option ->
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            option.label,
                                            color = if (option == selectedSort) RetroAmber else RetroCream
                                        )
                                    },
                                    onClick = {
                                        selectedSort = option
                                        sortMenuExpanded = false
                                    },
                                    leadingIcon = {
                                        if (option == selectedSort) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = RetroAmber)
                                        }
                                    }
                                )
                            }
                        }
                    }
                    IconButton(onClick = { navController.navigate("settings") }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = RetroCream)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = RetroAmber
                )
            )
        },
        bottomBar = {
            Column {
                // Mini player bar
                if (currentlyPlayingIndex >= 0) {
                    MiniPlayerBar(
                        song = filteredSongs.getOrNull(currentlyPlayingIndex),
                        isPlaying = isPlaying,
                        onPlayPause = { isPlaying = !isPlaying }
                    )
                }
                // Dedication
                SammyDedication(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    animationStyle = com.retrobeats.data.SammyAnimationStyle.ORBIT_TEXT,
                    textColor = RetroAmber.copy(alpha = 0.6f)
                )
            }
        },
        containerColor = MaterialTheme.colorScheme.surface
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Tab Row
            ScrollableTabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = RetroAmber,
                edgePadding = 16.dp,
                indicator = {
                    TabRowDefaults.SecondaryIndicator(
                        color = RetroAmber,
                        height = 3.dp
                    )
                },
                divider = {}
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTabIndex == index,
                        onClick = { selectedTabIndex = index },
                        text = {
                            Text(
                                title,
                                fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTabIndex == index) RetroAmber else RetroCream.copy(alpha = 0.6f)
                            )
                        }
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            // Search bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search songs...", color = RetroCream.copy(alpha = 0.4f)) },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = RetroAmber)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", tint = RetroCream.copy(alpha = 0.6f))
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = RetroAmber,
                    unfocusedBorderColor = RetroCream.copy(alpha = 0.3f),
                    focusedTextColor = RetroCream,
                    unfocusedTextColor = RetroCream,
                    cursorColor = RetroAmber
                ),
                singleLine = true
            )

            Spacer(Modifier.height(8.dp))

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = RetroAmber)
                }
            } else {
                // Song list
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    itemsIndexed(filteredSongs) { index, song ->
                        SongItem(
                            song = song,
                            isPlaying = isPlaying && currentlyPlayingIndex == index,
                            onClick = {
                                currentlyPlayingIndex = index
                                isPlaying = true
                                navController.navigate("now_playing")
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun MiniPlayerBar(
    song: Song?,
    isPlaying: Boolean,
    onPlayPause: () -> Unit
) {
    if (song == null) return

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = RetroDark,
        shadowElevation = 4.dp,
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Now playing indicator bar
            Box(
                modifier = Modifier
                    .width(3.dp)
                    .height(32.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(RetroAmber, RetroAmber.copy(alpha = 0.4f))
                        )
                    )
            )

            Spacer(Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    song.title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = RetroCream
                )
                Text(
                    song.artist,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = RetroCream.copy(alpha = 0.6f)
                )
            }

            IconButton(onClick = onPlayPause) {
                Icon(
                    if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (isPlaying) "Pause" else "Play",
                    tint = RetroAmber
                )
            }
        }
    }
}

@Composable
private fun SongItem(
    song: Song,
    isPlaying: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isPlaying)
                RetroAmber.copy(alpha = 0.15f)
            else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(RetroAmber.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.MusicNote,
                    contentDescription = null,
                    tint = RetroAmber,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    song.title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = RetroCream
                )
                Text(
                    song.artist,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = RetroCream.copy(alpha = 0.7f)
                )
            }
            Text(
                song.formattedDuration,
                style = MaterialTheme.typography.labelMedium,
                color = RetroCream.copy(alpha = 0.5f)
            )
        }
    }
}
