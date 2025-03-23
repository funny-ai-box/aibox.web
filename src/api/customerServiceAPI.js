import http from '../utils/http';

// API基础URL常量
const BASE_URL = 'http://106.75.71.65:57460/api';

/**
 * 智能客服相关API请求封装
 */
const customerServiceAPI = {
  /**
   * 创建商品
   * @param {FormData} formData - 包含商品信息和图片的表单数据
   * @returns {Promise} - 请求Promise
   */
  createProduct: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${BASE_URL}/customerservice/prod/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        return Promise.reject(result);
      }
      
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  /**
   * 更新商品信息
   * @param {Object} data - 商品数据
   * @returns {Promise} - 请求Promise
   */
  updateProduct: (data) => {
    return http.post('/customerservice/prod/update', data);
  },
  
  /**
   * 删除商品
   * @param {number} productId - 商品ID
   * @returns {Promise} - 请求Promise
   */
  deleteProduct: (productId) => {
    return http.post('/customerservice/prod/delete', { Id: productId });
  },
  
  /**
   * 获取商品列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getProductList: (pageIndex = 1, pageSize = 20, query = '') => {
    return http.post('/customerservice/prod/list', {
      PageIndex: pageIndex,
      PageSize: pageSize,
      Keyword: query
    });
  },
  
  /**
   * 获取商品详情
   * @param {number} productId - 商品ID
   * @returns {Promise} - 请求Promise
   */
  getProductDetail: (productId) => {
    return http.post('/customerservice/prod/dtl', { Id: productId });
  },
  
  /**
   * 上传商品图片
   * @param {FormData} formData - 包含图片和商品ID的表单数据
   * @returns {Promise} - 请求Promise
   */
  uploadProductImage: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${BASE_URL}/customerservice/prod/image/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        return Promise.reject(result);
      }
      
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  /**
   * 删除商品图片
   * @param {number} imageId - 图片ID
   * @returns {Promise} - 请求Promise
   */
  deleteProductImage: (imageId) => {
    return http.post('/customerservice/prod/image/delete', { Id: imageId });
  },
  
  /**
   * 创建聊天会话
   * @param {Object} data - 会话数据
   * @param {string} data.SessionName - 会话名称
   * @returns {Promise} - 请求Promise
   */
  createChatSession: (data = {}) => {
    return http.post('/customerservice/session/create', data);
  },
  
  /**
   * 获取聊天会话列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getChatSessionList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/customerservice/session/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 获取聊天历史记录
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  getChatHistory: (sessionId) => {
    return http.post('/customerservice/session/history', { SessionId: sessionId });
  },
  
  /**
   * 发送文本消息 (调试用)
   * @param {number} sessionId - 会话ID
   * @param {string} message - 消息内容
   * @returns {Promise} - 请求Promise
   */
  sendTextMessage: (sessionId, message) => {
    return http.post('/customerservice/message/send', {
      SessionId: sessionId,
      Content: message
    });
  },
  
  /**
   * 发送图片消息 (调试用)
   * @param {FormData} formData - 包含图片和会话ID的表单数据
   * @returns {Promise} - 请求Promise
   */
  sendImageMessage: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${BASE_URL}/customerservice/message/sendimage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        return Promise.reject(result);
      }
      
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  /**
   * 获取WebSocket连接URL
   * @returns {string} - WebSocket URL
   */
  getWebSocketUrl: () => {
    return 'wss://106.75.71.65:57460/ws/customerservice/chat';
  }
};

export default customerServiceAPI;