import { Outlet } from 'react-router-dom';
import { Header, Footer } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
