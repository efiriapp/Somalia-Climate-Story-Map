import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  /** Changing this value clears the error, e.g. when the visitor navigates. */
  resetKey: string;
  title: string;
  message: string;
  retryLabel: string;
  children: ReactNode;
};

type State = { error: Error | null };

/**
 * Keeps a crash in one page (most often a map that fails to load) from
 * blanking the whole site. The header, navigation and footer stay usable.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Page failed to render', error, info.componentStack);
  }

  componentDidUpdate(previous: Props): void {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <section className="detail page-error" role="alert">
        <h1>{this.props.title}</h1>
        <p>{this.props.message}</p>
        <button className="back" type="button" onClick={() => this.setState({ error: null })}>
          {this.props.retryLabel}
        </button>
      </section>
    );
  }
}
