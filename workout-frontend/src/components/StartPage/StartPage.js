import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StartPage.module.css'; // Import the CSS module

function StartPage({ onLogin, onGuest }) {
    const API_URL = 'https://workout-backend-tma6.onrender.com';
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(''); // State for storing error message
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/api/login`, { username: loginUsername, password: loginPassword })
            .then(response => {
                console.log(response.data.message);
                localStorage.setItem('token', response.data.token); // Store the token
                onLogin(true);  // Update onLogin to set isAuthenticated to true
                navigate('/home');  // Navigate to home page
            })
            .catch(error => {
                console.error('Error logging in:', error);
                onLogin(false);  // Ensure to handle failed login
                setError('Login failed: Invalid username or password'); // Set error message
            });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (registerPassword !== confirmPassword) {
            setError('Passwords do not match!');
            return; // Prevent the form from submitting
        }
        axios.post(`${API_URL}/api/register`, { username: registerUsername, email: registerEmail, password: registerPassword })
            .then(response => {
                console.log(response.data.message);
                localStorage.setItem('token', response.data.token); // Store the token
                onLogin(true);  // Automatically log in the user after registration
                navigate('/home');  // Navigate to home page
            })
            .catch(error => {
                console.error('Error registering:', error);
                onLogin(false);  // Handle failed registration
                setError('Registration failed: Username or email already in use'); // Set error message
            });
    };

    //const handleGuestAccess = () => {
    //    onGuest();
    //    navigate('/home');
    //};

    return (
        <div className={styles.container}>
            {error && <div className={styles.error}>{error}</div>} {/* Display error message if present */}
            <form onSubmit={handleLogin} className={styles.form}>
                <h2 className={styles.title}>LOGIN</h2>
                <input type="text" className={styles.input} value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="Username" />
                <input type="password" className={styles.input} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" />
                <button type="submit" className={styles.button}>LOGIN</button>
            </form>

            <form onSubmit={handleRegister} className={styles.form}>
                <h2 className={styles.title}>REGISTER</h2>
                <input type="text" className={styles.input} value={registerUsername} onChange={e => setRegisterUsername(e.target.value)} placeholder="Username" />
                <input type="email" className={styles.input} value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="Email" />
                <input type="password" className={styles.input} value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="Password" />
                <input type="password" className={styles.input} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                <button type="submit" className={styles.button}>REGISTER</button>
            </form>
        </div>
    );
}
// <button onClick={handleGuestAccess} className={`${styles.button} ${styles.guestButton}`}>Continue as Guest</button>

export default StartPage;
