'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { waitlistSchema, type WaitlistFormValues } from '@/lib/schemas/waitlist';
import { useJoinWaitlist } from '@/hooks/use-waitlist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function PilotWaitlistForm() {
  const [submitted, setSubmitted] = useState(false);
  const joinWaitlist = useJoinWaitlist();
  const reduceMotion = useReducedMotion();
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: '', brand: '', email: '' },
  });

  function onSubmit(values: WaitlistFormValues) {
    joinWaitlist.mutate(values, { onSuccess: () => setSubmitted(true) });
  }

  if (submitted) {
    return (
      <div
        id="waitlist"
        className="scroll-mt-24 border border-border bg-card px-6 py-10 text-center sm:px-10"
      >
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent" />
        <h3 className="text-xl font-medium">You&apos;re on the list</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll reach out when the next pilot cohort opens for your brand.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      id="waitlist"
      className="scroll-mt-24 border border-border bg-card px-6 py-8 sm:px-10 sm:py-10"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">
        Join the pilot cohort
      </h3>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Limited places for brands ready to run a full collection cycle, from
        brief and moodboard through sourcing proposal, sampling, and production.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    disabled={joinWaitlist.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your brand or company"
                    disabled={joinWaitlist.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Work email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@brand.com"
                    disabled={joinWaitlist.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button
              type="submit"
              size="lg"
              variant="brand"
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? 'Joining…' : 'Join waitlist'}
            </Button>
            {joinWaitlist.isError && (
              <p className="mt-3 text-sm text-destructive">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
