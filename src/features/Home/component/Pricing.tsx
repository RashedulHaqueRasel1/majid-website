"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleX,
  Zap,
  Sparkles,
  FileText,
  Award,
  Gem,
} from "lucide-react";

export default function Pricing() {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="mx-auto container px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-[#0F172A] mb-4"
        >
          Flexible <span className="text-blue-500">Pricing</span> That Fits Your{" "}
          <span className="text-primary">Needs</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg mb-16"
        >
          Start free, pay as you grow, or save more with subscriptions.
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {/* Starter Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-blue-500/10 dark:bg-blue-500/5 rounded-[40px] p-10 flex flex-col items-start text-left h-full border border-blue-500/10"
          >
            <span className="bg-background text-blue-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-6">
              Starter
            </span>
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-4xl font-black text-foreground">$0</span>
              <span className="text-sm font-bold text-muted-foreground">
                /month
              </span>
            </div>

            <div className="space-y-4 mb-10 w-full">
              <FeatureItem
                icon={<CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />}
                text="2 Free Checks"
              />
              <FeatureItem
                icon={<CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />}
                text="Basic Device Report"
              />
              <FeatureItem
                icon={<CircleX className="w-5 h-5 text-[#94A3B8]" />}
                text="No AI Explanation"
                active={false}
              />
            </div>

            <button className="w-full mt-auto bg-white hover:bg-gray-50 border border-[#84CC16] text-[#0F172A] font-bold py-4 rounded-2xl transition shadow-sm  text-[#84CC16] cursor-pointer">
              Start Free
            </button>
          </motion.div>

          {/* Featured Card: Custom Top-up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary/10 dark:bg-primary/5 rounded-[40px] p-10 flex flex-col items-start text-left h-full relative border-2 border-primary/20"
          >
            {/* Featured Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 whitespace-nowrap">
              Most Flexible
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-muted-foreground mb-2">
                Custom Top-up
              </h3>
              <div className="text-4xl font-black text-foreground mb-10">
                $2 – $30
              </div>
            </div>

            <div className="space-y-4 mb-10 w-full">
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-blue-500" />}
                text="Top-up from $2 to $30"
              />
              <FeatureItem
                icon={<Sparkles className="w-5 h-5 text-blue-500" />}
                text="AI explanation"
              />
              <FeatureItem
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                text="Powerful invoicing available"
              />
              <FeatureItem
                icon={<Award className="w-5 h-5 text-blue-500" />}
                text="Certificate available"
              />
            </div>

            <button className="w-full mt-auto bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-2xl transition shadow-lg shadow-primary/20 cursor-pointer">
              Top Up & Start
            </button>
          </motion.div>

          {/* Enterprise Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-purple-500/10 dark:bg-purple-500/5 rounded-[40px] p-10 flex flex-col items-start text-left h-full border border-purple-500/10"
          >
            <h3 className="text-3xl font-black text-foreground mb-10">
              Enterprise
            </h3>

            <div className="space-y-4 mb-8 w-full">
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-blue-500" />}
                text="Top-up from $2 to $30"
              />
              <FeatureItem
                icon={<Sparkles className="w-5 h-5 text-blue-500" />}
                text="AI explanation"
              />
              <FeatureItem
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                text="Powerful invoicing available"
              />
            </div>

            {/* Special Offer Pill */}
            <div className="w-full bg-card rounded-2xl p-4 flex items-center justify-between mb-8 border border-purple-100/20 shadow-sm">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold text-foreground">
                  Diamond
                </span>
              </div>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">
                10% Off
              </span>
            </div>

            <button className="w-full mt-auto bg-background hover:bg-muted text-primary font-bold py-4 rounded-2xl transition shadow-sm border border-primary cursor-pointer">
              View Plans
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  icon,
  text,
  active = true,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span
        className={`text-sm font-semibold ${active ? "text-foreground" : "text-muted-foreground line-through decoration-2"}`}
      >
        {text}
      </span>
    </div>
  );
}
