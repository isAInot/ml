import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileSearchOutlined,
  TeamOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import PredictPage from './pages/PredictPage';
import MatchPage from './pages/MatchPage';
import ResumeListPage from './pages/ResumeListPage';
import DashboardPage from './pages/DashboardPage';

const { Header, Content, Sider } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          🎯 智能简历筛选系统
        </div>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/">数据看板</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<FileSearchOutlined />}>
              <Link to="/predict">简历筛选</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<TeamOutlined />}>
              <Link to="/match">人才匹配</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<DatabaseOutlined />}>
              <Link to="/resumes">简历库</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
            }}
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/match" element={<MatchPage />} />
              <Route path="/resumes" element={<ResumeListPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
