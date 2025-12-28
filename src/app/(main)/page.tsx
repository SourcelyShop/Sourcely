
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getAssetStats } from '@/utils/getAssetStats'
import { AssetCard } from '@/components/AssetCard'
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import React from "react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { WavyBackground } from "@/components/ui/wavy-background";
import { HeroText } from "@/components/HeroText";
import { Search } from 'lucide-react'
import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export default async function HomePage({

  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = await createClient()
  const supabaseAdmin = await createAdminClient()
  const params = await searchParams; // Await searchParams in Next.js 15+
  const query = params?.q || ''
  const category = params?.category || ''

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  let dbQuery = supabaseAdmin
    .from('asset_listings')
    .select(`
      *,
      seller:users(name, is_premium)
    `)
    .is('deletion_scheduled_at', null)
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data: assetsData } = await dbQuery

  const { data: { user } } = await supabase.auth.getUser()
  let wishlistedAssetIds = new Set<string>()

  if (user) {
    const { data: wishlistItems } = await supabase
      .from('wishlist')
      .select('asset_id')
      .eq('user_id', user.id)

    if (wishlistItems) {
      wishlistedAssetIds = new Set(wishlistItems.map(item => item.asset_id))
    }
  }

  // Fetch stats for assets
  const assetIds = assetsData?.map(a => a.id) || []
  const stats = await getAssetStats(assetIds)

  const assets = assetsData?.map(asset => ({
    ...asset,
    stats: stats[asset.id],
    isWishlisted: wishlistedAssetIds.has(asset.id)
  }))

  // Sort by upvotes for "Trending"
  if (assets) {
    assets.sort((a, b) => (b.stats?.upvotes || 0) - (a.stats?.upvotes || 0))
  }

  return (

    <div className="relative min-h-screen w-full">

      {/* Fixed Background Layer */ /* fixed x absolute */}
      {/* Fixed Background Layer */ /* fixed x absolute */}
      <div className="fixed inset-0 -z-0">
        <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="#000000"></WavyBackground>
        {/* <BackgroundGradientAnimation> </BackgroundGradientAnimation> */}
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex flex-col">

        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <FadeIn className="max-w-7xl mx-auto text-center pt-20" duration={0.8}> {/* Added pt-20 to account for fixed navbar */}
            {/* <div className=" flex items-center justify-center">
              <TextHoverEffect text="Sourcely" />
            </div> */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl">
              Sourcely
            </h1>
            <HeroText />

            {/* Search Bar */}
            <form className="max-w-2xl mx-auto relative pointer-events-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search for models, scripts, UI..."
                className="w-full pl-12 pr-4 py-4 rounded-full bg-black/20 border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 outline-none transition-all backdrop-blur-md shadow-xl text-white placeholder:text-white/50"
              />
            </form>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 pointer-events-auto">
              {['MODEL', 'SCRIPT', 'UI', 'AUDIO', 'MAP'].map((cat) => (
                <Link
                  key={cat}
                  href={`/?category=${cat}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${category === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-black/20 hover:bg-black/40 border-white/10 text-white'
                    }`}
                >
                  {cat}
                </Link>
              ))}
              {category && (
                <Link
                  href="/"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30"
                >
                  Clear
                </Link>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Grid Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 pb-32 w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white/90 drop-shadow-md">Trending Assets</h2>
          </div>

          {assets && assets.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {assets.map((asset) => (
                <StaggerItem key={asset.id}>
                  <AssetCard asset={asset} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-white">No assets found matching your criteria.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
