"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  CreditCard,
  Settings,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user, profile, updateUserProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const primaryEmail = user?.email ?? "";

  const displayName = useMemo(() => {
    if (!profile) return "User";
    return (
      [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User"
    );
  }, [profile]);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=004A61&color=fff&size=128&bold=true&rounded=true`;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in to view and manage your profile.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading("Updating your profile...");
    try {
      await updateUserProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setFirstName("");
      setLastName("");
      toast.success("Profile updated successfully!", { id: loadingToast, icon: "✓" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update profile", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6 bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 flex-1">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-card rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm truncate">{primaryEmail}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || (!firstName.trim() && !lastName.trim())}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  type="button"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            {/* Personal Info */}
            <div className="border border-border rounded-2xl p-6 sm:p-8 bg-card">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">Update your display name.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={profile?.firstName ?? "Enter first name"}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={profile?.lastName ?? "Enter last name"}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>

                <div className="bg-muted/50 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Email address is linked to your Firebase account and cannot be changed here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Info */}
            <div className="border border-border rounded-2xl p-6 sm:p-8 bg-card">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Subscription</h2>
                  <p className="text-sm text-muted-foreground">Your current plan.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Current Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.plan === "PRO" ? "Premium access" : "Basic access"}
                    </p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${profile?.plan === "PRO" ? "text-primary" : "text-muted-foreground"}`}>
                  {profile?.plan ?? "FREE"}
                </span>
              </div>

              {profile?.plan !== "PRO" && (
                <div className="mt-4">
                  <Link
                    href="/pro"
                    className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Upgrade to PRO
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Account Overview */}
          <section className="mt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email Verified</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {user?.emailVerified ? "Yes" : "No"}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Account Type</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {profile?.role === "ADMIN" ? "Admin" : "Patient"}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                </div>
                <p className="text-lg font-bold text-foreground">{profile?.plan ?? "FREE"}</p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/appointments"
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Calendar className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">Book Appointment</h3>
                </div>
                <p className="text-sm text-muted-foreground">Schedule a visit with our specialists</p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Settings className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">My Dashboard</h3>
                </div>
                <p className="text-sm text-muted-foreground">View appointments and health records</p>
              </Link>

              <Link
                href="/pro"
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <CreditCard className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">Upgrade Plan</h3>
                </div>
                <p className="text-sm text-muted-foreground">Unlock AI voice assistant and more</p>
              </Link>
            </div>
          </section>

          {/* Security */}
          <section className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Security & Privacy</h2>
                  <p className="text-sm text-muted-foreground">
                    Keep your account secure with these settings
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className={`w-5 h-5 mt-0.5 ${user?.emailVerified ? "text-emerald-600" : "text-amber-600"}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email Verification</p>
                      <p className="text-xs text-muted-foreground">Verify your email address</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      user?.emailVerified
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {user?.emailVerified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Authentication</p>
                      <p className="text-xs text-muted-foreground">Secured with Firebase Authentication</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
