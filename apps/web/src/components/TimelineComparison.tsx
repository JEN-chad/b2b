"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function TimelineComparison() {
    return (
        <section className="w-full max-w-7xl mx-auto px-8 py-24 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20 text-brand-900">
                <span className="text-accent-red">The hard way</span> to sell your startup
            </h2>

            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-brand-100 mb-24">
                {/* Timeline Bar */}
                <div className="flex w-full h-12 rounded-lg overflow-hidden mb-8 text-white text-sm font-medium">
                    <div className="w-[41.6%] bg-blue-500 flex items-center justify-center">5 month</div>
                    <div className="w-[50%] bg-accent-green flex items-center justify-center">6 month</div>
                    <div className="w-[8.4%] bg-accent-red flex items-center justify-center text-xs">80% deals declines</div>
                </div>

                {/* Progress Indicators */}
                <div className="relative w-full h-2 mb-16 flex items-center">
                    <div className="absolute w-full border-t-2 border-dashed border-gray-200"></div>
                    <div className="absolute w-[80%] border-t-2 border-solid border-blue-500 z-10"></div>

                    <div className="absolute left-0 w-3 h-3 bg-blue-500 rounded-full z-20"></div>
                    <div className="absolute left-[41.6%] w-3 h-3 bg-accent-green rounded-full z-20"></div>
                    <div className="absolute left-[80%] w-4 h-4 border-2 border-gray-300 bg-white rounded-full z-20"></div>
                    <div className="absolute right-0 w-3 h-3 bg-accent-red rounded-full z-20"></div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-brand-800">
                    <div>
                        <h4 className="font-bold text-lg mb-6">Preparing and search</h4>
                        <ul className="space-y-4 text-sm text-brand-700">
                            <li>1. Hire an investment banker or broker (2 month)</li>
                            <li>2. Build a data room (1 month)</li>
                            <li>3. Buyer Outreach (2 months)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Presentation</h4>
                        <ul className="space-y-4 text-sm text-brand-700">
                            <li>1. The Dog and Pony Show (2 month)</li>
                            <li>2. Term Sheets + Negotiation (1 month)</li>
                            <li>3. Due Diligence (2 months)</li>
                            <li>4. Haggling + Renegotiation (1 month)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Result</h4>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-brand-600">
                                <X className="w-4 h-4 text-accent-red" />
                                (80%) deals declines? (1-2 months)
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-brand-900 border-l-4 border-accent-green">
                                <Check className="w-4 h-4 text-accent-green" />
                                (20%) Closing? (1-2 months)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-brand-900">
                <span className="text-brand-500">The easy way</span> to sell your startup
            </h2>

            {/* Easy Way Steps */}
            <div className="relative">
                {/* Horizontal connection line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-200 -z-10 hidden lg:block"></div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center"
                    >
                        <div className="bg-brand-500 text-white w-full max-w-sm rounded-[2rem] p-8 shadow-xl aspect-[4/5] flex flex-col relative mb-8">
                            <h3 className="font-semibold mb-1">Create your account</h3>
                            <p className="text-brand-200 text-xs mb-8">All data is private</p>

                            <div className="bg-white rounded-full py-3 px-5 flex justify-between items-center mb-6">
                                <span className="text-brand-800 text-sm font-medium">Startup name</span>
                                <span className="text-brand-400">→</span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 border-2 border-brand-300 rounded-full mt-1"></div>
                                    <div>
                                        <p className="font-medium">About startup</p>
                                        <p className="text-[10px] text-brand-200">Tech and medicine</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 border-2 border-brand-300 rounded-full mt-1"></div>
                                    <div>
                                        <p className="font-medium">Short description</p>
                                        <p className="text-[10px] text-brand-200 leading-tight">We handle billions of dollars every year for forward-thinking businesses around the world.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 border-2 border-brand-300 rounded-full mt-1"></div>
                                    <div>
                                        <p className="font-medium">Asking price</p>
                                        <p className="text-[10px] text-brand-200">$50,230</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full bg-white h-24 rounded-t-xl rounded-b-[2rem] p-6 flex flex-col gap-2 justify-center">
                                <div className="w-2/3 h-1.5 bg-brand-100 rounded-full"></div>
                                <div className="w-1/2 h-1.5 bg-brand-100 rounded-full"></div>
                            </div>
                        </div>

                        <div className="w-4 h-4 bg-brand-500 rounded-full ring-4 ring-white shadow-md relative z-10 mb-6"></div>

                        <div className="text-center px-4">
                            <h4 className="text-xl font-bold text-brand-900 mb-2">Set up your account</h4>
                            <p className="text-brand-600 text-sm">Enter key information about your startup to attract buyers.</p>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center"
                    >
                        <div className="bg-white border border-brand-100 w-full max-w-sm rounded-[2rem] p-8 shadow-xl aspect-[4/5] flex flex-col relative mb-8">
                            <p className="font-bold text-brand-900 text-sm">Letter from Jesica Do***</p>
                            <p className="text-brand-500 text-xs mb-6">Anonymous inbound request</p>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-brand-200 overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80" alt="Avatar" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent-green rounded-full border-2 border-white"></div>
                                </div>
                            </div>

                            <p className="font-bold text-xl text-brand-900 leading-tight mb-8">
                                "Hi, I want to talk with you about a deal. Please, Give me access to your contacts."
                            </p>

                            <div className="mt-auto">
                                <div className="w-full h-1.5 bg-brand-100 rounded-full mb-2"></div>
                                <div className="w-4/5 h-1.5 bg-brand-100 rounded-full mb-6"></div>
                                <button className="w-full bg-brand-500 text-white font-medium py-3 rounded-xl hover:bg-brand-600 transition-colors">
                                    Open contacts
                                </button>
                            </div>
                        </div>

                        <div className="w-4 h-4 bg-accent-yellow rounded-full ring-4 ring-white shadow-md relative z-10 mb-6"></div>

                        <div className="text-center px-4">
                            <h4 className="text-xl font-bold text-brand-900 mb-2">Respond to private requests</h4>
                            <p className="text-brand-600 text-sm">The platform connects you with interested buyers – all you have to do is respond.</p>
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center"
                    >
                        <div className="bg-brand-500 text-white w-full max-w-sm rounded-[2rem] p-8 shadow-xl aspect-[4/5] flex flex-col relative mb-8">
                            <h3 className="font-semibold mb-1">Letter Of Intent</h3>
                            <p className="text-brand-200 text-xs mb-8">Deal price amount</p>

                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 rounded-full border-2 border-white bg-accent-green"></div>
                            </div>

                            <h2 className="text-4xl font-bold mb-6">
                                $50.240<span className="text-2xl text-brand-200">,10</span>
                            </h2>
                            <div className="w-3/4 h-px bg-brand-400 mb-8"></div>

                            <div className="bg-white text-brand-900 absolute bottom-0 left-0 w-full h-[55%] rounded-[2rem] rounded-tl-xl p-6 flex flex-col">
                                <p className="font-bold text-sm mb-3">Deal details</p>
                                <p className="text-[10px] text-brand-600 leading-relaxed mb-4">
                                    We offer a total purchase price of <strong>$50.240</strong> consisting of:
                                    <br /><span className="text-accent-green">●</span> <strong>$25.000</strong> of cash on closing
                                    <br /><span className="text-accent-green">●</span> <strong>$30.000</strong> share of our name, issues immediately upon closing and not subject to any vesting period representing approximately...
                                </p>
                            </div>
                        </div>

                        <div className="w-4 h-4 bg-accent-green rounded-full ring-4 ring-white shadow-md relative z-10 mb-6"></div>

                        <div className="text-center px-4">
                            <h4 className="text-xl font-bold text-brand-900 mb-2">Meet potential buyers in days</h4>
                            <p className="text-brand-600 text-sm">Once you and the buyer are happy, you'll get an LOI in 30 days or less.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
