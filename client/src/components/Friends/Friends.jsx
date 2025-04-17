import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../../api/users";
import * as c from "./Friends.module.scss";
import { useUsers } from "../../hooks/useUsers/useUsers";

function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const { sortedUsers } = useUsers(userId);
  useEffect(() => {
    if (!token) {
      navigate("/authorization");
    }
  }, [token, navigate]);

  useEffect(() => {
    setFriends(sortedUsers)
  }, [sortedUsers])

  const goToChat = (friend) => {
    navigate("/chat", { state: { recipient: friend } });
  };

  return (
    <div className={c.friendsWrapper}>
      <div className={c.cont}>
        <h2>Friends</h2>
        {friends.length > 0 ? (
          <ul className={c.friendsList}>
            {friends.map((friend) => (
              <li key={friend.id} className={c.friendItem}>
                <Link to={`/profile/${friend.id}`} className={c.friendLink}>
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className={c.avatar}
                  />
                  <span>{friend.username}</span>
                </Link>
                <svg
                  className={c.chatBtn}
                  onClick={() => goToChat(friend)}
                  id="Icon"
                  enable-background="new 0 0 96 96"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="Chat_1_"
                    d="m82 33h-14v12c0 7.72-6.28 14-14 14h-16v4c0 5.514 4.486 10 10 10h15.172l11.414 11.414c.383.383.893.586 1.414.586.258 0 .518-.05.766-.152.747-.31 1.234-1.039 1.234-1.848v-10h4c5.514 0 10-4.486 10-10v-20c0-5.514-4.486-10-10-10zm-4 30h-12c-1.104 0-2-.896-2-2s.896-2 2-2h12c1.104 0 2 .896 2 2s-.896 2-2 2zm0-8h-6c-1.104 0-2-.896-2-2s.896-2 2-2h6c1.104 0 2 .896 2 2s-.896 2-2 2zm0-8h-4c-1.104 0-2-.896-2-2s.896-2 2-2h4c1.104 0 2 .896 2 2s-.896 2-2 2zm-24-36h-40c-5.514 0-10 4.486-10 10v24c0 5.514 4.486 10 10 10h4v12c0 .809.487 1.538 1.234 1.848.248.102.508.152.766.152.521 0 1.031-.203 1.414-.586l13.414-13.414h19.172c5.514 0 10-4.486 10-10v-24c0-5.514-4.486-10-10-10zm-4 32h-32c-1.104 0-2-.896-2-2s.896-2 2-2h32c1.104 0 2 .896 2 2s-.896 2-2 2zm0-8h-32c-1.104 0-2-.896-2-2s.896-2 2-2h32c1.104 0 2 .896 2 2s-.896 2-2 2zm0-8h-32c-1.104 0-2-.896-2-2s.896-2 2-2h32c1.104 0 2 .896 2 2s-.896 2-2 2z"
                  />
                </svg>
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
