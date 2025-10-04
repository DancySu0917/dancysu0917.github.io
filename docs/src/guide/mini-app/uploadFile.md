# uploadFile

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
 * 确保集合存在
 * @returns {Promise<void>}
 */
async function ensureCollection() {
    try {
        // 尝试获取集合信息，检查集合是否存在
        await db.collection(COLLECTION_NAME).count();
    } catch (error) {
        // 如果集合不存在，尝试创建集合
        if (error.errCode === -502005) {
            console.log(`[uploadFile] 集合 ${COLLECTION_NAME} 不存在，尝试创建...`);
            try {
                // 在云函数中，创建集合需要特殊权限和操作
                // 这里简单处理，实际项目中可能需要管理员权限
                await db.createCollection(COLLECTION_NAME);
                console.log(`[uploadFile] 集合 ${COLLECTION_NAME} 创建成功`);
            } catch (createError) {
                console.error(`[uploadFile] 创建集合 ${COLLECTION_NAME} 失败`, createError);
                // 不抛出错误，让调用者继续尝试，可能集合已存在但权限问题
            }
        }
    }
}

/**
 * 上传文件云函数
 * @param {Object} event - 事件对象
 * @param {string} event.fileID - 临时文件ID（通过uploadFile上传后获取）
 * @param {string} event.fileName - 文件名
 * @param {number} event.fileSize - 文件大小
 * @param {string} event.fileType - 文件类型
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 返回上传结果
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { fileID, fileName, fileSize = 0, fileType = '' } = event;
        
        if (!fileID || !fileName) {
            return {
                success: false,
                message: '文件ID和文件名不能为空'
            };
        }
        
        // 确保集合存在
        await ensureCollection();
        
        // 获取临时文件URL用于下载
        let tempFileURL = '';
        try {
            const { fileList } = await cloud.getTempFileURL({ fileList: [fileID] });
            if (fileList && fileList.length > 0) {
                tempFileURL = fileList[0].tempFileURL;
            }
        } catch (urlError) {
            console.warn('[uploadFile] 获取临时文件URL失败', urlError);
            // 不抛出错误，继续执行保存操作
        }
        
        // 保存文件信息到数据库
        const dbResult = await db.collection(COLLECTION_NAME).add({
            data: {
                fileID: fileID,
                name: fileName,
                size: fileSize,
                fileType: fileType || 'other',
                tempFileURL: tempFileURL,
                createTime: db.serverDate()
            }
        });
        
        // 获取保存的文档信息
        const savedDocument = await db.collection(COLLECTION_NAME).doc(dbResult._id).get();
        
        return {
            success: true,
            message: '文件上传成功',
            data: {
                fileID: fileID,
                resourceId: dbResult._id,
                resource: savedDocument.data
            }
        };
    } catch (error) {
        console.error('[uploadFile] 上传文件失败', error);
        
        // 解析常见错误类型
        let errorMessage = '文件上传失败';
        if (error.errCode === -501000) {
            errorMessage = '文件不存在或已过期';
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