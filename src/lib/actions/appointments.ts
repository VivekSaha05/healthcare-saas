"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getServerUser } from "@/lib/get-server-user";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AppointmentStatus, Appointment } from "@/lib/types";

function dateToTimestamp(dateStr: string): Timestamp {
  return Timestamp.fromDate(new Date(`${dateStr}T00:00:00.000Z`));
}

function docToAppointment(id: string, data: FirebaseFirestore.DocumentData): Appointment {
  return {
    id,
    date: data.date instanceof Timestamp
      ? data.date.toDate().toISOString().split("T")[0]
      : String(data.date),
    time: data.time,
    duration: data.duration ?? 30,
    status: data.status,
    notes: data.notes ?? null,
    reason: data.reason ?? null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    userId: data.userId,
    doctorId: data.doctorId,
    patientName: data.patientName ?? "",
    patientEmail: data.patientEmail ?? "",
    doctorName: data.doctorName ?? "",
    doctorEmail: data.doctorEmail ?? "",
    doctorImageUrl: data.doctorImageUrl ?? "",
  };
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const snap = await adminDb
      .collection("appointments")
      .orderBy("createdAt", "desc")
      .get();

    return snap.docs.map((d) => docToAppointment(d.id, d.data()));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

export async function getUserAppointments(): Promise<Appointment[]> {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("You must be logged in to view appointments");

    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentTimestamp = Timestamp.fromDate(currentDate);

    const snap = await adminDb
      .collection("appointments")
      .where("userId", "==", user.uid)
      .where("date", ">=", currentTimestamp)
      .orderBy("date", "asc")
      .get();

    const appointments = snap.docs
      .map((d) => docToAppointment(d.id, d.data()))
      .filter((a) => ["PENDING", "CONFIRMED"].includes(a.status));

    appointments.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    return appointments;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}

export async function getUserAppointmentStats() {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("You must be authenticated");

    const snap = await adminDb
      .collection("appointments")
      .where("userId", "==", user.uid)
      .get();

    const all = snap.docs.map((d) => d.data());
    return {
      totalAppointments: all.length,
      completedAppointments: all.filter((a) => a.status === "COMPLETED").length,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

export async function getBookedTimeSlots(doctorId: string, date: string): Promise<string[]> {
  try {
    const snap = await adminDb
      .collection("appointments")
      .where("doctorId", "==", doctorId)
      .where("date", "==", dateToTimestamp(date))
      .where("status", "in", ["CONFIRMED", "COMPLETED"])
      .get();

    return snap.docs.map((d) => d.data().time as string);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return [];
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
}

export async function bookAppointment(input: BookAppointmentInput): Promise<Appointment> {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("You must be logged in to book an appointment");

    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }

    const doctorSnap = await adminDb.collection("doctors").doc(input.doctorId).get();
    if (!doctorSnap.exists) throw new Error("Doctor not found");
    const doctor = doctorSnap.data()!;

    const patientName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    const docRef = adminDb.collection("appointments").doc();
    const now = FieldValue.serverTimestamp();

    await docRef.set({
      id: docRef.id,
      userId: user.uid,
      doctorId: input.doctorId,
      date: dateToTimestamp(input.date),
      time: input.time,
      duration: 30,
      status: "CONFIRMED" as AppointmentStatus,
      reason: input.reason ?? "General consultation",
      notes: null,
      patientName,
      patientEmail: user.email,
      doctorName: doctor.name,
      doctorEmail: doctor.email ?? "",
      doctorImageUrl: doctor.imageUrl ?? "",
      createdAt: now,
      updatedAt: now,
    });

    const created = await docRef.get();
    return docToAppointment(docRef.id, created.data()!);
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw new Error("Failed to book appointment. Please try again later.");
  }
}

export async function updateAppointmentStatus(input: {
  id: string;
  status: AppointmentStatus;
}): Promise<{ id: string; status: AppointmentStatus }> {
  try {
    await adminDb.collection("appointments").doc(input.id).update({
      status: input.status,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id: input.id, status: input.status };
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Failed to update appointment");
  }
}

export async function cancelAppointment(input: { id: string }) {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("You must be logged in");

    const apptSnap = await adminDb.collection("appointments").doc(input.id).get();
    if (!apptSnap.exists) throw new Error("Appointment not found");
    const appt = apptSnap.data()!;

    const isAdmin = user.role === "ADMIN";
    const isOwner = appt.userId === user.uid;
    if (!isAdmin && !isOwner) throw new Error("Not allowed");

    if (appt.status === "COMPLETED") {
      throw new Error("Completed appointments cannot be cancelled");
    }

    const apptDate = appt.date instanceof Timestamp ? appt.date.toDate() : new Date(appt.date);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (apptDate < startOfToday) {
      throw new Error("Past appointments cannot be cancelled");
    }

    await adminDb.collection("appointments").doc(input.id).update({
      status: "CANCELLED",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { id: input.id, status: "CANCELLED" };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw new Error("Failed to cancel appointment");
  }
}

export async function rescheduleAppointment(input: {
  id: string;
  date: string;
  time: string;
}) {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("You must be logged in");

    const apptSnap = await adminDb.collection("appointments").doc(input.id).get();
    if (!apptSnap.exists) throw new Error("Appointment not found");
    const appt = apptSnap.data()!;

    const isAdmin = user.role === "ADMIN";
    const isOwner = appt.userId === user.uid;
    if (!isAdmin && !isOwner) throw new Error("Not allowed");

    if (appt.status === "COMPLETED") {
      throw new Error("Completed appointments cannot be rescheduled");
    }
    if (appt.status === "CANCELLED") {
      throw new Error("Cancelled appointments cannot be rescheduled");
    }

    // Check if the new slot is already booked by another appointment
    const conflictSnap = await adminDb
      .collection("appointments")
      .where("doctorId", "==", appt.doctorId)
      .where("date", "==", dateToTimestamp(input.date))
      .where("time", "==", input.time)
      .where("status", "in", ["CONFIRMED", "COMPLETED"])
      .get();

    const conflict = conflictSnap.docs.find((d) => d.id !== input.id);
    if (conflict) throw new Error("This time slot is already booked");

    await adminDb.collection("appointments").doc(input.id).update({
      date: dateToTimestamp(input.date),
      time: input.time,
      status: "CONFIRMED",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { id: input.id, date: input.date, time: input.time, status: "CONFIRMED" };
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    throw new Error("Failed to reschedule appointment");
  }
}
