import http from '../utils/http';

/**
 * 社交媒体内容智能创作相关API请求封装
 */
const socialContentAPI = {
  /**
   * 获取所有社交平台的定义
   * @returns {Promise} - 请求Promise
   */
  getPlatformList: () => {
    return http.post('/socialcontent/platform/list', {});
  },
  
  /**
   * 获取平台提示词配置列表
   * @param {number} platformId - 平台ID
   * @returns {Promise} - 请求Promise
   */
  getSysPromptList: (platformId) => {
    return http.post('/socialcontent/platform/sys-prompt/list', { Id: platformId });
  },
  
  /**
   * 添加用户自定义平台提示词
   * @param {Object} data - 提示词数据
   * @returns {Promise} - 请求Promise
   */
  addUserPrompt: (data) => {
    return http.post('/socialcontent/platform/user-prompt/add', data);
  },
  
  /**
   * 修改用户自定义平台提示词
   * @param {Object} data - 提示词数据
   * @returns {Promise} - 请求Promise
   */
  updateUserPrompt: (data) => {
    return http.post('/socialcontent/platform/user-prompt/update', data);
  },
  
  /**
   * 删除用户自定义平台提示词
   * @param {number} id - 提示词ID
   * @returns {Promise} - 请求Promise
   */
  deleteUserPrompt: (id) => {
    return http.post('/socialcontent/platform/user-prompt/delete', { Id: id });
  },
  
  /**
   * 获取用户自定义平台提示词列表
   * @param {number} platformId - 平台ID
   * @returns {Promise} - 请求Promise
   */
  getUserPromptList: (platformId) => {
    return http.post('/socialcontent/platform/user-prompt/list', { Id: platformId });
  },
  
  /**
   * 获取用户自定义平台提示词详情
   * @param {number} id - 提示词ID
   * @returns {Promise} - 请求Promise
   */
  getUserPromptDetail: (id) => {
    return http.post('/socialcontent/platform/user-prompt/dtl', { Id: id });
  },
  
  /**
   * 创建文案生成任务(流式)
   * @param {Object} data - 任务数据
   * @returns {Promise} - 返回fetch response对象，需要外部处理流式数据
   */
  createTaskStream: async (data) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    return fetch(`${http.getBaseUrl()}/socialcontent/task/add/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  },
  
  /**
   * 创建文案生成任务（含图片上传）
   * @param {FormData} formData - 包含任务数据和图片的表单数据
   * @returns {Promise} - 请求Promise
   */
  createTaskWithImages: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${http.getBaseUrl()}/socialcontent/task/add`, {
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
   * 获取任务详情
   * @param {number} id - 任务ID
   * @returns {Promise} - 请求Promise
   */
  getTaskDetail: (id) => {
    return http.post('/socialcontent/task/dtl', { Id: id });
  },
  
  /**
   * 获取用户任务列表
   * @param {number} pageIndex - 页码
   * @param {number} pageSize - 每页条数
   * @returns {Promise} - 请求Promise
   */
  getTaskList: (pageIndex = 1, pageSize = 28) => {
    return http.post('/socialcontent/task/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  }
};

export default socialContentAPI;