type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    id: string;
    title: string;
    done: boolean;
  };
};

export default AppSyncEvent;
