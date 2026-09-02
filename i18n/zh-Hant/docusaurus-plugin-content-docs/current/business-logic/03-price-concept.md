---
title: 價格概念
description: 選擇市價或報價模式，並正確處理 priceTag。
---

FxServer 在交易及平倉請求中支援市價及報價模式。所選 `priceMode` 決定請求必須包含哪些價格欄位。

## Bid 及 ask

報價包含兩邊價格：

- **Bid** 是交易者可以賣出的價格。
- **Ask** 是交易者可以買入的價格。

使用與所需方向相符的一邊價格。不要將 bid 及 ask 取平均數計算執行價格。

報價可以包含帳戶專屬的價格調整。使用傳送給已驗證交易者的值，不要使用由其他帳戶或環境觀察到的值。

## 市價模式

需要 FxServer 使用最新合資格報價時，將 `priceMode` 設為 `1`，並省略 `price` 及 `priceTag`。

市價模式不保證特定執行價格。伺服器回傳的最終交易、持倉、掛單及事件資料才是權威結果。

## 報價模式

提交由目標環境價格串流取得的報價時，將 `priceMode` 設為 `2`。

- `price` 使用與請求方向對應的 bid 或 ask 報價。
- 伺服器端價格驗證已啟用時傳送 `priceTag`。
- `priceTag` 格式為 `${tag};${price}`。
- 不要修改或自行產生 tag。

範例：

```json
{
  "priceMode": 2,
  "contractCode": "XAUUSD",
  "amount": 100,
  "buyOrSell": true,
  "price": 4762.9,
  "priceTag": "LLG1775716357987;4762.9"
}
```

FxServer 可以用 `msg: "710"` 拒絕過期或無效的 `priceTag`。價格驗證已啟用時，缺少 `priceTag` 可能回傳 `msg: "2001"`。

## 請求價格及執行價格

請求價格表示用戶端在報價模式選擇的報價，不是執行證明。

處理可以立即完成，也可能透過對沖、延遲或人工流程繼續。使用已完成的伺服器回應及後續帳戶、持倉、掛單及事件狀態，確定執行結果及價格。

## 相關指南

- 閱讀 [即時價格串流](../fx-server/price-steaming) 了解報價模式使用的欄位。
- 閱讀 [REST API 基礎](../fx-server/general-rest-api-information) 了解回應處理及重複請求保護。
- 參閱 [FxServer Trader API](../fx-server/openapi-trader) 查看完整請求 schema。
