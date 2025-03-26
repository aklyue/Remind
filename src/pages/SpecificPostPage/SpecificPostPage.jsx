import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import c from "./SpecificPostPage.module.scss";

function SpecificPostPage() {
  const { postId } = useParams();
  const posts = useSelector((state) => state.posts);
  const post = posts.find((post) => post.id == postId);

  return (
    <div className={c.container}>
      <div className={c.postContainer}>
        {post ? (
          <div>
            <div
              className={`${c.post} ${
                post.images.length === 1
                  ? c.single
                  : post.images.length === 2
                  ? c.double
                  : post.images.length > 2
                  ? c.multiple
                  : ""
              }`}
            >
              {post.images.length > 0 ? (
                post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post ${index}`}
                    className={c.postImage}
                    style={{ "--span-count": post.images.length }}
                  />
                ))
              ) : post.image ? (
                <img src={post.image} alt="Post" className={c.postImage} />
              ) : (
                <p className={c.noImagesText}>No images available</p>
              )}
            </div>
            <div>
              <h1 className={c.title}>{post.title}</h1>
              <p className={c.text}>{post.text}</p>
            </div>
          </div>
        ) : (
          <p className={c.notFound}>Post not found</p>
        )}
      </div>
    </div>
  );
}

export default SpecificPostPage;
