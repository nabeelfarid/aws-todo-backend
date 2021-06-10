import * as AWS from "aws-sdk";
import * as crypto from "crypto";
import { title } from "process";
import Todo from "./Todo";
var docClient = new AWS.DynamoDB.DocumentClient();

const createTodo = async (title: string) => {
  const todo: Todo = {
    id: crypto.randomBytes(16).toString("hex"),
    title: title,
    done: false,
  };
  try {
    await docClient
      .put({
        TableName: process.env.TODOS_TABLE as string,
        Item: todo,
      })
      .promise();
    console.log("New Product created:", JSON.stringify(todo, null, 4));
    return todo;
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default createTodo;
