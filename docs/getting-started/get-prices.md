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

The only missing piece is `valid_generated_token`. You can create it using the steps below:

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

Once logged in, you can fetch the latest price for any contract/symbol (e.g. `XAUUSD`, `GBPNZD`) using `get_price_info`:

```python
    price = fxserver_client_lib.get_price_info("XAUUSD")
    print("XAUUSD price:", price)
```

Add this right after the `login_reply` line inside `main()`. If the symbol doesn't exist, `price` will be `None`.

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

    price = fxserver_client_lib.get_price_info("XAUUSD")
    print("XAUUSD price:", price)

if __name__ == "__main__":
    asyncio.run(main())
```

## Next steps

- See [Price concept](../business-logic/03-price-concept.md) for how prices are formed and quoted.
- See [Price streaming](../fx-server/price-steaming.md) for streaming price updates instead of one-off fetches.
