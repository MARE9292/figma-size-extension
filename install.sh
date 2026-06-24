#!/usr/bin/env bash
# 一键安装本 Skill 到 Claude Code 个人全局 skills 目录
set -e
DEST="${HOME}/.claude/skills/figma-size-extension"
SRC="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "${HOME}/.claude/skills"
rm -rf "$DEST"
cp -R "$SRC" "$DEST"
rm -rf "$DEST/.git"
echo "✅ 已安装到 $DEST —— 重开 Claude Code，输入 /figma-size-extension 即可用"
