# cdk-toolkit-cli-comparison

This is a sample repository for comparison between CDK Toolkit Library and CDK CLI.

## deploy

```sh
npx ts-node src/index.ts
```

## comparison

### Whether cdk.json is read

- cdk.json

```json
{
  // ...
  "context": {
    // ...
    "@aws-cdk/aws-iam:minimizePolicies": true,
```

- index.ts

```ts
const getCloudAssemblySource = async (toolkit: Toolkit): Promise<ICloudAssemblySource> => {
  return await toolkit.fromAssemblyBuilder(
    async (_props: AssemblyBuilderProps) => {
      const app = cdkApp();
      const cloudAssembly = await app.synth();
      return cloudAssembly;
    },
    {
      outdir: path.resolve(__dirname, '../cdk.out'),
      contextStore: new CdkAppMultiContext(path.resolve(__dirname, '..')),
    },
  );
};
```

- CloudFormation Template from `cdk.out` Cloud Assembly (before comment out)
  - `@aws-cdk/aws-iam:minimizePolicies` is true because cdk.json is read

```json
  "Statement": [
   {
    "Action": [
     "s3:GetObject",
     "s3:PutObject"
    ],
    "Effect": "Allow",
    "Resource": "arn:aws:s3:::my-bucket/*"
   }
  ],
```

- index.ts without `contextStore`

```ts
const getCloudAssemblySource = async (toolkit: Toolkit): Promise<ICloudAssemblySource> => {
  return await toolkit.fromAssemblyBuilder(
    async (_props: AssemblyBuilderProps) => {
      const app = cdkApp();
      const cloudAssembly = await app.synth();
      return cloudAssembly;
    },
    {
      outdir: path.resolve(__dirname, '../cdk.out'),
      // contextStore: new CdkAppMultiContext(path.resolve(__dirname, '..')),
    },
  );
};
```

- CloudFormation Template from `cdk.out` Cloud Assembly (after comment out)
  - `@aws-cdk/aws-iam:minimizePolicies` is false because cdk.json is not read

```json
  "Statement": [
   {
    "Action": "s3:GetObject",
    "Effect": "Allow",
    "Resource": "arn:aws:s3:::my-bucket/*"
   },
   {
    "Action": "s3:PutObject",
    "Effect": "Allow",
    "Resource": "arn:aws:s3:::my-bucket/*"
   }
  ],
```
