package com.retrobeats.core.playback;

import android.content.Context;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
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
public final class MediaSessionManager_Factory implements Factory<MediaSessionManager> {
  private final Provider<Context> contextProvider;

  private final Provider<StealthModeManager> stealthModeManagerProvider;

  public MediaSessionManager_Factory(Provider<Context> contextProvider,
      Provider<StealthModeManager> stealthModeManagerProvider) {
    this.contextProvider = contextProvider;
    this.stealthModeManagerProvider = stealthModeManagerProvider;
  }

  @Override
  public MediaSessionManager get() {
    return newInstance(contextProvider.get(), stealthModeManagerProvider.get());
  }

  public static MediaSessionManager_Factory create(javax.inject.Provider<Context> contextProvider,
      javax.inject.Provider<StealthModeManager> stealthModeManagerProvider) {
    return new MediaSessionManager_Factory(Providers.asDaggerProvider(contextProvider), Providers.asDaggerProvider(stealthModeManagerProvider));
  }

  public static MediaSessionManager_Factory create(Provider<Context> contextProvider,
      Provider<StealthModeManager> stealthModeManagerProvider) {
    return new MediaSessionManager_Factory(contextProvider, stealthModeManagerProvider);
  }

  public static MediaSessionManager newInstance(Context context,
      StealthModeManager stealthModeManager) {
    return new MediaSessionManager(context, stealthModeManager);
  }
}
