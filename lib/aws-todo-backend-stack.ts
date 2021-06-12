import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ddb from "@aws-cdk/aws-dynamodb";

export class AwsTodoBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, `${id}_userpool`, {
      userPoolName: `${id}_userpool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInCaseSensitive: true,
      // signInAliases: { email: true },
      userVerification: {
        emailSubject: "Todo App: Verify your email",
        // emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        // smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        fullname: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      `${id}_userpool_client`,
      {
        userPoolClientName: `${id}_userpool_client`,
        userPool,
      }
    );

    const appsyncApi = new appsync.GraphqlApi(
      this,
      `${id}_appsync_graphql_api`,
      {
        name: `${id}_appsync_graphql_api`,
        schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool,
            },
          },
        },
        // xrayEnabled: true,
      }
    );

    const lambdaTodos = new lambda.Function(
      this,
      `${id}_lambda_for_appsync_graphql_api`,
      {
        functionName: `${id}_lambda_for_appsync_graphql_api`,
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("lambda-functions"),
        handler: "main.handler",
      }
    );

    const lambdaTodosDataSource = appsyncApi.addLambdaDataSource(
      `${id}_lambda_datasource_for_appsync_graphql_api`,
      lambdaTodos
    );

    lambdaTodosDataSource.createResolver({
      fieldName: "getTodos",
      typeName: "Query",
    });

    lambdaTodosDataSource.createResolver({
      fieldName: "createTodo",
      typeName: "Mutation",
    });
    lambdaTodosDataSource.createResolver({
      fieldName: "updateTodoDoneStatus",
      typeName: "Mutation",
    });
    lambdaTodosDataSource.createResolver({
      fieldName: "deleteTodo",
      typeName: "Mutation",
    });

    const ddbTableTodos = new ddb.Table(this, `${id}_dynamoDb_table`, {
      tableName: "Todos",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "username",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const indexName = "Todos_Index_Local_Created";
    ddbTableTodos.addLocalSecondaryIndex({
      indexName: indexName,
      sortKey: {
        name: "created",
        type: ddb.AttributeType.NUMBER,
      },
      projectionType: ddb.ProjectionType.ALL,
    });

    ddbTableTodos.grantFullAccess(lambdaTodos);

    lambdaTodos.addEnvironment("TODOS_TABLE", ddbTableTodos.tableName);
    lambdaTodos.addEnvironment("TODOS_TABLE_LOCAL_INDEX_CREATED", indexName);

    new cdk.CfnOutput(this, "AppSyncGraphqlUrl", {
      value: appsyncApi.graphqlUrl,
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClient", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
