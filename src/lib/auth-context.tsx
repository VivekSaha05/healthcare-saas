"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile } from "./types";

interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  firebaseUser: FirebaseUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: uid,
    email: data.email,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    phone: data.phone ?? null,
    role: data.role ?? "USER",
    plan: data.plan ?? "FREE",
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

async function ensureProfileExists(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      id: firebaseUser.uid,
      email: data.email,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      phone: data.phone ?? null,
      role: data.role ?? "USER",
      plan: data.plan ?? "FREE",
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
  }

  const [firstName, ...rest] = (firebaseUser.displayName ?? "").split(" ");
  const lastName = rest.join(" ") || null;
  const now = new Date();

  const profile: UserProfile = {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    firstName: firstName || null,
    lastName: lastName || null,
    phone: null,
    role: "USER",
    plan: "FREE",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}

async function setSessionCookie(idToken: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

async function clearSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.uid);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await setSessionCookie(idToken);

        const p = await ensureProfileExists(firebaseUser);
        setProfile(p);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
          firebaseUser,
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    await setSessionCookie(idToken);
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, {
      displayName: `${firstName} ${lastName}`.trim(),
    });

    const now = new Date();
    await setDoc(doc(db, "users", credential.user.uid), {
      id: credential.user.uid,
      email,
      firstName,
      lastName,
      phone: null,
      role: "USER",
      plan: "FREE",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await sendEmailVerification(credential.user);
    const idToken = await credential.user.getIdToken();
    await setSessionCookie(idToken);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    await clearSessionCookie();
    setUser(null);
    setProfile(null);
  }, []);

  const updateUserProfile = useCallback(async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    if (!user) throw new Error("Not authenticated");

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.firstName !== undefined) updates.firstName = data.firstName;
    if (data.lastName !== undefined) updates.lastName = data.lastName;
    if (data.phone !== undefined) updates.phone = data.phone;

    await updateDoc(doc(db, "users", user.uid), updates);

    const newDisplayName = [
      data.firstName ?? profile?.firstName,
      data.lastName ?? profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    if (newDisplayName) {
      await updateProfile(user.firebaseUser, { displayName: newDisplayName });
    }

    const updated = await fetchProfile(user.uid);
    setProfile(updated);
  }, [user, profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoaded,
        isSignedIn: user !== null,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
