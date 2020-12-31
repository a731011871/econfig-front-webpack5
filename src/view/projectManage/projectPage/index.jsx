import React from 'react';
import ProjectList from './projectList';
import { Tabs, Spin } from 'antd';
import { connect } from 'model';

@connect(state => ({
    currentAppId: state.project.currentAppId || '',
    softList: state.project.softList || [],
    searchParams: state.project.searchParams || {}
}))
class ProjectPage extends React.PureComponent {

    state = {
        spinning: true
    }

    projectArray = {}

    get projectEffects() {
        return this.props.effects.project;
    }

    async componentWillMount() {
        const { currentAppId } = this.props; 
        if(!currentAppId) {
            await this.projectEffects.setSoftList();
        }
        this.setState({spinning: false});
    }

    onTabClick = (item) => {
        this.projectEffects.setCurrentAppId(item);
        /**
         * 之前把获取列表的事件写到了ProjectList组件中
         * 项目管理是按照项目维度进行划分的，不同应用下有项目的项目
         * 删除一个项目，其他的应用也需要刷新
         */
        if(this.projectArray[item]) {
            this.projectArray[item].getProjectList({appId: item, ...this.props.searchParams[item]});
        }
    }

    render () {
        const { spinning } = this.state;
        const { currentAppId, softList } = this.props;
        return (
            <Spin spinning={spinning}>
                <Tabs activeKey={currentAppId} animated={false} tabBarGutter={0} onTabClick={this.onTabClick}>
                    {
                        softList.map(
                            item => {
                                return (
                                    <Tabs.TabPane tab={item.appName} key={item.appId} >
                                        <ProjectList projectEvent={this.projectEvent} appInfo={item} {...this.props} />
                                    </Tabs.TabPane>
                                );
                            }
                        )
                    }
                </Tabs>
            </Spin>
        );
    }

    projectEvent = (ref, appId) => {
        this.projectArray[appId] = ref;
    }

}

export default ProjectPage;