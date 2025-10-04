# ensureCollection

```js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event) => {
  const { collectionName } = event || {};
  if (!collectionName || typeof collectionName !== 'string') {
    return {
      success: false,
      errCode: 400,
      message: 'collectionName 参数必填'
    };
  }

  let targetCollection = collectionName.trim();
  if (!targetCollection) {
    return {
      success: false,
      errCode: 400,
      message: 'collectionName 不能为空'
    };
  }

  try {
    await db.collection(targetCollection).limit(1).get();
    return {
      success: true,
      existed: true,
      message: '集合已存在'
    };
  } catch (error) {
    if (error && (error.errCode === -502005 || (error.errMsg || '').includes('collection not exists'))) {
      try {
        await db.createCollection(targetCollection);
        return {
          success: true,
          created: true,
          message: '集合已创建'
        };
      } catch (createError) {
        console.error('[ensureCollection] createCollection failed', createError);
        return {
          success: false,
          errCode: createError.errCode || -1,
          message: createError.errMsg || createError.message || '集合创建失败'
        };
      }
    }

    console.error('[ensureCollection] unexpected error', error);
    return {
      success: false,
      errCode: error.errCode || -1,
      message: error.errMsg || error.message || '检查集合失败'
    };
  }
};

```