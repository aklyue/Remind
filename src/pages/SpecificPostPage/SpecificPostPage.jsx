import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import c from './SpecificPostPage.module.scss';

function SpecificPostPage() {
  const { postId } = useParams();
  const posts = useSelector(state => state.posts);
  const post = posts.find(post => post.id == postId);

  return (
    <div className={c.container}>
      {post ? (
        <div className={c.post}>
          <img className={c.image} src={post.image} alt={post.title || 'Post image'} />
          <h1 className={c.title}>{post.title}</h1>
          <p className={c.text}>{post.text}</p>
        </div>
      ) : (
        <p className={c.notFound}>Post not found</p>
      )}
    </div>
  );
}

export default SpecificPostPage;
