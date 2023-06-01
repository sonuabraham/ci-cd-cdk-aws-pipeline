import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  Step,
} from "aws-cdk-lib/pipelines";
import { ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { MyPipelineAppStage } from "./stage";

export class CiCdAwsPipelineDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "TestPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub(
          "sonuabraham/ci-cd-cdk-aws-pipeline",
          "main",
          {
            authentication: cdk.SecretValue.secretsManager("github-token1"),
          }
        ), //Remember to change
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    const testingStage = pipeline.addStage(
      new MyPipelineAppStage(this, "test", {
        env: { account: "104612892635", region: "us-east-1" },
      })
    );

    testingStage.addPre(
      new ShellStep("Run Unit Tests", { commands: ["npm install", "npm test"] })
    );
    testingStage.addPost(
      new ManualApprovalStep("Manual approval before production")
    );

    const prodStage = pipeline.addStage(
      new MyPipelineAppStage(this, "prod", {
        env: { account: "104612892635", region: "us-east-1" },
      })
    );
  }
}
