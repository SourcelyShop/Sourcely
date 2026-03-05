export async function getRobloxProfileLink(username: string): Promise<string> {
    if (!username) return '#'

    try {
        const idRes = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: false
            }),
            next: { revalidate: 86400 } // Cache for 24 hours
        })

        const idData = await idRes.json()

        if (idData?.data?.[0]?.id) {
            return `https://www.roblox.com/users/${idData.data[0].id}/profile`
        }
    } catch (e) {
        console.error("Failed to fetch roblox id for user", username, e)
    }

    // Fallback if the API fails
    return `https://www.roblox.com/search/users?keyword=${username}`
}
