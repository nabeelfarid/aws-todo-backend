import { AppSyncResolverHandler } from "aws-lambda";
import AppSyncEventArguments from "./AppSyncEventArguments";
import createTodo from "./createTodo";
import deleteTodo from "./deleteTodo";
import getTodos from "./getTodos";
import Todo from "./Todo";
import updateTodo from "./updateTodo";

export const handler: AppSyncResolverHandler<
  AppSyncEventArguments,
  Todo | null
> = async (event) => {
  console.log("event: ", JSON.stringify(event.identity, null, 2));
  console.log("operation name: ", event.info.fieldName);
  const username = event.identity?.username as string;
  switch (event.info.fieldName) {
    case "getTodos":
      console.log("getting Todos...");
      return await getTodos(username);
    case "createTodo":
      console.log("creating Todo...");
      return await createTodo(event.arguments.title, username);
    case "updateTodoDoneStatus":
      console.log("updating Todo...");
      return await updateTodo(
        event.arguments.id,
        event.arguments.done,
        username
      );
    case "deleteTodo":
      console.log("deleting Todo...");
      return await deleteTodo(event.arguments.id, username);
    default:
      throw new Error("Query/Mutation/Subscription Not Found");
  }
};
