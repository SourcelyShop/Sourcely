import Link from 'next/link'
import { Linkedin } from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import { InstagramIcon } from './InstagramIcon'
import { TwitterIcon } from './TwitterIcon'

export function Footer() {
    return (
        <footer className="w-full py-12 px-4 border-t border-white/10 bg-black text-white relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">

                {/* Brand & Socials */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Sourcely Logo" className="w-8 h-8" />
                        <span className="text-xl font-semibold tracking-tight">Sourcely</span>
                    </div>
                    <div className="flex gap-4 text-neutral-400">
                        <Link href="#" className="hover:text-white transition-colors"><TwitterIcon className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-white transition-colors"><InstagramIcon className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-white transition-colors"><GithubIcon className="w-5 h-5" /></Link>
                    </div>
                </div>

                {/* Links Columns */}
                <div className="flex gap-16 text-sm text-neutral-400">
                    <div className="flex flex-col gap-3">
                        <h4 className="font-medium text-white">Product</h4>
                        <Link href="#" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/premium" className="hover:text-white transition-colors">Premium</Link>
                        <Link href="/partners" className="hover:text-white transition-colors">Partners</Link>
                        <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="font-medium text-white">Support</h4>
                        <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                        <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="font-medium text-white">Legal</h4>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-xs text-neutral-500 flex justify-between items-center">
                <p> <a href="/easter-egg" target="_blank">©</a> {new Date().getFullYear()} Sourcely. All rights reserved.</p>
            </div>
        </footer>
    )
}
