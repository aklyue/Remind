import { useEffect, useState } from "react";
import { getUserById, getUsers } from "../../api/users";
import { useNavigate } from "react-router-dom";

export function useUsers(userId) {
  const [users, setUsers] = useState([]);
  const [sortedUsers, setSortedUsers] = useState([]);
  const [others, setOthers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!userId) return navigate("/authorization");

      try {
        const allUsers = await getUsers();
        const curUser = await getUserById(userId);
        if (!curUser) return navigate("/authorization");

        setCurrentUser(curUser);
        setUsers(allUsers.filter((user) => user.id !== userId));

        const mutualFriends = allUsers.filter(
          (user) =>
            curUser.followed?.some((f) => (f.id || f) === user.id) &&
            user.followers?.some((f) => (f.id || f) === userId)
        );

        setSortedUsers(mutualFriends);
        setOthers(
          allUsers.filter(
            (user) => !mutualFriends.includes(user) && user.id !== userId
          )
        );
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
      }
    }

    fetchData();
  }, [navigate, userId]);

  return { users, sortedUsers, others, currentUser };
}
