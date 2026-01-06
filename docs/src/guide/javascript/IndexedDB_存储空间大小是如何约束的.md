# IndexedDB 存储空间大小是如何约束的？（了解）

**题目**: IndexedDB 存储空间大小是如何约束的？（了解）

## 答案

IndexedDB 的存储空间大小受到多种因素的约束，包括浏览器策略、操作系统限制以及用户磁盘空间等。以下是详细的约束机制：

### 1. 浏览器存储策略

#### 基于可用磁盘空间的动态分配
现代浏览器通常不设置固定的存储上限，而是根据设备的可用磁盘空间动态分配。浏览器会预留一定比例的可用空间给 IndexedDB：

- **Chrome**: 通常可使用可用磁盘空间的 50%-80%
- **Firefox**: 约 50% 的可用磁盘空间
- **Safari**: 有更严格的限制，通常为可用空间的较小比例

#### 存储配额计算机制
```javascript
// 浏览器计算存储配额的伪代码示例
function calculateQuota() {
  const totalDiskSpace = navigator.storage.estimate().quota;
  const availableSpace = getTotalAvailableDiskSpace();
  const browserReserved = availableSpace * 0.2; // 浏览器保留20%
  const webStorageQuota = (availableSpace - browserReserved) * 0.5; // 分配50%给web存储
  
  return webStorageQuota;
}
```

### 2. 存储配额查询

#### 使用 StorageManager API
```javascript
// 查询当前存储使用情况
async function getStorageInfo() {
  try {
    const estimate = await navigator.storage.estimate();
    
    console.log('Storage quota (bytes):', estimate.quota);
    console.log('Storage usage (bytes):', estimate.usage);
    
    // 转换为更易读的格式
    const quotaGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(2);
    const usageGB = (estimate.usage / (1024 * 1024 * 1024)).toFixed(2);
    
    console.log(`Storage quota: ${quotaGB} GB`);
    console.log(`Storage usage: ${usageGB} GB`);
    
    return estimate;
  } catch (error) {
    console.error('Storage estimation not supported:', error);
    return null;
  }
}

getStorageInfo();
```

### 3. 存储限制类型

#### 硬限制（Hard Limits）
- 当达到存储限制时，数据库操作会失败
- 通常在浏览器无法分配更多空间时触发

#### 软限制（Soft Limits）
- 触发浏览器的存储管理机制
- 可能导致旧数据被自动清理

### 4. 处理存储限制

#### 检测存储空间不足
```javascript
function openDatabaseWithQuotaCheck() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyDatabase', 1);
    
    request.onerror = function(event) {
      if (event.target.error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        reject(new Error('Storage quota exceeded'));
      } else {
        reject(event.target.error);
      }
    };
    
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    
    // 在升级时检查空间
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      // 创建对象存储等操作
    };
  });
}
```

#### 存储空间优化策略
```javascript
class IndexedDBManager {
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }
  
  async init() {
    try {
      // 检查存储配额
      const estimate = await navigator.storage.estimate();
      const usagePercentage = (estimate.usage / estimate.quota) * 100;
      
      console.log(`Current storage usage: ${usagePercentage.toFixed(2)}%`);
      
      // 如果使用率超过80%，考虑清理策略
      if (usagePercentage > 80) {
        await this.cleanupOldData();
      }
      
      return this.openDatabase();
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      throw error;
    }
  }
  
  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        // 初始化数据库结构
        this.createObjectStores();
      };
      
      // 处理存储配额错误
      request.onblocked = () => {
        console.warn('Database upgrade is blocked by other connections');
      };
    });
  }
  
  createObjectStores() {
    // 创建对象存储
    if (!this.db.objectStoreNames.contains('data')) {
      const store = this.db.createObjectStore('data', { keyPath: 'id' });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    }
  }
  
  async cleanupOldData() {
    console.log('Cleaning up old data...');
    
    const transaction = this.db.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');
    
    // 获取超过30天的数据
    const index = store.index('timestamp');
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30天前
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete(); // 删除旧数据
          cursor.continue();
        } else {
          console.log('Old data cleanup completed');
          resolve();
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  async addData(data) {
    try {
      const transaction = this.db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      
      // 检查存储使用情况
      const estimate = await navigator.storage.estimate();
      const usagePercentage = (estimate.usage / estimate.quota) * 100;
      
      if (usagePercentage > 90) {
        // 如果使用率超过90%，先清理数据
        await this.cleanupOldData();
      }
      
      const request = store.add(data);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          if (event.target.error.name === 'QuotaExceededError') {
            reject(new Error('Storage quota exceeded after cleanup'));
          } else {
            reject(event.target.error);
          }
        };
      });
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }
}
```

### 5. 浏览器间差异

#### Chrome
- 使用 LRU（最近最少使用）算法管理存储
- 当存储空间不足时，会自动清理最久未使用的数据
- 支持 Quota Management API

#### Firefox
- 有独立的存储管理机制
- 用户可以在设置中手动管理存储数据
- 对存储空间的计算方式略有不同

#### Safari
- 有更严格的隐私和存储限制
- 在隐私模式下，IndexedDB 可能被完全禁用
- 存储限制通常比其他浏览器更严格

### 6. 最佳实践

#### 存储空间监控
```javascript
// 定期监控存储使用情况
async function monitorStorageUsage() {
  const estimate = await navigator.storage.estimate();
  const usagePercentage = (estimate.usage / estimate.quota) * 100;
  
  console.log(`Storage usage: ${usagePercentage.toFixed(2)}%`);
  
  // 当使用率超过阈值时发出警告
  if (usagePercentage > 75) {
    console.warn('Storage usage is getting high:', usagePercentage.toFixed(2) + '%');
  }
  
  return usagePercentage;
}

// 设置定期监控
setInterval(monitorStorageUsage, 300000); // 每5分钟检查一次
```

#### 数据清理策略
```javascript
class DataCleanupStrategy {
  static async cleanupBySizeThreshold(db, maxSizeMB = 50) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // 估算当前数据库大小
    const currentSize = await this.estimateDatabaseSize(db);
    
    if (currentSize > maxSizeBytes) {
      // 按时间顺序删除旧数据，直到低于阈值
      await this.deleteOldestData(db, currentSize - maxSizeBytes);
    }
  }
  
  static async estimateDatabaseSize(db) {
    // 估算数据库大小的简化方法
    // 在实际应用中可能需要更复杂的计算
    return new Promise((resolve) => {
      const transaction = db.transaction(db.objectStoreNames, 'readonly');
      let totalSize = 0;
      
      for (const storeName of db.objectStoreNames) {
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const data = request.result;
          const jsonString = JSON.stringify(data);
          totalSize += new Blob([jsonString]).size;
        };
      }
      
      transaction.oncomplete = () => {
        resolve(totalSize);
      };
    });
  }
}
```

### 7. 用户权限和隐私考虑

IndexedDB 的存储限制也受到用户隐私设置的影响：

- **隐私模式/无痕模式**: 在某些浏览器中，IndexedDB 数据可能在会话结束后被清除
- **存储权限**: 现代浏览器可能会要求用户授权大量存储使用
- **跨域限制**: IndexedDB 遵循同源策略，不同域的数据存储是隔离的

通过理解这些存储约束机制，开发者可以更好地设计数据存储策略，确保应用在各种环境下都能正常运行。
