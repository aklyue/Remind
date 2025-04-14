import React, { useState } from "react";
import * as c from "./ChatInput.module.scss";
import { FaPaperclip } from "react-icons/fa";

export default function ChatInput({ sendMessage, setFile }) {
  const [value, setValue] = useState("");
  const [file, setLocalFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSend = () => {
    if (value.trim() || file) {
      sendMessage(value, file);
      setValue("");
      setLocalFile(null);
      setFile(null);
      setLoading(false);
      setProgress(0);
      setUploadSuccess(false);
    }
  };

  const onKeyHandler = (e) => {
    if (e.key === "Enter" && value.trim()) {
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type.startsWith("image/") ||
        selectedFile.type.startsWith("video/"))
    ) {
      setLocalFile(selectedFile);
      setFile(selectedFile);
      setLoading(true);
      setUploadSuccess(false);
      uploadFile(selectedFile);
    } else {
      alert("Можно отправлять только изображения и видео");
    }
  };

  const uploadFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4000/upload", true);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setProgress(percent);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log("Файл успешно загружен");
        setUploadSuccess(true);
      } else {
        console.error("Ошибка загрузки файла");
      }
      setLoading(false);
    };

    xhr.onerror = () => {
      console.error("Ошибка загрузки файла");
      setLoading(false);
    };

    xhr.send(formData);
  };

  return (
    <div className={c.chatInput}>
      <input
        onKeyDown={onKeyHandler}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Введите сообщение..."
      />
      <div className={c.fileInputContainer}>
        <label htmlFor="file-input">
          <FaPaperclip size={24} />
        </label>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {loading && (
          <div className={c.uploadProgress}>
            Загрузка: {Math.round(progress)}%
          </div>
        )}
        {uploadSuccess && (
          <div className={c.uploadSuccess}>Файл успешно загружен!</div>
        )}
      </div>
      <button onClick={handleSend}>Отправить</button>
    </div>
  );
}
