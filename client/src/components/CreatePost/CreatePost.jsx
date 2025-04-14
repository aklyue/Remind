import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import useGetUsers from "../../hooks/query/useGetUsers";
import * as c from "./CreatePost.module.scss";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const userId = localStorage.getItem("userId");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [postId, setPostId] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const { data: user, isFetching } = useGetUsers(userId);

  useEffect(() => {
    setPostId(crypto.randomUUID());
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setImageFiles((prev) => [...prev, ...acceptedFiles]);
    const previewImages = acceptedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setImages((prev) => [...prev, ...previewImages]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*,video/*",
    multiple: true,
  });

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createPost = async (e) => {
    e.preventDefault();

    try {
      let imageUrls = [];

      if (imageFiles.length > 0) {
        const formData = new FormData();
        formData.append("fileType", "posts");

        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        const imageResponse = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error("Failed to upload images");
        }

        imageUrls = await imageResponse.json();
      }

      const post = {
        user: user.username,
        images: imageUrls,
        title,
        text,
        id: postId,
        comments: [],
        createdAt: new Date().toISOString(),
        likes: [],
      };

      const updatedPosts = [...user.posts, post];

      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...user, posts: updatedPosts }),
      });

      if (response.ok) {
        setPostId(crypto.randomUUID());
        setImages([]);
        setImageFiles([]);
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
              {images.map((img, index) => {
                const file = imageFiles[index];

                return (
                  <div key={index} className={c.imageWrapper}>
                    {file.type.startsWith("image/") ? (
                      <img
                        className={c.imagePreview}
                        src={img}
                        alt={`Preview ${index}`}
                      />
                    ) : file.type.startsWith("video/") ? (
                      <video
                        className={c.imagePreview}
                        src={img}
                        alt={`Preview ${index}`}
                        controls
                      />
                    ) : null}
                    <button
                      type="button"
                      className={c.removeButton}
                      onClick={() => removeImage(index)}
                    >
                      ✖
                    </button>
                  </div>
                );
              })}
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
