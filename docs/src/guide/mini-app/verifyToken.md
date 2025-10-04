# verifyToken

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
        console.warn('[verifyToken] 警告：生产环境仍在使用默认密钥，存在安全风险！');
    }
    
    return secret;
};

/**
 * 验证Token云函数
 * @param {Object} event - 事件对象
 * @param {string} event.token - 需要验证的JWT Token
 * @param {boolean} [event.returnFullPayload=false] - 是否返回完整的Token载荷
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 验证结果
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { token, returnFullPayload = false } = validateParams(event);
        
        // 获取JWT密钥
        const JWT_SECRET = getJWTSecret();
        
        // 验证token
        const decoded = verifyToken(token, JWT_SECRET);
        
        // 构建返回结果
        const result = {
            success: true,
            message: 'Token验证成功',
            code: 200,
            data: {
                openid: decoded.openid,
                // 返回部分必要信息
                exp: decoded.exp,
                iat: decoded.iat
            }
        };
        
        // 如果需要返回完整载荷
        if (returnFullPayload) {
            result.data.fullPayload = decoded;
        }
        
        // 安全日志记录
        console.log(`[verifyToken] Token验证成功 [${decoded.openid}]`);
        
        return result;
    } catch (error) {
        // 处理验证错误
        const errorResult = handleTokenError(error);
        return errorResult;
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
    
    const { token, returnFullPayload = false } = event;
    
    // 验证token
    if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('缺少或无效的参数：token');
    }
    
    return { token, returnFullPayload };
}

/**
 * 验证JWT Token
 * @param {string} token - 需要验证的Token
 * @param {string} secret - JWT密钥
 * @returns {Object} 解码后的Token信息
 * @throws {Error} Token验证失败时抛出异常
 */
function verifyToken(token, secret) {
    try {
        // 验证并解码token，指定算法提高安全性
        const decoded = jwt.verify(token, secret, {
            algorithms: ['HS256'] // 只接受HS256算法生成的token
        });
        
        // 验证token中的必要字段
        if (!decoded.openid) {
            throw new Error('Token中缺少必要的openid字段');
        }
        
        return decoded;
    } catch (error) {
        // 重新抛出错误，保持原始错误类型
        throw error;
    }
}

/**
 * 处理Token验证错误
 * @param {Error} error - 错误对象
 * @returns {Object} 错误响应对象
 */
function handleTokenError(error) {
    console.error('[verifyToken] Token验证失败:', error);
    
    let message = 'Token验证失败';
    let errorCode = 401;
    
    // 根据不同错误类型提供具体信息
    switch (error.name) {
        case 'TokenExpiredError':
            message = 'Token已过期';
            errorCode = 401;
            break;
        case 'JsonWebTokenError':
            message = 'Token格式错误或已被篡改';
            errorCode = 401;
            break;
        case 'NotBeforeError':
            message = 'Token尚未生效';
            errorCode = 401;
            break;
        default:
            message = error.message || message;
            errorCode = 401;
    }
    
    // 根据环境决定是否返回详细错误信息
    const errorDetail = process.env.NODE_ENV === 'development' ? {
        error: error.message,
        errorType: error.name
    } : {};
    
    return {
        success: false,
        message,
        code: errorCode,
        ...errorDetail
    };
};
```