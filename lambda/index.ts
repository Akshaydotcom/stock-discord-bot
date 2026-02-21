import { Handler } from "aws-lambda";
import axios from "axios";

interface StockData {
    price: number;
    symbol: string;
    change: number;
    changePercent: number;
    volume: number;
}

async function fetchStockPrice(symbol: string):Promise<StockData>{
    const apiKey = process.env.ALPHAVANTAGE_API_KEY

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

async function sendToDiscord(stockData:StockData):Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    const isPositive = stockData.change > 0;
    const color = isPositive ? 0x00FF00 : 0xFF0000; // Green or Red
    const emoji = isPositive ? '📈' : '📉';
    
    // const message = {
    //     embeds: [{
    //     title: `${emoji} ${stockData.symbol} Stock Update`,
    //     description: `Daily stock price for ${stockData.symbol}`,
    //     fields: [
    //         {
    //         name: 'Current Price',
    //         value: `$${stockData.price.toFixed(2)}`,
    //         inline: true
    //         },
    //         {
    //         name: 'Change',
    //         value: `$${stockData.change.toFixed(2)}`,
    //         inline: true
    //         },
    //         {
    //         name: 'Change %',
    //         value: `${stockData.changePercent.toFixed(2)}%`,
    //         inline: true
    //         },
    //         {
    //         name: 'Volume',
    //         value: stockData.volume.toLocaleString(),
    //         inline: false
    //         }
    //     ],
    //     color: color,
    //     timestamp: new Date().toISOString(),
    //     footer: {
    //         text: 'Data from Alpha Vantage'
    //     }
    //     }]
    // };

    if(!webhookUrl){
        console.log('Webhook URL not defined')
        return;
    }

    const payload = {
    embeds: [{
      title: `${emoji} ${stockData.symbol} Stock Update`,
      description: `Daily stock price for ${stockData.symbol}`,
      fields: [
        {
          name: 'Current Price',
          value: `$${stockData.price.toFixed(2)}`,
          inline: true
        },
        {
          name: 'Change',
          value: `$${stockData.change.toFixed(2)}`,
          inline: true
        },
        {
          name: 'Change %',
          value: `${stockData.changePercent.toFixed(2)}%`,
          inline: true
        },
        {
          name: 'Volume',
          value: stockData.volume.toLocaleString(),
          inline: false
        }
      ],
      color: color,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Data from Alpha Vantage'
      }
    }]
  };

  const response = await axios.post(webhookUrl, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
    console.log(response);
}

export const handler: Handler = async (event)=>{
    console.log('Event triggered:', JSON.stringify(event));
    console.log('Started execution of stock-discord-bot-lambda');

    try{
        const stockData = await fetchStockPrice('PYPL')
        await sendToDiscord(stockData);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Stock alert sent successfully' })
        }
    } catch(error){
        console.error('Error:', error);
        throw error;
    }
}