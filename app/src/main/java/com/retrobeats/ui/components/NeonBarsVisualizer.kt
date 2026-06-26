package com.retrobeats.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.retrobeats.ui.theme.RetroAmber
import kotlin.math.sin

@Composable
fun NeonBarsVisualizer(
    modifier: Modifier = Modifier,
    barCount: Int = 32,
    activeColor: Color = RetroAmber,
    inactiveColor: Color = Color(0x33FFFFFF)
) {
    val infiniteTransition = rememberInfiniteTransition(label = "neon_bars")
    val time by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "time"
    )

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
    ) {
        val barWidth = size.width / (barCount * 1.8f)
        val gap = barWidth * 0.8f

        for (i in 0 until barCount) {
            val phase = (i.toFloat() / barCount) * 6.28f
            val heightFraction = (sin(time + phase).toFloat() + 1f) / 2f
            val barHeight = size.height * (0.15f + 0.85f * heightFraction)

            val x = i * (barWidth + gap)
            val y = size.height - barHeight

            // Glow effect (larger, semi-transparent)
            drawRect(
                color = activeColor.copy(alpha = 0.3f * heightFraction),
                topLeft = Offset(x - 2f, y - 4f),
                size = Size(barWidth + 4f, barHeight + 8f)
            )

            // Main bar
            drawRect(
                brush = Brush.verticalGradient(
                    colors = listOf(activeColor, activeColor.copy(alpha = 0.6f)),
                    startY = y,
                    endY = size.height
                ),
                topLeft = Offset(x, y),
                size = Size(barWidth, barHeight)
            )
        }
    }
}
