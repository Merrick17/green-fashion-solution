'use client';
import Image from 'next/image';
import { LANDING_MEDIA } from '@/lib/landing-media';
import { SectionHeader } from './section-header';
const testimonials = [
  {
    quote:
      "We value Geworg's commitment and deep understanding of global sourcing markets. His support in selecting suppliers and ensuring product quality has made our supply chain robust and flexible.",
    name: 'Susanne Schwenger',
    role: 'CPO',
    company: "Marc O'Polo",
  },
  {
    quote:
      'What I particularly appreciate about Geworg is his ability to work strategically and at the same time drive forward operational issues very effectively.',
    name: 'Florian Mey',
    role: 'Managing Partner',
    company: 'Mey',
  },
  {
    quote:
      'Green Fashion Solution has a comprehensive end-2-end understanding of product development and procurement. Their knowledge of the global procurement markets and his supplier network have been of great value to us.',
    name: 'Signe Oepen',
    role: 'COO',
    company: 'MUSTANG',
  },
  {
    quote:
      'Geworg combines deep experience in supplier relationships with a collaborative spirit and strong negotiation skills.',
    name: 'Patrick Barth',
    role: 'Director Product & Supply Chain',
    company: 'Palmers',
  },
  {
    quote:
      'Green Fashion Solution proves that lean thinking and data-led decisions drive real transformation in fashion.',
    name: 'Semih Simsek',
    role: 'CEO',
    company: 'Liebeskind Berlin',
  },
];
export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-foreground py-28 text-primary-foreground lg:py-36"
    >
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <SectionHeader
          label="Testimonials"
          title="What renowned customers say about Green Fashion Solution"
          description="Trusted feedback from brands we partner with."
          className="mb-16"
        />
        {/* Lead pull-quote — editorial scale */}
        <figure className="mb-16 max-w-5xl border-l-2 border-accent pl-8 sm:pl-12">
          <blockquote className="font-serif text-2xl font-normal leading-[1.35] tracking-tight text-balance sm:text-3xl lg:text-[2.5rem] lg:leading-[1.3]">
            &ldquo;We deliver strategies and global solutions for complex
            challenges, creating a clear competitive advantage for our
            customers.&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-4">
            <span aria-hidden className="h-px w-10 bg-accent/60" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
              Geworg Ambarzumian, CEO &amp; Founder
            </span>
          </figcaption>
        </figure>
        {/* Testimonial grid */}
        <div className="grid gap-px border-t border-primary-foreground/15 bg-primary-foreground/10 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => {
            const photo =
              LANDING_MEDIA.testimonialPhotos[
                item.name as keyof typeof LANDING_MEDIA.testimonialPhotos
              ];
            return (
              <figure
                key={`${item.name}-${item.company}`}
                className="flex h-full flex-col bg-foreground p-8 lg:p-10"
              >
                <blockquote className="flex-1 text-[0.95rem] leading-[1.7] text-primary-foreground/85">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-primary-foreground/12 pt-6">
                  {photo && (
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-primary-foreground/20">
                      <Image
                        src={photo}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-primary-foreground/55">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
