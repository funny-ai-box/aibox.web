import http from '../utils/http';

// API基础URL常量
const BASE_URL = 'http://106.75.71.65:57460/api';

/**
 * 视频混剪工具相关API请求封装
 */
const videoMixerAPI = {
  /**
   * 创建混剪项目
   * @param {Object} data - 项目数据
   * @returns {Promise} - 请求Promise
   */
  createProject: (data) => {
    return http.post('/videomixer/projects/create', data);
  },
  
  /**
   * 上传源视频
   * @param {number} projectId - 项目ID
   * @param {File} videoFile - 视频文件
   * @returns {Promise} - 请求Promise
   */
  uploadVideo: async (projectId, videoFile) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const formData = new FormData();
      formData.append('videoFile', videoFile);
      formData.append('projectId', projectId);
      
      const response = await fetch(`${BASE_URL}/videomixer/projects/uploadvideos`, {
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
   * 上传背景音乐
   * @param {number} projectId - 项目ID
   * @param {File} musicFile - 音乐文件
   * @returns {Promise} - 请求Promise
   */
  uploadMusic: async (projectId, musicFile) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const formData = new FormData();
      formData.append('musicFile', musicFile);
      formData.append('projectId', projectId);
      
      const response = await fetch(`${BASE_URL}/videomixer/projects/uploadmusic`, {
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
   * 获取项目详情
   * @param {number} projectId - 项目ID
   * @returns {Promise} - 请求Promise
   */
  getProjectDetail: (projectId) => {
    return http.post('/videomixer/projects/dtl', { Id: projectId });
  },
  
  /**
   * 获取用户的项目列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getProjectsList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/videomixer/projects/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 开始生成视频
   * @param {number} projectId - 项目ID
   * @returns {Promise} - 请求Promise
   */
  generateVideo: (projectId) => {
    return http.post('/videomixer/projects/video/generate-video', { Id: projectId });
  }
};

export default videoMixerAPI;