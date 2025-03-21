import React, { useState } from 'react';
import Authorization from '../../components/Authorization';
import Validation from '../../components/Validation';
import styles from './AuthorizationPage.module.scss';

function AuthorizationPage() {
    const [activeForm, setActiveForm] = useState('signUp');

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.buttonGroup}>
                <button 
                    className={`${styles.switchButton} ${activeForm === 'signUp' ? styles.active : ''}`} 
                    onClick={() => setActiveForm('signUp')} 
                    disabled={activeForm === 'signUp'}
                >
                    Sign In
                </button>
                <button 
                    className={`${styles.switchButton} ${activeForm === 'register' ? styles.active : ''}`} 
                    onClick={() => setActiveForm('register')} 
                    disabled={activeForm === 'register'}
                >
                    Sign Up
                </button>
            </div>
            <div className={styles.formContainer}>
                {activeForm === 'signUp' && <Authorization />}
                {activeForm === 'register' && <Validation />}
            </div>
        </div>
    );
}

export default AuthorizationPage;