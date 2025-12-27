'use server';

import { createClient } from "@/utils/supabase/server";

export async function getFlappyScore() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data } = await supabase
        .from('users')
        .select('flappy_high_score')
        .eq('id', user.id)
        .single();

    return data?.flappy_high_score || 0;
}

export async function updateFlappyScore(score: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Only update if higher
    const { data: current } = await supabase
        .from('users')
        .select('flappy_high_score')
        .eq('id', user.id)
        .single();

    if (current && score > (current.flappy_high_score || 0)) {
        await supabase
            .from('users')
            .update({ flappy_high_score: score })
            .eq('id', user.id);
    }
}
