import React from "react";
import Posts from "../../components/Posts";
import c from "./PostsPage.module.scss"

function PostsPage() {
  return (
    <div className={c.container}>
      <Posts />
    </div>
  );
}

export default PostsPage;
