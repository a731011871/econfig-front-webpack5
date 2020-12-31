import React, { Component } from 'react';

class Index extends Component {
    render() {
        return (
            <div className="econfig-home">
                <div className="home-left">
                    <div className="home-econfig">
                        <h3>eConfig系统简介</h3>
                        <div className="desc">
                        eConfig系统是面向企业用户提供包括企业信息及所购应用系统的查看与维护、试验项目信息维护、用户信息维护 、用户应用授权配置及其它相关公共信息设置的客户自助服务系统。
                        </div>
                    </div>
                    <div className="home-problem">
                        <div className="problem">
                            <div className="t1">反馈系统问题</div>
                            <div className="t2">查看问题回复</div>
                        </div>
                        <div className="problem-desc">
                        您点击“反馈系统问题”可以将本系统的问题或疑问上传给太美客服人员，由太美客服人员统一分析处理问题及回复问题。您也可以针对本系统提出相关建议与意见，我们会积极考虑并给出回复。您可以点击“查看问题回复”来查看问题答复情况，可以根据情况取消和关闭问题。
                        </div>
                    </div>
                </div>
                <div className="home-right">
                    <div className="current-version">
                        当前版本: V4.18
                    </div>
                    <div className="version-list">
                        <ul>
                            <li>
                                <div>
                                    <a>用户手册</a>
                                    <span>2019.3.18</span>
                                </div>
                                <div className="v-desc">
                                本系统主要实现项目、用户及授权管理
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default Index;