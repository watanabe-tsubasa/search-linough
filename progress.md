# プロジェクト進捗

## 現状の進捗
[x]ユーティリティ関数のテストを追加し、住所の正規化やマッチングスコア計算の動作を確認できる状態にしました。
[x]管理画面の店舗追加ページで、Supabaseを用いた店舗登録処理を実装しました。
[x]管理画面トップページを追加し、ログインや管理パネルへの導線を整備しました。
[x]店舗一覧ページを作成し、検索とソート機能を実装しました。
[x]店舗詳細ページを追加し、店舗名とコードの編集が可能になりました。
[x]マンション一覧ページを作成し、検索とソート機能を実装しました。
[x]マンション詳細ページを追加し、店舗コードや住所などの編集が可能になりました。
[x]マンション詳細ページに削除機能を追加し、削除後は一覧で結果を通知するようにしました。
[x]マンション紐付け変更ページを実装し、複数マンションの店舗コードを一括更新できるようにしました。
[x]ログインページにメールアドレス・パスワード認証と簡易バリデーションを追加しました。
[x]店舗・マンションの詳細編集フォームに基本的な入力値のバリデーションとエラーメッセージ表示を追加しました。
[x]管理画面へのアクセスにセッションベースの認証を導入し、Supabase の URL とキーをサーバー側環境変数で扱うことでフロントへの露出を避けました。
[x]マンション編集ページの Supabase 連携を型定義で補強し、トースト表示とダイアログ制御の安定性を高めました。
[x]`app/routes/admin.panel.editHouse.tsx`をmock dataから実際のsupabaseを変更するコードへと変更
[x]data fetch, toast表示ロジックの統一
- data fetch はReactRouterV7の方式に則り、statelessかつ更新はForm, useFetcher, actionを中心とした設計。toast表示は実行後query parameter付きのurlにuseNavigateにリダイレクトすることで表示し、その後query parameterを削除する。
- 基本的な実装の型は'./app/routes/admin.panel.editStore.tsx'を参照
  - 入力はReactRouterのFormを利用。更新はaction関数を利用。更新方式はuseFetcherで制御し、statelessな設計とする。action関数にはform経由の'intent'パラメータで渡す
  - query parameterは`type`('deleted', 'update'), `status`('success', 'error')を利用
  - query parameterはloader関数内で取得し、componentにはuseLoaderDataで渡して挙動を制御
  - toast表示は'./app/Hooks/useQueryToast.ts'を利用（type, status, messageに応じたtoastを表示し、その後query parameterを削除してリダイレクトする処理を内包）
[x]各routes内のファイルを確認し、対象となる`.tsx`ファイルをリストアップ
  - [x]app/routes/admin.panel.addHouse.tsx
  - [x]app/routes/admin.panel.addStore.tsx
  - [x]app/routes/admin.panel.editRelation.tsx
  - [x]app/routes/admin.panel.house.$houseId.tsx
  - [x]app/routes/admin.panel.listHouse.tsx
  - [x]app/routes/admin.panel.store.$storeId.tsx
[x]各リストアップしたファイルの修正
[x]リポジトリ向けの `AGENTS.md` ガイドラインを作成し、プロジェクト構造・コマンド・レビュー手順を整理
[x]`tests/routes/search*.test.tsx` と `tests/routes/admin.login.test.tsx` を追加し、検索系ルートとログインルートのローダー・アクション・UI を回帰テストで担保
[x]`app/utils.ts` の住所正規化処理を調整し、既存テストと新規ルートテストで利用する比較が安定するよう改善
[x]管理画面系の全ルートに対する Vitest スイートを新設し、ローダー・アクション・コンポーネント挙動をモック駆動で検証できるよう拡充
[x]残存していた `console.log` 呼び出しを削除し、テスト出力とサーバーログをクリーンに保つよう整理

## 今後の課題

[x]admin.panel配下routesのページについて、コンテンツがページ縦幅をこえたときにページごとスクロールされてしまうので、コンテンツがスクロールされるように変更
[x]マンション表示用のUIを`./app/routes/admin.panel.editHouse.tsx`からcomponentとして切り出して、`./app/components/HouseCard.tsx`として管理。editHouse.editRelation.tsxに適用する
[x]各routesファイルに記載されているタスクの処理
  - [x]app/routes/admin.panel.addStore.tsx
  - [x]app/routes/admin.panel.editRelation.tsx
  - [x]app/routes/admin.panel.editStore.tsx
  - [x]app/routes/admin.panel.listHouse.tsx
  - [x]app/routes/admin.panel.editHouse.tsx
