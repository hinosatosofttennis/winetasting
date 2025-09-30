import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebaseConfig';
import FirebaseAuth from './components/FirebaseAuth';
import TastingForm from './components/TastingForm';
import TastingData from './components/TastingData';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

// スタイルは styled-componentsなどで別途定義することを推奨
const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '10px',
  fontFamily: 'sans-serif'
};

const App = () => {
  // 認証状態の監視
  const [user, loading] = useAuthState(auth);
  const [currentTab, setCurrentTab] = useState('tasting'); // 'tasting', 'history', 'settings'

  const renderContent = () => {
    if (loading) return <div style={containerStyle}>認証情報をロード中...</div>;
    
    // 未ログイン時は認証画面のみ表示
    if (!user) {
      return (
        <div style={containerStyle}>
          <h2>ワインテイスティング記録</h2>
          <FirebaseAuth user={user} loading={loading} />
        </div>
      );
    }

    // ログイン後のメインコンテンツ
    switch (currentTab) {
      case 'tasting':
        return <TastingForm user={user} />;
      case 'history':
        return <HistoryView user={user} />;
      case 'settings':
        return <SettingsView user={user} />;
      default:
        return <TastingForm user={user} />;
    }
  };

  return (
    <>
      {renderContent()}
      
      {/* ログイン時のみタブナビゲーションを表示 */}
      {user && (
        <nav style={styles.navBar}>
          <button onClick={() => setCurrentTab('tasting')} style={currentTab === 'tasting' ? styles.activeTab : styles.tab}>テイスティング</button>
          <button onClick={() => setCurrentTab('history')} style={currentTab === 'history' ? styles.activeTab : styles.tab}>履歴検索</button>
          <button onClick={() => setCurrentTab('settings')} style={currentTab === 'settings' ? styles.activeTab : styles.tab}>設定</button>
        </nav>
      )}
    </>
  );
};

// モバイルフレンドリーなスタイル（仮）
const styles = {
    navBar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#f8f8f8',
        borderTop: '1px solid #eee',
        padding: '10px 0',
        zIndex: 1000
    },
    tab: {
        flexGrow: 1,
        padding: '10px',
        border: 'none',
        background: 'none',
        fontSize: '14px'
    },
    activeTab: {
        flexGrow: 1,
        padding: '10px',
        border: 'none',
        background: '#e0e0e0',
        color: '#007bff',
        borderRadius: '5px'
    }
};

export default App;
