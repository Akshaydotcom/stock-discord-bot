import { StockData, BotConfig } from "../types";
import axios from "axios";

export default async function sendToDiscord(stockData:StockData, config: BotConfig):Promise<void> {
    const webhookUrl = config.DISCORD_WEBHOOK_URL

    const isPositive = stockData.change > 0;
    const color = isPositive ? 0x00FF00 : 0xFF0000; // Green or Red
    const emoji = isPositive ? '📈' : '📉';
    const emoji2 = '💼';
    
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
    },
    {
      title: `${emoji2} Your Portfolio`,
      description: `Updated portfolio value`,
      fields: [
        {
          name: 'Shares Owned',
          value: `${config.PYPL_SHARES}`,
          inline: true
        },
        {
          name: 'Portfolio Value',
          value: `$${(config.PYPL_SHARES * stockData.price).toFixed(2)}`,
          inline: true
        },
        {
          name: `Today's change`,
          value: `${(config.PYPL_SHARES*stockData.change).toFixed(2)}%`,
          inline: true
        }
      ],
      color: color,
      timestamp: new Date().toISOString(),
    }
  ]
  };

  const response = await axios.post(webhookUrl, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
    console.log(response);
}