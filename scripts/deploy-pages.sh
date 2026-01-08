#!/bin/bash

# 脚本：先构建，将构建后的doc_build下的所有文件上传到pages分支

# 保存原始目录路径
ORIGINAL_DIR=$(pwd)

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

# 使用本地的git配置信息
echo "使用本地git配置信息："
git config user.name "$(git config --global user.name)"
git config user.email "$(git config --global user.email)"

# 显示当前git配置
echo "- 当前git用户：$(git config user.name) <$(git config user.email)>"

# 获取原始仓库的远程URL
ORIGINAL_REMOTE_URL=$(cd "$ORIGINAL_DIR" && git remote get-url origin)
echo "- 原始仓库URL：$ORIGINAL_REMOTE_URL"

# 添加远程仓库
git remote add origin "$ORIGINAL_REMOTE_URL"
echo "- 已添加远程仓库：$(git remote -v)"

# 创建.gitignore文件（可选）
echo "node_modules/" > .gitignore
echo ".git/" >> .gitignore

# 添加文件并提交
git add .
git commit -m "Deploy to GitHub Pages"

# 推送到pages分支（强制推送）
echo "正在推送..."
git push -f origin main:pages

if [ $? -ne 0 ]; then
  echo "
部署到pages分支失败！"
  echo "
可能的原因："
  echo "1. SSH密钥配置问题 - 请检查 ~/.ssh 目录下的密钥文件"
  echo "2. 仓库访问权限 - 确保您有权限推送到该仓库"
  echo "3. 网络问题 - 检查网络连接是否正常"
  echo "
建议的解决步骤："
  echo "1. 测试SSH连接：ssh -T git@github.com"
  echo "2. 检查远程仓库URL：git remote -v"
  echo "3. 确保pages分支存在或可以被创建"
  exit 1
fi

# 清理临时目录
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "
构建和部署完成！doc_build目录已成功上传到pages分支。"
