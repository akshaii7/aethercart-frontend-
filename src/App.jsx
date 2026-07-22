import { Component } from "react";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Something went wrong loading this page.</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>{this.state.error?.message}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.history.back();
            }}
            style={{ padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Go Back
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div className="app-shell">
      <Layout>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Layout>
    </div>
  );
}