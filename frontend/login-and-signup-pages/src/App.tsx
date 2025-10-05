import { AuthForm } from "./components/AuthForm";
import { Toaster } from "./components/ui/sonner";
import { Cog, Settings, Bolt } from "lucide-react";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Metal plate texture background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(139, 90, 60, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(139, 90, 60, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(139, 90, 60, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 60% 20%, rgba(139, 90, 60, 0.3) 1px, transparent 1px),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 90, 60, 0.1) 2px,
              rgba(139, 90, 60, 0.1) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 90, 60, 0.1) 2px,
              rgba(139, 90, 60, 0.1) 4px
            )
          `,
          backgroundSize: '60px 60px, 80px 80px, 70px 70px, 90px 90px, 4px 4px, 4px 4px'
        }} />
      </div>
      
      {/* Bronze border frame */}
      <div className="absolute inset-0 pointer-events-none border-4 border-primary/40"></div>
      
      {/* Brass panel edges with gradient depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top brass bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-primary/40 via-accent/30 to-transparent border-b border-primary/20" />
        {/* Bottom brass bar */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-primary/40 via-accent/30 to-transparent border-t border-primary/20" />
        {/* Left brass bar */}
        <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-primary/40 via-accent/30 to-transparent border-r border-primary/20" />
        {/* Right brass bar */}
        <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-primary/40 via-accent/30 to-transparent border-l border-primary/20" />
      </div>
      
      {/* Ornate corner brackets */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-primary opacity-40" />
      <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-primary opacity-40" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-primary opacity-40" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-primary opacity-40" />
      
      {/* Floating gears - top left */}
      <div className="absolute top-20 left-20 opacity-10">
        <Cog className="w-32 h-32 text-primary animate-spin [animation-duration:40s]" />
      </div>
      
      {/* Floating gears - bottom right */}
      <div className="absolute bottom-20 right-20 opacity-10">
        <Settings className="w-40 h-40 text-accent animate-spin [animation-duration:50s] [animation-direction:reverse]" />
      </div>
      
      {/* Floating gears - top right */}
      <div className="absolute top-32 right-32 opacity-8">
        <Bolt className="w-24 h-24 text-primary/80 animate-spin [animation-duration:30s]" />
      </div>
      
      {/* Steam/smoke effect particles */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-foreground/5 rounded-full blur-3xl animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-1/3 right-16 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-pulse [animation-duration:10s] [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/4 w-28 h-28 bg-primary/5 rounded-full blur-3xl animate-pulse [animation-duration:12s] [animation-delay:4s]" />
      
      {/* Radial glow effect - enhanced */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-accent/5 to-transparent" />
      
      {/* Vignette effect - stronger */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
      
      {/* Brass light rays */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-primary via-transparent to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <AuthForm />
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border-2 border-primary text-foreground",
            title: "text-foreground",
            description: "text-muted-foreground",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-muted text-muted-foreground",
            closeButton: "bg-muted text-muted-foreground",
          },
        }}
      />
    </div>
  );
}