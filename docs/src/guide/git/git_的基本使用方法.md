# git 的基本使用方法（必会）

**题目**: git 的基本使用方法（必会）

## 标准答案

Git是分布式版本控制系统，以下是其基本使用方法：

### 1. Git仓库初始化和克隆
```bash
# 初始化本地仓库
git init

# 克隆远程仓库
git clone <repository-url>

# 克隆特定分支
git clone -b <branch-name> <repository-url>
```

### 2. 文件操作相关命令
```bash
# 查看工作区状态
git status

# 添加文件到暂存区
git add <file-name>        # 添加单个文件
git add .                  # 添加所有文件
git add *.js               # 添加所有js文件

# 提交文件到本地仓库
git commit -m "提交信息"

# 添加并提交（仅对已跟踪的文件）
git commit -am "提交信息"
```

### 3. 分支操作
```bash
# 查看分支
git branch                 # 查看本地分支
git branch -r              # 查看远程分支
git branch -a              # 查看所有分支

# 创建分支
git branch <branch-name>   # 创建分支
git checkout -b <branch-name>  # 创建并切换到分支
git switch -c <branch-name>    # Git 2.23+推荐用法

# 切换分支
git checkout <branch-name>
git switch <branch-name>   # Git 2.23+推荐用法

# 合并分支
git merge <branch-name>

# 删除分支
git branch -d <branch-name>    # 删除本地分支
git push origin --delete <branch-name>  # 删除远程分支
```

### 4. 远程仓库操作
```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <repository-url>

# 推送到远程仓库
git push origin <branch-name>
git push -u origin <branch-name>  # 设置上游分支

# 从远程仓库拉取
git pull origin <branch-name>
git fetch origin <branch-name>    # 仅获取不合并
```

### 5. 查看历史和差异
```bash
# 查看提交历史
git log
git log --oneline          # 简洁格式
git log --graph            # 图形化显示
git log --author="用户名"    # 按作者过滤

# 查看文件差异
git diff                   # 工作区与暂存区差异
git diff --cached          # 暂存区与仓库差异
git diff HEAD              # 工作区与仓库差异
git diff <commit1> <commit2>  # 两个提交间差异
```

### 6. 撤销操作
```bash
# 撤销工作区修改
git checkout -- <file-name>
git restore <file-name>    # Git 2.23+推荐用法

# 撤销暂存区文件
git reset HEAD <file-name>
git restore --staged <file-name>  # Git 2.23+推荐用法

# 撤销最近一次提交
git reset --soft HEAD~1    # 保留工作区和暂存区
git reset --mixed HEAD~1   # 保留工作区，清空暂存区（默认）
git reset --hard HEAD~1    # 完全撤销
```

### 7. 标签操作
```bash
# 创建标签
git tag <tag-name>         # 轻量标签
git tag -a <tag-name> -m "标签信息"  # 注解标签

# 推送标签
git push origin <tag-name>
git push origin --tags     # 推送所有标签

# 删除标签
git tag -d <tag-name>      # 删除本地标签
git push origin --delete tag <tag-name>  # 删除远程标签
```

## 深入理解

### Git工作流程
1. 工作区（Working Directory）：实际文件所在目录
2. 暂存区（Staging Area）：准备提交的文件区域
3. 本地仓库（Local Repository）：本地的Git仓库
4. 远程仓库（Remote Repository）：远程的Git仓库

### 配置Git
```bash
# 全局配置
git config --global user.name "用户名"
git config --global user.email "邮箱"

# 查看配置
git config --list

# 仓库级别配置
git config user.name "用户名"
```

### 常用组合命令
```bash
# 查看最近一次提交的详细信息
git show

# 查看某个文件的历史
git log --follow <file-name>

# 比较分支差异
git diff <branch1>..<branch2>

# 查看谁在什么时候修改了文件的哪些行
git blame <file-name>
```

## 实际面试问题及答案

### Q: Git和SVN的主要区别是什么？
A: 
1. Git是分布式版本控制系统，SVN是集中式版本控制系统
2. Git支持离线操作，SVN需要连接服务器
3. Git分支操作更轻量，SVN分支是目录拷贝
4. Git数据完整性更好，使用SHA-1哈希保证数据完整性

### Q: Git中HEAD、Index、Working Directory分别是什么？
A:
- HEAD：指向当前分支的最新提交
- Index（暂存区）：准备下次提交的文件区域
- Working Directory（工作目录）：实际编辑文件的目录

### Q: 如何处理Git提交时的冲突？
A:
1. Git会标记出冲突的文件
2. 手动编辑冲突文件，解决冲突
3. 添加解决后的文件到暂存区
4. 提交解决冲突后的结果

### Q: Git的add命令具体做了什么？
A:
1. 将文件从工作目录复制到暂存区（Index）
2. 记录文件的当前状态，用于下一次提交
3. 对于新文件，将其标记为"待添加"
4. 对于已跟踪文件，记录其当前版本

Git的基本使用方法是日常开发中必须掌握的技能，熟练使用这些命令可以提高开发效率和代码管理能力。
