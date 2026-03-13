import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { verifyKey } from 'discord-interactions'
import getConfig  from '../../helpers/secretsManager'
import fetchStockPrice from '../../helpers/stockFetcher'
import sendToDiscord from "../../helpers/sendToDiscord";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const config = await getConfig();
    const body = JSON.parse(event.body || '{}');

    const signature
}