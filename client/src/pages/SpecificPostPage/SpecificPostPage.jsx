import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import * as c from "./SpecificPostPage.module.scss";
import useFetchPosts from "../../hooks/useFetchPosts/useFetchPosts";

function SpecificPostPage() {
  const { postId } = useParams();
  const { fetchPosts } = useFetchPosts();
  const posts = useSelector((state) => state.posts);
  const post = posts.find((post) => post.id == postId);

  useEffect(() => {
    if (!posts.length) {
      fetchPosts();
    }
  }, [posts]);

  if (!posts.length) return <div className={c.spinner}></div>;

  return (
    <div className={c.mainCont}>
      <div className={c.container}>
        <div className={c.postContainer}>
          {post ? (
            <div>
              <div
                className={`${c.post} ${
                  post.images?.urls?.length === 1
                    ? c.single
                    : post.images?.urls?.length === 2
                    ? c.double
                    : post.images?.urls?.length > 2
                    ? c.multiple
                    : ""
                }`}
              >
                {post.images?.urls?.length > 0
                  ? post.images?.urls?.map((url, index) => {
                      return (
                        <div
                          key={index}
                          style={{ "--span-count": post.images.urls.length }}
                        >
                          {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={url}
                              alt={`Post Image ${index}`}
                              className={c.postImage}
                            />
                          ) : url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <video
                              src={url}
                              alt={`Post Video ${index}`}
                              className={c.postImage}
                              controls
                            />
                          ) : null}
                        </div>
                      );
                    })
                  : post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className={c.postImage}
                      />
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
    </div>
  );
}

export default SpecificPostPage;
