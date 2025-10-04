import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Camera, Video, Wand2, Download, Share2, Clock } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Smart Whiteboard Capture",
    description: "Advanced computer vision automatically detects and captures your whiteboard content in real-time.",
    badge: "AI-Powered"
  },
  {
    icon: Video,
    title: "Instant Video Generation",
    description: "Transform captured content into polished educational videos with automated editing and transitions.",
    badge: "Automated"
  },
  {
    icon: Wand2,
    title: "AI Enhancement",
    description: "Enhance video quality, add captions, and improve audio clarity using advanced AI algorithms.",
    badge: "Enhanced"
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Export your videos in various formats and resolutions, optimized for different platforms.",
    badge: "Flexible"
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your educational videos directly to learning platforms, social media, or cloud storage.",
    badge: "Connected"
  },
  {
    icon: Clock,
    title: "Time-Saving Workflow",
    description: "Reduce video production time from hours to minutes with our streamlined creation process.",
    badge: "Efficient"
  }
];

export function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="secondary">Features</Badge>
            <h2 className="text-3xl sm:text-5xl">
              Everything You Need to Create
              <br />
              <span className="text-primary">Professional Educational Videos</span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our comprehensive suite of tools makes it easy to capture, enhance, and share your educational content with students around the world.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <Badge variant="outline">{feature.badge}</Badge>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}