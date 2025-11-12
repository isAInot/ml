"""
数据预处理和特征工程模块
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import re


class ResumeDataProcessor:
    """简历数据处理器"""
    
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.skill_list = []
        self.tech_list = []
        
    def parse_skills(self, skill_str, proficiency_str=None):
        """解析技能列表"""
        if pd.isna(skill_str) or skill_str == 'NULL':
            return [], []
        
        skills = [s.strip() for s in str(skill_str).split(',')]
        
        if proficiency_str and not pd.isna(proficiency_str) and proficiency_str != 'NULL':
            proficiencies = [p.strip() for p in str(proficiency_str).split(',')]
        else:
            proficiencies = ['掌握'] * len(skills)
            
        return skills, proficiencies
    
    def proficiency_to_score(self, proficiency):
        """将熟练度转换为数值"""
        mapping = {
            '精通': 5,
            '熟练': 4,
            '掌握': 3,
            '了解': 2,
            '无': 0,
            'NULL': 0
        }
        return mapping.get(proficiency, 1)
    
    def extract_years(self, year_str):
        """提取工作年限数值"""
        if pd.isna(year_str) or year_str == 'NULL':
            return 0
        
        if '5年以上' in str(year_str):
            return 6
        elif '3―5年' in str(year_str):
            return 4
        elif '1―3年' in str(year_str):
            return 2
        elif '1年以下' in str(year_str):
            return 0.5
        return 0
    
    def process_training_data(self, df):
        """处理训练数据"""
        df = df.copy()
        
        # 基础特征
        features = pd.DataFrame()
        features['年龄'] = df['年龄']
        
        # 学历编码
        education_map = {'专科': 1, '本科': 2, '硕士': 3, '博士': 4}
        features['学历层次_编码'] = df['学历层次'].map(education_map).fillna(1)
        
        # 院校类别编码
        school_map = {'普通高校': 1, '211高校': 2, '985高校': 3}
        features['院校类别_编码'] = df['院校类别'].map(school_map).fillna(1)
        
        # 专业类别
        features['专业_计算机类'] = (df['专业类别'] == '计算机类').astype(int)
        
        # 英语水平编码
        english_map = {'无': 0, '英语四级': 1, '英语六级': 2, '英语专业': 3}
        features['英语水平_编码'] = df['英语水平'].map(english_map).fillna(0)
        
        # 编程语言特征
        features['编程语言_数量'] = df['编程语言'].apply(
            lambda x: len(str(x).split(',')) if pd.notna(x) and x != 'NULL' else 0
        )
        
        # 编程语言平均熟练度
        prog_scores = []
        for idx, row in df.iterrows():
            skills, profs = self.parse_skills(row['编程语言'], row['编程语言熟练度'])
            if skills:
                scores = [self.proficiency_to_score(p) for p in profs]
                prog_scores.append(np.mean(scores))
            else:
                prog_scores.append(0)
        features['编程语言_平均熟练度'] = prog_scores
        
        # 技术栈特征
        tech_columns = [
            ('前端技术', '前端技术熟练度'),
            ('后端技术', '后端技术熟练度'),
            ('数据库', '数据库熟练度'),
            ('云计算/运维', '云计算/运维熟练度'),
            ('数据与算法', '数据与算法熟练度'),
            ('移动开发', '移动开发熟练度'),
            ('测试工具', '测试工具熟练度')
        ]
        
        for tech_col, prof_col in tech_columns:
            tech_name = tech_col.replace('技术', '').replace('工具', '')
            
            # 技能数量
            features[f'{tech_name}_数量'] = df[tech_col].apply(
                lambda x: len(str(x).split(',')) if pd.notna(x) and x != 'NULL' else 0
            )
            
            # 平均熟练度
            tech_scores = []
            for idx, row in df.iterrows():
                skills, profs = self.parse_skills(row[tech_col], row[prof_col])
                if skills:
                    scores = [self.proficiency_to_score(p) for p in profs]
                    tech_scores.append(np.mean(scores))
                else:
                    tech_scores.append(0)
            features[f'{tech_name}_平均熟练度'] = tech_scores
        
        # 工作经验特征
        work_exp_columns = ['小型企业工作经验', '中型企业工作经验', '大型企业工作经验']
        for col in work_exp_columns:
            features[col + '_年数'] = df[col].apply(self.extract_years)
        
        features['总工作年限'] = (
            features['小型企业工作经验_年数'] + 
            features['中型企业工作经验_年数'] + 
            features['大型企业工作经验_年数']
        )
        
        # 项目经验特征
        features['小规模项目'] = df['小规模项目'].fillna(0)
        features['中规模项目'] = df['中规模项目'].fillna(0)
        features['大规模项目'] = df['大规模项目'].fillna(0)
        features['总项目数'] = features['小规模项目'] + features['中规模项目'] + features['大规模项目']
        
        # 项目规模加权分数
        features['项目质量分'] = (
            features['小规模项目'] * 1 + 
            features['中规模项目'] * 3 + 
            features['大规模项目'] * 5
        )
        
        # 综合技能分数
        features['技能总分'] = (
            features['编程语言_平均熟练度'] * 2 +
            features['前端_平均熟练度'] +
            features['后端_平均熟练度'] +
            features['数据库_平均熟练度'] +
            features['云计算/运维_平均熟练度'] +
            features['数据与算法_平均熟练度'] +
            features['移动开发_平均熟练度'] +
            features['测试_平均熟练度']
        )
        
        # 岗位编码
        position_dummies = pd.get_dummies(df['意向岗位'], prefix='岗位')
        features = pd.concat([features, position_dummies], axis=1)
        
        # 目标变量（仅在训练时使用，预测时可能没有）
        if '筛选结果' in df.columns:
            y = (df['筛选结果'] == '通过').astype(int)
        else:
            y = None
        
        return features, y
    
    def process_single_resume(self, resume_dict):
        """处理单条简历数据"""
        df = pd.DataFrame([resume_dict])
        features, _ = self.process_training_data(df)
        return features
    
    def get_feature_names(self, df):
        """获取特征名称"""
        features, _ = self.process_training_data(df)
        return features.columns.tolist()
