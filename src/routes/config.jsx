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

// 社交内容

import SocialContentLayout from '../apps/SocialContent/SocialContentLayout';
import SocialContentHome from '../apps/SocialContent/SocialContentHome';
import CreateTaskPage from '../apps/SocialContent/CreateTaskPage';
import TaskListPage from '../apps/SocialContent/TaskListPage';
import TaskDetailPage from '../apps/SocialContent/TaskDetailPage';

// 客服

import CustomerServiceLayout from '../apps/CustomerService/CustomerServiceLayout';
import CustomerServiceHome from '../apps/CustomerService/CustomerServiceHome';
import ChatPage from '../apps/CustomerService/ChatPage';
import SessionListPage from '../apps/CustomerService/SessionListPage';
import ProductListPage from '../apps/CustomerService/ProductListPage';
import CreateProductPage from '../apps/CustomerService/CreateProductPage';
import EditProductPage from '../apps/CustomerService/EditProductPage';
import ProductDetailPage from '../apps/CustomerService/ProductDetailPage';

//数据库设计

import DatabaseDesignLayout from '../apps/DatabaseDesign/DatabaseDesignLayout';
import DatabaseDesignHome from '../apps/DatabaseDesign/DatabaseDesignHome';
import CodeTemplateManager from '../apps/DatabaseDesign/CodeTemplateManager';
import DatabaseDesignTaskDetail from '../apps/DatabaseDesign/DatabaseDesignTaskDetail';

//问卷

import SurveyLayout from '../apps/Survey/SurveyLayout';

import SurveyListPage from '../apps/Survey/SurveyListPage';
import SurveyCreatePage from '../apps/Survey/SurveyCreatePage';
import SurveyPreviewPage from '../apps/Survey/SurveyPreviewPage';
import SurveyStatsPage from '../apps/Survey/SurveyStatsPage';




/**
 * 应用卡片配置
 * 用于应用主页展示的应用卡片
 */
export const appCards = [
  {
    id: 1,
    title: "个人知识库",
    path: "/knowledge-base",
    description: "个人知识管理系统，导入文档后智能分析、提问和对话，高效管理您的知识资产",
    category: "文本生成",
    badge: "",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5V18M12 4.5L7.5 9M12 4.5L16.5 9M7.5 15H16.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 2,
    title: "数据分析助手",
    path: "/data-analysis",
    description: "Excel数据分析与可视化，对话式交互分析数据、自动生成图表、发现数据洞察",
    category: "数据分析",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 3,
    title: "视频智能混剪工具",
    path: "/video-mixer",
    description: "AI驱动的视频剪辑与合成工具，上传视频后自动分析、剪辑和优化，轻松创建专业视频",
    category: "视频处理",
    badge: "",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10L19.5528 7.72361C19.8343 7.58281 20 7.30778 20 7V17C20 17.3078 19.8343 17.5828 19.5528 17.7236L15 20M5 5H14C14.5523 5 15 5.44772 15 6V18C15 18.5523 14.5523 19 14 19H5C4.44772 19 4 18.5523 4 18V6C4 5.44772 4.44772 5 5 5Z" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 4,
    title: "社交媒体内容智能创作",
    path: "/social-content",
    description: "基于AI为社交平台快速生成优质内容，自动适配平台特性，提升内容创作效率和影响力",
    category: "文本生成",
    badge: "新",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 8h10M7 12h4m1 8l4-8M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 5,
    title: "智能客服系统",
    path: "/customer-service",
    description: "基于AI的智能客服系统，自动回答用户问题，查询商品信息，提高客户服务效率",
    category: "客户服务",
    badge: "新",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 19C7 20.1 7.9 21 9 21H15C16.1 21 17 20.1 17 19V3H7V19ZM9 5H15V19H9V5Z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3C12.5523 3 13 2.55228 13 2C13 1.44772 12.5523 1 12 1C11.4477 1 11 1.44772 11 2C11 2.55228 11.4477 3 12 3Z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 9H9M15 12H9M15 15H9" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 6,
    title: "数据库设计工具",
    path: "/database-design",
    description: "使用自然语言交互，AI就能设计好业务的数据结构和关系，并能选择语言生成后端的数据执行代码",
    category: "代码辅助",
    badge: "新",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm12 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-8 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm2-6c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 7, // 确保ID唯一
    title: "AI问卷调查",
    path: "/survey",
    description: "使用AI智能设计问卷，支持多种题型，自动分析收集数据，高效便捷的问卷调研工具",
    category: "数据收集",
    badge: "新",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  }
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
  {
    path: '/social-content',
    element: (
      <ProtectedRoute>
        <SocialContentLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由
        element: <SocialContentHome />
      },
      {
        path: 'create', // 创建任务页面
        element: <CreateTaskPage />
      },
      {
        path: 'tasks', // 任务列表页面
        element: <TaskListPage />
      },
      {
        path: 'task/:taskId', // 任务详情页面
        element: <TaskDetailPage />
      }
    ]
  },
  {
    path: '/customer-service',
    element: (
      <ProtectedRoute>
        <CustomerServiceLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由
        element: <CustomerServiceHome />
      },
      {
        path: 'sessions',
        element: <SessionListPage />
      },
      {
        path: 'chat/:sessionId',
        element: <ChatPage />
      },
      {
        path: 'products',
        element: <ProductListPage />
      },
      {
        path: 'products/create',
        element: <CreateProductPage />
      },
      {
        path: 'products/edit/:productId',
        element: <EditProductPage />
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />
      }
    ]
  },
  {
    path: '/database-design',
    element: (
      <ProtectedRoute>
        <DatabaseDesignLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由
        element: <DatabaseDesignHome />
      },
      {
        path: 'task/:taskId', // 任务详情页
        element: <DatabaseDesignTaskDetail />
      },
      {
        path: 'templates', // 代码模板管理页
        element: <CodeTemplateManager />
      }
    ]
  },
  {
    path: '/survey',
    element: (
      <ProtectedRoute>
        <SurveyLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // 默认子路由
        element: <SurveyListPage />
      },
      {
        path: 'create', // 创建问卷
        element: <SurveyCreatePage />
      },
      {
        path: 'edit/:taskId', // 编辑问卷
        element: <SurveyCreatePage />
      },
      {
        path: 'preview/:taskId', // 预览问卷
        element: <SurveyPreviewPage />
      },
      {
        path: 'stats/:taskId', // 查看统计
        element: <SurveyStatsPage />
      },
      {
        path: 'fill/:shareCode', // 填写问卷(通过分享链接)
        element: <SurveyPreviewPage />
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