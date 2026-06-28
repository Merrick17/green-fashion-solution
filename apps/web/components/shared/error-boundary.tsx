'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  suggestion?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Error</p>
            <h3 className="font-serif text-2xl tracking-tight text-foreground">
              Something went wrong
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              An unexpected error occurred. The rest of the page is unaffected.
            </p>
            {this.props.suggestion && (
              <p className="mt-1 max-w-md text-xs text-muted-foreground opacity-70">
                {this.props.suggestion}
              </p>
            )}
            <Button variant="brand" onClick={this.handleReset} className="mt-6">
              Try again
            </Button>
            <div className="mt-8 h-px w-12 bg-border" aria-hidden />
          </div>
        )
      );
    }

    return this.props.children;
  }
}
