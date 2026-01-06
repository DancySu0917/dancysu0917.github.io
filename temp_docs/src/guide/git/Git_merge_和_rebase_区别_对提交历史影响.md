# Git merge 和 rebase 区别？对提交历史影响？（了解）

**题目**: Git merge 和 rebase 区别？对提交历史影响？（了解）

**答案**:

Git merge 和 rebase 都是用来整合分支代码的方法，但它们的工作原理和对提交历史的影响有显著区别：

## Git Merge

Merge 是一种非破坏性的操作，它会创建一个新的提交（merge commit）来连接两个分支的历史。

### 特点：
- 保留完整的项目历史记录
- 创建一个合并提交（merge commit）
- 不会改变提交的哈希值
- 适合团队协作场景

### 示例：
```bash
# 切换到目标分支
git checkout main
# 合并功能分支
git merge feature-branch
```

### 提交历史效果：
```
main: A---B---C
             \
feature:      D---E---F
                    |
                 merge commit
```

## Git Rebase

Rebase 会将一个分支的提交重新应用到另一个分支上，形成线性的提交历史。

### 特点：
- 创建线性、整洁的提交历史
- 不创建额外的合并提交
- 会改变提交的哈希值
- 可能导致历史重写问题

### 示例：
```bash
# 在 feature 分支上执行 rebase
git checkout feature-branch
git rebase main
# 然后切换到主分支合并
git checkout main
git merge feature-branch  # 此时是 fast-forward 合并
```

### 提交历史效果：
```
main: A---B---C
             |
feature:      D'---E'---F'
```

## 对提交历史的影响对比

| 特性 | Merge | Rebase |
|------|-------|--------|
| 提交历史 | 保留分支结构，可能有分叉 | 线性历史，无分叉 |
| 提交数量 | 增加一个合并提交 | 不增加额外提交 |
| 提交哈希 | 保持原哈希不变 | 生成新哈希值 |
| 历史完整性 | 保留原始时间线 | 重写时间线 |
| 协作安全性 | 安全，适合共享分支 | 潜在风险，避免在共享分支使用 |

## 使用场景建议

### 使用 Merge 的场景：
- 多人协作的共享分支
- 需要保留完整项目历史
- 团队协作中的标准流程
- 重要的发布分支合并

### 使用 Rebase 的场景：
- 整理本地功能分支
- 保持提交历史整洁
- 个人开发分支的更新
- Pull Request 前的提交整理

## 注意事项

1. **不要对已推送的公共分支使用 rebase**：这会导致其他开发者遇到冲突
2. **Merge 后的历史更真实**：反映了实际的开发流程
3. **Rebase 后的提交更有序**：便于代码审查和问题定位
4. **交互式 rebase**：`git rebase -i` 可以编辑、合并、删除提交

## 交互式 Rebase 示例

```bash
# 交互式 rebase，可以编辑最近3个提交
git rebase -i HEAD~3

# 在编辑器中可以选择操作：
# pick: 保留提交
# reword: 修改提交信息
# edit: 修改提交内容
# squash: 合并到前一个提交
# drop: 删除提交
```

选择 merge 还是 rebase 主要取决于团队的工作流程、对历史记录的要求以及协作方式。
