import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | MasterStrap',
  description: 'Terms and conditions for using MasterStrap website and services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              These Terms of Service govern your use of the MasterStrap website and the purchase of 
              products from our online store. By accessing our website or placing an order, you agree 
              to be bound by these terms.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We reserve the right to update these terms at any time. Changes will be posted on this 
              page with an updated revision date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Orders and Payment</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              All orders are subject to acceptance and availability. We reserve the right to refuse 
              any order for any reason. Prices are listed in USD and are subject to change without notice.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Payment is processed securely through Stripe. By providing your payment information, you 
              represent that you are authorized to use the payment method. All transactions are encrypted 
              using industry-standard SSL technology.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Shipping and Delivery</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We ship worldwide. Delivery times vary by destination and shipping method selected at checkout. 
              Estimated delivery times are provided as guidelines and are not guaranteed.
            </p>
            <p className="text-gray-500 leading-relaxed">
              All orders are shipped with tracking. You will receive a tracking number via email once your 
              order has been dispatched. We are not responsible for delays caused by customs or carrier issues.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Returns and Exchanges</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We accept returns within 30 days of delivery for unused items in original condition. 
              Custom or personalized items are not eligible for return unless defective.
            </p>
            <p className="text-gray-500 leading-relaxed">
              To initiate a return, please contact us at hello@masterstrap.com with your order number. 
              Return shipping costs are the responsibility of the customer unless the item is defective.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Product Warranty</h2>
            <p className="text-gray-500 leading-relaxed">
              All MasterStrap products come with a lifetime warranty against manufacturing defects. 
              This does not cover normal wear and tear, accidental damage, or damage caused by improper 
              care. To make a warranty claim, please contact us with photos of the defect and your order information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-500 leading-relaxed">
              All content on this website, including text, images, logos, and designs, is the property of 
              MasterStrap and is protected by copyright and trademark laws. You may not use, reproduce, or 
              distribute any content without our express written permission.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-500 leading-relaxed">
              To the maximum extent permitted by law, MasterStrap shall not be liable for any indirect, 
              incidental, special, or consequential damages arising from the use of our products or 
              website. Our total liability shall not exceed the amount paid for the product in question.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Contact</h2>
            <p className="text-gray-500 leading-relaxed">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:hello@masterstrap.com" className="text-amber-600 hover:text-amber-700">
                hello@masterstrap.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            By using our website, you acknowledge that you have read and understood these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
