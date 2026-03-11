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

        // Fetch their stripe_customer_id from the database
        const { data: userData, error } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (error || !userData?.stripe_customer_id) {
            return NextResponse.json(
                { error: "No Stripe customer found. Please make a purchase or subscribe to premium first." },
                { status: 404 }
            );
        }

        // Generate the billing portal session
        // Redirect them back to the settings page when they are done
        const session = await stripe.billingPortal.sessions.create({
            customer: userData.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Error creating customer portal session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
