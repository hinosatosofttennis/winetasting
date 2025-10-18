import React, { useState, useEffect, useCallback } from 'react';
import { fetchTastingRecords } from '../utils/Firestore';
import styled from 'styled-components';

// ======================= スタイル定義 (変更なし) =======================
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
    // userオブジェクトが外部から渡されるため、loadingはuserの状態に依存する
    const [loading, setLoading] = useState(true); 

    // 1. 履歴の読み込みとデータ構造チェック (クラッシュ対策A)
    const loadRecords = useCallback(async () => {
        if (!user || !user.uid) { // userがnullまたはUIDがない場合は処理しない
             setLoading(false);
             return;
        }
        setLoading(true);
        try {
            const records = await fetchTastingRecords(user.uid);
            
            // 【✅ データの初期値チェックを強化】: 取得したデータが配列か確認
            if (Array.isArray(records)) {
                setAllRecords(records);
                setFilteredRecords(records);
            } else {
                setAllRecords([]);
                setFilteredRecords([]);
                console.warn("Firestoreから配列ではないデータが返されました。");
            }
        } catch (error) {
            console.error("履歴の読み込みエラー:", error);
            setAllRecords([]);
            setFilteredRecords([]);
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
            // 【✅ nullチェックと互換性処理】: summaryオブジェクトがnullでないことを保証
            const summary = record.summary || record.concise_summary || {};
            
            // 検索対象フィールドを結合 (undefinedを空文字列に変換して安全を確保)
            const searchableText = [
                summary.producer || '',
                summary.vintage || '', 
                summary.type || '',
                record.wine_type || ''
            ].join(' ').toLowerCase();

            return searchableText.includes(term);
        });
        setFilteredRecords(filtered);
    }, [searchTerm, allRecords]);
    
    // 3. 詳細レコードの表示レンダリング (クラッシュ対策B)
    const renderRecordDetails = (record) => {
        if (!record) return null;
        
        // 【✅ オプショナルチェイニングで安全なプロパティ参照】
        const summary = record.summary || record.concise_summary || {};
        const data = record.full_tasting_data || {};
        
        return (
            <div>
                <button onClick={() => setSelectedRecord(null)} style={{ marginBottom: '15px' }}>
                    ← 履歴一覧に戻る
                </button>
                <h3>{record.wine_type} テイスティング詳細 ({summary.vintage || 'N/A'})</h3>
                <p><strong>日付:</strong> {record.tasting_date || new Date(record.timestamp).toLocaleDateString()}</p>
                <p><strong>生産者:</strong> {summary.producer || 'N/A'}</p>
                
                <DetailList>
                    {/* Object.entries(data)がクラッシュしないよう、dataがオブジェクトであることを保証 */}
                    {Object.entries(data).map(([key, value]) => {
                         // valueが空文字列やnullでなければ表示
                         if (!value || (Array.isArray(value) && value.length === 0)) return null;

                         const displayValue = Array.isArray(value) ? value.join(', ') : value;

                        return (
                            <li key={key}>
                                <strong>{key}:</strong> {displayValue}
                            </li>
                        );
                    })}
                </DetailList>
            </div>
        );
    };

    // 4. ガード節 (クラッシュ対策の基本)
    if (loading) return <HistoryContainer>履歴をロード中...</HistoryContainer>;
    if (!user) return <HistoryContainer>履歴を表示するにはログインが必要です。</HistoryContainer>;

    // 5. メインレンダリング
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

                    {/* レコードがない場合のメッセージ */}
                    {filteredRecords.length === 0 && <p>履歴がありません、または検索結果が見つかりませんでした。</p>}

                    {/* レコードカードのレンダリング (クラッシュ対策B) */}
                    {filteredRecords.map(record => {
                        const summary = record.summary || record.concise_summary || {};
                        
                        return (
                            <RecordCard 
                                key={record.id} 
                                wineType={record.wine_type === '白ワイン' ? 'white' : 'red'}
                                onClick={() => setSelectedRecord(record)}
                            >
                                <h4>{summary.type || 'N/A'} ({record.wine_type || 'N/A'})</h4>
                                <p><strong>{summary.producer || 'N/A'}</strong> / {summary.vintage || 'N/A'}</p>
                                <p style={{ fontSize: '12px', color: '#666' }}>
                                    {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '日付不明'}
                                </p>
                            </RecordCard>
                        );
                    })}
                </>
            )}
        </HistoryContainer>
    );
};

export default HistoryView;
        </HistoryContainer>
    );
};

export default HistoryView;
