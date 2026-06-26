package com.retrobeats.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.retrobeats.data.SammyAnimationStyle
import com.retrobeats.ui.theme.RetroAmber
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun SammyDedication(
    modifier: Modifier = Modifier,
    animationStyle: SammyAnimationStyle = SammyAnimationStyle.BLUR_MORPH,
    textColor: Color = RetroAmber
) {
    when (animationStyle) {
        SammyAnimationStyle.BLUR_MORPH -> BlurMorphDedication(modifier, textColor)
        SammyAnimationStyle.ORBIT_TEXT -> OrbitTextDedication(modifier, textColor)
        SammyAnimationStyle.FLASH_STAGGER -> FlashStaggerDedication(modifier, textColor)
    }
}

@Composable
private fun BlurMorphDedication(
    modifier: Modifier = Modifier,
    textColor: Color
) {
    val infiniteTransition = rememberInfiniteTransition(label = "blur_morph")
    val blurValue by infiniteTransition.animateFloat(
        initialValue = 8f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "blur"
    )
    val alphaValue by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "For Sammy,",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = textColor,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .blur(blurValue.dp)
                .alpha(alphaValue)
        )
        Text(
            text = "By Sammy.",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = textColor,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .blur((blurValue * 0.8f).dp)
                .alpha(alphaValue)
        )
    }
}

@Composable
private fun OrbitTextDedication(
    modifier: Modifier = Modifier,
    textColor: Color
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orbit_text")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )
    val sc by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = 1.1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Box(
        modifier = modifier.size(120.dp),
        contentAlignment = Alignment.Center
    ) {
        val fullText = "For Sammy, By Sammy."
        val chars = fullText.toList()
        chars.forEachIndexed { index, ch ->
            val angle = (360f / chars.size) * index + rotation
            val radius = 45f
            val offsetX = radius * cos(Math.toRadians(angle.toDouble())).toFloat()
            val offsetY = radius * sin(Math.toRadians(angle.toDouble())).toFloat()

            Text(
                text = ch.toString(),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = textColor.copy(alpha = 0.8f + 0.2f * sin(angle.toDouble()).toFloat()),
                modifier = Modifier.offset(x = offsetX.dp, y = offsetY.dp).scale(sc)
            )
        }

        Text(
            text = "S",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = textColor,
            modifier = Modifier.scale(sc)
        )
    }
}

@Composable
private fun FlashStaggerDedication(
    modifier: Modifier = Modifier,
    textColor: Color
) {
    val line1 = "For Sammy,"
    val line2 = "By Sammy."

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(horizontalArrangement = Arrangement.Center) {
            line1.forEachIndexed { index, ch ->
                val infiniteTransition = rememberInfiniteTransition(label = "flash_$index")
                val alp by infiniteTransition.animateFloat(
                    initialValue = 0.2f,
                    targetValue = 1f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(
                            durationMillis = 800,
                            delayMillis = (index * 100),
                            easing = FastOutSlowInEasing
                        ),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "alpha_$index"
                )
                Text(
                    text = ch.toString(),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor.copy(alpha = alp)
                )
            }
        }
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.Center) {
            line2.forEachIndexed { index, ch ->
                val infiniteTransition = rememberInfiniteTransition(label = "flash2_$index")
                val alp by infiniteTransition.animateFloat(
                    initialValue = 0.2f,
                    targetValue = 1f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(
                            durationMillis = 800,
                            delayMillis = (index * 100 + 150),
                            easing = FastOutSlowInEasing
                        ),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "alpha2_$index"
                )
                Text(
                    text = ch.toString(),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor.copy(alpha = alp)
                )
            }
        }
    }
}
