import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "../../store/postsReducer";
import { getUsers } from "../../api/users";
import { useNavigate } from "react-router-dom";

export default function useFetchPosts() {
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token")

  const fetchPosts = async () => {
    const data = await getUsers();
    setUsers(data);

    if (!token) {
      navigate("/authorization");
      return;
    }

    const posts = data.flatMap((user) =>
      user.posts.map((post) => ({
        ...post,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        images: post.images || [],
        comments: post.comments.map((comment) => ({
          ...comment,
          avatar: data.find((u) => u.id === comment.userId)?.avatar,
          username:
            data.find((u) => u.id === comment.userId)?.username || "Unknown",
        })),
      }))
    );

    dispatch(setPosts(posts));
  };

  useEffect(() => {
    fetchPosts();
  }, [dispatch]);

  return { users, fetchPosts, userId };
}
