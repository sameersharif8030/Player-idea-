package com.retrobeats.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.unit.dp
import com.retrobeats.ui.theme.RetroAmber
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun StarburstVisualizer(
    modifier: Modifier = Modifier,
    burstColor: Color = RetroAmber,
    rayCount: Int = 24
) {
    val infiniteTransition = rememberInfiniteTransition(label = "starburst")
    val time by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "time"
    )
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
    ) {
        val center = Offset(size.width / 2, size.height / 2)
        val maxRadius = size.minDimension * 0.4f
        val innerRadius = maxRadius * 0.1f

        // Draw rays
        for (i in 0 until rayCount) {
            val baseAngle = (360f / rayCount) * i
            val wobble = sin(time * 2f + i * 0.5f).toFloat() * 8f
            val angle = Math.toRadians((baseAngle + wobble).toDouble())
            val lengthVariation = (sin(time + i.toFloat() * 0.3f).toFloat() + 1f) / 2f
            val rayLength = innerRadius + (maxRadius - innerRadius) * (0.4f + 0.6f * lengthVariation * pulse)

            val endX = center.x + rayLength * cos(angle).toFloat()
            val endY = center.y + rayLength * sin(angle).toFloat()

            // Glow line
            drawLine(
                color = burstColor.copy(alpha = 0.2f),
                start = center,
                end = Offset(endX, endY),
                strokeWidth = 6f,
                cap = StrokeCap.Round
            )
            // Main line
            drawLine(
                color = burstColor,
                start = center,
                end = Offset(endX, endY),
                strokeWidth = 2f,
                cap = StrokeCap.Round
            )
        }

        // Radiating particles
        for (i in 0 until 12) {
            val angle = Math.toRadians((time * 60f + i * 30f).toDouble())
            val distance = maxRadius * 0.6f * pulse + sin(time * 3f + i).toFloat() * 10f
            val px = center.x + distance * cos(angle).toFloat()
            val py = center.y + distance * sin(angle).toFloat()
            drawCircle(
                color = burstColor.copy(alpha = (sin(time + i).toFloat() + 1f) / 2f * 0.7f),
                radius = 3f,
                center = Offset(px, py)
            )
        }

        // Central core
        drawCircle(
            color = burstColor.copy(alpha = 0.9f * pulse),
            radius = innerRadius * 1.2f,
            center = center
        )
        drawCircle(
            color = Color.White.copy(alpha = 0.7f),
            radius = innerRadius * 0.6f,
            center = center
        )
    }
}
