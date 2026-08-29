import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RedirectIfAuthed({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default RedirectIfAuthed;