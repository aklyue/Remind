import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const handleNavigation = () => {
      if (!location.pathname.includes("/chat")) {
        setRecipientId(null);
        setIsUserSelected(false);
      }
    };

    handleNavigation();

    return () => {};
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!currentUser) {
    return <div>Загрузка...</div>;
  }

  const handleUserClick = (user) => {
    setRecipientId(user.id);
    setIsUserSelected(true);
    navigate("/chat", { state: { recipient: user } });
  };

  const handleBackToUserList = () => {
    setIsUserSelected(false);
    navigate("/chat");
  };

  const isMobile = windowWidth < 1024;

  return (
    <div className={c.chat}>
      <div className={c.sidebar}>
        {isMobile && !isUserSelected && (
          <>
            {currentUser && (
              <div>
                <h3>Сохраненные</h3>
                <UserListItem
                  user={currentUser}
                  unreadMessages={unreadMessages}
                  onClick={() => handleUserClick(currentUser)}
                />
              </div>
            )}
            {sortedUsers.length > 0 && <h3>Друзья</h3>}
            {sortedUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}

            {others.length > 0 && <h3>Другие пользователи</h3>}
            {others.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}
          </>
        )}

        {isMobile && isUserSelected && (
          <button className={c.backButton} onClick={handleBackToUserList}>
            Назад к списку пользователей
          </button>
        )}
        {!isMobile && (
          <>
            {currentUser && (
              <div>
                <h3>Сохраненные</h3>
                <UserListItem
                  user={currentUser}
                  unreadMessages={unreadMessages}
                  onClick={() => handleUserClick(currentUser)}
                />
              </div>
            )}
            {sortedUsers.length > 0 && <h3>Друзья</h3>}
            {sortedUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}

            {others.length > 0 && <h3>Другие пользователи</h3>}
            {others.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}
          </>
        )}
      </div>

      <div className={c.chatWindow}>
        {isUserSelected && (
          <>
            <MessageList
              messages={messages}
              userId={userId}
              messagesContainerRef={messagesContainerRef}
              className={c.messagesContainer}
              isAtBottom={isAtBottom}
              scrollToBottom={scrollToBottom}
              setIsAtBottom={setIsAtBottom}
            />

            <ChatInput
              sendMessage={(msg) => sendMessage(msg, currentUser, selectedFile)}
              setFile={setSelectedFile}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
