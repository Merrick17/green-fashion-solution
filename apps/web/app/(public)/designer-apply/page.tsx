'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitDesignerApplication } from '@/hooks/use-designer-application';
import {
  designerApplicationSchema,
  type DesignerApplicationFormValues,
} from '@/lib/schemas/designer-application';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from '@/components/design-system/logo';
import { AuthEditorialPanel } from '@/components/landing/auth-editorial-panel';
import { AuthSplitLayout } from '@/components/layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function DesignerApplyPage() {
  const submit = useSubmitDesignerApplication();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<DesignerApplicationFormValues>({
    resolver: zodResolver(designerApplicationSchema),
    defaultValues: {
      name: '',
      email: '',
      portfolioUrl: '',
      experience: '',
      message: '',
    },
  });

  function onSubmit(values: DesignerApplicationFormValues) {
    submit.mutate(
      {
        name: values.name,
        email: values.email,
        portfolioUrl: values.portfolioUrl || undefined,
        experience: values.experience || undefined,
        message: values.message || undefined,
      },
      { onSuccess: () => setSubmitted(true) },
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card p-8 text-center">
          <h1 className="font-serif text-xl">Application received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team will review your profile and contact you by email.
          </p>
          <Button asChild variant="brandOutline" className="mt-6">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthSplitLayout
      panel={
        <AuthEditorialPanel
          title="Join our sourcing network."
          body="Contribute fabric research, product references, and supplier intelligence to our global sourcing archive."
        />
      }
    >
      <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 lg:hidden">
            <Logo variant="dark" height={28} />
          </div>
          <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)]">Apply as a designer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your sourcing expertise
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submit.isError && (
                <p className="text-sm text-destructive">
                  Could not submit application.
                </p>
              )}
              <Button
                type="submit"
                variant="brand"
                className="w-full"
                disabled={submit.isPending}
              >
                {submit.isPending ? 'Submitting…' : 'Submit application'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Fashion brand?{' '}
            <Link href="/register" className="underline underline-offset-4">
              Begin your collection
            </Link>
          </p>
      </div>
    </AuthSplitLayout>
  );
}
