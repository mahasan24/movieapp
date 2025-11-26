import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import './LoginSignup.css'
import userIcon from "./assets/person.png";
import emailIcon from "./assets/email.png";
import passwordIcon from "./assets/password.png";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const LoginSignup = () => {
    const { t } = useTranslation();
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
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
            if (isSignup) {
                // Sign up
                const result = await signUp(name, email, password);
                if (result.success) {
                    setIsSignup(false);
                    setMessage(t('auth.signupSuccess'));
                    setError(null);
                } else {
                    setError(result.error || 'Registration failed');
                }
            } else {
                // Login using AuthContext
                const result = await signIn(email, password);
                if (result.success) {
                    setMessage(t('auth.loginSuccess'));
                    setError(null);
                    // Navigation happens in AuthContext
                } else {
                    setError(result.error || 'Login failed');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='container'>
            <div className='card'>
                <div className='header'>
                    <div className='text'>{isSignup ? t('auth.signup') : t('auth.login')}</div>
                    <div className='underline'></div>
                </div>

                <form className='inputs' onSubmit={handleSubmit}>
                    {isSignup && (
                        <div className='input'>
                            <img src={userIcon} alt="name" />
                            <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder={t('auth.name')} />
                        </div>
                    )}

                    <div className='input'>
                        <img src={emailIcon} alt="email" />
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={t('auth.email')}/>
                    </div>
                    <div className='input'>
                        <img src={passwordIcon} alt="password" />
                        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={t('auth.password')}/>
                    </div>

                    {isSignup && (
                        <div className='input'>
                            <img src={passwordIcon} alt="confirm" />
                            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password"/>
                        </div>
                    )}

                    <div className="submit-container">
                        <button className="submit" type="submit" disabled={loading}>
                            {loading ? (isSignup ? t('auth.signingUp') : t('auth.loggingIn')) : (isSignup ? t('auth.signupButton') : t('auth.loginButton'))}
                        </button>
                        <button type="button" className="submit secondary" onClick={() => { setIsSignup(!isSignup); resetMessages(); }}>
                            {isSignup ? t('auth.switchToLogin') : t('auth.switchToSignup')}
                        </button>
                    </div>
                </form>

                {message && <div className='message success'>{message}</div>}
                {error && <div className='message error'>{error}</div>}
            </div>
        </div>
    )
}

export default LoginSignup
