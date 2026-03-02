"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

export function ProcessSteps() {
    return (
        <section className="w-full max-w-7xl mx-auto px-8 py-24">
            <div className="bg-white rounded-[2.5rem] p-12 lg:p-20 shadow-xl border border-brand-100 flex flex-col lg:flex-row gap-16 items-center">

                {/* Left Side - Interactive Device Mockup */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-1/2 flex justify-center"
                >
                    <div className="bg-[#c8e6c9] w-full max-w-md aspect-[4/5] rounded-[2.5rem] p-8 relative flex flex-col items-center">
                        <div className="w-full h-full bg-[#8fa9cc] rounded-2xl shadow-lg flex flex-col pt-10 px-6 relative overflow-hidden">
                            <h3 className="text-white font-semibold mb-1 text-lg">Create your account</h3>
                            <p className="text-white/80 text-xs mb-8">All data is private</p>

                            <div className="bg-white rounded-full py-4 px-6 flex justify-between items-center shadow-sm">
                                <span className="text-brand-700/60 text-sm">Startup name</span>
                                <ArrowRight className="text-brand-500 w-4 h-4" />
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-32 bg-white rounded-t-2xl p-6 flex flex-col gap-3 justify-center">
                                <div className="w-3/4 h-2 bg-brand-100 rounded-full"></div>
                                <div className="w-1/2 h-2 bg-brand-100 rounded-full"></div>
                            </div>
                        </div>

                        {/* Pagination Navigation */}
                        <div className="absolute bottom-6 flex items-center gap-6 text-brand-800 font-medium">
                            <button className="hover:text-brand-500 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span><span className="font-bold">01</span> / 03</span>
                            <button className="hover:text-brand-500 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full lg:w-1/2"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-brand-900 leading-tight mb-6">
                        Sell in 3 easy steps
                    </h2>
                    <p className="text-brand-700 text-lg leading-relaxed mb-10">
                        MicroAcquire helps startups find potential acquirers. Simple as that. We'll connect you with the right people to start those conversations that lead to an acquisition within 30 days.
                    </p>

                    <div className="space-y-6 mb-12">
                        {[
                            "Set up your account",
                            "Respond to private requests",
                            "Meet the right buyers"
                        ].map((step, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-brand-900 font-semibold text-lg">
                                <div className="w-6 h-6 rounded-full border-[3px] border-brand-400"></div>
                                {step}
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-px border-t border-dashed border-brand-200 mb-8"></div>

                    <div className="flex gap-4 items-start flex-col">
                        <p className="italic text-brand-700 leading-relaxed mb-6 font-medium">
                            "I'm convinced that about half of what separates the successful entrepreneurs from the non-successful ones is pure perseverance."
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-200 flex-shrink-0 relative">
                                {/* In a real project, replace with actual image. Using an Unsplash placeholder for demo or a generic abstract */}
                                <img
                                    src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&h=150&fit=crop&crop=faces&q=80"
                                    alt="Steve Jobs quote"
                                    className="w-full h-full object-cover grayscale"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-brand-900">Steve Jobs</p>
                                <p className="text-brand-500 text-sm">Apple Co-Founder and CEO</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
