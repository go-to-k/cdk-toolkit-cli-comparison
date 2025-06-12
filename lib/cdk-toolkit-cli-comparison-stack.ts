import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkToolkitCliComparisonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: ['arn:aws:s3:::my-bucket/*'],
      }),
    );

    role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: ['arn:aws:s3:::my-bucket/*'],
      }),
    );
  }
}
