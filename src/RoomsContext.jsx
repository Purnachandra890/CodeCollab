import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

const RoomsContext = createContext();

export const RoomsProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRooms, setUserRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setUserRooms([]);
      setLoadingRooms(false);
      return;
    }

    setLoadingRooms(true);

    const q = query(
      collection(db, 'rooms'),
      where('members', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rooms = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Format date if it exists
          createdAt: data.createdAt?.toDate().toLocaleDateString('en-GB') || new Date().toLocaleDateString('en-GB'),
        };
      });
      setUserRooms(rooms);
      setLoadingRooms(false);
    }, (error) => {
      console.error("Error fetching rooms in context:", error);
      setLoadingRooms(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <RoomsContext.Provider value={{ userRooms, setUserRooms, loadingRooms }}>
      {children}
    </RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);
