const endPoint = "http://localhost:4000";

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${endPoint}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${endPoint}/users/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
