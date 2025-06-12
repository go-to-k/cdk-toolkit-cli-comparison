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
   * synthの結果(CloudAssembly)をキャッシュしない・1コマンドのみの呼び出しであればこれだけでいい
   */
  // await toolkit.deploy(cx);

  /*
   * synthの結果(CloudAssembly)をキャッシュする
   */
  const cloudAssembly = await toolkit.synth(cx);

  await toolkit.deploy(cloudAssembly);

  // cdk.outのlockファイルを解放するため
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
