import React from 'react';
import { render } from 'react-dom';
import { Modal, Button } from 'antd';

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

class TMSModal extends React.Component {

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
                    this.props.modalDom.removeNode(true);
                    if(onClose) onClose();
                } else {
                    this.props.modalDom.remove();
                    if(onClose) onClose();
                }
            }, 500);
        });
    }

    render() {
        const { visible } = this.state;
        const { title, width, antdConfig, footButton, className } = this.props;
        const Component = this.props.compontent;

        return (
            <Modal
                className={className}
                title={title}
                width={width}
                closable={true}
                destroyOnClose={true}
                onCancel={this.onClose}
                visible={visible}
                footer={footButton}
                {...antdConfig}
            >
                {
                    typeof this.props.compontent === 'function' ? <Component onClose={this.onClose} /> : Component 
                }
            </Modal>
        );
    }
}

export const SaveDom = function({buttonLoading = false, onHandleClick = null, reset = false, onReset = null}) {
    return (
        <div
            style={{
                padding: '5px 6px',
                textAlign: 'right',
            }}
        >
            {
                reset && (
                    <Button loading={buttonLoading} style={{marginRight: '10px'}} type="primary" onClick={onReset}>
                        重置
                    </Button>
                )
            }
            <Button loading={buttonLoading} type="primary" onClick={onHandleClick}>
                保存
            </Button>
        </div>
    ); 
};

export const modalFun = function({

    title = '',
    width = 720,
    compontent = null,
    antdConfig = {},
    footButton = null,
    className = ''

}) {
    const modalDom = document.createElement('div');
    document.body.appendChild(modalDom);
    render(
        <TMSModal
            className={className}
            modalDom={modalDom} 
            title={title} 
            antdConfig={antdConfig}
            width={width}
            footButton={footButton}
            compontent={compontent}
        />, modalDom
    );
};