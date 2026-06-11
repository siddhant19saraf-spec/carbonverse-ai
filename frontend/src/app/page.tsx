"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, TrendingDown, BrainCircuit, BarChart3, Shield, Zap, Globe } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Smart Calculator", desc: "Track emissions across transportation, food, energy, water, and waste." },
  { icon: BrainCircuit, title: "AI Sustainability Coach", desc: "Get personalized advice and weekly insights from our AI assistant." },
  { icon: TrendingDown, title: "Carbon Predictions", desc: "See forecasted emissions and set reduction targets with confidence." },
  { icon: Shield, title: "Gamified Progress", desc: "Earn badges, maintain streaks, and compete in sustainability challenges." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-emerald-500" />
          <span className="text-xl font-bold gradient-text">CarbonVerse AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          <Link href="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Get Started</Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Your <span className="gradient-text">Carbon</span> Journey<br />Starts Here
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track, understand, and reduce your environmental impact with AI-powered insights
            and a gamified sustainability experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
              Start Tracking <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="border border-border hover:bg-accent px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
              View Dashboard <BarChart3 className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-bold text-center mb-12">
          Everything You Need to Go Green
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <f.icon className="h-10 w-10 text-emerald-500 mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">CarbonVerse AI</span>
        </div>
        <p>Built for a sustainable future. Track. Reduce. Thrive.</p>
      </footer>
    </div>
  );
}
