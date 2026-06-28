'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useResetPassword } from '@/hooks/use-auth';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/shared/password-input';
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

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetPassword = useResetPassword();
  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;
    resetPassword.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          toast.success('Password updated. Sign in with your new password.');
          router.push('/login');
        },
      },
    );
  }

  return (
    <AuthSplitLayout
      panel={
        <AuthEditorialPanel
          title="Set a new password."
          body="Choose a strong password to protect your account."
        />
      }
    >
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 lg:hidden">
          <Logo variant="dark" height={28} />
        </div>
        <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight">
          Reset password
        </h1>
        {!token ? (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              This link is invalid. Request a new one.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Request a new reset link
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter and confirm your new password.
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {resetPassword.isError && (
                  <p className="text-sm text-destructive">
                    This reset link has expired or is invalid.{' '}
                    <Link
                      href="/forgot-password"
                      className="font-medium underline underline-offset-4"
                    >
                      Request a new one
                    </Link>
                  </p>
                )}
                <Button
                  type="submit"
                  variant="brand"
                  className="w-full"
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
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
