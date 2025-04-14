import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePostActions from "../../../hooks/usePostActions/usePostActions";
import Comments from "../Comments";
import * as c from "./PostItem.module.scss";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isVideo = (url) => {
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "MP4",
    "WEBM",
    "OGG",
    "MOV",
  ];
  const fileExtension = url.split(".").pop();
  return videoExtensions.includes(fileExtension);
};

const PostItem = ({ post, users, fetchPosts }) => {
  const navigate = useNavigate();
  const {
    handleLike,
    toggleComments,
    commentText,
    setCommentText,
    commentPostId,
    setCommentPostId,
    expandedPosts,
    handleCommentSubmit,
  } = usePostActions(users, fetchPosts);
  const userId = localStorage.getItem("userId");
  const [selectedImage, setSelectedImage] = useState(null);

  const navigateToPost = (postId, event) => {
    if (event.target.closest("[data-no-navigate]")) return;
    navigate(`/posts/${postId}`);
  };

  const openImage = (image) => setSelectedImage(image);
  const closeImage = () => setSelectedImage(null);

  return (
    <div
      key={post.id}
      className={c.postItem}
      onClick={(event) => navigateToPost(post.id, event)}
    >
      <div className={c.postAuthor}>
        <Link
          data-no-navigate
          to={`/users/${post.userId}`}
          className={c.authorLink}
        >
          {post.avatar && (
            <img
              src={post.avatar}
              alt={post.username}
              className={c.authorAvatar}
            />
          )}
          <span className={c.authorName}>{post.username}</span>
        </Link>
        <p className={c.postTime} data-no-navigate>
          {formatTime(post.createdAt)}
        </p>
      </div>

      <div
        className={`${c.postImagesContainer} ${
          post.images?.urls?.length === 1
            ? c.single
            : post.images?.urls?.length === 2
            ? c.double
            : c.multiple
        }`}
        data-no-navigate
      >
        {post.images?.urls?.map((url, index) => (
          <div
            key={index}
            style={{
              "--span-count": post.images.urls.length,
            }}
          >
            {isVideo(url) ? (
              <video
                className={c.postMedia}
                src={url}
                alt={`Post video ${index}`}
                controls
                onClick={() => openImage(url)}
              />
            ) : (
              <img
                className={c.postMedia}
                src={url}
                alt={`Post ${index}`}
                onClick={() => openImage(url)}
              />
            )}
          </div>
        ))}
      </div>

      <Link to={`/posts/${post.id}`} className={c.postLink}>
        <p className={c.postTitle}>{post.title}</p>
      </Link>

      <div className={c.likeSection} data-no-navigate>
        <button onClick={() => handleLike(post.id)}>
          {post.likes.includes(userId) ? "❤️" : "🤍"} {post.likes.length}
        </button>
      </div>

      <hr color="#f5f5f5" />
      <Comments
        post={post}
        toggleComments={toggleComments}
        expandedPosts={expandedPosts}
        commentText={commentText}
        setCommentText={setCommentText}
        commentPostId={commentPostId}
        setCommentPostId={setCommentPostId}
        handleCommentSubmit={handleCommentSubmit}
      />

      {selectedImage && (
        <div className={c.overlay} onClick={closeImage} data-no-navigate>
          {isVideo(selectedImage) ? (
            <video src={selectedImage} controls />
          ) : (
            <img className={c.fullImage} src={selectedImage} alt="Full-size" />
          )}
        </div>
      )}
    </div>
  );
};

export default PostItem;
