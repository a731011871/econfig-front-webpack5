import React from 'react';
import { Radio, Form, Spin, Modal, message } from 'antd';
import { i18nMessages } from 'src/i18n';
import {injectIntl} from 'react-intl';
// import { formItemLayout } from 'src/component/universalForm';
import urls from 'utils/urls';
// import { encrypt } from 'utils/utils';
import { $http } from 'utils/http';
const confirm = Modal.confirm;


@injectIntl
@Form.create()
class SystemConfig extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    state = {
        loading: false,
        adminDoubleCertification: '',
        autoJoinProject: ''
    }

    componentDidMount() {
        this.init();
    }

    init = async () => {
        try{
            const result = await $http.post(urls.findSwitchConfig, {});
            const twoFactor = result.find(item => item.switchType === 'twoFactor') || {};
            const tenants = result.find(item => item.switchType === 'tenants') || {};
            this.setState({
                adminDoubleCertification: twoFactor && twoFactor.status || '1',
                autoJoinProject: tenants && tenants.status || '0',
            });
        }catch(e) {
            message.error(e.message);
        }
    }

    onAdminDoubleCertification = (e) => {
        confirm({
            title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0202),
            content: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0399),
            cancelText: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0400),
            okText: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279),
            onOk: async () => {
                try{
                    const result = await $http.post(urls.switchConfig, {
                        switchType: 'twoFactor',
                        status: e.target.value
                    });
                    console.log(result);
                    this.setState({
                        adminDoubleCertification: e.target.value
                    });
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0219));
                }catch(e) {
                    message.error(e.message);
                }
            }
        });
    }

    onAutoJoinProject = (e) => {
        confirm({
            title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0202),
            content: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0399),
            cancelText: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0400),
            okText: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279),
            onOk: async () => {
                try{
                    const result = await $http.post(urls.switchConfig, {
                        switchType: 'tenants',
                        status: e.target.value
                    });
                    console.log(result);
                    this.setState({
                        autoJoinProject: e.target.value
                    });
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0219));
                }catch(e) {
                    message.error(e.message);
                }
            }
        });
    }

    render() {
        const { adminDoubleCertification, autoJoinProject } = this.state;
        return (
            <Spin spinning={false}>
                <Form layout="vertical" style={{margin: '12px'}}>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0386)}>
                        <Radio.Group
                            value={adminDoubleCertification}
                            onChange={this.onAdminDoubleCertification}
                        >
                            <Radio value="1">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0390)}</Radio>
                            <Radio value="0">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0391)}</Radio>
                        </Radio.Group>
                        <div className="title-tip-ccc">
                            {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0387)}
                        </div>
                    </Form.Item>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0388)}>
                        <Radio.Group
                            value={autoJoinProject}
                            onChange={this.onAutoJoinProject}
                        >
                            <Radio value="1">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0392)}</Radio>
                            <Radio value="0">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0393)}</Radio>
                        </Radio.Group>
                        <div className="title-tip-ccc">
                            {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0389)}
                        </div>
                    </Form.Item>
                </Form>
            </Spin>
        );
    }
}

export default SystemConfig;