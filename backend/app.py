"""
Flask API 主应用
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import sys

# 添加路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.predictor import ResumePredictor

app = Flask(__name__)
CORS(app)

# 加载模型
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'trained_models', 'resume_model.pkl')
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Chinese_resume_data.csv')

predictor = None
resume_df = None


def init_app():
    """初始化应用"""
    global predictor, resume_df
    
    if os.path.exists(MODEL_PATH):
        predictor = ResumePredictor(MODEL_PATH)
        print(f"✓ 模型加载成功: {MODEL_PATH}")
    else:
        print(f"✗ 模型文件不存在: {MODEL_PATH}")
        print("  请先运行 python train_model.py 训练模型")
    
    if os.path.exists(DATA_PATH):
        resume_df = pd.read_csv(DATA_PATH)
        print(f"✓ 数据加载成功: {len(resume_df)} 条记录")
    else:
        print(f"✗ 数据文件不存在: {DATA_PATH}")


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'model_loaded': predictor is not None,
        'data_loaded': resume_df is not None
    })


@app.route('/api/predict/single', methods=['POST'])
def predict_single():
    """单条简历预测"""
    if predictor is None:
        return jsonify({'error': '模型未加载'}), 500
    
    try:
        resume_data = request.json
        result = predictor.predict_single(resume_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """批量简历预测"""
    if predictor is None:
        return jsonify({'error': '模型未加载'}), 500
    
    try:
        resume_list = request.json.get('resumes', [])
        results = predictor.predict_batch(resume_list)
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/match/candidates', methods=['POST'])
def match_candidates():
    """岗位匹配推荐"""
    if predictor is None or resume_df is None:
        return jsonify({'error': '模型或数据未加载'}), 500
    
    try:
        job_requirements = request.json
        top_n = job_requirements.get('top_n', 10)
        
        # 过滤候选人
        candidates = resume_df.copy()
        
        # 按岗位过滤
        if job_requirements.get('position'):
            candidates = candidates[candidates['意向岗位'] == job_requirements['position']]
        
        results = predictor.match_candidates(job_requirements, candidates, top_n)
        return jsonify({'candidates': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/resume/list', methods=['GET'])
def get_resume_list():
    """获取简历列表"""
    if resume_df is None:
        return jsonify({'error': '数据未加载'}), 500
    
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 20))
        position = request.args.get('position', '')
        
        # 过滤
        filtered_df = resume_df.copy()
        if position:
            filtered_df = filtered_df[filtered_df['意向岗位'] == position]
        
        # 分页
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        # 转换为字典并处理NaN值
        resumes = filtered_df.iloc[start_idx:end_idx].fillna('NULL').to_dict('records')
        total = len(filtered_df)
        
        return jsonify({
            'resumes': resumes,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/resume/<int:resume_id>', methods=['GET'])
def get_resume_detail(resume_id):
    """获取简历详情"""
    if resume_df is None:
        return jsonify({'error': '数据未加载'}), 500
    
    try:
        resume = resume_df[resume_df['简历编号'] == resume_id].to_dict('records')
        if resume:
            return jsonify(resume[0])
        else:
            return jsonify({'error': '简历不存在'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/statistics/skills', methods=['GET'])
def get_skill_statistics():
    """技能统计"""
    if resume_df is None:
        return jsonify({'error': '数据未加载'}), 500
    
    try:
        skill_columns = ['编程语言', '前端技术', '后端技术', '数据库', '云计算/运维', '数据与算法', '移动开发', '测试工具']
        skill_stats = {}
        
        for col in skill_columns:
            skills = []
            for value in resume_df[col].dropna():
                if value != 'NULL':
                    skills.extend([s.strip() for s in str(value).split(',')])
            
            from collections import Counter
            skill_count = Counter(skills)
            skill_stats[col] = [
                {'skill': k, 'count': v}
                for k, v in skill_count.most_common(10)
            ]
        
        return jsonify(skill_stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/statistics/positions', methods=['GET'])
def get_position_statistics():
    """岗位统计"""
    if resume_df is None:
        return jsonify({'error': '数据未加载'}), 500
    
    try:
        position_stats = resume_df['意向岗位'].value_counts().to_dict()
        
        # 通过率统计
        pass_rate = {}
        for position in position_stats.keys():
            pos_df = resume_df[resume_df['意向岗位'] == position]
            pass_count = (pos_df['筛选结果'] == '通过').sum()
            pass_rate[position] = pass_count / len(pos_df) if len(pos_df) > 0 else 0
        
        result = [
            {
                'position': pos,
                'count': count,
                'pass_rate': pass_rate.get(pos, 0)
            }
            for pos, count in position_stats.items()
        ]
        
        return jsonify({'positions': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/statistics/overview', methods=['GET'])
def get_overview_statistics():
    """概览统计"""
    if resume_df is None:
        return jsonify({'error': '数据未加载'}), 500
    
    try:
        total_resumes = len(resume_df)
        pass_count = (resume_df['筛选结果'] == '通过').sum()
        pass_rate = pass_count / total_resumes
        
        education_stats = resume_df['学历层次'].value_counts().to_dict()
        school_stats = resume_df['院校类别'].value_counts().to_dict()
        
        age_stats = {
            '平均年龄': float(resume_df['年龄'].mean()),
            '年龄分布': resume_df['年龄'].describe().to_dict()
        }
        
        return jsonify({
            'total_resumes': total_resumes,
            'pass_count': int(pass_count),
            'pass_rate': float(pass_rate),
            'education_stats': education_stats,
            'school_stats': school_stats,
            'age_stats': age_stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/model/performance', methods=['GET'])
def get_model_performance():
    """模型性能"""
    if predictor is None:
        return jsonify({'error': '模型未加载'}), 500
    
    try:
        feature_importance = predictor.get_feature_importance()
        
        return jsonify({
            'feature_importance': feature_importance,
            'model_type': 'Ensemble (RandomForest + XGBoost + LightGBM)',
            'status': 'trained'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print("=" * 60)
    print("智能简历筛选系统 - API服务")
    print("=" * 60)
    init_app()
    print("\n启动Flask服务...")
    app.run(host='0.0.0.0', port=5001, debug=True)
