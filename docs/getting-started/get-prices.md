---
sidebar_position: 2
title: Get live prices
description: Install fxserverclientpython, connect with your API key, and fetch the latest price for a contract.
---

This guide installs the `fxserverclientpython` library and uses it to log in and fetch live prices. The library only handles connecting to your trading account and fetching prices — trading operations still go through the RESTful APIs from [Make your first trade](./first-trade.md).

## Requirements

- Python 3.12 or higher installed on your machine.

## 1. Install

Install the library from the package index using pip:

```powershell
pip install fxserverclientpython --extra-index-url https://mf-technologies.github.io/Python-package-repositories/simple/
```

## 2. Get your connection settings

Log in to your Trading Terminal, then open the API Key Management Page.

You'll be given a configuration snippet on the account portal website. It looks like this:

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

Use the values supplied by the API Key Management page rather than constructing the endpoints or credentials yourself. The `valid_generated_token` value is the API key copied from that page; it is not the short-lived `access_token` returned by WebProxy `POST /api/tokens/auth`.

When `FxServerClientLib.login()` runs, the library exchanges the API key through the configured WebProxy endpoint and establishes the supported price session. Do not replace `valid_generated_token` with an access token.

### Create a new API key

- Press the Create button on the API Key Management Page
- Fill in the necessary info
- The Read permission is enough for login and fetching prices
- Copy your generated API Key to a safe place
- This API Key becomes your `valid_generated_token`

## 3. Connect and log in

Create a Python file (e.g. `quickstart.py`) with the following:

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

Run it:

```powershell
python quickstart.py
```

If login fails, double check that you copied the config block correctly and that your token hasn't expired — ask on the account portal website for a fresh one if needed.

## 4. Get the latest price for a symbol

Once logged in, use the exact contract code returned by the account's contract settings. Price updates arrive asynchronously, so wait for the first quote instead of treating an immediate `None` as a missing contract:

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

Add this right after the `login_reply` line inside `main()`. If no quote arrives within about 10 seconds, the example raises `TimeoutError`; verify the contract code and connection settings before retrying.

### Putting it together

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

## Next steps

- See [Realtime Chart Server](../realtime-chart-server/overview.md) to resolve a chart code and retrieve historical bars.
- See [Price concept](../business-logic/03-price-concept.md) for how prices are formed and quoted.
- See [Price streaming](../fx-server/price-steaming.md) for streaming price updates instead of one-off fetches.
