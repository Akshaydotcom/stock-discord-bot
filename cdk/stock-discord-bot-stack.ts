import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as target from 'aws-cdk-lib/aws-events-targets';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export class StockDiscordBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const botSecret = secretsmanager.Secret.fromSecretNameV2(this, 'BotSecret', 'stock-bot/config');

    const stockCommandLambdaFunction = new nodejs.NodejsFunction(this, 'StockCommandLambda', {
      runtime:lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: 'lambda/stockCommand/index.ts',
      timeout: cdk.Duration.seconds(10),
      environment:{}
    })

    botSecret.grantRead(stockCommandLambdaFunction);

    const api = new apigateway.RestApi(this, 'StockBotApi', {
      restApiName: 'Stock Bot API',
      description: 'Handles Discord slash commands for stock bot'
    })

    const discordResource = api.root.addResource('discord')
    discordResource.addMethod('POST', new apigateway.LambdaIntegration(stockCommandLambdaFunction));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `${api.url}discord`,
      description: 'Discord Interaction Endpoint URL'
    })

    const stockDiscordLambdaFunction = new nodejs.NodejsFunction(this, 'StockDiscordLambda', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: 'lambda/stockAlert/index.ts',
      timeout: cdk.Duration.seconds(30),
      environment:{},
      bundling:{
        externalModules:['@aws-sdk/*'],
        nodeModules: ['axios']
      }
    });

    const rule = new events.Rule(this, 'DailyStockCheckRule', {
      schedule:events.Schedule.cron({
        minute: '30',
        hour: '22',
        weekDay: 'MON-FRI'
      }),
      description: 'Triggers stock alert Lambda daily after market close'
    });

    rule.addTarget(new target.LambdaFunction(stockDiscordLambdaFunction));

    botSecret.grantRead(stockDiscordLambdaFunction);

    new cdk.CfnOutput(this, 'FunctionName', {
      value: stockDiscordLambdaFunction.functionName,
      description: 'Stock Alert Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'FunctionArn', {
      value: stockDiscordLambdaFunction.functionArn,
      description: 'Stock Alert Lambda Function ARN',
    });
    // example resource
    // const queue = new sqs.Queue(this, 'StockDiscordBotQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
