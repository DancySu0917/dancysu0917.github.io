# modal

::: code-group
```js [modal]
const modal = (options = {}) => {
    return new Promise((resolve) => {
        // 默认参数
        const defaultOptions = {
            title: '提示',
            content: '您确认执行该操作吗？',
            confirmColor: '#f3514f'
        }

        const opts = Object.assign({}, defaultOptions, options)
        wx.showModal({
            ...opts,
            complete({
                confirm,
                cancel
            }) {
                confirm && resolve(true);
                cancel && resolve(false)
            }
        })
    })
}

wx.modal = modal;

export {
    modal
}
```
```js [app.js]
import './utils/extendApi.js'
```
```js [使用示例]
async onClick() {
    const res = await wx.modal();
    console.log(res);
}
```
:::