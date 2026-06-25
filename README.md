# broker-rules

券商分流规则集。把富途、长桥、老虎、嘉信等券商 App 的流量，分流到你指定的策略组（一般走直连或港美节点）。
支持 Surge / Loon / Shadowrocket / Clash / Stash / QuantumultX 六种客户端。

> 规则内容初始来自 [Arthur-vx/broker-rules](https://github.com/Arthur-vx/broker-rules)，工程实现参考 [SukkaW/Surge](https://github.com/SukkaW/Surge)。

## 怎么用

`rule/` 下的文件由脚本自动生成，直接订阅下面对应平台的链接即可。

把链接里的 `forecho` 换成你自己的 GitHub 用户名（如果你 fork 了本仓库）。国内访问 `raw.githubusercontent.com` 不稳时，用下面的 jsDelivr CDN 链接。

| 客户端 | 订阅链接（raw） |
|--------|----------------|
| Surge | `https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Surge/Broker.list` |
| Loon | `https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Loon/Broker.list` |
| Shadowrocket | `https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Shadowrocket/Broker.list` |
| Clash / Mihomo | `https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Clash/Broker.yaml` |
| Stash | `https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Stash/Broker.yaml` |
| QuantumultX | `https://raw.githubusercontent.com/forecho/broker-rules/master/rule/QuantumultX/Broker.list` |

> jsDelivr 加速：把 `https://raw.githubusercontent.com/forecho/broker-rules/master/` 换成 `https://cdn.jsdelivr.net/gh/forecho/broker-rules@master/` 即可。

### Surge

在配置的 `[Rule]` 段加一行（`Broker` 换成你的策略组名）：

```ini
[Rule]
RULE-SET,https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Surge/Broker.list,Broker
```

### Clash / Mihomo

```yaml
rule-providers:
  Broker:
    type: http
    behavior: classical
    format: yaml
    url: "https://raw.githubusercontent.com/forecho/broker-rules/master/rule/Clash/Broker.yaml"
    path: ./ruleset/Broker.yaml
    interval: 86400

rules:
  - RULE-SET,Broker,Broker   # 后一个 Broker 是你的策略组名
```

### QuantumultX

在 `[filter_remote]` 段添加（规则里已自带 `Broker` 策略名，可用 `?policy=` 覆盖）：

```ini
[filter_remote]
https://raw.githubusercontent.com/forecho/broker-rules/master/rule/QuantumultX/Broker.list, tag=Broker, enabled=true
```

### Loon / Shadowrocket / Stash

用法与 Surge / Clash 同理，订阅上表对应链接即可。

## 自己维护规则

只需要改 `Source/broker/` 下的源文件，其余产物由脚本生成。

```bash
pnpm install
pnpm build            # 读取 Source → 生成 rule/ 与根目录 Broker.list
pnpm validate:alive   # （可选）DNS 解析检查源里的域名是否还存活，仅报告不改文件
```

源文件按券商拆分，使用 Surge ruleset 语法，`#` 开头为注释：

```
# Source/broker/futu.conf
DOMAIN-SUFFIX,futu.com
DOMAIN,api.futunn.com
IP-CIDR,119.28.37.0/24,no-resolve
```

新增/删除规则后跑 `pnpm build` 即可；推到 GitHub 后，CI 会自动重建并提交 `rule/`。

## 目录结构

```
Source/broker/   # 唯一手工维护的源（按券商拆分）
Build/           # TypeScript 构建脚本
rule/            # 各平台产物（自动生成，勿手改）
Broker.list      # 根目录 Surge 版
```

## License

[AGPL-3.0](./LICENSE)
