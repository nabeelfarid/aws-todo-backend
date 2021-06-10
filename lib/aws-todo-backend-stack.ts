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
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true },
      //If you mark an attribute as an alias, users can sign in using that attribute in place of the username.
      signInAliases: { email: true }, // Set email as an alias
      userVerification: {
        emailSubject: "Todo App: Verify your email",
        // emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        // smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      }, ///customize email and sms
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY, ///Account Recovery email
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
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    ddbTableTodos.grantFullAccess(lambdaTodos);

    lambdaTodos.addEnvironment("TODOS_TABLE", ddbTableTodos.tableName);
  }
}
