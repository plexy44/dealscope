
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // Your web app's Firebase API key
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // The domain where your Firebase project is hosted for authentication
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // The unique identifier for your Firebase project
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // The bucket URL for Firebase Storage
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // The sender ID for Firebase Cloud Messaging (FCM)
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // The unique identifier for your Firebase web app instance
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;

// Check if Firebase has already been initialized to avoid re-initializing
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

// Firebase Authentication (getAuth) has been removed as per user request.
// const auth: Auth = getAuth(app);

// Export Firebase app instance
export { app };
// Auth export removed: export { app, auth };
