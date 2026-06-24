# figma-size-extension（设计尺寸延展 Skill）

把一张源设计稿按团队规范延展成 **活动中心 Banner 1035×368** 和 **弹窗 Popup 900×1200**（各出 简/繁/英），统一字体、版面、安全区、文案规则。给任何同事在任何电脑上调用，命令一致、规范一致。

## 这是什么
一个 **Claude Code Skill**。装好后，在 Claude Code 里对任意 Figma 源稿说「按规范延展」或直接输入 `/figma-size-extension`，Claude 会按统一规范执行。

## 安装（推荐：克隆即更新）
**直接把仓库 clone 到 skills 目录**，以后 `git pull` 就能同步最新规范（不要用 cp 复制，复制后无法 pull 更新）：
```bash
git clone https://github.com/MARE9292/figma-size-extension.git ~/.claude/skills/figma-size-extension
```
重开 Claude Code，输入 `/` 应能看到 `figma-size-extension`。
> 备选：`./install.sh` 会复制安装（适合不想用 git 的同事，但失去自动更新能力）。

## 同步更新（新增/修改延展尺寸后）
**单一源头 = 本 GitHub 仓库。** 流程：
1. 维护者改 `SKILL.md`（增尺寸/改规则）+ `references/spec.md`（数值细节），如涉及苹方/MiSans 新帧名再改 `references/font-swap/code.js` 的 `FRAME_LANG`。
2. `git commit -m "feat: 新增尺寸 XxY" && git push`。
3. **同事一行命令同步**：
   ```bash
   cd ~/.claude/skills/figma-size-extension && git pull
   ```
   重开 Claude Code 生效。
> 维护者同时需同步另两处：Claude 记忆（`figma_size_extension.md`）与飞书《设计延展规范》文档，保证四处一致。交给 Claude 处理时，只需说一句「新增尺寸 X，规则 Y」，它会改这四处并推送。

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
