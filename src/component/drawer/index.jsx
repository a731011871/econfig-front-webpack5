import React from 'react';
import { render } from 'react-dom';
import { Drawer, Button, ConfigProvider } from 'antd';
import { i18nMessages } from 'src/i18n';
import zh_CN from 'antd/es/locale/zh_CN';

/**
 * 判断是否是IE
 * @returns boolean
 */
function isIE() {
    if (!!window.ActiveXobject || 'ActiveXObject' in window) {
        return true;
    } else {
        return false;
    }
}
/**
 * 判断是否是IE11
 * @returns boolean
 */
function isIE11(){
    if((/Trident\/7\./).test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

class TMSDrawer extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        visible: true,
    }

    onClose = () => {
        const { antdConfig: { onClose = null } } = this.props;
        this.setState({
            visible: false,
        }, () => {
            setTimeout(() => {
                if (isIE() || isIE11()) {
                    this.props.drawerDom.removeNode(true);
                    if(onClose) onClose();
                } else {
                    this.props.drawerDom.remove();
                    if(onClose) onClose();
                }
            }, 500);
        });
    }

    render() {
        const { visible } = this.state;
        const { title, placement, width, antdConfig, drawerDom } = this.props;
        const Component = this.props.compontent;

        return (
            
            <Drawer
                title={title}
                width={width}
                closable={true}
                destroyOnClose={true}
                placement={placement}
                onClose={this.onClose}
                visible={visible}
                getContainer={drawerDom}
                {...antdConfig}
            >
                <ConfigProvider locale={zh_CN}>
                    {
                        typeof this.props.compontent === 'function' ? <Component onClose={this.onClose} /> : Component 
                    }
                </ConfigProvider>
            </Drawer>
        );
    }
}

export const SaveDom = function({buttonLoading = false, onHandleClick = null, intl = {}}) {
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
            }}
        >
            <Button loading={buttonLoading} className="econfig_button" onClick={onHandleClick}>
                {
                    JSON.stringify(intl) === '{}' ? '保存' : intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)
                }
            </Button>
        </div>
    ); 
};

export const SaveAndCancelDom = function(
    {
        buttonLoading = false, 
        onHandleClick = null, 
        cancelLoading = false, 
        onCancelClick = null ,
        intl = {}
    }) 
{
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
            }}
        >
            <Button loading={cancelLoading} className="econfig_cancel_button" onClick={onCancelClick}>
                {
                    JSON.stringify(intl) === '{}' ? '重置' : intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0018)
                }
            </Button>
            <Button loading={buttonLoading} className="econfig_button" onClick={onHandleClick}>
                {
                    JSON.stringify(intl) === '{}' ? '保存' : intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)
                }
            </Button>
        </div>
    ); 
};

export const drawerFun = function({

    title = '',
    width = 720,
    compontent = null,
    placement = 'right',
    antdConfig = {},

}) {
    const drawerDom = document.createElement('div');
    document.body.appendChild(drawerDom);
    render(
        <TMSDrawer 
            drawerDom={drawerDom} 
            title={title} 
            antdConfig={antdConfig}
            width={width}
            placement={placement}
            compontent={compontent}
        />, drawerDom
    );
};