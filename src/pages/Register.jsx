import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../styles/Auth.css'; 

const Register = () => {
    const { login } = useAuth(); 
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { firstName, lastName, email, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            // --- FIX: Guard against non-JSON responses (like 404 HTML pages) ---
            const contentType = response.headers.get("content-type");
            let data = {};

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // If it's not JSON, it's likely a 404 or 500 HTML error page
                const textError = await response.text();
                console.error("Server returned non-JSON:", textError);
                throw new Error(`Server Error: ${response.status}. Please check if the backend is running.`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed due to server error.');
            }

            // Successfully register and log in
            if (data.token) {
                login(data.token, data.userId);
                alert('Registration successful! Welcome to Smart Health.');
                navigate('/risk-check');
            } else {
                throw new Error("No token received from server.");
            }

        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.message || 'An unexpected error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h1 className="auth-title">Create Your Account</h1>
                <p className="auth-subtitle">Get personalized health tracking and local clinic access.</p>

                {error && <div className="error-box" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <div className="input-group-row">
                    <input
                        type="text"
                        name="firstName"
                        value={firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                        className="input-field"
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        required
                        className="input-field"
                    />
                </div>
                
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="input-field"
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Password (Min 6 characters)"
                    required
                    minLength="6"
                    className="input-field"
                />
                <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    className="input-field"
                />
                
                <button type="submit" disabled={loading} className="btn btn-primary btn-auth">
                    {loading ? 'Processing...' : 'Register'}
                </button>
                
                <p className="auth-link-text">
                    Already have an account? <Link to="/login" className="link-secondary">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
