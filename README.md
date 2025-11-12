# 智能简历筛选与匹配系统

## 项目简介

这是一个基于机器学习的智能IT人才简历筛选与推荐系统，能够自动化筛选简历、智能匹配岗位与候选人，提高HR招聘效率。

### 核心功能

- 📄 **智能简历筛选**：基于历史数据，自动预测新简历是否通过初筛
- 🎯 **岗位人才匹配**：给定岗位需求，推荐最匹配的候选人TOP-N
- 📊 **数据可视化看板**：展示人才市场洞察和招聘数据分析
- 📚 **简历库管理**：简历列表查询、筛选、分页展示

### 技术栈

**后端**
- Python 3.10
- Flask (Web框架)
- Scikit-learn, XGBoost, LightGBM (机器学习)
- Pandas, NumPy (数据处理)

**前端**
- React 18
- Ant Design (UI组件库)
- ECharts (数据可视化)
- Vite (构建工具)

**机器学习优化措施**
- 使用SMOTE处理数据不平衡
- 集成多个模型（RandomForest + XGBoost + LightGBM）
- 网格搜索超参数调优
- 5折交叉验证
- 特征重要性分析

**部署说明**
- 本地开发部署
- 支持Linux/macOS/Windows
- 一键启动脚本

## 快速开始

### 后端设置

```bash
cd backend

# 创建虚拟环境(可自行配置环境，下面给出示例)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 训练模型
python train_model.py

# 启动后端服务
python app.py
```

后端服务运行在 http://localhost:5001

### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用运行在 http://localhost:3000

## 项目结构

```
ml-resume-system/
├── backend/                      # 后端服务
│   ├── app/
│   │   ├── api/                 # API路由
│   │   ├── services/            # 业务逻辑
│   │   │   ├── model_trainer.py # 模型训练
│   │   │   └── predictor.py     # 预测服务
│   │   └── utils/
│   │       └── data_processor.py # 数据处理
│   ├── trained_models/          # 训练好的模型
│   ├── app.py                   # Flask主应用
│   ├── train_model.py           # 模型训练脚本
│   └── requirements.txt         # Python依赖
│
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── components/          # 组件
│   │   ├── pages/               # 页面
│   │   │   ├── DashboardPage.jsx    # 数据看板
│   │   │   ├── PredictPage.jsx      # 简历筛选
│   │   │   ├── MatchPage.jsx        # 人才匹配
│   │   │   └── ResumeListPage.jsx   # 简历库
│   │   ├── services/
│   │   │   └── api.js           # API调用
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Chinese_resume_data.csv       # 数据集
└── README.md
```

## 端口配置

- 前端端口: 3000
- 后端端口: 5001（如遇端口占用可在 `backend/app.py` 中修改）

## 优化措施

1. **数据预处理**
   - 缺失值处理
   - 多值特征Multi-hot编码
   - 熟练度量化

2. **特征工程**
   - 技能总数、平均熟练度
   - 项目质量加权分数
   - 综合技能评分

3. **模型优化**
   - SMOTE处理样本不平衡
   - 集成多个模型提升性能
   - GridSearch超参数调优
   - 交叉验证防止过拟合

4. **工程优化**
   - 模型结果缓存
   - 批量预测并行化
   - RESTful API设计

## 使用说明

1. **训练模型**（首次使用必须）
```bash
cd backend
python train_model.py
```

2. **启动服务**
```bash
# 后端
python app.py

# 前端（新终端）
cd frontend
npm run dev
```

3. **使用功能**
   - 访问 http://localhost:3000
   - 在"简历筛选"页面输入简历信息进行预测
   - 在"人才匹配"页面输入岗位需求获取推荐
   - 在"数据看板"查看统计分析
   - 在"简历库"浏览和管理简历

## 许可证

MIT License
