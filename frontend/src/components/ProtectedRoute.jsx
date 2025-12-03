import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>⛔ Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
          <button onClick={() => window.history.back()} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <div className="protected-route">{children}</div>;
};

export default ProtectedRoute;



