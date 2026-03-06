import axios from "axios";
import { BotConfig, StockData } from "../types";

export default async function fetchStockPrice(symbol: string, config: BotConfig):Promise<StockData>{
    const apiKey = config.ALPHAVANTAGE_API_KEY

    const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    const response = await axios.get(apiUrl);
    console.log(apiUrl);
    console.log(response);
    const data = response.data
    const quote = data['Global Quote'];

    return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume'])
    };
}
