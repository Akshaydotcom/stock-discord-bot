import { Handler } from "aws-lambda";
import fetchStockPrice from "../../helpers/stcokFetcher";
import getConfig from "../../helpers/secretsManager";
import sendToDiscord from "../../helpers/sendToDiscord";

export const handler: Handler = async (event)=>{
    console.log('Event triggered:', JSON.stringify(event));
    console.log('Started execution of stock-discord-bot-lambda');

    try{
        const config = await getConfig();
        const stockData = await fetchStockPrice('PYPL', config);
        await sendToDiscord(stockData, config);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Stock alert sent successfully' })
        }
    } catch(error){
        console.error('Error:', error);
        throw error;
    }
}
