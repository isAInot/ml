"""
预测服务模块
"""
import pandas as pd
import numpy as np
import joblib


class ResumePredictor:
    """简历预测器"""
    
    def __init__(self, model_path):
        """加载模型"""
        data = joblib.load(model_path)
        self.model = data['model']
        self.feature_names = data['feature_names']
        self.data_processor = data['data_processor']
    
    def predict_single(self, resume_data):
        """预测单条简历"""
        # 转换为DataFrame
        df = pd.DataFrame([resume_data])
        
        # 特征工程
        features, _ = self.data_processor.process_training_data(df)
        
        # 确保特征顺序一致
        features = features.reindex(columns=self.feature_names, fill_value=0)
        
        # 预测
        prediction = self.model.predict(features)[0]
        probability = self.model.predict_proba(features)[0]
        
        result = {
            'prediction': '通过' if prediction == 1 else '不通过',
            'confidence': float(probability[1]),
            'probability_pass': float(probability[1]),
            'probability_fail': float(probability[0])
        }
        
        return result
    
    def predict_batch(self, resume_list):
        """批量预测"""
        results = []
        
        for resume in resume_list:
            try:
                result = self.predict_single(resume)
                result['resume_id'] = resume.get('简历编号', 'N/A')
                result['name'] = resume.get('姓名', 'N/A')
                results.append(result)
            except Exception as e:
                results.append({
                    'resume_id': resume.get('简历编号', 'N/A'),
                    'name': resume.get('姓名', 'N/A'),
                    'error': str(e)
                })
        
        return results
    
    def match_candidates(self, job_requirements, candidates_df, top_n=10):
        """岗位匹配推荐"""
        # 计算匹配度
        match_scores = []
        
        for idx, candidate in candidates_df.iterrows():
            score = self._calculate_match_score(job_requirements, candidate)
            match_scores.append({
                'resume_id': candidate.get('简历编号'),
                'name': candidate.get('姓名'),
                'age': candidate.get('年龄'),
                'position': candidate.get('意向岗位'),
                'education': candidate.get('学历层次'),
                'match_score': score,
                'email': candidate.get('邮箱'),
                'phone': candidate.get('电话')
            })
        
        # 排序
        match_scores.sort(key=lambda x: x['match_score'], reverse=True)
        
        return match_scores[:top_n]
    
    def _calculate_match_score(self, requirements, candidate):
        """计算匹配度分数"""
        score = 0
        max_score = 0
        
        # 岗位匹配
        max_score += 20
        if requirements.get('position') == candidate.get('意向岗位'):
            score += 20
        
        # 学历匹配
        max_score += 15
        education_rank = {'专科': 1, '本科': 2, '硕士': 3, '博士': 4}
        req_edu = education_rank.get(requirements.get('education', '本科'), 2)
        cand_edu = education_rank.get(candidate.get('学历层次', '本科'), 2)
        if cand_edu >= req_edu:
            score += 15
        elif cand_edu == req_edu - 1:
            score += 10
        
        # 院校匹配
        max_score += 10
        school_rank = {'普通高校': 1, '211高校': 2, '985高校': 3}
        req_school = school_rank.get(requirements.get('school', '普通高校'), 1)
        cand_school = school_rank.get(candidate.get('院校类别', '普通高校'), 1)
        if cand_school >= req_school:
            score += 10
        elif cand_school == req_school - 1:
            score += 5
        
        # 技能匹配
        max_score += 30
        required_skills = requirements.get('skills', [])
        if required_skills:
            candidate_skills = self._extract_all_skills(candidate)
            matched_skills = len(set(required_skills) & set(candidate_skills))
            score += min(30, (matched_skills / len(required_skills)) * 30)
        
        # 经验匹配
        max_score += 15
        req_exp = requirements.get('experience_years', 0)
        cand_exp = self._extract_total_experience(candidate)
        if cand_exp >= req_exp:
            score += 15
        elif cand_exp >= req_exp * 0.7:
            score += 10
        
        # 项目经验
        max_score += 10
        project_count = (
            candidate.get('小规模项目', 0) +
            candidate.get('中规模项目', 0) +
            candidate.get('大规模项目', 0)
        )
        if project_count >= 5:
            score += 10
        elif project_count >= 3:
            score += 7
        elif project_count >= 1:
            score += 4
        
        # 归一化到0-100
        return (score / max_score * 100) if max_score > 0 else 0
    
    def _extract_all_skills(self, candidate):
        """提取候选人所有技能"""
        skills = []
        skill_columns = [
            '编程语言', '前端技术', '后端技术', '数据库',
            '云计算/运维', '数据与算法', '移动开发', '测试工具'
        ]
        
        for col in skill_columns:
            value = candidate.get(col)
            if pd.notna(value) and value != 'NULL':
                skills.extend([s.strip() for s in str(value).split(',')])
        
        return skills
    
    def _extract_total_experience(self, candidate):
        """提取总工作年限"""
        total = 0
        exp_map = {
            '5年以上': 6,
            '3―5年': 4,
            '1―3年': 2,
            '1年以下': 0.5
        }
        
        for col in ['小型企业工作经验', '中型企业工作经验', '大型企业工作经验']:
            value = candidate.get(col)
            if pd.notna(value):
                total += exp_map.get(str(value), 0)
        
        return total
    
    def get_feature_importance(self):
        """获取特征重要性"""
        importance = None
        
        # 尝试直接获取特征重要性
        if hasattr(self.model, 'feature_importances_'):
            importance = self.model.feature_importances_
        # 处理线性模型（使用系数绝对值）
        elif hasattr(self.model, 'coef_'):
            importance = np.abs(self.model.coef_[0])
        # 处理集成模型（VotingClassifier）
        elif hasattr(self.model, 'estimators_'):
            # 从子模型中提取特征重要性并平均
            importances_list = []
            for estimator in self.model.estimators_:
                if hasattr(estimator, 'feature_importances_'):
                    importances_list.append(estimator.feature_importances_)
                elif hasattr(estimator, 'coef_'):
                    importances_list.append(np.abs(estimator.coef_[0]))
            
            if importances_list:
                # 计算平均重要性
                importance = np.mean(importances_list, axis=0)
        
        # 如果还是没有找到，返回空列表
        if importance is None:
            return []
        
        feature_imp = [
            {'feature': name, 'importance': float(imp)}
            for name, imp in zip(self.feature_names, importance)
        ]
        
        feature_imp.sort(key=lambda x: x['importance'], reverse=True)
        return feature_imp[:20]
