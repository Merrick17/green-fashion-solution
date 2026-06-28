'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '@/hooks/use-auth';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(values: ForgotPasswordFormValues) {
    forgotPassword.mutate(values.email, {
      onSuccess: () => setSent(true),
      onError: (err: unknown) => {
        // Only treat genuine network/5xx failures as errors; all 4xx are silenced.
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (!status || status >= 500) {
          // leave sent=false so the generic error message renders
        } else {
          setSent(true);
        }
      },
    });
  }

  return (
    <AuthSplitLayout
      panel={
        <AuthEditorialPanel
          title="Reset your password."
          body="Enter your email and we will send you a link to set a new password."
        />
      }
    >
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 lg:hidden">
          <Logo variant="dark" height={28} />
        </div>
        <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email and we will send you a reset link.
        </p>
        {sent ? (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              If this email is registered, a reset link is on its way. Check your spam folder too.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@brand.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {forgotPassword.isError && (() => {
                  const status = (forgotPassword.error as { response?: { status?: number } })?.response?.status;
                  if (!status || status >= 500) {
                    return (
                      <p className="text-sm text-destructive">
                        Something went wrong. Please try again.
                      </p>
                    );
                  }
                  return null;
                })()}
                <Button
                  type="submit"
                  variant="brand"
                  className="w-full"
                  disabled={forgotPassword.isPending}
                >
                  {forgotPassword.isPending ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </Form>
            <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
}
