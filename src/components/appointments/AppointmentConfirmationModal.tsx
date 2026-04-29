import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, MailIcon, CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AppointmentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentDetails: {
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    userEmail: string;
  };
}

export function AppointmentConfirmationModal({
  open,
  onOpenChange,
  appointmentDetails,
}: AppointmentConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header row */}
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircleIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-lg font-semibold text-center">
            Appointment Confirmed!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Your appointment has been successfully booked
          </DialogDescription>
        </DialogHeader>

        {/* Two-column layout */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left: email image + email */}
          <div className="flex flex-col items-center justify-center gap-2 bg-muted/20 rounded-lg p-4">
            <Image
              src="/email-sent.png"
              alt="Email sent"
              width={80}
              height={80}
              className="mx-auto"
            />
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary">
                <MailIcon className="h-4 w-4" />
                Details sent to your inbox
              </div>
              {appointmentDetails?.userEmail && (
                <p className="text-xs text-muted-foreground">{appointmentDetails.userEmail}</p>
              )}
            </div>
          </div>

          {/* Right: appointment summary */}
          {appointmentDetails && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm text-center mb-2">Quick Summary</h4>
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium truncate">{appointmentDetails.doctorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{appointmentDetails.appointmentDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{appointmentDetails.appointmentTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <Link href="/appointments" className="flex-1">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              View My Appointments
            </Button>
          </Link>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground border-t pt-3 mt-1">
          Please arrive 15 minutes early. To reschedule, contact us 24 hours in advance.
        </p>
      </DialogContent>
    </Dialog>
  );
}