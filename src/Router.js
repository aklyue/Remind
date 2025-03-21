import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AuthorizationPage from './pages/AuthorizationPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import PostsPage from './pages/PostsPage';
import SpecificUserPage from './pages/SpecificUserPage';
import CreatePostPage from './pages/CreatePostPage';
import SpecificPostPage from './pages/SpecificPostPage';
import Sidebar from './api/UI/UX/Sidebar';
import FriendsPage from './pages/FriendsPage';

function Layout() {
    const location = useLocation();
    const hideSidebarRoutes = ['/authorization'];
    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
            <div style={{ flex: 1, height: '100%'}}>
                <Routes>
                    <Route path="/authorization" element={<AuthorizationPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/posts" element={<PostsPage />} />
                    <Route path="/users/:userId" element={<SpecificUserPage />} />
                    <Route path="/create-post" element={<CreatePostPage />} />
                    <Route path="/posts/:postId" element={<SpecificPostPage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                </Routes>
            </div>
        </div>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}

export default Router;
