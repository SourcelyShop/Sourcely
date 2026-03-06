import React from 'react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="max-w-3xl mx-auto text-white space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Agreement to Terms</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        By accessing or using the Sourcely marketplace (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Description of Service</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Sourcely is a digital marketplace platform that allows users to buy and sell digital assets, including but not limited to 3D models, Lua scripts, UI designs, and map files designed for use within the Roblox ecosystem. Sourcely provides the platform for these transactions but does not own the intellectual property of the items sold by third-party sellers.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Selling on Sourcely</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        If you register as a seller, you must connect a valid Stripe account to receive payouts. You represent and warrant that you own or have the necessary licenses, rights, and permissions to sell any asset you upload. You may not upload malicious code, stolen assets (e.g., leaked files), or content that violates Roblox's Terms of Use. We reserve the right to remove any listing and suspend seller accounts without prior notice if we suspect a violation.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Purchases and Refunds</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Due to the non-returnable nature of digital goods, all sales are considered final. Refunds are only issued at the discretion of Sourcely administration in cases where the asset is fundamentally broken, maliciously misrepresented, or severely violates our terms. Buyers who open fraudulent chargebacks will be permanently banned from the platform.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Acceptable Use Policy</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        You agree not to use the Service to: (a) harass, abuse, or harm another person; (b) attempt to bypass the platform's payment systems; (c) distribute viruses or any other computer code designed to interrupt or destroy functionality; (d) mass-download or scrape data from the Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Limitation of Liability</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        In no event shall Sourcely, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your access to or use of the Service, or any conduct or content of any third party on the Service. We are not responsible for the functionality or safety of third-party assets purchased on the platform.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">7. Changes to Terms</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect via our Changelog notification system.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">8. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        For any legal inquiries regarding these Terms, please contact support by opening a ticket in your user dashboard.
                    </p>
                </section>
            </div>
        </div>
    )
}
