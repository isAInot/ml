import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, Table, Tag, message, Space } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;

const MatchPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const handleMatch = async (values) => {
    setLoading(true);
    try {
      const response = await api.matchCandidates(values);
      setCandidates(response.data.candidates);
      message.success(`找到 ${response.data.candidates.length} 位匹配候选人！`);
    } catch (error) {
      message.error('匹配失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'processing';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <span>
          {index === 0 && '🥇'}
          {index === 1 && '🥈'}
          {index === 2 && '🥉'}
          {index > 2 && `#${index + 1}`}
        </span>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
    },
    {
      title: '意向岗位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '学历',
      dataIndex: 'education',
      key: 'education',
      width: 100,
    },
    {
      title: '匹配度',
      dataIndex: 'match_score',
      key: 'match_score',
      width: 150,
      render: (score) => (
        <Tag color={getMatchColor(score)} style={{ fontSize: 14, padding: '4px 12px' }}>
          {score.toFixed(1)}分
        </Tag>
      ),
      sorter: (a, b) => b.match_score - a.match_score,
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>📧 {record.email}</span>
          <span>📱 {record.phone}</span>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>🎯 岗位人才智能匹配</h1>

      <Card title="岗位需求" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleMatch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              label="招聘岗位"
              name="position"
              rules={[{ required: true, message: '请选择招聘岗位' }]}
            >
              <Select placeholder="选择岗位">
                <Option value="前端开发工程师">前端开发工程师</Option>
                <Option value="后端开发工程师">后端开发工程师</Option>
                <Option value="全栈开发工程师">全栈开发工程师</Option>
                <Option value="算法工程师">算法工程师</Option>
                <Option value="数据分析师">数据分析师</Option>
                <Option value="数据工程师">数据工程师</Option>
                <Option value="测试工程师">测试工程师</Option>
                <Option value="运维工程师">运维工程师</Option>
                <Option value="云计算工程师">云计算工程师</Option>
                <Option value="移动开发工程师">移动开发工程师</Option>
              </Select>
            </Form.Item>

            <Form.Item label="学历要求" name="education">
              <Select placeholder="最低学历要求">
                <Option value="专科">专科及以上</Option>
                <Option value="本科">本科及以上</Option>
                <Option value="硕士">硕士及以上</Option>
              </Select>
            </Form.Item>

            <Form.Item label="院校要求" name="school">
              <Select placeholder="院校类别">
                <Option value="普通高校">不限</Option>
                <Option value="211高校">211高校</Option>
                <Option value="985高校">985高校</Option>
              </Select>
            </Form.Item>

            <Form.Item label="工作年限" name="experience_years">
              <InputNumber min={0} max={20} placeholder="最少年限" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="推荐人数" name="top_n">
              <InputNumber min={5} max={50} placeholder="默认10人" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block icon={<TrophyOutlined />}>
              🔍 开始匹配
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {candidates.length > 0 && (
        <Card
          title={
            <span>
              <TrophyOutlined style={{ marginRight: 8 }} />
              匹配结果 (共 {candidates.length} 位候选人)
            </span>
          }
        >
          <Table
            columns={columns}
            dataSource={candidates}
            rowKey={(record) => record.resume_id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default MatchPage;
