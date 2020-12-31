import React from 'react';
import PropTypes from 'prop-types';
import { drawerFun } from 'component/drawer';
import styled from 'styled-components';
import { Divider, Button, message } from 'antd';
import AllCenter from './allCenter';
import UsedCenter from './usedCenter';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';
import AddInstitution from 'src/view/settings/institution/addInstitution';

const CenterContainer = styled.div`
    .divider {
        margin: 0;
    }
    .center-header {
        padding: 0 18px;
        display: flex;
        height: 45px;
        justify-content: space-between;
        align-items: center;
        div {
            a {
                margin-right: 10px;
            }
        }
        .center-header-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 70%;
            cursor: pointer;
            span {
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
    .center-body {
        padding: 0 8px;
    }
`;

@injectIntl
class ProjectCenter extends React.PureComponent {
    state = {
        isShowInstitution: false
    };

    componentDidMount() {
        const { currentUserMenu = [] } = this.context;
        if (currentUserMenu.length > 0) {
            try {
                const ins = currentUserMenu[0]?.children
                    ?.find(item => item.code === 'senior_config')
                    ?.children?.find(c => c.code === 'institution_manage');
                console.log(ins);
                if (ins) {
                    this.setState({ isShowInstitution: true });
                }
            } catch (e) {
                message.error(e.message);
            }
        }
    }

    goBack = () => {
        this.props.history.goBack();
    };

    showInstitutionInfo = () => {
        const { formatMessage } = this.props.intl;
        const { ECONFIG_FRONT_A0694 } = i18nMessages;
        const {
            match: {
                params: { appId }
            }
        } = this.props;
        drawerFun({
            title: formatMessage(ECONFIG_FRONT_A0694),
            width: 500,
            compontent: props => (
                <AddInstitution
                    {...props}
                    intl={this.props.intl}
                    appId={appId}
                    institutionInfo={{}}
                    getInstitutionList={() =>
                        this.allUsedCenterEvent.fetchData()
                    }
                />
            )
        });
    };

    render() {
        const titleName = localStorage.getItem('projectName') || '';
        return (
            <CenterContainer>
                <div className="center-header">
                    <div className="center-header-title" title={titleName}>
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0069
                            )}{' '}
                        </span>
                        {`${titleName}`}
                    </div>
                    <div>
                        {this.state.isShowInstitution && (
                            <a onClick={this.showInstitutionInfo}>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0694
                                )}
                            </a>
                        )}
                        <Button onClick={this.goBack}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0094
                            )}
                        </Button>
                    </div>
                </div>
                <Divider className="divider" />
                <div className="center-body">
                    <AllCenter
                        allUsedCenter={this.allUsedCenter}
                        usedCenterEvent={this.usedCenterEvent}
                        {...this.props}
                    />
                    <UsedCenter
                        usedCenter={this.usedCenter}
                        allUsedCenterEvent={this.allUsedCenterEvent}
                        {...this.props}
                    />
                </div>
            </CenterContainer>
        );
    }

    usedCenter = ref => {
        this.usedCenterEvent = ref;
        this.forceUpdate();
    };

    allUsedCenter = ref => {
        this.allUsedCenterEvent = ref;
        this.forceUpdate();
    };

    static contextTypes = {
        currentUserMenu: PropTypes.array
    };
}

export default ProjectCenter;
