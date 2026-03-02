"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Bubble {
    id: number;
    size: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
}

export function BubbleEffect() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);

    useEffect(() => {
        // Generate random bubbles only on the client side to avoid hydration mismatch
        const newBubbles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            size: Math.random() * 100 + 50, // 50px to 150px
            x: Math.random() * 100, // 0% to 100%
            y: Math.random() * 100, // 0% to 100%
            delay: Math.random() * 5, // 0s to 5s delay
            duration: Math.random() * 10 + 10, // 10s to 20s animation duration
        }));
        setBubbles(newBubbles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {bubbles.map((bubble) => (
                <motion.div
                    key={bubble.id}
                    className="absolute bg-brand-200/40 rounded-full blur-xl"
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, 50, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: bubble.duration,
                        repeat: Infinity,
                        delay: bubble.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Base gradients for depth */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-300/30 blur-[120px] rounded-full mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply" />
        </div>
    );
}
