import Link from 'next/link';
import Image from 'next/image';
import { Award, Heart, Leaf, Globe, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'About Us | MasterStrap',
  description: 'Handcrafted leather watch straps made with Italian vegetable-tanned leather. Discover our story, craftsmanship, and commitment to quality.',
  alternates: {
    canonical: '/about/',
  },
};

const values = [
  {
    icon: Heart,
    title: 'Handcrafted with Love',
    description: 'Every strap is individually cut, stitched, and finished by skilled artisans in our Florence workshop. No mass production, no shortcuts.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'We source only Italian vegetable-tanned leather from certified tanneries. Our process uses natural tannins from bark and leaves, not harmful chemicals.',
  },
  {
    icon: Shield,
    title: 'Lifetime Warranty',
    description: 'We stand behind every strap we make. If your strap fails due to craftsmanship, we will replace it free of charge — for life.',
  },
  {
    icon: Clock,
    title: 'Made to Order',
    description: 'Each strap is made specifically for you. While this means a 3-5 day wait, you receive a product that was never meant for anyone else.',
  },
  {
    icon: Globe,
    title: 'Worldwide Shipping',
    description: 'We ship to over 60 countries. Every order is tracked, insured, and packaged in our signature gift box.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Our Buttero collection won the 2023 European Craftsmanship Award for excellence in leather goods.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Our Story
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            MasterStrap was born from a simple belief: the strap on your wrist should be 
            as exceptional as the timepiece it holds. Founded in 2024 in Florence, Italy, 
            we set out to create watch straps that combine centuries-old leatherworking traditions 
            with modern design sensibilities.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop"
              alt="Artisan working on leather"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why We Do What We Do</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              In an age of disposable accessories, we choose to make things that last. 
              Our straps are designed to develop a unique patina over time — becoming more 
              beautiful with every wear, telling the story of your journey.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We partner with small family-owned tanneries in Tuscany that have been 
              perfecting their craft for generations. Every hide is carefully selected, 
              and every strap passes through the hands of at least three artisans before 
              reaching you.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What We Stand For</h2>
            <p className="text-gray-500">The principles that guide every decision we make</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                  <value.icon size={20} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience the Difference?</h2>
        <p className="text-gray-500 mb-8">
          Browse our collection of handcrafted straps and find the perfect companion for your timepiece.
        </p>
        <Link
          href="/products/"
          className="inline-flex items-center px-8 py-3.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          Shop Collection
        </Link>
      </div>
    </div>
  );
}
