export type UserRole = "ADMIN" | "USER";
export type Gender = "MALE" | "FEMALE";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type UserPlan = "FREE" | "PRO";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  bio: string | null;
  imageUrl: string;
  gender: Gender;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  appointmentCount?: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  doctorImageUrl: string;
}
