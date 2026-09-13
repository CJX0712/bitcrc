# ✦ BitCrc · 校验和锻造炉

一个**单文件、零依赖、可离线运行**的校验和工具：实时计算四种常见校验/哈希算法，
并对照**公开标准测试向量**自检，附带 CRC-32「追加校验值 → 残差」闭环演示。

> 本仓库由 WorkBuddy 按「随机创新项目」管线自动生成：build → 无头验证 → 推送 GitHub。

## 特性

- **四种算法**：CRC-32（IEEE 802.3 / PNG / ZIP）、CRC-16 / CCITT-FALSE、Adler-32、FNV-1a（32-bit）。
- **公开向量自检**：内置 `123456789` 黄金串对照表，全绿即证明实现与标准一致。
- **CRC-32 残差闭环**：`msg + littleEndian(CRC32(msg))` 再算 CRC-32 必得常量 `0x2144DF1C`（任意输入都成立）。
- **UTF-8 透明**：输入按 UTF-8 解释，中文多字节正确编码（已断言 `晨` = `E6 99 A8`）。
- **纯前端**：无网络请求、无构建步骤，双击 `index.html` 即用。

## 验证

引擎（`index.html` 内 `<script id="engine">`）无 DOM 依赖，可在 Node 无头运行：

```bash
node _smoke.js   # 14 项断言：标准向量 / 残差闭环×300 / UTF-8 字节
node _probe.js   # 导出样例输入与四种校验值到 _probe.txt
```

最近一次验证：**PASS 14 / 14 · ALL GREEN**。

关键标准向量（`"123456789"`）：

| 算法 | 期望 | 实测 |
| --- | --- | --- |
| CRC-32 | `0xCBF43926` | ✓ |
| CRC-16/CCITT | `0x29B1` | ✓ |
| Adler-32 | `0x091E01DE` | ✓ |
| FNV-1a | `0xBB86B11C` | ✓ |

## 引擎 API（`globalThis.CRC`）

| 函数 | 说明 |
| --- | --- |
| `strToBytes(s)` | UTF-8 编码为字节数组 |
| `crc32 / crc16 / adler32 / fnv1a32(bytes)` | 返回 `uint32`（JS 数为非负） |
| `CRC32_CHECK` | CRC-32 残差常量 `0x2144DF1C` |

## 文件

- `index.html` — 完整工具（引擎 + UI，单文件）
- `_smoke.js` / `_probe.js` — 无头验证脚本（不参与运行时）
- `LICENSE` — MIT © 晨星

## License

MIT © 晨星
