# 🔌 ATOM Arbitrage - API Reference

Complete API documentation for the ATOM Arbitrage System backend.

## 🔐 Authentication

All API endpoints (except public ones) require JWT authentication.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

## 👤 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## ⚙️ Configuration Endpoints

### Get Configurations
```http
GET /api/config
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "High Frequency Strategy",
      "min_profit_basis_points": 50,
      "max_slippage_basis_points": 300,
      "max_gas_price_gwei": 50,
      "enabled_tokens": ["0x4200...", "0x8335..."],
      "enabled_dexes": ["uniswap_v2", "uniswap_v3"],
      "flash_loan_enabled": true,
      "max_trade_amount_eth": 1.0,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Configuration
```http
POST /api/config
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Strategy",
  "min_profit_basis_points": 50,
  "max_slippage_basis_points": 300,
  "max_gas_price_gwei": 50,
  "enabled_tokens": ["0x4200000000000000000000000000000000000006"],
  "enabled_dexes": ["uniswap_v2", "uniswap_v3"],
  "flash_loan_enabled": true,
  "max_trade_amount_eth": 1.0
}
```

### Update Configuration
```http
PUT /api/config?id=<config_id>
Authorization: Bearer <token>
```

### Delete Configuration
```http
DELETE /api/config?id=<config_id>
Authorization: Bearer <token>
```

## 📊 Trading Endpoints

### Get Trades
```http
GET /api/trades?page=1&limit=50&status=success
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `status` (optional): Filter by status (pending, success, failed, reverted)
- `token_in` (optional): Filter by input token address
- `token_out` (optional): Filter by output token address
- `dex_path` (optional): Filter by DEX path
- `start_date` (optional): Filter from date (ISO 8601)
- `end_date` (optional): Filter to date (ISO 8601)
- `sort_by` (optional): Sort field (default: executed_at)
- `sort_order` (optional): Sort order (asc, desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "token_in": "0x4200000000000000000000000000000000000006",
      "token_out": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "amount_in": 1.0,
      "amount_out": 2000.5,
      "dex_path": "uniswap_v2->balancer",
      "profit": 0.0025,
      "gas_used": 150000,
      "gas_price_gwei": 20,
      "tx_hash": "0xabc123...",
      "block_number": 12345678,
      "status": "success",
      "executed_at": "2024-01-01T12:00:00Z",
      "confirmed_at": "2024-01-01T12:01:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "totalPages": 25
  }
}
```

## 📈 Dashboard Endpoints

### Get Dashboard Stats
```http
GET /api/dashboard/stats?days=30
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_trades": 1250,
      "successful_trades": 1063,
      "total_profit": 12.5678,
      "success_rate": 85.04,
      "avg_profit_per_trade": 0.0101,
      "total_gas_used": 187500000,
      "avg_gas_per_trade": 150000
    },
    "profit_by_token": [
      {
        "token_in": "0x4200000000000000000000000000000000000006",
        "total_profit": 8.1234,
        "trade_count": 750,
        "avg_profit": 0.0108
      }
    ],
    "profit_by_dex": [
      {
        "dex_path": "uniswap_v2->balancer",
        "total_profit": 5.6789,
        "trade_count": 500,
        "avg_profit": 0.0114,
        "success_rate": 88.2
      }
    ],
    "daily_summary": [
      {
        "date": "2024-01-01",
        "total_profit": 0.4567,
        "trade_count": 45,
        "success_count": 38,
        "avg_profit": 0.0101
      }
    ],
    "recent_activity": [
      {
        "activity_type": "trade",
        "activity_id": "uuid",
        "description": "Successful arbitrage: WETH/USDC",
        "value": 0.0025,
        "status": "success",
        "timestamp": "2024-01-01T12:00:00Z",
        "metadata": {
          "gas_used": 150000,
          "dex_path": "uniswap_v2->balancer"
        }
      }
    ]
  }
}
```

## 🤖 Bot Control Endpoints

### Get Bot Status
```http
GET /api/bot/control
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contract": {
      "address": "0xFc905877348deA2f91000fe99F94E0AfAEDEB590",
      "paused": false,
      "config": {
        "minProfitBasisPoints": "50",
        "maxSlippageBasisPoints": "300",
        "maxGasPrice": "50.0",
        "totalTrades": "1250",
        "successfulTrades": "1063",
        "totalProfit": "12.5678",
        "totalGasUsed": "187500000"
      }
    },
    "bots": [
      {
        "id": "uuid",
        "config_id": "uuid",
        "status": "running",
        "last_scan_at": "2024-01-01T12:00:00Z",
        "opportunities_found": 150,
        "trades_executed": 45,
        "total_profit": 2.3456,
        "uptime_seconds": 86400,
        "error_message": null,
        "metadata": {},
        "updated_at": "2024-01-01T12:00:00Z",
        "arbitrage_config": {
          "id": "uuid",
          "name": "High Frequency Strategy",
          "user_id": "uuid",
          "is_active": true
        }
      }
    ],
    "recentLogs": [
      {
        "id": "uuid",
        "level": "info",
        "component": "orchestrator",
        "message": "Opportunity detected and executed",
        "details": {},
        "created_at": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Control Bot Actions
```http
POST /api/bot/control
Authorization: Bearer <token>
Content-Type: application/json
```

**Start Bot:**
```json
{
  "action": "start",
  "configId": "uuid"
}
```

**Stop Bot:**
```json
{
  "action": "stop",
  "configId": "uuid"
}
```

**Pause Contract:**
```json
{
  "action": "pause_contract"
}
```

**Unpause Contract:**
```json
{
  "action": "unpause_contract"
}
```

**Update Contract Config:**
```json
{
  "action": "update_contract_config",
  "contractConfig": {
    "minProfitBasisPoints": 75,
    "maxSlippageBasisPoints": 250,
    "maxGasPriceGwei": 40
  }
}
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Messages
- `"Unauthorized"` - Missing or invalid JWT token
- `"Access denied"` - Insufficient permissions
- `"Invalid credentials"` - Wrong email/password
- `"User already exists"` - Email already registered
- `"Configuration not found"` - Invalid config ID
- `"Internal server error"` - Server-side error

## 🔄 Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Authentication**: 5 requests per minute
- **Configuration**: 60 requests per minute
- **Trading Data**: 120 requests per minute
- **Dashboard**: 30 requests per minute
- **Bot Control**: 10 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## 🔍 Filtering and Pagination

### Pagination
Most list endpoints support pagination:
```http
GET /api/trades?page=2&limit=25
```

### Filtering
Use query parameters for filtering:
```http
GET /api/trades?status=success&token_in=0x4200...&start_date=2024-01-01
```

### Sorting
Control result ordering:
```http
GET /api/trades?sort_by=profit&sort_order=desc
```

## 🧪 Testing

### Using cURL
```bash
# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get trades with token
curl -X GET https://your-domain.com/api/trades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Import the API collection
2. Set up environment variables
3. Use the authentication flow
4. Test all endpoints

---

**📚 For more examples and advanced usage, see our [GitHub repository](https://github.com/your-username/atom-arbitrage).**
