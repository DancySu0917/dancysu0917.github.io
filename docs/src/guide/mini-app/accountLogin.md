# accountLogin

```js
const cloud = require('wx-server-sdk');

/**
 * 初始化云开发环境
 */
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 初始化数据库连接
 */
const db = cloud.database();
const _ = db.command;

/**
 * 账号登录/注册云函数
 * @param {Object} event - 事件对象
 * @param {string} event.account - 账号
 * @param {string} event.password - 密码
 * @param {string} event.type - 操作类型，'login' 或 'register'
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} 操作结果
 */
exports.main = async (event, context) => {
    try {
        // 获取参数并验证
        const { account, password, type } = validateParams(event);
        
        // 获取微信上下文
        const wxContext = cloud.getWXContext();
        
        // 根据操作类型调用相应的处理函数
        if (type === 'register') {
            console.log('[accountLogin] 开始处理注册请求:', maskAccount(account));
            return await handleRegister(account, password, wxContext);
        } else if (type === 'login') {
            console.log('[accountLogin] 开始处理登录请求:', maskAccount(account));
            return await handleLogin(account, password, wxContext);
        } else {
            return {
                success: false,
                message: '无效的操作类型，仅支持 login 或 register',
                code: 400
            };
        }
    } catch (error) {
        // 统一处理异常
        return handleCommonError(error, '操作失败');
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
    
    const { account, password, type } = event;
    
    // 验证必要参数
    if (!account || !password || !type) {
        throw new Error('缺少必要参数：account、password、type');
    }
    
    // 验证参数类型
    if (typeof account !== 'string' || typeof password !== 'string' || typeof type !== 'string') {
        throw new Error('参数类型错误：account、password、type 必须是字符串');
    }
    
    // 验证账号和密码长度
    if (account.length < 4 || account.length > 20) {
        throw new Error('账号长度必须在4-20个字符之间');
    }
    
    if (password.length < 6 || password.length > 30) {
        throw new Error('密码长度必须在6-30个字符之间');
    }
    
    return { account, password, type };
}

/**
 * 处理注册逻辑
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @param {Object} wxContext - 微信上下文
 * @returns {Promise<Object>} 注册结果
 */
async function handleRegister(account, password, wxContext) {
    try {
        // 1. 检查账号是否已存在
        const existingUser = await checkAccountExists(account);
        if (existingUser) {
            return {
                success: false,
                message: '账号已存在',
                code: 409
            };
        }
        
        // 2. 调用密码加密云函数
        const encryptedPassword = await encryptPassword(password);
        
        // 3. 创建新用户
        const userInfo = await createUser(account, encryptedPassword, wxContext);
        
        // 4. 返回注册成功信息
        console.log('[accountLogin] 注册成功:', maskAccount(account));
        return {
            success: true,
            message: '注册成功',
            code: 200,
            data: {
                account: userInfo.account,
                nickName: userInfo.nickName
            }
        };
    } catch (error) {
        console.error('[accountLogin] 注册失败:', error);
        return handleCommonError(error, '注册失败');
    }
}

/**
 * 处理登录逻辑
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @param {Object} wxContext - 微信上下文
 * @returns {Promise<Object>} 登录结果
 */
async function handleLogin(account, password, wxContext) {
    try {
        // 1. 根据账号查询用户
        const user = await getUserByAccount(account);
        if (!user) {
            console.log('[accountLogin] 账号不存在:', maskAccount(account));
            return {
                success: false,
                message: '账号不存在',
                code: 401
            };
        }
        
        // 2. 调用密码验证云函数
        const isPasswordValid = await verifyPassword(password, user.password);
        console.log('>>>', isPasswordValid, password, user.password);
        if (!isPasswordValid) {
            console.log('[accountLogin] 密码错误:', maskAccount(account));
            return {
                success: false,
                message: '账号或密码错误',
                code: 401
            };
        }
        
        // 3. 更新登录信息
        const updatedUser = await updateUserLoginInfo(user._id, wxContext);
        
        // 4. 生成token
        const token = await generateUserToken(wxContext.OPENID, user);
        
        // 5. 返回登录成功信息
        console.log('[accountLogin] 登录成功:', maskAccount(account));
        return {
            success: true,
            message: '登录成功',
            code: 200,
            data: {
                token,
                userInfo: {
                    id: user._id,
                    account: user.account,
                    nickName: user.nickName || '微信用户',
                    avatarUrl: user.avatarUrl || '',
                    lastLoginTime: updatedUser.lastLoginTime,
                    loginCount: updatedUser.loginCount
                }
            }
        };
    } catch (error) {
        console.error('[accountLogin] 登录失败:', error);
        return handleCommonError(error, '登录失败');
    }
}

/**
 * 检查账号是否已存在
 * @param {string} account - 账号
 * @returns {Promise<boolean>} 账号是否存在
 */
async function checkAccountExists(account) {
    try {
        const result = await db.collection('users').where({
            account: account
        }).get();
        return result.data.length > 0;
    } catch (error) {
        throw new Error('账号检查失败');
    }
}

/**
 * 加密密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 加密后的密码
 */
async function encryptPassword(password) {
    try {
        const encryptResult = await cloud.callFunction({
            name: 'encryptPassword',
            data: {
                password: password,
                validatePassword: true
            }
        });
        
        if (!encryptResult.result.success) {
            throw new Error(encryptResult.result.message || '密码加密失败');
        }
        
        return encryptResult.result.hashedPassword;
    } catch (error) {
        throw new Error(error.message || '密码加密失败');
    }
}

/**
 * 创建用户
 * @param {string} account - 账号
 * @param {string} hashedPassword - 加密后的密码
 * @param {Object} wxContext - 微信上下文
 * @returns {Promise<Object>} 用户信息
 */
async function createUser(account, hashedPassword, wxContext) {
    try {
        const currentTime = new Date();
        const newUser = {
            account: account,
            password: hashedPassword,
            nickName: account, // 默认使用账号作为昵称
            avatarUrl: '',
            userType: 'account', // 标识账号类型
            createTime: currentTime,
            lastLoginTime: currentTime,
            loginCount: 1,
            openid: wxContext.OPENID,
            unionid: wxContext.UNIONID,
            status: 1 // 1: 正常, 0: 禁用
        };
        
        const result = await db.collection('users').add({
            data: newUser
        });
        
        return { ...newUser, _id: result._id };
    } catch (error) {
        throw new Error('用户创建失败');
    }
}

/**
 * 根据账号获取用户信息
 * @param {string} account - 账号
 * @returns {Promise<Object|null>} 用户信息或null
 */
async function getUserByAccount(account) {
    try {
        const result = await db.collection('users').where({
            account: account,
            status: 1 // 只查询正常状态的用户
        }).get();
        
        return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
        throw new Error('用户查询失败');
    }
}

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} 密码是否有效
 */
async function verifyPassword(password, hashedPassword) {
    try {
        // 注意：调用的是decriptPassword而不是decryptPassword
        const verifyResult = await cloud.callFunction({
            name: 'decriptPassword',
            data: {
                password: password,
                hashedPassword: hashedPassword
            }
        });
        
        return verifyResult.result.success && verifyResult.result.isMatch;
    } catch (error) {
        console.error('[accountLogin] 密码验证失败:', error);
        throw new Error('密码验证失败');
    }
}

/**
 * 更新用户登录信息
 * @param {string} userId - 用户ID
 * @param {Object} wxContext - 微信上下文
 * @returns {Promise<Object>} 更新后的用户信息
 */
async function updateUserLoginInfo(userId, wxContext) {
    try {
        const currentTime = new Date();
        await db.collection('users').doc(userId).update({
            data: {
                lastLoginTime: currentTime,
                loginCount: db.command.inc(1),
                openid: wxContext.OPENID,
                unionid: wxContext.UNIONID
            }
        });
        
        // 查询更新后的用户信息
        const updatedUser = await db.collection('users').doc(userId).get();
        return updatedUser.data;
    } catch (error) {
        throw new Error('用户信息更新失败');
    }
}

/**
 * 生成用户token
 * @param {string} openid - 用户的openid
 * @param {Object} user - 用户信息
 * @returns {Promise<string>} 生成的token
 */
async function generateUserToken(openid, user) {
    try {
        const tokenResult = await cloud.callFunction({
            name: 'generateToken',
            data: {
                openid: openid,
                userInfo: {
                    userId: user._id,
                    account: user.account,
                    userType: user.userType || 'account'
                }
            }
        });
        
        if (!tokenResult.result.success) {
            throw new Error('Token生成失败');
        }
        
        return tokenResult.result.token;
    } catch (error) {
        throw new Error('Token生成失败');
    }
}

/**
 * 统一处理异常
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {Object} 错误响应
 */
function handleCommonError(error, defaultMessage) {
    console.error(`[accountLogin] ${defaultMessage}:`, error);
    
    // 根据环境决定是否返回详细错误信息
    const errorDetail = process.env.NODE_ENV === 'development' ? {
        error: error.message,
        errorType: error.name
    } : {};
    
    // 根据错误类型设置状态码
    let statusCode = 500;
    if (error.message.includes('参数') || error.message.includes('无效')) {
        statusCode = 400;
    } else if (error.message.includes('不存在') || error.message.includes('密码错误')) {
        statusCode = 401;
    } else if (error.message.includes('已存在')) {
        statusCode = 409;
    }
    
    return {
        success: false,
        message: error.message || `${defaultMessage}，请稍后重试`,
        code: error.code || statusCode,
        ...errorDetail
    };
}

/**
 * 隐藏账号部分信息，保护隐私
 * @param {string} account - 完整账号
 * @returns {string} 部分隐藏的账号
 */
function maskAccount(account) {
    if (!account || account.length <= 3) {
        return account;
    }
    const prefix = account.substring(0, 2);
    const suffix = account.substring(account.length - 1);
    return prefix + '*'.repeat(account.length - 3) + suffix;
};
```