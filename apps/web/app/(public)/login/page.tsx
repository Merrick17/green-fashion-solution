'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function LoginPage() {
  const login = useLogin();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values);
  }

  return (
    <AuthSplitLayout
      panel={
        <AuthEditorialPanel
          title="Your sourcing partner, on demand."
          body="Review proposals, track sampling, and monitor production — backed by a team with deep fashion supply chain expertise."
        />
      }
    >
      <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo variant="dark" height={28} />
          </div>
          <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue
          </p>
          {verified === '1' && (
            <div className="mt-6 border border-border bg-[hsl(142,76%,97%)] px-4 py-3 text-sm text-[hsl(142,60%,30%)]">
              Email verified — you can sign in now.
            </div>
          )}
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-foreground underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              {login.isError && (
                <p className="text-sm text-destructive">
                  Invalid email or password.
                </p>
              )}
              <Button
                type="submit"
                variant="brand"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </Form>
          <div className="mt-8 space-y-3 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>
              New here?{' '}
              <Link
                href="/register"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Begin your collection
              </Link>
            </p>
            <p>
              Designer?{' '}
              <Link
                href="/designer-apply"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Apply to contribute
              </Link>
            </p>
          </div>
      </div>
    </AuthSplitLayout>
  );
}
