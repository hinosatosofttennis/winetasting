import React from 'react';
import { auth, db } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const FirebaseAuth = ({ user, loading }) => {
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      
      // ユーザーがDBに存在しない場合、基本情報を登録
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        createdAt: new Date()
      }, { merge: true });

    } catch (error) {
      console.error("Googleサインインエラー:", error);
      alert("サインインに失敗しました。");
    }
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("ログアウトエラー:", error);
    });
  };

  if (loading) return <div>認証情報を確認中...</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {user ? (
        <>
          <p>ようこそ、{user.displayName || user.email}さん</p>
          <button onClick={handleLogout} style={{ padding: '10px', background: '#ccc' }}>
            ログアウト
          </button>
        </>
      ) : (
        <>
          <p>テイスティング履歴を同期するにはログインが必要です。</p>
          <button 
            onClick={signInWithGoogle} 
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px', 
              background: '#4285F4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            🚀 Googleでログイン (推奨)
          </button>
          {/* Eメール/パスワード認証など、他の認証オプションをここに追加できます */}
        </>
      )}
    </div>
  );
};

export default FirebaseAuth;
