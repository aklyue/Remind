import React, { useEffect, useState } from "react";
import { getUsers } from "../../api/users";
import useGetUsers from "../../hooks/query/useGetUsers";
import c from "./CreatePost.module.scss";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const userId = localStorage.getItem("userId");

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [postId, setPostId] = useState(0);
  const navigate = useNavigate();

  const { data: user, isFetching } = useGetUsers(userId);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers();
      const chosenUser = data.find((user) => user.id == parseInt(userId));

        const newPostId = crypto.randomUUID();
        setPostId(newPostId);
    };

    fetchData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();

    try {
      const post = {
        user: user.username,
        image,
        title,
        text,
        id: postId,
        comments: [],
        createdAt: new Date().toISOString(),
        likes: []
      };

      const updatedPosts = [...user.posts, post];

      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...user,
          posts: updatedPosts,
        }),
      });

      if (response.ok) {
        setPostId(crypto.randomUUID());
        setImage("");
        setTitle("");
        setText("");
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={c.container}>
      <div className={c.formWrapper}>
        <h2 className={c.title}>Create a New Post</h2>
        <form className={c.form} onSubmit={createPost}>
          <div className={c.inputGroup}>
            <label className={c.label} htmlFor="image">
              Upload Image
            </label>
            <input
              className={c.input}
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {image && (
              <img className={c.imagePreview} src={image} alt="Preview" />
            )}
          </div>

          <div className={c.inputGroup}>
            <label className={c.label} htmlFor="title">
              Title
            </label>
            <input
              className={c.input}
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={c.inputGroup}>
            <label className={c.label} htmlFor="text">
              Text
            </label>
            <textarea
              className={c.textarea}
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>

          <button className={c.button}>Create</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
