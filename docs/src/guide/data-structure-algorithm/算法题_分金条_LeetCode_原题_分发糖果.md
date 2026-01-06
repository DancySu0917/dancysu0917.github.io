# 算法题：分金条（LeetCode 原题：分发糖果）？（了解）

**题目**: 算法题：分金条（LeetCode 原题：分发糖果）？（了解）

**答案**:

这是一个经典的贪心算法问题，题目通常描述为：有 N 个孩子站成一排，每个孩子有一个评分。你需要按照以下规则分发糖果：

1. 每个孩子至少分配到 1 个糖果
2. 相邻的孩子中，评分高的孩子必须比他的邻居获得更多糖果

## 问题分析

这个问题的关键是满足两个约束条件：
- 每个孩子至少有1个糖果
- 评分高的孩子比相邻评分低的孩子获得更多糖果

## 解法一：两次遍历法（推荐）

### 思路：
1. 从左到右遍历，确保右边评分高的孩子比左边多
2. 从右到左遍历，确保左边评分高的孩子比右边多
3. 取两个遍历结果的最大值

### 实现：
```javascript
function candy(ratings) {
    const n = ratings.length;
    if (n === 0) return 0;
    
    // 初始化每个孩子都有1个糖果
    const candies = new Array(n).fill(1);
    
    // 从左到右遍历：确保右边评分高的孩子比左边的多
    for (let i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            candies[i] = candies[i - 1] + 1;
        }
    }
    
    // 从右到左遍历：确保左边评分高的孩子比右边的多
    for (let i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) {
            candies[i] = Math.max(candies[i], candies[i + 1] + 1);
        }
    }
    
    // 计算总糖果数
    return candies.reduce((sum, val) => sum + val, 0);
}

// 测试
console.log(candy([1, 0, 2])); // 输出: 5 (2+1+2)
console.log(candy([1, 2, 2])); // 输出: 4 (1+2+1)
console.log(candy([1, 3, 2, 2, 1])); // 输出: 7 (1+2+1+2+1)
```

### 详细步骤说明：
1. 初始状态：`ratings = [1, 3, 2, 2, 1]`, `candies = [1, 1, 1, 1, 1]`
2. 左到右遍历：`candies = [1, 2, 1, 1, 1]`（第1个孩子比第0个评分高，所以第1个孩子得2个糖果）
3. 右到左遍历：`candies = [1, 2, 1, 2, 1]`（第3个孩子比第4个评分高，所以第3个孩子得2个糖果）
4. 总和：1+2+1+2+1 = 7

## 解法二：单次遍历法（空间优化）

### 思路：
通过追踪递增和递减序列的长度来优化空间复杂度。

### 实现：
```javascript
function candyOptimized(ratings) {
    const n = ratings.length;
    if (n === 0) return 0;
    if (n === 1) return 1;
    
    let total = 1; // 至少给第一个孩子1个糖果
    let up = 0;    // 递增序列长度
    let down = 0;  // 递减序列长度
    let prevSlope = 0; // 前一个坡度（1=上升，-1=下降，0=平）

    for (let i = 1; i < n; i++) {
        let currentSlope = ratings[i] > ratings[i - 1] ? 1 : 
                          ratings[i] < ratings[i - 1] ? -1 : 0;

        if ((prevSlope > 0 && currentSlope === 0) || (prevSlope < 0 && currentSlope >= 0)) {
            // 坡度变化，结算之前的递增/递减序列
            total += sumOfRange(1, up) + sumOfRange(1, down) + Math.max(up, down);
            up = 0;
            down = 0;
        }

        if (currentSlope > 0) {
            up++;
        } else if (currentSlope < 0) {
            down++;
        } else {
            total++; // 平地，给1个糖果
        }

        prevSlope = currentSlope;
    }

    // 处理最后的序列
    total += sumOfRange(1, up) + sumOfRange(1, down) + Math.max(up, down);
    
    return total;
}

// 计算从start到end的连续整数和
function sumOfRange(start, end) {
    if (start > end) return 0;
    return (end * (end + 1)) / 2 - (start * (start - 1)) / 2;
}
```

## 解法三：简洁版本

### 实现：
```javascript
function candySimple(ratings) {
    const n = ratings.length;
    const left = new Array(n).fill(1);
    const right = new Array(n).fill(1);
    
    // 从左到右
    for (let i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            left[i] = left[i - 1] + 1;
        }
    }
    
    // 从右到左
    for (let i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) {
            right[i] = right[i + 1] + 1;
        }
    }
    
    // 取最大值并求和
    let total = 0;
    for (let i = 0; i < n; i++) {
        total += Math.max(left[i], right[i]);
    }
    
    return total;
}
```

## 复杂度分析

### 两次遍历法（推荐）：
- **时间复杂度**: O(n)，需要遍历数组两次
- **空间复杂度**: O(n)，需要额外数组存储糖果数量

### 单次遍历法：
- **时间复杂度**: O(n)
- **空间复杂度**: O(1)，只使用常数额外空间

## 算法核心思想

这个问题的核心是**贪心算法**：
1. 每个孩子至少获得1个糖果（基础条件）
2. 满足相邻关系的最小糖果数（贪心选择）
3. 两次遍历确保同时满足左右两个方向的约束

## 实际应用场景

1. **资源分配**: 在有限资源下，根据优先级公平分配
2. **绩效奖励**: 根据绩效评分分配奖金，确保相邻等级间有合理差距
3. **任务调度**: 根据任务优先级分配处理时间

两次遍历法是最容易理解和实现的解法，也是面试中最常被要求的解法。
