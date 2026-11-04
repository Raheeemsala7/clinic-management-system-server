'use client';

import React, { Component, type ReactNode } from 'react';

export interface ErrorComponentProps {
  error?: Error;
  reset: () => void;
}

export interface ErrorBoundaryProps {
  errorComponent: React.ComponentType<ErrorComponentProps>;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const ErrorComp = this.props.errorComponent;
      return <ErrorComp error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

