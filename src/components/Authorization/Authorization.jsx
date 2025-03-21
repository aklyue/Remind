import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmail from '../../hooks/useEmail';
import usePassword from '../../hooks/usePassword';
import useBlurHandler from '../../hooks/useBlurHandler';
import styles from './Authorization.module.scss';

function Authorization() {
    const { email, emailError, emailHandler } = useEmail('');
    const { password, passwordError, passwordHandler } = usePassword('');
    const { fieldsDirty, blurHandler } = useBlurHandler();

    const [formValid, setFormValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (emailError || passwordError) {
            setFormValid(false);
        } else {
            setFormValid(true);
        }
    }, [emailError, passwordError]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (formValid) {
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                localStorage.setItem('userId', user.id);
                navigate('/settings');
            } else {
                setErrorMessage('Incorrect email or password');
            }
        }
    };

    return (
        <div className={styles.authWrapper}>
            <form className={styles.authForm} onSubmit={submitHandler}>
                <h1 className={styles.authTitle}>Authorization</h1>
                {fieldsDirty.email && emailError && <div className={styles.error}>{emailError}</div>}
                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <input className={styles.input} onChange={emailHandler} value={email} onBlur={blurHandler} type="text" placeholder="Your email" name="email" />
                </div>
                {fieldsDirty.password && passwordError && <div className={styles.error}>{passwordError}</div>}
                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <input className={styles.input} onChange={passwordHandler} value={password} onBlur={blurHandler} type="password" placeholder="Password" name="password" />
                </div>
                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                <button className={styles.authButton} disabled={!formValid} type="submit">Sign in</button>
            </form>
        </div>
    );
}

export default Authorization;
