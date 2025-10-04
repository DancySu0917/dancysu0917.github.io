# decriptPassword

`bcryptjs`

```js
const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');

/**
 * 初始化云开发环境
 */
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 密码验证云函数
 * @param {Object} event - 事件对象
 * @param {string} event.password - 明文密码
 * @param {string} event.hashedPassword - 哈希密码
 * @param {boolean} [event.validateInputs=true] - 是否验证输入格式，默认为true
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 验证结果
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { password, hashedPassword, validateInputs = true } = validateParams(event);
        
        // 可选的输入格式验证
        if (validateInputs) {
            validateInputFormats(password, hashedPassword);
        }
        
        // 验证密码是否匹配
        const isMatch = await verifyPassword(password, hashedPassword);
        
        // 记录日志并返回结果
        const resultMessage = isMatch ? '密码验证成功' : '密码验证失败';
        console.log(`[decriptPassword] ${resultMessage}`);
        
        return {
            success: true,
            isMatch,
            message: resultMessage,
            code: isMatch ? 200 : 401
        };
    } catch (error) {
        // 处理验证错误
        const errorResult = handleVerificationError(error);
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
    
    const { password, hashedPassword, validateInputs = true } = event;
    
    // 验证必要参数
    if (!password || !hashedPassword) {
        throw new Error('缺少必要参数：password 和 hashedPassword');
    }
    
    // 验证validateInputs参数类型
    if (typeof validateInputs !== 'boolean') {
        throw new Error('无效的参数类型：validateInputs必须是布尔值');
    }
    
    return { password, hashedPassword, validateInputs };
}

/**
 * 验证输入格式
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 哈希密码
 * @throws {Error} 输入格式不满足要求时抛出异常
 */
function validateInputFormats(password, hashedPassword) {
    // 验证password类型
    if (typeof password !== 'string') {
        throw new Error('无效的参数类型：password必须是字符串');
    }
    
    // 验证hashedPassword类型和格式（bcrypt哈希格式检查）
    if (typeof hashedPassword !== 'string' || !hashedPassword.startsWith('$2')) {
        throw new Error('无效的哈希密码格式');
    }
    
    // 验证哈希密码长度（bcrypt哈希密码长度固定为60）
    if (hashedPassword.length !== 60) {
        console.warn('[decriptPassword] 警告：哈希密码长度不是标准的60个字符');
    }
}

/**
 * 验证密码是否匹配
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 哈希密码
 * @returns {Promise<boolean>} 密码是否匹配
 */
async function verifyPassword(password, hashedPassword) {
    try {
        // 安全检查：确保不会记录明文密码
        const passwordPreview = password.substring(0, 2) + '...[隐藏部分]...' + password.substring(password.length - 2);
        console.log(`[decriptPassword] 开始验证密码：${passwordPreview}`);
        
        // 使用bcrypt比较密码
        const isMatch = await bcrypt.compare(password, hashedPassword);
        
        // 清理变量，减少内存中明文密码的留存时间
        password = null;
        
        return isMatch;
    } catch (error) {
        console.error('[decriptPassword] 密码验证过程中发生错误:', error);
        throw new Error('密码验证过程失败');
    }
}

/**
 * 处理验证错误
 * @param {Error} error - 错误对象
 * @returns {Object} 错误响应对象
 */
function handleVerificationError(error) {
    console.error('[decriptPassword] 密码验证失败:', error);
    
    // 根据环境决定是否返回详细错误信息
    const errorDetail = process.env.NODE_ENV === 'development' ? {
        error: error.message,
        errorType: error.name
    } : {};
    
    // 根据错误类型设置不同的状态码
    let statusCode = 500;
    if (error.message.includes('无效的参数') || error.message.includes('无效的哈希密码格式')) {
        statusCode = 400;
    } else if (error.message.includes('验证过程失败')) {
        statusCode = 503;
    }
    
    return {
        success: false,
        message: error.message || '密码验证过程出错',
        code: error.code || statusCode,
        ...errorDetail
    };
};
```