import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);   // Firebase user object
  const [userProfile, setUserProfile] = useState(null);   // Firestore profile { role, displayName, ... }
  const [loading,     setLoading]     = useState(true);
  const [authError,   setAuthError]   = useState(null);

  // ── Listen to Firebase auth state ──────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Fetch Firestore profile ────────────────────────────────
  async function fetchProfile(uid) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setUserProfile(snap.data());
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
  }

  // ── Register new user ──────────────────────────────────────
  async function register(email, password, displayName) {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name on Firebase auth profile
      await updateProfile(cred.user, { displayName });

      // Create Firestore user document — default role is "user"
      const profileData = {
        uid:         cred.user.uid,
        email,
        displayName,
        role:        "user",       // ← admins must be promoted manually in Firestore
        createdAt:   serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), profileData);
      setUserProfile(profileData);

      return { success: true };
    } catch (err) {
      const msg = friendlyError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  // ── Login ──────────────────────────────────────────────────
  async function login(email, password) {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg = friendlyError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  // ── Logout ─────────────────────────────────────────────────
  async function logout() {
    await signOut(auth);
  }

  // ── Helpers ────────────────────────────────────────────────
  const isAdmin = userProfile?.role === "admin";

  function friendlyError(code) {
    const map = {
      "auth/email-already-in-use":    "That email is already registered.",
      "auth/invalid-email":           "Invalid email address.",
      "auth/weak-password":           "Password must be at least 6 characters.",
      "auth/user-not-found":          "No account found with that email.",
      "auth/wrong-password":          "Incorrect password. Try again.",
      "auth/invalid-credential":      "Invalid email or password.",
      "auth/too-many-requests":       "Too many attempts. Please wait a moment.",
      "auth/network-request-failed":  "Network error. Check your connection.",
    };
    return map[code] || "Something went wrong. Please try again.";
  }

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    authError,
    register,
    login,
    logout,
    clearError: () => setAuthError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
