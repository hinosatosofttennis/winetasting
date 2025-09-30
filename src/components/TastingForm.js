import React, { useState, useEffect, useCallback } from 'react';
import { whiteWineChecks, redWineChecks, initialOptions } from './TastingData';
import { saveTastingRecord, fetchCustomOptions } from '../utils/Firestore';
import styled from 'styled-components';

// ======================= スタイル定義 =======================
const FormContainer = styled.div`
  padding: 20px;
  padding-bottom: 80px; /* ナビゲーションバーの分を確保 */
`;
const WineTypeToggle = styled.button`
  padding: 10px 15px;
  margin-right: 10px;
  border-radius: 20px;
  background-color: ${props => props.active ? '#007bff' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : 'black'};
`;
const AccordionPanel = styled.div`
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
`;
const SectionHeader = styled.h3`
  padding: 15px;
  margin: 0;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const OptionsGrid = styled.div`
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
`;
const OptionButton = styled.div`
  padding: 12px 10px;
  margin: 4px;
  border: 1px solid ${props => props.selected ? '#007bff' : '#ccc'};
  background: ${props => props.selected ? '#007bff' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  flex-basis: auto;
  text-align: center;
`;
const SaveButton = styled.button`
    width: 100%;
    padding: 15px;
    margin-top: 20px;
    background-color: #28a745;
    color: white;
    font-size: 18px;
    border-radius: 10px;
`;
// ========================================================

const TastingForm = ({ user }) => {
  const [wineType, setWineType] = useState('white'); // 'white' or 'red'
  const [formData, setFormData] = useState({});
  const [customOptions, setCustomOptions] = useState(initialOptions);
  const [openSection, setOpenSection] = useState('Appearance'); 
  const currentChecks = wineType === 'white' ? whiteWineChecks : redWineChecks;
  const [tastingDate, setTastingDate] = useState(new Date().toISOString().substring(0, 10));

  // 1. カスタムオプションの読み込み
  useEffect(() => {
    if (user) {
      fetchCustomOptions(user.uid).then(options => {
        // 初期リストとカスタムリストをマージ
        setCustomOptions(prev => ({ 
            ...prev, 
            countries: [...new Set([...initialOptions.countries, ...(options.countries || [])])],
            redGrapes: [...new Set([...initialOptions.redGrapes, ...(options.redGrapes || [])])],
            whiteGrapes: [...new Set([...initialOptions.whiteGrapes, ...(options.whiteGrapes || [])])],
        }));
      });
    }
  }, [user]);

  // 2. 選択肢のハンドリングロジック
  const handleSelect = useCallback((section, key, value, maxSelect, type) => {
    const currentSelections = formData[key] || (type === 'multi' ? [] : '');
    let newSelections;

    if (type === 'single' || type === 'select_custom' || type === 'text') {
      newSelections = currentSelections === value ? '' : value; // トグル機能
    } else if (type === 'multi') {
      if (currentSelections.includes(value)) {
        newSelections = currentSelections.filter(v => v !== value); // 削除
      } else {
        if (currentSelections.length < maxSelect) {
          newSelections = [...currentSelections, value]; // 追加
        } else {
          alert(`この項目は最大${maxSelect}つまでしか選択できません。`);
          return;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [key]: newSelections
    }));
  }, [formData]);

  // 3. フォームのレンダリング
  const renderCheckItem = (section, key, check) => {
    const currentValue = formData[key] || (check.type === 'multi' ? [] : '');
    const isMulti = check.type === 'multi';
    const isCustom = check.type === 'select_custom';
    const optionsList = isCustom ? customOptions[check.key] : check.options;

    if (check.type === 'text') {
        return (
            <input
                type="text"
                value={currentValue}
                onChange={(e) => handleSelect(section, key, e.target.value, 1, 'text')}
                placeholder={`例: ${key} (自由入力)`}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
        );
    }
    
    return (
        <OptionsGrid>
            {optionsList.map(option => {
                const isSelected = isMulti 
                    ? currentValue.includes(option) 
                    : currentValue === option;

                return (
                    <OptionButton
                        key={option}
                        selected={isSelected}
                        onClick={() => handleSelect(section, key, option, check.maxSelect, check.type)}
                    >
                        {option.split('.').pop()} {/* 番号を除いて表示 */}
                    </OptionButton>
                );
            })}
        </OptionsGrid>
    );
  };
  
  // 4. 保存ロジック
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("ログインしてから保存してください。");
    
    const summaryData = {
        vintage: formData['収穫年'] || '未入力',
        producer: formData['生産者'] || '未入力', // 生産者名は自由入力として別途追加可能
        type: formData['タイプ'] || '未選択',
    };

    const recordData = {
        wine_type: wineType,
        summary: summaryData,
        full_data: formData,
    };

    try {
        await saveTastingRecord(user, recordData);
        alert(' ⭕ テイスティング結果を保存し、同期しました！');
        setFormData({}); // フォームクリア
        setOpenSection('Appearance');
    } catch (error) {
        alert(" ❌ 履歴の保存に失敗しました: " + error.message);
    }
  };

  return (
    <FormContainer>
      <h2>新規テイスティング記録</h2>
      <div style={{ marginBottom: '20px' }}>
        <WineTypeToggle active={wineType === 'white'} onClick={() => {setWineType('white'); setFormData({});}}>白ワイン</WineTypeToggle>
        <WineTypeToggle active={wineType === 'red'} onClick={() => {setWineType('red'); setFormData({});}}>赤ワイン</WineTypeToggle>
      </div>

      <form onSubmit={handleSubmit}>
        {Object.entries(currentChecks).map(([sectionKey, checks]) => (
          <AccordionPanel key={sectionKey}>
            <SectionHeader onClick={() => setOpenSection(openSection === sectionKey ? null : sectionKey)}>
              {checks.title} 
              <span>{openSection === sectionKey ? '▲' : '▼'}</span>
            </SectionHeader>
            {openSection === sectionKey && (
              <div style={{ padding: '0 15px 15px' }}>
                {Object.entries(checks).map(([key, check]) => {
                    if (key === 'title') return null; 
                    return (
                        <div key={key} style={{ marginTop: '15px' }}>
                            <h4 style={{ margin: '5px 0' }}>{key} (Max: {check.maxSelect})</h4>
                            {renderCheckItem(sectionKey, key, check)}
                        </div>
                    );
                })}
              </div>
            )}
          </AccordionPanel>
        ))}

        <SaveButton type="submit">結果を保存・同期</SaveButton>
      </form>
    </FormContainer>
  );
};

export default TastingForm;
