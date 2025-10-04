# encryptPassword
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
 * 密码加密云函数
 * @param {Object} event - 事件对象
 * @param {string} event.password - 需要加密的明文密码
 * @param {number} [event.saltRounds=10] - 加密轮数，默认为10
 * @param {boolean} [event.validatePassword=true] - 是否验证密码强度，默认为true
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 加密结果
 */
exports.main = async (event, context) => {
    try {
        // 解构并验证参数
        const { password, saltRounds = 10, validatePassword = true } = validateParams(event);
        
        // 验证密码强度
        // if (validatePassword) {
        //     validatePasswordStrength(password);
        // }
        
        // 加密密码
        const hashedPassword = await encryptPassword(password, saltRounds);
        
        // 记录日志并返回结果
        console.log('[encryptPassword] 密码加密成功');
        return {
            success: true,
            hashedPassword,
            message: '密码加密成功',
            code: 200
        };
    } catch (error) {
        // 处理加密错误
        const errorResult = handleEncryptionError(error);
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
    
    const { password, saltRounds = 10, validatePassword = true } = event;
    
    // 验证password
    if (!password || typeof password !== 'string') {
        throw new Error('缺少或无效的参数：password');
    }
    
    // 验证saltRounds
    if (typeof saltRounds !== 'number' || saltRounds < 4 || saltRounds > 31) {
        // 确保盐值轮数在安全范围内
        throw new Error('无效的盐值轮数：必须是4-31之间的数字');
    }
    
    // 验证validatePassword
    if (typeof validatePassword !== 'boolean') {
        throw new Error('无效的参数类型：validatePassword必须是布尔值');
    }
    
    return { password, saltRounds, validatePassword };
}

/**
 * 验证密码强度
 * @param {string} password - 需要验证的密码
 * @throws {Error} 密码强度不满足要求时抛出异常
 */
function validatePasswordStrength(password) {
    // 密码长度检查（至少8位）
    if (password.length < 8) {
        throw new Error('密码强度不足：长度至少为8位');
    }
    
    // 密码复杂度检查（至少包含字母和数字）
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
        throw new Error('密码强度不足：必须包含字母和数字');
    }
    
    // 可选：更严格的密码策略
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    // if (!hasSpecialChar) {
    //     throw new Error('密码强度不足：必须包含特殊字符');
    // }
}

/**
 * 加密密码
 * @param {string} password - 明文密码
 * @param {number} saltRounds - 盐值轮数
 * @returns {Promise<string>} 加密后的密码
 */
async function encryptPassword(password, saltRounds) {
    try {
        // 安全检查：确保不会记录明文密码
        const passwordPreview = password.substring(0, 2) + '...[隐藏部分]...' + password.substring(password.length - 2);
        console.log(`[encryptPassword] 开始加密密码：${passwordPreview}`);
        
        // 生成盐值
        const salt = await bcrypt.genSalt(saltRounds);
        
        // 使用盐值加密密码
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 清理变量，减少内存中明文密码的留存时间
        password = null;
        
        return hashedPassword;
    } catch (error) {
        console.error('[encryptPassword] 密码加密过程中发生错误:', error);
        throw new Error('密码加密过程失败');
    }
}

/**
 * 处理加密错误
 * @param {Error} error - 错误对象
 * @returns {Object} 错误响应对象
 */
function handleEncryptionError(error) {
    console.error('[encryptPassword] 密码加密失败:', error);
    
    // 根据环境决定是否返回详细错误信息
    const errorDetail = process.env.NODE_ENV === 'development' ? {
        error: error.message,
        errorType: error.name
    } : {};
    
    return {
        success: false,
        message: error.message || '密码加密失败',
        code: error.code || 500,
        ...errorDetail
    };
};
```