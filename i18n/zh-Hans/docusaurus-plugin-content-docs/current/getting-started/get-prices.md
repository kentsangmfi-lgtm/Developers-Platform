---
sidebar_position: 2
title: 获取实时价格
description: 安装 fxserverclientpython，使用 API key 连接并获取合约的最新价格。
---

本指南会安装 `fxserverclientpython` 库，并用它登录账户及获取实时价格。这个库只负责连接交易账户及获取价格；交易操作仍然使用 [完成第一笔交易](./first-trade) 介绍的 RESTful APIs。

## 环境要求

- 电脑已安装 Python 3.12 或以上版本。

## 1. 安装

使用 pip 从软件包索引安装库：

```powershell
pip install fxserverclientpython --extra-index-url https://mf-technologies.github.io/Python-package-repositories/simple/
```

## 2. 获取连接设置

登录 Trading Terminal，然后打开 API Key Management 页面。

账户入口网站会提供以下格式的设置片段：

```python
user_config_dict = {
    "endpoint": "wss://<your-fxserver-address>/websocket",
    "price_agent_endpoint": "wss://<your-price-agent-address>/websocket",
    "trade_key": "<your-trade-key>",
    "webproxy_endpoint": "https://<your-webproxy-address>/webproxy",
    "username": "<your-username>",
    "valid_generated_token": "<your-generated-token>"
}
```

请使用 API Key Management 页面提供的值，不要自行组合端点或凭证。`valid_generated_token` 是由该页面复制的 API key，不是 WebProxy `POST /api/tokens/auth` 返回的短期 `access_token`。

`FxServerClientLib.login()` 执行时，库会通过已设置的 WebProxy 端点交换 API key，再创建受支持的价格会话。不要用 access token 取代 `valid_generated_token`。

### 创建新 API key

- 在 API Key Management 页面按 **Create**。
- 输入所需信息。
- 登录及获取价格只需 `Read` 权限。
- 将生成的 API key 复制到安全位置。
- 这个 API key 就是 `valid_generated_token`。

## 3. 连接及登录

创建一个 Python 文件（例如 `quickstart.py`），内容如下：

```python
import asyncio
from fxserverclientpython import FxServerClientLib

async def main():
    loop = asyncio.get_running_loop()
    fxserver_client_lib = FxServerClientLib(loop)

    # Paste the config block you got from the website here
    user_config_dict = {
        "endpoint": "wss://<your-fxserver-address>/websocket",
        "price_agent_endpoint": "wss://<your-price-agent-address>/websocket",
        "trade_key": "<your-trade-key>",
        "webproxy_endpoint": "https://<your-webproxy-address>/webproxy",
        "username": "<your-username>",
        "valid_generated_token": "<your-generated-token>"
    }

    fxserver_client_lib.init(user_config_dict)

    try:
        login_reply = await fxserver_client_lib.login()
        print("Login successful:", login_reply)
    except Exception as e:
        print("Login failed:", e)
        return

if __name__ == "__main__":
    asyncio.run(main())
```

执行：

```powershell
python quickstart.py
```

如果登录失败，请检查设置片段是否正确，以及 token 是否已过期。有需要时，请在账户入口网站生成新 API key。

## 4. 获取合约的最新价格

登录后，使用账户合约设置返回的完整 contract code。价格会以异步方式更新，因此应等待第一个报价，不要将实时返回的 `None` 解读为合约不存在：

```python
    contract_code = "CONTRACT_CODE_FROM_CONTRACT_SETTINGS"

    for _ in range(100):
        price = fxserver_client_lib.get_price_info(contract_code)
        if price is not None:
            break
        await asyncio.sleep(0.1)
    else:
        raise TimeoutError(f"No price received for {contract_code}")

    print(f"{contract_code} price:", price)
```

将这段代码放在 `main()` 内的 `login_reply` 之后。如果约 10 秒内仍未收到报价，示例会抛出 `TimeoutError`。重试前，请先检查 contract code 及连接设置。

### 完整示例

```python
import asyncio
from fxserverclientpython import FxServerClientLib

async def main():
    loop = asyncio.get_running_loop()
    fxserver_client_lib = FxServerClientLib(loop)

    user_config_dict = {
        "endpoint": "wss://<your-fxserver-address>/websocket",
        "price_agent_endpoint": "wss://<your-price-agent-address>/websocket",
        "trade_key": "<your-trade-key>",
        "webproxy_endpoint": "https://<your-webproxy-address>/webproxy",
        "username": "<your-username>",
        "valid_generated_token": "<your-generated-token>"
    }

    fxserver_client_lib.init(user_config_dict)

    try:
        login_reply = await fxserver_client_lib.login()
        print("Login successful:", login_reply)
    except Exception as e:
        print("Login failed:", e)
        return

    contract_code = "CONTRACT_CODE_FROM_CONTRACT_SETTINGS"

    for _ in range(100):
        price = fxserver_client_lib.get_price_info(contract_code)
        if price is not None:
            break
        await asyncio.sleep(0.1)
    else:
        raise TimeoutError(f"No price received for {contract_code}")

    print(f"{contract_code} price:", price)

if __name__ == "__main__":
    asyncio.run(main())
```

## 后续步骤

- 阅读 [Realtime Chart Server](../realtime-chart-server/overview) 对应 chart code 及读取历史 K 线。
- 阅读 [价格概念](../business-logic/price-concept) 了解价格的组成及报价方式。
- 阅读 [实时价格数据流](../fx-server/price-steaming) 获取持续价格更新。
