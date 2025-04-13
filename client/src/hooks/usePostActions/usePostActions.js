import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLike } from "../../store/postsReducer";

export default function usePostActions(users, fetchPosts) {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
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
        `http://localhost:4000/users/${postOwner.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = await response.json();

      const updatedPosts = userData.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      );

      const updatedUserData = {
        ...userData,
        posts: updatedPosts,
      };

      const putResponse = await fetch(
        `http://localhost:4000/users/${postOwner.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUserData),
        }
      );

      if (putResponse.ok) {
        fetchPosts();
        setCommentText("");
        setCommentPostId(null);
      } else {
        console.error("Ошибка при обновлении поста");
      }
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
        `http://localhost:4000/users/${postOwner.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

      const updatedUserData = {
        ...userData,
        posts: updatedPosts,
      };

      const putResponse = await fetch(
        `http://localhost:4000/users/${postOwner.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUserData),
        }
      );

      if (putResponse.ok) {
        dispatch(toggleLike({ postId, userId }));
      } else {
        console.error("Ошибка при обновлении лайков");
      }
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
