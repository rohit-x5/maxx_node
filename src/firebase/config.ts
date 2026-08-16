import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, type DatabaseReference } from 'firebase/database';

// Firebase configuration for MAXX NODE Realtime Database
const firebaseConfig = {
  databaseURL: "https://smart-node-esp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-node-esp-default-rtdb",
};

// Initialize Firebase singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app, firebaseConfig.databaseURL);

// Reference to /sensorData root node
export const sensorDataRef: DatabaseReference = ref(db, 'sensorData');

export { ref, onValue, off };
