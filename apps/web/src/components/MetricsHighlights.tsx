"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

export function MetricsHighlights() {
    return (
        <section className="w-full max-w-7xl mx-auto px-8 py-24 mb-16">
            <div className="flex flex-col lg:flex-row gap-16 items-center">

                {/* Left Side - Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-[45%]"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-brand-900 leading-tight mb-6">
                        Evaluate startup metrics
                    </h2>
                    <p className="text-brand-700 text-lg leading-relaxed mb-10">
                        All startups are vetted to give you all the data you need to make successful acquisitions.
                    </p>

                    <div className="space-y-6 mb-12">
                        {[
                            "Monthly MRR Retention",
                            "Accounting Rate of Return",
                            "Customer acquisition cost",
                            "More that another 15+ metrics"
                        ].map((metric, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-brand-900 font-extrabold text-lg">
                                <div className="w-5 h-5 rounded-full border-[4px] border-brand-500 bg-white"></div>
                                {metric}
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-px border-t border-dashed border-brand-200 mb-8"></div>

                    <div className="flex gap-4 items-start flex-col">
                        <p className="italic text-brand-700 leading-relaxed mb-6 font-medium">
                            "I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not trying."
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-200 flex-shrink-0 relative">
                                {/* Placeholder image for Jeff Bezos quote */}
                                <img
                                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=faces&q=80"
                                    alt="Jeff Bezos quote"
                                    className="w-full h-full object-cover grayscale"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-brand-900">Jeff Bezos</p>
                                <p className="text-brand-500 text-sm">Amazon Founder and CEO</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Interactive Cards */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full lg:w-[55%] flex justify-end"
                >
                    <div className="bg-[#fef9c3] w-full max-w-lg aspect-[4/5] rounded-[2.5rem] p-10 lg:p-14 relative flex flex-col items-center">
                        <div className="w-full bg-brand-100 rounded-2xl shadow-lg flex flex-col p-8 relative">
                            <h3 className="font-semibold text-brand-900 mb-1">Lifetime Value</h3>
                            <p className="text-brand-500 text-xs mb-8">Jun '16 - Jul '16</p>

                            <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center mb-6 shadow-md cursor-pointer hover:bg-brand-600 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>

                            <div className="flex items-end justify-between mb-8">
                                <h2 className="text-5xl font-bold text-brand-900">
                                    28<span className="text-3xl">,29%</span>
                                </h2>
                                <div className="flex gap-2 items-end">
                                    <div className="w-8 h-6 bg-accent-green rounded-sm"></div>
                                    <div className="w-10 h-10 bg-brand-500 rounded-sm"></div>
                                </div>
                            </div>

                            <p className="text-[10px] text-brand-600 leading-relaxed mb-6">
                                Cost to acquire free user + cost to develop free product + cost to support free product cost to acquire free user.*
                            </p>

                            <div className="w-full bg-white rounded-xl p-4 flex flex-col gap-2">
                                <div className="w-full h-1.5 bg-brand-100 rounded-full"></div>
                                <div className="w-3/4 h-1.5 bg-brand-100 rounded-full"></div>
                                <div className="flex justify-end mt-2">
                                    <span className="font-bold text-brand-900 tracking-tighter text-sm italic">M</span>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Navigation */}
                        <div className="absolute bottom-8 flex items-center gap-6 text-brand-800 font-medium">
                            <button className="hover:text-brand-500 transition-colors text-brand-400">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span><span className="font-bold">01</span> / 04</span>
                            <button className="hover:text-brand-500 transition-colors text-brand-400">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
