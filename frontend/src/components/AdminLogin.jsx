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
        const storedToken = sessionStorage.getItem('admin_token');
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
            // Verify token by making a lightweight request
            // Explicitly set the Authorization header
            await axios.get(`${apiBaseUrl}/admin/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // If successful, store token in sessionStorage and redirect
            sessionStorage.setItem('admin_token', token);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
            sessionStorage.removeItem('admin_token'); // Clear any stale state
            setError('Invalid admin credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-brand">
                    <div className="admin-logo-text">NEXORA</div>
                    <p className="admin-tagline">Intelligence Reimagined</p>
                </div>

                <h2>sys_admin_access</h2>

                <form onSubmit={handleSubmit} role="form" aria-label="Admin Login">
                    <div className="form-group">
                        <label htmlFor="admin-token" className="admin-label">
                            Security Token
                        </label>
                        <input
                            id="admin-token"
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter authentication token"
                            autoComplete="current-password"
                            className={error ? 'input-error' : ''}
                            disabled={isLoading}
                            aria-invalid={!!error}
                            aria-describedby="auth-helper"
                        />
                        <p id="auth-helper" className="input-helper-text">
                            Authorized access only. All attempts are logged.
                        </p>
                    </div>

                    {error && (
                        <div className="error-message shake-animation" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary full-width"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying Credentials...' : 'Authenticate'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
