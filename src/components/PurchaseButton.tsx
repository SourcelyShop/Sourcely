'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface PurchaseButtonProps {
    listingId: string;
    priceCents: number;
}

export function PurchaseButton({ listingId, priceCents }: PurchaseButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ listingId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to initialize checkout');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="relative z-10 w-full">
            <button
                onClick={handlePurchase}
                disabled={isLoading}
                className={`w-full py-4 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3 border border-white/50 ${isLoading
                        ? 'bg-neutral-300 cursor-wait scale-[0.98]'
                        : 'bg-gradient-to-r from-white to-neutral-200 hover:from-neutral-100 hover:to-neutral-300 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin text-black/70" />
                        <span>Securing Checkout...</span>
                    </>
                ) : (
                    <span>Buy Now</span>
                )}
            </button>
            {error && (
                <p className="text-red-400 text-sm mt-3 text-center animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}
