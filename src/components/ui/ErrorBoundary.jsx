import React from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 text-center border-rose-200 shadow-xl bg-white space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Something went wrong loading this page
              </h2>
              <p className="text-sm text-slate-600">
                An unexpected application error occurred. We have logged this issue.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="bg-slate-900 text-rose-300 font-mono text-left text-xs p-4 rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                <p className="font-bold text-white mb-1">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-slate-400 text-[11px] leading-relaxed">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Home className="w-4 h-4" />}
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<RotateCw className="w-4 h-4" />}
                onClick={this.handleReset}
              >
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
