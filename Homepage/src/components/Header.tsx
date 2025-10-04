import { Button } from "./ui/button";
import { Menu, Video, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Video className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">EduCapture</span>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          <a
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="#features"
          >
            Features
          </a>
          <a
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="#how-it-works"
          >
            How It Works
          </a>
          <a
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="#benefits"
          >
            Benefits
          </a>
          <a
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="#about"
          >
            About
          </a>
        </nav>

        <div className="flex items-center space-x-2 ml-auto">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Sign In
          </Button>
          <Button size="sm">
            Get Started
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <a className="flex items-center space-x-2" href="/">
                <Video className="h-6 w-6 text-primary" />
                <span className="font-bold">EduCapture</span>
              </a>
              <nav className="flex flex-col space-y-3">
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#features"
                >
                  Features
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#how-it-works"
                >
                  How It Works
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#benefits"
                >
                  Benefits
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#about"
                >
                  About
                </a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                  <Button size="sm">
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}