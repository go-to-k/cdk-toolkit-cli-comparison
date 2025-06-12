# cdk-toolkit-cli-comparison

This is a sample repository for comparison between CDK Toolkit Library and CDK CLI.

## deploy

```sh
npx ts-node src/index.ts
```

## Comparison

### Whether to use cdk.out as outdir

- A temporary directory in your environment is used as `outdir` by default
  - not `cdk.out`
  - In my PC: `/private/var/folders/...`

```ts
const getCloudAssemblySource = async (toolkit: Toolkit): Promise<ICloudAssemblySource> => {
  return await toolkit.fromAssemblyBuilder(async (_props: AssemblyBuilderProps) => {
    const app = cdkApp();
    const cloudAssembly = await app.synth();
    return cloudAssembly;
  });
};
```

- `cdk.out` is used if `outdir` is specified with it

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

### Whether to read cdk.json

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
  - `@aws-cdk/aws-iam:minimizePolicies` is not applied because **cdk.json is not read**

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
  - `@aws-cdk/aws-iam:minimizePolicies` is applied as true because **cdk.json is read**

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

### Whether to read/write cdk.context.json

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
