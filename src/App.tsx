import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import { useUser } from './context/UserContext';
import MyRequestsPage from './pages/MyRequestsPage';
import './index.css';

// Защищенный маршрут
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/main" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <UserProvider>
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
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
