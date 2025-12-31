import { createAdminClient, createClient } from '@/utils/supabase/server'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { getAssetStats } from '@/utils/getAssetStats'
import { notFound } from 'next/navigation'
import { AssetCard } from '@/components/AssetCard'
import { Calendar, Package, Crown, ShieldCheck } from 'lucide-react'
import { AvatarUpload } from '@/components/AvatarUpload'
import { Tooltip } from '@/components/ui/tooltip'

import { ProfileVoting } from '@/components/ProfileVoting'
import { ProfileEditButton } from '@/components/ProfileEditButton'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const supabaseAdmin = await createAdminClient()
    const { username } = await params

    const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, name, description, avatar_url')
        .eq('username', username)
        .single()

    if (!user) {
        return {
            title: 'User Not Found',
        }
    }

    // Fetch stats
    const { count: listingsCount } = await supabaseAdmin
        .from('asset_listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)

    const { count: upvotes } = await supabaseAdmin
        .from('profile_votes')
        .select('*', { count: 'exact', head: true })
        .eq('target_user_id', user.id)
        .eq('vote_type', 'up')

    const { count: downvotes } = await supabaseAdmin
        .from('profile_votes')
        .select('*', { count: 'exact', head: true })
        .eq('target_user_id', user.id)
        .eq('vote_type', 'down')

    const totalVotes = (upvotes || 0) + (downvotes || 0)
    const rating = totalVotes > 0
        ? ((upvotes || 0) / totalVotes * 5).toFixed(1)
        : 'New'

    const description = `${user.name} on Sourcely • ${rating} ★ • ${listingsCount || 0} Listings • ${user.description?.slice(0, 100) || 'Check out my profile!'}`

    return {
        title: `${user.name} (@${username}) on Sourcely`,
        description: description,
        openGraph: {
            title: `${user.name} (@${username})`,
            description: description,
            images: user.avatar_url ? [user.avatar_url] : [],
        },
    }
}

export default async function CustomProfilePage({
    params,
}: {
    params: { username: string }
}) {
    const supabaseAdmin = await createAdminClient()
    const { username } = await params;

    // Fetch user details by username
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, name, created_at, avatar_url, is_premium, profile_theme, description, roles, is_admin, discord_handle, roblox_handle, discord_visible, roblox_visible, banner_url')
        .eq('username', username)
        .single() as { data: any, error: any }

    if (!user) notFound()

    // Check if current user is the owner
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const isOwner = currentUser?.id === user.id

    // Fetch Votes
    const { count: upvotes } = await supabaseAdmin
        .from('profile_votes')
        .select('*', { count: 'exact', head: true })
        .eq('target_user_id', user.id)
        .eq('vote_type', 'up')

    const { count: downvotes } = await supabaseAdmin
        .from('profile_votes')
        .select('*', { count: 'exact', head: true })
        .eq('target_user_id', user.id)
        .eq('vote_type', 'down')

    let currentUserVote = null
    if (currentUser) {
        const { data } = await supabase
            .from('profile_votes')
            .select('vote_type')
            .eq('voter_id', currentUser.id)
            .eq('target_user_id', user.id)
            .single()
        currentUserVote = data
    }

    // Fetch user's listings
    const { data: userListings } = await supabaseAdmin
        .from('asset_listings')
        .select(`
            *,
            seller:users(name, is_premium),
            boost_expires_at
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

    const listingsData = userListings || []

    // Fetch stats for listings
    const assetIds = listingsData.map(l => l.id)
    const stats = await getAssetStats(assetIds)

    const listings = listingsData.map(listing => ({
        ...listing,
        stats: stats[listing.id]
    }))

    const theme = user.profile_theme as { backgroundColor?: string, backgroundImage?: string }
    const bgClass = !theme?.backgroundImage && (theme?.backgroundColor === 'default' || !theme?.backgroundColor)
        ? 'bg-background'
        : theme?.backgroundColor

    const bgStyle = theme?.backgroundImage
        ? {
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }
        : {}

    // Fetch current user details for Navbar
    let navbarAvatarUrl = null;
    let navbarIsAdmin = false;
    let navbarIsPremium = false;
    if (currentUser) {
        const { data: profile } = await supabase
            .from('users')
            .select('avatar_url, is_admin, is_premium')
            .eq('id', currentUser.id)
            .single();
        navbarAvatarUrl = profile?.avatar_url;
        navbarIsAdmin = profile?.is_admin;
        navbarIsPremium = profile?.is_premium;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={currentUser} avatarUrl={navbarAvatarUrl} is_admin={navbarIsAdmin} isPremium={navbarIsPremium} />

            <div
                className={`flex-1 ${bgClass} py-24 px-4 transition-all duration-500`}
                style={bgStyle}
            >
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header */}
                    <FadeIn>
                        <div className="glass-card rounded-2xl border border-white/10 mb-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-neutral-900/80 -z-20" />

                            {/* Banner */}
                            {user.banner_url && (
                                <div className="w-full h-48 md:h-64 relative overflow-hidden">
                                    {user.banner_url.endsWith('.mp4') || user.banner_url.endsWith('.webm') ? (
                                        <video
                                            src={user.banner_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={user.banner_url}
                                            alt="Profile Banner"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                                </div>
                            )}

                            <div className={`p-8 flex flex-col md:flex-row items-center gap-8 relative ${user.banner_url ? '-mt-12' : ''}`}>
                                <div className="relative z-10">
                                    <AvatarUpload
                                        userId={user.id}
                                        currentAvatarUrl={user.avatar_url}
                                        editable={isOwner}
                                        isPremium={user.is_premium}
                                    />
                                </div>

                                <div className="text-center md:text-left flex-1 relative z-10 pt-4 md:pt-12">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
                                        <h1 className="text-3xl font-bold text-white">{user.name || 'User'}</h1>
                                        {user.roles && user.roles.map((role: string) => (
                                            <span key={role} className="px-2 py-0.5 rounded-full bg-white text-black text-xs font-bold">
                                                {role}
                                            </span>
                                        ))}
                                        {user.is_premium && (
                                            <Tooltip content="Premium Member">
                                                <div className="bg-gradient-to-br from-amber-300 to-yellow-600 p-1.5 rounded-full shadow-lg shadow-yellow-500/20">
                                                    <Crown className="w-4 h-4 text-white fill-white" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {user.is_admin && (
                                            <Tooltip content="Admin">
                                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-full shadow-lg shadow-blue-500/20">
                                                    <ShieldCheck className="w-4 h-4 text-white fill-white" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {isOwner && <ProfileEditButton user={user} />}
                                    </div>

                                    {user.description && (
                                        <p className="text-neutral-300 mb-4 max-w-2xl mx-auto md:mx-0 whitespace-pre-wrap">
                                            {user.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-center md:justify-start gap-6 text-muted-foreground text-white mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            <span className="text-sm">{listings.length} Listings</span>
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                                        {(user.discord_visible || isOwner) && user.discord_handle && (
                                            <Tooltip content="Open Discord Profile">
                                                <a
                                                    href={`https://discord.com/users/${user.discord_handle}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors ${!user.discord_visible ? 'opacity-50' : ''}`}
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                                    <span className="text-xs font-medium">{user.discord_handle}</span>
                                                    {!user.discord_visible && isOwner && <span className="text-[10px] ml-1 opacity-70">(Hidden)</span>}
                                                </a>
                                            </Tooltip>
                                        )}

                                        {(user.roblox_visible || isOwner) && user.roblox_handle && (
                                            <Tooltip content="Search on Roblox">
                                                <a
                                                    href={`https://www.roblox.com/search/users?keyword=${user.roblox_handle}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors ${!user.roblox_visible ? 'opacity-50' : ''}`}
                                                >
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.325 0L0 18.225l18.675 5.775L24 5.775 5.325 0zm10.744 13.225l-3.175 3.175-5.175-5.175 3.175-3.175 5.175 5.175z" /></svg>
                                                    <span className="text-xs font-medium">{user.roblox_handle}</span>
                                                    {!user.roblox_visible && isOwner && <span className="text-[10px] ml-1 opacity-70">(Hidden)</span>}
                                                </a>
                                            </Tooltip>
                                        )}
                                    </div>

                                    {/* Voting Component */}
                                    <div className="flex justify-center md:justify-start">
                                        <ProfileVoting
                                            targetUserId={user.id}
                                            initialVote={currentUserVote?.vote_type as 'up' | 'down' | null}
                                            upvotes={upvotes || 0}
                                            downvotes={downvotes || 0}
                                            isOwnProfile={isOwner}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Listings Grid */}
                    <div className="space-y-8">
                        <FadeIn delay={0.2}>
                            <h2 className="text-2xl font-bold text-white">Listings by {user.name}</h2>
                        </FadeIn>

                        {listings.length > 0 ? (
                            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <StaggerItem key={listing.id}>
                                        <AssetCard asset={listing} />
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        ) : (
                            <FadeIn delay={0.3}>
                                <div className="text-center py-12 text-muted-foreground glass-card rounded-xl border border-white/5 text-white">
                                    This user hasn't posted any listings yet.
                                </div>
                            </FadeIn>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
