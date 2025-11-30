import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom'; // مهم في حالة التوجيه

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate(); // للتوجيه بعد تسجيل الدخول

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const dataToSend = {
            username: username,
            password: password
        };

        const LOGIN_API_URL = 'https://your-backend-domain.com/api/login'; // ← غيري الرابط هنا

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json(); 

            setLoading(false);

            if (!response.ok) {
                setErrorMessage(result.message || 'Invalid username or password.');
                return;
            }

            if (result.token) {
                localStorage.setItem('authToken', result.token);
            }

            if (result.user) {
                localStorage.setItem('userData', JSON.stringify(result.user));
            }

            alert('Login successful!');
            navigate('./Room'); 

        } catch (error) {
            setLoading(false);
            setErrorMessage('Network error. Please try again.');
            console.error('Network Error:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="form" onSubmit={handleSubmit}>
                
                <p className="title">Login</p>
                <p className="message">Welcome back! Please login to continue.</p>

                {errorMessage && (
                    <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
                        {errorMessage}
                    </p>
                )}

                <label>
                    <input
                        className="input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <span>Username</span>
                </label>

                <label>
                    <input
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span>Password</span>
                </label>

                <button className="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="signin">
                    Don’t have an account? <a href="register">Signup</a>
                </p>

            </form>
        </div>
    );
}

export default LoginPage;
