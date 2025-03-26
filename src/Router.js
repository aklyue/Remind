import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AuthorizationPage from "./pages/AuthorizationPage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import PostsPage from "./pages/PostsPage";
import SpecificUserPage from "./pages/SpecificUserPage";
import CreatePostPage from "./pages/CreatePostPage";
import SpecificPostPage from "./pages/SpecificPostPage";
import Sidebar from "./api/UI/UX/Sidebar";
import FriendsPage from "./pages/FriendsPage";
import Header from "./api/UI/Header";

function Layout({socket}) {
  const location = useLocation();
  const hideSidebarRoutes = ["/authorization"];
  return (
    <div style={{ display: "flex", height: "100%" }}>
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
      <div style={{ flex: 1, height: "100%" }}>
        <Routes>
          <Route
            path="/authorization"
            element={
              <>
                <AuthorizationPage />
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <Header />
                <SettingsPage />
              </>
            }
          />
          <Route
            path="/chat"
            element={
              <>
                <Header />
                <ChatPage/>
              </>
            }
          />
          <Route
            path="/posts"
            element={
              <>
                <Header />
                <PostsPage />
              </>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <>
                <Header />
                <SpecificUserPage />
              </>
            }
          />
          <Route
            path="/create-post"
            element={
              <>
                <Header />
                <CreatePostPage />
              </>
            }
          />
          <Route
            path="/posts/:postId"
            element={
              <>
                <Header />
                <SpecificPostPage />
              </>
            }
          />
          <Route
            path="/friends"
            element={
              <>
                <Header />
                <FriendsPage />
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Layout/>
    </BrowserRouter>
  );
}

export default Router;
