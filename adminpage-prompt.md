# 管理画面作成

## 1. 依頼

- 次の内容を要点定義書に落としてください
- 生成AIに依頼するプロンプトの形式で記述してください

## 2. 内容

店舗名、マンション名に関する管理画面を作ろうとしています
UIとリンク、ルーティングをReact Routerと`<Outlet />`を活用して作成してください
DBへの接続などは私の方で実施しますのでUIイメージとフロント側でのstateによるUIやDOMの編集だけお願いします

データベースの型は次のようなものなので、考慮してUIも作成してください。
また、supabaseのJavaScriptライブラリの都合上、一括追加、一括削除、一括で同様の値に更新は可能ですが、個別の更新は都度実行するので、それを考慮したUIにしています。

database.types.ts

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      houses: {
        Row: {
          address: string
          apartment: string
          households: number
          id: number
          post: string
          prefectures: string
          store_id: string
        }
        Insert: {
          address: string
          apartment: string
          households: number
          id?: number
          post: string
          prefectures: string
          store_id: string
        }
        Update: {
          address?: string
          apartment?: string
          households?: number
          id?: number
          post?: string
          prefectures?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "houses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
        ]
      }
      stores: {
        Row: {
          id: number
          store: string
          store_id: string
        }
        Insert: {
          id?: number
          store: string
          store_id: string
        }
        Update: {
          id?: number
          store?: string
          store_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
```

- 管理画面のトップページ ('/admin/panel')
  - サイドバー
    - 店舗追加
    - 店名変更・削除
    - マンション追加
    - マンション変更・削除
    - マンション紐付け変更
  - メインページ
    - あまりちゃんと決めてないです。いい感じのイメージでお願いします
- ログイン画面 ('/admin/login')
  - 機能不要ですのでUIイメージのみ作成をお願いします
- 店舗追加 ('/admin/panel/addStore')
  - 店舗コード（0105から始まる13桁数字の文字列）、店舗名を入力するForm
  - 最初は1つのFormのみ表示され、＋ボタンでFormが追加され、複数同時に追加できる
  - 追加ボタンを押すことでモーダルを表示
    - モーダルには追加する店舗コードと店舗の一覧が表示される
    - 追加ボタンで追加
    - キャンセルボタンでキャンセル
    - 追加を押し、サーバーからの200リクエストで成功のトーストを表示（今回はPromise, Resolve, SetTimeOutでダミーのAPIを利用）
- 店名変更・削除 ('/admin/panel/editStore')
  - 更新、削除、リセットのボタン
  - 店名入力と検索ボタンでフィルタリング
  - チェックボックス、店舗名、店舗コード一覧のForm
  - 店舗コードは変更不可
  - 店舗名はinputタグのvalueであり変更可能
  - チェックボックスを入れた店舗を削除ボタンでモーダルを表示
    - 削除して良いですかの確認
    - DB側でDELETE RESTRICTを設定しているので、マンションとリレーションされている店舗は削除できない
    - 削除しようとして200のリクエストで削除しましたのトースト
    - 200以外のリクエストで、削除に失敗しました。マンションの紐付けを確認してくださいのモーダル
  - 店舗名を変更して更新ボタンを押すと更新
    - 変更があった店舗のみ更新のリクエストを投げる
  - リセットボタンで変更内容を初期状態にリセット（フロントの状態を戻す）
- マンション追加 ('/admin/panel/addHouse')
  - 必要な項目を入力できるForm（DatabaseのhousesのInsert参照）
  - 最初は1つのFormのみ表示され、＋ボタンでFormが追加され、複数同時に追加できる
  - 追加ボタンを押すことでモーダルを表示
    - モーダルには追加する店舗コードと店舗の一覧が表示される
    - 追加ボタンで追加
    - キャンセルボタンでキャンセル
    - 追加を押し、サーバーからの200リクエストで成功のトーストを表示（今回はPromise, Resolve, SetTimeOutでダミーのAPIを利用）
- マンション変更・削除 ('/admin/panel/editHouse')
  - 店舗名でマンションを検索
  - マンションのデータがカード形式で表示される。
  - カードにチェックボックスを付与
  - チェックしたものを一括削除ボタンで削除
    - ボタン押下後にモーダルで確認
  - カードに更新ボタンを付与。変更して更新ボタンを押下することで更新
- マンション紐付け変更 ('/admin/panel/editRelation')
  - 店舗名でマンションを検索
  - マンションのデータがカード形式で表示される。
  - カードにチェックボックスを付与
  - ページ上部に変更後店舗も同様に入力
  - 変更ボタンでチェックされたマンションのstore_Idを変更後店舗のstore_Idに一括変更
