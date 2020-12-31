import React from 'react';
import moment from 'moment';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { Form, Select, Button, DatePicker, Input, message, Modal } from 'antd';
import styled from 'styled-components';
import { i18nMessages } from '../../i18n';
import { debounce, pickBy } from 'lodash';

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

const formItemLayout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
};

const atcs = {
    FuncModule: 'funcModule',
    OperateAct: 'operateAct',
    OperateContent: 'operateContent',
};

@Form.create()
class searchForm extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
        appList: [],
        userList: [],
        funcModule: [],
        operateAct: [],
        operateContent: [],
    };

    isExport = false;

    componentWillMount() {
        this.getAppList();
        this.getAllUsers();
        this.searchAct('FuncModule'); // 功能模块
        this.searchAct('OperateAct'); // 操作动作
        this.searchAct('OperateContent'); // 操作内容
    }

    componentDidMount() {
        this.search();
    }

    searchAct = async (name = 'FuncModule') => {
        try {
            const funcModule = await $http.get(urls.searchAct, {
                name
            });
            this.setState({ [atcs[name]]: Object.keys(funcModule).map(i => ({id: i, name: funcModule[i]})) });
        } catch (e) {
            message.error(e.message);
        }
    }

    getAppList = async () => {
        try {
            const appList = await $http.get(urls.getFilterSoftList);
            this.setState({ appList });
        } catch (e) {
            message.error(e.message);
        }
    };

    getAllUsers = debounce(async (value = '') => {
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

    search = () => {
        this.props.form.validateFields((errors, values) => {
            if (errors) {
                return;
            }
            console.log(values);
            const params = {
                funcModule: values.funcModule?.key,
                appId: values.appId?.key,
                projectName: values.projectName,
                siteName: values.siteName,
                operateUserId: values.operateUserId?.key,
                operateContent: values.operateContent?.key,
                operateAct: values.operateAct?.key,
                operTimeFrom: moment(values.operTime[0]).format('YYYY-MM-DD'),
                operTimeTo: moment(values.operTime[1]).format('YYYY-MM-DD'),
            };
            if(this.isExport) {
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
                            const result = await $http.post(urls.exportAppTraceLog, pickBy(params, item => !!item));
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
                            message.error(e.message);
                        }
                    }
                });
            } else {
                this.props.fetch(pickBy(params, item => !!item));
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const { appList, userList, funcModule, operateAct, operateContent } = this.state;
        return (
            <BoxDiv className="search mBottom15">
                <Form>
                    <Form.Item label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0721
                        )} {...formItemLayout}
                    >
                        {getFieldDecorator('funcModule', {
                            rules: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                filterOption={(input, option) =>
                                    option.props.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            >
                                {
                                    funcModule.map(item => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                }
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
                            rules: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            >
                                {appList.map(item => (
                                    <Option key={item.appId} value={item.appId}>
                                        {item.appName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0335
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('projectName', {
                            rules: []
                        })(
                            <Input
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0241
                                )}
                            />
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0474
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('siteName', {
                            rules: []
                        })(
                            <Input
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0241
                                )}
                            />
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0046
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('operateUserId', {
                            rules: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                onSearch={this.getAllUsers}
                                filterOption={false}
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
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
                            i18nMessages.ECONFIG_FRONT_A0048
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('operateContent', {
                            rules: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                filterOption={(input, option) =>
                                    option.props.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            >
                               {
                                    operateContent.map(item => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                }
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0718
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('operateAct', {
                            rules: []
                        })(
                            <Select
                                showSearch
                                allowClear
                                labelInValue
                                filterOption={(input, option) =>
                                    option.props.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            >
                                {
                                    operateAct.map(item => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                }
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0049)} {...formItemLayout}>
                        {getFieldDecorator('operTime', {
                            rules: [],
                            initialValue: [
                                moment().subtract(1, 'year'),
                                moment()
                            ]
                        })(<RangePicker style={{ width: '100%' }} />)}
                    </Form.Item>
                </Form>
                <div>
                    <Button type="primary" onClick={() => {
                        this.isExport = true;
                        this.search();
                    }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0029
                        )}
                    </Button>
                    <Button
                        type="primary"
                        className="Right"
                        onClick={() => {
                            this.isExport = false;
                            this.search();
                        }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0481
                        )}
                    </Button>
                    <Button
                        type="primary"
                        className="Right mRight8"
                        onClick={() => {
                            this.isExport = false;
                            this.props.form.resetFields();
                            this.search();
                        }}
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
