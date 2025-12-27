"use client";

import { useState } from "react";
import { joinWaitlist } from "@/app/waitlist/actions";
import { motion } from "motion/react";
import { Button } from "@/components/ui/stateful-button";

export function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [isValid, setIsValid] = useState<boolean | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        if (val.length > 0) {
            setIsValid(validateEmail(val));
        } else {
            setIsValid(null);
        }
    };
    const handleClick = () => {
        return new Promise((resolve) => {
            setTimeout(resolve, 4000);
        });
    };

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        setMessage("");

        const result = await joinWaitlist(null, formData);

        if (result?.error) {
            setStatus("error");
            setMessage(result.error);
        } else if (result?.success) {
            setStatus("success");
            setMessage(result.message || "Joined!");
            setEmail("");
            setIsValid(null);
        } else if (result?.message) {
            // Already joined case
            setStatus("success");
            setMessage(result.message);
            setIsValid(null);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative z-30">
            <form action={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="name@example.com"
                    className={`flex-1 bg-white/5 border rounded-full px-6 py-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm disabled:opacity-50 
                        ${isValid === null
                            ? "border-white/10 focus:ring-white/20"
                            : isValid
                                ? "border-green-500/50 focus:ring-green-500/50 focus:border-green-500"
                                : "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                        }`}
                    required
                    disabled={status === "loading" || status === "success"}
                />
                <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="bg-white text-black font-bold rounded-full px-8 py-4 hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
                >
                    {status === "loading" ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : status === "success" ? (
                        "Joined!"
                    ) : (
                        "Join Waitlist"
                    )}
                </button>

            </form>

            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-center text-sm ${status === "error" ? "text-red-400" : "text-green-400"}`}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
}
