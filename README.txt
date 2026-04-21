# 彌榮四季の宝物 GitHub Pages版

## そのまま置くファイル
- index.html
- manifest.webmanifest
- assets/styles.css
- assets/app.js
- assets/supabase.js
- icons/apple-touch-icon-180.png
- icons/icon-192.png
- icons/icon-512.png
- icons/placeholder-400x300.png

## GitHub Pages 公開手順
1. このZIPを展開
2. 中身をそのままリポジトリ直下へアップロード
3. GitHub Pages を有効化
4. 公開URLをSafariで開く
5. 共有 → ホーム画面に追加

## Supabase 側で必要なもの
### Storage バケット
- public バケット名: treasure-images など

### テーブル例
- id text primary key
- name text
- start_date date
- end_date date
- category text
- color text
- detail text
- image_url text
- created_at timestamptz

## 補足
- 接続未設定のときはローカル体験版で動きます
- 設定はブラウザの localStorage に保存されます
