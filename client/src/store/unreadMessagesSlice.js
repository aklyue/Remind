import { createSlice } from "@reduxjs/toolkit";

const unreadMessagesSlice = createSlice({
  name: "unreadMessages",
  initialState: {},
  reducers: {
    incrementUnread: (state, action) => {
      const { senderId } = action.payload;
      state[senderId] = (state[senderId] || 0) + 1;
    },
    resetUnread: (state, action) => {
      const { senderId } = action.payload;
      state[senderId] = 0;
    },
  },
});

export const {incrementUnread, resetUnread} = unreadMessagesSlice.actions;
export default unreadMessagesSlice.reducer;
