export interface BotConfig {
  DISCORD_WEBHOOK_URL: string;
  ALPHAVANTAGE_API_KEY: string;
  PYPL_SHARES: number;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_BOT_TOKEN: string;
}

export interface StockData {
    price: number;
    symbol: string;
    change: number;
    changePercent: number;
    volume: number;
}
