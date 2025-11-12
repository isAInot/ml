import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, InputNumber, message, Divider, Tag, Progress, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;

const PredictPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 技能选项 - 与训练数据完全匹配
  const programmingLanguages = ['Python', 'Java', 'JavaScript', 'SQL', 'Go', 'C++', 'C#', 'PHP', 'Ruby'];
  const frontendTechs = ['React/Vue', 'HTML/CSS', 'TypeScript', 'Redux/Vuex', 'Webpack', 'jQuery'];
  const backendTechs = ['Spring Boot', 'Django/Flask', 'Node.js', 'RESTful API', 'Kafka/RabbitMQ', 'Microservices'];
  const databases = ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'Elasticsearch'];
  const cloudTechs = ['AWS/Azure', 'Docker/Kubernetes', 'Linux', 'Jenkins', 'Ansible', 'Terraform', 'Nginx'];
  const dataAlgorithms = ['TensorFlow/PyTorch', 'Hadoop/Spark', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'];
  const mobileTechs = ['Android', 'iOS', 'React Native', 'Flutter', 'Ionic'];
  const testTools = ['Selenium', 'JMeter', 'Postman', 'JUnit', 'pytest', 'TestNG'];

  const handlePredict = async (values) => {
    setLoading(true);
    try {
      // 处理技能字段 - 将数组转换为逗号分隔的字符串，空数组转为NULL
      const processedValues = {
        ...values,
        编程语言: (values.编程语言 && values.编程语言.length > 0) ? values.编程语言.join(',') : 'NULL',
        编程语言熟练度: (values.编程语言熟练度 && values.编程语言熟练度.length > 0) ? values.编程语言熟练度.join(',') : 'NULL',
        前端技术: (values.前端技术 && values.前端技术.length > 0) ? values.前端技术.join(',') : 'NULL',
        前端技术熟练度: (values.前端技术熟练度 && values.前端技术熟练度.length > 0) ? values.前端技术熟练度.join(',') : 'NULL',
        后端技术: (values.后端技术 && values.后端技术.length > 0) ? values.后端技术.join(',') : 'NULL',
        后端技术熟练度: (values.后端技术熟练度 && values.后端技术熟练度.length > 0) ? values.后端技术熟练度.join(',') : 'NULL',
        数据库: (values.数据库 && values.数据库.length > 0) ? values.数据库.join(',') : 'NULL',
        数据库熟练度: (values.数据库熟练度 && values.数据库熟练度.length > 0) ? values.数据库熟练度.join(',') : 'NULL',
        '云计算/运维': (values['云计算/运维'] && values['云计算/运维'].length > 0) ? values['云计算/运维'].join(',') : 'NULL',
        '云计算/运维熟练度': (values['云计算/运维熟练度'] && values['云计算/运维熟练度'].length > 0) ? values['云计算/运维熟练度'].join(',') : 'NULL',
        '数据与算法': (values['数据与算法'] && values['数据与算法'].length > 0) ? values['数据与算法'].join(',') : 'NULL',
        '数据与算法熟练度': (values['数据与算法熟练度'] && values['数据与算法熟练度'].length > 0) ? values['数据与算法熟练度'].join(',') : 'NULL',
        移动开发: (values.移动开发 && values.移动开发.length > 0) ? values.移动开发.join(',') : 'NULL',
        移动开发熟练度: (values.移动开发熟练度 && values.移动开发熟练度.length > 0) ? values.移动开发熟练度.join(',') : 'NULL',
        测试工具: (values.测试工具 && values.测试工具.length > 0) ? values.测试工具.join(',') : 'NULL',
        测试工具熟练度: (values.测试工具熟练度 && values.测试工具熟练度.length > 0) ? values.测试工具熟练度.join(',') : 'NULL',
      };

      console.log('提交的数据:', processedValues);

      const response = await api.predictSingle(processedValues);
      setResult(response.data);
      message.success('预测完成！');
    } catch (error) {
      console.error('预测错误详情:', error.response || error);
      message.error('预测失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#52c41a';
    if (confidence >= 0.6) return '#1890ff';
    if (confidence >= 0.4) return '#faad14';
    return '#f5222d';
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>📄 智能简历筛选</h1>
      
      <Card title="填写简历信息" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePredict}
          initialValues={{
            性别: '男',
            年龄: 25,
            学历层次: '本科',
            院校类别: '普通高校',
            专业类别: '计算机类',
            英语水平: '英语四级',
            // 所有技能默认为空（无）
            编程语言: [],
            编程语言熟练度: [],
            前端技术: [],
            前端技术熟练度: [],
            后端技术: [],
            后端技术熟练度: [],
            数据库: [],
            数据库熟练度: [],
            '云计算/运维': [],
            '云计算/运维熟练度': [],
            '数据与算法': [],
            '数据与算法熟练度': [],
            移动开发: [],
            移动开发熟练度: [],
            测试工具: [],
            测试工具熟练度: [],
            小型企业工作经验: 'NULL',
            中型企业工作经验: 'NULL',
            大型企业工作经验: 'NULL',
            小规模项目: 0,
            中规模项目: 0,
            大规模项目: 0,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="姓名" name="姓名" rules={[{ required: true }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item label="性别" name="性别" rules={[{ required: true }]}>
              <Select>
                <Option value="男">男</Option>
                <Option value="女">女</Option>
              </Select>
            </Form.Item>

            <Form.Item label="年龄" name="年龄" rules={[{ required: true }]}>
              <InputNumber min={18} max={65} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="电话" name="电话">
              <Input placeholder="联系电话（可选）" />
            </Form.Item>

            <Form.Item label="邮箱" name="邮箱">
              <Input placeholder="电子邮箱（可选）" />
            </Form.Item>

            <Form.Item label="意向岗位" name="意向岗位" rules={[{ required: true }]}>
              <Select>
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

            <Form.Item label="学历层次" name="学历层次" rules={[{ required: true }]}>
              <Select>
                <Option value="专科">专科</Option>
                <Option value="本科">本科</Option>
                <Option value="硕士">硕士</Option>
                <Option value="博士">博士</Option>
              </Select>
            </Form.Item>

            <Form.Item label="院校类别" name="院校类别" rules={[{ required: true }]}>
              <Select>
                <Option value="普通高校">普通高校</Option>
                <Option value="211高校">211高校</Option>
                <Option value="985高校">985高校</Option>
              </Select>
            </Form.Item>

            <Form.Item label="专业类别" name="专业类别" rules={[{ required: true }]}>
              <Select>
                <Option value="计算机类">计算机类</Option>
                <Option value="非计算机类">非计算机类</Option>
              </Select>
            </Form.Item>

            <Form.Item label="英语水平" name="英语水平">
              <Select>
                <Option value="无">无</Option>
                <Option value="英语四级">英语四级</Option>
                <Option value="英语六级">英语六级</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider>技能信息（下拉选择，支持多选）</Divider>

          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f7ff' }}>
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span style={{ color: '#1890ff' }}>
                提示：技能选项已根据训练数据优化（如React/Vue组合），不会的技能留空即可。技能和熟练度数量应对应。
              </span>
            </Space>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item 
              label="编程语言" 
              name="编程语言"
              tooltip="可多选，建议选择2-3个主要语言"
            >
              <Select mode="multiple" placeholder="选择编程语言" maxTagCount={3}>
                {programmingLanguages.map(lang => (
                  <Option key={lang} value={lang}>{lang}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              label="编程语言熟练度" 
              name="编程语言熟练度"
              tooltip="与编程语言对应，数量需一致"
            >
              <Select mode="multiple" placeholder="选择熟练度" maxTagCount={3}>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="前端技术" name="前端技术" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择前端技术（可选，不会请留空）" maxTagCount={2} allowClear>
                {frontendTechs.map(tech => (
                  <Option key={tech} value={tech}>{tech}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="前端技术熟练度" name="前端技术熟练度" tooltip="与前端技术对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="后端技术" name="后端技术" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择后端技术（可选，不会请留空）" maxTagCount={2} allowClear>
                {backendTechs.map(tech => (
                  <Option key={tech} value={tech}>{tech}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="后端技术熟练度" name="后端技术熟练度" tooltip="与后端技术对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="数据库" name="数据库" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择数据库（可选，不会请留空）" maxTagCount={2} allowClear>
                {databases.map(db => (
                  <Option key={db} value={db}>{db}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="数据库熟练度" name="数据库熟练度" tooltip="与数据库对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="云计算/运维" name="云计算/运维" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择云计算/运维技术（可选，不会请留空）" maxTagCount={2} allowClear>
                {cloudTechs.map(tech => (
                  <Option key={tech} value={tech}>{tech}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="云计算/运维熟练度" name="云计算/运维熟练度" tooltip="与云计算/运维对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="数据与算法" name="数据与算法" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择数据/算法技术（可选，不会请留空）" maxTagCount={2} allowClear>
                {dataAlgorithms.map(tech => (
                  <Option key={tech} value={tech}>{tech}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="数据与算法熟练度" name="数据与算法熟练度" tooltip="与数据与算法对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="移动开发" name="移动开发" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择移动开发技术（可选，不会请留空）" maxTagCount={2} allowClear>
                {mobileTechs.map(tech => (
                  <Option key={tech} value={tech}>{tech}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="移动开发熟练度" name="移动开发熟练度" tooltip="与移动开发对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>

            <Form.Item label="测试工具" name="测试工具" tooltip="不会可以不选">
              <Select mode="multiple" placeholder="选择测试工具（可选，不会请留空）" maxTagCount={2} allowClear>
                {testTools.map(tool => (
                  <Option key={tool} value={tool}>{tool}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="测试工具熟练度" name="测试工具熟练度" tooltip="与测试工具对应">
              <Select mode="multiple" placeholder="选择熟练度（可选）" maxTagCount={2} allowClear>
                <Option value="精通">精通</Option>
                <Option value="熟练">熟练</Option>
                <Option value="掌握">掌握</Option>
                <Option value="了解">了解</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider>工作经验</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="小型企业工作经验" name="小型企业工作经验">
              <Select placeholder="选择工作年限">
                <Option value="NULL">无</Option>
                <Option value="1年以下">1年以下</Option>
                <Option value="1―3年">1―3年</Option>
                <Option value="3―5年">3―5年</Option>
                <Option value="5年以上">5年以上</Option>
              </Select>
            </Form.Item>

            <Form.Item label="中型企业工作经验" name="中型企业工作经验">
              <Select placeholder="选择工作年限">
                <Option value="NULL">无</Option>
                <Option value="1年以下">1年以下</Option>
                <Option value="1―3年">1―3年</Option>
                <Option value="3―5年">3―5年</Option>
                <Option value="5年以上">5年以上</Option>
              </Select>
            </Form.Item>

            <Form.Item label="大型企业工作经验" name="大型企业工作经验">
              <Select placeholder="选择工作年限">
                <Option value="NULL">无</Option>
                <Option value="1年以下">1年以下</Option>
                <Option value="1―3年">1―3年</Option>
                <Option value="3―5年">3―5年</Option>
                <Option value="5年以上">5年以上</Option>
              </Select>
            </Form.Item>

            <Form.Item label="小规模项目" name="小规模项目" tooltip="参与过的小规模项目数量">
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="中规模项目" name="中规模项目" tooltip="参与过的中规模项目数量">
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="大规模项目" name="大规模项目" tooltip="参与过的大规模项目数量">
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              🚀 开始预测
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
        <Card
          title="预测结果"
          style={{
            borderLeft: `4px solid ${result.prediction === '通过' ? '#52c41a' : '#f5222d'}`,
          }}
        >
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {result.prediction === '通过' ? (
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            ) : (
              <CloseCircleOutlined style={{ fontSize: 64, color: '#f5222d', marginBottom: 16 }} />
            )}
            
            <h2 style={{ fontSize: 32, margin: '16px 0' }}>
              {result.prediction === '通过' ? '✅ 简历通过筛选' : '❌ 简历未通过筛选'}
            </h2>
            
            <Tag
              color={result.prediction === '通过' ? 'success' : 'error'}
              style={{ fontSize: 16, padding: '8px 16px', marginTop: 16 }}
            >
              置信度: {(result.confidence * 100).toFixed(1)}%
            </Tag>

            <div style={{ marginTop: 40, maxWidth: 600, margin: '40px auto 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>通过概率</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {(result.probability_pass * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  percent={result.probability_pass * 100}
                  strokeColor={getConfidenceColor(result.probability_pass)}
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>不通过概率</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {(result.probability_fail * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  percent={result.probability_fail * 100}
                  strokeColor="#f5222d"
                  showInfo={false}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PredictPage;
