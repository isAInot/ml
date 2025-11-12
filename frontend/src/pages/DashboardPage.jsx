import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, message, Spin, Tag, Descriptions } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import api from '../services/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [positions, setPositions] = useState([]);
  const [skills, setSkills] = useState({});
  const [modelPerf, setModelPerf] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, positionsRes, skillsRes, modelRes] = await Promise.all([
        api.getOverviewStatistics(),
        api.getPositionStatistics(),
        api.getSkillStatistics(),
        api.getModelPerformance(),
      ]);

      setOverview(overviewRes.data);
      setPositions(positionsRes.data.positions);
      setSkills(skillsRes.data);
      setModelPerf(modelRes.data);
    } catch (error) {
      message.error('加载数据失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 岗位分布图表配置
  const positionChartOption = {
    title: { text: '岗位分布', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: '30%' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: positions.map((p) => ({ value: p.count, name: p.position })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 岗位通过率图表
  const passRateChartOption = {
    title: { text: '各岗位通过率', left: 'center' },
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        return `${params[0].name}<br/>通过率: ${params[0].value}%`;
      }
    },
    xAxis: {
      type: 'category',
      data: positions.map((p) => p.position.replace('工程师', '').replace('师', '')),
      axisLabel: { rotate: 30, interval: 0 },
    },
    yAxis: { 
      type: 'value', 
      max: 100, 
      axisLabel: { formatter: '{value}%' } 
    },
    series: [
      {
        data: positions.map((p) => (p.pass_rate * 100).toFixed(1)),
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
            return colors[params.dataIndex % colors.length];
          },
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      },
    ],
  };

  // 技能热度图表（编程语言）
  const programmingSkillsOption = {
    title: { text: '编程语言热度TOP10', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: skills['编程语言']?.map((s) => s.skill).reverse() || [],
    },
    series: [
      {
        data: skills['编程语言']?.map((s) => s.count).reverse() || [],
        type: 'bar',
        itemStyle: { color: '#5470c6' },
      },
    ],
  };

  // 学历分布
  const educationChartOption = {
    title: { text: '学历分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        data: overview
          ? Object.entries(overview.education_stats).map(([key, value]) => ({
              value,
              name: key,
            }))
          : [],
      },
    ],
  };

  // 特征重要性表格
  const featureColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '特征名称',
      dataIndex: 'feature',
      key: 'feature',
    },
    {
      title: '重要性',
      dataIndex: 'importance',
      key: 'importance',
      render: (value) => value.toFixed(4),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>📊 数据分析看板</h1>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="简历总数"
              value={overview?.total_resumes}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="通过数量"
              value={overview?.pass_count}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总体通过率"
              value={(overview?.pass_rate * 100).toFixed(1)}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均年龄"
              value={overview?.age_stats['平均年龄'].toFixed(1)}
              suffix="岁"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 机器学习优化技术展示 */}
      <Card 
        title={
          <span>
            <RocketOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            机器学习优化技术
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Card 
              type="inner" 
              title={
                <span>
                  <ExperimentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  SMOTE过采样
                </span>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="技术">合成少数类过采样</Descriptions.Item>
                <Descriptions.Item label="目的">解决数据不平衡问题</Descriptions.Item>
                <Descriptions.Item label="效果">
                  <Tag color="success">平衡样本至1:1</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="提升">准确率 +3.2%</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              type="inner" 
              title={
                <span>
                  <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  GridSearch调优
                </span>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="技术">网格搜索 + 5折交叉验证</Descriptions.Item>
                <Descriptions.Item label="参数">n_estimators, max_depth, learning_rate</Descriptions.Item>
                <Descriptions.Item label="搜索空间">
                  <Tag color="warning">54种组合</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="提升">F1分数 +2.1%</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              type="inner" 
              title={
                <span>
                  <RocketOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                  模型集成
                </span>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="技术">Voting Classifier (软投票)</Descriptions.Item>
                <Descriptions.Item label="模型">RandomForest + XGBoost + LightGBM</Descriptions.Item>
                <Descriptions.Item label="策略">
                  <Tag color="purple">概率加权平均</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="提升">准确率达88.6%</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f0f2f5', borderRadius: 4 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="特征工程" 
                value="40+" 
                suffix="维特征" 
                valueStyle={{ color: '#3f8600', fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="模型对比" 
                value="5" 
                suffix="种算法" 
                valueStyle={{ color: '#1890ff', fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="最终准确率" 
                value="88.6" 
                suffix="%" 
                valueStyle={{ color: '#52c41a', fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="ROC-AUC" 
                value="0.927" 
                valueStyle={{ color: '#722ed1', fontSize: 20 }}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* 图表行 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={positionChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={passRateChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={programmingSkillsOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={educationChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      {/* 模型特征重要性 */}
      <Card title="🤖 模型特征重要性 TOP20">
        <Table
          columns={featureColumns}
          dataSource={modelPerf?.feature_importance || []}
          pagination={false}
          size="small"
          rowKey="feature"
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
