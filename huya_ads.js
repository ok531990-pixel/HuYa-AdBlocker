/**
 * HuYa 去广告 - 响应改写脚本（备用）
 * 匹配: api.huya.com 的 HTTP(S) 响应
 * 策略: 解析 JSON，递归清理广告字段（banner / ad / splash 等），非 JSON 直接放行
 *
 * 环境: Loon (JavaScriptCore，兼容 Surge 风格 $response / $done API)
 * 注意: 虎牙 APP 启用 SSL Pinning 后 MITM 无法解密，本脚本失效；v3 默认用域拦截。
 *       若虎牙未来移除 Pinning，可在 Loon 开启 MITM 后启用本脚本。
 *       广告字段名变化时，Loon 日志会输出 "HuYaClean: HIT key=xxx"，据此更新名单。
 */

// ── 广告字段识别规则（保守名单，避免误伤正常字段） ──
const AD_EXACT = [
  'banner', 'banners', 'bannerlist', 'bannerinfo', 'bannerimgs', 'bannerimg',
  'ad', 'ads', 'adlist', 'adinfo', 'addata', 'adcontent', 'adcard', 'adcards',
  'adbar', 'adimage', 'adimages', 'adurl', 'adlink', 'adtitle', 'adsrc', 'adfrom',
  'advert', 'adverts', 'advertise', 'advertisement', 'advertisements',
  'splash', 'splashlist', 'splashinfo', 'launchad', 'openad', 'openingad',
  'topad', 'bottomad', 'vbanner', 'vtopbanner', 'vtopad', 'vbottomad', 'vbottom',
  'videoad', 'interstitialad', 'rewardad', 'feedad', 'recommendad', 'bigad', 'smallad',
  'hotbanner', 'hotad', 'bannerads', 'advertlist', 'adpositions', 'adposition',
];

// 驼峰/下划线命中: key 含这些片段且整体像广告字段
const AD_PART = ['banner', 'splash', 'advert', 'adlist', 'adinfo', 'adcard'];

function isAdKey(key) {
  const k = String(key).toLowerCase();
  if (AD_EXACT.includes(k)) return true;
  for (const p of AD_PART) {
    if (k.includes(p) && k.length <= 24) return true;
  }
  return false;
}

function cleanNode(node, depth) {
  if (node == null || depth > 10) return node;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      node[i] = cleanNode(node[i], depth + 1);
    }
    return node;
  }
  if (typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const val = node[key];
      if (isAdKey(key)) {
        // 广告字段: 数组→清空, 对象→清空, 标量→null
        if (Array.isArray(val)) {
          node[key] = [];
        } else if (val !== null && typeof val === 'object') {
          node[key] = {};
        } else {
          node[key] = null;
        }
        console.log('HuYaClean: HIT key=' + key + ' url=' + ((typeof $request !== 'undefined' && $request.url) || ''));
      } else {
        node[key] = cleanNode(val, depth + 1);
      }
    }
    return node;
  }
  return node;
}

// ── 入口 ──
if (typeof $response === 'undefined') {
  $done({});
} else {
  try {
    const body = $response.body;
    if (!body || typeof body !== 'string') {
      $done({});
      return;
    }
    // 只处理 JSON（广告接口都是 JSON；图片/二进制直接放行）
    const trimmed = body.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      $done({});
      return;
    }
    const data = JSON.parse(trimmed);
    const cleaned = cleanNode(data, 0);
    const newBody = JSON.stringify(cleaned);

    // 改写响应（删除 Content-Length 让 Loon 重算，避免长度不一致）
    const headers = Object.assign({}, $response.headers);
    delete headers['Content-Length'];
    delete headers['content-length'];

    $done({ body: newBody, headers: headers });
  } catch (e) {
    console.log('HuYaClean: skip, reason=' + e);
    $done({});
  }
}
