import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * App-level error boundary. Catches render/runtime errors anywhere below it and
 * shows a branded fallback instead of a white screen. A full reload clears the
 * boundary (simplest reliable recovery for an SPA).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would report to an error service (Sentry, etc.).
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <div className="glass-deep w-full max-w-md rounded-[2rem] p-10">
          <p className="eyebrow mb-4 inline-flex justify-center">Something drifted</p>
          <h1 className="text-2xl font-medium tracking-tight text-mist-100">
            That view didn't load.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            An unexpected error interrupted the page. Reloading usually clears it.
          </p>
          <a href="/" className="btn-plum mt-7 inline-flex px-6 py-3 text-sm">
            Back to the coast
          </a>
        </div>
      </div>
    );
  }
}
