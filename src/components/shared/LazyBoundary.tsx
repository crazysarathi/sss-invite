import { Component, type ErrorInfo, type ReactNode } from "react";

interface LazyBoundaryProps {
  children: ReactNode;
  /** Rendered when the lazy chunk fails to load or throws (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Error boundary for optional, lazily-loaded enhancements (3D scenes, the
 * opening seal ball). If the chunk fails to load or WebGL throws, the
 * invitation must keep working — render the fallback, never crash the tree.
 */
export class LazyBoundary extends Component<LazyBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn("[LazyBoundary] optional enhancement failed:", error, info.componentStack);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
