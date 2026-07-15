import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="app-shell">
      <Layout>
        <AppRoutes />
      </Layout>
    </div>
  );
}