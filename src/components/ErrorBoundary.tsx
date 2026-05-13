import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;

      if (Fallback) {
        return <Fallback error={this.state.error} reset={this.reset} />;
      }

      return (
        <div className="form-alert form-alert-error">
          <h2 className="form-alert-title">
            Something went wrong
          </h2>
          <p style={{ marginBottom: '12px' }}>{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="btn btn-danger btn-sm"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
