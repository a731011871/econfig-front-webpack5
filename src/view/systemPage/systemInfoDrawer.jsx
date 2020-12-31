import React from 'react';
import { Menu, Row, Col, message } from 'antd';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ModuleView from './moduleView';
import { LoadingHoc } from '../../component/LoadingHoc';
import {injectIntl} from 'react-intl';
import { i18nMessages } from 'src/i18n';
import urls from '../../utils/urls';
import { $http } from '../../utils/http';

const TitleSpan = styled.span`
    display: inline-block;
    width: 5em;
    margin-right: 3px;
`;
@LoadingHoc
@injectIntl
class SystemInfoDrawer extends React.Component {
    static propTypes = {
        systemInfo: PropTypes.object,
        hideDrawer: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            showSystemOptions: false, // 显示系统选择
            hasError: false, //邮箱错误信息
            current: 'info',
            moduleTreeDate: [] // 模块信息
        };
    }

    componentDidMount = async () => {
        this.props.toggleLoading();
        try {
            const moduleTreeDate = await $http.get(
                `${urls.getSystemModelTree}/${this.props.systemInfo.softCode}/menuList`
            );
            console.log(moduleTreeDate);
            this.setState({ moduleTreeDate:moduleTreeDate || [] });
        } catch (e) {
            message.error(e.message);
        }
        this.props.toggleLoading();
    };

    handleClick = e => {
        console.log('click ', e);
        this.setState({
            current: e.key
        });
    };

    render() {
        const { systemInfo } = this.props;
        return (
            <div className="systemInfoDrawer">
                <Menu
                    onClick={this.handleClick}
                    selectedKeys={[this.state.current]}
                    mode="horizontal"
                >
                    <Menu.Item key="info">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0178)}</Menu.Item>
                    <Menu.Item key="module">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0179)}</Menu.Item>
                </Menu>
                <div className="content">
                    {this.state.current === 'info' ? (
                        <div className="infoContent pAll25 pLeft45 pRight45">
                            <Row className="mBottom10">
                                <Col span={11}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0180)} :</TitleSpan>
                                    <span>{systemInfo.softCode}</span>
                                </Col>
                                <Col span={11} offset={2}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0181)} :</TitleSpan>
                                    <span>{systemInfo.softName}</span>
                                </Col>
                            </Row>
                            <Row className="mBottom10">
                                <Col span={11}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0182)} :</TitleSpan>
                                    <span>{systemInfo.softVersion}</span>
                                </Col>
                                <Col span={11} offset={2}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0183)} :</TitleSpan>
                                    <span>{systemInfo.modelName}</span>
                                </Col>
                            </Row>
                            <Row className="mBottom10">
                                <Col span={11}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0184)} :</TitleSpan>
                                    <span>{systemInfo.productName}</span>
                                </Col>
                                <Col span={11} offset={2}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0185)} :</TitleSpan>
                                    <span>
                                        {systemInfo.expired === '0'
                                            ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0591)
                                            : this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0590)}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="mBottom10">
                                <Col span={11}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0012)} :</TitleSpan>
                                    <span>
                                        {`${systemInfo.startDate ||
                                            ''} - ${systemInfo.endDate || ''}`}
                                    </span>
                                </Col>
                                <Col span={11} offset={2}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0186)} :</TitleSpan>
                                    <span>{systemInfo.maxProject}</span>
                                </Col>
                            </Row>
                            <Row className="mBottom10">
                                <Col span={11}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0187)} :</TitleSpan>
                                    <span>{systemInfo.maxSite}</span>
                                </Col>
                                <Col span={11} offset={2}>
                                    <TitleSpan>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0188)} :</TitleSpan>
                                    <span>{systemInfo.maxUser}</span>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <div className="moduleContent pAll25 pLeft30 pRight30">
                            <ModuleView moduleTreeDate={this.state.moduleTreeDate}/>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default SystemInfoDrawer;
