// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCQsUE3hBdKdzqunUCA9EgweX96zaeXRi8',
  authDomain: 'file-storage-a604e.firebaseapp.com',
  projectId: 'file-storage-a604e',
  storageBucket: 'file-storage-a604e.appspot.com',
  messagingSenderId: '157306710492',
  appId: '1:157306710492:web:deae2ccb7bb225c8f18719',
  measurementId: 'G-SDN56SV7JZ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getStorage } from 'firebase/storage';
const storage = getStorage(app);

export { storage };
