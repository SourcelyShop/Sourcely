'use client';

import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { Tooltip } from '@/components/ui/tooltip';

// --- CHANGELOG DATA ---
// Add your changes here. 
// Use '+' at the start of a line for GREEN text (Additions).
// Use '-' at the start of a line for RED text (Removals/Fixes).
// Use '*' at the start of a line for YELLOW text (Future/Planned).
// Links (http/https) will be automatically detected and made clickable.

import { CHANGELOG_DATA } from '@/lib/changelog';

// --- COMPONENTS ---

const formatLine = (line: string, index: number) => {
    let className = "text-neutral-400"; // Default color
    let content = line;

    if (line.trim().startsWith('+')) {
        className = "text-green-400";
        content = line.trim().substring(1).trim(); // Remove '+'
        content = `+ ${content}`; // Keep the plus sign visually if desired, or just remove it. User said "make whole line green". Let's keep the + for style.
    } else if (line.trim().startsWith('-')) {
        className = "text-red-400";
        content = line.trim().substring(1).trim(); // Remove '-'
        content = `- ${content}`;
    } else if (line.trim().startsWith('*')) {
        className = "text-yellow-400";
        content = line.trim().substring(1).trim(); // Remove '*'
        content = `* ${content}`;
    }

    // Author detection regex (looks for @Name at the end of the line)
    const authorRegex = /@(\w+)$/;
    const authorMatch = content.match(authorRegex);
    let authorName = "";

    if (authorMatch) {
        authorName = authorMatch[1];
        content = content.replace(authorRegex, '').trim(); // Remove author from display text
    }

    // Link detection regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    const contentElement = (
        <div key={index} className={`font-mono text-sm leading-relaxed ${className}`}>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
                            {part}
                        </a>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );

    if (authorName) {
        return (
            <Tooltip key={index} content={`Author: ${authorName}`}>
                {contentElement}
            </Tooltip>
        );
    }

    return contentElement;
};

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-neutral-500 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Changelog</h1>
                    <p className="text-neutral-400">
                        Stay up to date with the latest improvements and fixes.
                    </p>
                </div>

                <div className="space-y-12 relative border-l border-white/10 ml-3 pl-8">
                    {CHANGELOG_DATA.map((entry, index) => (
                        <div key={index} className="relative">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border flex items-center justify-center ${index === 0 ? 'bg-green-500 border-green-500' : 'bg-black border-white/20'}`}>
                                {index === 0 ? (
                                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-white/50" />
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-4">
                                <h2 className="text-2xl font-semibold text-white">v{entry.version}</h2>
                                <span className="text-sm font-mono text-neutral-500">{entry.date}</span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-1">
                                {entry.content.trim().split('\n').map((line, i) => formatLine(line, i))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
