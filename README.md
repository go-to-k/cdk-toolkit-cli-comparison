# cdk-toolkit-cli-comparison

This is a sample repository for comparison between CDK Toolkit Library and CDK CLI.

## deploy

```sh
npx ts-node src/index.ts
```

## Differences from CDK CLI

### Default value for RequireApproval

- cdk code

```ts
// role.addToPrincipalPolicy(
//   new iam.PolicyStatement({
//     actions: ['s3:PutObject'],
//     resources: ['arn:aws:s3:::my-bucket/*'],
//   }),
// );
```

- RequireApproval

Toolkit outputs the message `Do you wish to deploy these changes`, but never ask for approval.

Because the default value for `RequireApproval` (`--require-approval`) is `NEVER`.

(The one for CDK CLI is `BROADENING`.)

```sh
❯ npx ts-node src/index.ts
...
...
IAM Statement Changes
┌───┬──────────────────────────┬────────┬──────────────┬─────────────┬───────────┐
│   │ Resource                 │ Effect │ Action       │ Principal   │ Condition │
├───┼──────────────────────────┼────────┼──────────────┼─────────────┼───────────┤
│ - │ arn:aws:s3:::my-bucket/* │ Allow  │ s3:GetObject │ AWS:${Role} │           │
│   │                          │        │ s3:PutObject │             │           │
├───┼──────────────────────────┼────────┼──────────────┼─────────────┼───────────┤
│ + │ arn:aws:s3:::my-bucket/* │ Allow  │ s3:GetObject │ AWS:${Role} │           │
└───┴──────────────────────────┴────────┴──────────────┴─────────────┴───────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)



"--require-approval" is enabled and stack includes security-sensitive updates.
Do you wish to deploy these changes
CdkToolkitCliComparisonStack: deploying... [1/1]
...
...
```

### Whether to use cdk.out as outdir by default

A temporary directory (my PC: `/private/var/folders/...`) in your environment is used as `outdir` by default, it is not `cdk.out`.

- index.ts

```ts
const getCloudAssemblySource = async (toolkit: Toolkit): Promise<ICloudAssemblySource> => {
  return await toolkit.fromAssemblyBuilder(async (_props: AssemblyBuilderProps) => {
    const app = cdkApp();
    const cloudAssembly = await app.synth();
    return cloudAssembly;
  });
};
```

- index.ts with `outdir`

`cdk.out` is used if `outdir` is specified with it

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
    },
  );
};
```

### Whether to read cdk.json by default

- cdk.json

```json
{
  // ...
  "context": {
    // ...
    "@aws-cdk/aws-iam:minimizePolicies": true,
```

- cdk code

```ts
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
    },
  );
};
```

- CloudFormation Template from `cdk.out` Cloud Assembly

`@aws-cdk/aws-iam:minimizePolicies` is not applied because **cdk.json is not read**

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

- index.ts with `contextStore` (=`CdkAppMultiContext`)

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

- CloudFormation Template from `cdk.out` Cloud Assembly

`@aws-cdk/aws-iam:minimizePolicies` is applied as true because **cdk.json is read**

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

### Whether to read/write cdk.context.json by default

- cdk code

```ts
const key = kms.Key.fromLookup(this, 'Key', {
  aliasName: 'alias/dummy',
  returnDummyKeyOnMissing: true,
});
new cdk.CfnOutput(this, 'IsLookupDummyOutput', {
  value: kms.Key.isLookupDummy(key).toString(),
});
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
    },
  );
};
```

- cdk.context.json

The file isn't created.

- index.ts with `contextStore` (=`CdkAppMultiContext`)

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

- cdk.context.json

The file is created.

```json
{
  "key-provider:account=123456789012:aliasName=alias/dummy:region=us-east-1": {
    "keyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
  }
}
```
