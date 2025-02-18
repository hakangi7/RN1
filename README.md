---

## 📱 **About This App**  
This application is designed for **buying and selling used Apple devices**.  

### 🔹 **Key Features**  

1️⃣ **Location-Based Listings** 🌍  
   - When a user posts a second-hand item, the **latitude and longitude** at the time of posting are recorded.  
   - When another user logs in, their **current location is also collected**.  
   - The app displays listings sorted **by proximity**, making it easier for users to find nearby deals.  
   - 📍 **Tip:** In `ProductUpload.tsx` (line 117), the Google Maps API request uses `language=ko`, which ensures addresses are returned in Korean.  
     - **You can modify this parameter to display addresses in a different language by changing `language=ko` to your preferred language code.**  
     - Example: `language=en` for English, `language=ja` for Japanese.  

2️⃣ **Full Access to Photos (iOS Expertise)** 📸  
   - When posting an item, the app requires access to the **photo gallery**.  
   - On iPhones, **React Native alone cannot grant full access to all photos**.  
   - However, my implementation **enables full access**, thanks to my extensive **iOS native development experience**.  

3️⃣ **Real-Time Communication via FCM (Push Notifications)** 🚀  
   - Buyers can express their interest by **leaving a comment** on an item.  
   - The **seller receives an instant FCM push notification** with the comment content.  
   - This enables seamless interaction and facilitates transactions.  

4️⃣ **FCM Implementation (iOS, Android, and Node.js Server)**  
   - The **FCM system is implemented not only on iOS and Android clients but also on the Node.js server**.  
   - Setting up a **full-fledged FCM system requires deep expertise in native iOS and Android development**, and I have successfully implemented it across all platforms.  

---

## 🛠 **Tech Stack**  
- **Frontend:** React Native (iOS & Android), TypeScript  
- **Backend:** Node.js, Express  
- **Database:** SQL-based storage  
- **Push Notifications:** Firebase Cloud Messaging (FCM)  
- **Native Integrations:** Full Photo Access (iOS), Location Services  

---

🚀 **I also run a YouTube channel where I share tech tutorials and insights.**  
🔗 [**Logic Makers YouTube Channel**](https://www.youtube.com/@logicmakers/channels)  

💼 **No sponsorship required for remote work.**  

---

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 0: package.jons dependency install 

 


```bash
cd RN1
# using npm
npm install

# OR using Yarn
yarn install
```


## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
