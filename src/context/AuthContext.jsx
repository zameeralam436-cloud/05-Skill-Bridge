import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user profile from Firestore
  const fetchUserProfile = async (user) => {
    if (!user) {
      setUserRole(null);
      return null;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserRole(data.role || null);
        return data;
      } else {
        setUserRole(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching user role from Firestore:', err);
      setUserRole(null);
      return null;
    }
  };

  // Sign up with Email/Password
  const signup = async (email, password, name, role) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Update Firebase Auth display name
      if (name) {
        await updateProfile(user, { displayName: name });
      }

      // Create Firestore document in `users` collection
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: name || user.displayName || 'User',
        role: role || 'student',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);
      setUserRole(role || 'student');
      setCurrentUser(user);
      return userDoc;
    } finally {
      setLoading(false);
    }
  };

  // Log in with Email/Password
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const profile = await fetchUserProfile(user);
      setCurrentUser(user);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  // Log out
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
