---
title: 价格概念
description: 选择市价或报价模式，并正确处理 priceTag。
---

FxServer 在交易及平仓请求中支持市价及报价模式。选择的 `priceMode` 决定请求必须包含哪些价格字段。

## Bid 及 ask

报价包含两边价格：

- **Bid** 是交易者可以卖出的价格。
- **Ask** 是交易者可以买入的价格。

使用与所需方向相符的一边价格。不要将 bid 及 ask 取平均数计算执行价格。

报价可以包含账户专属的价格调整。使用传送给已验证交易者的值，不要使用由其他账户或环境观察到的值。

## 市价模式

需要 FxServer 使用最新合资格报价时，将 `priceMode` 设为 `1`，并省略 `price` 及 `priceTag`。

市价模式不保证特定执行价格。服务器返回的最终交易、持仓、挂单及事件数据才是权威结果。

## 报价模式

提交由目标环境价格数据流获取的报价时，将 `priceMode` 设为 `2`。

- `price` 使用与请求方向对应的 bid 或 ask 报价。
- 服务器端价格验证已启用时传送 `priceTag`。
- `priceTag` 格式为 `${tag};${price}`。
- 不要修改或自行生成 tag。

示例：

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

FxServer 可以用 `msg: "710"` 拒绝过期或无效的 `priceTag`。价格验证已启用时，缺少 `priceTag` 可能返回 `msg: "2001"`。

## 请求价格及执行价格

请求价格表示客户端在报价模式选择的报价，不是执行证明。

处理可以立即完成，也可能通过对冲、延迟或人工流程继续。使用已完成的服务器响应及后续账户、持仓、挂单及事件状态，确定执行结果及价格。

## 相关指南

- 阅读 [实时价格数据流](../fx-server/price-steaming) 了解报价模式使用的字段。
- 阅读 [REST API 基础](../fx-server/general-rest-api-information) 了解响应处理及重复请求保护。
- 参阅 [FxServer Trader API](../fx-server/openapi-trader) 查看完整请求 schema。
