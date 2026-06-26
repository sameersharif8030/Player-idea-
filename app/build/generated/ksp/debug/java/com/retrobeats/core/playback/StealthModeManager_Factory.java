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
public final class StealthModeManager_Factory implements Factory<StealthModeManager> {
  private final Provider<Context> contextProvider;

  public StealthModeManager_Factory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public StealthModeManager get() {
    return newInstance(contextProvider.get());
  }

  public static StealthModeManager_Factory create(javax.inject.Provider<Context> contextProvider) {
    return new StealthModeManager_Factory(Providers.asDaggerProvider(contextProvider));
  }

  public static StealthModeManager_Factory create(Provider<Context> contextProvider) {
    return new StealthModeManager_Factory(contextProvider);
  }

  public static StealthModeManager newInstance(Context context) {
    return new StealthModeManager(context);
  }
}
