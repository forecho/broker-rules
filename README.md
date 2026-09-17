# broker-rules

券商 / 银行分流规则集。把富途、长桥、老虎、嘉信等券商 App，以及 HSBC HK、众安、大象、Wise 等银行 App 的流量，分流到你指定的策略组（券商一般走港美节点，银行一般直连）。
支持 Surge / Loon / Shadowrocket / Clash / Stash / QuantumultX 六种客户端。

> 券商规则初始来自 [Arthur-vx/broker-rules](https://github.com/Arthur-vx/broker-rules)，银行规则来自 [yeahwu/Rules-For-Quantumult-X](https://github.com/yeahwu/Rules-For-Quantumult-X/blob/main/Rules/Services/Bank.list)，工程实现参考 [SukkaW/Surge](https://github.com/SukkaW/Surge)。

## 赞助

感谢 [朵朵云加速](https://vip.dd8008.com/) 对本项目的赞助！

朵朵云加速是一家主打**快速稳定**的机场，港美节点稳定，配合本规则集把券商流量固定到香港 / 新加坡，不用担心出口地区漂移。

👉 [https://vip.dd8008.com/](https://vip.dd8008.com/)

## 怎么用

`rule/` 下的文件由脚本自动生成，直接订阅下面对应平台的链接即可。

把链接里的 `forecho` 换成你自己的 GitHub 用户名（如果你 fork 了本仓库）。国内访问 `raw.githubusercontent.com` 不稳时，用下面的 jsDelivr CDN 链接。

| 客户端 | 订阅链接（raw） |
|--------|----------------|
| Surge | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Surge/Broker.list` |
| Loon | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Loon/Broker.list` |
| Shadowrocket | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Shadowrocket/Broker.list` |
| Clash / Mihomo | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Clash/Broker.yaml` |
| Stash | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Stash/Broker.yaml` |
| QuantumultX | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/QuantumultX/Broker.list` |

Topstep 规则单独提供，便于将其配置为直连：

| 客户端 | 订阅链接（raw） |
|--------|----------------|
| Surge | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Surge/Topstep.list` |
| Loon | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Loon/Topstep.list` |
| Shadowrocket | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Shadowrocket/Topstep.list` |
| Clash / Mihomo | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Clash/Topstep.yaml` |
| Stash | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Stash/Topstep.yaml` |
| QuantumultX | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/QuantumultX/Topstep.list` |

银行规则（HSBC HK / 众安 / 大象 / Wise）单独提供，这类 App 会检测 IP，走代理登不上或被风控，一般配成直连：

| 客户端 | 订阅链接（raw） |
|--------|----------------|
| Surge | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Surge/Bank.list` |
| Loon | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Loon/Bank.list` |
| Shadowrocket | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Shadowrocket/Bank.list` |
| Clash / Mihomo | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Clash/Bank.yaml` |
| Stash | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Stash/Bank.yaml` |
| QuantumultX | `https://raw.githubusercontent.com/forecho/broker-rules/main/rule/QuantumultX/Bank.list` |

> jsDelivr 加速：把 `https://raw.githubusercontent.com/forecho/broker-rules/main/` 换成 `https://cdn.jsdelivr.net/gh/forecho/broker-rules@main/` 即可。

### Surge

在配置的 `[Rule]` 段加一行（`Broker` 换成你的策略组名）：

```ini
[Rule]
RULE-SET,https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Surge/Broker.list,Broker
```

### Clash / Mihomo

```yaml
rule-providers:
  Broker:
    type: http
    behavior: classical
    format: yaml
    url: "https://raw.githubusercontent.com/forecho/broker-rules/main/rule/Clash/Broker.yaml"
    path: ./ruleset/Broker.yaml
    interval: 86400

rules:
  - RULE-SET,Broker,Broker   # 后一个 Broker 是你的策略组名
```

### QuantumultX

在 `[filter_remote]` 段添加（规则里已自带 `Broker` 策略名，可用 `?policy=` 覆盖）：

```ini
[filter_remote]
https://raw.githubusercontent.com/forecho/broker-rules/main/rule/QuantumultX/Broker.list, tag=Broker, enabled=true
```

Topstep 使用同样的配置方式，将策略名改为你的直连策略组：

```ini
https://raw.githubusercontent.com/forecho/broker-rules/main/rule/QuantumultX/Topstep.list, tag=Topstep, enabled=true
```

Bank 同理，配成直连：

```ini
https://raw.githubusercontent.com/forecho/broker-rules/main/rule/QuantumultX/Bank.list, tag=Bank, enabled=true
```

### Loon / Shadowrocket / Stash

用法与 Surge / Clash 同理，订阅上表对应链接即可。

## 自己维护规则

只需要改 `Source/` 下的源文件，其余产物由脚本生成。`Source/broker/` 生成 Broker（其中 `topstep.conf` 单独生成 Topstep），`Source/bank/` 生成 Bank。

```bash
pnpm install
pnpm build            # 读取 Source → 生成 rule/ 与根目录 Broker.list / Topstep.list / Bank.list
pnpm validate:alive   # （可选）DNS 解析检查源里的域名是否还存活，仅报告不改文件
```

源文件按券商 / 银行拆分，使用 Surge ruleset 语法，`#` 开头为注释：

```
# Source/broker/futu.conf
DOMAIN-SUFFIX,futu.com
DOMAIN,api.futunn.com
IP-CIDR,119.28.37.0/24,no-resolve
```

新增/删除规则后跑 `pnpm build` 即可；推到 GitHub 后，CI 会自动重建并提交 `rule/`。

## 目录结构

```
Source/broker/   # 券商源（按券商拆分，topstep.conf 单独出 Topstep）
Source/bank/     # 银行源（按银行拆分）
Build/           # TypeScript 构建脚本
rule/            # 各平台产物（自动生成，勿手改）
Broker.list      # 根目录 Surge 版（另有 Topstep.list / Bank.list）
```

## License

[AGPL-3.0](./LICENSE)
