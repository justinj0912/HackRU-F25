import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <Card className="relative overflow-hidden border-2 border-dashed border-primary/20">
          <CardContent className="p-6 md:p-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Ready to Get Started?</span>
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-3xl sm:text-5xl">
                  Transform Your Teaching Today
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of educators creating engaging video content. Start your free trial and see the difference AI-powered video generation can make.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="h-11">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="h-11">
                  Schedule Demo
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>✓</span>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✓</span>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✓</span>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        </Card>
      </div>
    </section>
  );
}