"""
数据集验证脚本 - 快速检查数据集
"""
import pandas as pd
import os

def validate_dataset():
    """验证数据集"""
    print("=" * 60)
    print("数据集验证")
    print("=" * 60)
    
    data_path = os.path.join(os.path.dirname(__file__), '..', 'Chinese_resume_data.csv')
    
    if not os.path.exists(data_path):
        print(f"❌ 数据集文件不存在: {data_path}")
        return False
    
    print(f"✅ 数据集文件存在: {data_path}")
    
    try:
        df = pd.read_csv(data_path)
        print(f"✅ 数据集加载成功")
        print(f"\n📊 数据集信息:")
        print(f"  - 总行数: {len(df)}")
        print(f"  - 总列数: {len(df.columns)}")
        print(f"\n📋 列名:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i:2d}. {col}")
        
        print(f"\n📈 标签分布:")
        print(df['筛选结果'].value_counts())
        pass_rate = (df['筛选结果'] == '通过').sum() / len(df)
        print(f"  通过率: {pass_rate:.2%}")
        
        print(f"\n🎯 意向岗位分布:")
        print(df['意向岗位'].value_counts())
        
        print(f"\n🎓 学历分布:")
        print(df['学历层次'].value_counts())
        
        print(f"\n🏫 院校分布:")
        print(df['院校类别'].value_counts())
        
        print(f"\n✅ 数据集验证通过！")
        return True
        
    except Exception as e:
        print(f"❌ 数据集加载失败: {str(e)}")
        return False

if __name__ == '__main__':
    validate_dataset()
