"use client";
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'
import { NotificationBell } from './NotificationBell'
import { User as UserIcon, LayoutDashboard, ShoppingBag, Settings } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { SettingsIcon } from './SettingsIcon'


import {
    NavbarMain,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";



interface NavbarProps {
    user: User | null;
    avatarUrl?: string | null;
    is_admin?: boolean;
    isPremium?: boolean;
}

export function Navbar({ user, avatarUrl, is_admin, isPremium }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const supabase = createClient()
    const router = useRouter()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const navItems = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "Premium",
            link: "/premium",
        },
        {
            name: "Discover",
            link: "/discover",
        },
        {
            name: "Partners",
            link: "/partners",
        },
        {
            name: "Support",
            link: "/support",
        },
        {
            name: "Seller Dashboard",
            link: "/dashboard/seller",
            condition: user !== null,
        },
        {
            name: "Admin Dashboard",
            link: "/dashboard/admin",
            condition: is_admin,
        },
    ];

    navItems.forEach((item) => {
        if (!(item.condition == true || item.condition == null)) {
            console.log(item)
            navItems.splice(navItems.indexOf(item));
        }
    })

    return (
        <div className="fixed top-0 left-0 right-0 z-[999]">
            <NavbarMain>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    {!user ? (
                        <div className="flex items-center gap-4 relative z-50">
                            <NavbarButton variant="dark" href="/login">Login</NavbarButton>
                            <NavbarButton variant="primary" href="/signup">Register</NavbarButton>
                        </div>

                    ) : (
                        <div className="flex items-center gap-4 relative z-50">
                            <NotificationBell userId={user.id} />
                            <div className="relative group">
                                <button
                                    className={`w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center transition-all cursor-pointer focus:outline-none ${isPremium ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-white/20 hover:border-primary/50'} bg-neutral-800`}
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />

                                    ) : (
                                        <span className="text-white font-bold">{user.user_metadata.name?.[0]?.toUpperCase() || 'U'}</span>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-[100]">
                                    <div className="p-2 space-y-1">
                                        <Link
                                            href={`/users/${user.id}`}
                                            className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href={`/users/${user.id}/purchases`}
                                            className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                                        >
                                            My Library
                                        </Link>
                                        <Link
                                            href="/dashboard/saved"
                                            className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                                        >
                                            Wishlist
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                                        >

                                            Settings
                                        </Link>
                                        <div className="h-px bg-white/10 my-1" />
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/*<NavbarButton variant="dark" onClick={handleSignOut}>PLACE FOR BUTTON</NavbarButton>*/}
                        </div>
                    )}



                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <div className="flex items-center gap-2">
                            {user && <NotificationBell userId={user.id} />}
                            <MobileNavToggle
                                isOpen={isMobileMenuOpen}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            />
                        </div>
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <a
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        {!user ? (
                            <div className="flex w-full flex-col gap-4">
                                <NavbarButton
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    variant="dark"
                                    className="w-full"
                                    href="/login"
                                >
                                    Login
                                </NavbarButton>
                                <NavbarButton
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    variant="primary"
                                    className="w-full"
                                    href="/signup"
                                >
                                    Register
                                </NavbarButton>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col gap-4">
                                <Link
                                    href={`/users/${user.id}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-neutral-800 flex items-center justify-center">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold">{user.user_metadata.name?.[0]?.toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <span className="text-white font-medium">{user.user_metadata.name || 'User'}</span>
                                </Link>
                                <Link
                                    href={`/users/${user.id}/purchases`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-neutral-300 hover:text-white"
                                >
                                    <Settings className="w-5 h-5 text-white" />
                                    <span className="block font-medium">My library</span>
                                </Link>
                                <Link
                                    href="/dashboard/saved"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-neutral-300 hover:text-white"
                                >
                                    <Settings className="w-5 h-5 text-white" />
                                    <span className="block font-medium">Wishlist</span>
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-neutral-300 hover:text-white"
                                >
                                    <Settings className="w-5 h-5 text-white" />
                                    <span className="block font-medium">Settings</span>
                                </Link>

                                <NavbarButton
                                    onClick={() => { setIsMobileMenuOpen(false); handleSignOut() }}
                                    variant="dark"
                                    className="w-full"

                                >
                                    Sign out
                                </NavbarButton>
                            </div>
                        )}


                    </MobileNavMenu>
                </MobileNav>
            </NavbarMain>
            {/* Navbar */}
        </div >
    )
}
