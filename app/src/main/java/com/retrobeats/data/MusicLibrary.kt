package com.retrobeats.data

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.annotation.RequiresApi
import com.retrobeats.data.model.Song
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MusicLibrary @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val selectedUris = mutableListOf<Uri>()

    // Known directories to scan (in priority order)
    private val echoCustomPaths = listOf(
        "/sdcard/Download/Echo/Liked Music/",
        "/storage/emulated/0/Download/Echo/Liked Music/sdcard/Download/Echo/Liked Music/"
    )



    suspend fun scanMusic(): List<Song> = withContext(Dispatchers.IO) {
        val songs = mutableListOf<Song>()

        // 1. Try direct file scanning first (fast, reliable, no indexing needed)
        val directSongs = scanEchoDirectories()
        songs.addAll(directSongs)

        // 2. Also query MediaStore for anything else not in the direct directories
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val mediaStoreSongs = scanMediaStore()
            songs.addAll(mediaStoreSongs)
        }

        // 3. Include manually selected URIs
        for ((index, uri) in selectedUris.withIndex()) {
            val song = scanUri(uri, index)
            if (song != null) songs.add(song)
        }

        songs
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun scanMediaStore(): List<Song> {
        val songs = mutableListOf<Song>()
        val collection = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)

        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.ALBUM_ID,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.DATE_ADDED
        )

        val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
        val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"

        context.contentResolver.query(
            collection,
            projection,
            selection,
            null,
            sortOrder
        )?.use { cursor ->
            val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val albumIdColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
            val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
            val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
            val dateAddedColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)

            while (cursor.moveToNext()) {
                val id = cursor.getLong(idColumn)
                val title = cursor.getString(titleColumn) ?: "Unknown"
                val artist = cursor.getString(artistColumn) ?: "Unknown Artist"
                val album = cursor.getString(albumColumn) ?: "Unknown Album"
                val albumId = cursor.getLong(albumIdColumn)
                val duration = cursor.getLong(durationColumn)
                val data = cursor.getString(dataColumn) ?: ""
                val size = cursor.getLong(sizeColumn)
                val dateAdded = cursor.getLong(dateAddedColumn)

                val contentUri = ContentUris.withAppendedId(
                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id
                ).toString()

                val albumArtUri = ContentUris.withAppendedId(
                    Uri.parse("content://media/external/audio/albumart"),
                    albumId
                ).toString()

                songs.add(
                    Song(
                        id = id,
                        title = title,
                        artist = artist,
                        album = album,
                        albumId = albumId,
                        duration = duration,
                        path = data,
                        contentUri = contentUri,
                        albumArtUri = albumArtUri,
                        size = size,
                        dateAdded = dateAdded
                    )
                )
            }
        }
        return songs
    }

    /**
     * Direct file-based scanner — bypasses MediaStore and walks the known directory.
     * This ensures files in "Liked Music" are found regardless of indexing status.
     */
    private fun scanEchoDirectories(): List<Song> {
        val songs = mutableListOf<Song>()

        for (path in echoCustomPaths) {
            val dir = java.io.File(path)
            if (!dir.exists() || !dir.canRead()) continue

            val files = dir.listFiles() ?: continue
            for ((index, file) in files.withIndex()) {
                if (!file.isFile) continue
                if (!isAudioFile(file.name)) continue

                val contentUri = Uri.fromFile(file).toString()
                val song = Song(
                    id = 90000L + index + (path.hashCode() and 0xFFF),
                    title = file.nameWithoutExtension.trim(),
                    artist = "Echo",
                    album = "Liked Music",
                    albumId = 42L + (path.hashCode() and 0xF),
                    duration = getAudioDuration(file),
                    path = file.absolutePath,
                    contentUri = contentUri,
                    albumArtUri = "",
                    size = file.length(),
                    dateAdded = file.lastModified()
                )
                songs.add(song)
            }
        }
        return songs
    }

    private fun isAudioFile(filename: String): Boolean {
        val ext = filename.substringAfterLast('.', "").lowercase()
        return ext in setOf("mp3", "m4a", "aac", "flac", "wav", "ogg", "opus", "wma", "mid", "midi")
    }

    private fun getAudioDuration(file: java.io.File): Long {
        return try {
            val retriever = android.media.MediaMetadataRetriever()
            retriever.setDataSource(file.absolutePath)
            val durationStr = retriever.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_DURATION)
            retriever.release()
            (durationStr?.toLongOrNull() ?: 0L)
        } catch (e: Exception) {
            0L
        }
    }

    fun scanFromUris(uris: List<Uri>): List<Song> {
        selectedUris.addAll(uris)
        return uris.mapIndexed { index, uri -> scanUri(uri, index) }.filterNotNull()
    }

    private fun scanUri(uri: Uri, index: Int): Song? {
        return try {
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val titleIdx = cursor.getColumnIndex(MediaStore.Audio.Media.TITLE)
                    val artistIdx = cursor.getColumnIndex(MediaStore.Audio.Media.ARTIST)
                    val albumIdx = cursor.getColumnIndex(MediaStore.Audio.Media.ALBUM)
                    val durationIdx = cursor.getColumnIndex(MediaStore.Audio.Media.DURATION)

                    val title = if (titleIdx >= 0) cursor.getString(titleIdx) ?: "Unknown" else "Unknown"
                    val artist = if (artistIdx >= 0) cursor.getString(artistIdx) ?: "Unknown Artist" else "Unknown Artist"
                    val album = if (albumIdx >= 0) cursor.getString(albumIdx) ?: "Unknown Album" else "Unknown Album"
                    val duration = if (durationIdx >= 0) cursor.getLong(durationIdx) else 0L

                    Song(
                        id = 100000L + index,
                        title = title,
                        artist = artist,
                        album = album,
                        albumId = 0L,
                        duration = duration,
                        path = uri.toString(),
                        contentUri = uri.toString(),
                        albumArtUri = "",
                        size = 0L,
                        dateAdded = System.currentTimeMillis()
                    )
                } else null
            }
        } catch (e: Exception) {
            null
        }
    }

    fun addSelectedUri(uri: Uri) {
        selectedUris.add(uri)
    }

    fun getSelectedUris(): List<Uri> = selectedUris.toList()

    fun getAlbumArtUri(albumId: Long): Uri {
        return ContentUris.withAppendedId(
            Uri.parse("content://media/external/audio/albumart"),
            albumId
        )
    }
}
