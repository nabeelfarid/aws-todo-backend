import AppSyncEvent from "./appSyncEvent";
import createTodo from "./createTodo";
import deleteTodo from "./deleteTodo";
import getTodos from "./getTodos";
import updateTodo from "./updateTodo";

exports.handler = async (event: AppSyncEvent) => {
  console.log("operation name: ", event.info.fieldName);
  switch (event.info.fieldName) {
    case "getTodos":
      console.log("getting Todos...");
      return await getTodos();
    case "createTodo":
      console.log("creating Todo...");
      return await createTodo(event.arguments.title);
    case "updateTodoDoneStatus":
      console.log("updating Todo...");
      return await updateTodo(event.arguments.id, event.arguments.done);
    case "deleteTodo":
      console.log("deleting Todo...");
      return await deleteTodo(event.arguments.id);
    default:
      throw new Error("Query/Mutation/Subscription Not Found");
  }
};
