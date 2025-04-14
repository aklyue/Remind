import React, { useState, useEffect } from "react";
import * as c from "./MessageList.module.scss";

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
  setIsAtBottom,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const groupedMessages = groupMessagesByDay(messages);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [isAtBottom, messages]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    let animationFrameId;

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } =
          messagesContainerRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 20);
      });
    };

    const container = messagesContainerRef.current;
    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [messagesContainerRef]);

  const openModal = (mediaUrl, type) => {
    setCurrentMedia(mediaUrl);
    setMediaType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMedia(null);
    setMediaType(null);
  };

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
              <div>
                <span className={c.username}>{msg.username || "Аноним"}</span>
              </div>
              <div>{msg.message}</div>

              {msg.fileUrl && (
                <div className={c.media}>
                  {msg.fileUrl.endsWith(".mp4") ||
                  msg.fileUrl.endsWith(".webm") ||
                  msg.fileUrl.endsWith(".MOV")  ? (
                    <video
                      controls
                      className={c.video}
                      onClick={() => openModal(msg.fileUrl, "video")}
                    >
                      <source src={msg.fileUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={msg.fileUrl}
                      alt="Отправленный файл"
                      onClick={() => openModal(msg.fileUrl, "image")}
                    />
                  )}
                </div>
              )}

              <span className={c.timestamp}>{formatTime(msg.timestamp)}</span>
            </div>
          ))}
        </div>
      ))}
      {!isAtBottom && (
        <button onClick={scrollToBottom} className={c.scrollButton}>
          ⬇
        </button>
      )}

      {isModalOpen && (
        <div className={c.modal} onClick={closeModal}>
          <div className={c.modalContent} onClick={(e) => e.stopPropagation()}>
            {mediaType === "image" ? (
              <img src={currentMedia} alt="Медиа" className={c.modalImage} />
            ) : (
              <video controls className={c.modalVideo}>
                <source src={currentMedia} type="video/mp4" />
              </video>
            )}
            <button className={c.closeButton} onClick={closeModal}>
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
