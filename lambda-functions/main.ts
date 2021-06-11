import { AppSyncResolverHandler } from "aws-lambda";
import AppSyncEvent from "./appSyncEvent";
import AppSyncEventArguments from "./AppSyncEventArguments";
import createTodo from "./createTodo";
import deleteTodo from "./deleteTodo";
import getTodos from "./getTodos";
import Todo from "./Todo";
import updateTodo from "./updateTodo";

export const handler: AppSyncResolverHandler<AppSyncEventArguments, Todo> =
  async (event) => {
    console.log("event: ", JSON.stringify(event.identity, null, 2));
    console.log("operation name: ", event.info.fieldName);
    const username = event.identity?.username as string;
    switch (event.info.fieldName) {
      case "getTodos":
        console.log("getting Todos...");
        return (await getTodos(username)) as Todo[];
      case "createTodo":
        console.log("creating Todo...");
        return (await createTodo(event.arguments.title, username)) as Todo;
      case "updateTodoDoneStatus":
        console.log("updating Todo...");
        return (await updateTodo(
          event.arguments.id,
          event.arguments.done,
          username
        )) as Todo;
      case "deleteTodo":
        console.log("deleting Todo...");
        return (await deleteTodo(event.arguments.id, username)) as Todo;
      default:
        throw new Error("Query/Mutation/Subscription Not Found");
    }
  };
