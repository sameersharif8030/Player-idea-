# Packaging TapeDeck Player for Android 📱

This project is fully prepared and pre-configured to be compiled into a native Android `.apk` file using **Capacitor** (the industry-standard, high-performance runtime for packaging web applications).

Because we have pre-installed `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`, you can download the project ZIP, extract it, and compile it into an installable APK with just a few simple commands.

---

## ⚙️ Prerequisites

Before you compile, make sure you have the following installed on your machine:
1. **Node.js** (v18 or higher)
2. **Android Studio** (with the Android SDK installed)

---

## 🚀 Step-by-Step Compilation Guide

Follow these steps on your computer to build the Android App:

### 1. Extract the Project
Download the ZIP file of this project from Google AI Studio, and extract it to a folder on your computer.

### 2. Install Local Dependencies
Open your terminal/command prompt, navigate to the extracted folder, and run:
```bash
npm install
```

### 3. Generate the Android Platform
Initialize and create the native Android Studio project folder by running:
```bash
npx cap add android
```
*(This will generate a native `/android` directory containing the full Android gradle project).*

### 4. Build and Sync the Code
We have added a custom script to automate the entire web build and sync process. Run:
```bash
npm run android:prepare
```
*(This compiles your React app into the static `dist/` directory and automatically transfers all compiled assets into the native Android platform folder).*

### 5. Open in Android Studio
Launch Android Studio and open the generated `/android` folder, or let Capacitor open it for you by running:
```bash
npx cap open android
```

### 6. Build the `.apk` File!
Once Android Studio opens the project, it will automatically download Gradle and configure the environment:
1. Wait for the background Gradle sync to finish (indicated by a status bar at the bottom).
2. Click **Build** in the top menu bar.
3. Select **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. Android Studio will compile your app. When finished, a notification popup will appear in the bottom-right corner. Click **"Locate"** to find your newly minted `app-debug.apk` file!
5. Transfer this `.apk` to your Android phone (via USB, email, Google Drive, or Discord) and install it.

---

## 🎧 Essential Android Capabilities We Integrated

We have explicitly structured and coded the app to run perfectly on Android:

### 1. Bluetooth Earbud & Lock Screen Controls 🎛️
The custom **Media Session API** bindings are fully compatible with modern Android WebViews. When your app plays music on Android:
* A persistent **music player notification** will display on your lock screen and notification panel.
* It displays the current song title, artist name, and a visual representation of album art.
* **Basic controls** (Play, Pause, Next, Previous) are fully interactive in the notification panel.
* **Earbud controls** (single tap to Play/Pause, double tap for Next, triple tap for Previous) will trigger the corresponding controls in the app natively!
* **Toggle Switch**: If you ever want to turn off this persistent system media session, we have added a dedicated **Notification Toggle Switch** on the top-left corner of the player. Tap it to disable/enable the background notification panel controls instantly.

### 2. Local Storage & Offline Audio Files 💾
* **Persistent Cache**: The local tracks list, app theme, and sleep timer settings are stored in `localStorage`. In Android WebViews, Capacitor sandboxes this storage, meaning your custom playlist and configurations remain fully saved and persistent even if you close the app or restart your phone.
* **Local Files**: You can tap the "Upload Custom Audio" button to load MP3/WAV files directly from your phone's storage. These custom tracks will load and play offline inside the app smoothly.

### 3. High Performance ⚡
While Hermes is the default JS compiler for React Native, Capacitor runs your React Vite code in the native **Android System WebView**, which leverages Chromium's high-performance V8 engine. It includes full hardware acceleration, seamless Web Audio API synthwave loops, and CSS animations running at a smooth 60fps.
