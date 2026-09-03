---
title: 合约概念
description: 读取合约设置并计算有效交易数量。
---

合约是以 contract code 识别的可交易产品。WebProxy 在 `GET /api/contractSetting` 的 `market` 字段返回 contract code；FxServer 在 `contractCode` 等字段使用相同值。

例如 `EURUSD` 代表外汇合约，`XAUUSD` 代表贵金属合约。不要假设每个合约都是外汇货币对；请使用 WebProxy 返回的 `category` 及货币字段。

## 读取合约设置

创建交易请求前先读取合约设置。选择 `market` 与所需合约相符的记录。

| 字段 | 用途 |
| --- | --- |
| `market` | 传送给 FxServer 的 contract code。 |
| `enabled` | 合约在当前环境是否已启用。 |
| `category` | 外汇、贵金属、商品、CFD 或加密资产等产品类别。 |
| `baseCurr` | 与合约相关的基础货币。 |
| `counterCurr` | 与合约相关的报价或相对货币。 |
| `contractSize` | 一手包含的合约单位。 |
| `minTradeLot` | 支持的最小手数。 |
| `minLotIncrementUnit` | 手数支持的增量。 |
| `decimalPlace` | 合约价格的显示精度。 |

这些设置视环境而定。不要将其他账户、产品或部署环境的值写死在集成程序中。

## 计算 amount

FxServer 的 `amount` 使用合约单位，不是手数：

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

`amount` 必须不少于 `minimumAmount`，并且是 `incrementAmount` 的倍数。

例如 `contractSize` 为 `100,000`，而请求手数为 `0.01` 手：

```text
amount = 0.01 × 100,000 = 1,000
```

## 分辨 contract code 及 chart code

交易端点使用 contract code，Realtime Chart Server 端点使用 chart code；两者可能不同。

请求图表数据前，调用 FxServer `GET /chartCode` 将 contract code 对应到 chart code。完整流程请参阅 [Realtime Chart Server](../realtime-chart-server/overview)。

## 服务器权威

合约设置描述请求限制，但 FxServer 仍然是验证、定价、保证金及执行结果的权威来源。当环境指示设置已变更时，请重新读取设置并处理验证错误，不要只依赖客户端检查。
