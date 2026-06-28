'use client';
import { useState } from 'react';
import { SectionHeader } from './section-header';
import { ExpertiseStepper } from './expertise-stepper';
export function Process() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <section
      id="process"
      className="border-y border-border bg-muted/30 py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <SectionHeader
          label="How it works"
          title="Four pillars, one workflow"
          description="Project Intake, Sourcing Library, Proposal Builder, and Execution Tracking guide every collection from inspiration through production."
          className="mb-14 max-w-3xl"
        />
        <ExpertiseStepper
          activeIndex={activeStep}
          onStepChange={setActiveStep}
        />
      </div>
    </section>
  );
}
