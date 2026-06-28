'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/hooks/use-auth';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas/auth';
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

export default function RegisterPage() {
  const register = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  function onSubmit(values: RegisterFormValues) {
    register.mutate(values);
  }

  return (
    <AuthSplitLayout
      panel={
        <AuthEditorialPanel
          title="Start your sourcing project."
          body="Tell us about your collection. Our team handles material research, supplier curation, and supply chain execution from day one."
        />
      }
    >
      <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo variant="dark" height={28} />
          </div>
          <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight">
            Begin your collection
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For fashion brands.{' '}
            <Link
              href="/designer-apply"
              className="underline underline-offset-4"
            >
              Designers apply here
            </Link>
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
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
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {register.isError && (
                <p className="text-sm text-destructive">
                  Registration failed. Please try again.
                </p>
              )}
              <Button
                type="submit"
                variant="brand"
                className="w-full"
                disabled={register.isPending}
              >
                {register.isPending ? 'Creating…' : 'Start project'}
              </Button>
            </form>
          </Form>
          <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
      </div>
    </AuthSplitLayout>
  );
}
