"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { ProjectType, BudgetRange } from "@repo/types";
import { leadSchema, type LeadFormValues } from "@/lib/schemas/lead";
import { useCreateLead } from "@/hooks/use-leads";
import { Form } from "@/components/ui/form";
import { LeadFormFields } from "@/components/landing/lead-form-fields";
import { MotionReveal } from "@/components/design-system/motion-reveal";

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const createLead = useCreateLead();
  const reduce = useReducedMotion();
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      brand: "",
      email: "",
      projectType: ProjectType.PRODUCT_DEVELOPMENT,
      budgetRange: BudgetRange.RANGE_10K_25K,
      accepted: false,
    },
  });

  function onSubmit(values: LeadFormValues) {
    const { accepted: _accepted, ...dto } = values;
    createLead.mutate(dto, { onSuccess: () => setSubmitted(true) });
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-border bg-foreground py-24 text-primary-foreground lg:py-32"
    >
      <motion.div
        className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 border border-primary-foreground/10"
        aria-hidden
        animate={reduce ? undefined : { rotate: [0, 90, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 border border-primary-foreground/10"
        aria-hidden
        animate={reduce ? undefined : { rotate: [0, -45, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <MotionReveal>
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                Sourcing consultation
              </p>
              <h2 className="mt-4 text-balance text-3xl font-medium tracking-tight sm:text-4xl">
                Tell us about your next collection
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/75">
                Share your brand, collection scope, and sourcing requirements.
                Our team responds with a tailored supply chain approach — from
                material research to production delivery.
              </p>
              <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground/50">
                contact@greenfashionsolution.com · Dubai HQ
              </p>
            </div>
          </MotionReveal>

          <div>
            {submitted ? (
              <motion.div
                className="flex min-h-[320px] flex-col items-center justify-center border border-primary-foreground/15 bg-primary-foreground/5 p-10 text-center"
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2
                  className="mb-5 h-10 w-10 text-primary-foreground/80"
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-medium">Thank you</h3>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  Our sourcing team will be in touch shortly.
                </p>
              </motion.div>
            ) : (
              <MotionReveal delay={0.1}>
                <Form {...form}>
                  <LeadFormFields
                    form={form}
                    onSubmit={onSubmit}
                    isPending={createLead.isPending}
                    isError={createLead.isError}
                  />
                </Form>
              </MotionReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
