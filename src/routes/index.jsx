import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/http';
import AuthPage from '../pages/Auth/AuthPage';

// 受保护的路由组件
// 如果用户已登录，显示子组件，否则重定向到登录页面
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // 将当前路径保存到 state，以便登录后可以重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// 公共路由组件
// 如果用户已登录，重定向到首页，否则显示子组件（如登录页面）
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// 路由配置
const routes = [
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    )
  },
  // 需要保护的路由放在这里
  {
    path: '/*',
    element: (
      <ProtectedRoute>
        {/* 使用你现有的 App 组件 */}
        {/* 我们需要确保App能够嵌套路由 */}
      </ProtectedRoute>
    )
  }
];

export { ProtectedRoute, PublicRoute, routes };