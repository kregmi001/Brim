## Running React on Replit

[React](https://reactjs.org/) is a popular JavaScript library for building user interfaces.

[Vite](https://vitejs.dev/) is a blazing fast frontend build tool that includes features like Hot Module Reloading (HMR), optimized builds, and TypeScript support out of the box.

Using the two in conjunction is one of the fastest ways to build a web app.

### Getting Started
- Hit run
- Edit [App.jsx](#src/App.jsx) and watch it live update!

By default, Replit runs the `dev` script, but you can configure it by changing the `run` field in the [configuration file](#.replit). Here are the vite docs for [serving production websites](https://vitejs.dev/guide/build.html)

### Typescript

Just rename any file from `.jsx` to `.tsx`. You can also try our [TypeScript Template](https://replit.com/@replit/React-TypeScript)

### Firebase Setup

This app requires Firebase for authentication. Follow these steps to set it up:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication and add Google and Twitter providers
4. Go to Project Settings > General
5. Scroll down to "Your apps" and click the web icon (</>)
6. Register your app and copy the configuration

### Environment Variables

Create a `.env` file in the project root and define your Firebase settings:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** Replace the placeholder values with your actual Firebase project credentials from the Firebase Console.

These values are loaded in `src/App.jsx` via `import.meta.env`.

### Features

#### 🔐 Authentication
- Google and Twitter authentication
- Email/password authentication
- Secure sign-out functionality

#### 📝 Posts Tab
- Create and share posts with text and images
- Like posts and react with emojis
- Add comments to posts
- Real-time post interactions

#### 👥 Profiles Tab
- Tinder-like profile browsing
- Swipe through user profiles
- Like or pass on profiles
- View profile details including photos, bio, and interests

#### 👤 Profile Creation
- Multi-step profile creation process
- Upload up to 5 photos
- Add personal details (name, age, bio, location, interests)
- Step-by-step guided setup

#### 📱 User Experience
- Tab-based navigation between Posts and Profiles
- Responsive design for mobile and desktop
- Modern, clean UI with smooth animations
- Loading states and error handling

### App Structure

- **Posts Tab**: Social media feed with post creation and interaction
- **Profiles Tab**: Dating app-style profile browsing
- **Profile Creation**: Guided setup for new users
- **Authentication**: Secure login with multiple providers

The app combines social media features with dating app functionality, creating a unique platform for both social networking and meeting new people.

