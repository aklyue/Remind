import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePostActions from "../../../hooks/usePostActions/usePostActions";
import Comments from "../Comments";
import c from "./PostItem.module.scss";

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
          <span>{post.username}</span>
        </Link>
        <p className={c.postTime} data-no-navigate>
          {formatTime(post.createdAt)}
        </p>
      </div>

      <div
        className={`${c.postImagesContainer} ${
          post.images?.length === 1
            ? c.single
            : post.images?.length === 2
            ? c.double
            : c.multiple
        }`}
        data-no-navigate
      >
        {post.images?.map((image, index) => (
          <img
            key={index}
            src={image}
            style={{
              "--span-count": post.images.length,
            }}
            alt={`Post ${index}`}
            data-no-navigate
            className={c.postImage}
            onClick={() => openImage(image)}
          />
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
          <img src={selectedImage} alt="Full-size" className={c.fullImage} />
        </div>
      )}
    </div>
  );
};

export default PostItem;
