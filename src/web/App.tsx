import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import RecruitmentList from './components/RecruitmentList';
import styles from './App.module.css';

/**
 * Main application component / 主应用组件
 * @returns App component / 应用组件
 */
const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.title}>小木虫调剂信息平台</h1>
        </header>
        <main className={styles.main}>
          <RecruitmentList />
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
