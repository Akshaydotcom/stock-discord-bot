export interface BotConfig {
  DISCORD_WEBHOOK_URL: string;
  ALPHAVANTAGE_API_KEY: string;
  PYPL_SHARES: number;
}

export interface StockData {
    price: number;
    symbol: string;
    change: number;
    changePercent: number;
    volume: number;
}
