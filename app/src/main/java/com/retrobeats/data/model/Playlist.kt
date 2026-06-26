package com.retrobeats.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "playlists")
data class Playlist(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val description: String = "",
    val songIds: String = "", // Comma-separated list of song IDs
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    fun getSongIdList(): List<Long> {
        return if (songIds.isBlank()) {
            emptyList()
        } else {
            songIds.split(",").mapNotNull { it.trim().toLongOrNull() }
        }
    }

    companion object {
        fun songIdsToString(ids: List<Long>): String {
            return ids.joinToString(",")
        }
    }
}
