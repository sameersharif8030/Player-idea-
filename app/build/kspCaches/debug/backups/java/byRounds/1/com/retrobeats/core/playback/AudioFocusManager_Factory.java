package com.retrobeats.core.playback;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Provider;
import dagger.internal.Providers;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava",
    "cast",
    "deprecation",
    "nullness:initialization.field.uninitialized"
})
public final class AudioFocusManager_Factory implements Factory<AudioFocusManager> {
  private final Provider<AudioEngine> audioEngineProvider;

  public AudioFocusManager_Factory(Provider<AudioEngine> audioEngineProvider) {
    this.audioEngineProvider = audioEngineProvider;
  }

  @Override
  public AudioFocusManager get() {
    return newInstance(audioEngineProvider.get());
  }

  public static AudioFocusManager_Factory create(
      javax.inject.Provider<AudioEngine> audioEngineProvider) {
    return new AudioFocusManager_Factory(Providers.asDaggerProvider(audioEngineProvider));
  }

  public static AudioFocusManager_Factory create(Provider<AudioEngine> audioEngineProvider) {
    return new AudioFocusManager_Factory(audioEngineProvider);
  }

  public static AudioFocusManager newInstance(AudioEngine audioEngine) {
    return new AudioFocusManager(audioEngine);
  }
}
