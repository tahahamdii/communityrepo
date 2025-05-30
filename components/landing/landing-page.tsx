import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Trophy, TrendingUp, Star, Shield } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-team-primary to-team-secondary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">FZ</span>
            </div>
            <span className="text-xl font-bold">FanZone</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🏆 The Ultimate Sports Fan Community
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-team-primary to-team-secondary bg-clip-text text-transparent">
            Where Sports Fans Unite
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with passionate sports fans, join exclusive fan groups, participate in live polls, and climb the
            rankings in the ultimate sports community platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Join FanZone Free
              </Button>
            </Link>
            <Link href="/groups/discover">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Groups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need as a Sports Fan</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From live discussions to exclusive content, FanZone has all the tools to enhance your sports experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-team-primary/20 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-team-primary mb-4" />
              <CardTitle>Fan Groups</CardTitle>
              <CardDescription>
                Join exclusive groups for your favorite teams and sports. Connect with like-minded fans worldwide.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-team-primary/20 transition-colors">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-team-primary mb-4" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>
                Real-time discussions during games and events. Share your reactions and connect instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-team-primary/20 transition-colors">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-team-primary mb-4" />
              <CardTitle>Live Polls</CardTitle>
              <CardDescription>
                Vote on predictions, player performances, and game outcomes. See results in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-team-primary/20 transition-colors">
            <CardHeader>
              <Trophy className="h-12 w-12 text-team-primary mb-4" />
              <CardTitle>Rankings</CardTitle>
              <CardDescription>
                Earn points for participation and climb the leaderboards. Show off your fan dedication.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-team-primary/20 transition-colors">
            <CardHeader>
              <Star className="h-12 w-12 text-team-primary mb-4" />
              <CardTitle>Content Sharing</CardTitle>
              <CardDescription>
                Share posts, images, and reactions. Get likes and build your reputation in the community.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-team-primary/20 transition-colors">
            <CardHeader>
              <Shield className="h-12 w-12 text-team-primary mb-4" />
              <CardTitle>Safe Environment</CardTitle>
              <CardDescription>
                AI-powered moderation ensures a positive experience for all fans. Report inappropriate content easily.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-team-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Fans</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-team-primary mb-2">500+</div>
              <div className="text-muted-foreground">Fan Groups</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-team-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Messages Sent</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-team-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Polls Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Community?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start connecting with sports fans today. It's free and takes less than a minute to get started.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 bg-gradient-to-r from-team-primary to-team-secondary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">FZ</span>
              </div>
              <span className="font-semibold">FanZone</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 FanZone. All rights reserved. Built for sports fans, by sports fans.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
