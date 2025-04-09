import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useFetchPosts from "../../hooks/useFetchPosts/useFetchPosts";
import PostItem from "./PostItem";
import c from "./Posts.module.scss";
import SortPanel from "./SortPanel";

const Posts = () => {
  const allPosts = useSelector((state) => state.posts);
  const { users, fetchPosts } = useFetchPosts();
  const [sortBy, setSortBy] = useState("newest");

  const sortedPosts = [...allPosts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "likes") {
      return b.likes.length - a.likes.length;
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  });

  return (
    <div>
      <SortPanel sortBy={sortBy} setSortBy={setSortBy} />
      <div className={c.postsWrapper}>
        <div className={c.controls}>
          <Link className={c.btnCreate} to="/create-post">
            <button className={c.addPostButton}>Add new post</button>
          </Link>
        </div>

        <div className={c.postsContainer}>
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                users={users}
                fetchPosts={fetchPosts}
              />
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;

{
  /* {users.filter(user => user.id !== Number(loggedInUserId))
    .map(user =>
        <Link key={user.id} to={`/users/${user.id}`}>
            <div>
                <img src={`${user.avatar}`} alt='https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' />
                <p>{user.username}</p>
            </div>
        </Link>
    )} */
}
{
  /* Часть кода, отвесающая за прорисовку пользователей (реализовать в friends). Здесь не нужна!!!*/
}
