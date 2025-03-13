import { message } from 'antd';

const BASE_URL = 'http://106.75.71.65:57460/api';

// 获取存储的token
const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    return JSON.parse(userInfo).accessToken;
  }
  return null;
};

// 清除用户信息并跳转到登录页
const clearUserInfoAndRedirect = () => {
  localStorage.removeItem('userInfo');
  // 使用replace避免用户通过浏览器返回按钮回到需要认证的页面
  window.location.replace('/login');
};

// 基础请求方法
const request = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // 如果有token，添加到请求头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    // 处理401未授权错误（token失效或未登录）
    if (response.status === 401) {
      message.error('登录已过期，请重新登录');
      clearUserInfoAndRedirect();
      return Promise.reject('登录已过期');
    }
    
    // 解析JSON响应
    const data = await response.json();
    
    // 如果接口返回的状态码不是200，则视为请求失败
    if (data.code !== 200) {
      message.error(data.message || '请求失败');
      return Promise.reject(data);
    }
    
    return data;
  } catch (error) {
    message.error('网络请求失败，请检查网络连接');
    return Promise.reject(error);
  }
};

// 封装常用的请求方法
const http = {
  get: (url, params = {}) => {
    // 构建查询字符串
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return request(fullUrl, {
      method: 'GET',
    });
  },
  
  post: (url, data) => {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put: (url, data) => {
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: (url) => {
    return request(url, {
      method: 'DELETE',
    });
  },
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
};

// 获取当前登录用户信息
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// 退出登录
export const logout = () => {
  clearUserInfoAndRedirect();
};

export default http;