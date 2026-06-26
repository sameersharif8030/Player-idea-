package com.retrobeats.di;

import android.content.Context;
import com.retrobeats.core.playback.StealthModeManager;
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
public final class AppModule_ProvideStealthModeManagerFactory implements Factory<StealthModeManager> {
  private final Provider<Context> contextProvider;

  public AppModule_ProvideStealthModeManagerFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public StealthModeManager get() {
    return provideStealthModeManager(contextProvider.get());
  }

  public static AppModule_ProvideStealthModeManagerFactory create(
      javax.inject.Provider<Context> contextProvider) {
    return new AppModule_ProvideStealthModeManagerFactory(Providers.asDaggerProvider(contextProvider));
  }

  public static AppModule_ProvideStealthModeManagerFactory create(
      Provider<Context> contextProvider) {
    return new AppModule_ProvideStealthModeManagerFactory(contextProvider);
  }

  public static StealthModeManager provideStealthModeManager(Context context) {
    return Preconditions.checkNotNullFromProvides(AppModule.INSTANCE.provideStealthModeManager(context));
  }
}
