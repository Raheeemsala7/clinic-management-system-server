'use client';

import { Component, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default function ProductsErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return <ErrorBoundaryInternal fallback={fallback}>{children}</ErrorBoundaryInternal>;
}

class ErrorBoundaryInternal extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ProductsErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ProductsErrorFallback />;
    }

    return this.props.children;
  }
}

function ProductsErrorFallback() {
  const t = useTranslations('home');

  return <div className="text-burgundy-600 dark:text-blush-300 text-base">
    {t('failedToLoadProducts')}
  </div>;
}