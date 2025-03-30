import http from '../utils/http';

/**
 * 数据库设计工具相关API请求封装
 */
const databaseDesignAPI = {
  /**
   * 创建设计任务
   * @param {Object} data - 任务数据
   * @returns {Promise} - 请求Promise
   */
  createTask: (data) => {
    return http.post('/datadesign/tasks/create', data);
  },
  
  /**
   * 更新设计任务
   * @param {Object} data - 任务数据
   * @returns {Promise} - 请求Promise
   */
  updateTask: (data) => {
    return http.post('/datadesign/tasks/update', data);
  },
  
  /**
 * 发送文本流式聊天
 * @param {Object} data - 请求数据
 * @param {number} data.TaskId - 任务ID
 * @param {string} data.Message - 用户消息
 * @returns {Promise} - 返回fetch response对象，需要外部处理流式数据
 */
sendChatMessage: async (data) => {
  const token = http.getToken();
  
  try {
    const response = await fetch(`${http.getBaseUrl()}/datadesign/chat/sendtext`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Promise.reject(errorData);
    }
    
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
},

  /**
   * 删除设计任务
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  deleteTask: (taskId) => {
    return http.post('/datadesign/tasks/delete', { Id: taskId });
  },
  
  /**
   * 获取设计任务列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getTaskList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/datadesign/tasks/list', { 
      PageIndex: pageIndex, 
      PageSize: pageSize 
    });
  },
  
  /**
   * 获取设计任务详情
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  getTaskDetail: (taskId) => {
    return http.post('/datadesign/tasks/dtl', { Id: taskId });
  },
  
  /**
   * 获取聊天历史
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  getChatHistory: (taskId) => {
    return http.post('/datadesign/chat/history', { Id: taskId });
  },
  
  /**
   * 获取表列表
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  getTableList: (taskId) => {
    return http.post('/datadesign/tables/list', { Id: taskId });
  },
  
  /**
   * 获取表详情
   * @param {number} tableId - 表ID
   * @returns {Promise} - 请求Promise
   */
  getTableDetail: (tableId) => {
    return http.post('/datadesign/tables/dtl', { Id: tableId });
  },
  
  /**
   * 获取支持的编程语言和数据库
   * @returns {Promise} - 请求Promise
   */
  getSupportedLanguages: () => {
    return http.post('/datadesign/code/supportlangs');
  },
  
  /**
   * 生成DDL脚本
   * @param {Object} data - 请求数据
   * @returns {Promise} - 请求Promise
   */
  generateDDL: (data) => {
    return http.post('/datadesign/code/ddl', data);
  },
  
  /**
   * 获取代码模板列表
   * @returns {Promise} - 请求Promise
   */
  getCodeTemplateList: () => {
    return http.post('/datadesign/code/template/list');
  },
  
  /**
   * 获取代码模板详情
   * @param {number} templateId - 模板ID
   * @returns {Promise} - 请求Promise
   */
  getCodeTemplateDetail: (templateId) => {
    return http.post('/datadesign/code/template/dtls', { Id: templateId });
  },
  
  /**
   * 创建代码模板
   * @param {Object} data - 模板数据
   * @returns {Promise} - 请求Promise
   */
  createCodeTemplate: (data) => {
    return http.post('/datadesign/code/template/create', data);
  },
  
  /**
   * 删除代码模板
   * @param {number} templateId - 模板ID
   * @returns {Promise} - 请求Promise
   */
  deleteCodeTemplate: (templateId) => {
    return http.post('/datadesign/code/template/delete', { Id: templateId });
  },
  
  /**
   * 生成代码
   * @param {Object} data - 请求数据
   * @returns {Promise} - 请求Promise
   */
  generateCode: (data) => {
    return http.post('/datadesign/code/generate', data);
  },
  
  /**
   * 获取示例要求
   * @param {Object} data - 语言和数据库类型
   * @returns {Promise} - 请求Promise
   */
  getTemplateExample: (data) => {
    return http.post('/datadesign/code/template/example', data);
  }
};

export default databaseDesignAPI;