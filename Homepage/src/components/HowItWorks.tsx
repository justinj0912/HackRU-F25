import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Camera, Cog, Video, Share } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Capture Your Whiteboard",
    description: "Simply start recording and our AI will automatically detect and capture your whiteboard content as you teach."
  },
  {
    number: "02",
    icon: Cog,
    title: "AI Processing",
    description: "Our advanced algorithms enhance the captured content, improve clarity, and prepare it for video generation."
  },
  {
    number: "03",
    icon: Video,
    title: "Generate Video",
    description: "Watch as your whiteboard content is transformed into a professional educational video with transitions and effects."
  },
  {
    number: "04",
    icon: Share,
    title: "Share & Export",
    description: "Export your video in multiple formats and share it with students across various platforms and devices."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="secondary">How It Works</Badge>
            <h2 className="text-3xl sm:text-5xl">
              From Whiteboard to Video
              <br />
              <span className="text-primary">In Just Four Simple Steps</span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our streamlined process makes it incredibly easy to transform your teaching into engaging video content.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 py-12 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{step.number}</Badge>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pl-16">
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1643982102543-bc057db646cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwcHJlc2VudGluZyUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU5NjAwMDczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Teacher presenting at whiteboard"
                className="aspect-[3/4] overflow-hidden rounded-xl object-cover shadow-2xl"
                width={400}
                height={533}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                <Badge className="backdrop-blur-sm bg-white/90 text-foreground">
                  Live Demo
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}