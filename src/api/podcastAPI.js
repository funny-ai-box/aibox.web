import http from '../utils/http';

// API基础URL常量
const BASE_URL = 'http://106.75.71.65:57460/api';

/**
 * 播客工具相关API请求封装
 */
const podcastAPI = {
  /**
   * 创建播客任务
   * @param {Object} data - 播客任务数据
   * @returns {Promise} - 请求Promise
   */
  createTask: (data) => {
    return http.post('/podcast/tasks/create', data);
  },
  
  /**
   * 上传文档到播客任务
   * @param {FormData} formData - 包含文件和任务ID的表单数据
   * @returns {Promise} - 请求Promise
   */
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${BASE_URL}/podcast/tasks/contents/upload`, {
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
   * 导入文本到播客任务
   * @param {Object} data - 包含任务ID和文本内容的数据
   * @returns {Promise} - 请求Promise
   */
  importText: (data) => {
    return http.post('/podcast/tasks/contents/text', data);
  },
  
  /**
   * 获取播客文档内容详情
   * @param {number} contentId - 内容ID
   * @returns {Promise} - 请求Promise
   */
  getContentDetail: (contentId) => {
    return http.post('/podcast/tasks/contents/dtl', { Id: contentId });
  },
  
  /**
   * 删除播客内容项
   * @param {number} contentId - 内容ID
   * @returns {Promise} - 请求Promise
   */
  deleteContent: (contentId) => {
    return http.post('/podcast/tasks/contents/delete', { Id: contentId });
  },
  
  /**
   * 获取播客任务列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认10
   * @returns {Promise} - 请求Promise
   */
  getTaskList: (pageIndex = 1, pageSize = 10) => {
    return http.post('/podcast/tasks/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 删除播客任务
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  deleteTask: (taskId) => {
    return http.post('/podcast/tasks/delete', { Id: taskId });
  },
  
  /**
   * 开始生成播客
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  generatePodcast: (taskId) => {
    return http.post('/podcast/tasks/generate', { Id: taskId });
  },
  
  /**
   * 获取播客任务详情
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  getTaskDetail: (taskId) => {
    return http.post('/podcast/tasks/dtl', { Id: taskId });
  }
};

export default podcastAPI;