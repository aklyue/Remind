import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useFetchPosts from "../../hooks/useFetchPosts/useFetchPosts";

import PostItem from "./PostItem";
import c from "./Posts.module.scss";

const Posts = () => {
  const allPosts = useSelector((state) => state.posts);
  const { users, fetchPosts } = useFetchPosts();

  return (
    <div className={c.postsWrapper}>
      <Link className={c.btnCreate} to="/create-post">
        <button className={c.addPostButton}>Add new post</button>
      </Link>

      <div className={c.postsContainer}>
        {allPosts.length > 0 ? (
          allPosts
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((post) => <PostItem key={post.id} post={post} users={users} fetchPosts={fetchPosts} />)
        ) : (
          <p>No posts available</p>
        )}
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
