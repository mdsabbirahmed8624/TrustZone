'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-card border border-border/60 rounded-2xl shadow-xl max-w-lg mx-auto my-12 text-center">
          <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20 animate-pulse">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
            Enterprise System Exception
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            An unexpected error occurred in this view. Diagnostics have logged the trace. Please refresh or contact IT Support.
          </p>
          {this.state.error && (
            <div className="w-full text-left bg-secondary/80 border border-border p-3.5 rounded-lg text-xs font-mono text-red-600 dark:text-red-400 overflow-x-auto max-h-40 mb-6">
              {this.state.error.name}: {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-sm transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md shadow-primary/25"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
