import { Component, createRef } from 'react';

export class ErrorBoundary extends Component {
  state = { failed: false };
  heading = createRef();

  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.heading.current?.focus(); }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main id="main" tabIndex={-1}>
      <h1 ref={this.heading} tabIndex={-1}>This page could not open</h1>
      <p role="alert">Your saved records have not been cleared. Return to Today to try another page. Unsaved form details may need to be entered again.</p>
      <button onClick={() => {
        window.location.hash = '#/';
        this.setState({ failed: false });
      }}>Return to Today</button>
    </main>;
  }
}
