# toast

::: code-group
```js [toast]
const toast = ({
    title = "数据加载中...",
    icon = 'none',
    duration = 2000,
    mask = true
} = {}) => {
    wx.showToast({
        // 提示的内容
        title,
        // 图标，success（成功）、error（失败）、loading（加载）、none（不显示）
        icon,
        // 提示的延迟时间
        duration,
        // 是否显示透明蒙层，防止触摸穿透
        mask,
    });
}

wx.toast = toast;

export {
    toast
}
```
```js [app.js]
import './utils/extendApi.js'
```
```js [使用示例]
async onClick() {
    wx.toast();
}
```
:::