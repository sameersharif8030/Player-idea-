package com.retrobeats.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

data class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    val baseRadius: Float,
    val color: Color,
    val freqIndex: Int
)

@Composable
fun DancingParticlesVisualizer(
    modifier: Modifier = Modifier,
    particleColor: Color = Color(0xFFE91E63),
    isPlaying: Boolean = false
) {
    var phase by remember { mutableFloatStateOf(0f) }
    var peaks by remember { mutableStateOf(FloatArray(32)) }

    val particles = remember {
        val colors = listOf(
            particleColor,
            particleColor.copy(alpha = 0.8f),
            Color(0xFF06B6D4),
            Color(0xFF8B5CF6)
        )
        List(30) { i ->
            Particle(
                x = Random.nextFloat() * 200f + 20f,
                y = Random.nextFloat() * 100f + 20f,
                vx = (Random.nextFloat() - 0.5f) * 0.8f,
                vy = (Random.nextFloat() - 0.5f) * 0.8f,
                baseRadius = Random.nextFloat() * 3f + 2f,
                color = colors[i % colors.size],
                freqIndex = (Math.pow(Random.nextDouble(), 1.5) * 30).toInt()
            )
        }
    }

    Canvas(modifier = modifier) {
        phase += 0.05f

        // Simulated audio data
        for (i in peaks.indices) {
            val factor = sin(phase + i * 0.2f) * 0.5f + 0.5f
            val envelope = maxOf(0f, 1f - i / (peaks.size * 0.8f))
            peaks[i] = factor * 80f * envelope + 10f
        }

        // Draw connections between nearby particles
        for (i in particles.indices) {
            for (j in i + 1 until particles.size) {
                val p1 = particles[i]
                val p2 = particles[j]
                val dx = p1.x - p2.x
                val dy = p1.y - p2.y
                val dist = kotlin.math.sqrt(dx * dx + dy * dy)
                if (dist < 45f) {
                    val alpha = (1f - dist / 45f) * 0.18f
                    drawLine(
                        color = p1.color.copy(alpha = alpha),
                        start = Offset(p1.x, p1.y),
                        end = Offset(p2.x, p2.y),
                        strokeWidth = 0.5f
                    )
                }
            }
        }

        // Draw and update particles
        for (p in particles) {
            val audioValue = peaks.getOrElse(p.freqIndex) { 0f } / 255f
            val speedMul = 1f + audioValue * 3.5f

            p.x += p.vx * speedMul + (Random.nextFloat() - 0.5f) * audioValue * 2f
            p.y += p.vy * speedMul + (Random.nextFloat() - 0.5f) * audioValue * 2f

            // Bounce off walls
            if (p.x < 5f) { p.x = 5f; p.vx = kotlin.math.abs(p.vx) }
            if (p.x > size.width - 5f) { p.x = size.width - 5f; p.vx = -kotlin.math.abs(p.vx) }
            if (p.y < 5f) { p.y = 5f; p.vy = kotlin.math.abs(p.vy) }
            if (p.y > size.height - 5f) { p.y = size.height - 5f; p.vy = -kotlin.math.abs(p.vy) }

            val radius = p.baseRadius + audioValue * 7f

            drawCircle(
                color = p.color,
                radius = radius,
                center = Offset(p.x, p.y)
            )
        }
    }
}
