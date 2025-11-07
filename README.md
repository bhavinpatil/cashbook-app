# 💰 Cashbook App — Powered by Expo

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).
It’s a modern bookkeeping and expense-tracking app built with React Native and Expo Router.

---

## 🚀 Get Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the App (Development Mode)

```bash
npx expo start
```

You’ll see options in the terminal to open the app in:

* 📱 [Expo Go](https://expo.dev/go) — a sandbox environment
* 💻 [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
* 🍎 [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
* 🧱 [Development Build](https://docs.expo.dev/develop/development-builds/introduction/)

You can start developing by editing the files inside the **`app/`** directory.
This project uses [file-based routing](https://docs.expo.dev/router/introduction).

---

## 🧾 Deploying / Building the App

### 1️⃣ Login to Expo (required once per system)

```bash
npx expo login
```

Enter your Expo credentials.
If you don’t have an account, sign up here 👉 [https://expo.dev/signup](https://expo.dev/signup)

---

### 2️⃣ Build an Android Preview (EAS)

To generate an **APK** (for direct install) or upload to Expo for preview:

```bash
npx eas build -p android --profile preview
```

✅ This will:

* Bundle and upload your app using **Expo Application Services (EAS)**
* Generate a **preview build link**
* Host your build on **Expo.dev**, accessible via:

  * **Expo Go**
  * **Direct install link (APK)**
  * **QR code scan**

Once complete, you’ll see something like:

```
✔ Build finished
🔗 Open this link to view your build: https://expo.dev/accounts/yourname/projects/cashbook-app/builds/123abc456
```

> 🧠 Make sure `eas-cli` is installed globally if not already:
>
> ```bash
> npm install -g eas-cli
> ```

---

### 3️⃣ Optional: Build for Production

When you’re ready for release (Play Store upload):

```bash
npx eas build -p android --profile production
```

You can configure profiles in your **`eas.json`** file (e.g., `preview`, `production`, etc.).

---

## 🧹 Reset the Project (Optional)

If you want a clean slate:

```bash
npm run reset-project
```

This moves the starter code to the `app-example/` directory
and creates a blank `app/` folder where you can start fresh.

---

## 📚 Learn More

* [Expo Documentation](https://docs.expo.dev/) — Learn fundamentals and advanced topics
* [EAS Build Docs](https://docs.expo.dev/build/introduction/) — Learn about cloud builds
* [Expo Router Guide](https://docs.expo.dev/router/introduction/) — File-based navigation

---

## 🌍 Join the Community

* [Expo on GitHub](https://github.com/expo/expo)
* [Expo Discord Community](https://chat.expo.dev)
* [Expo Forums](https://forums.expo.dev)

---

Would you like me to include a **preview badge** (that auto-links to your latest Expo build once you publish)?
It looks like this:

> 🚀 [View Latest Build on Expo →](https://expo.dev/@yourusername/cashbook-app)

I can generate the proper Markdown line for that once you’ve done your first `eas build`.
