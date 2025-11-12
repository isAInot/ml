import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Button, Tag, message, Space, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;

const ResumeListPage = () => {
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    position: '',
  });

  useEffect(() => {
    fetchResumes();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await api.getResumeList({
        page: pagination.current,
        page_size: pagination.pageSize,
        position: filters.position,
      });
      
      console.log('API响应:', response);
      
      // 安全检查
      if (!response || !response.data) {
        throw new Error('响应数据为空');
      }
      
      const resumesData = response.data.resumes || [];
      
      // 处理数据中的NaN值
      const cleanedResumes = resumesData.map(resume => {
        const cleaned = {};
        Object.keys(resume).forEach(key => {
          // 将NaN、null、undefined转换为空字符串或默认值
          if (resume[key] === null || resume[key] === undefined || 
              (typeof resume[key] === 'number' && isNaN(resume[key]))) {
            cleaned[key] = '-';
          } else {
            cleaned[key] = resume[key];
          }
        });
        return cleaned;
      });
      
      setResumes(cleanedResumes);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
      });
    } catch (error) {
      console.error('加载简历列表错误:', error);
      message.error('加载失败: ' + (error.response?.data?.error || error.message));
      setResumes([]); // 设置为空数组避免后续错误
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const columns = [
    {
      title: '简历编号',
      dataIndex: '简历编号',
      key: '简历编号',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: '姓名',
      key: '姓名',
      width: 100,
    },
    {
      title: '性别',
      dataIndex: '性别',
      key: '性别',
      width: 60,
    },
    {
      title: '年龄',
      dataIndex: '年龄',
      key: '年龄',
      width: 60,
    },
    {
      title: '意向岗位',
      dataIndex: '意向岗位',
      key: '意向岗位',
      width: 140,
    },
    {
      title: '学历',
      dataIndex: '学历层次',
      key: '学历层次',
      width: 80,
    },
    {
      title: '院校',
      dataIndex: '院校类别',
      key: '院校类别',
      width: 100,
    },
    {
      title: '专业',
      dataIndex: '专业类别',
      key: '专业类别',
      width: 100,
    },
    {
      title: '编程语言',
      dataIndex: '编程语言',
      key: '编程语言',
      width: 200,
      render: (text) => (
        <div style={{ fontSize: 12 }}>
          {text && text !== 'NULL' ? text : '-'}
        </div>
      ),
    },
    {
      title: '筛选结果',
      dataIndex: '筛选结果',
      key: '筛选结果',
      width: 100,
      render: (result) => (
        <Tag color={result === '通过' ? 'success' : 'error'}>
          {result === '通过' ? '✅ 通过' : '❌ 不通过'}
        </Tag>
      ),
      filters: [
        { text: '通过', value: '通过' },
        { text: '不通过', value: '不通过' },
      ],
      onFilter: (value, record) => record.筛选结果 === value,
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
          <span>📧 {record.邮箱}</span>
          <span>📱 {record.电话}</span>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>📚 简历库管理</h1>

      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" style={{ width: '100%' }}>
          <Select
            placeholder="筛选岗位"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => {
              setFilters({ ...filters, position: value || '' });
              setPagination({ ...pagination, current: 1 });
            }}
          >
            <Option value="">全部岗位</Option>
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

          <Button icon={<ReloadOutlined />} onClick={fetchResumes}>
            刷新
          </Button>

          <div style={{ flex: 1, textAlign: 'right' }}>
            <span style={{ color: '#666' }}>
              共 {pagination.total} 条简历
            </span>
          </div>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={resumes}
          loading={loading}
          rowKey={(record) => record.简历编号}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
};

export default ResumeListPage;
