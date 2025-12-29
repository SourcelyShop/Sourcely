import { createClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let avatarUrl = null;
    let is_admin = false;
    let is_premium = false;
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('avatar_url, is_admin, is_premium')
            .eq('id', user.id)
            .single();
        avatarUrl = profile?.avatar_url;
        is_admin = profile?.is_admin;
        is_premium = profile?.is_premium;
    }

    return (
        <>
            <Navbar user={user} avatarUrl={avatarUrl} is_admin={is_admin} isPremium={is_premium} />
            {children}
            <Footer />
        </>
    );
}
