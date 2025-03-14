import React from 'react';
import { Navigate } from 'react-router-dom';

// 导入路由保护组件
import { ProtectedRoute, PublicRoute } from './index';
import AuthPage from '../pages/Auth/AuthPage';
import AppHome from '../components/AppHome';

// 导入布局组件
import KnowledgeBaseLayout from '../apps/PersonalKnowledgeBase/KnowledgeBaseLayout';
import AppLayout from '../components/AppLayout';

// 导入知识库应用组件
import KnowledgeBaseHome from '../apps/PersonalKnowledgeBase/KnowledgeBaseHome';
import DocumentDetail from '../apps/PersonalKnowledgeBase/DocumentDetail';

// 导入其他应用组件
import App1 from '../apps/App1/App1';
import App2 from '../apps/App2/App2';
import App3 from '../apps/App3/App3';
import App4 from '../apps/App4/App4';
import App5 from '../apps/App5/App5';
import App6 from '../apps/App6/App6';
import App7 from '../apps/App7/App7';
import App8 from '../apps/App8/App8';
import App9 from '../apps/App9/App9';
import App10 from '../apps/App10/App10';
import App11 from '../apps/App11/App11';
import App12 from '../apps/App12/App12';
import App13 from '../apps/App13/App13';
import App14 from '../apps/App14/App14';
import App15 from '../apps/App15/App15';
import App16 from '../apps/App16/App16';
import App17 from '../apps/App17/App17';
import App18 from '../apps/App18/App18';
import App19 from '../apps/App19/App19';
import App20 from '../apps/App20/App20';
import App21 from '../apps/App21/App21';
import App22 from '../apps/App22/App22';
import App23 from '../apps/App23/App23';
import App24 from '../apps/App24/App24';

/**
 * 应用卡片配置
 * 用于应用主页展示的应用卡片
 */
export const appCards = [
  {
    id: 1,
    title: "个人知识库",
    path: "/knowledge-base",
    description: "个人知识管理系统"
  },
  { id: 2, title: "待开发1", path: "/app1", description: "功能正在开发中" },
  { id: 3, title: "待开发2", path: "/app2", description: "功能正在开发中" },
  { id: 4, title: "待开发3", path: "/app3", description: "功能正在开发中" },
  { id: 5, title: "待开发4", path: "/app4", description: "功能正在开发中" },
  { id: 6, title: "待开发5", path: "/app5", description: "功能正在开发中" },
  { id: 7, title: "待开发6", path: "/app6", description: "功能正在开发中" },
  { id: 8, title: "待开发7", path: "/app7", description: "功能正在开发中" },
  { id: 9, title: "待开发8", path: "/app8", description: "功能正在开发中" },
  { id: 10, title: "待开发9", path: "/app9", description: "功能正在开发中" },
  { id: 11, title: "待开发10", path: "/app10", description: "功能正在开发中" },
  { id: 12, title: "待开发11", path: "/app11", description: "功能正在开发中" },
  { id: 13, title: "待开发12", path: "/app12", description: "功能正在开发中" },
  { id: 14, title: "待开发13", path: "/app13", description: "功能正在开发中" },
  { id: 15, title: "待开发14", path: "/app14", description: "功能正在开发中" },
  { id: 16, title: "待开发15", path: "/app15", description: "功能正在开发中" },
  { id: 17, title: "待开发16", path: "/app16", description: "功能正在开发中" },
  { id: 18, title: "待开发17", path: "/app17", description: "功能正在开发中" },
  { id: 19, title: "待开发18", path: "/app18", description: "功能正在开发中" },
  { id: 20, title: "待开发19", path: "/app19", description: "功能正在开发中" },
  { id: 21, title: "待开发20", path: "/app20", description: "功能正在开发中" },
  { id: 22, title: "待开发21", path: "/app21", description: "功能正在开发中" },
  { id: 23, title: "待开发22", path: "/app22", description: "功能正在开发中" },
  { id: 24, title: "待开发23", path: "/app23", description: "功能正在开发中" },
  { id: 25, title: "待开发24", path: "/app24", description: "功能正在开发中" }
];

// 为了兼容性，再导出一次旧名称
export const appRoutes = appCards;

/**
 * 路由配置，使用嵌套结构
 */
const routes = [
  // 公共路由 - 不需要登录
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    )
  },
  
  // 受保护路由 - 需要登录
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppHome />
      </ProtectedRoute>
    )
  },
  
  // 知识库应用 - 带有子路由的嵌套路由
  {
    path: '/knowledge-base',
    element: (
      <ProtectedRoute>
        <KnowledgeBaseLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由
        element: <KnowledgeBaseHome />
      },
      {
        path: 'document/:documentId',
        element: <DocumentDetail />
      }
    ]
  },
  
  // 其他应用 - 使用通用布局
  {
    path: '/app1',
    element: (
      <ProtectedRoute>
        <AppLayout title="待开发1" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <App1 />
      }
    ]
  },
  {
    path: '/app2',
    element: (
      <ProtectedRoute>
        <AppLayout title="待开发2" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <App2 />
      }
    ]
  },
  {
    path: '/app3',
    element: (
      <ProtectedRoute>
        <AppLayout title="待开发3" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <App3 />
      }
    ]
  },
  {
    path: '/app4',
    element: (
      <ProtectedRoute>
        <AppLayout title="待开发4" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <App4 />
      }
    ]
  },
  // ... 添加更多应用路由
  
  // 捕获所有不匹配的路由
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

// 导出路由配置，供App.jsx使用
export default routes;