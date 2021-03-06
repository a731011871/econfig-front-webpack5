import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { debounce, includes, isEmpty, find } from 'lodash';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { Form, Select, Button, DatePicker, message, Modal } from 'antd';
import styled from 'styled-components';
import { authServices } from '../../service/authService';
import { i18nMessages } from '../../i18n';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const confirm = Modal.confirm;
const BoxDiv = styled.div`
    padding-left: 15px;
    padding-right: 15px;
    .ant-form-item {
        display: inline-block;
        width: 33%;
    }
`;

@Form.create()
class searchForm extends React.PureComponent {
    static propTypes = {
        addExchange: PropTypes.func,
        toggleLoading: PropTypes.func,
        searchObj: PropTypes.object,
        intl: PropTypes.object,
        defaultSearchParams: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            systemList: [],
            userList: [],
            projectList: [],
            roleList: [],
            productList: [],
            storageList: [],
            envList: [],
            siteList: [],
            selectAuthType: '',
            selectAppId: ''
        };
    }

    componentWillMount() {
        // this.getAllUsers('');
        this.getSystemList();
    }

    componentDidMount() {
        // const {roleIds = [], projectIds = [],siteIds = [], userIds = []} = this.props.searchObj;
        // this.props.form.setFieldsValue({
        //     roleIds,
        //     projectIds,
        //     siteIds,
        //     userIds,
        // });
        // if (this.props.defaultSearchParams.email) {
        // this.props.form.setFieldsValue({userIds: this.props.defaultSearchParams.userIds});
        // }
    }

    getSystemList = async () => {
        try {
            const {
                searchObj: { appId }
            } = this.props;
            const result = await $http.get(urls.getFilterSoftList);
            const list = result.filter(
                item => item.authType && item.authType !== '-1'
            );
            this.setState(
                {
                    systemList: list || [],
                    selectAuthType: appId
                        ? find(list, item => item.appId === appId).authType
                        : list.length
                        ? list[0].authType
                        : '',
                    selectAppId: appId
                        ? appId
                        : list.length
                        ? list[0].appId
                        : ''
                },
                () => {
                    const {
                        roleIds = [],
                        projectIds = [],
                        siteIds = [],
                        userIds = []
                    } = this.props.searchObj;
                    this.props.form.setFieldsValue({
                        roleIds,
                        projectIds,
                        siteIds,
                        userIds
                    });
                }
            );
        } catch (e) {
            message.error(e.message);
        }
    };

    getAllUsers = debounce(async (value = '') => {
        this.setState({ userList: [] });
        try {
            const userList = await $http.post(urls.getAllCompanyUsers, {
                pageIndex: 1,
                pageSize: 20,
                status: '1',
                userPropertys: ['OutUser', 'CompanyUser', 'TMUser'],
                keyWord: value || ''
            });
            this.setState({
                userList: userList || []
            });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    getRoles = async () => {
        try {
            const roleList = await authServices.getRoleList(
                this.state.selectAppId
            );
            this.setState({
                roleList: roleList.map(item => ({
                    ...item,
                    roleName: `${item.roleName}${
                        item.blindState === 0
                            ? this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0624
                              )
                            : item.blindState === 1
                            ? this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0623
                              )
                            : ''
                    }`
                }))
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    getProjectList = debounce(async (value = '') => {
        this.setState({ projectList: [] });
        try {
            const params = {
                appId: this.state.selectAppId,
                keyword: value,
                pageNum: 1,
                pageSize: 20
            };
            const result = await $http.post(urls.projectList, params);
            this.setState({
                projectList: result.list.concat({
                    projectName: 'All Projects',
                    id: 'ALL'
                })
            });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    getSites = debounce(async (value = '') => {
        this.setState({ siteList: [] });
        try {
            const tableData = await $http.get(urls.getTenantEnterpriseListAll, {
                name: value,
                type: 'enterprise_institution',
                pageIndex: 1,
                pageSize: 20
                // onlyLocal: 1
            });
            // const tableData = await $http.post(urls.getInstitution, {
            //     needCount: true,
            //     needPaging: true,
            //     pageNo: 1,
            //     pageSize: 20,
            //     criteria: {
            //         conditions: [
            //             {
            //                 joint: 'AND',
            //                 operator: 'contains',
            //                 propertyName: 'name',
            //                 value
            //             },
            //             {
            //                 'joint':'AND',
            //                 'operator': 'equal',
            //                 'propertyName': 'trialOsDeleted',
            //                 'value': '0'
            //             }
            //         ],
            //         sortProperties: [
            //             {
            //                 propertyName: 'createTime',
            //                 sort: 'DESC'
            //             }
            //         ]
            //     }
            // });
            this.setState({
                siteList: tableData.data || []
            });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    getEnvList = async () => {
        this.setState({ siteList: [] });
        try {
            const envResult = await authServices.getEnvList(
                this.state.selectAppId
            );
            this.setState({
                envList: envResult.rows || []
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    getStorageList = async () => {
        this.setState({ storageList: [] });
        const params = {
            pageNo: 0,
            paging: false,
            pageSize: 0,
            criteria: {
                conditions: [
                    {
                        join: 'AND',
                        subConditions: [
                            {
                                entityName: 'storeroomDo',
                                joint: 'AND',
                                operator: 'contains',
                                propertyName: 'storeroomName',
                                value: ''
                            },
                            {
                                entityName: 'storeroomDo',
                                joint: 'OR',
                                operator: 'contains',
                                propertyName: 'contact',
                                value: ''
                            }
                        ]
                    }
                ]
            }
        };
        try {
            const data = await $http.post(urls.getWareHouseList, params);
            this.setState({ storageList: data.list || [] });
        } catch (e) {
            message.error(e.message);
        }
    };

    getProductList = async () => {
        this.setState({ productList: [] });
        try {
            const productDataList = await authServices.getProductDataList(
                this.state.selectAppId
            );
            this.setState({
                productList: productDataList || []
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    changeSystem = (value, option) => {
        console.log(option.props.authtype);
        this.setState({
            selectAuthType: option.props.authtype,
            selectAppId: value
        });
        this.props.form.setFieldsValue({
            roleIds: [],
            projectIds: [],
            siteIds: [],
            productDataIds: [],
            storageIds: [],
            envIds: []
        });
    };

    exportExchange = () => {
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0029
            ),
            content: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0479
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    const result = await $http.post(urls.exportAuthInfo, {
                        ...this.props.searchObj,
                        ...{
                            projectIds: this.props.searchObj.projectIds?.map(
                                item => item.key
                            ),
                            siteIds: this.props.searchObj.siteIds?.map(
                                item => item.key
                            ),
                            roleIds: this.props.searchObj.roleIds?.map(
                                item => item.key
                            ),
                            userIds: this.props.searchObj.userIds?.map(
                                item => item.key
                            )
                        }
                    });
                    console.log(result);
                    if (result && result.relativeFileUrl) {
                        window.location.href = result.relativeFileUrl;
                    } else {
                        message.error(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0516
                            )
                        );
                    }
                } catch (e) {
                    message.error(
                        e.message ||
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0203
                            )
                    );
                }
            }
        });
    };

    search = () => {
        // 是否重置
        this.props.form.validateFields((errors, values) => {
            if (errors) {
                return;
            }
            console.log(values);
            if (values.date && values.date.length) {
                values.startTime = moment(values.date[0]).format(
                    'YYYY-MM-DD HH:mm:ss'
                );
                values.endTime = moment(values.date[1]).format(
                    'YYYY-MM-DD HH:mm:ss'
                );
            } else {
                values.startTime = '';
                values.endTime = '';
            }
            const searchObj = {
                ...this.props.searchObj,
                ...values,
                authType: this.state.selectAuthType
            };
            this.props.fetchMember(searchObj);
        });
    };

    reset = () => {
        this.props.form.resetFields();
        this.props.form.setFieldsValue({
            appId: this.state.systemList[0].appId
        });
        this.setState({ selectAuthType: this.state.systemList[0].authType });
        this.props.fetchMember({
            appId: this.state.systemList[0].appId,
            startTime: moment()
                .subtract(1, 'year')
                .format('YYYY-MM-DD HH:mm:ss'),
            endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            authType: this.state.systemList[0].authType,
            pageIndex: 1,
            pageSize: 20
        });
    };

    render() {
        // const rowGutter = 40;
        const { getFieldDecorator } = this.props.form;
        const {
            systemList,
            userList,
            selectAuthType,
            roleList,
            projectList,
            siteList,
            envList,
            storageList,
            productList
        } = this.state;
        const {
            // userIds,
            appId,
            authUserIds,
            date,
            // roleIds,
            // projectIds,
            productDataIds,
            storageIds,
            // siteIds,
            envIds
        } = this.props.searchObj;
        const formItemLayout = {
            labelCol: { span: 9 },
            wrapperCol: { span: 15 }
        };
        const isEconfig = isEmpty(
            systemList.find(item => item.appId === 'econfig')
        );
        return (
            <BoxDiv className="search mBottom15">
                <Form>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0551
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('userIds', {
                            rules: [],
                            initialValue: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                mode="multiple"
                                // maxTagCount={2}
                                // maxTagPlaceholder={values =>
                                // `等${values.length}人`
                                // }
                                filterOption={false}
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0648
                                )}
                                onFocus={this.getAllUsers}
                                onBlur={() => {
                                    this.setState({
                                        userList: []
                                    });
                                }}
                                onSearch={this.getAllUsers}
                            >
                                {userList.map(item => (
                                    <Option
                                        title={`${item.userName}(${item.accountName})`}
                                        key={item.userId}
                                    >
                                        {/* {`${item.userName}(${item.accountName})`} */}
                                        {item.userName && item.accountName
                                            ? `${
                                                  item.userName
                                              }${`（${item.accountName}）`}`
                                            : item.userName || item.accountName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0257
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('appId', {
                            rules: [],
                            initialValue: appId
                                ? appId
                                : systemList.length
                                ? systemList[0].appId
                                : ''
                        })(
                            <Select
                                onChange={this.changeSystem}
                                optionFilterProp="children"
                                showSearch
                            >
                                {systemList.map(item => (
                                    <Option
                                        title={item.appName}
                                        key={item.appId}
                                        authtype={item.authType}
                                    >
                                        {item.appName}
                                    </Option>
                                ))}
                                {isEconfig && (
                                    <Option
                                        title={`eConfig`}
                                        key={`econfig`}
                                        authtype={`9`}
                                    >
                                        {`eConfig`}
                                    </Option>
                                )}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0478
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('authUserIds', {
                            rules: [],
                            initialValue: authUserIds || []
                        })(
                            <Select
                                showSearch
                                allowClear
                                mode="multiple"
                                filterOption={false}
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                                onFocus={this.getAllUsers}
                                onBlur={() => {
                                    this.setState({
                                        userList: []
                                    });
                                }}
                                onSearch={this.getAllUsers}
                            >
                                {userList.map(item => (
                                    <Option
                                        key={item.userId}
                                        title={`${item.userName}(${item.accountName})`}
                                    >
                                        {`${item.userName}(${item.accountName})`}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0480
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('date', {
                            rules: [],
                            initialValue: date
                                ? date
                                : [moment().subtract(1, 'year'), moment()]
                        })(<RangePicker style={{ width: '100%' }} />)}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0134
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('roleIds', {
                            rules: [],
                            initialValue: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                mode="multiple"
                                onFocus={this.getRoles}
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                                optionFilterProp="children"
                                onBlur={() => {
                                    this.setState({
                                        roleList: []
                                    });
                                }}
                                // onSearch={this.getRoles}
                            >
                                {roleList.map(item => (
                                    <Option key={item.id} title={item.roleName}>
                                        {item.roleName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    {!includes(['1', '10'], selectAuthType) && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0335
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('projectIds', {
                                rules: [],
                                initialValue: []
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    labelInValue
                                    mode="multiple"
                                    filterOption={false}
                                    onFocus={this.getProjectList}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    onSearch={this.getProjectList}
                                    onBlur={() => {
                                        this.setState({
                                            projectList: []
                                        });
                                    }}
                                >
                                    {projectList.map(item => (
                                        <Option
                                            key={item.id}
                                            title={`${
                                                item.projectSerialNo
                                                    ? `【${item.projectSerialNo}】${item.projectName}`
                                                    : item.projectName
                                            }`}
                                        >
                                            {`${
                                                item.projectSerialNo
                                                    ? `【${item.projectSerialNo}】${item.projectName}`
                                                    : item.projectName
                                            }`}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}

                    {selectAuthType === '9' && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0584
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('authApps', {
                                rules: []
                            })(
                                <Select
                                    mode="multiple"
                                    optionFilterProp="children"
                                    showSearch
                                    allowClear
                                >
                                    {systemList.map(item => {
                                        if (item.appId !== 'econfig') {
                                            return (
                                                <Option
                                                    title={item.appName}
                                                    key={item.appId}
                                                    authtype={item.authType}
                                                >
                                                    {item.appName}
                                                </Option>
                                            );
                                        }
                                    })}
                                </Select>
                            )}
                        </Form.Item>
                    )}

                    {includes(['4', '6', '7', '8'], selectAuthType) && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0474
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('siteIds', {
                                rules: [],
                                initialValue: []
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    labelInValue
                                    mode="multiple"
                                    filterOption={false}
                                    onFocus={this.getSites}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    onSearch={this.getSites}
                                    onBlur={() => {
                                        this.setState({
                                            siteList: []
                                        });
                                    }}
                                >
                                    {siteList.map(item => (
                                        <Option
                                            key={item.id}
                                            title={
                                                item.name || item.localeNameEn
                                            }
                                        >
                                            {item.name || item.localeNameEn}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}
                    {selectAuthType === '3' && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0475
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('productDataIds', {
                                rules: [],
                                initialValue: productDataIds || []
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    mode="multiple"
                                    onFocus={this.getProductList}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    optionFilterProp="children"
                                    onBlur={() => {
                                        this.setState({
                                            productList: []
                                        });
                                    }}
                                    // onSearch={this.getProductList}
                                >
                                    {productList.map(product => (
                                        <Option
                                            key={product.id}
                                            title={product.commonZhName}
                                        >
                                            {product.commonZhName}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}
                    {selectAuthType === '5' && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0476
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('storageIds', {
                                rules: [],
                                initialValue: storageIds || []
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    mode="multiple"
                                    onFocus={this.getStorageList}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    optionFilterProp="children"
                                    onBlur={() => {
                                        this.setState({
                                            storageList: []
                                        });
                                    }}
                                    // onSearch={this.getStorageList}
                                >
                                    {storageList.map(item => (
                                        <Option
                                            key={item.id}
                                            title={item.storeroomName}
                                        >
                                            {item.storeroomName}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}
                    {includes(['8', '7'], selectAuthType) && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0287
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('envIds', {
                                rules: [],
                                initialValue: envIds || []
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    mode="multiple"
                                    onFocus={this.getEnvList}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    optionFilterProp="children"
                                    onBlur={() => {
                                        this.setState({
                                            envList: []
                                        });
                                    }}
                                    // onSearch={this.getEnvList}
                                >
                                    {envList.map(item => (
                                        <Option key={item.id} title={item.name}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}
                    {selectAuthType === '7' && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0476
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('storageIds', {
                                rules: [],
                                initialValue: storageIds || []
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    mode="multiple"
                                    onFocus={this.getStorageList}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    optionFilterProp="children"
                                    onBlur={() => {
                                        this.setState({
                                            storageList: []
                                        });
                                    }}
                                    // onSearch={this.getStorageList}
                                >
                                    {storageList.map(item => (
                                        <Option
                                            key={item.id}
                                            title={item.storeroomName}
                                        >
                                            {item.storeroomName}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0473
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('status', {
                            rules: [],
                            initialValue: ''
                        })(
                            <Select
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            >
                                <Option value="">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0283
                                    )}
                                </Option>
                                <Option value="已激活" key="1">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0273
                                    )}
                                </Option>
                                <Option value="未激活" key="0">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0274
                                    )}
                                </Option>
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0223
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('userProperty', {
                            rules: [],
                            initialValue: ''
                        })(
                            <Select
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            >
                                <Option value="">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0283
                                    )}
                                </Option>
                                <Option value="内部用户" key="CompanyUser">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0589
                                    )}
                                </Option>
                                <Option value="外部用户" key="OutUser">
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0006
                                    )}
                                </Option>
                            </Select>
                        )}
                    </Form.Item>
                </Form>
                <div>
                    <Button type="primary" onClick={this.exportExchange}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0029
                        )}
                    </Button>
                    <Button
                        type="primary"
                        className="Right"
                        onClick={this.search}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0481
                        )}
                    </Button>
                    <Button
                        type="primary"
                        className="Right mRight8"
                        onClick={this.reset}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0018
                        )}
                    </Button>
                </div>
            </BoxDiv>
        );
    }
}

export default searchForm;
