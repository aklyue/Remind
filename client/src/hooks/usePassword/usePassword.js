import { useCallback, useState } from 'react'

function usePassword() {
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('Password cannot be empty')

    const validatePassword = useCallback((password) => {
        if (!password) return 'Password cannot be empty';
        if (password.length <= 3) return 'Password must be more than 3 characters';
        return '';
    }, [])
    
    const passwordHandler = useCallback((e) => {
        const passwordInput = e.target.value
        setPassword(passwordInput)
        setPasswordError(validatePassword(passwordInput))
    }, [validatePassword])

    return { password, passwordError, passwordHandler }
}

export default usePassword;