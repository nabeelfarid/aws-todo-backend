import * as AWS from "aws-sdk";
import Todo from "./Todo";
var docClient = new AWS.DynamoDB.DocumentClient();

const deleteTodo = async (todoId: string, username: string) => {
  try {
    var deletedTodo = await docClient
      .delete({
        TableName: process.env.TODOS_TABLE as string,
        Key: { id: todoId, username: username },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    console.log("Todo deleted id: ", todoId);
    console.log("Todo deleted:", JSON.stringify(deletedTodo, null, 4));
    return deletedTodo.Attributes;
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default deleteTodo;
