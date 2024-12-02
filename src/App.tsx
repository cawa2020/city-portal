import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import { useUser } from './context/UserContext';
import MyRequestsPage from './pages/MyRequestsPage';
import AdminPage from './pages/AdminPage';
import './index.css';

// Защищенный маршрут
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  console.log(user)

  if (!user) {
    return <Navigate to="/main" />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useUser();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/main" element={<MainPage />} />
          <Route
            path="/requests/my"
            element={
              <ProtectedRoute>
                <MyRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {user?.role === 'ADMIN' && (
                  <AdminPage />
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
