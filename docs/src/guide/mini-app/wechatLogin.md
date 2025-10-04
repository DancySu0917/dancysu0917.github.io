# wechatLogin

```js
const cloud = require("wx-server-sdk");

/**
 * 初始化云开发环境
 */
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

/**
 * 微信登录云函数
 * @param {Object} event - 事件对象，包含前端传递的数据
 * @param {Object} context - 上下文对象，包含调用信息
 * @returns {Promise<Object>} 登录结果
 */
exports.main = async (event, context) => {
    try {
        // 获取微信用户的openid和unionid
        const {
            OPENID,
            UNIONID
        } = cloud.getWXContext();

        // 验证必要的用户信息
        if (!OPENID) {
            console.error('[wechatLogin] 无效的用户身份信息');
            return {
                success: false,
                message: '无效的用户身份信息',
                code: 401
            };
        }

        // 处理用户登录逻辑
        await handleUserLogin(OPENID, UNIONID);

        // 生成并返回token
        return await generateAndReturnToken(OPENID);

    } catch (error) {
        console.error('[wechatLogin] 微信登录云函数执行失败:', error);
        return {
            success: false,
            message: '服务器内部错误',
            error: process.env.NODE_ENV === 'development' ? error.message : '系统错误',
            code: 500
        };
    }
};

/**
 * 处理用户登录逻辑
 * @param {string} openid - 微信用户唯一标识
 * @param {string} unionid - 微信开放平台唯一标识
 * @returns {Promise<void>}
 */
async function handleUserLogin(openid, unionid) {
    try {
        // 查询用户是否已存在
        const userQuery = await db.collection('users').where({
            openid: openid
        }).get();

        const currentTime = new Date();

        // 用户不存在，创建新用户
        if (userQuery.data.length === 0) {
            await createNewUser(openid, unionid || '', currentTime);
        } else {
            // 用户存在，更新登录信息
            const existingUser = userQuery.data[0];
            await updateUserLoginInfo(existingUser._id, currentTime);
        }
    } catch (error) {
        console.error('[wechatLogin] 处理用户登录信息失败:', error);
        throw error;
    }
}

/**
 * 创建新用户
 * @param {string} openid - 微信用户唯一标识
 * @param {string} unionid - 微信开放平台唯一标识
 * @param {Date} currentTime - 当前时间
 * @returns {Promise<void>}
 */
async function createNewUser(openid, unionid, currentTime) {
    const newUser = {
        openid: openid,
        unionid: unionid,
        nickName: '微信用户',
        avatarUrl: '',
        account: '',
        password: '',
        createTime: currentTime,
        lastLoginTime: currentTime,
        loginCount: 1,
        userType: 'wechat' // 标记用户类型为微信登录
    };

    await db.collection('users').add({
        data: newUser
    });

    console.log('[wechatLogin] 新用户创建成功:', openid);
}

/**
 * 更新用户登录信息
 * @param {string} userId - 用户ID
 * @param {Date} currentTime - 当前时间
 * @returns {Promise<void>}
 */
async function updateUserLoginInfo(userId, currentTime) {
    await db.collection('users').doc(userId).update({
        data: {
            lastLoginTime: currentTime,
            loginCount: _.inc(1) // 登录次数加1
        }
    });

    console.log('[wechatLogin] 用户登录信息更新成功:', userId);
}

/**
 * 生成并返回token
 * @param {string} openid - 微信用户唯一标识
 * @returns {Promise<Object>} 包含token的返回结果
 */
async function generateAndReturnToken(openid) {
    try {
        // 调用generateToken云函数生成token
        const tokenResult = await cloud.callFunction({
            name: 'generateToken',
            data: {
                openid: openid,
                expiresIn: '7d' // 7天过期
            }
        });

        if (!tokenResult.result || !tokenResult.result.success) {
            console.error('[wechatLogin] Token生成失败:', tokenResult.result);
            return {
                success: false,
                message: 'Token生成失败',
                code: 500
            };
        }

        console.log('[wechatLogin] 微信登录成功，Token生成成功:', openid);
        return {
            success: true,
            data: {
                token: tokenResult.result.token
            },
            message: '微信登录成功',
            code: 200
        };
    } catch (error) {
        console.error('[wechatLogin] 调用generateToken云函数失败:', error);
        throw error;
    }
};
```