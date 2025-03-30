// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import './App.css';

// 导入我们的自定义主题
import appleTheme from './theme/apple-inspired-theme';

// 导入路由配置
import routes from './routes/config';

/**
 * 路由渲染组件
 * 使用useRoutes钩子处理嵌套路由
 */
const AppRoutes = () => {
  const routeElements = useRoutes(routes);
  return routeElements;
};

/**
 * 应用主组件
 */
function App() {
  return (
    <ConfigProvider theme={appleTheme} locale={zhCN}>
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App;