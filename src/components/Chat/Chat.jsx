import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import c from "./Chat.module.scss";
import { useUsers } from "../../hooks/useUsers/useUsers";
import useMessages from "../../hooks/useMessages/useMessages";
import UserListItem from "./UserListItem";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const [recipientId, setRecipientId] = useState(
    location?.state?.recipient?.id || userId
  );

  const unreadMessages = useSelector((state) => state.unreadMessages);
  const { sortedUsers, others, currentUser } = useUsers(userId);
  const {
    messages,
    sendMessage,
    messagesContainerRef,
    scrollToBottom,
    isAtBottom,
    setIsAtBottom,
  } = useMessages(userId, recipientId);
  useEffect(() => {
    const handleNavigation = () => {
      if (!location.pathname.includes("/chat")) {
        setRecipientId(null);
      }
    };

    handleNavigation();

    return () => {};
  }, [location.pathname]);

  if (!currentUser) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={c.chat}>
      <div className={c.sidebar}>
        {currentUser && (
          <div>
            <h3>Сохраненные</h3>
            <UserListItem
              user={currentUser}
              unreadMessages={unreadMessages}
              onClick={() => {
                setRecipientId(currentUser.id);
                navigate("/chat", {
                  state: { recipient: currentUser },
                });
              }}
            />
          </div>
        )}
        {sortedUsers.length > 0 && <h3>Друзья</h3>}
        {sortedUsers.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            unreadMessages={unreadMessages}
            onClick={() => {
              setRecipientId(user.id);
              navigate("/chat", { state: { recipient: user } });
            }}
          />
        ))}

        {others.length > 0 && <h3>Другие пользователи</h3>}
        {others.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            unreadMessages={unreadMessages}
            onClick={() => {
              setRecipientId(user.id);
              navigate("/chat", { state: { recipient: user } });
            }}
          />
        ))}
      </div>
      <div className={c.chatWindow}>
        <MessageList
          messages={messages}
          userId={userId}
          messagesContainerRef={messagesContainerRef}
          className={c.messagesContainer}
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
          setIsAtBottom={setIsAtBottom}
        />

        <ChatInput sendMessage={(msg) => sendMessage(msg, currentUser)} />
      </div>
    </div>
  );
}

export default Chat;
