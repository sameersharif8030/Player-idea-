package com.retrobeats.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.retrobeats.ui.theme.RetroAmber
import com.retrobeats.ui.theme.RetroCream
import com.retrobeats.ui.theme.RetroDark
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun CassetteReel(
    modifier: Modifier = Modifier,
    isSpinning: Boolean = false,
    reelColor: Color = RetroDark,
    tapeColor: Color = RetroCream.copy(alpha = 0.8f),
    hubColor: Color = RetroAmber
) {
    val infiniteTransition = rememberInfiniteTransition(label = "reel_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val currentRotation = if (isSpinning) rotation else 0f

    Canvas(modifier = modifier.size(200.dp)) {
        val center = Offset(size.width / 2, size.height / 2)
        val outerRadius = size.minDimension / 2 * 0.9f
        val innerRadius = size.minDimension / 2 * 0.3f
        val hubRadius = size.minDimension / 2 * 0.12f

        // Outer reel circle
        drawCircle(
            color = reelColor,
            radius = outerRadius,
            center = center
        )

        // Tape wound around (slightly lighter ring)
        drawCircle(
            color = tapeColor.copy(alpha = 0.3f),
            radius = outerRadius * 0.85f,
            center = center,
            style = Stroke(width = outerRadius * 0.2f)
        )

        // Inner circle
        drawCircle(
            color = reelColor,
            radius = innerRadius,
            center = center
        )

        // Spokes (3 of them)
        for (i in 0 until 3) {
            val angle = Math.toRadians((currentRotation + i * 120.0))
            val spokeStart = Offset(
                center.x + (hubRadius * 1.2f) * cos(angle).toFloat(),
                center.y + (hubRadius * 1.2f) * sin(angle).toFloat()
            )
            val spokeEnd = Offset(
                center.x + (innerRadius * 0.8f) * cos(angle).toFloat(),
                center.y + (innerRadius * 0.8f) * sin(angle).toFloat()
            )
            drawLine(
                color = hubColor,
                start = spokeStart,
                end = spokeEnd,
                strokeWidth = 4.dp.toPx(),
                cap = StrokeCap.Round
            )
        }

        // Center hub
        drawCircle(
            color = hubColor,
            radius = hubRadius,
            center = center
        )

        // Center hole
        drawCircle(
            color = Color.Black,
            radius = hubRadius * 0.4f,
            center = center
        )

        // Teeth on the hub (6 teeth)
        for (i in 0 until 6) {
            val angle = Math.toRadians((currentRotation * 2 + i * 60.0))
            val toothX = center.x + hubRadius * 0.7f * cos(angle).toFloat()
            val toothY = center.y + hubRadius * 0.7f * sin(angle).toFloat()
            drawCircle(
                color = hubColor,
                radius = 3.dp.toPx(),
                center = Offset(toothX, toothY)
            )
        }
    }
}
