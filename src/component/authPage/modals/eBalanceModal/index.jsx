import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Select, message, Spin } from 'antd';
import { i18nMessages } from 'src/i18n';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import { includes, debounce } from 'lodash';
import BalanceAuthTable from './balanceAuthTable';
import { authServices } from '../../../../service/authService';
import { projectFilterOption } from 'src/utils/functions';

const Option = Select.Option;

@Form.create()
class eBalanceModal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        authType: PropTypes.string,
        intl: PropTypes.object,
        appId: PropTypes.string,
        appName: PropTypes.string,
        userName: PropTypes.string,
        projectId: PropTypes.string,
        envList: PropTypes.array,
        allRole: PropTypes.array,
        roleList: PropTypes.array,
        fromProjectManage: PropTypes.bool,
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
        selectProjectIds: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            projectList: [],
            fetching: false,
            selectProject: [],
            selectRole: [],
            showProject: true,
            siteList: [],
            roleList: props.roleList,
            storageList: []
        };
        this.balanceAuthTable = React.createRef();
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
        let { roleList } = this.state;
        try {
            // const params = {
            //     appId: this.props.appId,
            //     keyword: value,
            //     pageNum: 1,
            //     pageSize: 20
            // };
            let result = [];
            if (this.props.fromProjectManage) {
                const projectInfo = await $http.get(
                    parseApiUrl(urls.projectDetailInfo, {
                        id: this.props.projectId,
                        appId: this.props.appId
                    })
                );
                result = [projectInfo];
                /**
                 * 从项目管理中选择某一个项目进入授权页面，需要根据此项目的roleVos重新设置所有角色列表(适用于此项目的角色)
                 * */
                if (projectInfo.roleVos) {
                    roleList = projectInfo.roleVos.map(item => ({
                        ...item,
                        roleName: `${item.roleName}${
                            item.blindState === 0
                                ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0624)
                                : item.blindState === 1
                                    ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0623)
                                    : ''
                        }`
                    }));
                }
            } else {
                result = await $http.get(urls.getProjectRefRole, {
                    appId: this.props.appId
                });
                // result = await $http.post(urls.projectList, params);
            }
            // esupply多一个全部项目选项
            const resultData =
                !this.props.fromProjectManage &&
                this.props.authType === '7' &&
                this.props.userType !== 'projectUser'
                    ? result.concat({
                        projectName: 'All Projects',
                        id: 'ALL',
                        roleVos: this.props.roleList.filter(
                            item =>
                                !item.projectIds || !item.projectIds.length
                        )
                    })
                    : result;

            const projectList = resultData
                .filter(item => !includes(filterProjectIds, item.id))
                .map(project => ({
                    projectName: project.projectName,
                    projectId: project.id,
                    roleVos: (project.roleVos && project.id !== 'ALL')
                        ? project.roleVos.map(roleItem => ({
                            ...roleItem,
                            roleName: `${roleItem.roleName}${
                                roleItem.blindState === 0
                                    ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0624)
                                    : roleItem.blindState === 1
                                        ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0623)
                                        : ''
                            }`
                        }))
                        : project.roleVos || null,
                    programCode: project.programCode,
                    projectSerialNo: project.projectSerialNo
                }));
            this.setState({
                projectList,
                roleList,
                fetching: false
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    projectChange = async value => {
        try {
            const selectProject = this.state.projectList.filter(
                item => item.projectId === value
            );
            const siteList = await authServices.getAssignedSiteList(value, '');
            const storageList = await authServices.getAssignedStorageList(
                value,
                'esupply'
            );
            let roleList = this.state.roleList;
            if (selectProject[0].roleVos) {
                roleList = selectProject[0].roleVos;
            } else {
                roleList = roleList.filter(
                    item => !item.projectIds || !item.projectIds.length
                );
            }
            this.setState({
                siteList: siteList.data.map(item => {
                    return {
                        label: `${
                            item.secondaryCode ? `[${item.secondaryCode}]` : ''
                        }${item.aliasName}${
                            item.professionName
                                ? `(${item.professionName})`
                                : ''
                        }`,
                        value: item.siteId || ''
                    };
                }),
                roleList,
                storageList: storageList.map(item => {
                    return {
                        label: item.storeroomName,
                        value: item.id || ''
                    };
                }),
                selectProject
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    changeTableData = data => {
        console.log(data);
    };

    onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log(this.balanceAuthTable);
            const authData = this.balanceAuthTable.current.getData();
            console.log(authData);
            console.log(values);
            this.props.onOk(this.props.appId, authData);
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        };
        const {
            fetching,
            projectList,
            selectProject,
            // selectRole,
            showProject
        } = this.state;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <Modal
                className="roleProjectSiteModal"
                title={this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0311
                )}
                width={1200}
                onOk={this.onOk}
                onCancel={this.props.onCancel}
                visible={this.props.visible}
            >
                {/*<div className="pLeft40 pBottom15">*/}
                {/*<div className="mBottom8">*/}
                {/*<span>授权人员:</span>*/}
                {/*<span style={{ wordBreak: 'break-all' }}>{this.props.userName}</span>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*<span>授权系统:</span>*/}
                {/*<span>{this.props.appName}</span>*/}
                {/*</div>*/}
                {/*</div>*/}
                <Form className="pLeft50">
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0335
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('projectId', {
                            rules: [
                                {
                                    required: showProject,
                                    message: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0485
                                    )
                                }
                            ]
                        })(
                            <Select
                                className="mBottom15"
                                // labelInValue
                                placeholder={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0193
                                )}
                                notFoundContent={
                                    fetching ? (
                                        <Spin size="small" />
                                    ) : (
                                        formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0170
                                        )
                                    )
                                }
                                filterOption={projectFilterOption}
                                optionFilterProp="children"
                                showSearch
                                onChange={this.projectChange}
                                style={{ width: 300 }}
                            >
                                {projectList.length > 0
                                    ? projectList.map(project => (
                                        <Option
                                            key={project.projectId}
                                            {...project}
                                            title={`${
                                                project.projectSerialNo
                                                    ? `【${project.projectSerialNo}】`
                                                    : ''
                                            }${project.projectName}`}
                                        >
                                            {`${
                                                project.projectSerialNo
                                                    ? `【${project.projectSerialNo}】`
                                                    : ''
                                            }${project.projectName}`}
                                        </Option>
                                    ))
                                    : null}
                            </Select>
                        )}
                    </Form.Item>
                    <BalanceAuthTable
                        selectProjectId={
                            selectProject.length > 0
                                ? selectProject[0].projectId
                                : ''
                        }
                        ref={this.balanceAuthTable}
                        roleList={this.state.roleList}
                        envList={this.props.envList}
                        storageList={this.state.storageList}
                        siteList={this.state.siteList}
                        intl={this.props.intl}
                        onChangeData={this.changeTableData}
                    />
                </Form>
            </Modal>
        );
    }
}

export default eBalanceModal;
