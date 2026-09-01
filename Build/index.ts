import fs from 'node:fs';
import path from 'node:path';
import picocolors from 'picocolors';

import { RuleOutput } from './lib/rule-output';
import { SurgeListStrategy } from './lib/writing-strategy/surge';
import { ClashYamlStrategy } from './lib/writing-strategy/clash';
import { QuantumultXStrategy } from './lib/writing-strategy/quantumultx';

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'Source', 'broker');

const META = {
  name: 'Broker',
  author: 'forecho',
  repo: 'https://github.com/forecho/broker-rules'
};

function readSources(files: string[], name = META.name): RuleOutput {
  const ruleOutput = new RuleOutput({ name, author: META.author, repo: META.repo, date: new Date() });

  for (const file of files) {
    const content = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8');
    ruleOutput.addSource(content);
    console.log(picocolors.cyan(`[read]  Source/broker/${file}`));
  }

  return ruleOutput;
}

function main(): void {
  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith('.conf'))
    .sort();

  if (files.length === 0) {
    throw new Error(`未在 ${SOURCE_DIR} 找到任何 .conf 源文件`);
  }

  const brokerFiles = files.filter((file) => file !== 'topstep.conf');
  const brokerOutput = readSources(brokerFiles);
  const topstepOutput = readSources(['topstep.conf'], 'Topstep');

  const brokerStrategies = [
    new SurgeListStrategy('rule/Surge/Broker.list', 'Surge'),
    new SurgeListStrategy('rule/Loon/Broker.list', 'Loon'),
    new SurgeListStrategy('rule/Shadowrocket/Broker.list', 'Shadowrocket'),
    new SurgeListStrategy('Broker.list', 'Surge (root)'),
    new ClashYamlStrategy('rule/Clash/Broker.yaml', 'Clash'),
    new ClashYamlStrategy('rule/Stash/Broker.yaml', 'Stash'),
    new QuantumultXStrategy('rule/QuantumultX/Broker.list')
  ];

  const topstepStrategies = [
    new SurgeListStrategy('rule/Surge/Topstep.list', 'Surge'),
    new SurgeListStrategy('rule/Loon/Topstep.list', 'Loon'),
    new SurgeListStrategy('rule/Shadowrocket/Topstep.list', 'Shadowrocket'),
    new SurgeListStrategy('Topstep.list', 'Surge (root)'),
    new ClashYamlStrategy('rule/Clash/Topstep.yaml', 'Clash'),
    new ClashYamlStrategy('rule/Stash/Topstep.yaml', 'Stash'),
    new QuantumultXStrategy('rule/QuantumultX/Topstep.list')
  ];

  brokerOutput.writeAll(brokerStrategies, ROOT_DIR);
  topstepOutput.writeAll(topstepStrategies, ROOT_DIR);

  console.log(
    picocolors.bold(
      picocolors.green(
        `\n构建完成：Broker 共 ${brokerOutput.total} 条规则，Topstep 共 ${topstepOutput.total} 条规则，输出 ${
          brokerStrategies.length + topstepStrategies.length
        } 个文件。`
      )
    )
  );
}

main();
