import axios from 'axios';
import { message } from 'antd';

// 修改API基础URL为相对路径，配合Vite代理使用
// 也可以直接使用完整URL：http://106.75.71.65:57460/api
const BASE_URL = '/api'; 

// 调试开关
const DEBUG = true;

// 日志函数
const log = (label, ...args) => {
  if (DEBUG) {
    console.log(`【HTTP工具】${label}:`, ...args);
  }
};

// 获取存储的token
const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo).accessToken;
    } catch (e) {
      log('解析用户信息失败', e);
      return null;
    }
  }
  return null;
};

// 获取基础URL
const getBaseUrl = () => {
  return BASE_URL;
};

// 清除用户信息并跳转到登录页
const clearUserInfoAndRedirect = () => {
  localStorage.removeItem('userInfo');
  log('已清除用户信息，准备跳转到登录页');
  // 使用replace避免用户通过浏览器返回按钮回到需要认证的页面
  window.location.replace('/login');
};

// 创建axios实例
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      log('请求拦截器添加Token', '已配置');
    }
    
    log('发送请求', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      hasData: !!config.data
    });
    
    return config;
  },
  error => {
    log('请求拦截器捕获错误', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    log('收到响应', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });
    
    const data = response.data;
    
    // 如果接口返回的状态码不是200，则视为请求失败
    if (data.code !== 200) {
      const errorMsg = data.message || '请求失败';
      log('业务状态码错误', {
        code: data.code,
        message: errorMsg
      });
      message.error(errorMsg);
      return Promise.reject(data);
    }
    
    return data;
  },
  error => {
    log('响应拦截器捕获错误', error);
    
    if (error.response) {
      // 服务器返回了响应，但状态码不在 2xx 范围内
      log('服务器响应错误', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // 处理401未授权错误
      if (error.response.status === 401) {
        log('收到401错误，需要重新登录');
        message.error('登录已过期，请重新登录');
        clearUserInfoAndRedirect();
        return Promise.reject({ code: 401, message: '登录已过期' });
      }
      
      // 处理其他HTTP错误
      const errorText = `请求失败: ${error.response.status} ${error.response.statusText}`;
      message.error(errorText);
    } else if (error.request) {
      // 请求已发送但没收到响应
      log('未收到响应', error.request);
      message.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置出错
      log('请求配置错误', error.message);
      message.error('请求配置错误: ' + error.message);
    }
    
    // 检查是否为CORS错误
    if (error.message && error.message.includes('Network Error')) {
      log('检测到网络错误，可能是CORS问题');
      message.error('网络请求失败，可能是跨域问题，请联系管理员或使用代理');
    }
    
    return Promise.reject(error);
  }
);

// 封装请求方法
const http = {
  get: (url, params = {}) => {
    return instance.get(url, { params });
  },
  
  post: (url, data) => {
    return instance.post(url, data);
  },
  
  put: (url, data) => {
    return instance.put(url, data);
  },
  
  delete: (url, params = {}) => {
    return instance.delete(url, { params });
  },
  
  // 获取基础URL
  getBaseUrl,
  
  // 获取Token
  getToken
};

// 用户相关API
export const userApi = {
  register: (data) => http.post('/user/register', data),
  login: (data) => http.post('/user/login', data),
};

// 判断用户是否已登录
export const isAuthenticated = () => {
  return !!getToken();
};

// 保存用户信息到本地存储
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  log('保存用户信息到localStorage成功');
};

// 获取当前登录用户信息
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  try {
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (e) {
    log('解析当前用户信息失败', e);
    return null;
  }
};

// 退出登录
export const logout = () => {
  log('执行退出登录操作');
  clearUserInfoAndRedirect();
};

export default http;