import {configureStore} from "@reduxjs/toolkit"
import unreadMessagesReducer from "./unreadMessagesSlice"
import postsReducer from "./postsReducer"

export const store = configureStore({
    reducer: {
        posts: postsReducer,
        unreadMessages: unreadMessagesReducer
    }
})