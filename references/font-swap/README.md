# Tiger FontSwap 插件 — 团队安装与使用

把延展物料（活动中心 1035×368 / 弹窗 900×1200）的文字一键切换到 **苹方** 或 **MiSans**。金属产品字（Roboto Condensed）自动保留不动。

> 这是一个**本地开发插件**（非 Figma 社区插件）。Figma 没有"一处导入全员可见"的机制（除非 Organization/Enterprise 私有发布），所以团队用法是**每人各自从本文件夹导入一次**。

## 一、前置：字体要"能被读到"
插件靠"运行者能访问的字体"工作。二选一即可：
- **（推荐）在 Figma 账号上传字体**：设置 → Settings → **Your uploaded fonts → Upload font**，上传 MiSans（含 MiSans TC）/ 苹方 PingFang SC·HK 的各字重。上传后**云端和桌面都能用**，最省事。
- **或** 本机系统安装这些字体（macOS 苹方自带；MiSans 去小米官网下载装到「字体册」），并用 **Figma 桌面版**（会自动读系统字体）。

## 二、安装（每位同事一次，约 30 秒）
1. 拿到本文件夹 `font-swap/`（随本仓库 clone 即可）。
2. Figma **桌面版** → 顶部菜单 **插件 / Plugins → 开发 / Development → Import plugin from manifest…**
3. 选择本文件夹里的 **`manifest.json`** → 完成。
4. 之后在 **插件 → 开发 → Tiger FontSwap** 即可运行。

> 升级：`git pull` 更新本文件夹后，插件每次运行自动读最新代码，**无需重新导入**（除非改了 manifest.json）。

## 三、使用
1. 打开包含延展帧的设计文件（帧名需含 `活动中心-1035x368` 或 `弹窗-900x1200`；语言按后缀：`-繁`→繁、`-EN`→英、无后缀→简）。
2. 运行 **插件 → 开发 → Tiger FontSwap**。
3. 先点 **🔍 诊断** 确认目标字体可枚举到；再点 **切苹方** 或 **切 MiSans**。
4. 结果：简→PingFang SC / MiSans；繁→PingFang HK / MiSans TC；英→Roboto；金属字保持 Roboto Condensed。

## 四、说明
- 字体已上传到 Figma 账号后，走 Claude/MCP 出图其实可直接套字体、**不必用此插件**；插件主要给"人手动在 Figma 里切字体"用。
- 文件：`manifest.json`（插件清单）、`code.js`（逻辑）、`ui.html`（界面）。
