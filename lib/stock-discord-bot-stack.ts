import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as target from 'aws-cdk-lib/aws-events-targets';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

export class StockDiscordBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const stockDiscordLambdaFunction = new nodejs.NodejsFunction(this, 'StockDiscordLambda', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: 'lambda/index.ts',
      timeout: cdk.Duration.seconds(30),
      environment:{
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
        ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY || ''
      },
      bundling:{
        externalModules:['@aws-sdk/*'],
        nodeModules: ['axios']
      }
    });

    const rule = new events.Rule(this, 'DailyStockCheckRule', {
      schedule:events.Schedule.cron({
        minute: '30',
        hour: '21',
        weekDay: 'MON-FRI'
      }),
      description: 'Triggers stock alert Lambda daily after market close'
    });

    rule.addTarget(new target.LambdaFunction(stockDiscordLambdaFunction));

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
