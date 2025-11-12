"""
模型训练和优化模块
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix
)
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
import joblib
import os


class ResumeModelTrainer:
    """简历筛选模型训练器"""
    
    def __init__(self, data_processor):
        self.data_processor = data_processor
        self.models = {}
        self.best_model = None
        self.feature_importance = None
        self.feature_names = None
        
    def prepare_data(self, df, test_size=0.2, use_smote=True):
        """准备训练数据"""
        print("=" * 60)
        print("数据预处理开始...")
        
        # 特征工程
        X, y = self.data_processor.process_training_data(df)
        self.feature_names = X.columns.tolist()
        
        print(f"原始数据: {len(df)} 条")
        print(f"特征数量: {X.shape[1]}")
        print(f"标签分布:\n{y.value_counts()}")
        print(f"通过率: {y.mean():.2%}")
        
        # 划分训练集和测试集
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # 处理数据不平衡
        if use_smote:
            print("\n应用SMOTE处理数据不平衡...")
            smote = SMOTE(random_state=42)
            X_train, y_train = smote.fit_resample(X_train, y_train)
            print(f"SMOTE后训练集标签分布:\n{pd.Series(y_train).value_counts()}")
        
        return X_train, X_test, y_train, y_test
    
    def train_baseline_models(self, X_train, y_train, X_test, y_test):
        """训练基线模型"""
        print("\n" + "=" * 60)
        print("训练多个基线模型...")
        
        models = {
            'LogisticRegression': LogisticRegression(max_iter=1000, random_state=42),
            'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
            'GradientBoosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'XGBoost': XGBClassifier(n_estimators=100, random_state=42, eval_metric='logloss'),
            'LightGBM': LGBMClassifier(n_estimators=100, random_state=42, verbose=-1)
        }
        
        results = {}
        
        for name, model in models.items():
            print(f"\n训练 {name}...")
            model.fit(X_train, y_train)
            
            # 预测
            y_pred = model.predict(X_test)
            y_proba = model.predict_proba(X_test)[:, 1]
            
            # 评估
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred),
                'recall': recall_score(y_test, y_pred),
                'f1': f1_score(y_test, y_pred),
                'roc_auc': roc_auc_score(y_test, y_proba)
            }
            
            results[name] = metrics
            self.models[name] = model
            
            print(f"  准确率: {metrics['accuracy']:.4f}")
            print(f"  精确率: {metrics['precision']:.4f}")
            print(f"  召回率: {metrics['recall']:.4f}")
            print(f"  F1分数: {metrics['f1']:.4f}")
            print(f"  ROC-AUC: {metrics['roc_auc']:.4f}")
        
        return results
    
    def optimize_best_model(self, X_train, y_train, X_test, y_test):
        """优化最佳模型"""
        print("\n" + "=" * 60)
        print("超参数调优 - XGBoost...")
        
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.3],
            'subsample': [0.8, 1.0],
            'colsample_bytree': [0.8, 1.0]
        }
        
        xgb = XGBClassifier(random_state=42, eval_metric='logloss')
        
        grid_search = GridSearchCV(
            xgb, param_grid, cv=5, scoring='f1', n_jobs=-1, verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        print(f"\n最佳参数: {grid_search.best_params_}")
        print(f"最佳CV分数: {grid_search.best_score_:.4f}")
        
        # 评估优化后的模型
        best_model = grid_search.best_estimator_
        y_pred = best_model.predict(X_test)
        y_proba = best_model.predict_proba(X_test)[:, 1]
        
        print("\n优化后模型测试集表现:")
        print(f"  准确率: {accuracy_score(y_test, y_pred):.4f}")
        print(f"  精确率: {precision_score(y_test, y_pred):.4f}")
        print(f"  召回率: {recall_score(y_test, y_pred):.4f}")
        print(f"  F1分数: {f1_score(y_test, y_pred):.4f}")
        print(f"  ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")
        
        return best_model
    
    def create_ensemble_model(self, X_train, y_train, X_test, y_test):
        """创建集成模型"""
        print("\n" + "=" * 60)
        print("创建Voting集成模型...")
        
        estimators = [
            ('rf', RandomForestClassifier(n_estimators=200, max_depth=7, random_state=42)),
            ('xgb', XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)),
            ('lgbm', LGBMClassifier(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42, verbose=-1))
        ]
        
        ensemble = VotingClassifier(estimators=estimators, voting='soft', n_jobs=-1)
        ensemble.fit(X_train, y_train)
        
        # 评估
        y_pred = ensemble.predict(X_test)
        y_proba = ensemble.predict_proba(X_test)[:, 1]
        
        print("\n集成模型测试集表现:")
        print(f"  准确率: {accuracy_score(y_test, y_pred):.4f}")
        print(f"  精确率: {precision_score(y_test, y_pred):.4f}")
        print(f"  召回率: {recall_score(y_test, y_pred):.4f}")
        print(f"  F1分数: {f1_score(y_test, y_pred):.4f}")
        print(f"  ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")
        
        return ensemble
    
    def get_feature_importance(self, model, top_n=20):
        """获取特征重要性"""
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importance = np.abs(model.coef_[0])
        else:
            return None
        
        feature_imp = pd.DataFrame({
            '特征': self.feature_names,
            '重要性': importance
        }).sort_values('重要性', ascending=False)
        
        return feature_imp.head(top_n)
    
    def save_model(self, model, model_path):
        """保存模型"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump({
            'model': model,
            'feature_names': self.feature_names,
            'data_processor': self.data_processor
        }, model_path)
        print(f"\n模型已保存到: {model_path}")
    
    def load_model(self, model_path):
        """加载模型"""
        data = joblib.load(model_path)
        self.best_model = data['model']
        self.feature_names = data['feature_names']
        self.data_processor = data['data_processor']
        return data['model']
