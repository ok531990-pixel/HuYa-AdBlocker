# HuYa 去广告 - Loon 插件（v3.3 域拦截 + URL Rewrite 双保险）

虎牙直播 APP（iOS）去广告。**v3.3 双保险**：SSL Pinning 域走 DNS 拒绝（Pinning 无法绕过），可解密域走 URL Rewrite 直接 reject 广告接口。新增 PCDN 节点域拦截（v1d.szbdyd.com），堵死开屏广告 P2P 分发通道。

## 安装（一键订阅）

Loon → 配置 → 插件 → 通过 URL 添加：

```
https://raw.githubusercontent.com/ok531990-pixel/HuYa-AdBlocker/main/HuYa_AdBlocker.plugin
```

⚠️ 插件含 [Rewrite]/[MITM] 段。若不用 MITM，仅 [Rule] 段生效（已覆盖大部分广告）；想全量拦截请信任 Loon 证书并开启 MITM。

## 拦截清单

| 类别 | 域名/接口 | 方式 |
|---|---|---|
| 虎牙广告系统 | `ad.huya.com` / `ads.huya.com` / `df.huya.com` / `3dm.huya.com` | DNS REJECT |
| 直播间广告 | `live-ads.huya.com` | DNS REJECT |
| 广告监测 | `e-ad-monitor.huya.com` / `e-stat.huya.com` | DNS REJECT |
| 数据上报/埋点 | `l.web.huya.com` / `metric.huya.com` / `statwup.huya.com` / `udblog.huya.com` / `ylog.huya.com` | DNS REJECT |
| 欢聚(母公司) | `hiido.com` / `mlog.hiido.com` / `ylog.hiido.com` | DNS REJECT |
| 开屏素材 | `business.msstatic.com` / `huyafile.msstatic.com` / `pp-cdnfile2pcdn.msstatic.com` / `livewebbs2pcdn.msstatic.com` / `cdnfile1.msstatic.com` / `cdnfile2.msstatic.com` / `cdnfile3.msstatic.com` | DNS REJECT |
| PCDN 节点 | `v1d.szbdyd.com` 全家（P2P 广告分发通道） | DNS REJECT |
| 广点通 SDK | `gdt.qq.com` 全家 + `gdtimg.com` / `ugdtimg.com` / `adsmind.*` / `pgdt.gtimg.cn` | DNS REJECT |
| MediaV SDK | `mediav.com` | DNS REJECT |
| 开屏接口 | `cdn.wup.huya.com/launch/queryHttpDns` / `queryAdConfig` / `getSplashAd` | Rewrite reject |
| 广告素材接口 | `business.msstatic.com/advertiser/material` | Rewrite reject |
| 开屏图片 | `cdnfile1.msstatic.com/cdnfile/appad/` | Rewrite reject-img |
| 直播间入口 | `live-ads.huya.com/live/getAllEntrance` | Rewrite reject-dict |

> 广点通/MediaV 是所有使用腾讯广告 SDK 的 APP 共享的广告域，拦截后**全局去广告**。这些域只服务于广告，不影响 APP 正常功能。

## 为什么域拦截为主？

- 虎牙 APP 部分域名启用证书固定（SSL Pinning），Loon MITM 无法解密（日志报 `tlsv1 alert unknown ca`），响应改写脚本失效
- DNS 层 REJECT 无需解密，任何证书校验都拦不住
- 可解密域（wup.huya.com / msstatic.com 系）叠加 URL Rewrite 精确拦截

`huya_ads.js` 保留备用——若虎牙移除 Pinning，可切回响应改写方案。

## 广告没去干净？

说明虎牙又上了新广告域。抓包方法：

1. Loon → 设置 → 打开日志/抓包
2. 触发开屏/信息流/直播间广告
3. 日志筛选 `huya` / `gdt` / `mediav` / `msstatic`，找广告请求的域名
4. 把域名发回来，加进规则

## 注意

仅用于个人设备去广告，请勿分发或商用。
