"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";
import type { Doctor, Gender } from "@/lib/types";

function docToDoctor(id: string, data: FirebaseFirestore.DocumentData): Doctor {
  return {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    speciality: data.speciality ?? "",
    bio: data.bio ?? null,
    imageUrl: data.imageUrl ?? "",
    gender: data.gender,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    appointmentCount: data.appointmentCount ?? 0,
  };
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const [doctorsSnap, appointmentsSnap] = await Promise.all([
      adminDb.collection("doctors").orderBy("createdAt", "desc").get(),
      adminDb.collection("appointments").get(),
    ]);

    const countByDoctor: Record<string, number> = {};
    for (const d of appointmentsSnap.docs) {
      const { doctorId } = d.data();
      countByDoctor[doctorId] = (countByDoctor[doctorId] ?? 0) + 1;
    }

    return doctorsSnap.docs.map((d) => ({
      ...docToDoctor(d.id, d.data()),
      appointmentCount: countByDoctor[d.id] ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
}

export async function getAvailableDoctors(): Promise<Doctor[]> {
  try {
    const [doctorsSnap, appointmentsSnap] = await Promise.all([
      adminDb.collection("doctors").where("isActive", "==", true).get(),
      adminDb.collection("appointments").get(),
    ]);

    const countByDoctor: Record<string, number> = {};
    for (const d of appointmentsSnap.docs) {
      const { doctorId } = d.data();
      countByDoctor[doctorId] = (countByDoctor[doctorId] ?? 0) + 1;
    }

    return doctorsSnap.docs
      .map((d) => ({
        ...docToDoctor(d.id, d.data()),
        appointmentCount: countByDoctor[d.id] ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    throw new Error("Failed to fetch available doctors");
  }
}

interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  speciality: string;
  gender: Gender;
  isActive: boolean;
  bio?: string;
}

export async function createDoctor(input: CreateDoctorInput): Promise<Doctor> {
  try {
    if (!input.name || !input.email) throw new Error("Name and email are required");

    // Check email uniqueness
    const existing = await adminDb
      .collection("doctors")
      .where("email", "==", input.email)
      .get();
    if (!existing.empty) throw new Error("A doctor with this email already exists");

    const docRef = adminDb.collection("doctors").doc();
    const now = FieldValue.serverTimestamp();

    await docRef.set({
      id: docRef.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      speciality: input.speciality,
      gender: input.gender,
      isActive: input.isActive,
      bio: input.bio ?? null,
      imageUrl: generateAvatar(input.name, input.gender),
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/admin");

    const created = await docRef.get();
    return docToDoctor(docRef.id, created.data()!);
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    throw new Error(error.message ?? "Failed to create doctor");
  }
}

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}

export async function updateDoctor(input: UpdateDoctorInput): Promise<Doctor> {
  try {
    if (!input.name || !input.email) throw new Error("Name and email are required");

    const ref = adminDb.collection("doctors").doc(input.id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Doctor not found");

    const current = snap.data()!;

    if (input.email !== current.email) {
      const existing = await adminDb
        .collection("doctors")
        .where("email", "==", input.email)
        .get();
      if (!existing.empty) throw new Error("A doctor with this email already exists");
    }

    await ref.update({
      name: input.name,
      email: input.email,
      phone: input.phone ?? current.phone,
      speciality: input.speciality ?? current.speciality,
      gender: input.gender ?? current.gender,
      isActive: input.isActive ?? current.isActive,
      bio: input.bio ?? current.bio ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin");

    const updated = await ref.get();
    return docToDoctor(input.id, updated.data()!);
  } catch (error: any) {
    console.error("Error updating doctor:", error);
    throw new Error(error.message ?? "Failed to update doctor");
  }
}

export async function deleteDoctor(id: string): Promise<{ success: boolean }> {
  try {
    const apptSnap = await adminDb
      .collection("appointments")
      .where("doctorId", "==", id)
      .limit(1)
      .get();

    if (!apptSnap.empty) {
      throw new Error(
        "Cannot delete doctor with existing appointments. Please deactivate instead."
      );
    }

    const ref = adminDb.collection("doctors").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Doctor not found");

    await ref.delete();

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    throw error;
  }
}
