# 🚀 LiteTouch (ライトタッチ) 超詳細実装仕様書 ＆ 技術設計書

本仕様書は、開発・運用チームが即座に実装・配信・テスト・利用を開始できるよう、マルチモジュール配信アーキテクチャ、Pure Vanilla JS コアエンジン構造、JSON Schema データ構造、各種機能の内部処理フロー、およびセキュリティ・免責事項を網羅した完全技術仕様書です。

---

## 1. ディレクトリ構造 ＆ 配信モジュール設計

GitHub Pages（`/docs` ルート）を起点とし、オープンソース CDN（jsDelivr 等）を経由して用途に応じた Pure Vanilla JS 単一ファイルを高速配信します。

```text
/
├── README.md             # 本技術仕様書
├── package.json          # ビルド・テスト設定
├── build.js              # esbuild 単一バニラJS IIFE バンドラー
├── .gitignore            # 追跡除外設定
├── src/                  # 開発ソースコード (Pure Vanilla JS)
│   ├── core/             # 共通コアエンジン (Decoder, Domain, Retry, Shadow, GA4, NativeBypass)
│   ├── modules/          # 各単体機能モジュール (Guide, EFO, Menu, AutoFlow)
│   └── entries/          # 配信エントリーポイント (all, guide, efo, menu, autoflow)
├── docs/                 # GitHub Pages / CDN 配信ルート
│   ├── index.html        # 公式TOP紹介ページ (Enterprise LP)
│   ├── builder.html      # タグ自動生成ビルダー UI
│   ├── demo.html         # 動作体験デモプレイグラウンド
│   ├── docs.html         # 導入マニュアル・GA4連携手順
│   ├── terms.html        # 利用規約 (AS-IS原則)
│   ├── css/
│   │   └── style.css     # 公式サイト共通デザインスタイル
│   ├── js/
│   │   ├── builder.js    # ビルダー画面専用ロジック (タグ生成・Base64エンコード)
│   │   └── demo.js       # デモページ専用インタラクション制御
│   └── v1/               # 【配信JSモジュール】 (Pure Vanilla JS IIFE)
│       ├── all.js        # 【全部入り】フル機能エンジン (ガイド/EFO/メニュー/自動操作)
│       ├── guide.js      # 【単体】ガイド・ステップツアー専用モジュール
│       ├── efo.js        # 【単体】EFO入力エラー指導専用モジュール
│       ├── menu.js       # 【単体】クイックメニュー専用モジュール
│       └── autoflow.js   # 【単体】フォーム自動操作専用モジュール
└── tests/                # テストスイート
    ├── litetouch.spec.js # Playwright E2E テスト
    └── unit.test.js      # 単体テスト
```

### 配信モジュール別ユースケース一覧

| 配信ファイル | 対応機能 | 想定用途・特徴 |
| :--- | :--- | :--- |
| **`v1/all.js`** | Guide + EFO + Menu + AutoFlow | 複数機能を同時利用する場合、または将来的な機能拡張を行う場合。 |
| **`v1/guide.js`** | ガイド / ツアー / 暗転オーバーレイ | 新機能案内やオンボーディングツアーのみを最軽量で導入したい場合。 |
| **`v1/efo.js`** | EFO 入力エラーリアルタイム指導 | フォーム離脱防止・CVR改善（入力チェック補佐）のみを行う場合。 |
| **`v1/menu.js`** | クイックメニュー (常駐/モーダル) | FAQやヘルプ導線を右下に常駐させたい場合。 |
| **`v1/autoflow.js`** | フォーム自動操作 (Auto-fill & Click) | デモフォームの自動入力や、定型操作の自動化スクリプトとして利用する場合。 |

---

## 2. 共通コアエンジン基盤構造 (全モジュール共通仕様)

すべての配信 JS ファイル（`all.js` および各単体モジュール）は、外部依存ライブラリゼロ（Pure Vanilla JS）の即時実行関数（IIFE）でカプセル化され、以下の 6 つの共通コアロジックを保持します。

### 2.1 設定デコーダー (Base64 UTF-8 安全デコード ＆ 手動設定フォールバック)
`data-cfg` 属性から渡される圧縮 Base64 文字列を解凍します。
- **処理フロー**: `atob()` でデコード後、`encodeURIComponent` パターンで UTF-8 多バイト文字（日本語）を完全復元して `JSON.parse` を実行。
- **手動設定フォールバック**: `data-cfg` が存在しない場合、`window.LiteTouchConfig` グローバルオブジェクトから直接設定を取得可能。

### 2.2 ドメインバリデータ (`domain`)
- **仕様**: 実行時に `window.location.hostname` を検証。
- **スキップ（常時許容）ロジック**: `domain` が未設定・空文字 `""`・`"*"` の場合、および `localhost` / `127.0.0.1` / `::1` での実行時はドメインチェックを自動スキップ。
- **一致判定**: 指定ドメインが存在する場合は厳格な後方一致（サブドメイン含む）判定を行い、不一致時は警告ログを出力して UI 描画・イベント監視を即時停止。

### 2.3 遅延監視リトライエンジン
- **仕様**: 対象セレクタ（`document.querySelector`）が存在しない場合、`intervalMs`（デフォルト10秒）間隔で最大 `maxRetries`（デフォルト3回）リトライ監視。SPA（React/Vue/Angular等）の遅延描画要素に自動追従。

### 2.4 Shadow DOM UIレンダラー ＆ テーマCSS注入
- **仕様**: `document.body` に `#litetouch-host` 要素を追加し、`attachShadow({ mode: 'open' })` を適用。ホストサイトの CSS / JS 汚染・干渉を完全遮断。
- **テーマ制御**: 設定（`theme`）の `primaryColor` や `borderRadius` を CSS カスタム変数（`--lt-primary` 等）として注入し、`customCss` によるスタイル追加・上書きにも対応。

### 2.5 モバイル対応レスポンシブ（ボトムシート表示）
- **仕様**: 画面幅 600px 以下のモバイル環境では、吹き出し表示が自動的に画面下部固定（`bottom: 16px; width: 90%;`）の「ボトムシート」に切替わり、下からのスライドインアニメーション（`translateY`）と右上閉じボタンを表示。

### 2.6 GA4 (Google Analytics 4) 自動連携
- **仕様**: 優先的に `typeof window.gtag === 'function'` をチェックし、存在すれば `gtag('event', ...)` で発火。
- 次点として `window.dataLayer` (Array) へ `push`。
- どちらも存在しない場合はエラーを出さず、安全に処理をスルー（サイレントスキップ）。

### 2.7 Native Value Setter バイパス (AutoFlow)
- **仕様**: React や Vue 等の仮想 DOM フレームワークに対応するため、`HTMLInputElement.prototype` または `HTMLSelectElement.prototype` の `value` セッターを直接呼び出し、`input` / `change` / `blur` イベントをバブリング発火（`bubbles: true`）させて仮想 DOM State を確実に更新。

---

## 3. モジュール別データ構造仕様 (JSON Schema)

### 3.1 共通ルート設定構造 (data-cfg 解凍後)
```json
{
  "version": "1.0.0",
  "domain": "example.com",
  "theme": {
    "primaryColor": "#2563eb",
    "borderRadius": "12px",
    "customCss": ".lt-card { font-size: 14px; }"
  },
  "ga4": {
    "enabled": true,
    "events": {
      "widget_view": true,
      "widget_error": true,
      "quick_menu_open": true,
      "auto_flow_execute": true
    }
  },
  "retryConfig": {
    "maxRetries": 3,
    "intervalMs": 10000
  },
  "features": []
}
```

### 3.2 ガイドモジュール構造 (`guide.js` / `all.js`)
```json
{
  "type": "guide",
  "id": "guide-001",
  "selector": "#submit-btn",
  "title": "送信ガイド",
  "content": "入力内容を確認し、ここをクリックしてください。",
  "showOverlay": true,
  "nextButtonText": "次へ",
  "prevButtonText": "戻る"
}
```

### 3.3 EFOモジュール構造 (`efo.js` / `all.js`)
```json
{
  "type": "efo",
  "id": "efo-001",
  "selector": "input[name='company']",
  "triggerEvent": "blur",
  "ruleType": "preset",
  "presetKey": "no_abbreviation",
  "customRegex": "",
  "errorMessage": {
    "title": "(株)などの略称は禁止です！",
    "content": "・〇〇株式会社\n・株式会社〇〇\nといった形式で入力してください。"
  }
}
```
**プリセット判定ルール**:
- `no_abbreviation`: `/\(株\)|\(有\)|\(代\)/` の検知
- `required`: `val.trim() === ''` の検知
- `email`: `!/^[^\s@]+@[^\s@]+\.[^\s@]+$/` の検知

### 3.4 クイックメニューモジュール構造 (`menu.js` / `all.js`)
```json
{
  "type": "quick_menu",
  "id": "menu-001",
  "triggerType": "sticky_icon",
  "title": "ヘルプ＆クイックポータル",
  "categories": [
    {
      "categoryName": "手続き",
      "items": [
        { "label": "新規登録はこちら", "url": "/register" },
        { "label": "よくある質問 (FAQ)", "url": "/faq" }
      ]
    }
  ]
}
```

### 3.5 オートフローモジュール構造 (`autoflow.js` / `all.js`)
```json
{
  "type": "auto_flow",
  "id": "flow-001",
  "steps": [
    { "selector": "#username", "action": "input", "value": "テスト太郎", "delayMs": 100 },
    { "selector": "#agree-check", "action": "click", "delayMs": 200 }
  ]
}
```

---

## 4. ビルダーUI分岐・スクリプトタグ生成ロジック (`builder.js`)

ビルダー画面では、選択された機能種別に応じて出力スクリプトのファイル名を動的に切り替え、Base64 UTF-8 エンコード処理を行います。

```javascript
/**
 * 埋め込みタグ出力生成関数
 * @param {string} selectedModule - 'all' | 'guide' | 'efo' | 'menu' | 'autoflow'
 * @param {Object} configObj - 設定オブジェクト
 * @param {string} repoPath - CDN Base URL
 */
function generateScriptTag(selectedModule, configObj, repoPath) {
  const jsonString = JSON.stringify(configObj);
  const encodedCfg = btoa(
    encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    })
  );

  const baseUrl = repoPath || "https://cdn.jsdelivr.net/gh/your-account/litetouch@main/docs/v1/";
  const fileName = selectedModule ? `${selectedModule}.js` : "all.js";

  return `<script src="${baseUrl}${fileName}" data-cfg="${encodedCfg}" defer></script>`;
}
```

---

## 5. 手動設定パターン (Manual JavaScript Config)

ビルダー（`builder.html`）を使用せず、手動で JavaScript を書いて設定を読み込ませることもサポートされています。

```html
<script>
  // スクリプト読み込み前にグローバル変数へ設定オブジェクトを直書き
  window.LiteTouchConfig = {
    version: "1.0.0",
    domain: "example.com",
    theme: {
      primaryColor: "#2563eb",
      borderRadius: "8px"
    },
    features: [
      {
        type: "efo",
        selector: "input[name='company']",
        triggerEvent: "blur",
        ruleType: "preset",
        presetKey: "no_abbreviation",
        errorMessage: {
          title: "(株)などの略称は禁止です！",
          content: "正規名称で入力してください。"
        }
      }
    ]
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/your-account/litetouch@main/docs/v1/efo.js" defer></script>
```

---

## 6. セキュリティ・DDoS耐性・CDN配信仕様

### 6.1 ドメインセキュリティ
- `domain` 設定により、無断でタグが別のサイトへコピー・貼り付けされた場合、`window.location.hostname` の検証によって実行を自動ブロックします。

### 6.2 DDoS耐性 ＆ 静的ファイル配信
- スクリプトファイルは完全な静的 JS ファイル（Static Assets）として配信されます。
- GitHub Pages（`/docs`）をオリジンとし、**jsDelivr** などのグローバル CDN エッジネットワーク経由で世界中に配信・キャッシュされるため、サーバーサイドの処理負荷や DB アクセスが発生せず、大規模な DDoS 攻撃に対しても極めて高い堅牢性を誇ります。

---

## 7. 利用規約 (AS-IS原則 ＆ 免責事項)

1. **現状有姿提供 (AS-IS 原則)**:
   本サービスは「現状有姿（AS-IS）」かつ「提供可能な限度」で提供されるものであり、提供者および開発者は、明示的・暗黙的を問わず、動作保証・適合性・正確性・継続性等について一切の保証を行いません。
2. **免責事項（完全無保証・責任不担保）**:
   本スクリプトの導入・利用・動作不良・障害等により生じたいかなる直接的・間接的損害（データ消失、営業損失、サイト不具合等含む）についても、提供者および開発者は理由の如何を問わず一切の責任を負いません。
3. **自己責任の原則**:
   利用ユーザーは、導入先環境において事前の動作検証およびテストを自己の責任において行うものとします。

---

## 8. テスト ＆ QA 検証基準表

| 検証カテゴリ | 検証対象 | テスト手順 | 合格基準 |
| :--- | :--- | :--- | :--- |
| **単体モジュール** | `v1/efo.js` | `efo.js` のみ読み込み環境で `(株)` を入力しフォーカスアウト。 | EFOエラー吹き出しが正常描画され、他モジュールの未定義エラー等が発生しないこと。 |
| **全部入り** | `v1/all.js` | ガイド、EFO、クイックメニュー、オートフローを同一設定に含めて実行。 | すべての機能が競合することなく正常に作動すること。 |
| **セキュリティ** | 全ファイル | 設定の `domain` に別ドメインを指定して実行。 | コンソールに警告が出力され、UI描画・イベント監視が一切行われないこと。 |
| **レスポンシブ** | UIレンダラー | 画面幅 600px 以下のモバイル実機/シミュレータで確認。 | 吹き出し表示が自動的に画面下部固定のボトムシート表示に切替わること。 |
| **フレームワーク** | `autoflow.js` | React/Vue フォームに対し自動入力を実行。 | State が更新され、送信時に値が保持されていること。 |

---

## 9. ローカル開発 ＆ ビルド手順

```bash
# 依存ライブラリのインストール
npm install

# Pure Vanilla JS IIFE モジュールのビルド (docs/v1/*.js)
npm run build

# 単体テストの実行
npm test
```
