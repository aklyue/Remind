import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useBlurHandler from "../../hooks/useBlurHandler";
import useEmail from "../../hooks/useEmail";
import c from "./Settings.module.scss";

function Settings() {
  const { email, emailError, emailHandler, setEmail } = useEmail("");
  const { fieldsDirty, blurHandler } = useBlurHandler();

  const [user, setUser] = useState();
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (emailError) {
      setFormValid(false);
    } else {
      setFormValid(true);
    }
  }, [emailError]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId || !token) {
        navigate("/authorization");
        return;
      }
      try {
        const response = await fetch(`http://localhost:4000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          navigate("/authorization");
          return;
        }

        const userData = await response.json();
        setUser(userData);
        setEmail(userData.email);
        setUsername(userData.username);
        setAvatar(userData.avatar);
        setDescription(userData.description);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [navigate, token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (formValid) {
      const userId = localStorage.getItem("userId");

      try {
        let avatarUrl = avatar;

        if (avatarFile) {
          const formData = new FormData();
          formData.append("fileType", "avatars");
          formData.append("avatar", avatarFile);

          fetch("http://localhost:4000/upload", {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const uploadResponse = await fetch(`http://localhost:4000/upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            avatarUrl = result.urls[0];
          } else {
            console.error("Ошибка загрузки аватара");
          }
        }

        const updatedUser = {
          ...user,
          email,
          avatar: avatarUrl,
          username,
          description,
        };

        console.log(username);

        const response = await fetch(`http://localhost:4000/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
          localStorage.setItem("userId", updatedUser.id);
          window.location.reload();
        } else {
          console.error("Ошибка обновления данных пользователя");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const usernameHandler = (e) => {
    setUsername(e.target.value);
  };

  const descriptionHandler = (e) => {
    setDescription(e.target.value);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setAvatarFile(file);
        setAvatar(URL.createObjectURL(file));
      }
    },
  });

  return (
    <div className={c.settingsWrapper}>
      <form onSubmit={submitHandler} className={c.settingsForm}>
        <div className={c.inputGroup}>
          <p className={c.label}>Email address</p>
          {fieldsDirty.email && emailError && (
            <div className={c.error}>{emailError}</div>
          )}
          <input
            onChange={emailHandler}
            value={email}
            onBlur={blurHandler}
            type="text"
            placeholder="Your email"
            name="email"
            className={c.input}
          />
        </div>

        <div className={c.inputGroup}>
          <p className={c.label}>Avatar</p>
          {avatar && (
            <img
              src={avatar}
              alt="Avatar Preview"
              className={c.avatarPreview}
            />
          )}
          <div {...getRootProps()} className={c.dropzone}>
            <input {...getInputProps()} />
            <p className={c.dropzoneText}>
              Drag & drop some files here, or click to select files
            </p>
          </div>
        </div>

        <div className={c.inputGroup}>
          <p className={c.label}>Name</p>
          <input
            onChange={usernameHandler}
            type="text"
            value={username}
            name="name"
            className={c.input}
          />
        </div>

        <div className={c.inputGroup}>
          <p className={c.label}>Description</p>
          <textarea
            onChange={descriptionHandler}
            name="description"
            cols="30"
            rows="10"
            value={description}
            placeholder="Description"
            className={c.textarea}
          ></textarea>
        </div>

        <div>
          <button type="submit" className={c.saveButton}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
