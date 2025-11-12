"""
训练脚本 - 训练模型并保存
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from app.utils.data_processor import ResumeDataProcessor
from app.services.model_trainer import ResumeModelTrainer


def main():
    print("=" * 60)
    print("智能简历筛选系统 - 模型训练")
    print("=" * 60)
    
    # 加载数据
    print("\n加载数据...")
    data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'Chinese_resume_data.csv')
    df = pd.read_csv(data_path)
    print(f"数据加载完成: {len(df)} 条记录")
    
    # 初始化数据处理器
    data_processor = ResumeDataProcessor()
    
    # 初始化训练器
    trainer = ResumeModelTrainer(data_processor)
    
    # 准备数据
    X_train, X_test, y_train, y_test = trainer.prepare_data(df, use_smote=True)
    
    # 训练基线模型
    results = trainer.train_baseline_models(X_train, y_train, X_test, y_test)
    
    # 优化最佳模型
    optimized_model = trainer.optimize_best_model(X_train, y_train, X_test, y_test)
    
    # 创建集成模型
    ensemble_model = trainer.create_ensemble_model(X_train, y_train, X_test, y_test)
    
    # 选择最佳模型（这里选择集成模型）
    trainer.best_model = ensemble_model
    
    # 特征重要性
    print("\n" + "=" * 60)
    print("Top 20 特征重要性:")
    # 使用集成模型中的XGBoost来获取特征重要性
    feature_imp = trainer.get_feature_importance(trainer.models['XGBoost'])
    if feature_imp is not None:
        print(feature_imp.to_string(index=False))
    
    # 保存模型
    model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'resume_model.pkl')
    trainer.save_model(ensemble_model, model_path)
    
    print("\n" + "=" * 60)
    print("模型训练完成！")
    print("=" * 60)


if __name__ == '__main__':
    main()
