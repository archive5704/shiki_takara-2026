四季の宝物 v1 category_id 修正版

修正内容:
- 新カテゴリで記録作成時に category_id が空になる問題を修正
- 保存処理を category_id 前提に整理
- supabase.js の insert/update を category_id 前提で明示
- setup_v1.sql に categories / treasures の grant を明記

手順:
1. sql/setup_v1.sql を SQL Editor で実行
2. ZIPの中身を GitHub リポジトリ直下に上書き
3. 強制再読み込み


v2修正:
- 旧 treasures.category カラムが NOT NULL のまま残っている環境に対応
- 保存時に category_id と category 文字列の両方を送信
- setup_v1.sql に旧 category の NOT NULL 解除SQLを追加
