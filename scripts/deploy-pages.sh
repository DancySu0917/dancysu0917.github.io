#!/bin/bash

# 脚本：先构建，将构建后的doc_build下的所有文件上传到pages分支

echo "开始构建并部署到pages分支..."

# 检查是否为git仓库
if [ ! -d ".git" ]; then
  echo "错误：当前目录不是git仓库！"
  exit 1
fi

# 1. 构建项目
echo "
1. 正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "构建失败！"
  exit 1
fi

# 检查构建输出目录是否存在
build_dir="doc_build"
if [ ! -d "$build_dir" ]; then
  # 如果doc_build不存在，检查默认的dist目录
  if [ -d "dist" ]; then
    echo "警告：doc_build目录不存在，使用默认的dist目录"
    build_dir="dist"
  else
    echo "错误：未找到构建输出目录(doc_build或dist)！"
    exit 1
  fi
fi

# 2. 部署到pages分支
echo "
2. 正在部署到pages分支..."

# 创建临时目录用于部署
TEMP_DIR=$(mktemp -d)
echo "使用临时目录：$TEMP_DIR"

# 复制构建文件到临时目录
cp -r "$build_dir"/* "$TEMP_DIR"/

# 进入临时目录
cd "$TEMP_DIR"

# 初始化git仓库并配置
rm -rf .git
git init
git config user.name "GitHub Actions"
git config user.email "actions@github.com"

# 创建.gitignore文件（可选）
echo "node_modules/" > .gitignore
echo ".git/" >> .gitignore

# 添加文件并提交
git add .
git commit -m "Deploy to GitHub Pages"

# 推送到pages分支（强制推送）
git push -f "$GITHUB_REPOSITORY" main:pages 2>/dev/null || git push -f origin main:pages

if [ $? -ne 0 ]; then
  echo "部署到pages分支失败！"
  exit 1
fi

# 清理临时目录
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "
构建和部署完成！doc_build目录已成功上传到pages分支。"
