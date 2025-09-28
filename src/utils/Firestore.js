import { db } from '../firebaseConfig';
import { 
  doc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  setDoc,
  getDoc
} from 'firebase/firestore';

/**
 * テイスティング結果をFirestoreに保存
 * @param {object} userData - {uid: string, ...}
 * @param {object} recordData - テイスティングフォームの全データ
 */
export const saveTastingRecord = async (userData, recordData) => {
  const recordRef = collection(db, 'tasting_records', userData.uid, 'records');
  const timestamp = new Date().toISOString();
  
  const record = {
    timestamp: timestamp,
    wine_type: recordData.wine_type,
    concise_summary: recordData.summary, // 検索用サマリー
    full_tasting_data: recordData.full_data, // 全詳細データ
  };

  try {
    await addDoc(recordRef, record);
    console.log("Record saved successfully!");
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("履歴の保存に失敗しました。");
  }
};

/**
 * ユーザーの全履歴を読み込み
 */
export const fetchTastingRecords = async (uid) => {
  if (!uid) return [];
  const recordsRef = collection(db, 'tasting_records', uid, 'records');
  const q = query(recordsRef);
  
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return records.sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // 新しい順にソート
};


/**
 * ユーザーのカスタムオプション（品種・生産国）を読み込み
 */
export const fetchCustomOptions = async (uid) => {
    if (!uid) return null;
    const docRef = doc(db, 'user_settings', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().customOptions || {};
    }
    return {};
};

/**
 * ユーザーのカスタムオプション（品種・生産国）を保存/更新
 */
export const saveCustomOptions = async (uid, newOptions) => {
    if (!uid) throw new Error("UID is required for saving options.");
    const docRef = doc(db, 'user_settings', uid);
    
    await setDoc(docRef, { customOptions: newOptions }, { merge: true });
};
