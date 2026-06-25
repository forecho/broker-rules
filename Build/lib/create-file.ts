import fs from 'node:fs';
import path from 'node:path';
import picocolors from 'picocolors';

/**
 * 仅在内容变化时写文件，避免无意义的改动与提交。返回是否真的写入。
 */
export function compareAndWriteFile(lines: string[], filePath: string): boolean {
  const content = lines.join('\n') + '\n';

  let existing: string | null = null;
  try {
    existing = fs.readFileSync(filePath, 'utf-8');
  } catch {
    existing = null;
  }

  const rel = path.relative(process.cwd(), filePath);

  if (existing === content) {
    console.log(picocolors.gray(`[skip]  ${rel} (未变化)`));
    return false;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(picocolors.green(`[write] ${rel} (${lines.length} 行)`));
  return true;
}
