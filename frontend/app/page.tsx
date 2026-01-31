import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Calendar, Clock, Phone, Shield, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Call Me Reminder</span>
          </div>
          <nav className=" items-center space-x-4 hidden sm:flex">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-8 py-24 md:py-32 mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <Zap className="mr-2 h-4 w-4" />
            Never miss an important moment
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Voice Reminders
            <br />
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              That Actually Call You
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Set up reminders that call your phone with AI-powered voice
            messages. Perfect for important tasks you can&apos;t afford to miss.
          </p>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start For Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mx-auto mt-16 w-full max-w-5xl border rounded-md relative h-auto aspect-video">
          <Image
            src="/dashboard-light.png"
            alt="Call Me Reminder Dashboard Demo"
            className="block dark:hidden"
            fill
            unoptimized
          />
          <Image
            src="/dashboard.png"
            alt="Call Me Reminder Dashboard Demo"
            className="rounded-lg hidden dark:block"
            fill
            unoptimized
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container space-y-16 mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for voice reminders
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features to ensure you never miss what matters most
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Phone className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">AI Voice Calls</CardTitle>
                <CardDescription>
                  Get called with natural-sounding AI voice messages when your
                  reminder is due
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Schedule Anytime</CardTitle>
                <CardDescription>
                  Set reminders for any date and time. Perfect for appointments,
                  meetings, and deadlines
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Reliable Delivery</CardTitle>
                <CardDescription>
                  Automated system ensures your reminders are delivered exactly
                  when you need them
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Custom Messages</CardTitle>
                <CardDescription>
                  Personalize each reminder with your own message that will be
                  spoken to you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Secure & Private</CardTitle>
                <CardDescription>
                  Your data is encrypted and secure. We never share your
                  information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Lightning Fast</CardTitle>
                <CardDescription>
                  Quick setup and instant synchronization across all your
                  devices
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-24 mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in three simple steps
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              1
            </div>
            <h3 className="mt-4 text-xl font-semibold">Create Reminder</h3>
            <p className="mt-2 text-muted-foreground">
              Set your reminder with a custom message, date, and time
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              2
            </div>
            <h3 className="mt-4 text-xl font-semibold">We Handle the Rest</h3>
            <p className="mt-2 text-muted-foreground">
              Our system monitors and prepares your reminder call
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              3
            </div>
            <h3 className="mt-4 text-xl font-semibold">Get Your Call</h3>
            <p className="mt-2 text-muted-foreground">
              Receive an AI voice call with your personalized message
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of users who never miss important moments
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Create Free Account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Call Me Reminder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Call Me Reminder. Built for demonstration purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
