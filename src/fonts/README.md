# 项目字体

## 当前使用

| 文件 | 字体 | 授权 |
|------|------|------|
| `ZCOOLQingKeHuangYou-Regular.woff2` | 站酷庆科黄油体（ZCOOL QingKe HuangYou） | 站酷免费商用 |

用于工作台 Header 品牌标题，通过 `next/font/local` 加载。

## 替换为站酷酷黑（可选）

若希望使用 **站酷酷黑（ZCOOL KuHei）**：

1. 从 [站酷字库](https://www.zcool.com.cn/special/zcoolfonts/) 下载酷黑体
2. 将字体文件放入本目录，命名为 `ZCOOLKuHei-Regular.woff2` 或 `ZCOOLKuHei-Regular.ttf`
3. 在 `src/components/BrandTitle.tsx` 中将 `localFont` 的 `src` 改为对应文件名
