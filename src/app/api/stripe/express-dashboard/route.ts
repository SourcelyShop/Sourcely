import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch their stripe_account_id (Connected Account) from the database
        const { data: userData, error } = await supabase
            .from('users')
            .select('stripe_account_id')
            .eq('id', user.id)
            .single();

        if (error || !userData?.stripe_account_id) {
            return NextResponse.json(
                { error: "No connected Stripe account found. Please onboard as a seller first." },
                { status: 404 }
            );
        }

        // Generate a single-use login link for the Express Dashboard
        const loginLink = await stripe.accounts.createLoginLink(userData.stripe_account_id);

        return NextResponse.json({ url: loginLink.url });

    } catch (error: any) {
        console.error("Error creating Express dashboard login link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
