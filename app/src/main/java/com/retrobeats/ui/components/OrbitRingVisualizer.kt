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
fun OrbitRingVisualizer(
    modifier: Modifier = Modifier,
    ringColor: Color = RetroAmber,
    particleColor: Color = RetroAmber
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orbit_ring")
    val rotation1 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation1"
    )
    val rotation2 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = -360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 6000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation2"
    )
    val rotation3 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation3"
    )
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = FastOutSlowInEasing),
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
        val baseRadius = size.minDimension * 0.3f * pulse

        // Draw concentric rings
        for (ring in 0 until 3) {
            val ringRadius = baseRadius * (0.6f + ring * 0.2f)
            val ringAlpha = 0.4f - ring * 0.1f
            drawCircle(
                color = ringColor.copy(alpha = ringAlpha),
                radius = ringRadius,
                center = center,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2f)
            )
        }

        // Orbiting particles on ring 1
        for (i in 0 until 5) {
            val angle = Math.toRadians((rotation1 + i * 72.0))
            val radius = baseRadius * 0.8f
            val px = center.x + radius * cos(angle).toFloat()
            val py = center.y + radius * sin(angle).toFloat()
            drawCircle(
                color = particleColor,
                radius = 6f,
                center = Offset(px, py)
            )
            // Glow
            drawCircle(
                color = particleColor.copy(alpha = 0.3f),
                radius = 14f,
                center = Offset(px, py)
            )
        }

        // Ring 2 particles (opposite direction)
        for (i in 0 until 3) {
            val angle = Math.toRadians((rotation2 + i * 120.0))
            val radius = baseRadius * 1.1f
            val px = center.x + radius * cos(angle).toFloat()
            val py = center.y + radius * sin(angle).toFloat()
            drawCircle(
                color = particleColor.copy(alpha = 0.8f),
                radius = 4f,
                center = Offset(px, py)
            )
            drawCircle(
                color = particleColor.copy(alpha = 0.2f),
                radius = 10f,
                center = Offset(px, py)
            )
        }

        // Center core
        drawCircle(
            color = particleColor.copy(alpha = 0.7f),
            radius = baseRadius * 0.15f,
            center = center
        )
        drawCircle(
            color = Color.White.copy(alpha = 0.5f),
            radius = baseRadius * 0.08f,
            center = center
        )
    }
}
