'use client';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SOURCING_PROCESS } from './expertise-steps';
type ExpertiseStepperProps = {
  activeIndex: number;
  onStepChange: (index: number) => void;
};
const STEP_COUNT = SOURCING_PROCESS.length;
export function ExpertiseStepper({
  activeIndex,
  onStepChange,
}: ExpertiseStepperProps) {
  const progressPct =
    STEP_COUNT > 1 ? (activeIndex / (STEP_COUNT - 1)) * 100 : 0;
  return (
    <div className="border border-border bg-card overflow-hidden px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
      <div className="-mx-2 overflow-x-auto px-2 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
        <div className="min-w-0">
          <div className="relative mb-8 grid grid-cols-4">
            <div
              className="pointer-events-none absolute top-1/2 right-[12.5%] left-[12.5%] h-px -translate-y-1/2 bg-border"
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute top-1/2 left-[12.5%] h-px -translate-y-1/2 origin-left bg-accent"
              aria-hidden
              initial={false}
              animate={{ width: `${progressPct * 0.75}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
            {SOURCING_PROCESS.map((step, index) => {
              const active = index === activeIndex;
              const done = index < activeIndex;
              return (
                <div
                  key={`rail-${step.id}`}
                  className="relative z-10 flex justify-center"
                >
                  <button
                    type="button"
                    onClick={() => onStepChange(index)}
                    aria-current={active ? 'step' : undefined}
                    aria-label={`Step ${step.number}: ${step.title}`}
                    className="group flex h-10 w-10 items-center justify-center"
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center border font-mono text-xs transition-all duration-300',
                        active
                          ? 'border-accent bg-accent/10 text-accent'
                          : done
                            ? 'border-accent/50 bg-accent/5 text-accent'
                            : 'border-border bg-card text-muted-foreground group-hover:border-accent/40 group-hover:text-foreground',
                      )}
                    >
                      {step.number}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          <ol className="grid grid-cols-4 gap-3 sm:gap-4">
            {SOURCING_PROCESS.map((step, index) => {
              const active = index === activeIndex;
              return (
                <li key={step.id} className="flex min-w-0">
                  <motion.article
                    layout
                    onClick={() => onStepChange(index)}
                    style={{ backgroundImage: `url(${step.image})` }}
                    className={cn(
                      'relative flex h-full min-h-[300px] w-full cursor-pointer flex-col overflow-hidden bg-cover bg-center transition-all duration-300',
                      active ? 'border-accent' : 'hover:border-accent/30',
                    )}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0.92 }}
                  >
                    <span className="sr-only">{step.imageAlt}</span>
                    <div className="relative z-10 mt-auto border-t border-primary-foreground/15 bg-foreground/90 p-4 sm:p-5">
                      <h4 className="text-sm font-medium text-primary-foreground sm:text-base">
                        {step.title}
                      </h4>
                      <p className="mt-2 flex-1 text-xs leading-relaxed text-primary-foreground/85 sm:mt-3 sm:text-sm">
                        {step.description}
                      </p>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-4 text-primary-foreground/70 sm:mt-5">
                        {step.tag}
                      </p>
                    </div>
                  </motion.article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
