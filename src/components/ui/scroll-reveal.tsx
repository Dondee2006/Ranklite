"use client";

import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "zoom-in";
    delay?: number;
    duration?: number;
    threshold?: number;
    once?: boolean;
}

const variants = {
    "fade-up": {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
    },
    "fade-in": {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    "slide-left": {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 },
    },
    "slide-right": {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0 },
    },
    "zoom-in": {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    },
};

export function ScrollReveal({
    children,
    variant = "fade-up",
    delay = 0,
    duration = 0.6,
    threshold = 0.1,
    once = true,
    className,
    ...props
}: ScrollRevealProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount: threshold }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            variants={variants[variant]}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
