# generateToken

`jsonwebtoken`


```js
const cloud = require('wx-server-sdk');
const jwt = require('jsonwebtoken');

/**
 * 初始化云开发环境
 */
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 获取JWT密钥
 * 优先从环境变量读取，环境变量不存在则使用默认值
 * 注意：在生产环境中，必须将密钥配置在环境变量中
 */
const getJWTSecret = () => {
    // 尝试从环境变量获取密钥
    const secret = process.env.JWT_SECRET || 'for-better-life';
    
    // 生产环境检查
    if (process.env.NODE_ENV === 'production' && secret === 'for-better-life') {
        console.warn('[generateToken] 警告：生产环境仍在使用默认密钥，存在安全风险！');
    }
    
    return secret;
};

/**
 * 生成Token云函数
 * @param {Object} event - 事件对象
 * @param {string} event.openid - 用户唯一标识
 * @param {string} [event.expiresIn='7d'] - Token过期时间，默认为7天
 * @param {string} [event.userInfo] - 用户附加信息
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} Token生成结果
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { openid, expiresIn = '7d', userInfo = null } = validateParams(event);
        
        // 生成token
        const token = await generateToken(openid, expiresIn, userInfo);
        
        // 记录日志并返回结果
        console.log('[generateToken] Token生成成功');
        return {
            success: true,
            token,
            message: 'Token生成成功',
            code: 200
        };
    } catch (error) {
        console.error('[generateToken] Token生成失败:', error);
        return {
            success: false,
            message: error.message || 'Token生成失败',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: error.code || 500
        };
    }
};

/**
 * 验证输入参数
 * @param {Object} event - 输入参数
 * @returns {Object} 验证后的参数
 * @throws {Error} 参数验证失败时抛出异常
 */
function validateParams(event) {
    if (!event || typeof event !== 'object') {
        throw new Error('无效的请求参数');
    }
    
    const { openid, expiresIn = '7d', userInfo } = event;
    
    // 验证openid
    if (!openid || typeof openid !== 'string' || openid.trim() === '') {
        throw new Error('缺少或无效的参数：openid');
    }
    
    // 验证expiresIn格式（可选）
    if (expiresIn && typeof expiresIn !== 'string') {
        throw new Error('无效的过期时间格式');
    }
    
    // 验证userInfo格式（可选）
    if (userInfo !== null && userInfo !== undefined && typeof userInfo !== 'object') {
        throw new Error('无效的用户信息格式');
    }
    
    return { openid, expiresIn, userInfo };
}

/**
 * 生成JWT Token
 * @param {string} openid - 用户唯一标识
 * @param {string} expiresIn - Token过期时间
 * @param {Object|null} userInfo - 用户附加信息
 * @returns {string} 生成的Token
 */
async function generateToken(openid, expiresIn, userInfo) {
    const JWT_SECRET = getJWTSecret();
    
    // 构建payload，仅包含必要信息
    const payload = {
        openid,
        iat: Math.floor(Date.now() / 1000), // 签发时间
        iss: 'mini-app', // 签发者
        sub: 'user-auth' // 主题
    };
    
    // 如果有附加用户信息，合并到payload（注意：不要包含敏感信息）
    if (userInfo && typeof userInfo === 'object') {
        // 过滤掉可能的敏感信息
        const safeUserInfo = {};
        for (const [key, value] of Object.entries(userInfo)) {
            // 只保留非敏感的基本信息
            if (!['password', 'token', 'secret'].includes(key.toLowerCase())) {
                safeUserInfo[key] = value;
            }
        }
        
        if (Object.keys(safeUserInfo).length > 0) {
            payload.userInfo = safeUserInfo;
        }
    }
    
    // 生成token，设置算法和过期时间
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn,
        algorithm: 'HS256' // 指定算法
    });
    
    // 安全日志记录（避免记录完整token）
    const tokenPreview = token.substring(0, 20) + '...[隐藏部分]...' + token.substring(token.length - 20);
    console.log(`[generateToken] Token生成成功 [${openid}]：${tokenPreview}`);
    
    return token;
};
```