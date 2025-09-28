import React, { useState, useEffect } from 'react';
import { whiteWineChecks, redWineChecks, initialOptions } from '../TastingData'; 
import { saveTastingRecord, fetchCustomOptions } from '../utils/Firestore';

const TastingForm = ({ user }) => {
  const [wineType, setWineType] = useState('white'); // 'white' or 'red'
  const [formData, setFormData] = useState({});
  const [customOptions, setCustomOptions] = useState(initialOptions);
  
  const currentChecks = wineType === 'white' ? whiteWineChecks : redWineChecks;

  // 起動時にカスタムオプションを読み込み
  useEffect(() => {
    if (user) {
      fetchCustomOptions(user.uid).then(options => {
        setCustomOptions(prev => ({ ...prev, ...options }));
      });
    }
  }, [user]);

  const handleSelect = (section, key, value, type) => {
    // 選択ロジック（単一選択、複数選択の処理）
    // ...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const summaryData = {
      wine_type: wineType === 'white' ? '白ワイン' : '赤ワイン',
      // ... 収穫年、生産国、タイプなどの検索用データ
    };

    const recordData = {
        wine_type: wineType,
        summary: summaryData,
        full_data: formData,
    };

    try {
        await saveTastingRecord(user, recordData);
        alert('テイスティング結果を保存しました！');
        setFormData({}); // フォームクリア
    } catch (error) {
        alert(error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>新規テイスティング記録</h2>
      <button onClick={() => setWineType('white')} disabled={wineType === 'white'}>白ワイン</button>
      <button onClick={() => setWineType('red')} disabled={wineType === 'red'}>赤ワイン</button>

      <form onSubmit={handleSubmit}>
        {/* 各セクションのアコーディオン（折りたたみ）表示 */}
        {Object.entries(currentChecks).map(([sectionName, checks]) => (
          <div key={sectionName} className="accordion-panel">
            <h3>{sectionName}</h3>
            {/* ... チェック項目（ラジオボタン/トグル）のレンダリングロジックをここに実装 ... */}
          </div>
        ))}

        <button type="submit" style={{ padding: '15px', marginTop: '20px' }}>
            結果を保存・同期
        </button>
      </form>
    </div>
  );
};

export default TastingForm;
