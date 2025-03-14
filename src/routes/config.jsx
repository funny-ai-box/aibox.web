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

// 导入数据分析助手组件
import DataAnalysisHome from '../apps/DataAnalysis/DataAnalysisHome';
import FileViewerPage from '../apps/DataAnalysis/FileViewerPage';
import DataAnalysisPage from '../apps/DataAnalysis/DataAnalysisPage';
import DashboardsPage from '../apps/DataAnalysis/DashboardsPage';
import DashboardDetailPage from '../apps/DataAnalysis/DashboardDetailPage';
import DataAnalysisLayout from '../apps/DataAnalysis/DataAnalysisLayout';


// 导入其他应用组件
import App1 from '../apps/App1/App1';
import App2 from '../apps/App2/App2';
import App3 from '../apps/App3/App3';
import App4 from '../apps/App4/App4';


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
  {
    id: 2,
    title: "数据分析助手",
    path: "/data-analysis",
    description: "Excel数据分析与可视化"
  },
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
  {
    path: '/data-analysis',
    element: (
      <ProtectedRoute>
        <DataAnalysisLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由，显示数据文件列表
        element: <DataAnalysisHome />
      },
      {
        path: 'file/:fileId', // 文件数据表查看页面
        element: <FileViewerPage />
      },
      {
        path: 'analysis', // 数据分析页面
        element: <DataAnalysisPage />
      },
      {
        path: 'dashboards', // 可视化面板列表页面
        element: <DashboardsPage />
      },
      {
        path: 'dashboard/:dashboardId', // 仪表板详情页面
        element: <DashboardDetailPage />
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