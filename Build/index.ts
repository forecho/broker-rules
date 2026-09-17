import fs from 'node:fs';
import path from 'node:path';
import picocolors from 'picocolors';

import { RuleOutput } from './lib/rule-output';
import { SurgeListStrategy } from './lib/writing-strategy/surge';
import { ClashYamlStrategy } from './lib/writing-strategy/clash';
import { QuantumultXStrategy } from './lib/writing-strategy/quantumultx';

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_ROOT = path.join(ROOT_DIR, 'Source');

const META = {
  author: 'forecho',
  repo: 'https://github.com/forecho/broker-rules'
};

function listSources(dir: string): string[] {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.conf'))
    .sort();

  if (files.length === 0) {
    throw new Error(`未在 ${dir} 找到任何 .conf 源文件`);
  }

  return files;
}

function readSources(dir: string, files: string[], name: string): RuleOutput {
  const ruleOutput = new RuleOutput({ name, author: META.author, repo: META.repo, date: new Date() });

  for (const file of files) {
    const fullPath = path.join(dir, file);
    ruleOutput.addSource(fs.readFileSync(fullPath, 'utf-8'));
    console.log(picocolors.cyan(`[read]  ${path.relative(ROOT_DIR, fullPath)}`));
  }

  return ruleOutput;
}

/** 每个规则集固定输出 7 个文件：六个平台目录 + 根目录 Surge 版 */
function strategiesFor(name: string) {
  return [
    new SurgeListStrategy(`rule/Surge/${name}.list`, 'Surge'),
    new SurgeListStrategy(`rule/Loon/${name}.list`, 'Loon'),
    new SurgeListStrategy(`rule/Shadowrocket/${name}.list`, 'Shadowrocket'),
    new SurgeListStrategy(`${name}.list`, 'Surge (root)'),
    new ClashYamlStrategy(`rule/Clash/${name}.yaml`, 'Clash'),
    new ClashYamlStrategy(`rule/Stash/${name}.yaml`, 'Stash'),
    new QuantumultXStrategy(`rule/QuantumultX/${name}.list`, name)
  ];
}

function main(): void {
  // Source/broker：券商，其中 topstep.conf 单独拆成 Topstep 规则集（便于配成直连）
  const brokerDir = path.join(SOURCE_ROOT, 'broker');
  const brokerFiles = listSources(brokerDir).filter((file) => file !== 'topstep.conf');
  const brokerOutput = readSources(brokerDir, brokerFiles, 'Broker');
  const topstepOutput = readSources(brokerDir, ['topstep.conf'], 'Topstep');

  // Source/bank：银行，一般配成直连
  const bankDir = path.join(SOURCE_ROOT, 'bank');
  const bankOutput = readSources(bankDir, listSources(bankDir), 'Bank');

  const outputs = [brokerOutput, topstepOutput, bankOutput];
  const names = ['Broker', 'Topstep', 'Bank'];
  let fileCount = 0;

  for (let i = 0; i < outputs.length; i++) {
    const strategies = strategiesFor(names[i]);
    outputs[i].writeAll(strategies, ROOT_DIR);
    fileCount += strategies.length;
  }

  const summary = outputs.map((o, i) => `${names[i]} 共 ${o.total} 条规则`).join('，');
  console.log(picocolors.bold(picocolors.green(`\n构建完成：${summary}，输出 ${fileCount} 个文件。`)));
}

main();
