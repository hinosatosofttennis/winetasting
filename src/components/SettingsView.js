import React, { useState, useEffect } from 'react';
import { initialOptions } from './TastingData';
import { fetchCustomOptions, saveCustomOptions } from '../utils/Firestore';

const SettingsView = ({ user }) => {
    const [options, setOptions] = useState(initialOptions);
    const [newOption, setNewOption] = useState('');
    const [targetList, setTargetList] = useState('countries'); // 編集対象リスト
    
    // 既存のカスタムオプションを読み込み
    useEffect(() => {
        if (user) {
            fetchCustomOptions(user.uid).then(custom => {
                setOptions(prev => ({ ...prev, ...custom }));
            });
        }
    }, [user]);

    const handleAddOption = async () => {
        if (!newOption.trim()) return;
        
        const updatedList = [...options[targetList], newOption.trim()];
        const newOptions = { ...options, [targetList]: updatedList };

        try {
            await saveCustomOptions(user.uid, newOptions);
            setOptions(newOptions);
            setNewOption('');
            alert('✅新しい選択肢を追加しました！');
        } catch (e) {
            alert('追加に失敗しました: ' + e.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>設定: カスタム選択肢の管理</h2>
            
            <select onChange={(e) => setTargetList(e.target.value)} value={targetList}>
                <option value="countries">生産国リスト</option>
                <option value="redGrapes">赤ワイン品種リスト</option>
                <option value="whiteGrapes">白ワイン品種リスト</option>
            </select>
            
            <h3>{targetList} (現在のリスト: {options[targetList].length}件)</h3>
            
            {/* リスト表示（削除機能なども必要） */}
            <ul>
                {options[targetList].map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>

            {/* 新規追加フォーム */}
            <input 
                type="text" 
                value={newOption} 
                onChange={(e) => setNewOption(e.target.value)} 
                placeholder="新しい選択肢を入力"
            />
            <button onClick={handleAddOption}>追加</button>
        </div>
    );
};

export default SettingsView;
