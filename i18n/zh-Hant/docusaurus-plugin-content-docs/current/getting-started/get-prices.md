---
sidebar_position: 2
title: 取得即時價格
description: 安裝 fxserverclientpython，使用 API key 連線並取得合約的最新價格。
---

本指南會安裝 `fxserverclientpython` 程式庫，並用它登入帳戶及取得即時價格。這個程式庫只負責連接交易帳戶及取價；交易操作仍然使用 [完成第一筆交易](./first-trade) 介紹的 RESTful APIs。

## 環境要求

- 電腦已安裝 Python 3.12 或以上版本。

## 1. 安裝

使用 pip 從套件索引安裝程式庫：

```powershell
pip install fxserverclientpython --extra-index-url https://mf-technologies.github.io/Python-package-repositories/simple/
```

## 2. 取得連線設定

登入 Trading Terminal，然後開啟 API Key Management 頁面。

帳戶入口網站會提供以下格式的設定片段：

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

請使用 API Key Management 頁面提供的值，不要自行組合端點或憑證。`valid_generated_token` 是由該頁面複製的 API key，不是 WebProxy `POST /api/tokens/auth` 回傳的短效 `access_token`。

`FxServerClientLib.login()` 執行時，程式庫會透過已設定的 WebProxy 端點交換 API key，再建立受支援的價格工作階段。不要用 access token 取代 `valid_generated_token`。

### 建立新 API key

- 在 API Key Management 頁面按 **Create**。
- 輸入必要資料。
- 登入及取得價格只需 `Read` 權限。
- 將產生的 API key 複製到安全位置。
- 這個 API key 就是 `valid_generated_token`。

## 3. 連線及登入

建立一個 Python 檔案（例如 `quickstart.py`），內容如下：

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

執行：

```powershell
python quickstart.py
```

如果登入失敗，請檢查設定片段是否正確，以及 token 是否已過期。有需要時，請在帳戶入口網站產生新 API key。

## 4. 取得合約的最新價格

登入後，使用帳戶合約設定回傳的完整 contract code。價格會以非同步方式更新，因此應等待第一個報價，不要將即時回傳的 `None` 解讀為合約不存在：

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

將這段程式碼放在 `main()` 內的 `login_reply` 之後。如果約 10 秒內仍未收到報價，範例會拋出 `TimeoutError`。重試前，請先檢查 contract code 及連線設定。

### 完整範例

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

## 後續步驟

- 閱讀 [Realtime Chart Server](../realtime-chart-server/overview) 對應 chart code 及讀取歷史 K 線。
- 閱讀 [價格概念](../business-logic/price-concept) 了解價格的組成及報價方式。
- 閱讀 [即時價格串流](../fx-server/price-steaming) 取得持續價格更新。
