// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from './firebase'; // Your Firebase auth and db instances

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // If a user is logged in, listen to their Firestore document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // Combine auth data with real-time Firestore profile data
            const userData = docSnap.data();
            setUser({
              uid: currentUser.uid,
              ...currentUser, // Spreads auth properties (photoURL, email)
              ...userData, // Overwrites displayName with name from Firestore
            });
          } else {
            // User document doesn't exist, use basic auth data
            setUser(currentUser);
          }
          setLoading(false);
        });

        // Clean up Firestore listener when auth state changes
        return () => unsubscribeFirestore();
      } else {
        // No user logged in
        setUser(null);
        setLoading(false);
      }
    });

    // Clean up Auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);