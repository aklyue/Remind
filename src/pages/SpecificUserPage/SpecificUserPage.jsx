import React, { useState, useEffect } from "react";
import useGetUsers from "../../hooks/query/useGetUsers";
import { useNavigate, useParams } from "react-router-dom";
import c from "./SpecificUserPage.module.scss";

function SpecificUserPage() {
  const { userId } = useParams();
  const { data: user, isFetching, refetch } = useGetUsers(userId);
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllFollowers, setShowAllFollowers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/authorization");
    }
    const fetchCurrentUser = async () => {
      const res = await fetch(`http://localhost:3001/users/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCurrentUser(data);
    };

    fetchCurrentUser();
  }, [currentUserId]);

  useEffect(() => {
    if (user?.followers?.some((follower) => follower.id === currentUserId)) {
      setIsFollowing(true);
    }
  }, [user, currentUserId]);

  if (isFetching) {
    return <div className={c.loading}>Loading...</div>;
  }

  if (!user) {
    return <div className={c.notFound}>User not found</div>;
  }

  const handleFollow = async () => {
    if (currentUserId === userId || !currentUser) return;

    try {
      let updatedFollowers = [...(user.followers || [])];
      let updatedFollowed = [...(currentUser.followed || [])];

      if (isFollowing) {
        updatedFollowers = updatedFollowers.filter(
          (f) => f.id !== currentUserId
        );
        updatedFollowed = updatedFollowed.filter((f) => f.id !== userId);
      } else {
        const alreadyFollowing = updatedFollowers.some(
          (f) => f.id == currentUserId
        );
        const alreadyFollowed = updatedFollowed.some((f) => f.id == userId);

        if (!alreadyFollowing) {
          updatedFollowers.push({
            id: currentUserId,
            name: currentUser.username,
          });
        }

        if (!alreadyFollowed) {
          updatedFollowed.push({ id: userId, name: user.username });
        }
      }

      const updateUser = fetch(`http://localhost:3001/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...user, followers: updatedFollowers }),
      });

      const updateCurrentUser = fetch(
        `http://localhost:3001/users/${currentUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...currentUser, followed: updatedFollowed }),
        }
      );
      refetch();

      await Promise.all([updateUser, updateCurrentUser]);

      setIsFollowing(!isFollowing);
      setCurrentUser((prev) => ({ ...prev, followed: updatedFollowed }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={c.container}>
      <div className={c.profile}>
        <img className={c.avatar} src={user.avatar} alt="User Avatar" />
        <p className={c.username}>{user.username}</p>

        {currentUserId !== userId && (
          <button
            className={`${c.followButton} ${isFollowing ? c.unfollow : ""}`}
            onClick={handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

        <h3>Followers:</h3>
        <ul className={c.followersList}>
          {user.followers && user.followers.length > 0 ? (
            <>
              {user.followers.slice(0, 3).map((follower) => (
                <li key={follower.id} className={c.followerItem}>
                  {follower.name}
                </li>
              ))}
              {user.followers.length > 3 && (
                <button
                  className={c.showAllBtn}
                  onClick={() => setShowAllFollowers(true)}
                >
                  Show all ({user.followers.length})
                </button>
              )}
            </>
          ) : (
            <p>No followers yet</p>
          )}
        </ul>
      </div>

      <div className={c.posts}>
        <h2 className={c.postsTitle}>Posts:</h2>
        {user.posts && user.posts.length > 0 ? (
          <ul className={c.postList}>
            {user.posts.map((post) => (
              <li key={post.id} className={c.postItem}>
                <h3 className={c.postTitle}>{post.title}</h3>

                <div
                  className={`${c.postImagesContainer} ${
                    post.image || post.images?.length === 1
                      ? c.single
                      : post.images?.length === 2
                      ? c.double
                      : post.images?.length > 2
                      ? c.multiple
                      : ""
                  }`}
                  style={{ "--span-count": post.images?.length || 1 }}
                >
                  {post.images?.length > 0 ? (
                    post.images.map((image, index) => (
                      <img
                        key={index}
                        className={c.postImage}
                        src={image}
                        alt={`Post ${index}`}
                      />
                    ))
                  ) : post.image ? (
                    <img
                      src={post.image}
                      className={c.postImage}
                      alt={post.title}
                    />
                  ) : (
                    <div></div>
                  )}
                </div>

                <p className={c.postText}>{post.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={c.noPosts}>No posts available</p>
        )}
      </div>

      {showAllFollowers && (
        <div
          className={c.modalOverlay}
          onClick={() => setShowAllFollowers(false)}
        >
          <div className={c.modal} onClick={(e) => e.stopPropagation()}>
            <h3>All Followers</h3>
            <ul className={c.fullFollowersList}>
              {user.followers.map((follower) => (
                <li key={follower.id} className={c.followerItem}>
                  {follower.name}
                </li>
              ))}
            </ul>
            <button
              className={c.closeModal}
              onClick={() => setShowAllFollowers(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecificUserPage;
