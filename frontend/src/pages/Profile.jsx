import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.put(
        '/auth/profile',
        { name, email },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      login({ ...user, ...res.data, token: user?.token });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="form-container">
      <h1>My Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">NAME</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">EMAIL</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>ROLE</label>
          <input type="text" value={user?.role || ''} disabled />
        </div>
        {error && <p className="error-text" style={{ color: '#ff4d4f', marginTop: '10px' }}>{error}</p>}
        {message && <p className="success-text" style={{ color: '#52c41a', marginTop: '10px' }}>{message}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default Profile;