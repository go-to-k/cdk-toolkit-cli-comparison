import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';

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

    const key = kms.Key.fromLookup(this, 'Key', {
      aliasName: 'alias/dummy',
      returnDummyKeyOnMissing: true,
    });
    new cdk.CfnOutput(this, 'IsLookupDummyOutput', {
      value: kms.Key.isLookupDummy(key).toString(),
    });
  }
}
