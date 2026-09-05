// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBE8u_Li1rW8vq4WnutgblGZmU_KfRrlmQ",
    authDomain: "prescription-manager-50462.firebaseapp.com",
    projectId: "prescription-manager-50462",
    storageBucket: "prescription-manager-50462.appspot.com",
    messagingSenderId: "718501641207",
    appId: "1:718501641207:web:432b3a8553eac386b80cf2",
    measurementId: "G-W0DSTYYC0L"
};

// --- SECURITY NOTE ---
// The configuration keys here are NOT secrets. They are designed to be public.
// Your app's security relies on Firebase Security Rules for Firestore/Storage
// and App Check to ensure requests come from your genuine app.
// Make sure to configure your Security Rules in the Firebase console to prevent
// unauthorized access to your data.
// Example Rule: Allow users to only read/write their own prescriptions.
//
// match /users/{userId}/prescriptions/{docId} {
//   allow read, write: if request.auth.uid == userId;
// }

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Storage is initialized but not used in app.js