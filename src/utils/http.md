# tms-request

---

## 概要(使用前务必阅读最佳实践)
- [x] 基于axios二次封装，与axios的Api达到99%的相似度。 
- [x] 摒弃callback回调,拥抱Promise与async/await。
- [x] 可定制化实例，同项目多实例运行无阻碍。
- [x] token携带。
- [x] 可配置过滤空值，防缓存。
- [x] 自定义响应与请求拦截器。


## 指南

### 安装：

``` zsh
//切换到tm私有镜像
yarn add tms-request
```

### 初始化

tms-request的初始化有两种方式：

#### 1、直接引用tms-request默认导出的实例：

``` javascript

import $http from 'tms-request';

function getUsers() {
    return $http.get('/user' , {
        pageNum: 1 ,
        pageSize: 20
    });
}

```

该默认实例应用了太美业务的业务系统中的必要请求头，数据转换拦截，响应数据处理，与错误过滤等，如果项目请求接口较少，可以选择尝试这种用法。

#### 2、创建属于自己的实例，并配置相关参数：

> 配置层级分为：默认级、实例级、请求级。优先级请求级最高，实例级次之，默认级最次之。

> 也就是说，如果你什么都没配置，会全部按默认配置走，与上面的那种默认请求实例没有任何区别，但是当你在调用create方法，并传入了配置后，会对默认配置，与你传入的实例配置进行merge操作，实例级配置项会覆盖同名的默认配置项。

> 随后，在每次发起请求时，你仍有机会添加配置覆盖默认配置，甚至是实例配置。

``` javascript
import http from 'tms-request';

const $http = http.create({
    //是否要过滤Null值与Undefined 默认值为false
    filter: false ,
    //是否要添加防缓存随机数 默认为false
    cache: false ,
    //响应拦截器 加载于内置响应拦截器前 请谨慎使用 使用后请完整返回修改过后的response
    responseInterceptor: response => response ,
    //请求拦截器 加载于内置请求拦截器前 请谨慎使用 使用后请完整返回修改过后的config
    requestInterceptor: config => config ,
    //默认请求方法 默认为get 即使用$http.request的使用在不传入method时执行的请求动作
    method: 'get' ,
    //请求url前缀
    baseURL: '/ccp-web' ,
    //默认要携带的请求头
    headers: {
        'TMS-TOKEN': 'SSSSS'
    } ,
    //超时时间 默认为5秒
    timeout: 5000 ,
    //上传进度回调 建议在请求级别配置添加
    onUploadProgress: progressEvent => progressEvent ,
    //下载进度回调 建议在请求级别配置添加
    onDownloadProgress: progressEvent => progressEvent
    //还有更多配置项 请参考axios官方文档 翻阅配置api
});

function getUsers() {
    return $http.get('/user' , {
        pageNum: 1 ,
        pageSize: 20
    });
}

```


### 使用：

#### 1、get :

```javascript
//第一个参数（必选）为请求url
//第二个参数（可选）为url后附带的querystring
//第三个参数（可选）为请求级别配置 此处订制的配置会覆盖默认的配置与实例级别配置
http.get('/user' ,
    {
        pageSize: 20 ,
        pageNum: 1
    } , {
        filter: true,
        headers: {
            'Auth-Token':'qqqq'
        }
    }
);
//实际请求url为 /user?pageSise=20&pageNum=1
```

#### 2、post、put、delete:


``` javascript
//post 与 put delete 参数与使用方式尽皆一致
//第一个参数（必选）请求地址 
//第二个参数（可选）requestBody 即是要传输的data 默认为application/json格式 
//第三个参数（可选）请求级别配置 
http.post('/user' ,
    {
        username: 'ives' ,
        age: 15 ,
        girlFirend: null
    } , {
        filter: true ,
        headers: {
            'Auth-Token': 'qqqq'
        }
    }
);

http.put('/user' ,{
    id:100
});

http.delete('/user' ,{
    id:100
});

```

### 最佳实践

> 可能大家都会有一些疑虑。如何封装请求方法，在哪里调用，如何复用？常规请求写在哪里，异步action又在何处请求？错误如何处理？下面我会一点点进行最佳实践的介绍。

#### 1、如何使用：

切忌，请抛弃过去callback的写法，promise.then的写法也尽量不要去用，因为在es7的规范里，已经提供了最强大的异步处理机制-- async/await，关于这一点，如果有不了解的，可以随时百度，资料随手可得。

tms-request的请求库是基于axios进行的二次封装，也就是说，同样是基于Promsise的，我没有做出任何多余的回调形式的api。因为async/await是基于Promise的，那么也就说明，我们是天生支持async/await的，下面看代码。

```
function getUser(data = {}) {
    return http.get('/user' , data);
}


async function main() {
    const users = await getUser({pageSize: 20 , pageNum: 2});
    console.log(users);
}

main();
```

因为getUser方法返回的是一个Promise，所以在main方法里，我们用await来承载getUser返回的结果，因为await的关系，我们拿到了该Promise的resovle结果。


#### 2、错误处理

接口报错，或者服务器错误，如何拿到错误呢？正常的Promise，我们在第二个参数可以传入方法来catch,或者在then返回的对象后，加入.catch方法，await后同样允许你使用.catch方法，但我们既然已经选择了使用await,就应当有更优雅的处理方案，下面看代码。

```
function getUser(data = {}) {
    return http.get('/user' , data); //假设参数传错 接口会返回异常信息
}


async function main() {
    try {
        const users = await getUser({pageSize: 20 , pageNum: 2});
        console.log(users);
    }catch (e) {
        console.log(e.message) // '返回的异常信息'
    }
}

main();

```

这一次，在返回Promise前，即发生了错误，然后，我们在后续的try catch语句中承接了错误，如果错误产生，会执行到catch内。

在react的组件内，我们可以这样实践。

```
class SomeComponenet extends React.Component {

    state = {
        loading: false ,
        options: []
    };

    toggleLoading() {
        this.setState(prevState => ({
            loading: !prevState.loading
        }));
    }


    async fetchOptions() {
        this.toggleLoading();
        try {
            const options = await http.get('/options' , {
                optionsGroupId: 123
            });
            this.setState({
                options: options || []
            });
        } catch (e) {
            //antd的message
            message.error(e);
        } finally {
            this.toggleLoading();
        }
    }

 
    async componentDidMount() {
        await this.fetchOptions();
    }

}

```

在这里，我们演示了完整的请求错误处理，首先我们在请求前，拉起loading,如果成功，把options赋值，如果失败，则弹出错误信息。最后在finally代码块里，无论上面请求成功与否，结束loading。

#### 3、结合redux的异步action 

未完待续。。。。


