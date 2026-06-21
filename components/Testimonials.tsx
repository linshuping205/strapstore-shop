'use client';

import { useEffect, useRef } from 'react';

const testimonialData = [
  {
    initials: 'JM',
    name: 'James Mitchell',
    role: 'Vintage Watch Collector, London',
    text: '"The Buttero strap completely transformed my vintage Omega. The patina after three months is exactly what I hoped for — rich, warm, and uniquely mine. You can feel the craftsmanship in every stitch."',
  },
  {
    initials: 'AK',
    name: 'Alexander Kovac',
    role: 'Architect, Vienna',
    text: '"I ordered the Shinki Cordovan strap for my Rolex Datejust. The depth of color and the flawless saddle stitching are unlike anything I\'ve seen from mass-market brands. Worth every penny."',
  },
  {
    initials: 'SR',
    name: 'Sarah Reynolds',
    role: 'Creative Director, New York',
    text: '"The fluororubber strap is perfect for my daily driver. I\'ve worn it swimming, hiking, and to board meetings — it adapts to every scenario. The quick-release spring bars are a game changer."',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="text-xs tracking-[3px] uppercase text-accent font-semibold mb-4 inline-block">Testimonials</span>
          <h2 className="font-heading text-[clamp(1.8rem,3.2vw,2.6rem)] font-normal mb-4 leading-tight">What Our Clients Say</h2>
          <p className="text-gray-500 max-w-xl mx-auto font-light text-lg leading-relaxed">Trusted by watch enthusiasts and collectors across 40+ countries.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {testimonialData.map((t, i) => (
            <div key={i} className="reveal bg-white border border-gray-100 rounded p-12 relative hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-transparent transition-all duration-300">
              <span className="absolute top-6 right-8 font-heading text-[5rem] text-accent/15 leading-none pointer-events-none">&ldquo;</span>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                  </svg>
                ))}
              </div>
              <p className="text-base leading-8 text-gray-900 mb-8 italic relative z-10">{t.text}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-yellow-700 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {t.initials}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-gray-900">{t.name}</span>
                  <span className="text-xs text-gray-500">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
