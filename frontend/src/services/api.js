import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 健康检查
  healthCheck: () => apiClient.get('/health'),

  // 预测相关
  predictSingle: (resumeData) => apiClient.post('/predict/single', resumeData),
  predictBatch: (resumes) => apiClient.post('/predict/batch', { resumes }),

  // 匹配推荐
  matchCandidates: (requirements) => apiClient.post('/match/candidates', requirements),

  // 简历管理
  getResumeList: (params) => apiClient.get('/resume/list', { params }),
  getResumeDetail: (id) => apiClient.get(`/resume/${id}`),

  // 统计分析
  getSkillStatistics: () => apiClient.get('/statistics/skills'),
  getPositionStatistics: () => apiClient.get('/statistics/positions'),
  getOverviewStatistics: () => apiClient.get('/statistics/overview'),

  // 模型性能
  getModelPerformance: () => apiClient.get('/model/performance'),
};

export default api;
