import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Todo from "./Todo";
var docClient = new AWS.DynamoDB.DocumentClient();
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html

const getTodos = async (username: string): Promise<Todo[]> => {
  try {
    var params: DocumentClient.QueryInput = {
      TableName: process.env.TODOS_TABLE as string,
      IndexName: process.env.TODOS_TABLE_LOCAL_INDEX_CREATED,
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": username,
      },
      // sort result in descending order based on sort key i.e. created
      ScanIndexForward: false,
    };

    const data = await docClient.query(params).promise();
    console.log("getTodos query:", data);
    return data.Items as Todo[];
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default getTodos;
