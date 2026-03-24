import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { verifyKey } from 'discord-interactions'
import getConfig  from '../../helpers/secretsManager'
import fetchStockPrice from '../../helpers/stockFetcher'
import sendToDiscord from "../../helpers/sendToDiscord";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', JSON.stringify(event));
    const config = await getConfig();
    const body = JSON.parse(event.body || '{}');
    console.log('Body type:', body.type);

    const signature = event.headers['x-signature-ed25519'] || '';
    const timestamp = event.headers['x-signature-timestamp'] || '';
    const isValid = await verifyKey(event.body || '', signature, timestamp, config.DISCORD_PUBLIC_KEY);
    console.log('Signature:', signature);
    console.log('Timestamp:', timestamp);


    if(!isValid){
        console.log('Signature verification failed');
        return {
            statusCode: 401,
            body: JSON.stringify({error: 'Invalid Request Signature'})
        }
    }

    if (body.type === 1) {
        return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 })
        };
    }

    if(body.type === 2 && body.data.name === 'stock'){
        const stockData = await fetchStockPrice('PYPL', config);
        await sendToDiscord(stockData, config);
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unknown Command'})
    }

}