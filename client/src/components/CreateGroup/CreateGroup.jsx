import React, { useEffect, useState } from "react";
import c from "./CreateGroup.module.scss";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../../api/users";
import { useDropzone } from "react-dropzone";
import { useUsers } from "../../hooks/useUsers/useUsers";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { sortedUsers } = useUsers(userId);

  useEffect(() => {
    async function fetchUser() {
      if (!userId) return navigate("/authorization");

      try {
        const userData = await getUserById(userId);
        if (!userData) return navigate("/authorization");
        setUser(userData);
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    }

    fetchUser();
  }, [userId, navigate]);

  const groupNameHandler = (e) => {
    setGroupName(e.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      let avatarUrl = groupAvatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("fileType", "avatars");
        formData.append("avatar", avatarFile);

        const uploadResponse = await fetch("http://localhost:4000/upload", {
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
        groups: [
          ...(user.groups || []),
          {
            id: crypto.randomUUID(),
            groupName,
            groupAvatar: avatarUrl,
            members: [
              {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
              },
              ...selectedUsers.map((u) => ({
                id: u.id,
                username: u.username,
                avatar: u.avatar,
              })),
            ],
            messages: [],
          },
        ],
      };

      const userResponse = await fetch(
        `http://localhost:3001/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      if (userResponse.ok) {
        setUser(await userResponse.json());
      } else {
        console.error("Ошибка обновления данных пользователя");
      }

      for (const selectedUser of selectedUsers) {
        const updatedSelectedUser = {
          ...selectedUser,
          groups: [
            ...(selectedUser.groups || []),
            {
              id: crypto.randomUUID(),
              groupName,
              groupAvatar: avatarUrl,
              members: [
                {
                  id: user.id,
                  username: user.username,
                  avatar: user.avatar,
                },
                ...selectedUsers.map((u) => ({
                  id: u.id,
                  username: u.username,
                  avatar: u.avatar,
                })),
              ],
              messages: [],
            },
          ],
        };

        const selectedUserResponse = await fetch(
          `http://localhost:3001/users/${selectedUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSelectedUser),
          }
        );

        if (selectedUserResponse.ok) {
          await selectedUserResponse.json();
        } else {
          console.error(
            `Ошибка обновления данных пользователя ${selectedUser.id}`
          );
        }
      }

      navigate("/chat");
    } catch (error) {
      console.error(error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setAvatarFile(file);
        setGroupAvatar(URL.createObjectURL(file));
      }
    },
  });

  const handleUserSelect = (user) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (id) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== id));
  };

  const filteredUsers = sortedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={c.container}>
      <h2>Создать группу</h2>
      <form onSubmit={submitHandler}>
        <div>
          <label>Название группы</label>
          <input
            type="text"
            value={groupName}
            onChange={groupNameHandler}
            required
          />
        </div>

        <div {...getRootProps()} className={c.dropzone}>
          <input {...getInputProps()} />
          <p className={c.dropzoneText}>
            Перетащите изображение или кликните, чтобы выбрать файл
          </p>
        </div>

        {groupAvatar && (
          <img
            src={groupAvatar}
            alt="Аватар группы"
            className={c.avatarPreview}
          />
        )}

        <div className={c.userSearch}>
          <input
            type="text"
            placeholder="Добавить участников..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ul className={c.dropdown}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <li key={user.id} onClick={() => handleUserSelect(user)}>
                    {user.username}
                  </li>
                ))
              ) : (
                <li>Пользователей не найдено</li>
              )}
            </ul>
          )}
        </div>

        <div className={c.selectedUsers}>
          {selectedUsers.map((user) => (
            <span key={user.id} className={c.userBadge}>
              {user.username}{" "}
              <button onClick={() => handleRemoveUser(user.id)}>×</button>
            </span>
          ))}
        </div>

        <button type="submit">Создать группу</button>
      </form>
    </div>
  );
}

export default CreateGroup;
