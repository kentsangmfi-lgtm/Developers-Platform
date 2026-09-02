---
title: 合約概念
description: 讀取合約設定並計算有效交易數量。
---

合約是以 contract code 識別的可交易產品。WebProxy 在 `GET /api/contractSetting` 的 `market` 欄位回傳 contract code；FxServer 在 `contractCode` 等欄位使用相同值。

例如 `EURUSD` 代表外匯合約，`XAUUSD` 代表貴金屬合約。不要假設每個合約都是外匯貨幣對；請使用 WebProxy 回傳的 `category` 及貨幣欄位。

## 讀取合約設定

建立交易請求前先讀取合約設定。選擇 `market` 與所需合約相符的記錄。

| 欄位 | 用途 |
| --- | --- |
| `market` | 傳送給 FxServer 的 contract code。 |
| `enabled` | 合約在當前環境是否已啟用。 |
| `category` | 外匯、貴金屬、商品、CFD 或加密資產等產品類別。 |
| `baseCurr` | 與合約相關的基礎貨幣。 |
| `counterCurr` | 與合約相關的報價或相對貨幣。 |
| `contractSize` | 一手包含的合約單位。 |
| `minTradeLot` | 支援的最小手數。 |
| `minLotIncrementUnit` | 手數支援的增量。 |
| `decimalPlace` | 合約價格的顯示精度。 |

這些設定視環境而定。不要將其他帳戶、產品或部署環境的值寫死在整合程式中。

## 計算 amount

FxServer 的 `amount` 使用合約單位，不是手數：

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

`amount` 必須不少於 `minimumAmount`，並且是 `incrementAmount` 的倍數。

例如 `contractSize` 為 `100,000`，而請求手數為 `0.01` 手：

```text
amount = 0.01 × 100,000 = 1,000
```

## 分辨 contract code 及 chart code

交易端點使用 contract code，Realtime Chart Server 端點使用 chart code；兩者可能不同。

請求圖表數據前，呼叫 FxServer `GET /chartCode` 將 contract code 對應到 chart code。完整流程請參閱 [Realtime Chart Server](../realtime-chart-server/overview)。

## 伺服器權威

合約設定描述請求限制，但 FxServer 仍然是驗證、定價、保證金及執行結果的權威來源。當環境指示設定已變更時，請重新讀取設定並處理驗證錯誤，不要只依賴用戶端檢查。
