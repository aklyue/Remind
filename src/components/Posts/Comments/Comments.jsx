import React from "react";
import { Link } from "react-router-dom";
import c from "./Comments.module.scss";

const Comments = ({
  post,
  toggleComments,
  expandedPosts,
  commentText,
  setCommentText,
  commentPostId,
  setCommentPostId,
  handleCommentSubmit,
}) => {
  return (
    <div className={c.commentsSection} data-no-navigate>
      {post.comments.length > 0 && (
        <>
          <ul>
            {post.comments
              .slice(0, expandedPosts[post.id] ? post.comments.length : 5)
              .map((comment) => (
                <li key={comment.id}>
                  <div className={c.comment}>
                    <Link to={`/users/${comment.userId}`}>
                      <img className={c.avatar} src={comment.avatar} alt="" />
                    </Link>
                    <div className={c.commentText}>
                      <Link
                        className={c.commentAuthor}
                        to={`/users/${comment.userId}`}
                      >
                        <strong>{comment.username}</strong>
                      </Link>
                      {comment.text}
                      <div className={c.commentTime}>
                        {new Date(comment.createdAt).toLocaleString("ru-RU")}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>

          {post.comments.length > 5 && (
            <button
              className={c.toggleCommentsButton}
              onClick={() => toggleComments(post.id)}
            >
              {expandedPosts[post.id] ? "Скрыть комментарии" : "Показать все"}
            </button>
          )}
        </>
      )}

      {commentPostId === post.id ? (
        <div>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button
            className={c.sendBtn}
            onClick={() => handleCommentSubmit(post.id)}
          >
            Send
          </button>
        </div>
      ) : (
        <button
          className={c.addCommentBtn}
          onClick={() => setCommentPostId(post.id)}
        >
          Add comment
        </button>
      )}
    </div>
  );
};

export default Comments;
