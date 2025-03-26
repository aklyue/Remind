import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLike } from "../../store/postsReducer";

export default function usePostActions(users, fetchPosts) {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");
  const [commentText, setCommentText] = useState("");
  const [commentPostId, setCommentPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});

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

      fetchPosts();
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

  return {
    handleCommentSubmit,
    handleLike,
    toggleComments,
    commentText,
    setCommentText,
    commentPostId,
    setCommentPostId,
    expandedPosts,
  };
}
