import React from 'react';
import { Tabs, Button } from 'antd';
import { i18nMessages } from 'src/i18n';
import {injectIntl} from 'react-intl';
import UserManage from './userManage';
import BaseInfo from './baseInfo';

@injectIntl
class ProjectDetail extends React.PureComponent {

    state = {
        titleName: localStorage.getItem('projectName') || ''
    }

    goBack = () => {
        this.props.history.goBack();
    }

    setTitleName = () => {
        this.setState({
            titleName: localStorage.getItem('projectName') || ''
        });
    }

    render () {
        
        const { titleName } = this.state;
        return (
            <div>
                {/* <EConfigHeader>
                    <div className="e_config_header_left">
                        <div className="e_config_logo">eConfig</div>
                        <ul>
                            <li>
                                <a className="project_title" href="javascript:void(0)">{name || this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0221)}</a>
                            </li>
                        </ul>
                    </div>
                </EConfigHeader> */}
                <div style={{margin: '5px 5px 10px 5px'}}>
                    <Tabs tabBarExtraContent={(
                        <React.Fragment>
                            <span title={titleName || this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0221)} style={{whiteSpace: 'nowrap', textOverflow:'ellipsis', overflow: 'hidden', width: '400px', float: 'left', textAlign: 'right', cursor: 'pointer'}}>
                                {titleName || this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0221)}
                            </span>
                            <Button style={{margin: '0px 12px'}} onClick={this.goBack}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0094)}</Button>
                        </React.Fragment>
                    )} defaultActiveKey={'userManage'} animated={false} tabBarGutter={0} onTabClick={this.onTabClick}
                    >
                        <Tabs.TabPane tab={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0066)} key={'userManage'} >
                            <UserManage {...this.props} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0067)} key={'baseInfo'} >
                            <BaseInfo {...this.props} setTitleName={this.setTitleName} />
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
            
        );
    }

}

export default ProjectDetail;