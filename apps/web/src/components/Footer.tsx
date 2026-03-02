"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-brand-200 mt-20 text-brand-800">
            <div className="w-full max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-black uppercase mb-6 inline-block">
                        MICROACQUIRE
                    </Link>
                    <p className="text-brand-600 max-w-md leading-relaxed mb-6">
                        The easiest and most private way to sell your startup. We connect you with trusted, vetted buyers worldwide.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-brand-900 mb-6">Platform</h4>
                    <ul className="space-y-4 text-brand-600">
                        <li><Link href="/sellers" className="hover:text-brand-500 transition-colors">For Sellers</Link></li>
                        <li><Link href="/buyers" className="hover:text-brand-500 transition-colors">For Buyers</Link></li>
                        <li><Link href="/pricing" className="hover:text-brand-500 transition-colors">Pricing</Link></li>
                        <li><Link href="/success-stories" className="hover:text-brand-500 transition-colors">Success Stories</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-brand-900 mb-6">Company</h4>
                    <ul className="space-y-4 text-brand-600">
                        <li><Link href="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
                        <li><Link href="/blog" className="hover:text-brand-500 transition-colors">Blog</Link></li>
                        <li><Link href="/contact" className="hover:text-brand-500 transition-colors">Contact</Link></li>
                    </ul>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto px-8 py-6 border-t border-brand-200 flex flex-col md:flex-row items-center justify-between text-xs text-brand-500">
                <p>&copy; {new Date().getFullYear()} MicroAcquire Clone. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link href="/privacy" className="hover:text-brand-800">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-brand-800">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
