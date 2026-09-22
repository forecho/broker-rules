# 富途 macOS 16.31 规则核验

核验日期：2026-09-22。客户端：富途牛牛 16.31.17608，构建号 202609031222。

## 新增规则与依据

| 规则 | 本地与网络证据 |
| --- | --- |
| `DOMAIN-SUFFIX,futuhk1.com` | `libCoreBiz.dylib` 的站点域名表；HTTPS 页面标题为富途证券，Google DoH 返回 A 记录 |
| `DOMAIN-SUFFIX,futuhongkong.com` | 同上，HTTPS 页面标题为富途证券，Google DoH 返回 A 记录 |
| `DOMAIN-SUFFIX,moomooapp.com` | 同一站点域名表；HTTPS 跳转至 `www.moomoo.com`，Google DoH 返回 A 记录 |
| `DOMAIN-SUFFIX,moomoocn.com` | 同上，HTTPS 跳转至 `www.moomoo.com`，Google DoH 返回 A 记录 |
| `DOMAIN-SUFFIX,ftesop.com` | 同一站点域名表；Google DoH 返回腾讯云 EdgeOne CNAME 与 A 记录，HTTPS 返回 439 |
| `DOMAIN,collect.us.moomoocrypto.com` | 客户端内置的采集 URL；Google DoH 返回 EdgeOne CNAME 与 A 记录，HTTPS 返回 200 |
| `DOMAIN,shortconnv6.im.qcloud.com` | 客户端捆绑的腾讯云 IM SDK 内置入口；CNAME 为 `loginv6.im.qcloud.com` |
| `DOMAIN,loginv6.im.qcloud.com` | 同一 SDK 内置入口；DoH 解析包含 `175.97.184.235`，本地 FTNN 曾存在到该 IP 的 443 连接 |

腾讯云 IM 的两条精确域名规则归入 `_shared.conf`。现有 `shortconn.im.qcloud.com` 后缀规则覆盖其子域，新增的两个主机名需要独立匹配。DNS 与连接 IP 的重合提供关联线索；本次未取得该连接的原始主机名或 TLS SNI。

## 实际连接检查

通过 Surge 自带 `surge-cli --raw dump active` 与 `dump recent`，按富途进程路径过滤后检查规则、策略和失败状态。采样时行情 TCP 连接（443 / 9595）、`q.futunn.com` 和 `collect.futunn.com` 已命中原有 `Broker.list`，显示成功连接或完成。另有 UDP 123 校时请求失败，校时有其他成功的直连入口；本次保持校时规则原样。

这些结果确认了规则覆盖缺口，尚不足以将用户遇到的异常归因于其中某个域名。新增域名来自客户端静态配置与网络核验，实际使用频率会随功能、地区和服务器调度变化。

## 筛选边界

- `futu88.com` 虽在内置表中，DNS 指向 GoDaddy 停放基础设施，本次排除。
- `futulending.com`、`futulti.com` 的根域无 A 记录，本次留待取得具体服务主机证据后补充。
- 腾讯云 IM 的其他地区／测试入口、通用云存储根域和飞书域名保持原有覆盖范围。

系统 DNS 经 Surge 返回 `198.18.0.0/15` 虚拟地址，因此域名存活核验使用 Google DoH。HTTP 状态仅用于确认服务存在；439 与 moomoo 的 403 页面不代表业务可用性验证通过。

修改源文件后使用 `pnpm build` 生成七份 Broker 产物。本次未改本机 Surge 配置、刷新线上订阅或执行交易操作；界面复测受 Mac 锁屏限制。
