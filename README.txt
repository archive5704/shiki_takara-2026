四季の宝物 recovery stable final

これは今のSupabase状態に合わせた安定版です。

特徴:
- category_id を使う
- 旧 category カラムが残っていても保存できる
- logout を確実化
- 起動時に必ずカレンダー枠表示
- JS/CSSキャッシュ回避付き

手順:
1. sql/recovery_setup.sql を SQL Editor で実行
2. ZIPの中身を GitHub リポジトリ直下に上書き
3. シークレットウィンドウで確認
