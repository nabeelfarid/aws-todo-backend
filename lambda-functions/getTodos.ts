import * as AWS from "aws-sdk";
var docClient = new AWS.DynamoDB.DocumentClient();
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html

const getTodos = async () => {
  try {
    const data = await docClient
      .scan({
        TableName: process.env.TODOS_TABLE as string,
      })
      .promise();
    console.log("getTodos scan:", data);
    return data.Items;
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default getTodos;
