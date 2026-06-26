package com.retrobeats.di;

import android.content.Context;
import com.retrobeats.core.playback.AudioEngine;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.Provider;
import dagger.internal.Providers;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class AppModule_ProvideAudioEngineFactory implements Factory<AudioEngine> {
  private final Provider<Context> contextProvider;

  public AppModule_ProvideAudioEngineFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public AudioEngine get() {
    return provideAudioEngine(contextProvider.get());
  }

  public static AppModule_ProvideAudioEngineFactory create(
      javax.inject.Provider<Context> contextProvider) {
    return new AppModule_ProvideAudioEngineFactory(Providers.asDaggerProvider(contextProvider));
  }

  public static AppModule_ProvideAudioEngineFactory create(Provider<Context> contextProvider) {
    return new AppModule_ProvideAudioEngineFactory(contextProvider);
  }

  public static AudioEngine provideAudioEngine(Context context) {
    return Preconditions.checkNotNullFromProvides(AppModule.INSTANCE.provideAudioEngine(context));
  }
}
