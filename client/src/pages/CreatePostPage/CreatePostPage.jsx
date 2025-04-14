import React from "react";
import CreatePost from "../../components/CreatePost";
import * as c from "./CreatePostPage.module.scss"

function CreatePostPage() {
  return (
    <div className={c.container}>
      <CreatePost />
    </div>
  );
}

export default CreatePostPage;
