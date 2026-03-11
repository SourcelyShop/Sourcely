export async function verifyAssetUrl(url: string): Promise<boolean> {
    try {
        const parsedUrl = new URL(url);
        // Only allow http and https protocols
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return false;
        }

        // We use an AbortController so we don't have to download multi-gigabyte files
        // just to prove they exist. We only need the first few bytes.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            // Some file hosts might block standard fetches, we can spoof a generic user agent
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Asset URL Verification Failed: URL returned status ${response.status}`);
            return false;
        }

        const contentLength = response.headers.get('content-length');

        // If the server provides a Content-Length and it's 0, it's an empty file/scam.
        if (contentLength && parseInt(contentLength, 10) === 0) {
            console.error('Asset URL Verification Failed: Content-Length is 0');
            return false;
        }

        // To be safe, let's actually read a tiny chunk of the body to guarantee data flows
        if (response.body) {
            const reader = response.body.getReader();
            const { value, done } = await reader.read();

            // Abort the rest of the file download now that we proved it has data
            controller.abort();

            if (done || !value || value.length === 0) {
                console.error('Asset URL Verification Failed: Stream completed immediately with no data bytes');
                return false;
            }

            return true; // We successfully read >0 bytes
        }

        return false; // No response body stream available
    } catch (error) {
        console.error('Asset URL Verification Failed Exception:', error);
        return false;
    }
}
