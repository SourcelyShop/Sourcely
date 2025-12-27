'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

export async function joinWaitlist(prevState: any, formData: FormData) {
    const email = formData.get("email");

    const validatedFields = schema.safeParse({
        email,
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.email?.[0] || "Invalid email",
        };
    }

    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", validatedFields.data.email)
        .single();

    if (existing) {
        return {
            message: "You are already on the waitlist!",
        };
    }

    const { error } = await supabase
        .from("waitlist")
        .insert({
            email: validatedFields.data.email,
        });

    if (error) {
        //console.log(error.code, typeof error.code)
        //console.error("Waitlist error:", error);
        if (error.code == '23505')
            return {
                message: "You are already on the waitlist!",
            };
        else
            return {
                error: "Failed to join waitlist. Please try again.",
            };
    }

    revalidatePath("/waitlist");
    return {
        success: true,
        message: "You have been added to the waitlist!",
    };
}

export async function getWaitlistCount() {
    const supabase = await createClient();

    // Try to call the RPC function first
    const { data, error } = await supabase.rpc('get_waitlist_count');

    if (!error && typeof data === 'number') {
        return data;
    }

    // Fallback: If RPC doesn't exist (user didn't run SQL yet), return a placeholder or 0
    // Or try direct count if policy allows (which we restricted, but maybe for now...)
    return 0;
}
