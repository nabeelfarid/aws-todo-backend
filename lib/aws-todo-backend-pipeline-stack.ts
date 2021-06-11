import * as cdk from "@aws-cdk/core";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
// import * as CodeBuild from "@aws-cdk/aws-codebuild";
import { SimpleSynthAction, CdkPipeline } from "@aws-cdk/pipelines";
import { AwsTodoBackendPipelineStage } from "./aws-todo-backend-pipeline-stage";

export class AwsTodoBackendPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Defines the artifact representing the sourcecode
    const sourceArtifact = new CodePipeline.Artifact();
    // Defines the artifact representing the cloud assembly
    // (cloudformation template + all other assets)
    const cloudAssemblyArtifact = new CodePipeline.Artifact();

    // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CdkPipeline(this, `${id}_pipeline`, {
      crossAccountKeys: false, //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      // restartExecutionOnUpdate: true, //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.

      pipelineName: `${id}_pipeline`,
      cloudAssemblyArtifact,

      // selfMutating: false,

      // Generates the source artifact from the repo we created in the last step
      sourceAction: new CodePipelineAction.GitHubSourceAction({
        actionName: "Checkout",
        owner: "nabeelfarid",
        repo: "AwsPipelineDemo-BackendCode",
        oauthToken: cdk.SecretValue.secretsManager("GITHUB_TOKEN_FOR_AWS"), ///create token on github and save it on aws secret manager
        branch: "master", ///Branch of your repo
        output: sourceArtifact, // Indicates where the artifact is stored
      }),

      // Builds our source code outlined above into a could assembly artifact
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact, // Where to get source code to build
        cloudAssemblyArtifact, // Where to place built source
        buildCommand: "npm run build", // Language-specific build cmd
      }),
    });

    // pipeline.addApplicationStage(
    //   new AwsTodoBackendPipelineStage(this, "Deploy")
    // );
  }
}
