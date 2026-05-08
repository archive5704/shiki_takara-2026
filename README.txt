四季の宝物 category_id 完全統一版

重要:
この版は treasures.category を使いません。
保存はすべて treasures.category_id で行います。

先に必ず実行:
sql/setup_category_id_only.sql

実行すると:
- categories テーブルを作成
- 旧 category 文字列から category_id へ移行
- 旧 category カラムを削除
- categories / treasures の RLS と grant を整理

GitHub Pages:
ZIP内の中身をリポジトリ直下へ上書きしてください。


v2 upload direct 修正:
- Storage upload を Supabase SDK upload() ではなく direct fetch に変更
- 管理者セッション access_token を使ってアップロード
- 60秒タイムアウト
- 失敗時のStorageエラー表示を強化
- sql/storage_policy.sql を追加

loading_fix:
- Auth初期化エラーで一覧描画が止まらないよう修正
- Supabase読込に20秒タイムアウトを追加
- 読込失敗時もカレンダー枠を描画
