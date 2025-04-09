import { createSlice } from "@reduxjs/toolkit";

const postsSlice = createSlice({
  name: "posts",
  initialState: [],
  reducers: {
    setPosts: (state, action) => {
      return action.payload;
    },
    toggleLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.find((p) => p.id === postId);
      if (!post) return;

      const isLiked = post.likes.includes(userId);
      post.likes = isLiked
        ? post.likes.filter((id) => id !== userId)
        : [...post.likes, userId];
    },

    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.find((p) => p.id === postId);
      if (post) {
        post.comments.push(comment);
      }
    },
  },
});

export const { setPosts, toggleLike, addComment } = postsSlice.actions;
export default postsSlice.reducer;
