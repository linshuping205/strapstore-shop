import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | MasterStrap',
  description: 'How MasterStrap collects, uses, and protects your personal information.',
  alternates: {
    canonical: '/privacy/',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              MasterStrap is committed to protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our website or make
              a purchase.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We only collect information necessary to process your orders and provide you with the best
              possible service. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-500 leading-relaxed space-y-2 mb-4">
              <li><strong>Personal Information:</strong> Name, email address, shipping address, and phone number when you place an order.</li>
              <li><strong>Payment Information:</strong> We do not store your credit card details. All payments are processed securely through Stripe.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and time spent on our site (via anonymous analytics).</li>
              <li><strong>Communication:</strong> Any messages you send us through email or contact forms.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-500 leading-relaxed space-y-2 mb-4">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your order status</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and products</li>
              <li>Send you promotional emails (only if you have opted in)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your browsing experience. Cookies are
              small files stored on your device that help us remember your preferences and understand
              how you use our site.
            </p>
            <p className="text-gray-500 leading-relaxed">
              You can control cookies through your browser settings. However, disabling cookies may affect
              the functionality of our website, particularly the shopping cart and checkout process.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-500 leading-relaxed">
              We implement appropriate security measures to protect your personal information. Our website
              uses SSL encryption to secure data transmission. We store your data on secure servers and
              limit access to authorized personnel only. However, no method of transmission over the Internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We use the following third-party services to operate our business:
            </p>
            <ul className="list-disc list-inside text-gray-500 leading-relaxed space-y-2 mb-4">
              <li><strong>Stripe:</strong> Payment processing. Your payment data is handled directly by Stripe and never touches our servers.</li>
              <li><strong>Vercel:</strong> Website hosting and deployment.</li>
              <li><strong>Neon:</strong> Database hosting for order and product data.</li>
            </ul>
            <p className="text-gray-500 leading-relaxed">
              Each of these services has their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-500 leading-relaxed space-y-2 mb-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
            <p className="text-gray-500 leading-relaxed">
              To exercise these rights, please contact us at hello@masterstrap.com.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-500 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required by law. Order
              information is typically retained for 7 years for tax and accounting purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-500 leading-relaxed">
              Our website is not intended for children under 16. We do not knowingly collect personal
              information from children. If you believe a child has provided us with personal information,
              please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-500 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-500 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:hello@masterstrap.com" className="text-amber-600 hover:text-amber-700">
                hello@masterstrap.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
