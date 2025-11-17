# HarmonyTrainer

React + Viteで実装された音楽理論学習WEBアプリのデモ版

## 📱 画面構成

### 1. ホーム画面（Home）
- サンプル曲のリスト表示
- 各曲から「練習」「編集」モードへ遷移
- カード型UIでわかりやすいデザイン

### 2. 練習画面（Practice）
- コード進行を聴いて度数を入力
- 小節単位でのディグリー入力（I, II, III, IV, V, VI, VII）
- コードタイプ選択（メジャー、m, 7, m7, maj7, dim, aug）
- 再生ボタン（モック実装）
- 答え合わせ機能（プレースホルダー）

### 3. 編集画面（Edit）
- 曲名、キー、小節数の編集
- 音声ファイルアップロード（UIのみ）
- コード進行編集（プレースホルダー）

## 🚀 セットアップ

### 前提条件
- Node.js (v16以上推奨)
- npm または yarn

### インストール手順

1. 依存関係をインストール
```bash
npm install
```

2. 開発サーバーを起動
```bash
npm run dev
```

3. ブラウザで確認
   - 自動的にブラウザが開きます（通常は http://localhost:3000）
   - 開かない場合は手動でアクセスしてください

### ビルド

本番環境用にビルドする場合：
```bash
npm run build
```

ビルド結果のプレビュー：
```bash
npm run preview
```

## 📁 プロジェクト構造

```
HarmonyTrainer/
├── index.html                # エントリーHTML
├── package.json              # 依存関係
├── vite.config.js            # Vite設定
├── .gitignore                # Git除外設定
└── src/
    ├── main.jsx              # エントリーポイント
    ├── App.jsx               # ルーター設定
    ├── App.module.css        # グローバルスタイル
    └── pages/
        ├── Home.jsx          # ホーム画面
        ├── Home.module.css
        ├── Practice.jsx      # 練習画面
        ├── Practice.module.css
        ├── Edit.jsx          # 編集画面
        └── Edit.module.css
```

## 🎯 現在の実装状態

### ✅ 実装済み
- 3画面の基本UI（レスポンシブ対応）
- React Router v6による画面遷移
- CSS Modulesでのスコープ付きスタイリング
- 度数入力インターフェース
- モックの再生ボタン
- グラデーション＆シャドウによるモダンなデザイン

### ❌ 未実装（今後の課題）
- LocalStorage/IndexedDBによるデータ永続化
- Context APIによる状態管理
- 実際の音声再生機能（Web Audio API）
- 採点アルゴリズム
- コード進行の詳細編集UI
- 音声ファイルアップロード機能
- ユーザー認証機能

## 🛠️ 技術スタック

- **React**: 18.2.0
- **Vite**: 5.0.8（高速ビルドツール）
- **React Router**: 6.20.0（SPA ルーティング）
- **CSS Modules**: スコープ付きスタイリング
- **言語**: JavaScript (ES6+)

## 🎨 デザイン特徴

- **カラースキーム**: Material Design準拠（Primary: #6200EE, Secondary: #03DAC6）
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **UI/UX**: カード型レイアウト、ホバーアニメーション、視覚的フィードバック

## 📝 次のステップ

1. **データ永続化**: LocalStorageでの曲データ保存
2. **状態管理**: Context APIでのグローバル状態管理
3. **音声再生**: Web Audio APIを使った実装
4. **コード進行エディタ**: ドラッグ&ドロップ対応のUI
5. **採点機能**: ディグリーマッチングアルゴリズム
6. **PWA対応**: オフライン動作とインストール可能化

## 📄 ライセンス

個人利用プロジェクト

## 🔗 リポジトリ

https://github.com/takara-m/HarmonyTrainer.git
