# request


::: code-group
```js [request]
export default class WxRequest {

    // 定义实例属性
    defaults = {
        baseUrl: '',
        url: '',
        data: null,
        method: 'GET',
        header: {
            'Content-type': "application/json"
        },
        timeout: 60000,
        isLoading: true
    }

    // 定义拦截器对象
    interceptors = {
        // 请求拦截器：在请求之前，对请求参数进行新增或修改
        request: (config) => config,
        // 响应拦截器：在服务器响应数据以后，对服务器响应的数据进行逻辑处理
        response: (response) => response
    }

    // 请求队列
    queue = [];

    constructor(params = {}) {
        this.defaults = Object.assign({}, this.defaults, params);
    }

    request(options) {
        this.timeId && clearTimeout(this.timeId);
        options.url = this.defaults.baseUrl + options.url;
        options = {
            ...this.defaults,
            ...options
        };
        if (options.isLoading && options.method !== 'UPLOAD') {
            // 在请求发送之前添加loading效果
            this.queue.length === 0 && wx.showLoading();
            // 每个标识代表一个请求
            this.queue.push('request');
        }
        // 在请求发送之前调用请求拦截器
        options = this.interceptors.request(options);
        console.log('>>>options', options);
        return new Promise((resolve, reject) => {
            if (options.method === 'UPLOAD') {
                wx.uploadFile({
                    ...options,
                    success: (res) => {
                        res.data = JSON.parse(res.data);
                        const mergeRes = Object.assign({}, res, {
                            config: options,
                            isSuccess: true
                        });
                        resolve(this.interceptors.response(mergeRes));
                    },
                    fail: (err) => {
                        const mergeErr = Object.assign({}, err, {
                            config: options,
                            isSuccess: false
                        });
                        resolve(this.interceptors.response(mergeErr));
                    }
                })
            } else {
                wx.request({
                    ...options,
                    success: (res) => {
                        // 响应拦截器
                        const mergeRes = Object.assign({}, res, {
                            config: options,
                            isSuccess: true
                        });
                        resolve(this.interceptors.response(mergeRes));
                    },
                    fail: (err) => {
                        // 响应拦截器
                        const mergeErr = Object.assign({}, err, {
                            config: options,
                            isSuccess: false
                        });
                        reject(this.interceptors.response(mergeErr));
                    },
                    complete: () => {
                        if (options.isLoading) {
                            this.queue.pop();

                            // 解决loading闪烁问题
                            this.queue.length === 0 && this.queue.push('request');
                            this.timeId = setTimeout(() => {
                                this.queue.pop();
                                this.queue.length === 0 && wx.hideLoading();
                                clearTimeout(this.timeId);
                            }, 1)
                        }
                    }
                })
            }
        })
    }

    get(url, data = {}, config = {}) {
        return this.request(Object.assign({
                url,
                data,
                method: 'GET'
            },
            config))
    }

    post(url, data = {}, config = {}) {
        return this.request(Object.assign({
                url,
                data,
                method: 'POST'
            },
            config))
    }

    delete(url, data = {}, config = {}) {
        return this.request(Object.assign({
                url,
                data,
                method: 'DELETE'
            },
            config))
    }

    put(url, data = {}, config = {}) {
        return this.request(Object.assign({
                url,
                data,
                method: 'PUT'
            },
            config))
    }

    // 并发请求
    all(...promise) {
        return Promise.all(promise);
    }

    // 对 wx.uploadFile 方法的封装
    upload(url, filePath, name, config = {}) {
        return this.request(Object.assign({
            url,
            filePath,
            name,
            method: 'UPLOAD'
        }, config))
    }
}
```
```js [http]
import WxRequest from './request'
import {
    getStorage,
    clearStorage
} from './storage.js';
import {
    toast,
    modal
} from './extendApi.js';

const instance = new WxRequest({
    baseUrl: 'https://dog.ceo',
    timeout: 15000,
    isLoading: false
})

// 配置请求拦截器
instance.interceptors.request = (config) => {
    // 在请求发送之前做点什么...
    const token = getStorage('token');
    if (token) {
        config.header['token'] = token;
    }
    return config;
}

// 配置响应拦截器
instance.interceptors.response = async (response) => {
    // 对服务器响应数据做点什么...
    const {
        isSuccess,
        data
    } = response;
    if (!isSuccess) {
        toast({
            title: '网络异常请重试',
            icon: 'error'
        })
        return response;
    }

    switch (data.code) {
        case 200:
            return data;
        case 208:
            const res = await modal({
                title: '鉴权失败，请重新登录',
                showCancel: false
            })

            if (res) {
                clearStorage();
                wx.navigateTo({
                    url: '/pages/login/login',
                })
            };
            return Promise.reject(response);
        default:
            toast({
                title: '程序出现异常，请联系客服或稍后重试'
            });
            return Promise.reject(response);
    }
}

export default instance
```

```js [api]
import http from '../utils/http'

export default function getDogImage() {
    return http.get('/api/breeds/image/random')
}
```
:::