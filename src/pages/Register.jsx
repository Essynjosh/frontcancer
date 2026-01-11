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
            // --- FIX 1: DYNAMIC API URL ---
            // Locally it uses the proxy (''), on Vercel it uses your backend URL
            const API_BASE_URL = import.meta.env.VITE_API_URL || '';
            
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            // --- FIX 2: JSON GUARD (Stops the "Unexpected token T" crash) ---
            const contentType = response.headers.get("content-type");
            let data = {};

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // This catches the 404 HTML error page from Vercel
                throw new Error(`Server Error: ${response.status}. The frontend cannot find the backend.`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            // Success logic
            if (data.token) {
                login(data.token, data.userId);
                alert('Registration successful!');
                navigate('/risk-check');
            }

        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h1 className="auth-title">Create Your Account</h1>
                {error && <div className="error-box" style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

                <div className="input-group-row">
                    <input type="text" name="firstName" value={firstName} onChange={handleChange} placeholder="First Name" required className="input-field" />
                    <input type="text" name="lastName" value={lastName} onChange={handleChange} placeholder="Last Name" required className="input-field" />
                </div>
                
                <input type="email" name="email" value={email} onChange={handleChange} placeholder="Email Address" required className="input-field" />
                <input type="password" name="password" value={password} onChange={handleChange} placeholder="Password" required minLength="6" className="input-field" />
                <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleChange} placeholder="Confirm Password" required className="input-field" />
                
                <button type="submit" disabled={loading} className="btn btn-primary btn-auth">
                    {loading ? 'Processing...' : 'Register'}
                </button>
                
                <p className="auth-link-text">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
