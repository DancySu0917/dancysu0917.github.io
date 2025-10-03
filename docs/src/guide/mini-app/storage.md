# storage

::: code-group

```js [同步存储]
export const setStorage = (key, value) => {
    try {
        wx.setStorageSync(key, value);
    } catch (error) {
        console.error(`存储指定 ${key} 时发生了异常`, error)
    }
}

export const getStorage = (key) => {
    try {
        const value = wx.getStorageSync(key)
        if (value) {
            return value
        }
    } catch (error) {
        console.error(`读取指定 ${key} 时发生了异常`, error)
    }
}

export const removeStorage = (key) => {
    try {
        wx.removeStorageSync(key)
    } catch (error) {
        console.error(`移除指定 ${key} 时发生了异常`, error)
    }
}


export const clearStorage = () => {
    try {
        wx.clearStorageSync()
    } catch (error) {
        console.error('清空本地数据时发生了异常', error)
    } 
}
```
```js [异步存储]
export const setStorageAsync = (key, data) => {
    return new Promise((resolve) => {
        wx.setStorage({
            key,
            data,
            complete(res) {
                resolve(res)
            }
        })
    })
}

export const getStorageAsync = (key) => {
    return new Promise((resolve) => {
        wx.getStorage({
            key,
            complete(res) {
                resolve(res)
            }
        })
    })
}

export const removeStorageAsync = (key) => {
    return new Promise((resolve) => {
        wx.removeStorage({
            key,
            complete(res) {
                resolve(res)
            }
        })
    })
}

export const clearStorageAsync = () => {
    return new Promise((resolve) => {
        wx.clearStorage({
            complete(res) {
                resolve(res)
            }
        })
    })
}
```
:::