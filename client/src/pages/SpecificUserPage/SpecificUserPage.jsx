import React, { useState, useEffect } from "react";
import useGetUsers from "../../hooks/query/useGetUsers";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as c from "./SpecificUserPage.module.scss";

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
      const res = await fetch(`http://localhost:4000/users/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCurrentUser(data);
    };

    fetchCurrentUser();
  }, [currentUserId, navigate]);

  useEffect(() => {
    if (user?.followers?.some((follower) => follower.id === currentUserId)) {
      setIsFollowing(true);
    }
  }, [user, currentUserId]);

  if (isFetching) {
    return <div className={c.spinner}></div>;
  }

  if (!user) {
    return <div>User not found</div>;
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

      const updateUser = fetch(`http://localhost:4000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...user, followers: updatedFollowers }),
      });

      const updateCurrentUser = fetch(
        `http://localhost:4000/users/${currentUserId}`,
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

  const isVideo = (url) => {
    const videoExtensions = [
      "mp4",
      "webm",
      "ogg",
      "mov",
      "MP4",
      "WEBM",
      "OGG",
      "MOV",
    ];
    const fileExtension = url.split(".").pop();
    return videoExtensions.includes(fileExtension);
  };

  const handleUserNavigate = (follower) => {
    navigate(`/profile/${follower.id}`);
  };

  return (
    <div className={c.mainCont}>
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
                  <li
                    key={follower.id}
                    className={c.followerItem}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleUserNavigate(follower)}
                  >
                    {follower.name}
                  </li>
                ))}
                {user.followers.length > 3 && (
                  <button onClick={() => setShowAllFollowers(true)}>
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
                <Link to={`/posts/${post.id}`}>
                  <div className={c.postItem}>
                    <div
                      className={`${c.postImageContainer} ${
                        post.images?.urls?.length === 1
                          ? c.single
                          : post.images?.urls?.length === 2
                          ? c.double
                          : c.multiple
                      }`}
                      data-no-navigate
                    >
                      {post.images?.urls?.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            "--span-count": post.images.urls.length,
                          }}
                        >
                          {isVideo(url) ? (
                            <video
                              className={c.postMedia}
                              src={url}
                              alt={`Post video ${index}`}
                              controls
                              onClick={() => openImage(url)}
                            />
                          ) : (
                            <img
                              className={c.postMedia}
                              src={url}
                              alt={`Post ${index}`}
                              onClick={() => openImage(url)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.text}</p>
                  </div>
                </Link>
              ))}
            </ul>
          ) : (
            <p className={c.noPosts}>No posts available</p>
          )}
        </div>

        {showAllFollowers && (
          <div onClick={() => setShowAllFollowers(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <h3>All Followers</h3>
              <ul className={c.fullFollowersList}>
                {user.followers.map((follower) => (
                  <li
                    key={follower.id}
                    className={c.followerItem}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleUserNavigate(follower)}
                  >
                    {follower.name}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowAllFollowers(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecificUserPage;
