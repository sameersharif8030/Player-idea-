package com.retrobeats.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import kotlin.math.sin
import kotlin.math.cos

@Composable
fun OscilloscopeVisualizer(
    modifier: Modifier = Modifier,
    waveColor: Color = Color(0xFF00FF00),
    glowColor: Color = Color(0x6600FF00)
) {
    val infiniteTransition = rememberInfiniteTransition(label = "oscilloscope")
    val time by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "time"
    )

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
    ) {
        val centerY = size.height / 2
        val amplitude = size.height * 0.35f
        val points = 120
        val path = androidx.compose.ui.graphics.Path()

        for (i in 0..points) {
            val x = (i.toFloat() / points) * size.width
            val phase = (i.toFloat() / points) * 6.28f * 2f
            val y = centerY + amplitude * (
                sin(time * 2f + phase).toFloat() * 0.6f +
                sin(time + phase * 0.5f).toFloat() * 0.3f +
                cos(time * 1.5f + phase * 1.3f).toFloat() * 0.1f
            )

            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }

        // Draw glow (thicker)
        drawPath(
            path = path,
            color = glowColor,
            style = Stroke(width = 6f, cap = StrokeCap.Round)
        )

        // Draw main line
        drawPath(
            path = path,
            color = waveColor,
            style = Stroke(width = 2f, cap = StrokeCap.Round)
        )

        // Horizontal scan line effect
        val scanY = centerY + amplitude * sin(time * 3f).toFloat()
        drawLine(
            color = waveColor.copy(alpha = 0.3f),
            start = Offset(0f, scanY),
            end = Offset(size.width, scanY),
            strokeWidth = 1f
        )
    }
}
