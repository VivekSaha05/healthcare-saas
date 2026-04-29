import Navbar from "@/components/Navbar";
import { MicIcon, SparklesIcon, ClockIcon } from "lucide-react";

export default function VoicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MicIcon className="w-10 h-10 text-primary" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <ClockIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium text-primary">Coming Soon</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Voice Assistant</h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
            We&apos;re building an AI-powered voice assistant that lets you get instant health advice
            through real-time voice conversations. Stay tuned — it&apos;s almost here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: SparklesIcon, title: "AI-Powered", desc: "Real-time health guidance" },
              { icon: MicIcon, title: "Voice First", desc: "Natural conversation interface" },
              { icon: ClockIcon, title: "24/7 Access", desc: "Available anytime you need" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm mb-1">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
