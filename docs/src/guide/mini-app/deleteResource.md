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
 * 删除资源云函数
 * @param {Object} event - 事件对象
 * @param {string} event.resourceId - 资源ID
 * @param {string} [event.fileID] - 文件ID（可选，如果不提供会从数据库获取）
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 返回删除结果
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { resourceId, fileID } = event;
        
        if (!resourceId) {
            return {
                success: false,
                message: '资源ID不能为空'
            };
        }
        
        // 获取资源信息
        const resourceResult = await db.collection(COLLECTION_NAME).doc(resourceId).get();
        const resource = resourceResult.data;
        
        // 确定要删除的文件ID
        const fileToDelete = fileID || resource.fileID;
        
        // 删除云存储中的文件
        if (fileToDelete) {
            try {
                await cloud.deleteFile({
                    fileList: [fileToDelete]
                });
            } catch (fileError) {
                console.warn('[deleteResource] 删除云存储文件失败', fileError);
                // 文件删除失败不影响数据库记录的删除
            }
        }
        
        // 删除数据库中的记录
        await db.collection(COLLECTION_NAME).doc(resourceId).remove();
        
        return {
            success: true,
            message: '资源删除成功',
            data: {
                resourceId: resourceId,
                fileID: fileToDelete
            }
        };
    } catch (error) {
        console.error('[deleteResource] 删除资源失败', error);
        
        // 解析常见错误类型
        let errorMessage = '删除资源失败';
        if (error.errCode === -501007) {
            errorMessage = '文件不存在';
        } else if (error.errCode === -502009) {
            errorMessage = '记录不存在';
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