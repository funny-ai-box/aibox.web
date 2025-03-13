import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import './App.css'

// 导入路由保护组件
import { ProtectedRoute, PublicRoute } from './routes'
import { appRoutes } from './routes/config'

// 导入页面组件
import AuthPage from './pages/Auth/AuthPage'
import AppHome from './components/AppHome'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 公共路由 - 登录/注册页面 */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } 
          />

          {/* 首页路由 - 需要登录才能访问 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppHome />
              </ProtectedRoute>
            } 
          />

          {/* 动态生成应用路由 */}
          {appRoutes.map(route => (
            <Route 
              key={route.id}
              path={route.path} 
              element={
                <ProtectedRoute>
                  <route.component />
                </ProtectedRoute>
              } 
            />
          ))}

          {/* 捕获所有不匹配的路由，重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App