import { Video, Github, Linkedin, Mail } from "lucide-react";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background relative">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex justify-center py-8 md:py-12">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Video className="h-6 w-6 text-primary" />
              <span className="font-bold">EduCapture</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transform your whiteboard lessons into professional educational videos with AI-powered capture and generation.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center py-6">
          <p className="text-xs text-muted-foreground">
            © 2024 EduCapture. All rights reserved.
          </p>
          <div className="flex space-x-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
        
        {/* Decorative triangles */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
          <div className="flex justify-center space-x-8 pb-2">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-primary opacity-60"></div>
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-primary opacity-80"></div>
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-primary opacity-70"></div>
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[9px] border-l-transparent border-r-transparent border-b-primary opacity-90"></div>
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-primary opacity-60"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}