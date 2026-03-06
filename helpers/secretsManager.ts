import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { BotConfig } from '../types';
const secretsClient = new SecretsManagerClient({});

export default async function getConfig(): Promise<BotConfig>{
  try{
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: 'stock-bot/config'
    })
  );
  if(response.SecretString) return JSON.parse(response.SecretString)
  else {
    console.log(`Error parsing secret ${JSON.stringify(response)}`)
    throw new Error('SecretString is empty or undefined');
  }
}
catch(error){
  console.log('Error retrieving secret')
  throw Error('Error retriving Secret')
}
}