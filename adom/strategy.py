from dotenv import load_dotenv
load_dotenv()

import json
import os
from datetime import datetime, timedelta
from uuid import uuid4
from decimal import Decimal

def generate_signal(buy_price, sell_price, buy_dex, sell_dex, token_in, token_out):
    amount_in = Decimal("1000")
    flash_loan_fee_pct = Decimal(os.getenv("FLASH_LOAN_FEE", "0.0009"))
    gas_cost_usd = Decimal(os.getenv("GAS_COST_USD", "1.0"))
    slippage_buffer = Decimal("0.005")  # 0.5%

    gross_profit = (sell_price - buy_price) * amount_in
    flash_fee = amount_in * flash_loan_fee_pct
    net_profit = gross_profit - flash_fee - gas_cost_usd
    roi = net_profit / amount_in

    signal = {
        "id": f"adom-{uuid4()}",
        "timestamp": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(seconds=15)).isoformat(),
        "action": "execute",
        "token_in": token_in,
        "token_out": token_out,
        "amount_in": float(amount_in),
        "amount_in_unit": "USDC",
        "amount_out_est": float(sell_price * amount_in),
        "buy_price": float(buy_price),
        "sell_price": float(sell_price),
        "buy_dex": buy_dex,
        "sell_dex": sell_dex,
        "flash_loan_fee_usd": float(flash_fee),
        "gas_cost_usd": float(gas_cost_usd),
        "net_profit_usd": float(net_profit),
        "roi": float(roi),
        "slippage_tolerance": float(slippage_buffer),
        "confidence_score": 0.99,
        "status": "pending"
    }

    with open("signals.json", "w") as f:
        json.dump([signal], f, indent=2)

    print("[ADOM] ✅ Signal generated with UUID + expiry")
    return signal
