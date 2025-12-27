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

export default async function UserProfilePage({
    params,
}: {
    params: { id: string }
}) {
    const supabaseAdmin = await createAdminClient()
    const { id } = await params;

    // Fetch user details
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, name, created_at, avatar_url, is_premium, profile_theme, description, roles, is_admin')
        .eq('id', id)
        .single()

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
            seller:users(name, is_premium)
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

    return (
        <div
            className={`min-h-screen ${bgClass} py-24 px-4 transition-all duration-500`}
            style={bgStyle}
        >
            <div className="max-w-6xl mx-auto">
                {/* Profile Header */}
                <FadeIn>
                    <div className="glass-card p-8 rounded-2xl border border-white/10 mb-12 flex flex-col md:flex-row items-center gap-8 relative">
                        <div className="absolute inset-0 bg-neutral-900/50 -z-10 rounded-2xl" />

                        <AvatarUpload
                            userId={user.id}
                            currentAvatarUrl={user.avatar_url}
                            editable={isOwner}
                        />

                        <div className="text-center md:text-left flex-1">
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
    )
}
