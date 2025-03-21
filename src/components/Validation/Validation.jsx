// import React from 'react'
// import { useEffect } from 'react'
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import useEmail from '../../hooks/useEmail'
// import usePassword from '../../hooks/usePassword'
// import useBlurHandler from '../../hooks/useBlurHandler'


// function Validation() {

//     const { email, emailError, emailHandler } = useEmail('');
//     const { password, passwordError, passwordHandler } = usePassword('');
//     const { fieldsDirty, blurHandler } = useBlurHandler()


//     const [formValid, setFormValid] = useState(false)
//     const [confirm, setConfirm] = useState('')
//     const [confirmError, setConfirmError] = useState('')
//     const [checkboxActive, setCheckboxActive] = useState(false)
//     const [users, setUsers] = useState([])
//     const [errorMessage, setErrorMessage] = useState('')
//     const [confirmHandle, setConfirmHandle] = useState(false)
//     const navigate = useNavigate();




//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await fetch('http://localhost:3001/users');
//                 const data = await response.json();
//                 setUsers(data)
//             } catch (error) {
//                 console.error(error)
//             }
//         }

//         fetchData();
//     }, [])


//     useEffect(() => {
//         if (emailError || passwordError || !checkboxActive || confirmError !== '') {
//             setFormValid(false)
//         } else {
//             setFormValid(true)
//         }
//     }, [emailError, passwordError, confirmError, checkboxActive])

//     useEffect(() => {
//         if (passwordError || !password) {
//             setConfirmHandle(false)
//         } else {
//             setConfirmHandle(true)
//         }
//     }, [passwordError, password])

//     const confirmHandler = (e) => {
//         const confirmValue = e.target.value;
//         setConfirm(confirmValue);
//         if (confirmValue !== password) {
//             setConfirmError("Password's not suitable")
//         } else {
//             setConfirmError("")
//         }
//     }

//     const submitHandler = async (e) => {
//         e.preventDefault();
//         if (formValid) {
//             const user = users.find(user => user.email === email)
//             if (user) {
//                 setErrorMessage('This email is already registered')
//             } else {
//                 const newUser = {
//                     username: email,
//                     email: email,
//                     password: password,
//                     followers: [],
//                     avatar: 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
//                     description: '',
//                     posts: [],
//                     messages: [],
//                     followed: [],
//                     friends: []
//                 };
//                 try {
//                     const response = await fetch('http://localhost:3001/users', {
//                         method: "post",
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify(newUser),
//                     });
//                     if (response.ok) {
//                         const newUser = await response.json();
//                         localStorage.setItem('userId', newUser.id);
//                         navigate('/settings')
//                     } else {
//                         alert('((((')
//                     }
//                 } catch (error) {
//                     console.error('Error:', error)
//                 }
//             }
//         }
//     }

//     const checkboxHandler = (e) => {
//         setCheckboxActive(e.target.checked)
//     }

//     return (
//         <div>
//             <form onSubmit={submitHandler}>
//                 <h1>
//                     Registration
//                 </h1>
//                 {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
//                 {fieldsDirty.email && emailError && <div style={{ color: 'red' }}>{emailError}</div>}
//                 <input
//                     onChange={emailHandler}
//                     onBlur={blurHandler}
//                     value={email}
//                     type="text"
//                     placeholder="Email"
//                     name="email"
//                 />
//                 {fieldsDirty.password && passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
//                 <input
//                     onChange={passwordHandler}
//                     onBlur={blurHandler}
//                     value={password}
//                     type="password"
//                     placeholder="Password"
//                     name="password"
//                 />
//                 {fieldsDirty.confirm && confirmError && <div style={{ color: 'red' }}>{confirmError}</div>}
//                 <input
//                     disabled={!confirmHandle}
//                     onChange={confirmHandler}
//                     onBlur={blurHandler}
//                     value={confirm}
//                     type="password"
//                     placeholder="Confirm Password"
//                     name="confirm"
//                 />
//                 <div>
//                     <input
//                         type="checkbox"
//                         checked={checkboxActive}
//                         onChange={checkboxHandler}
//                         name="agreement"
//                     />
//                     <span>I accept the terms and privacy policy</span>
//                 </div>
//                 <button disabled={!formValid} type='submit'>Register</button>
//             </form>
//         </div>
//     )
// }

// export default Validation;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmail from '../../hooks/useEmail';
import usePassword from '../../hooks/usePassword';
import useBlurHandler from '../../hooks/useBlurHandler';
import styles from './Validation.module.scss';

function Validation() {
    const { email, emailError, emailHandler } = useEmail('');
    const { password, passwordError, passwordHandler } = usePassword('');
    const { fieldsDirty, blurHandler } = useBlurHandler();

    const [formValid, setFormValid] = useState(false);
    const [confirm, setConfirm] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [checkboxActive, setCheckboxActive] = useState(false);
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmHandle, setConfirmHandle] = useState(false);
    const navigate = useNavigate();

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

    useEffect(() => {
        setFormValid(!(emailError || passwordError || !checkboxActive || confirmError));
    }, [emailError, passwordError, confirmError, checkboxActive]);

    useEffect(() => {
        setConfirmHandle(!(passwordError || !password));
    }, [passwordError, password]);

    const confirmHandler = (e) => {
        setConfirm(e.target.value);
        setConfirmError(e.target.value !== password ? "Passwords do not match" : "");
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (formValid) {
            const userExists = users.some((user) => user.email === email);
            if (userExists) {
                setErrorMessage('This email is already registered');
            } else {
                const newUser = {
                    username: email,
                    email: email,
                    password: password,
                    followers: [],
                    avatar: 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
                    description: '',
                    posts: [],
                    messages: [],
                    followed: [],
                    friends: []
                };
                try {
                    const response = await fetch('http://localhost:3001/users', {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser),
                    });
                    if (response.ok) {
                        const newUser = await response.json();
                        localStorage.setItem('userId', newUser.id);
                        navigate('/settings');
                    } else {
                        alert('Something went wrong');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
    };

    return (
        <div className={styles.validationWrapper}>
            <form className={styles.validationForm} onSubmit={submitHandler}>
                <h1 className={styles.title}>Registration</h1>

                {errorMessage && <div className={styles.error}>{errorMessage}</div>}

                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <input className={styles.input} onChange={emailHandler} onBlur={blurHandler} value={email} type="text" placeholder="Your email" name="email" />
                    {fieldsDirty.email && emailError && <div className={styles.error}>{emailError}</div>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <input className={styles.input} onChange={passwordHandler} onBlur={blurHandler} value={password} type="password" placeholder="Password" name="password" />
                    {fieldsDirty.password && passwordError && <div className={styles.error}>{passwordError}</div>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="confirm">Confirm Password</label>
                    <input required className={styles.input} disabled={!confirmHandle} onChange={confirmHandler} onBlur={blurHandler} value={confirm} type="password" placeholder="Confirm Password" name="confirm" />
                    {fieldsDirty.confirm && confirmError && <div className={styles.error}>{confirmError}</div>}
                </div>

                <div className={styles.checkboxGroup}>
                    <input type="checkbox" checked={checkboxActive} onChange={(e) => setCheckboxActive(e.target.checked)} name="agreement" />
                    <span>I accept the terms and privacy policy</span>
                </div>

                <button className={styles.saveButton} disabled={!formValid} type='submit'>Register</button>
            </form>
        </div>
    );
}

export default Validation;