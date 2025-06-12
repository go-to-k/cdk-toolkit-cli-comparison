import {
  Toolkit,
  ICloudAssemblySource,
  AssemblyBuilderProps,
  CdkAppMultiContext,
} from '@aws-cdk/toolkit-lib';
import * as path from 'path';
import { cdkApp } from '../bin/app';

const deploy = async () => {
  const toolkit = new Toolkit();
  const cx = await getCloudAssemblySource(toolkit);

  /*
   * If not caching the synth result (CloudAssembly), or for single command calls only, this is sufficient
   */
  // await toolkit.deploy(cx);

  /*
   * Cache the synth result (CloudAssembly)
   */
  const cloudAssembly = await toolkit.synth(cx);

  await toolkit.deploy(cloudAssembly);

  // Release the lock file in cdk.out
  await cloudAssembly.dispose();
};

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

deploy();
