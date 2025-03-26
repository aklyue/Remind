import React, { useState } from "react";
import c from "./ChatInput.module.scss";

export default function ChatInput({ sendMessage }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim()) {
      sendMessage(value);
      setValue("");
    }
  };

  const onKeyHandler = (e) => {
    if (e.key === "Enter" && value.trim()) {
      handleSend();
    }
  };

  return (
    <div className={c.chatInput}>
      <input
        onKeyDown={onKeyHandler}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Введите сообщение..."
      />
      <button onClick={handleSend}>Отправить</button>
    </div>
  );
}
