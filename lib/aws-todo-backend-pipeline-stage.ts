import { AwsTodoBackendStack } from "./aws-todo-backend-stack";
import { Stage, Construct, StageProps } from "@aws-cdk/core";

export class AwsTodoBackendPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new AwsTodoBackendStack(this, `AwsTodoBackendStack`);
  }
}
