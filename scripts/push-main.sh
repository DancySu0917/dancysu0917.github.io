#!/bin/bash

# 脚本：将代码上传到main分支

echo "开始将代码上传到main分支..."

# 检查是否为git仓库
if [ ! -d ".git" ]; then
  echo "错误：当前目录不是git仓库！"
  exit 1
fi

# 检查是否有未提交的更改
git status
read -p "是否继续提交所有更改？(y/n) " -n 1 -r
echo
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # 添加所有更改
  git add .
  
  # 提交更改
  read -p "请输入提交信息：" commit_msg
  git commit -m "$commit_msg"
  
  # 推送到main分支
  git push origin main
  
  echo "
代码已成功上传到main分支！"
else
  echo "
操作已取消。"
  exit 0
fi
