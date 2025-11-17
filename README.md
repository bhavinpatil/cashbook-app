# 📘 **Cashbook App – Local Android Build Guide (Expo + EAS Local)**

*A complete end-to-end setup and build documentation*

This guide explains how to **set up**, **maintain**, and **build** the Cashbook App locally on Ubuntu using **EAS Local Build** without relying on Expo’s remote build system.

Designed for a clean workflow:

* Development builds
* Preview (Release) builds
* Optional production builds
* AAB → APK conversion using Bundletool
* Organized build output folders
* Daily workflow for incremental builds
* Full environment setup
* Troubleshooting
* Security & optimization tips

---

# 🧩 **Table of Contents**

1. System Requirements
2. Ubuntu Environment Setup

   * Node & NVM
   * Java JDK
   * Android SDK
   * System Paths
   * Verifying tools
3. Project Setup
4. EAS CLI Setup
5. Build Profiles (development / preview / production)
6. Local Build Commands
7. AAB → APK Conversion
8. Build Output Directory Structure
9. Daily Workflow (Incremental Builds)
10. Clean Rebuild Process
11. Troubleshooting
12. Security Notes
13. Commands Cheat Sheet

---

# 🟦 1. System Requirements

* Ubuntu 20.04 or later
* Minimum 8 GB RAM (16+ GB recommended)
* 20–30 GB disk space (Android SDK + node_modules)
* Access to the project repository

---

# 🟦 2. Ubuntu Environment Setup

## 🔹 Install NVM + Node

```bash
sudo apt update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install 20
nvm use 20
```

Verify:

```bash
node -v
npm -v
```

---

## 🔹 Install Java JDK 17

```bash
sudo apt install openjdk-17-jdk -y
```

Verify:

```bash
java -version
```

---

## 🔹 Android SDK Setup

Create SDK directory:

```bash
mkdir -p ~/Android/Sdk
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=~/Android/Sdk
```

Add to `~/.bashrc`:

```bash
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/build-tools/34.0.0
```

Reload:

```bash
source ~/.bashrc
```

---

## 🔹 Install SDK Command Line Tools

Download:

```bash
cd ~/Android/Sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmd-tools.zip
unzip cmd-tools.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/
```

Install SDK packages:

```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

---

## 🔹 Verify tools

```bash
sdkmanager --version
adb version
```

---

# 🟦 3. Project Setup

Clone the repository into Ubuntu:

```bash
git clone <your-repo>
cd cashbook-app
```

Install dependencies:

```bash
npm install
```

---

# 🟦 4. EAS CLI Setup

```bash
npm install -g eas-cli
```

Verify:

```bash
eas --version
```

---

# 🟦 5. Build Profiles (eas.json)

Your configured profiles:

```jsonc
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "autoIncrement": true
    }
  }
}
```

### Summary:

* **Development** → Debug APK (big, includes Dev Client)
* **Preview** → Release APK (optimized, what you install daily)
* **Production** → AAB for Play Store (optional)

---

# 🟦 6. Local Build Commands

## 🔹 Development (debug)

```bash
eas build --platform android --profile development --local
```

## 🔹 Preview (recommended daily)

```bash
eas build --platform android --profile preview --local
```

Output:
`builds/preview/preview-<timestamp>.apk`

## 🔹 Production (optional)

```bash
eas build --platform android --profile production --local
```

Output:
`builds/production/release-<version>.aab`

---

# 🟦 7. AAB → APK Conversion (Bundletool)

Install bundletool:

```bash
mkdir -p ~/tools
cd ~/tools
wget https://github.com/google/bundletool/releases/download/1.11.0/bundletool-all-1.11.0.jar -O bundletool.jar
```

---

## 🔹 Build Universal APK

```bash
cd ~/cashbook-app
java -jar ~/tools/bundletool.jar build-apks \
  --bundle=builds/production/release-1.aab \
  --output=app.apks \
  --mode=universal
```

Extract:

```bash
unzip app.apks -d builds/production/output_apks
mv builds/production/output_apks/universal.apk builds/production/universal-release-1.apk
```

---

# 🟦 8. Build Output Directory Structure

All builds are stored in:

```
builds/
 ├── development/
 │     └── development-1.apk
 ├── preview/
 │     └── preview-1.apk
 ├── production/
 │     ├── release-1.aab
 │     ├── universal-release-1.apk
 │     ├── app.apks
 │     └── output_apks/
 ├── logs/
```

This keeps the project root clean.

---

# 🟦 9. Daily Workflow (Incremental Builds)

Every time you pull new code:

```bash
git pull origin main
```

### ✔ If changes are JS/UI only → **fast preview build:**

```bash
eas build --platform android --profile preview --local
```

### ✔ If changes touch app.json, SDK, permissions, native deps → **clean rebuild:**

```bash
rm -rf android
eas build --platform android --profile preview --local
```

```
eas build --platform android --profile preview --local \
  --output builds/preview/preview-$(date +%Y%m%d%H%M).apk
```

After build:

```bash
mv build-*.apk builds/preview/preview-$(date +%Y-%m-%d-%H%M).apk
```

---

# 🟦 10. Clean Rebuild Process

Use when:

* Updating Expo SDK
* Changing Android permissions
* Adding new native modules
* Changing icons / splash
* Changing package name

Command:

```bash
rm -rf android
eas build --platform android --profile preview --local
```

---

# 🟦 11. Troubleshooting

### ❌ *"SDK not found"*

Fix:

```bash
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=~/Android/Sdk
source ~/.bashrc
```

---

### ❌ *"Unsupported platform (Windows)"*

Local builds work only on:

* Ubuntu
* macOS

---

### ❌ *"Bundletool jar not found"*

```bash
java -jar ~/tools/bundletool.jar --version
```

---

### ❌ Slow Gradle build (40–50 mins)

This is normal first time.
Later builds use cache and speed up.

---

# 🟦 12. Security Notes

* Never commit keystore (.jks) files
* Never commit keystore passwords
* Never publish your AAB publicly if it contains personal data
* Use gitignore to exclude:

```
builds/
output_apks/
app.apks
*.keystore
*.jks
```

---

# 🟦 13. Commands Cheat Sheet

### Build:

```
eas build --platform android --profile preview --local
eas build --platform android --profile development --local
eas build --platform android --profile production --local
```

### AAB → APK:

```
java -jar ~/tools/bundletool.jar build-apks --bundle=your.aab --output=app.apks --mode=universal
unzip app.apks -d output_apks
```

### Clean Build:

```
rm -rf android
eas build --platform android --profile preview --local
```

### Move build files:

```
mv build-*.apk builds/preview/
mv build-*.aab builds/production/
```
