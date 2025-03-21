import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import c from "./Chat.module.scss";

function Chat() {
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const socket = useRef();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/authorization");
      return;
    }

    async function fetchData() {
      try {
        const usersRes = await fetch(`http://localhost:3001/users`);
        const allUsers = await usersRes.json();
        const currentUser = allUsers.find((user) => user.id === userId);
        if (!currentUser) {
          navigate("/authorization");
          return;
        }

        setUsername(currentUser.username);
        setUsers(allUsers.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
      }
    }

    fetchData();
    connect();
  }, [navigate]);

  async function fetchMessages() {
    if (!recipientId) return;
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`);
      const user = await res.json();

      const chatMessages =
        user.messages?.filter(
          (m) =>
            (m.senderId === recipientId && m.recipientId === userId) ||
            (m.senderId === userId && m.recipientId === recipientId)
        ) || [];

      setMessages(
        chatMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );

      setTimeout(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
          messagesContainerRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 120);
      }, 0);
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, [recipientId, messages]);

  function connect() {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      setConnected(true);
      const message = { event: "connection", username, id: userId };
      socket.current.send(JSON.stringify(message));
      console.log("WebSocket подключен");
    };

    socket.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log("Новое сообщение:", message);
      if (
        message.senderId === recipientId ||
        message.recipientId === recipientId
      ) {
        setMessages((prev) =>
          [...prev, message].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          )
        );
      }
    };

    socket.current.onclose = () => console.log("WebSocket отключен");
    socket.current.onerror = (error) =>
      console.error("WebSocket ошибка:", error);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!recipientId || !value.trim()) return;

    const message = {
      id: crypto.randomUUID(),
      username,
      message: value,
      senderId: userId,
      recipientId,
      event: "message",
      timestamp: new Date().toISOString(),
    };

    socket.current.send(JSON.stringify(message));
    setValue("");

    await saveMessageToDB(message);
    fetchMessages();
    setTimeout(scrollToBottom, 50);
  };

  async function saveMessageToDB(message) {
    try {
      const senderRes = await fetch(`http://localhost:3001/users/${userId}`);
      const sender = await senderRes.json();
      const recipientRes = await fetch(
        `http://localhost:3001/users/${recipientId}`
      );
      const recipient = await recipientRes.json();

      sender.messages = [...(sender.messages || []), message];
      recipient.messages = [...(recipient.messages || []), message];

      await Promise.all([
        fetch(`http://localhost:3001/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sender),
        }),
        fetch(`http://localhost:3001/users/${recipientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipient),
        }),
      ]);
    } catch (error) {
      console.error("Ошибка сохранения сообщения:", error);
    }
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 120);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.removeEventListener(
            "scroll",
            handleScroll
          );
        }
      };
    }
  }, []);

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "instant",
    });
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, [50]);
    clearTimeout();
  }, [recipientId]);

  if (!connected) {
    return (
      <div className={c.chatContainer}>
        <button onClick={connect} className={c.connectBtn}>
          Join
        </button>
      </div>
    );
  }

  return (
    <div className={c.chatWrapper}>
      <div className={c.sidebar}>
        <h3 className={c.userList}>Пользователи</h3>
        {users.map((user) => (
          <div
            key={user.id}
            className={`${c.user} ${
              recipientId === user.id ? c.activeUser : ""
            }`}
            onClick={() => setRecipientId(user.id)}
          >
            {user.username}
          </div>
        ))}
      </div>

      <div className={c.chatContainer}>
        <div className={c.messages} ref={messagesContainerRef}>
          {messages.map((mess, index) => {
            const messageDate = new Date(mess.timestamp).toLocaleDateString();
            const prevMessage = messages[index - 1];
            const prevDate = prevMessage
              ? new Date(prevMessage.timestamp).toLocaleDateString()
              : null;

            return (
              <React.Fragment key={mess.id}>
                {messageDate !== prevDate && (
                  <div className={c.dateSeparator}>
                    <span>{messageDate}</span>
                  </div>
                )}

                <div
                  className={
                    mess.senderId === userId ? c.myMessage : c.theirMessage
                  }
                >
                  <p className={c.username}>{mess.username}</p>
                  <div className={c.msg}>
                    <span>{mess.message}</span>
                    <div className={c.timestamp}>
                      {new Date(mess.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {!isAtBottom && messages.length > 0 && (
          <button className={c.scrollToBottomBtn} onClick={scrollToBottom}>
            ⬇
          </button>
        )}

        <div className={c.inputContainer}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={c.messageInput}
            placeholder="Введите сообщение..."
          />
          <button onClick={sendMessage} className={c.sendBtn}>
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
