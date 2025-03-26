import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import useGetUsers from "../../hooks/query/useGetUsers";
import c from "./CreatePost.module.scss";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const userId = localStorage.getItem("userId");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [postId, setPostId] = useState("");
  const navigate = useNavigate();
  const { data: user, isFetching } = useGetUsers(userId);

  useEffect(() => {
    setPostId(crypto.randomUUID());
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = [];
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === acceptedFiles.length) {
          setImages((prev) => [...prev, ...newImages]);
          setImageFiles((prev) => [...prev, ...acceptedFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
  });

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      const post = {
        user: user.username,
        images,
        title,
        text,
        id: postId,
        comments: [],
        createdAt: new Date().toISOString(),
        likes: [],
      };

      const updatedPosts = [...user.posts, post];

      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, posts: updatedPosts }),
      });

      if (response.ok) {
        setPostId(crypto.randomUUID());
        setImages([]);
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
          <div className={c.dropzone} {...getRootProps()}>
            <input {...getInputProps()} />
            <p className={c.dropzoneText}>
              Drag & drop some files here, or click to select files
            </p>
          </div>

          {images.length > 0 && (
            <div className={c.imagesPreview}>
              {images.map((img, index) => (
                <div key={index} className={c.imageWrapper}>
                  <img
                    className={c.imagePreview}
                    src={img}
                    alt={`Preview ${index}`}
                  />
                  <button
                    type="button"
                    className={c.removeButton}
                    onClick={() => removeImage(index)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}

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
