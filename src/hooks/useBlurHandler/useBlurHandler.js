import { useCallback, useState } from 'react'

function useBlurHandler() {

    const [fieldsDirty, setFieldsDirty] = useState({})


    const blurHandler = useCallback((e) => {
        const { name } = e.target
        setFieldsDirty((prevDirty) => ({
            ...prevDirty,
            [name]: true
        }))
    }, [])

    return { fieldsDirty, blurHandler }
}

export default useBlurHandler