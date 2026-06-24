# figma-size-extension（设计尺寸延展 Skill）

把一张源设计稿按团队规范延展成 **活动中心 Banner 1035×368** 和 **弹窗 Popup 900×1200**（各出 简/繁/英），统一字体、版面、安全区、文案规则。给任何同事在任何电脑上调用，命令一致、规范一致。

## 这是什么
一个 **Claude Code Skill**。装好后，在 Claude Code 里对任意 Figma 源稿说「按规范延展」或直接输入 `/figma-size-extension`，Claude 会按统一规范执行。

## 安装（每位同事一次）
把整个 `figma-size-extension/` 文件夹放进 Claude Code 的 skills 目录其一：
- 个人全局（推荐）：`~/.claude/skills/figma-size-extension/`
- 某项目内：`<项目>/.claude/skills/figma-size-extension/`

```bash
# 示例：装到个人全局
cp -R figma-size-extension ~/.claude/skills/
```
重启 / 重开 Claude Code 后，输入 `/` 应能看到 `figma-size-extension`。

## 协作分发（保持规范一致的关键）
把这个文件夹放进**共享 Git 仓库**（或飞书云盘），所有人从同一来源安装/更新：
```bash
# 团队仓库示例
git clone <团队设计规范仓库> && cp -R 团队设计规范仓库/skills/figma-size-extension ~/.claude/skills/
# 规范更新后，重新拉取覆盖即可，全员一致
```
> 规范有任何修改，只改这一个文件夹并推到共享仓库；同事更新后即同步，杜绝口口相传走样。

## 用法
1. 在 Claude Code 里贴 Figma 源稿链接（带 node-id 最好）。
2. 说「按规范延展」或 `/figma-size-extension`。
3. Claude 读源稿 → 确认尺寸/语言 → 按 `SKILL.md` 规范产出 6 帧 → 逐帧截图自检。
4. 需要真·苹方/MiSans 时，用 `references/font-swap/` 的本地插件落地（说明见 `references/spec.md` 第四节）。

## 内容
- `SKILL.md` — 规范主文件（触发后 Claude 读它执行）。
- `references/spec.md` — 完整数值、配色、构建顺序、踩坑。
- `references/font-swap/` — 苹方/MiSans 本地字体替换插件（manifest.json / code.js / ui.html）。

## 前置
- Claude Code + Figma MCP（连接 Figma 账号）。
- 字体：默认思源（云端可用，无需装）；要苹方/MiSans 才需本机装字体 + 导入插件。
