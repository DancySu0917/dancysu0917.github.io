# getTempFileURL

```js
const cloud = require('wx-server-sdk');

/**
 * 初始化云开发环境
 */
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 获取文件临时URL云函数
 * @param {Object} event - 事件对象
 * @param {Array} event.fileIDs - 文件ID数组
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 返回临时URL映射
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { fileIDs = [] } = event;
        
        if (!Array.isArray(fileIDs) || fileIDs.length === 0) {
            return {
                success: true,
                message: '未提供文件ID，返回空结果',
                data: {
                    urlMap: {}
                }
            };
        }
        
        // 获取临时文件URL
        const result = await cloud.getTempFileURL({
            fileList: fileIDs
        });
        
        // 构建URL映射
        const urlMap = {};
        (result.fileList || []).forEach((file) => {
            if (file.status === 0) {
                urlMap[file.fileID] = file.tempFileURL;
            } else {
                console.warn(`[getTempFileURL] 获取文件 ${file.fileID} 临时URL失败:`, file.errMsg);
            }
        });
        
        return {
            success: true,
            message: '获取临时URL成功',
            data: {
                urlMap: urlMap,
                successCount: Object.keys(urlMap).length,
                totalCount: fileIDs.length
            }
        };
    } catch (error) {
        console.error('[getTempFileURL] 获取临时URL失败', error);
        
        // 解析常见错误类型
        let errorMessage = '获取临时URL失败';
        if (error.errCode === -501000) {
            errorMessage = '文件不存在或已过期';
        }
        
        return {
            success: false,
            message: errorMessage,
            error: error.message
        };
    }
};
```