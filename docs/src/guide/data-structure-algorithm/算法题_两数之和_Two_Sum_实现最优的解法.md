# 算法题：两数之和（Two Sum），实现最优的解法？（必会）

**题目**: 算法题：两数之和（Two Sum），实现最优的解法？（必会）

## 标准答案

Two Sum 问题的经典解法是使用哈希表（HashMap），时间复杂度为 O(n)，空间复杂度为 O(n)。算法思路是遍历数组，对每个元素计算其与目标值的差值，然后在哈希表中查找这个差值是否存在。如果存在，则找到了两个数；如果不存在，则将当前元素和其索引存入哈希表。

```javascript
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return []; // 如果没有找到符合条件的两个数
}
```

## 深入分析

### 1. 问题定义

Two Sum 问题是给定一个整数数组 `nums` 和一个目标值 `target`，请你在该数组中找出和为目标值的两个整数，并返回它们的数组下标。

假设每种输入只会对应一个答案，且数组中同一个元素不能使用两遍。

### 2. 算法复杂度分析

- **暴力解法**: 时间复杂度 O(n²)，空间复杂度 O(1)
- **哈希表解法**: 时间复杂度 O(n)，空间复杂度 O(n)

哈希表解法是最优解，因为它将时间复杂度从 O(n²) 降低到了 O(n)。

### 3. 算法原理

哈希表解法的核心思想是空间换时间。我们遍历数组，对于每个元素 `nums[i]`，计算 `target - nums[i]`，然后检查这个值是否已经在哈希表中存在。如果存在，说明我们找到了两个数的和等于目标值；如果不存在，我们将当前元素和其索引存入哈希表，继续遍历。

这种方法避免了嵌套循环，将查找操作的时间复杂度从 O(n) 降低到 O(1)。

## 代码示例

### 1. 基础哈希表解法

```javascript
/**
 * 两数之和 - 哈希表解法
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标值
 * @return {number[]} - 返回两个数的索引
 */
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return []; // 没有找到符合条件的两个数
}

// 测试用例
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));      // [1, 2]
console.log(twoSum([3, 3], 6));         // [0, 1]
```

### 2. 暴力解法（供对比）

```javascript
/**
 * 两数之和 - 暴力解法
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标值
 * @return {number[]} - 返回两个数的索引
 */
function twoSumBruteForce(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}

// 时间复杂度: O(n²)
// 空间复杂度: O(1)
```

### 3. 双指针解法（需要排序，返回值而非索引）

```javascript
/**
 * 两数之和 - 双指针解法（返回值而非索引）
 * 注意：此方法会改变原数组的顺序
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标值
 * @return {number[]} - 返回两个数的值
 */
function twoSumTwoPointers(nums, target) {
    // 创建一个包含值和原始索引的数组
    const indexedNums = nums.map((val, idx) => ({ val, idx }));
    // 按值排序
    indexedNums.sort((a, b) => a.val - b.val);
    
    let left = 0;
    let right = indexedNums.length - 1;
    
    while (left < right) {
        const sum = indexedNums[left].val + indexedNums[right].val;
        
        if (sum === target) {
            return [indexedNums[left].val, indexedNums[right].val];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [];
}

// 如果需要返回原始索引，需要额外处理
function twoSumTwoPointersWithIndex(nums, target) {
    const indexedNums = nums.map((val, idx) => ({ val, idx }));
    indexedNums.sort((a, b) => a.val - b.val);
    
    let left = 0;
    let right = indexedNums.length - 1;
    
    while (left < right) {
        const sum = indexedNums[left].val + indexedNums[right].val;
        
        if (sum === target) {
            // 返回原始索引，确保较小的索引在前
            const indices = [indexedNums[left].idx, indexedNums[right].idx].sort((a, b) => a - b);
            return indices;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [];
}
```

### 4. 处理多种变体

```javascript
/**
 * 两数之和 - 返回所有可能的组合
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标值
 * @return {number[][]} - 返回所有可能的索引对
 */
function twoSumAllPairs(nums, target) {
    const result = [];
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            // 找到所有匹配的索引
            const indices = map.get(complement);
            for (const idx of indices) {
                result.push([idx, i]);
            }
        }
        
        // 将当前值和索引添加到映射中
        if (!map.has(nums[i])) {
            map.set(nums[i], []);
        }
        map.get(nums[i]).push(i);
    }
    
    return result;
}

/**
 * 两数之和 - 不返回索引，返回值
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标值
 * @return {number[]} - 返回两个数的值
 */
function twoSumValues(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [complement, nums[i]];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

/**
 * 两数之和 - 检查是否存在
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标值
 * @return {boolean} - 是否存在两个数的和等于目标值
 */
function twoSumExists(nums, target) {
    const set = new Set();
    
    for (const num of nums) {
        const complement = target - num;
        
        if (set.has(complement)) {
            return true;
        }
        
        set.add(num);
    }
    
    return false;
}
```

### 5. 优化和扩展

```javascript
/**
 * 优化版本：处理边界情况
 */
function twoSumOptimized(nums, target) {
    // 边界检查
    if (!nums || nums.length < 2) {
        return [];
    }
    
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        // 检查重复元素情况
        map.set(nums[i], i);
    }
    
    return [];
}

/**
 * 三数之和扩展（基于Two Sum）
 */
function threeSum(nums, target = 0) {
    if (nums.length < 3) return [];
    
    nums.sort((a, b) => a - b);
    const result = [];
    
    for (let i = 0; i < nums.length - 2; i++) {
        // 跳过重复元素
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            if (sum === target) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // 跳过重复元素
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

// 测试
console.log(twoSum([2, 7, 11, 15], 9));        // [0, 1]
console.log(twoSumAllPairs([1, 1, 2, 3, 4], 5)); // [[2, 3]] (索引2和3的值是2和3，和为5)
console.log(twoSumValues([2, 7, 11, 15], 9));   // [2, 7]
console.log(twoSumExists([2, 7, 11, 15], 9));   // true
console.log(threeSum([-1, 0, 1, 2, -1, -4]));   // [[-1, -1, 2], [-1, 0, 1]]
```

## 实际应用场景

### 1. 电商系统
- 价格匹配：在商品价格列表中查找两个商品，使其价格之和等于某个预算
- 优惠券组合：查找两张优惠券，使其面额之和等于某个值

### 2. 金融系统
- 资金配对：在多个投资选项中找到两个选项，使其投资额之和等于目标值
- 风险对冲：找到两个资产，其风险指标之和为零（对冲）

### 3. 数据分析
- 相似度匹配：在数据集中找到两个相似度值之和等于阈值的数据点
- 时间序列分析：找到两个时间点，其时间差等于特定值

### 4. 游戏开发
- 道具合成：在游戏道具系统中找到两个道具，其属性值之和满足条件
- 关卡设计：设计需要两个不同数值相加达到目标的谜题

## 最佳实践

1. **选择最优解法**: 优先使用哈希表解法，时间复杂度 O(n)
2. **处理边界情况**: 检查空数组、长度不足等情况
3. **考虑重复元素**: 根据题目要求处理重复元素
4. **空间与时间权衡**: 根据具体场景选择合适的解法
5. **代码可读性**: 添加适当的注释和错误处理
6. **测试充分**: 包含各种边界情况和正常情况的测试用例
