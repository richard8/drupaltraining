import React, { Component } from 'react';
import SimpleErrorMessage from '../final/SimpleErrorMessage';

export const withErrorBoundary = (WrappedComponent, FallbackComponent = SimpleErrorMessage) => {
  return class ErrorBoundary extends Component {
    state = {
      errorThrown: false
    }

    componentDidCatch(error, info) {
      console.log('component stack is:', info.componentStack);
    }

    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return {
        errorThrown: true,
        error: error
      };
    }

    render() {
      if (this.state.errorThrown) {
        return <FallbackComponent {...this.props} error={this.state.error} />
      }
      return <WrappedComponent {...this.props} />;
    }
  }
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorThrown: false,
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      errorThrown: true,
      error: error
    };
  }

  componentDidCatch(error, info) {
    console.log('component stack is:', info.componentStack);
  }

  render() {
    if (this.state.errorThrown) {
      return <SimpleErrorMessage {...this.props} error={this.state.error} />
    }
    return this.props.children;
  }
}
