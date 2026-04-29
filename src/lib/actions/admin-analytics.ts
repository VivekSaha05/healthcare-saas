"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/get-server-user";
import { Timestamp } from "firebase-admin/firestore";
import { subDays, startOfDay, endOfDay } from "date-fns";
import type { AppointmentStatus } from "@/lib/types";

export async function getAdminAnalytics() {
  await requireAdmin();

  const today = new Date();
  const from = startOfDay(subDays(today, 6));
  const to = endOfDay(today);

  const [usersSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("doctors").get(),
    adminDb.collection("appointments").get(),
  ]);

  const totalUsers = usersSnap.size;
  const totalDoctors = doctorsSnap.size;
  const activeDoctors = doctorsSnap.docs.filter((d) => d.data().isActive).length;
  const totalAppointments = appointmentsSnap.size;

  const statusCounts: Record<AppointmentStatus, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  const countByDoctor: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  for (const d of appointmentsSnap.docs) {
    const data = d.data();
    const status = data.status as AppointmentStatus;
    if (status in statusCounts) statusCounts[status]++;

    const doctorId = data.doctorId as string;
    countByDoctor[doctorId] = (countByDoctor[doctorId] ?? 0) + 1;

    const apptDate: Date =
      data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);

    if (apptDate >= from && apptDate <= to) {
      const dayKey = apptDate.toISOString().slice(0, 10);
      dailyCounts[dayKey] = (dailyCounts[dayKey] ?? 0) + 1;
    }
  }

  const daily = Array.from({ length: 7 }).map((_, i) => {
    const day = startOfDay(subDays(today, 6 - i));
    const key = day.toISOString().slice(0, 10);
    return { day: key, count: dailyCounts[key] ?? 0 };
  });

  // Top 5 doctors by appointment count
  const topDoctorIds = Object.entries(countByDoctor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const topDoctors = topDoctorIds.map((doctorId) => {
    const snap = doctorsSnap.docs.find((d) => d.id === doctorId);
    const data = snap?.data();
    return {
      doctorId,
      name: data?.name ?? "Unknown",
      speciality: data?.speciality ?? "—",
      isActive: data?.isActive ?? false,
      count: countByDoctor[doctorId] ?? 0,
    };
  });

  return {
    totals: { totalUsers, totalDoctors, activeDoctors, totalAppointments },
    statusCounts,
    daily,
    topDoctors,
  };
}
