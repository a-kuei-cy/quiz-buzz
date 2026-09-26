# 興嘉課堂搶答器 V2.1｜教務處管理版

部署架構：**GitHub Pages + Google Apps Script + Google 試算表**。

## V2.1 新增功能

- 教務處管理者與教師帳號分級
- 教師個人題庫 / 全校共享題庫
- 教師只可編輯自己的題庫，共享題庫可直接使用
- 班級設定與教師指派
- 學生名冊 CSV 批次匯入
- 房間 PIN、QR Code、搶答順位、速度計分
- 活動歷史紀錄、排行榜、逐題作答明細
- 活動結果 CSV 匯出
- 從 V2.0 升級時保留既有資料

## 1. 後端安裝 / 從 V2.0 升級

1. 開啟原本的「興嘉課堂搶答器資料庫」Google 試算表。
2. 擴充功能 → Apps Script。
3. 將原本 `Code.gs` **完整替換**成本包的 `Code.gs`。
4. 儲存。
5. 在函式下拉選單選擇 `setupV21`，手動執行一次並授權。
6. `setupV21()` 會：
   - 保留既有 Config、Quizzes、Questions、Rooms、Participants、Answers、Buzzes 資料。
   - 新增 V2.1 所需欄位。
   - 新增 Teachers、Classes、Students 工作表。
   - 將 V2.0 舊題庫設為 `admin` 擁有、`shared` 全校共享。
   - 建立預設教務處管理帳號。

### 預設管理帳號

- 帳號：`admin`
- 密碼：`1234`

登入後請立即到「修改密碼」變更。

## 2. 重新部署 Apps Script

每次更換 `Code.gs` 後，都要建立新版本部署：

1. Apps Script → 部署 → 管理部署作業。
2. 編輯現有網頁應用程式部署。
3. 「版本」選 **新增版本**。
4. 執行身分：我。
5. 存取權：任何人。
6. 部署後確認 `/exec` 網址。

若沿用原部署，通常 `/exec` 網址不變。

## 3. 設定前端

只需要修改 `config.js`：

```js
window.XJ_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/你的部署ID/exec'
};
```

不需要再修改 index.html、teacher.html、admin.html。

## 4. GitHub Pages

將以下檔案全部上傳到同一個 Repository 根目錄：

- `index.html` 學生端
- `teacher.html` 教師端
- `admin.html` 教務處端
- `app.css`
- `common.js`
- `config.js`

GitHub → Settings → Pages → Deploy from a branch → main / root。

### 三個入口

- 學生：`.../index.html`
- 教師：`.../teacher.html`
- 教務處：`.../admin.html`

## 5. 建立教師帳號

1. 開啟 `admin.html`。
2. 使用 admin 登入。
3. 教師帳號 → 新增教師。
4. 設定帳號、姓名、密碼。
5. 一般教師角色選 `teacher`。

教師登入後可自行修改密碼。

## 6. 學生名冊批次匯入

教務處 → 學生名冊，可上傳 `sample_roster.csv` 或貼上 CSV。

欄位必須至少包含：

```csv
className,seatNo,name,grade
307,1,王小明,3
307,2,李小華,3
```

系統以「班級 + 座號」判定同一學生；重複匯入會更新姓名，不會一直新增。

Config 工作表中的 `strict_roster` 預設是 `false`：

- `false`：沒有名冊的學生仍可加入。
- `true`：必須符合班級名冊才能加入；姓名不符也會阻擋。

建議第一階段先維持 `false`，名冊確認完整後再改成 `true`。

## 7. 題庫 CSV 格式

```csv
type,text,option1,option2,option3,option4,answer,seconds,points
choice,題目,A,B,C,D,2,20,1000
truefalse,題目,,,,,true,15,1000
short,題目,,,,,標準答案,20,1000
```

題型：

- `choice`：answer 填 1、2、3、4
- `truefalse`：answer 填 true / false
- `short`：完全相同比對，但忽略前後空白與英文字母大小寫

## 8. 搶答機制說明

V2.1 仍採 GAS `LockService` 進行伺服器鎖定：

- 同一題多人同時按搶答時，由 GAS 寫入先後產生唯一 `seq`。
- 學生端與教師端每秒輪詢一次狀態。
- 優點：免固定費用、容易維護。
- 限制：不是 WebSocket 毫秒級即時平台。

若日後要做校級大型活動，可再升級 WebSocket / Cloudflare Durable Objects 版本。

## 9. 安全建議

- 請立即更改預設 admin 密碼。
- 不要把教師密碼寫在前端檔案。
- 教師密碼在試算表內以 SHA-256 雜湊保存，不儲存明碼。
- `admin.html` 的權限仍由 GAS 後端驗證，不是只靠頁面隱藏。
- 若教師離職，可由管理端停用帳號，不一定要刪除。

## 10. V2.0 → V2.1 注意事項

V2.0 使用「全校共用一組教師密碼」；V2.1 改為個別教師帳號。因此前端 localStorage 的登入 token 不共用，升級後教師需重新登入一次。
