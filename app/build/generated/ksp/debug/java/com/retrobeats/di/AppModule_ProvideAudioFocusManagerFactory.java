package com.retrobeats.di;

import com.retrobeats.core.playback.AudioEngine;
import com.retrobeats.core.playback.AudioFocusManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
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
public final class AppModule_ProvideAudioFocusManagerFactory implements Factory<AudioFocusManager> {
  private final Provider<AudioEngine> audioEngineProvider;

  public AppModule_ProvideAudioFocusManagerFactory(Provider<AudioEngine> audioEngineProvider) {
    this.audioEngineProvider = audioEngineProvider;
  }

  @Override
  public AudioFocusManager get() {
    return provideAudioFocusManager(audioEngineProvider.get());
  }

  public static AppModule_ProvideAudioFocusManagerFactory create(
      javax.inject.Provider<AudioEngine> audioEngineProvider) {
    return new AppModule_ProvideAudioFocusManagerFactory(Providers.asDaggerProvider(audioEngineProvider));
  }

  public static AppModule_ProvideAudioFocusManagerFactory create(
      Provider<AudioEngine> audioEngineProvider) {
    return new AppModule_ProvideAudioFocusManagerFactory(audioEngineProvider);
  }

  public static AudioFocusManager provideAudioFocusManager(AudioEngine audioEngine) {
    return Preconditions.checkNotNullFromProvides(AppModule.INSTANCE.provideAudioFocusManager(audioEngine));
  }
}
