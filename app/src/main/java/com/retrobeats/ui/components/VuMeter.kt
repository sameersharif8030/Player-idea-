package com.retrobeats.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.retrobeats.ui.theme.RetroAmber
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark

@Composable
fun VuMeter(
    level: Float, // 0.0 to 1.0
    modifier: Modifier = Modifier,
    barCount: Int = 24,
    activeColor: Color = RetroAmber,
    inactiveColor: Color = RetroCream.copy(alpha = 0.2f)
) {
    val animatedLevel by animateFloatAsState(
        targetValue = level,
        animationSpec = spring(dampingRatio = 0.5f, stiffness = 300f),
        label = "vu_level"
    )

    Canvas(modifier = modifier) {
        val barWidth = size.width / (barCount * 2 - 1)
        val maxHeight = size.height * 0.9f
        val activeBarCount = (animatedLevel * barCount).toInt().coerceIn(0, barCount)

        for (i in 0 until barCount) {
            val x = i * barWidth * 2
            val barHeight = maxHeight * (0.3f + 0.7f * (i.toFloat() / barCount))
            val color = if (i < activeBarCount) {
                if (i > barCount * 0.8f) Color(0xFFD32F2F) // Red at top
                else if (i > barCount * 0.6f) Color(0xFFFF6D00) // Orange
                else activeColor
            } else inactiveColor

            drawRect(
                color = color,
                topLeft = Offset(x, size.height - barHeight),
                size = androidx.compose.ui.geometry.Size(barWidth, barHeight)
            )
        }
    }
}
