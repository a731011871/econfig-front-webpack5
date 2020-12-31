import React from 'react';
import PropTypes from 'prop-types';
import {cloneDeep, includes, debounce, uniqBy, intersection} from 'lodash';
import styled from 'styled-components';
// import { $http } from 'utils/http';
// import urls  from 'utils/urls';
import { i18nMessages } from 'src/i18n';
import { Select, Spin, Button, message, Divider } from 'antd';
import { authServices } from 'src/service/authService';
import {projectFilterOption} from 'src/utils/functions';

const Option = Select.Option;
const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;

class projectDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        authType: PropTypes.string,
        onClose: PropTypes.func,
        selectProjectIds: PropTypes.array,
        selectRole: PropTypes.array, // 选中的授权数据
        record: PropTypes.object, //site中需要选择项目的单条数据
        addDataItem: PropTypes.func,

        fromProjectManage: PropTypes.bool, // 是否从项目管理中邀请授权
        projectId: PropTypes.string, // 项目Id

        selectRoleList: PropTypes.array, // 选中的角色列表
    };

    constructor(props) {
        super(props);
        this.state = {
            projectList: [],
            selectProject: [],
            fetching: false,
            selectValues: []
        };
    }

    componentDidMount() {
        this.fetchProject();
    }

    searchProject = debounce(value => this.fetchProject(value || ''), 500);

    fetchProject = async (value = '') => {
        console.log('fetching project', value);
        this.setState({ projectList: [], fetching: true });
        const filterProjectIds = this.state.selectProject
            .map(item => item.projectId)
            .concat(this.props.selectProjectIds);
        try {
            // const params = {
            //     appId: this.props.appId,
            //     keyword: value,
            //     pageNum: 1,
            //     pageSize: 20
            // };
            let result = [];
            if (this.props.appId === 'econfig') {
                result = await authServices.getCspTenantProjects(
                    value,
                    null,
                    true
                );
                // result = await $http.post(urls.tenantProjects, {
                //     keyword: value
                // });
            }
            // 项目管理中进来项目列表中只有一个，获取该项目详情
            // else if (this.props.fromProjectManage) {
            //     const projectInfo = await $http.get(
            //         parseApiUrl(urls.projectDetailInfo, {
            //             id: this.props.projectId,
            //             appId: this.props.appId
            //         })
            //     );
            //     result = {
            //         list: [projectInfo]
            //     };
            // }
            else {
                result = await authServices.getCspProjectList(
                    this.props.appId,
                    false,
                    value
                );
                // result = await $http.post(urls.projectList, params);
            }
            /**
             * esupply多一个全部项目选项，pv2增加全选选项，选择以后等同于选中所有项目
             */
            let resultData = result.data;

            if (
                !this.props.fromProjectManage &&
                this.props.authType === '7' &&
                this.props.userType !== 'projectUser'
            ) {
                resultData = [
                    {
                        projectName: 'All Projects',
                        id: 'ALL',
                    }
                ].concat(result.data);
            }

            let projectList = resultData
                .filter(item => !includes(filterProjectIds, item.id))
                .map(project => ({
                    projectName: project.projectName,
                    projectId: project.id,
                    programCode: project.programCode,
                    projectSerialNo: project.projectSerialNo
                }));
            /**
             * edc后端系统项目列表要筛选
             * 选择了角色，要取角色的适用项目去选择
             * 如果角色没有适用项目，全部项目可选*/
            if (this.props.authType === '8') {
                const hasProjectIdsRole = this.props.selectRoleList.filter(
                    item => item.projectIds
                );
                if (hasProjectIdsRole.length === 1) {
                    projectList = projectList.filter(item => includes(hasProjectIdsRole[0].projectIds, item.projectId));
                } else if (hasProjectIdsRole.length > 1) {
                    // 选择的项目中有多个项目有roleVos，取交集
                    const projectArr = hasProjectIdsRole.map(item => item.projectIds);
                    const couldSelectProjectIds = intersection(...projectArr);
                    projectList = projectList.filter(item => includes(couldSelectProjectIds, item.projectId));
                }
            }
            this.setState({
                projectList,
                fetching: false
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    newHandleChange = values => {
        // const projectItem = this.state.projectList.filter(
        //     item => includes(values, item.projectId)
        // )[0];
        const projectList = this.state.selectProject
            .concat(this.state.projectList)
            .filter(item => includes(values, item.projectId));
        let selectProject = [];
        if (
            this.props.selectProjectIds.filter(item => includes(values, item))
                .length > 0
        ) {
            message.info(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0192)
            );
        } else {
            selectProject = uniqBy(projectList, 'projectId');
        }
        // const projectList = this.state.projectList.filter(item => item.projectId !== value[0]);
        this.setState({
            // projectList,
            selectProject,
            fetching: false,
            selectValues: values
        });
    };

    deleteProject = projectId => {
        this.setState({
            selectProject: this.state.selectProject.filter(
                item => item.projectId !== projectId
            ),
            selectValues: this.state.selectValues.filter(
                item => item !== projectId
            )
        });
    };

    saveProject = () => {
        if (includes(['3', '5'], this.props.authType)) {
            const record = cloneDeep(this.props.record);
            record.projectIds = record.projectIds
                .concat(this.state.selectProject.map(item => item.projectId))
                .filter(item => item !== 'allSelect');
            this.props.addDataItem([record]);
        } else if (includes(['2', '4', '9'], this.props.authType)) {
            const dataList = cloneDeep(this.props.selectRole);
            const newDataList = dataList.map(item => ({
                ...item,
                projectIds: item.projectIds.concat(
                    this.state.selectProject.map(item => item.projectId)
                ),
                siteIds: (item.siteIds || []).concat(
                    this.state.selectProject.map(() => [])
                )
            }));
            this.props.addDataItem(newDataList);
        } else if (this.props.authType === '8') {
            /**
             * edc添加项目有前端系统/后端系统两种场景
             * 前端系统时项目是第一列，roleIds手动设置为[]
             * 后端系统时项目是第二列，roleIds需要取原数据的roleIds*/
            const dataList = cloneDeep(this.props.selectRole);
            const newDataList = dataList.map(item => ({
                ...item,
                projectIds: item.projectIds.concat(
                    this.state.selectProject.map(item => item.projectId)
                )
            }));
            this.props.addDataItem(newDataList);
        } else {
            const projectList = this.state.selectProject.map(item => {
                return {
                    projectIds: [item.projectId],
                    envIds: [],
                    roleIds: [],
                    siteIds: [],
                    storageMap: []
                };
            });
            this.props.addDataItem(this.props.appId, projectList);

        }
        this.props.onClose();
    };

    allSelect = () => {
        const selectProjectList = uniqBy(
            this.state.selectProject.concat(this.state.projectList),
            'projectId'
        );
        this.setState({
            // projectList,
            selectProject: selectProjectList,
            fetching: false,
            selectValues: selectProjectList.map(item => item.projectId)
        });
    };

    render() {
        const { fetching, projectList } = this.state;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="projectDrawer">
                <Select
                    className="mBottom15"
                    mode="multiple"
                    // labelInValue
                    value={this.state.selectValues}
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0193
                    )}
                    notFoundContent={
                        fetching ? (
                            <Spin size="small" />
                        ) : (
                            formatMessage(i18nMessages.ECONFIG_FRONT_A0170)
                        )
                    }
                    allowClear
                    filterOption={projectFilterOption}
                    onChange={this.newHandleChange}
                    style={{ width: '100%' }}
                    dropdownRender={menu => (
                        <div>
                            {menu}
                            <Divider style={{ margin: '4px 0' }} />
                            <a
                                style={{
                                    display: 'Block',
                                    padding: '5px 12px'
                                }}
                                onMouseDown={e => {
                                    e.preventDefault();
                                }}
                                onClick={this.allSelect}
                            >
                                {formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}
                            </a>
                        </div>
                    )}
                >
                    {projectList.map(project => (
                        <Option
                            key={project.projectId}
                            {...project}
                            title={`【${project.projectSerialNo}】${project.projectName}`}
                        >
                            {`【${project.projectSerialNo}】${project.projectName}`}
                        </Option>
                    ))}
                </Select>

                {/*<div className="selectData">*/}
                {/*<div>{formatMessage(i18nMessages.ECONFIG_FRONT_A0190)}</div>*/}
                {/*<div className="selectProjectList">*/}
                {/*{this.state.selectProject.map(item => (*/}
                {/*<div*/}
                {/*className="projectItem flexRow overflowHidden mTop8"*/}
                {/*key={item.projectId}*/}
                {/*>*/}
                {/*<span*/}
                {/*className="InlineBlock flex overflow_ellipsis mLeft15 pRight15"*/}
                {/*title={item.projectName}*/}
                {/*>*/}
                {/*{item.projectName}*/}
                {/*</span>*/}
                {/*<Icon*/}
                {/*type="close"*/}
                {/*className="pointer"*/}
                {/*onClick={() => {*/}
                {/*this.deleteProject(item.projectId);*/}
                {/*}}*/}
                {/*/>*/}
                {/*</div>*/}
                {/*))}*/}
                {/*</div>*/}
                {/*</div>*/}
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.selectProject.length}项目*/}
                        {formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0286
                        ).replace('xx', this.state.selectProject.length || 0)}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveProject}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default projectDrawer;
