import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Video, Zap, Share2, Settings } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gear watermarks */}
      <div className="absolute left-10 top-40 opacity-5 pointer-events-none">
        <Settings className="w-96 h-96 text-primary" strokeWidth={1} />
      </div>
      <div className="absolute right-10 top-[600px] opacity-5 pointer-events-none">
        <Settings className="w-80 h-80 text-primary" strokeWidth={1} />
      </div>
      <div className="absolute left-20 bottom-40 opacity-5 pointer-events-none">
        <Settings className="w-72 h-72 text-primary" strokeWidth={1} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/30 border-2 border-primary">
                  <Settings className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/40 border border-primary flex items-center justify-center">
                  <Settings className="w-2.5 h-2.5 text-primary" />
                </div>
              </div>
              <span className="text-2xl font-bold text-primary tracking-widest uppercase">Cognify</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="#features" className="text-foreground/80 hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#contact" className="text-foreground/80 hover:text-primary transition-colors">
                Contact
              </Link>
              <Button className="bg-primary/40 hover:bg-primary/50 border-2 border-primary text-foreground">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-32 bg-primary/30"></div>
          <div className="w-3 h-3 rotate-45 bg-primary/50 mx-4"></div>
          <div className="h-px w-32 bg-primary/30"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold text-foreground leading-tight">
            Transform Your Whiteboard Into <span className="text-primary">Educational Videos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Capture, enhance, and share your teaching moments. Cognify automatically converts your whiteboard content
            into polished educational videos.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary/40 hover:bg-primary/50 border-2 border-primary text-foreground text-lg px-8"
            >
              Start Creating
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center mt-16">
          <div className="h-px w-32 bg-primary/30"></div>
          <div className="w-3 h-3 rotate-45 bg-primary/50 mx-4"></div>
          <div className="h-px w-32 bg-primary/30"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need to create engaging educational content</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 border-2 border-primary/50 bg-card/80 backdrop-blur-sm hover:border-primary transition-colors">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/30 border-2 border-primary mb-6">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Smart Capture</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced AI recognizes and enhances whiteboard content, removing glare and optimizing visibility.
            </p>
          </Card>

          <Card className="p-8 border-2 border-primary/50 bg-card/80 backdrop-blur-sm hover:border-primary transition-colors">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/30 border-2 border-primary mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Instant Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Generate professional videos in minutes with automated editing, transitions, and enhancements.
            </p>
          </Card>

          <Card className="p-8 border-2 border-primary/50 bg-card/80 backdrop-blur-sm hover:border-primary transition-colors">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/30 border-2 border-primary mb-6">
              <Share2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Easy Sharing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Share directly to learning platforms, social media, or download for offline distribution.
            </p>
          </Card>
        </div>

        <div className="flex items-center justify-center mt-16">
          <div className="h-px w-32 bg-primary/30"></div>
          <div className="w-3 h-3 rotate-45 bg-primary/50 mx-4"></div>
          <div className="h-px w-32 bg-primary/30"></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <Card className="max-w-4xl mx-auto p-16 text-center border-2 border-primary/50 bg-card/80 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Transform Your Teaching?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join educators worldwide who are creating engaging educational content with Cognify.
          </p>
          <Button
            size="lg"
            className="bg-primary/40 hover:bg-primary/50 border-2 border-primary text-foreground text-lg px-12"
          >
            Get Started Now
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/20 bg-background/80 backdrop-blur-sm mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/30 border-2 border-primary">
                  <Settings className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/40 border border-primary flex items-center justify-center">
                  <Settings className="w-2.5 h-2.5 text-primary" />
                </div>
              </div>
              <span className="text-2xl font-bold text-primary tracking-widest uppercase">Cognify</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
