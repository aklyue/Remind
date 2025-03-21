import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../../api/users";
import c from "./Friends.module.scss";

function Friends() {
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const users = await getUsers();
        const currentUser = users.find((user) => user.id === userId);

        if (!currentUser || !Array.isArray(currentUser.followed)) return;

        const mutualFriends = users.filter((user) => {
          if (user.id === userId) return false;

          const isFollowing = currentUser.followed.some(f => f.id === user.id);
          const isFollowedBy = user.followed.some(f => f.id === userId);

          return isFollowing && isFollowedBy;
        });

        console.log("Current User:", currentUser);
        console.log("Users:", users);
        console.log("Mutual Friends:", mutualFriends);

        setFriends(mutualFriends);
      } catch (error) {
        console.error("Ошибка загрузки друзей:", error);
      }
    };

    fetchFriends();
  }, [userId]);

  return (
    <div className={c.friendsWrapper}>
      <div className={c.cont}>
        <h2>Friends</h2>
        {friends.length > 0 ? (
          <ul className={c.friendsList}>
            {friends.map((friend) => (
              <li key={friend.id} className={c.friendItem}>
                <Link to={`/users/${friend.id}`} className={c.friendLink}>
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className={c.avatar}
                  />
                  <span>{friend.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no mutual friends yet.</p>
        )}
      </div>
    </div>
  );
}

export default Friends;

