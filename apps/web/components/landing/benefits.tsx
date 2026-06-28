'use client';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { LANDING_MEDIA } from '@/lib/landing-media';
import { SectionHeader } from './section-header';
const benefits = [
  {
    number: '01',
    title: 'Increase the value-to-money ratio through innovations',
    description:
      'We identify cost-saving opportunities and introduce innovative processes that maximize value without compromising quality.',
    image: LANDING_MEDIA.benefits[0],
    alt: 'Textile innovation and fabric development',
    className:
      'min-h-[260px] sm:min-h-[320px] lg:col-span-7 lg:row-span-2 lg:min-h-[560px]',
    sizes: '(max-width: 768px) 100vw, 58vw',
  },
  {
    number: '02',
    title: 'Deliver sustainable, high-quality products on time',
    description:
      'Our end-to-end oversight ensures every product meets strict quality and sustainability standards, delivered on schedule.',
    image: LANDING_MEDIA.benefits[1],
    alt: 'Sustainable fashion materials and quality craftsmanship',
    className:
      'min-h-[220px] sm:min-h-[260px] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:min-h-[272px]',
    sizes: '(max-width: 768px) 100vw, 42vw',
  },
  {
    number: '03',
    title: 'Make the supply chain resilient and agile',
    description:
      'We build adaptive supply chains that can respond swiftly to market shifts, disruptions, and evolving consumer demands.',
    image: LANDING_MEDIA.benefits[2],
    alt: 'Global fashion supply chain and logistics',
    className:
      'min-h-[220px] sm:min-h-[260px] lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:min-h-[272px]',
    sizes: '(max-width: 768px) 100vw, 42vw',
  },
];
export function Benefits() {
  const prefersReduced = useReducedMotion();
  return (
    <section id="benefits" className="py-28 lg:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <SectionHeader
          label="Platform pillars"
          title="Four pillars of the sourcing workspace"
          description="Project Intake, Sourcing Library, Proposal Builder, and Execution Tracking connect every step from client brief to delivery."
          className="mb-12"
        />
        <div className="mb-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl font-serif text-2xl font-normal leading-[1.15] tracking-tight sm:text-3xl">
            What are your needs? Challenge us.
          </p>
          <Button asChild variant="brand" className="shrink-0 px-6">
            <a href="#contact">Book Consultation</a>
          </Button>
        </div>
        <div className="grid auto-rows-fr gap-5 lg:grid-cols-12 lg:gap-6">
          {benefits.map((benefit, index) => (
            <motion.article
              key={benefit.title}
              className={`group relative overflow-hidden ${benefit.className}`}
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: 'easeOut',
              }}
            >
              <Image
                src={benefit.image}
                alt={benefit.alt}
                fill
                sizes={benefit.sizes}
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-foreground/45" />
              <div className="absolute inset-x-0 bottom-0 border-t border-primary-foreground/15 bg-foreground/90 p-7 sm:p-9">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground/70">
                  {benefit.number}
                </span>
                <h3 className="mt-3 max-w-md font-serif text-xl font-normal leading-[1.2] text-primary-foreground sm:text-2xl">
                  {benefit.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-[1.65] text-primary-foreground/80 sm:mt-4">
                  {benefit.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
