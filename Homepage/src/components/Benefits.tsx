import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, Globe, Clock, TrendingUp, BookOpen, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const benefits = [
  {
    icon: Users,
    title: "Reach More Students",
    description: "Create scalable educational content that can reach students anywhere, anytime."
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Reduce video production time by 90% with automated capture and editing."
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Make your teaching accessible to students around the world with easy sharing."
  },
  {
    icon: TrendingUp,
    title: "Improve Engagement",
    description: "Enhanced video quality and professional presentation boost student engagement."
  },
  {
    icon: BookOpen,
    title: "Build Libraries",
    description: "Create comprehensive video libraries of your best lessons and explanations."
  },
  {
    icon: Zap,
    title: "Stay Current",
    description: "Quickly update and recreate content as curriculum and knowledge evolve."
  }
];

export function Benefits() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1629360021730-3d258452c425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbGVhcm5pbmclMjBvbmxpbmUlMjBlZHVjYXRpb258ZW58MXx8fHwxNzU5NjAwMDcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Digital learning and online education"
                className="aspect-[4/3] overflow-hidden rounded-xl object-cover shadow-2xl"
                width={600}
                height={450}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
                  Digital Education Platform
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <Badge variant="secondary">Benefits</Badge>
              <h2 className="text-3xl sm:text-5xl">
                Why Educators
                <span className="text-primary"> Love EduCapture</span>
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of educators who have transformed their teaching with our AI-powered video generation platform.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-none shadow-none bg-transparent">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{benefit.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-13 pt-0">
                    <CardDescription>
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}