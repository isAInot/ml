"""
API测试脚本
"""
import requests
import json
import time

BASE_URL = "http://localhost:5001/api"

def test_health():
    """测试健康检查"""
    print("\n" + "=" * 60)
    print("测试 1: 健康检查")
    print("=" * 60)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_predict_single():
    """测试单条预测"""
    print("\n" + "=" * 60)
    print("测试 2: 单条简历预测")
    print("=" * 60)
    
    test_resume = {
        "姓名": "测试用户",
        "性别": "男",
        "年龄": 25,
        "电话": "13800138000",
        "邮箱": "test@example.com",
        "意向岗位": "后端开发工程师",
        "学历层次": "本科",
        "院校类别": "211高校",
        "专业类别": "计算机类",
        "英语水平": "英语六级",
        "编程语言": "Python,Java,Go",
        "编程语言熟练度": "精通,熟练,掌握",
        "后端技术": "Spring Boot,Django/Flask,RESTful API",
        "后端技术熟练度": "熟练,熟练,掌握",
        "数据库": "MySQL,PostgreSQL,Redis",
        "数据库熟练度": "熟练,掌握,掌握",
        "小型企业工作经验": "1―3年",
        "中型企业工作经验": "NULL",
        "大型企业工作经验": "NULL",
        "小规模项目": 5,
        "中规模项目": 3,
        "大规模项目": 1
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict/single",
            json=test_resume,
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"预测结果: {result['prediction']}")
        print(f"置信度: {result['confidence']:.2%}")
        print(f"通过概率: {result['probability_pass']:.2%}")
        print(f"不通过概率: {result['probability_fail']:.2%}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_match_candidates():
    """测试岗位匹配"""
    print("\n" + "=" * 60)
    print("测试 3: 岗位人才匹配")
    print("=" * 60)
    
    job_requirements = {
        "position": "后端开发工程师",
        "education": "本科",
        "school": "211高校",
        "experience_years": 2,
        "skills": ["Python", "Java", "MySQL"],
        "top_n": 5
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/match/candidates",
            json=job_requirements,
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        result = response.json()
        candidates = result.get('candidates', [])
        print(f"找到 {len(candidates)} 位候选人")
        for i, candidate in enumerate(candidates[:3], 1):
            print(f"\n  {i}. {candidate['name']} - 匹配度: {candidate['match_score']:.1f}分")
            print(f"     岗位: {candidate['position']}")
            print(f"     学历: {candidate['education']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_statistics():
    """测试统计接口"""
    print("\n" + "=" * 60)
    print("测试 4: 统计数据")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/statistics/overview", timeout=5)
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"简历总数: {result['total_resumes']}")
        print(f"通过数量: {result['pass_count']}")
        print(f"通过率: {result['pass_rate']:.2%}")
        print(f"平均年龄: {result['age_stats']['平均年龄']:.1f}岁")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_model_performance():
    """测试模型性能接口"""
    print("\n" + "=" * 60)
    print("测试 5: 模型性能")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/model/performance", timeout=5)
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"模型类型: {result['model_type']}")
        print(f"模型状态: {result['status']}")
        print(f"\nTop 5 重要特征:")
        for i, feature in enumerate(result['feature_importance'][:5], 1):
            print(f"  {i}. {feature['feature']}: {feature['importance']:.4f}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def main():
    """运行所有测试"""
    print("=" * 60)
    print("API 测试套件")
    print("=" * 60)
    print("\n确保后端服务正在运行: python app.py")
    print("API地址: " + BASE_URL)
    
    time.sleep(1)
    
    results = []
    
    # 运行测试
    results.append(("健康检查", test_health()))
    time.sleep(0.5)
    
    results.append(("单条预测", test_predict_single()))
    time.sleep(0.5)
    
    results.append(("岗位匹配", test_match_candidates()))
    time.sleep(0.5)
    
    results.append(("统计数据", test_statistics()))
    time.sleep(0.5)
    
    results.append(("模型性能", test_model_performance()))
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    for test_name, passed in results:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"{test_name:20s} {status}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\n总计: {passed_count}/{total_count} 测试通过")
    
    if passed_count == total_count:
        print("\n🎉 所有测试通过！系统运行正常。")
    else:
        print("\n⚠️  部分测试失败，请检查后端服务。")

if __name__ == '__main__':
    main()
