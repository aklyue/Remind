import { useCallback, useState } from 'react'

function useEmail() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = useCallback((email) => {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!regex.test(email.toLowerCase())) {
            return 'Email is incorrect';
        };
        return '';
    }, [])

    const emailHandler = useCallback((e) => {
        const emailInput = e.target.value
        setEmail(emailInput)
        setEmailError(validateEmail(emailInput))
    }, [validateEmail])

    return { email, emailError, emailHandler, setEmail }
}

export default useEmail