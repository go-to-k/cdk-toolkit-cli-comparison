import * as cdk from 'aws-cdk-lib';
import { CdkToolkitCliComparisonStack } from '../lib/cdk-toolkit-cli-comparison-stack';

export const cdkApp = (): cdk.App => {
  const app = new cdk.App();

  new CdkToolkitCliComparisonStack(app, 'CdkToolkitCliComparisonStack');

  return app;
};
