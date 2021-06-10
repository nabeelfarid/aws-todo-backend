import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Todo from "./Todo";
var docClient = new AWS.DynamoDB.DocumentClient();
// https://stackoverflow.com/a/65572954/288746

const updateTodo = async (id: string, done: boolean) => {
  const params: DocumentClient.UpdateItemInput = {
    TableName: process.env.TODOS_TABLE as string,
    Key: {
      id: id,
    },
    // set parameter for each column
    UpdateExpression: "set done = :done",
    // ConditionExpression: "attribute_exists(id)",
    //provide value for each parameter
    ExpressionAttributeValues: {
      ":done": done,
    },
    ReturnValues: "ALL_NEW",
  };

  console.log("params: ", JSON.stringify(params, null, 4));
  try {
    const updatedTodo = await docClient.update(params).promise();

    console.log("Todo updated:", JSON.stringify(updatedTodo, null, 4));
    return updatedTodo.Attributes;
  } catch (error) {
    console.log("DynamoDB error: ", error);
    throw error;
  }
};

export default updateTodo;
