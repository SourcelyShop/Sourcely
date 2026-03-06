import React from 'react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="max-w-3xl mx-auto text-white space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We collect information you provide directly to us when you create an account, list an asset, make a purchase, or communicate with us. This includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                        <li><strong>Account Information:</strong> Name, email address, Discord handle, Roblox profile link, and password.</li>
                        <li><strong>Financial Information:</strong> We use Stripe to process payments. We do not store your full credit card number, but we do store confirmation data, your Stripe Connect Account ID (for sellers), and transaction histories.</li>
                        <li><strong>User Content:</strong> Files you upload (assets, thumbnails, code), reviews, and support tickets.</li>
                        <li><strong>Automatically Collected Data:</strong> IP addresses, browser types, device information, and analytics regarding your interactions with the platform (e.g., via Google Analytics).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We use the information we collect to operate, maintain, and improve our platform. Specific uses include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                        <li>Processing transactions and sending related information, including confirmations and receipts.</li>
                        <li>Facilitating the Stripe Connect onboarding process for sellers to receive payouts.</li>
                        <li>Verifying ownership of third-party accounts (e.g., Roblox profile descriptions) to build trust in the marketplace.</li>
                        <li>Detecting, investigating, and preventing fraudulent transactions and other illegal activities.</li>
                        <li>Sending technical notices, updates, security alerts, and administrative messages.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Information Sharing and Disclosure</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We do not sell your personal data. We may share your information in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                        <li><strong>With Service Providers:</strong> We share data with third-party vendors (like Supabase for database hosting, Vercel for web hosting, and Stripe for payments) who need access to such information to carry out work on our behalf.</li>
                        <li><strong>Publicly:</strong> As a marketplace, certain information (like your Username, Display Name, public assets, and linked social profiles) is visible to other users globally.</li>
                        <li><strong>For Legal Reasons:</strong> We may disclose information if we believe it is necessary to comply with a law, regulation, legal process, or governmental request.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Cookies and Tracking Technologies</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service. We utilize Google Analytics to understand how visitors engage with our site.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Your Data Rights</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal data. You can manage your account settings directly within the platform, or you can request account deletion (which immediately removes your data from our active databases) via the Settings panel.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us by opening a Support Ticket in your dashboard.
                    </p>
                </section>
            </div>
        </div>
    )
}
