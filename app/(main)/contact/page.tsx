import { Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | MasterStrap',
  description: 'Get in touch with MasterStrap. We are here to help with orders, product questions, and custom requests.',
};

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    content: 'hello@masterstrap.com',
    href: 'mailto:hello@masterstrap.com',
  },
  {
    icon: MapPin,
    title: 'Workshop',
    content: 'Via della Vigna Nuova 12, Florence, Italy',
    href: null,
  },
  {
    icon: Clock,
    title: 'Business Hours',
    content: 'Mon - Fri: 9:00 AM - 6:00 PM CET',
    href: null,
  },
  {
    icon: MessageCircle,
    title: 'Response Time',
    content: 'We typically respond within 24 hours',
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            We would love to hear from you. Whether you have a question about an order, 
            a product, or a custom request — our team is here to help.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <info.icon size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{info.title}</h3>
                    {info.href ? (
                      <a href={info.href} className="text-gray-500 text-sm hover:text-amber-600 transition-colors">
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">{info.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Custom Orders</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Looking for something unique? We offer custom strap services including 
                bespoke sizing, special leather selections, and personalized monogramming. 
                Reach out and let us know what you have in mind.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <form className="space-y-5" action="mailto:hello@masterstrap.com" method="post" encType="text/plain">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <select
                  name="subject"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 bg-white"
                >
                  <option>General Inquiry</option>
                  <option>Order Question</option>
                  <option>Custom Request</option>
                  <option>Return / Exchange</option>
                  <option>Wholesale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
