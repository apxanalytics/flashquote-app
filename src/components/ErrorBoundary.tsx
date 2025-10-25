import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  state = { error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-red-300">
          <h2 className="text-xl font-semibold mb-2">Something broke on this page.</h2>
          <div className="bg-neutral-900 rounded-xl p-4 text-sm">
            {this.state.error.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
