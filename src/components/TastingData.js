// 初期リストデータ (ユーザーが設定画面から追加・編集可能)
export const initialOptions = {
    countries: [
        'フランス', 'イタリア', 'スペイン', 'ドイツ', 'アメリカ',
        'オーストラリア', 'チリ', 'アルゼンチン', '南アフリカ', '日本'
    ],
    redGrapes: [
        'カベルネ・ソーヴィニヨン', 'メルロー', 'ピノ・ノワール', 'シラー',
        'グルナッシュ', 'カベルネ・フラン', 'ガメイ'
    ],
    whiteGrapes: [
        'シャルドネ', 'ソーヴィニヨン・ブラン', 'リースリング', 'ピノ・グリ',
        'ゲヴュルツトラミネール', 'シュナン・ブラン', 'セミヨン'
    ]
};

// 白ワインのチェック項目構造 (抜粋)
export const whiteWineChecks = {
    // ... 外観セクション
    Appearance: {
        '濃淡': { type: 'single', options: ['1.非常に濃い', '2.濃い', '3.中程度', '4.淡い'], maxSelect: 1 },
        '色調': { type: 'multi', options: ['1.グリーンがかった', '2.イエロー', '3.黄金色', '4.トパーズ', '5.アンバー(琥珀色)'], maxSelect: 4 },
        // ... 他の外観項目
    },
    // ... 香りセクション
    Aroma: {
        '特徴/果実': { type: 'multi', options: ['1.柑橘類', '2.青リンゴ', '3.リンゴ', '4.洋梨', /* ... */], maxSelect: 4 }, // 選択数4に修正
        '特徴/芳香・化学物質': { type: 'multi', options: ['1.貝殻', '2.石灰', '3.火打ち石', /* ... */], maxSelect: 4 }, // 選択数4に修正
        // ... 他の香り項目
    },
    // ... 味わいセクション
    Taste: {
        'アタック': { type: 'single', options: ['1.軽やか', '2.スムーズ', '3.強い', '4.インパクトのある'], maxSelect: 1 },
        'フレーバー': { type: 'multi', options: ['1a.チャーミングな', '1b.軽快な', '1c.濃縮した', '2.フローラル', '3.ヴェジタル', '4.スパイシー'], maxSelect: 4 }, // 選択数4に修正
        // ... 他の味わい項目
    },
    // ... 総合評価セクション
    Summary: {
        '生産国': { type: 'select_custom', options: initialOptions.countries, maxSelect: 1 },
        'ブドウ品種': { type: 'select_custom', options: initialOptions.whiteGrapes, maxSelect: 1 }
        // ... 他の総合評価項目
    }
};

// 赤ワインのチェック項目構造も同様に定義（whiteWineChecksとほぼ同じ構造）
export const redWineChecks = {
    // ...
};
