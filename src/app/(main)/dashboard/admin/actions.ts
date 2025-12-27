'use server'

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { stripe } from "@/utils/stripe/server";

export type DateRange = '24h' | '7d' | '30d' | 'all';

export async function getAdminStats(range: DateRange = '7d') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        redirect('/');
    }

    const adminSupabase = await createAdminClient();

    // Calculate start date based on range
    const now = new Date();
    let startDate = new Date();
    if (range === '24h') startDate.setDate(now.getDate() - 1);
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    if (range === '30d') startDate.setDate(now.getDate() - 30);
    if (range === 'all') startDate = new Date(0); // Beginning of time

    const startDateTimestamp = Math.floor(startDate.getTime() / 1000);
    const startDateStr = startDate.toISOString();

    // 1. Fetch Charges from Stripe
    const charges = await stripe.charges.list({
        created: { gte: startDateTimestamp },
        limit: 100,
        expand: ['data.balance_transaction']
    });

    // 2. Calculate Totals
    let totalMarketplaceRevenue = 0;
    let totalSubscriptionRevenue = 0;
    let totalProductsSold = 0;
    let totalSubscriptionsSold = 0;

    const graphDataMap = new Map<string, { date: string, revenue: number, subRevenue: number, users: number, sales: number, subSales: number }>();

    charges.data.forEach(charge => {
        if (charge.status !== 'succeeded') return;

        const amount = charge.amount; // In cents
        const isMarketplace = !!charge.metadata?.listingId || !!charge.application_fee || !!charge.application_fee_amount || !!charge.transfer_data;

        const date = new Date(charge.created * 1000).toLocaleDateString();
        const existing = graphDataMap.get(date) || { date, revenue: 0, subRevenue: 0, users: 0, sales: 0, subSales: 0 };

        if (isMarketplace) {
            totalMarketplaceRevenue += amount;
            totalProductsSold++;
            existing.revenue += amount / 100;
            existing.sales++;
        } else {
            totalSubscriptionRevenue += amount;
            totalSubscriptionsSold++;
            existing.subRevenue += amount / 100;
            existing.subSales++;
        }

        graphDataMap.set(date, existing);
    });

    const totalRevenueCents = totalMarketplaceRevenue + totalSubscriptionRevenue;

    // 3. New Users (Keep from DB)
    const { data: newUsers } = await adminSupabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDateStr);

    const totalNewUsers = newUsers?.length || 0;

    newUsers?.forEach(u => {
        const date = new Date(u.created_at).toLocaleDateString();
        const existing = graphDataMap.get(date) || { date, revenue: 0, subRevenue: 0, users: 0, sales: 0, subSales: 0 };
        existing.users += 1;
        graphDataMap.set(date, existing);
    });

    // Convert map to array and sort by date
    const graphData = Array.from(graphDataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 5. Subscription Split (Keep from DB)
    const { data: premiumUsers } = await adminSupabase
        .from('users')
        .select('subscription_interval')
        .eq('is_premium', true);

    const subscriptionSplit = {
        month: premiumUsers?.filter(u => u.subscription_interval === 'month').length || 0,
        year: premiumUsers?.filter(u => u.subscription_interval === 'year').length || 0
    };

    // 7. User List (Global Index)
    const { data: allUsers } = await adminSupabase
        .from('users')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: true });

    // 8. Open Tickets Count
    const { count: openTicketCount } = await adminSupabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

    return {
        totalRevenue: totalRevenueCents / 100,
        totalMarketplaceRevenue: totalMarketplaceRevenue / 100,
        totalSubscriptionRevenue: totalSubscriptionRevenue / 100,
        totalProductsSold,
        totalSubscriptionsSold,
        totalNewUsers,
        graphData,
        subscriptionSplit,
        users: allUsers || [],
        openTicketCount: openTicketCount || 0
    };
}

export async function getAdminTickets(filters?: { status?: string, subject?: string }) {
    const supabase = await createAdminClient();

    let query = supabase
        .from('support_tickets')
        .select(`
            *,
            user:users(name, email)
        `)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters?.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject);
    }

    const { data } = await query;

    return data || [];
}

export async function getAdminTicketDetails(id: string) {
    const supabase = await createAdminClient();

    // Fetch ticket
    const { data: ticket } = await supabase
        .from('support_tickets')
        .select(`
            *,
            user:users(name, email)
        `)
        .eq('id', id)
        .single();

    if (!ticket) return null;

    // Fetch messages
    const { data: messages } = await supabase
        .from('support_messages')
        .select(`
            *,
            sender:users(name, avatar_url)
        `)
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

    return { ticket, messages: messages || [] };
}
