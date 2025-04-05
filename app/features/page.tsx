import Link from "next/link"
import { ArrowRight, Globe, Youtube, Users, Bot, Database, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Ascend Flow
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium hover:underline">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Features
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Discover how Ascend Flow transforms your learning experience with these powerful features.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:gap-12">
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Web Scraping for Learning</h3>
                  <p className="text-muted-foreground">
                    Our platform scrapes the web for high-quality learning resources based on online published works,
                    ensuring you have access to the most relevant and up-to-date content.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Youtube className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">AI YouTube Recommendations</h3>
                  <p className="text-muted-foreground">
                    Our AI analyzes your learning goals and preferences to recommend the best YouTube playlists and
                    videos, creating a personalized learning path just for you.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Community-Based Recommendations</h3>
                  <p className="text-muted-foreground">
                    Learn from others with similar interests. Our community-based recommendation system connects you
                    with like-minded learners and their favorite resources.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">AI Chatbot Assistant</h3>
                  <p className="text-muted-foreground">
                    Get instant help with our AI chatbot that can answer questions, provide learning resources, and
                    guide you through difficult concepts in real-time.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Smart Backlog</h3>
                  <p className="text-muted-foreground">
                    Never lose track of what you're learning. Our smart backlog system organizes your learning materials
                    and prioritizes them based on your goals and schedule.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Layout className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Clean Gamified UI</h3>
                  <p className="text-muted-foreground">
                    Learning should be fun! Our clean, gamified interface makes tracking your progress engaging and
                    motivating, helping you stay committed to your learning goals.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-1">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tech Stack</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Built with modern technologies for optimal performance and user experience
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary">
                      <path
                        fill="currentColor"
                        d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Next.js</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    The React framework for production, providing server-side rendering and static site generation.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary">
                      <path
                        fill="currentColor"
                        d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Tailwind CSS</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    A utility-first CSS framework for rapid UI development without leaving your HTML.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary">
                      <path
                        fill="currentColor"
                        d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">TypeScript</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    A typed superset of JavaScript that compiles to plain JavaScript for safer code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Ascend Flow. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm font-medium hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm font-medium hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

