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

import VideoMixerLayout from '../apps/VideoMixer/VideoMixerLayout';
import ProjectListPage from '../apps/VideoMixer/ProjectListPage';
import ProjectEditPage from '../apps/VideoMixer/ProjectEditPage';
import ProjectDetailPage from '../apps/VideoMixer/ProjectDetailPage';


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
  {
    id: 3, // 注意：根据你的实际情况调整ID
    title: "视频智能混剪工具",
    path: "/video-mixer",
    description: "AI智能视频剪辑与合成"
  },


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
  {
    path: '/video-mixer',
    element: (
      <ProtectedRoute>
        <VideoMixerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由
        element: <ProjectListPage />
      },
      {
        path: 'edit/:projectId', // 项目编辑页面
        element: <ProjectEditPage />
      },
      {
        path: 'details/:projectId', // 项目详情页面
        element: <ProjectDetailPage />
      }
    ]
  },
  
  
  
  // 捕获所有不匹配的路由
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

// 导出路由配置，供App.jsx使用
export default routes;