"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Header() {
    return (
        <header className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto text-sm font-medium text-brand-800">
            <nav className="flex items-center gap-8">
                <Link href="/sellers" className="hover:text-brand-500 transition-colors">
                    For Sellers
                </Link>
                <Link href="/buyers" className="hover:text-brand-500 transition-colors">
                    For Buyers
                </Link>
                <Link href="/about" className="hover:text-brand-500 transition-colors">
                    About Us
                </Link>
                <Link href="/resources" className="hover:text-brand-500 transition-colors">
                    Resources
                </Link>
            </nav>

            <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link href="/" className="text-xl font-bold tracking-tighter text-black uppercase">
                    MICROACQUIRE
                </Link>
            </div>

            <div className="flex items-center gap-6">
                <Link href="/login" className="hover:text-brand-500 transition-colors">
                    Login
                </Link>
                <Link href="/signup" className="flex items-center gap-1 hover:text-brand-500 transition-colors">
                    Join Now <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </header>
    );
}
