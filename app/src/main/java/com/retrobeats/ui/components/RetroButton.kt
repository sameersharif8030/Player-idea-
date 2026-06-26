package com.retrobeats.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CutCornerShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.retrobeats.ui.theme.RetroAmber
import com.retrobeats.ui.theme.RetroAmberDark
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark

@Composable
fun RetroButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    color: Color = RetroAmber,
    textColor: Color = RetroDark
) {
    Box(
        modifier = modifier
            .shadow(4.dp, CutCornerShape(4.dp))
            .clip(CutCornerShape(4.dp))
            .background(
                if (enabled) Brush.linearGradient(
                    colors = listOf(color, color.copy(alpha = 0.8f), color)
                ) else Brush.linearGradient(
                    colors = listOf(Color.Gray, Color.Gray.copy(alpha = 0.7f))
                )
            )
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 24.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            color = if (enabled) textColor else Color.DarkGray
        )
    }
}
