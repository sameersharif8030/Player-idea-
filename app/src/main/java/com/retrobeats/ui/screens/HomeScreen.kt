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
import androidx.hilt.navigation.compose.hiltViewModel
import com.retrobeats.data.model.Song
import com.retrobeats.ui.components.SammyDedication
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark
import com.retrobeats.ui.theme.SynthwavePink
import com.retrobeats.ui.theme.SynthwavePurple

enum class SortOption(val label: String) {
    TITLE("Title"), ARTIST("Artist"), ALBUM("Album"), NEWEST("Newest"), DURATION("Duration")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: androidx.navigation.NavController,
    viewModel: PlayerViewModel = hiltViewModel()
) {
    val playerState by viewModel.state.collectAsState()
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }
    var sortMenuExpanded by remember { mutableStateOf(false) }
    var selectedSort by remember { mutableStateOf(SortOption.TITLE) }

    val tabs = listOf("Songs", "Albums", "Artists", "Folders")

    val filteredSongs = remember(searchQuery, selectedSort, playerState.songs) {
        val sorted = when (selectedSort) {
            SortOption.TITLE -> playerState.songs
            SortOption.ARTIST -> playerState.songs.sortedBy { it.artist }
            SortOption.ALBUM -> playerState.songs.sortedBy { it.album }
            SortOption.NEWEST -> playerState.songs.sortedByDescending { it.dateAdded }
            SortOption.DURATION -> playerState.songs.sortedByDescending { it.duration }
        }
        if (searchQuery.isBlank()) sorted
        else sorted.filter {
            it.title.contains(searchQuery, ignoreCase = true) ||
                    it.artist.contains(searchQuery, ignoreCase = true)
        }
    }

    // Load songs on first composition
    LaunchedEffect(Unit) {
        viewModel.loadSongs()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "TapeDeck",
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp
                    )
                },
                actions = {
                    Box {
                        IconButton(onClick = { sortMenuExpanded = true }) {
                            Icon(Icons.Default.Sort, contentDescription = "Sort", tint = SynthwavePink)
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
                                            color = if (option == selectedSort) SynthwavePink else RetroCream
                                        )
                                    },
                                    onClick = {
                                        selectedSort = option
                                        sortMenuExpanded = false
                                    },
                                    leadingIcon = {
                                        if (option == selectedSort) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = SynthwavePink)
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
                    titleContentColor = SynthwavePink
                )
            )
        },
        bottomBar = {
            Column {
                // Mini player bar
                if (playerState.currentSong != null) {
                    MiniPlayerBar(
                        song = playerState.currentSong!!,
                        isPlaying = playerState.isPlaying,
                        onPlayPause = { viewModel.playPause() },
                        onClick = { navController.navigate("now_playing") }
                    )
                }
                // Dedication
                SammyDedication(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    animationStyle = com.retrobeats.data.SammyAnimationStyle.ORBIT_TEXT,
                    textColor = SynthwavePurple.copy(alpha = 0.6f)
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
                contentColor = SynthwavePink,
                edgePadding = 16.dp,
                indicator = {
                    TabRowDefaults.SecondaryIndicator(
                        color = SynthwavePink,
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
                                color = if (selectedTabIndex == index) SynthwavePink else RetroCream.copy(alpha = 0.6f)
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
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = SynthwavePink)
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
                    focusedBorderColor = SynthwavePink,
                    unfocusedBorderColor = RetroCream.copy(alpha = 0.3f),
                    focusedTextColor = RetroCream,
                    unfocusedTextColor = RetroCream,
                    cursorColor = SynthwavePink
                ),
                singleLine = true
            )

            Spacer(Modifier.height(8.dp))

            if (playerState.isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = SynthwavePink)
                }
            } else if (filteredSongs.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.MusicOff,
                            contentDescription = null,
                            tint = RetroCream.copy(alpha = 0.3f),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(Modifier.height(16.dp))
                        Text(
                            "No music found",
                            color = RetroCream.copy(alpha = 0.5f),
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Text(
                            "Add music to your device or tap Scan Library",
                            color = RetroCream.copy(alpha = 0.3f),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            } else {
                // Song list
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    itemsIndexed(filteredSongs) { index, song ->
                        val actualIndex = playerState.songs.indexOf(song)
                        SongItem(
                            song = song,
                            isPlaying = playerState.isPlaying && playerState.currentIndex == actualIndex,
                            onClick = {
                                viewModel.playSong(actualIndex)
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
    song: Song,
    isPlaying: Boolean,
    onPlayPause: () -> Unit,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
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
                            colors = listOf(SynthwavePink, SynthwavePurple)
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
                    tint = SynthwavePink
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
                SynthwavePink.copy(alpha = 0.15f)
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
                    .background(SynthwavePurple.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.MusicNote,
                    contentDescription = null,
                    tint = SynthwavePink,
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
