import Image from 'next/image';
import Link from 'next/link';

export default function Craftsmanship() {
  return (
    <section className="relative bg-white py-16 px-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-px bg-gray-200" />
      <div className="grid md:grid-cols-2 min-h-[600px] max-w-[1400px] mx-auto items-end">
        <div className="flex flex-col justify-center items-start text-left px-10 py-12 max-w-xl mx-auto">
          <h2 className="font-cormorant text-[clamp(1.6rem,2.8vw,2.4rem)] font-normal leading-tight mb-8 text-gray-900 tracking-tight whitespace-nowrap">
            Looking back at an iconic line
          </h2>
          <p className="font-cormorant text-lg leading-relaxed text-gray-500 mb-9">
            Master Strap&apos;s collection offers a contemporary reinterpretation of classic watch strap craftsmanship. Drawing inspiration from centuries of leatherworking heritage, we transpose traditional principles into a modern, resolutely artisanal style, while remaining faithful to the fundamental values of excellence and precision.
          </p>
          <Link href="/products/" className="text-sm font-semibold tracking-[1.5px] uppercase text-accent hover:text-yellow-700 transition-all inline-flex items-center gap-2 hover:gap-3">
            Discover the Collection →
          </Link>
        </div>
        <div className="relative overflow-hidden min-h-[400px] md:min-h-[600px] flex items-center justify-center group">
          <Image
            src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&h=900&fit=crop"
            alt="Watch strap craftsmanship"
            fill
            className="object-cover rounded transition-transform duration-[800ms] group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
