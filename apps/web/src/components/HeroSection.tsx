"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative w-full max-w-7xl mx-auto px-8 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
            {/* Left Column - Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-xl"
            >
                <div className="inline-block px-4 py-1.5 bg-brand-200 text-brand-700 text-sm font-semibold rounded-full mb-6">
                    Multiple offers
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-brand-900 leading-[1.1] mb-6 tracking-tight">
                    Startup acquisition marketplace.
                    <br className="hidden lg:block" /> Free. Private. No middlemen.
                </h1>
                <p className="text-lg text-brand-700 mb-10 leading-relaxed max-w-lg">
                    Start the right acquisition conversations at your own pace. Get free and instant access to trusted buyers with total anonymity. Say goodbye to brokers and meet your ideal buyer today.
                </p>
                <Link
                    href="/join"
                    className="inline-flex items-center justify-center gap-2 bg-brand-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-brand-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
                >
                    Join Now <ArrowRight className="w-5 h-5" />
                </Link>
            </motion.div>

            {/* Right Column - Animated Cards */}
            <div className="relative h-[600px] w-full hidden lg:block">
                {/* Background decorative elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute top-0 right-10 w-64 h-48 bg-brand-300/40 rounded-3xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="absolute bottom-10 right-0 w-72 h-64 bg-brand-300/50 rounded-3xl"
                />

                {/* Main Blue Floating Card */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
                    className="absolute top-1/4 left-10 w-96 bg-brand-500 rounded-3xl p-8 text-white shadow-2xl z-10 animate-float"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-brand-100 text-sm font-medium mb-1">Deal price amount</p>
                            <p className="text-brand-300 text-xs">Category: Tech and medicine</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-white bg-green-400"></div>
                    </div>

                    <h2 className="text-5xl font-bold mb-8">
                        $87<span className="text-3xl text-brand-200">,634</span>
                    </h2>

                    <div className="space-y-3 mb-8">
                        <p className="text-sm font-semibold">About startup:</p>
                        <p className="text-xs text-brand-200 leading-relaxed">
                            The API pulling API is easy to integrate into existing websites, mobile apps, or even CRM systems. <strong>Developers can use</strong> out of the box functionality to get started quickly or use our composable API building blocks to design <strong>fully customized</strong> subscription logic and pricing models.
                        </p>
                    </div>

                    <div className="w-full h-1 bg-brand-400/50 rounded-full mb-6"></div>

                    <button className="px-6 py-2.5 bg-brand-400/30 hover:bg-brand-400/50 transition-colors rounded-lg text-sm font-medium">
                        Send request
                    </button>
                </motion.div>

                {/* Bottom Left Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute bottom-0 left-0 w-72 bg-brand-300 rounded-3xl p-6 shadow-xl z-20"
                >
                    <p className="text-brand-800 font-semibold mb-4 pr-4">
                        Watch how we can help you to sell your startup instantly
                    </p>
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-500 shadow-md hover:scale-105 transition-transform">
                        <div className="w-0 h-0 border-t-6 border-b-6 border-l-8 border-transparent border-l-current ml-1"></div>
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
