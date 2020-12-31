import React, { Component } from 'react';
import { message } from 'antd';
import WpsJsSdk from '@tms/fs-wpssdk';
import { getQueryString } from 'utils/urls';

export default class PdfViewPage extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        try {
            const fileId = getQueryString('fileId', window.location.href);
            // window.__env__.fsInfo.requestHost = 'http://localhost:9080';
            // window.__env__.ethunderInfo = {
            //     requestHost: 'http://localhost:9080'
            // };

            WpsJsSdk({
                container: document.getElementById('config-pdfPreview'), // wps页面的显示容器
                // token: getCookie('token'), // 当前用户登录的token
                fileId, // 文件id
                usePdfJs: true //显示pdf文件时，使用pdfjs开源项目显示，而不是wps
            }).then(ins => {
                /**
                 * @description 设置用于显示wps窗口的大小
                 * @description 这里的ins还有更多的操作，详情可以查看https://wwo.wps.cn/docs-js-sdk/#/README
                 * @description 当usePdfJs为true时，ins只有iframe一个元素，无法使用wps的其他api，在使用的时候要注意
                 */
                if (ins) {
                    ins.iframe.style.width = '100vw';
                    ins.iframe.style.height = '100vh';
                }
            });
        } catch (error) {
            message.error(error.message);
        }
    }

    render() {
        return (
            <div
                id="config-pdfPreview"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999
                }}
            />
        );
    }
}
