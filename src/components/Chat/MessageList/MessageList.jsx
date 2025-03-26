import React, { useEffect } from "react";
import c from "./MessageList.module.scss";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const groupMessagesByDay = (messages) => {
  return messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
};

export default function MessageList({
  messages,
  userId,
  scrollToBottom,
  isAtBottom,
  messagesContainerRef,
}) {
  const groupedMessages = groupMessagesByDay(messages);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [isAtBottom, scrollToBottom]);

  return (
    <div className={c.messages} ref={messagesContainerRef}>
      {Object.keys(groupedMessages).map((date) => (
        <div key={date} className={c.container}>
          <div className={c.dateSeparator}>{date}</div>
          {groupedMessages[date].map((msg) => (
            <div
              key={msg.id}
              className={msg.senderId === userId ? c.myMessage : c.otherMessage}
            >
              <div className={c.messageHeader}>
                <span className={c.username}>{msg.username || "Аноним"}</span>
              </div>
              <div className={c.text}>{msg.message}</div>
              <span className={c.timestamp}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}
        </div>
      ))}
      {!isAtBottom && (
        <button onClick={scrollToBottom} className={c.scrollButton}>
          ⬇
        </button>
      )}
    </div>
  );
}
