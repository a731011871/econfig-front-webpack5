import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { render } from 'react-dom';
import { Button, message } from 'antd';
import { Preview } from '@tms/login-preview';
import ModalWrapper from 'src/component/modal/modal.container.jsx';
import { drawerFun } from 'component/drawer';
import CustomLogoForm from './customLogoForm';
import CustomBannerForm from './customBannerForm';
import CustomTitleForm from './customTitleForm';
import CustomLinkForm from './customLinkForm';
import { i18nMessages } from 'src/i18n';
import { isIE, isIE11 } from 'src/utils/utils';

class LoginPreview extends React.Component {
    state = {
        // 自定义元素颜色，图片
        customDatas: this.props.previewProps || {},
        // 是否可编辑
        editable: this.props.previewProps.isPreview === 'edit',
        // 是否显示URL
        showUrl: true,
        buttonLoading: false
    };

    onPolymerization = result => {
        const customDatas = Object.assign({}, this.state.customDatas, result);
        this.setState({ customDatas });
    };

    onClose = () => {
        if (isIE() || isIE11()) {
            this.props.modalDom.removeNode(true);
        } else {
            this.props.modalDom.remove();
        }
    };

    // header 修改
    onCustomLogo = () => {
        const { previewProps = {} } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0443
            ),
            width: 500,
            compontent: props => (
                <CustomLogoForm
                    originCustomDatas={previewProps}
                    customDatas={this.state.customDatas}
                    onPolymerization={this.onPolymerization}
                    intl={this.props.intl}
                    {...props}
                />
            )
        });
    };

    // banner修改
    onCustomBanner = () => {
        const { previewProps = {} } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0444
            ),
            width: 500,
            compontent: props => (
                <CustomBannerForm
                    originCustomDatas={previewProps}
                    customDatas={this.state.customDatas}
                    onPolymerization={this.onPolymerization}
                    intl={this.props.intl}
                    {...props}
                />
            )
        });
    };

    // APP名称修改
    onCustomAppName = () => {
        const { previewProps = {} } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0445
            ),
            width: 500,
            compontent: props => (
                <CustomTitleForm
                    originCustomDatas={previewProps}
                    customDatas={this.state.customDatas}
                    onPolymerization={this.onPolymerization}
                    intl={this.props.intl}
                    {...props}
                />
            )
        });
    };

    // link修改
    onCustomLink = () => {
        const { previewProps = {} } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0446
            ),
            width: 500,
            compontent: props => (
                <CustomLinkForm
                    originCustomDatas={previewProps}
                    customDatas={this.state.customDatas}
                    onPolymerization={this.onPolymerization}
                    intl={this.props.intl}
                    {...props}
                />
            )
        });
    };

    onSubmit = async () => {
        const { customDatas } = this.state;
        const { previewProps } = this.props;
        delete customDatas.intl;
        delete customDatas.onClose;
        const params = {
            ...customDatas,
            status: '0',
            appNameDiy: customDatas.appName
        };
        delete params.url;
        delete params.appName;
        try {
            this.setState({ buttonLoading: true });
            await $http.post(`${urls.editLoginPageConfig}`, params);
            this.onClose();
            previewProps.getDatas();
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0331)
            );
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({ buttonLoading: false });
        }
    };

    render() {
        const { previewProps = {} } = this.props;
        const { editable, showUrl, buttonLoading } = this.state;
        const customDatas = Object.assign(
            {},
            previewProps,
            this.state.customDatas
        );
        return (
            <ModalWrapper
                display={true}
                customButtons={
                    <div>
                        {this.props.previewProps.isPreview === 'edit' && (
                            <React.Fragment>
                                <Button
                                    onClick={() =>
                                        this.setState({ editable: !editable })
                                    }
                                >
                                    {editable
                                        ? this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0435
                                          )
                                        : this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0098
                                          )}
                                </Button>
                                <Button
                                    type="primary"
                                    loading={buttonLoading}
                                    onClick={this.onSubmit}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0279
                                    )}
                                </Button>
                            </React.Fragment>
                        )}
                        <Button onClick={this.onClose}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0413
                            )}
                        </Button>
                    </div>
                }
            >
                <div
                    style={{
                        transition: '0.3s',
                        height: `calc(100% - 50px)`,
                        background: '#f9f9f9',
                        padding: '10px'
                    }}
                >
                    <Preview
                        showUrl={showUrl}
                        editable={editable}
                        onCustomLogo={this.onCustomLogo}
                        onCustomBanner={this.onCustomBanner}
                        onCustomAppName={this.onCustomAppName}
                        onCustomLink={this.onCustomLink}
                        customDatas={customDatas}
                        isPreview={true}
                    />
                </div>
            </ModalWrapper>
        );
    }
}

export const previewFun = function(props) {
    const modalDom = document.createElement('div');
    document.body.appendChild(modalDom);
    render(
        <LoginPreview
            modalDom={modalDom}
            previewProps={props}
            intl={props.intl}
        />,
        modalDom
    );
};

export default LoginPreview;
