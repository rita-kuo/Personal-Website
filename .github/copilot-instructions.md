# TypeScript & Next.js (App Router) 開發規範

## 1. 樣式與動畫規範

- **禁用 Inline Styles**：嚴禁使用 `style={{...}}`。
- **Pico.css 優先**：利用 Pico.css 的語意化標籤（例如 `<main class="container">`, `<grid>`, `<article>`）進行佈局。
- **動畫實作**：僅使用 **Animate.css** 的類別（例如 `animate__animated animate__bounce`）。
- **Modal 樣式**：所有 Modal 的開啟及關閉均需要動畫效果。
- **自定義樣式**：若需微調，請使用 CSS Modules (`.module.css`)，保持 JSX 清爽。
- **字體大小限制**：除非有明確指示，否則字體大小不應超過 `h1`。
- **圖示來源**：使用 [remixicon](https://remixicon.com/) 作為圖示來源，避免使用其他圖示庫。
- **容器樣式**：所有容器、按鈕等含有內容之元素應盡可能縮小，已能涵蓋內容且不至於擁擠為原則。
- **框限、陰影樣式**：若需要框線、陰影，請使用主題色系的變化色（例如 `var(--primary-300)`），避免使用灰色或其他非主題色。

## 2. 頁面結構規範

- **Metadata**：每個頁面必須 export 一個包含 `title` 的 `metadata` 物件。
- **i18n 強制執行**：
    - 禁止在代碼中直接書寫硬編碼文字（例如 `<h1>你好</h1>`）。
    - 必須使用 i18n 字典或 Hook（例如 `const t = useTranslations()`）。
    - 確保所有顯示文字都經過多語系處理。
    - 記得在字典中添加對應的翻譯條目。

## 3. 代碼整潔與自我審查 (Code Quality & Review)

在輸出結果前，請執行以下心理審查步驟，確保代碼「乾淨整齊」：

- **DRY 原則**：是否有重複的邏輯可以抽離？
- **視覺純淨**：移除所有不必要的註解、console.log 以及未使用的 import。
- **格式一致**：確保縮排正確，變數命名具備語意化。
- **最終檢查**：再次確認有沒有不小心寫入的 `style` 屬性或硬編碼字串。

## 4. 執行指令

- **install**：每次執行 `npm install` 均須添加 `--legacy-peer-deps` 參數以避免相依性衝突。
- **prisma migrate**： 每次修改 schema 後，請同我確認後再執行 `npx prisma migrate dev`，避免產生多餘的 migration 檔案。

## 5. 表單

- 使用 React Hook Form 來處理表單。
- **表單驗證**：所有表單欄位必須包含基本驗證（例如必填欄位檢查）。
- **錯誤訊息**：提供使用者友善的錯誤訊息提示。
- **表單子元件**：表單若有子元件，使用 `useFormContext` 來存取表單狀態。

**只有當你確信代碼達到「生產級別的整潔度」時，才將結果回傳給使用者。**
