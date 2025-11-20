import React, { useState } from 'react'
import './LoginSignup.css'
import userIcon from "./assets/person.png";
import emailIcon from "./assets/email.png";
import passwordIcon from "./assets/password.png";
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const LoginSignup = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const resetMessages = () => {
        setMessage(null);
        setError(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        resetMessages();

        if (!email || !password || (isSignup && !name)) {
            setError('Please fill required fields');
            return;
        }

        if (isSignup && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const url = `${API_BASE}/auth/${isSignup ? 'register' : 'login'}`;
            const body = isSignup ? { name, email, password } : { email, password };
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Server error');
                setLoading(false);
                return;
            }

            // Expect { token, user }
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

                if (isSignup) {
                    // After successful registration, switch to login mode and navigate to login page
                    setIsSignup(false);
                    setMessage('Successfully registered. Please log in.');
                    setError(null);
                    navigate('/login');  // Changed to /login

                } else {
                    setMessage('Logged in successfully');
                    setError(null);
                    // go to home page
                    navigate('/');
                }
        } catch (err) {
            console.error(err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

        const navigate = useNavigate();

        return (
            <div className='container'>
                <div className='card'>
                    <div className='header'>
                            <div className='text'>{isSignup ? 'Sign Up' : 'Log In'}</div>
                            <div className='underline'></div>
                    </div>

                    <form className='inputs' onSubmit={handleSubmit}>
                        {isSignup && (
                            <div className='input'>
                                <img src={userIcon} alt="name" />
                                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Full name" />
                            </div>
                        )}

                        <div className='input'>
                                <img src={emailIcon} alt="email" />
                                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@example.com"/>
                        </div>
                        <div className='input'>
                                <img src={passwordIcon} alt="password" />
                                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"/>
                        </div>

                        {isSignup && (
                            <div className='input'>
                                <img src={passwordIcon} alt="confirm" />
                                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password"/>
                            </div>
                        )}

                        <div className="forget-password"> Lost Password? <span style={{cursor:'pointer'}}>Click Here</span></div>

            <div className="submit-container">
                <button className="submit" type="submit" disabled={loading}>{loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Log In')}</button>
                <button type="button" className="submit secondary" onClick={() => { setIsSignup(!isSignup); resetMessages(); }}>{isSignup ? 'Switch to Log In' : 'Switch to Sign Up'}</button>
            </div>
                </form>

                {message && <div className='message success'>{message}</div>}
                {error && <div className='message error'>{error}</div>}
            </div>
        </div>
    )
}

export default LoginSignup