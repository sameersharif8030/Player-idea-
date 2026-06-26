package com.retrobeats.ui.screens;

import android.app.Application;
import com.retrobeats.data.MusicLibrary;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Provider;
import dagger.internal.Providers;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

@ScopeMetadata
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
public final class HomeViewModel_Factory implements Factory<HomeViewModel> {
  private final Provider<Application> applicationProvider;

  private final Provider<MusicLibrary> musicLibraryProvider;

  public HomeViewModel_Factory(Provider<Application> applicationProvider,
      Provider<MusicLibrary> musicLibraryProvider) {
    this.applicationProvider = applicationProvider;
    this.musicLibraryProvider = musicLibraryProvider;
  }

  @Override
  public HomeViewModel get() {
    return newInstance(applicationProvider.get(), musicLibraryProvider.get());
  }

  public static HomeViewModel_Factory create(javax.inject.Provider<Application> applicationProvider,
      javax.inject.Provider<MusicLibrary> musicLibraryProvider) {
    return new HomeViewModel_Factory(Providers.asDaggerProvider(applicationProvider), Providers.asDaggerProvider(musicLibraryProvider));
  }

  public static HomeViewModel_Factory create(Provider<Application> applicationProvider,
      Provider<MusicLibrary> musicLibraryProvider) {
    return new HomeViewModel_Factory(applicationProvider, musicLibraryProvider);
  }

  public static HomeViewModel newInstance(Application application, MusicLibrary musicLibrary) {
    return new HomeViewModel(application, musicLibrary);
  }
}
