import React, { useState, useEffect, useCallback } from 'react';
import { fetchTastingRecords } from '../utils/Firestore';
import styled from 'styled-components';
// ======================= スタイル定義 =======================
const HistoryContainer = styled.div`
  padding: 20px;
  padding-bottom: 80px;
`;
const SearchInput = styled.input`
    width: 100%;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-sizing: border-box;
`;
const RecordCard = styled.div`
    background: ${props => props.wineType === 'white' ? '#fff8e1' : '#fbe5e7'};
    border: 1px solid #eee;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    cursor: pointer;
`;
const DetailList = styled.ul`
    list-style: none;
    padding: 0;
    margin-top: 15px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    font-size: 14px;
`;
// ========================================================

const HistoryView = ({ user }) => {
    const [allRecords, setAllRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. 履歴の読み込み
    const loadRecords = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const records = await fetchTastingRecords(user.uid);
            setAllRecords(records);
            setFilteredRecords(records);
        } catch (error) {
            console.error("履歴の読み込みエラー:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    // 2. 検索・フィルタリングロジック
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = allRecords.filter(record => {
            const summary = record.concise_summary;
            
            // 検索対象フィールド
            const searchableText = [
                summary.producer, 
                summary.vintage, 
                summary.type,
                record.wine_type // 白ワイン/赤ワイン
            ].join(' ').toLowerCase();

            return searchableText.includes(term);
        });
        setFilteredRecords(filtered);
    }, [searchTerm, allRecords]);
    
    // 3. 詳細レコードの表示レンダリング
    const renderRecordDetails = (record) => {
        if (!record) return null;
        
        // データをセクションごとに分類して表示
        const data = record.full_tasting_data;
        const sections = {}; // { 'Appearance': { '濃淡': '淡い', ... }, ... }

        // フルデータからセクションを再構築するロジック (省略)
        // ここでは簡単にフラットリストで表示します
        
        return (
            <div>
                <button onClick={() => setSelectedRecord(null)}>← 履歴一覧に戻る</button>
                <h3>{record.wine_type} テイスティング詳細 ({record.summary.vintage})</h3>
                <p><strong>保存日時:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                <p><strong>生産者:</strong> {record.summary.producer}</p>
                
                <DetailList>
                    {Object.entries(data).map(([key, value]) => (
                        <li key={key}>
                            <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                        </li>
                    ))}
                </DetailList>
            </div>
        );
    };

    if (loading) return <HistoryContainer>履歴をロード中...</HistoryContainer>;
    if (!user) return <HistoryContainer>履歴を表示するにはログインが必要です。</HistoryContainer>;

    return (
        <HistoryContainer>
            {selectedRecord ? (
                renderRecordDetails(selectedRecord)
            ) : (
                <>
                    <h2>テイスティング履歴 ({allRecords.length}件)</h2>
                    <SearchInput 
                        placeholder="収穫年、生産者、タイプで検索..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {filteredRecords.length === 0 && <p>履歴がありません、または検索結果が見つかりませんでした。</p>}

                    {filteredRecords.map(record => (
                        <RecordCard 
                            key={record.id} 
                            wineType={record.wine_type === '白ワイン' ? 'white' : 'red'}
                            onClick={() => setSelectedRecord(record)}
                        >
                            <h4>{record.summary.type} ({record.wine_type})</h4>
                            <p><strong>{record.summary.producer}</strong> / {record.summary.vintage}</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>{new Date(record.timestamp).toLocaleDateString()}</p>
                        </RecordCard>
                    ))}
                </>
            )}
        </HistoryContainer>
    );
};

export default HistoryView;
