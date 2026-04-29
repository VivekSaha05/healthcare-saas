import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";
import type { UserProfile } from "./types";

export interface ServerUser extends UserProfile {
  uid: string;
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const snap = await adminDb.collection("users").doc(uid).get();
    if (!snap.exists) return null;

    const data = snap.data()!;
    return {
      uid,
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
  } catch {
    return null;
  }
}

export async function requireServerUser(): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireAdmin(): Promise<ServerUser> {
  const user = await requireServerUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
