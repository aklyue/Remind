const endPoint = "http://localhost:3001";

export const getUsers = async () => {
    try {
        const response = await fetch(`${endPoint}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await fetch(`${endPoint}/users/${id}`, {
            method: "GET",
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};