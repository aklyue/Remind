import React from 'react'
import Chat from '../../components/Chat'
import * as c from "./ChatPage.module.scss"

function ChatPage() {
  return (
    <div className={c.chatContainer}>
        <Chat/>
    </div>
  )
}

export default ChatPage