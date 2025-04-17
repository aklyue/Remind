import React from "react";
import { Link } from "react-router-dom";
import * as c from "./Comments.module.scss";

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
      {post.comments.length > 0 ? (
        <>
          <p>Комментарии</p>
          <ul>
            {post.comments
              .slice(0, expandedPosts[post.id] ? post.comments.length : 3)
              .map((comment) => (
                <li key={comment.id}>
                  <div className={c.comment}>
                    <Link to={`/profile/${comment.userId}`}>
                      <img className={c.avatar} src={comment.avatar} alt="" />
                    </Link>
                    <div className={c.commentText}>
                      <Link
                        className={c.commentAuthor}
                        to={`/profile/${comment.userId}`}
                      >
                        <strong>{comment.username}</strong>
                      </Link>
                      {comment.text}
                      <div className={c.commentTime}>
                        {new Date(comment.createdAt).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }) +
                          ", " +
                          new Date(comment.createdAt).toLocaleTimeString(
                            "ru-RU",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
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
      ) : (
        <p>Комментариев нет</p>
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
