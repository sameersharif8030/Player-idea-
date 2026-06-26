package com.retrobeats.di;

import android.content.Context;
import com.retrobeats.data.MusicLibrary;
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
public final class AppModule_ProvideMusicLibraryFactory implements Factory<MusicLibrary> {
  private final Provider<Context> contextProvider;

  public AppModule_ProvideMusicLibraryFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public MusicLibrary get() {
    return provideMusicLibrary(contextProvider.get());
  }

  public static AppModule_ProvideMusicLibraryFactory create(
      javax.inject.Provider<Context> contextProvider) {
    return new AppModule_ProvideMusicLibraryFactory(Providers.asDaggerProvider(contextProvider));
  }

  public static AppModule_ProvideMusicLibraryFactory create(Provider<Context> contextProvider) {
    return new AppModule_ProvideMusicLibraryFactory(contextProvider);
  }

  public static MusicLibrary provideMusicLibrary(Context context) {
    return Preconditions.checkNotNullFromProvides(AppModule.INSTANCE.provideMusicLibrary(context));
  }
}
