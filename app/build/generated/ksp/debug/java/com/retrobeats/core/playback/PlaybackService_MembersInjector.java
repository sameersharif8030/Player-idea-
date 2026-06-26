package com.retrobeats.core.playback;

import dagger.MembersInjector;
import dagger.internal.DaggerGenerated;
import dagger.internal.InjectedFieldSignature;
import dagger.internal.Provider;
import dagger.internal.Providers;
import dagger.internal.QualifierMetadata;
import javax.annotation.processing.Generated;

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
public final class PlaybackService_MembersInjector implements MembersInjector<PlaybackService> {
  private final Provider<AudioEngine> audioEngineProvider;

  private final Provider<MediaSessionManager> mediaSessionManagerProvider;

  public PlaybackService_MembersInjector(Provider<AudioEngine> audioEngineProvider,
      Provider<MediaSessionManager> mediaSessionManagerProvider) {
    this.audioEngineProvider = audioEngineProvider;
    this.mediaSessionManagerProvider = mediaSessionManagerProvider;
  }

  public static MembersInjector<PlaybackService> create(Provider<AudioEngine> audioEngineProvider,
      Provider<MediaSessionManager> mediaSessionManagerProvider) {
    return new PlaybackService_MembersInjector(audioEngineProvider, mediaSessionManagerProvider);
  }

  public static MembersInjector<PlaybackService> create(
      javax.inject.Provider<AudioEngine> audioEngineProvider,
      javax.inject.Provider<MediaSessionManager> mediaSessionManagerProvider) {
    return new PlaybackService_MembersInjector(Providers.asDaggerProvider(audioEngineProvider), Providers.asDaggerProvider(mediaSessionManagerProvider));
  }

  @Override
  public void injectMembers(PlaybackService instance) {
    injectAudioEngine(instance, audioEngineProvider.get());
    injectMediaSessionManager(instance, mediaSessionManagerProvider.get());
  }

  @InjectedFieldSignature("com.retrobeats.core.playback.PlaybackService.audioEngine")
  public static void injectAudioEngine(PlaybackService instance, AudioEngine audioEngine) {
    instance.audioEngine = audioEngine;
  }

  @InjectedFieldSignature("com.retrobeats.core.playback.PlaybackService.mediaSessionManager")
  public static void injectMediaSessionManager(PlaybackService instance,
      MediaSessionManager mediaSessionManager) {
    instance.mediaSessionManager = mediaSessionManager;
  }
}
