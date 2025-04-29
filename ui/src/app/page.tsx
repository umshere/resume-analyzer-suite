import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Zap,
  BarChart,
  Users,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Get immediate insights into candidate fit with our advanced LLM-powered analysis.",
  },
  {
    icon: Upload,
    title: "Bulk Processing",
    description:
      "Upload multiple resumes at once and get comparative analysis results.",
  },
  {
    icon: BarChart,
    title: "Match Scoring",
    description:
      "See detailed match scores and analysis for each candidate against your requirements.",
  },
  {
    icon: CheckCircle,
    title: "Key Skills Match",
    description:
      "Identify candidates with the most relevant skills and experience.",
  },
  {
    icon: FileText,
    title: "Smart Parsing",
    description:
      "Automatically extract and analyze key information from resumes.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share analysis results and collaborate on candidate evaluation.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Smart Resume Analysis for
            <span className="text-primary"> Product Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Streamline your APM hiring process with AI-powered resume analysis.
            Match candidates to your requirements instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/playground">Try Playground</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/bulk">Bulk Analysis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Efficient Hiring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border bg-card">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose your preferred mode to get started with AI-powered resume
            analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Playground</CardTitle>
                <CardDescription>
                  Analyze single resumes with detailed feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/playground">Try Playground</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bulk Analysis</CardTitle>
                <CardDescription>
                  Process multiple resumes efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/bulk">Start Bulk Analysis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
