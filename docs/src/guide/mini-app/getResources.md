# getResources

```js
const cloud = require('wx-server-sdk');

/**
 * 初始化云开发环境
 */
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const COLLECTION_NAME = 'resources'; // 云数据库集合名称

/**
 * 获取资源列表云函数
 * @param {Object} event - 事件对象
 * @param {number} [event.limit=20] - 每页数量
 * @param {string} [event.offset=null] - 分页起始ID
 * @param {boolean} [event.includeTempURL=false] - 是否包含临时文件URL
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 返回资源列表数据
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { limit = 20, offset = null, includeTempURL = false } = event;
        
        // 构建查询
        let query = db.collection(COLLECTION_NAME)
            .orderBy('createTime', 'desc')
            .limit(limit);

        console.log('>>>get', query);
        
        // 如果提供了offset，则使用skip进行分页
        if (offset) {
            query = query.skip(offset);
        }
        
        // 执行查询
        const result = await query.get();
        
        // 返回结果
        const { data } = result;
        
        return {
            success: true,
            message: '获取资源列表成功',
            data: {
                resources: data
            }
        };
    } catch (error) {
        console.error('[getResource] 获取资源列表失败', error);
        
        // 解析常见错误类型
        let errorMessage = '获取资源列表失败';
        if (error.errCode === -502005) {
            errorMessage = '集合不存在';
        } else if (error.errCode === -502007) {
            errorMessage = '数据库权限不足';
        }
        
        return {
            success: false,
            message: errorMessage,
            error: error.message
        };
    }
};
```