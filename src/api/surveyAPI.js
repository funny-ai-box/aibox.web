import http from '../utils/http';

/**
 * 问卷调查相关API请求封装
 */
const surveyAPI = {
  /**
   * 创建问卷任务
   * @param {Object} data - 问卷任务数据
   * @returns {Promise} - 请求Promise
   */
  createTask: (data) => {
    return http.post('/survey/tasks/create', data);
  },
  
  /**
   * 更新问卷任务基本信息
   * @param {Object} data - 问卷任务数据
   * @returns {Promise} - 请求Promise
   */
  updateTask: (data) => {
    return http.post('/survey/tasks/update', data);
  },
  
  /**
   * 删除问卷任务
   * @param {number} taskId - 问卷任务ID
   * @returns {Promise} - 请求Promise
   */
  deleteTask: (taskId) => {
    return http.post('/survey/tasks/delete', { Id: taskId });
  },
  
  /**
   * 获取问卷任务列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getTaskList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/survey/tasks/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 获取问卷任务详情
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  getTaskDetail: (taskId) => {
    return http.post('/survey/tasks/detail', { Id: taskId });
  },
  
  /**
   * AI设计问卷（流式）
   * @param {Object} data - 包含TaskId和Message的对象
   * @returns {Promise} - 返回fetch response对象，需要外部处理流式数据
   */
  aiDesignSurveyStream: async (data) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    return fetch(`${http.getBaseUrl()}/survey/design/ai/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  },
  
  /**
   * 获取问卷设计历史
   * @param {number} taskId - 任务ID
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认10
   * @returns {Promise} - 请求Promise
   */
  getDesignHistory: (taskId, pageIndex = 1, pageSize = 10) => {
    return http.post('/survey/design/history', {
      TaskId: taskId,
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 发布问卷任务
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  publishTask: (taskId) => {
    return http.post('/survey/tasks/publish', { Id: taskId });
  },
  
  /**
   * 关闭问卷任务
   * @param {number} taskId - 任务ID
   * @returns {Promise} - 请求Promise
   */
  closeTask: (taskId) => {
    return http.post('/survey/tasks/close', { Id: taskId });
  },
  
  /**
   * 通过共享码获取问卷任务（GET请求）
   * @param {string} shareCode - 共享码
   * @returns {Promise} - 请求Promise
   */
  getTaskByShareCode: (shareCode) => {
    return http.get(`/survey/share?shareCode=${shareCode}`);
  },
  
  /**
   * 提交问卷回答数据
   * @param {Object} data - 包含TaskId和FieldValues的对象
   * @returns {Promise} - 请求Promise
   */
  submitResponse: (data) => {
    return http.post('/survey/response/submit', data);
  },
  
  /**
   * 获取问卷回答列表
   * @param {number} taskId - 任务ID
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认10
   * @returns {Promise} - 请求Promise
   */
  getResponseList: (taskId, pageIndex = 1, pageSize = 10) => {
    return http.post('/survey/response/list', {
      TaskId: taskId,
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 获取问卷回答详情
   * @param {number} responseId - 回答ID
   * @returns {Promise} - 请求Promise
   */
  getResponseDetail: (responseId) => {
    return http.post('/survey/response/detail', { Id: responseId });
  }
};

export default surveyAPI;