import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Select, message, Spin, Row, Col } from 'antd';
import { i18nMessages } from 'src/i18n';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import { includes, debounce, uniqBy } from 'lodash';
import SiteSelect from './siteSelect';

const Option = Select.Option;

@Form.create()
class projectRoleSiteModal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        authType: PropTypes.string,
        intl: PropTypes.object,
        appId: PropTypes.string,
        appName: PropTypes.string,
        userName: PropTypes.string,
        projectId: PropTypes.string,
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
            showProject: true
        };
    }

    componentDidMount() {
        if (this.props.fromProjectManage) {
            this.fetchProject();
        }
    }

    searchProject = debounce(value => this.fetchProject(value || ''), 500);

    fetchProject = async (value = '') => {
        console.log('fetching project', value);
        if (!this.props.fromProjectManage) {
            this.setState({ projectList: [], fetching: true });
        }
        const filterProjectIds = this.state.selectProject
            .map(item => item.projectId)
            .concat(this.props.selectProjectIds);
        try {
            const params = {
                appId: this.props.appId,
                keyword: value,
                pageNum: 1,
                pageSize: 20
            };
            let result = [];
            if (this.props.appId === 'econfig') {
                result = await $http.post(urls.tenantProjects, {
                    keyword: value
                });
            } else if (this.props.fromProjectManage) {
                const projectInfo = await $http.get(
                    parseApiUrl(urls.projectDetailInfo, {
                        id: this.props.projectId,
                        appId: this.props.appId
                    })
                );
                result = {
                    list: [projectInfo]
                };
            } else {
                result = await $http.post(urls.projectList, params);
            }
            // esupply多一个全部项目选项
            const resultData =
                !this.props.fromProjectManage &&
                this.props.authType === '7' &&
                this.props.userType !== 'projectUser'
                    ? result.list.concat({
                          projectName: 'All Projects',
                          id: 'ALL'
                      })
                    : result.list;

            const projectList = resultData
                .filter(item => !includes(filterProjectIds, item.id))
                .map(project => ({
                    projectName: project.projectName,
                    projectId: project.id,
                    programCode: project.programCode,
                    projectSerialNo: project.projectSerialNo
                }));
            this.setState(
                {
                    projectList,
                    fetching: false,
                    selectProject:
                        this.props.fromProjectManage && projectList[0]
                            ? projectList
                            : []
                },
                () => {
                    // 如果是从项目中进入授权，新增时候自动带入该项目
                    if (this.props.fromProjectManage) {
                        this.props.form.setFieldsValue({
                            projectId: projectList[0]
                                ? this.props.projectId
                                : ''
                        });
                    }
                }
            );
        } catch (e) {
            message.error(e.message);
        }
    };

    changeRoles = (values, options) => {
        console.log(values, options);
        const selectRole = options.map(item => item.props.dataRef);
        this.setState({ selectRole });
    };

    projectChange = value => {
        const projectList = this.state.selectProject
            .concat(this.state.projectList)
            .filter(item => item.projectId === value);
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
            console.log(values);
            const roleIds = values.roleIds;
            const projectIds = [values.projectId];
            delete values.roleIds;
            delete values.projectId;
            const siteIds = [];
            Object.values(values).forEach(projectSite => {
                const site = {};

                projectSite.forEach(siteItem => {
                    site[siteItem.key] = siteItem.label;
                });
                siteIds.push(site);
            });
            console.log(roleIds, projectIds, siteIds);
            const projectLists = [
                {
                    projectIds,
                    roleIds,
                    siteIds
                }
            ];
            this.props.onOk(this.props.appId, projectLists);
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
            selectRole,
            showProject
        } = this.state;
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
                            i18nMessages.ECONFIG_FRONT_A0335
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('projectId', {
                            initialValue: '',
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
                                showSearch
                                filterOption={false}
                                onSearch={this.searchProject}
                                onChange={this.projectChange}
                                onFocus={this.searchProject}
                                onBlur={() => {
                                    this.setState({ projectList: [] });
                                }}
                                style={{ width: 300 }}
                            >
                                {projectList.length > 0
                                    ? projectList.map(project => (
                                          <Option
                                              key={project.projectId}
                                              title={`【${project.projectSerialNo}】${project.projectName}`}
                                          >
                                              {`【${project.projectSerialNo}】${project.projectName}`}
                                          </Option>
                                      ))
                                    : null}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0134
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('roleIds', {
                            initialValue: [],
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
                                mode="multiple"
                                onChange={this.changeRoles}
                            >
                                {this.props.roleList.map(item => (
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
                    {selectRole.length > 0 &&
                        this.state.selectProject.length > 0 && (
                            <div>
                                <div className="mBottom10 Bold">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0487
                                    )}
                                </div>
                                {selectRole.map(item => (
                                    <Row key={item.id}>
                                        <Col
                                            span={6}
                                            className="overflow_ellipsis Gray_9e"
                                            style={{ lineHeight: '36px' }}
                                            title={item.roleName}
                                        >
                                            {item.roleName}
                                        </Col>
                                        <Col span={12} offset={1}>
                                            <Form.Item>
                                                {getFieldDecorator(item.id, {
                                                    initialValue: [],
                                                    rules: [
                                                        {
                                                            required:
                                                                item.needSite ===
                                                                1,
                                                            message: this.props.intl.formatMessage(
                                                                i18nMessages.ECONFIG_FRONT_A0487
                                                            )
                                                        }
                                                    ]
                                                })(
                                                    <SiteSelect
                                                        formatMessage={
                                                            formatMessage
                                                        }
                                                        selectRoleInfo={item}
                                                        projectId={
                                                            selectProject[0]
                                                                .projectId
                                                        }
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ))}
                            </div>
                        )}
                </Form>
            </Modal>
        );
    }
}

export default projectRoleSiteModal;
