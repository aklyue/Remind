import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../../api/users";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, addComment, toggleLike } from "../../store/postsReducer";
import c from "./Posts.module.scss";

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

function Posts() {
  const dispatch = useDispatch();
  const allPosts = useSelector((state) => state.posts);
  const [users, setUsers] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentPostId, setCommentPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const userId = localStorage.getItem("userId");

  const fetchData = async () => {
    const data = await getUsers();
    setUsers(data);

    const posts = data.flatMap((user) =>
      user.posts.map((post) => ({
        ...post,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        comments: post.comments.map((comment) => ({
          ...comment,
          username:
            data.find((u) => u.id === comment.userId)?.username || "Unknown",
        })),
        likes: post.likes,
      }))
    );

    dispatch(setPosts(posts));
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: crypto.randomUUID(),
      userId,
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    const postOwner = users.find((user) =>
      user.posts.some((post) => post.id === postId)
    );

    if (!postOwner) return;

    try {
      const response = await fetch(
        `http://localhost:3001/users/${postOwner.id}`
      );
      const userData = await response.json();

      const updatedPosts = userData.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      );

      await fetch(`http://localhost:3001/users/${postOwner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: updatedPosts }),
      });

      await fetchData();
      setCommentText("");
      setCommentPostId(null);
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  const handleLike = async (postId) => {
    const postOwner = users.find((user) =>
      user.posts.some((post) => post.id === postId)
    );

    if (!postOwner) return;

    try {
      const response = await fetch(
        `http://localhost:3001/users/${postOwner.id}`
      );
      const userData = await response.json();

      const updatedPosts = userData.posts.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(userId);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((id) => id !== userId)
              : [...post.likes, userId],
          };
        }
        return post;
      });

      await fetch(`http://localhost:3001/users/${postOwner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: updatedPosts }),
      });

      dispatch(toggleLike({ postId, userId }));
    } catch (error) {
      console.error("Ошибка при лайке:", error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleKeyDown = (e, postId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommentSubmit(postId)
    }
  };

  return (
    <div className={c.postsWrapper}>
      <Link className={c.btnCreate} to="/create-post">
        <button className={c.addPostButton}>Add new post</button>
      </Link>

      <div className={c.postsContainer}>
        {allPosts.length > 0 ? (
          allPosts.map((post) => (
            <div key={post.id} className={c.postItem}>
              <div className={c.postAuthor}>
                <Link to={`/users/${post.userId}`} className={c.authorLink}>
                  {post.avatar && (
                    <img
                      src={post.avatar}
                      alt={post.username}
                      className={c.authorAvatar}
                    />
                  )}
                  <span>{post.username}</span>
                </Link>
                <p className={c.postTime}>{formatTime(post.createdAt)}</p>
              </div>
              <Link to={`/posts/${post.id}`} className={c.postLink}>
                <img
                  src={post.image}
                  alt={post.title || "Post image"}
                  className={c.postImage}
                />
                <p className={c.postTitle}>{post.title}</p>
              </Link>

              <div className={c.likeSection}>
                <button onClick={() => handleLike(post.id)}>
                  {post.likes.includes(userId) ? "❤️" : "🤍"}{" "}
                  {post.likes.length}
                </button>
              </div>
                  <hr color="#f5f5f5"/>
                  <p>Комментарии</p>
              <div className={c.commentsSection}>
                {post.comments.length > 0 && (
                  <>
                    <ul>
                      {post.comments
                        .slice(
                          0,
                          expandedPosts[post.id] ? post.comments.length : 5
                        )
                        .map((comment) => (
                          <li key={comment.id}>
                            <p className={c.commentText}>
                              <strong>{comment.username}:</strong>{" "}
                              {comment.text}
                            </p>
                            <span className={c.commentTime}>
                              {formatTime(comment.createdAt)}
                            </span>
                          </li>
                        ))}
                    </ul>

                    {post.comments.length > 5 && (
                      <button
                        className={c.toggleCommentsButton}
                        onClick={() => toggleComments(post.id)}
                      >
                        {expandedPosts[post.id]
                          ? "Скрыть комментарии"
                          : "Показать все"}
                      </button>
                    )}
                  </>
                )}

                {commentPostId === post.id ? (
                  <div>
                    <input
                    onKeyDown={(e) => handleKeyDown(e, post.id)}
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <button className={c.sendBtn} onClick={() => handleCommentSubmit(post.id)}>
                      Send
                    </button>
                  </div>
                ) : (
                  <button
                    className={c.addCommentBtn}
                    onClick={() => setCommentPostId(post.id)}
                  >
                    Add comment
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
}

export default Posts;

{
  /* {users.filter(user => user.id !== Number(loggedInUserId))
    .map(user =>
        <Link key={user.id} to={`/users/${user.id}`}>
            <div>
                <img src={`${user.avatar}`} alt='https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' />
                <p>{user.username}</p>
            </div>
        </Link>
    )} */
}
{
  /* Часть кода, отвесающая за прорисовку пользователей (реализовать в friends). Здесь не нужна!!!*/
}
