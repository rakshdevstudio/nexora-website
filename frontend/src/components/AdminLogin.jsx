import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import '../admin.css';

const AdminLogin = ({ apiBaseUrl }) => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in, redirect to dashboard
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token.trim()) {
            setError('Token is required');
            return;
        }

        setIsLoading(true);

        try {
            // Verify token by making a lightweight request (e.g., stats)
            await axios.get(`${apiBaseUrl}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If successful, store token and redirect
            localStorage.setItem('admin_token', token);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
            // Differentiate between network error and auth error if possible, but for security generic is okay
            setError('Invalid token or server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h2>Admin Access</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="admin-token" className="sr-only">Admin Token</label>
                        <input
                            id="admin-token"
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter Admin Token"
                            autoComplete="current-password"
                            className={error ? 'input-error' : ''}
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <button
                        type="submit"
                        className="btn-primary full-width"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
