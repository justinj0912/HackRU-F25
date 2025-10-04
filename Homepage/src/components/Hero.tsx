import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                ✨ New: AI-Powered Video Generation
              </Badge>
              <h1 className="text-3xl sm:text-5xl xl:text-6xl/none">
                Transform Your Whiteboard Into
                <span className="text-primary"> Educational Videos</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Capture your whiteboard lessons and automatically generate engaging educational videos with AI. Perfect for teachers, trainers, and educators worldwide.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="h-11">
                Start Creating Videos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-11">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>✓</span>
                <span>No setup required</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>✓</span>
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>✓</span>
                <span>Export in HD</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNoYWxrYm9hcmQlMjB0ZWFjaGluZyUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTk2MDcyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Green chalkboard for teaching"
                className="aspect-[4/3] overflow-hidden rounded-xl object-cover shadow-2xl"
                width={600}
                height={450}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge variant="secondary" className="backdrop-blur-sm bg-gray-700/90">
                  Live Capture & AI Generation
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}