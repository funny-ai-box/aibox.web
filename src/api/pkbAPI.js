import http from '../utils/http';

// API基础URL常量
const BASE_URL = 'http://106.75.71.65:57460/api';

/**
 * 个人知识库相关API请求封装
 */
const pkbAPI = {
  /**
   * 上传文档
   * @param {FormData} formData - 包含file和title的表单数据
   * @returns {Promise} - 请求Promise
   */
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${BASE_URL}/pkb/documents/upload`, {
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
   * 导入网页URL（预留）
   * @param {Object} data - URL数据
   * @returns {Promise} - 请求Promise
   */
  importUrl: (data) => {
    return http.post('/pkb/documents/importurl', data);
  },
  
  /**
   * 获取用户的所有文档列表
   * @returns {Promise} - 请求Promise
   */
  getDocumentsList: () => {
    return http.post('/pkb/documents/list', {});
  },
  
  /**
   * 获取文档详情
   * @param {number} documentId - 文档ID
   * @returns {Promise} - 请求Promise
   */
  getDocumentDetail: (documentId) => {
    return http.post('/pkb/documents/dtl', { Id: documentId });
  },
  
  /**
   * 删除文档
   * @param {number} documentId - 文档ID
   * @returns {Promise} - 请求Promise
   */
  deleteDocument: (documentId) => {
    return http.post('/pkb/documents/delete', { DocumentId: documentId });
  },
  
  /**
   * 创建聊天会话
   * @param {string} sessionName - 会话名称，不指定将使用系统默认
   * @param {string} prompt - 设定机器人的角色，不指定将使用系统默认
   * @returns {Promise} - 请求Promise
   */
  createChatSession: (sessionName = '', prompt = '') => {
    return http.post('/pkb/chat/sessions/create', { 
      SessionName: sessionName, 
      Prompt: prompt 
    });
  },
  
  /**
   * 更新聊天会话（预留）
   * @param {number} sessionId - 会话ID
   * @param {string} sessionName - 新的会话名称
   * @param {string} prompt - 新的prompt
   * @returns {Promise} - 请求Promise
   */
  updateChatSession: (sessionId, sessionName, prompt) => {
    return http.post('/pkb/chat/sessions/update', {
      SessionId: sessionId,
      SessionName: sessionName,
      Prompt: prompt
    });
  },
  
  /**
   * 删除聊天会话（预留）
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  deleteChatSession: (sessionId) => {
    return http.post('/pkb/chat/sessions/delete', { SessionId: sessionId });
  },
  
  /**
   * 获取用户的所有聊天会话
   * @returns {Promise} - 请求Promise
   */
  getChatSessionsList: () => {
    return http.post('/pkb/chat/sessions/list', {});
  },
  
  /**
   * 分页获取聊天历史
   * @param {number} sessionId - 会话ID
   * @param {number} pageSize - 页大小
   * @param {number|null} lastId - 上次加载的最后一条记录ID，首次加载不传
   * @returns {Promise} - 请求Promise
   */
  getChatHistory: (sessionId, pageSize = 20, lastId = null) => {
    return http.post('/pkb/chat/sessions/history/paged', {
      SessionId: sessionId,
      PageSize: pageSize,
      LastId: lastId
    });
  },
  
  /**
   * 发送聊天消息（流式）
   * @param {number} sessionId - 会话ID
   * @param {string} message - 消息内容
   * @returns {Promise} - 返回fetch response对象，需要外部处理流式数据
   */
  sendChatMessage: (sessionId, message) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    return fetch(`${BASE_URL}/pkb/chat/sessions/chatstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        SessionId: sessionId,
        Message: message
      })
    });
  }
};

export default pkbAPI;