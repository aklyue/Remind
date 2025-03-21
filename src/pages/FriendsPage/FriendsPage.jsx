import React from 'react'
import Friends from '../../components/Friends'
import c from "./FriendsPage.module.scss"

function FriendsPage() {
  return (
    <div className={c.container}>
        <Friends></Friends>
    </div>
  )
}

export default FriendsPage