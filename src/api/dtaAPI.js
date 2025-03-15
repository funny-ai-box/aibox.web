import http from '../utils/http';

// API基础URL常量
const BASE_URL = 'http://106.75.71.65:57460/api';

/**
 * 数据分析助手相关API请求封装
 */
const dtaAPI = {
  /**
   * 上传数据文件
   * @param {FormData} formData - 包含file的表单数据
   * @returns {Promise} - 请求Promise
   */
  uploadFile: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${BASE_URL}/dta/files/upload`, {
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
   * 获取文件详情
   * @param {number} fileId - 文件ID
   * @returns {Promise} - 请求Promise
   */
  getFileDetail: (fileId) => {
    return http.post('/dta/files/dtl', { Id: fileId });
  },
  
  /**
   * 获取文件中的表数据
   * @param {number} fileId - 文件ID
   * @param {string} sheetName - 表名
   * @returns {Promise} - 请求Promise
   */
  getFileData: (fileId, sheetName) => {
    return http.post('/dta/files/datas', { 
      Id: fileId,
      Query: sheetName || ''  // 确保Query字段有值
    });
  },
  
  /**
   * 获取用户文件列表
   * @param {number} pageIndex - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise} - 请求Promise
   */
  getFilesList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/dta/files/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 创建查询分析会话
   * @param {string} sessionName - 会话名称
   * @param {number} fileId - 文件ID 
   * @returns {Promise} - 请求Promise
   */
  createChatSession: (sessionName, fileId) => {
    return http.post('/dta/chat/sessions/create', { 
      SessionName: sessionName,
      FileId: fileId
    });
  },
  
  /**
   * 获取用户会话列表
   * @param {number} pageIndex - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise} - 请求Promise
   */
  getChatSessionsList: (pageIndex = 1, pageSize = 50) => {
    return http.post('/dta/chat/sessions/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 获取会话信息
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  getChatSessionDetail: (sessionId) => {
    return http.post('/dta/chat/sessions/dtl', { Id: sessionId });
  },
  
  /**
   * 会话中对话查询数据
   * @param {number} sessionId - 会话ID
   * @param {string} message - 用户消息内容
   * @returns {Promise} - 请求Promise
   */
  sendChatMessage: (sessionId, message) => {
    return http.post('/dta/chat/sessions/conversation', {
      SessionId: sessionId,
      Message: message,
      Query: message // 添加Query字段，值与Message相同
    });
  },
  
  /**
   * 获取会话对话历史
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  getChatHistory: (sessionId) => {
    return http.post('/dta/chat/sessions/conversation/history', {
      SessionId: sessionId,
      Query: " ", // 确保Query字段有值
      Page: {
            "PageIndex": 1,
            "PageSize": 50
        }
    });
  },
  
  /**
   * 刷新会话中图表的数据
   * @param {number} sqlExecutionId - SQL执行ID
   * @returns {Promise} - 请求Promise
   */
  refreshChartData: (sqlExecutionId) => {
    return http.post('/dta/chat/sessions/conversation/refreshdata', {
      Id: sqlExecutionId,
      Query: " " // 确保Query字段有值
    });
  },
  
  /**
   * 创建BI动态页面
   * @param {string} pageName - 页面名称
   * @param {string} description - 页面描述
   * @param {boolean} isPublic - 是否公开
   * @returns {Promise} - 请求Promise
   */
  createBIPage: (pageName, description = '', isPublic = false) => {
    return http.post('/dta/pages/create', {
      PageName: pageName,
      Description: description,
      IsPublic: isPublic,
      Query: pageName // 添加Query字段，值与PageName相同
    });
  },
  
  /**
   * 给动态页面增加sql数据
   * @param {number} pageId - 页面ID
   * @param {number} sqlExecutionId - SQL执行ID
   * @param {string} title - 组件标题
   * @param {string} description - 组件描述
   * @returns {Promise} - 请求Promise
   */
  addSqlDataToPage: (pageId, sqlExecutionId, title, description = '') => {
    return http.post('/dta/pages/addsqldata', {
      PageId: pageId,
      SqlExecutionIds: [sqlExecutionId],
      Title: title,
      Description: description,
      Query: title // 添加Query字段，值与Title相同
    });
  },
  
  /**
   * 获取动态页面信息
   * @param {number} pageId - 页面ID
   * @returns {Promise} - 请求Promise
   */
  getBIPageDetail: (pageId) => {
    return http.post('/dta/pages/dtl', { 
      Id: pageId,
      Query: " " // 确保Query字段有值
    });
  },
  
  /**
   * 获取用户动态页面列表
   * @param {number} pageIndex - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise} - 请求Promise
   */
  getBIPagesList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/dta/pages/list', {
      PageIndex: pageIndex,
      PageSize: pageSize,
      Query: " " // 确保Query字段有值
    });
  },
  
  /**
   * 删除动态页面
   * @param {number} pageId - 页面ID
   * @returns {Promise} - 请求Promise
   */
  deleteBIPage: (pageId) => {
    return http.post('/dta/pages/delete', { 
      Id: pageId,
      Query: " " // 确保Query字段有值
    });
  },
  
  /**
   * 删除会话（目前API尚未实现，预留接口）
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise 
   */
  deleteChatSession: (sessionId) => {
    return http.post('/dta/chat/sessions/delete', {
      Id: sessionId,
      Query: " " // 确保Query字段有值
    });
  }
};

export default dtaAPI;