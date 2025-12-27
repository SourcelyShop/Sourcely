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
                        By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Use License</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Permission is granted to temporarily download one copy of the materials (information or software) on Sourcely's website for personal, non-commercial transitory viewing only.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. User Accounts</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Content</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Termination</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Limitation of Liability</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        In no event shall Sourcely, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">7. Changes</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">8. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        If you have any questions about these Terms, please contact us.
                    </p>
                </section>
            </div>
        </div>
    )
}
