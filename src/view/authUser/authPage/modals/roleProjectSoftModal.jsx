import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Select, message, Spin, Divider } from 'antd';
import { i18nMessages } from 'src/i18n';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import { includes, debounce, uniqBy } from 'lodash';
import {authServices} from 'src/service/authService';
import {projectFilterOption} from 'src/utils/functions';

const Option = Select.Option;

@Form.create()
class roleProjectSoftModal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        authType: PropTypes.string,
        intl: PropTypes.object,
        appId: PropTypes.string,
        appName: PropTypes.string,
        userName: PropTypes.string,
        projectId: PropTypes.string,
        roleList: PropTypes.array,
        softList: PropTypes.array,
        productList: PropTypes.array,
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
            showProject: true,
            selectRoleInfo: {
                // 兼容未选择角色时的中心选择   角色的needSite属性默认为1
                needSite: 1
            },
        };
    }

    searchProject = debounce(value => this.fetchProject(value || ''), 500);

    fetchProject = async value => {
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
                result = await authServices.getCspTenantProjects(value, null, false);
            } else if (this.props.fromProjectManage) {
                const projectInfo = await $http.get(
                    parseApiUrl(urls.projectDetailInfo, {
                        id: this.props.projectId,
                        appId: this.props.appId
                    })
                );
                result = {
                    data: [projectInfo]
                };
            } else {
                result = await authServices.getCspProjectList(this.props.appId, true, value);
            }
            // esupply多一个全部项目选项
            const resultData =
                !this.props.fromProjectManage &&
                this.props.authType === '7' &&
                this.props.userType !== 'projectUser'
                    ? result.data.concat({
                        projectName: 'All Projects',
                        id: 'ALL'
                    })
                    : result.data;

            const projectList = resultData
                .filter(item => !includes(filterProjectIds, item.id))
                .map(project => ({
                    projectName: project.projectName,
                    projectId: project.id,
                    programCode: project.programCode,
                    projectSerialNo: project.projectSerialNo
                }));
            this.setState({
                projectList,
                fetching: false
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    changeRoles = (value, option) => {
        const roleInfo = option.props.dataRef;
        console.log(value, option.props.dataRef);
        if (roleInfo.needProject === 0) {
            this.setState({
                showProject: false,
                selectRoleInfo: roleInfo,
                selectProject: []
            });
            this.props.form.setFieldsValue({ projectIds: [] });
        } else {
            this.fetchProject();
            this.setState({ showProject: true, selectRoleInfo: roleInfo });
        }
    };

    projectChange = values => {
        const projectList = this.state.selectProject
            .concat(this.state.projectList)
            .filter(item => includes(values, item.projectId));
        const selectProject = uniqBy(projectList, 'projectId');
        this.setState({
            selectProject
        });
    };

    onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const projectLists = [
                {
                    projectIds: values.projectIds || [],
                    roleIds: [values.roleId],
                    softIds: values.softIds || []
                }
            ];
            this.props.onOk(this.props.appId, projectLists);
        });
    };

    allSelect = () => {
        this.props.form.setFieldsValue({ projectIds: this.state.projectList.map(item => item.projectId) });
        this.setState({
            selectProject: this.state.projectList,
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
            selectRoleInfo,
            showProject
        } = this.state;
        const { softList } = this.props;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <Modal
                className="roleProjectSiteModal"
                title={this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0311
                )}
                width={800}
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
                            i18nMessages.ECONFIG_FRONT_A0134
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('roleId', {
                            initialValue: '',
                            rules: [
                                {
                                    required: true,
                                    message: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0482
                                    )
                                }
                            ]
                        })(
                            <Select
                                style={{ width: 300 }}
                                optionFilterProp="children"
                                showSearch
                                onChange={this.changeRoles}
                            >
                                {this.props.roleList.filter(item => item.isEdit).map(item => (
                                    <Option
                                        value={item.id}
                                        key={item.id}
                                        dataRef={item}
                                    >
                                        {item.roleName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    {selectRoleInfo && selectRoleInfo.id === 'econfig_project_admin' &&
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0335
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('projectIds', {
                                initialValue: [],
                                rules: [
                                    {
                                        required: showProject,
                                        message: this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0534
                                        )
                                    }
                                ]
                            })(
                                <Select
                                    className="mBottom15"
                                    mode="multiple"
                                    // labelInValue
                                    placeholder={
                                        showProject
                                            ? formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0193
                                            )
                                            : selectRoleInfo.nullProjectDefaultValue ===
                                              'NONE'
                                                ? formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0303
                                                )
                                                : formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0302
                                                )
                                    }
                                    disabled={!showProject}
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
                                    showSearch
                                    allowClear
                                    onChange={this.projectChange}
                                    style={{ width: 300 }}
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
                                    {projectList.length > 0
                                        ? projectList.map(project => (
                                            <Option
                                                key={project.projectId}
                                                {...project}
                                                title={`【${project.projectSerialNo}】${project.projectName}`}
                                            >
                                                {`【${project.projectSerialNo}】${project.projectName}`}
                                            </Option>
                                        ))
                                        : null}
                                </Select>
                            )}
                        </Form.Item>
                    }
                    {selectRoleInfo && selectRoleInfo.id === 'econfig_soft_admin' &&
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0257
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('softIds', {
                            initialValue: [],
                            rules: [
                                {
                                    required: true,
                                    message: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0485
                                    )
                                }
                            ]
                        })(
                            <Select
                                className="mBottom15"
                                mode="multiple"
                                // labelInValue
                                placeholder={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0447
                                )}
                                optionFilterProp="children"
                                showSearch
                                allowClear
                                style={{ width: 300 }}
                            >
                                {softList.length > 0
                                    ? softList.map(softItem => (
                                        <Option
                                            key={softItem.appId}
                                            title={softItem.appName}
                                        >
                                            {softItem.appName}
                                        </Option>
                                    ))
                                    : null}
                            </Select>
                        )}
                    </Form.Item>
                    }
                </Form>
            </Modal>
        );
    }
}

export default roleProjectSoftModal;
