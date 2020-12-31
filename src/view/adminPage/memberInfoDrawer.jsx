import React from 'react';
import { Button, Form, message, Select } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { $http } from 'utils/http';
import { debounce, uniq } from 'lodash';
import urls from 'utils/urls';
import { fieldHasError } from 'utils/fieldHasError';
import { emailRule, getRequiredRule } from 'utils/validateRules';

import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const Option = Select.Option;
// const CheckboxGroup = Checkbox.Group;

const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
`;

@injectIntl
class MemberInfoDrawer extends React.Component {
    static propTypes = {
        saveMember: PropTypes.func,
        memberInfo: PropTypes.object,
        updateMember: PropTypes.func,
        hideDrawer: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            showSystemOptions: false, // 显示系统选择
            hasError: false, //邮箱错误信息
            emailList: [], // 模糊查询邮箱列表
            softList: [], // 系统列表
            roleList: [] // 权限列表
        };
    }

    get isEdit() {
        return !!this.props.memberInfo.id;
    }

    componentDidMount = async () => {
        const { authRoles } = this.props.memberInfo;
        try {
            const softList = await $http.get(urls.getSoftList, {
                isIncludeExpired: true
            });
            const roleList = await $http.get(
                `${urls.getRoleList}&isProjectAdmin=false`
            );
            console.log('roleList', roleList);
            this.setState({
                softList: softList || [],
                roleList: roleList || []
            });
            if (this.props.memberInfo.id) {
                if (
                    authRoles.length > 0 &&
                    authRoles.indexOf('econfig_soft_admin') > -1
                ) {
                    this.setState({ showSystemOptions: true }, () => {
                        this.props.form.setFieldsValue(this.props.memberInfo);
                    });
                } else {
                    this.props.form.setFieldsValue(this.props.memberInfo);
                }
            }
            if (!this.isEdit) {
                this.props.form.validateFields();
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    getSofts = async () => {
        this.setState({ softList: [] });
        try {
            const softList = await $http.get(urls.getFilterSoftList);
            this.setState({
                softList:
                    softList.filter(item => item.appId !== 'econfig') || []
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    handleBlur = async (rule, values, callback) => {
        const email = this.props.form.getFieldValue('inviteEmail');
        if (email && !this.props.memberInfo.id) {
            try {
                const data = await $http.get(
                    `${urls.checkEmailIsAuth}?email=${email}`
                );
                if (!data) {
                    callback('邮箱已被注册');
                }
            } catch (e) {
                callback(e.message);
                // message.error(e.message);
            }
        }
        callback();
    };

    handleFocus = () => {
        this.setState({
            hasError: false
        });
    };

    fetchEmail = debounce(async email => {
        this.setState({ data: [] });
        if (email) {
            try {
                const emailList = await $http.get(
                    `${urls.getEmailList}?email=${email}`
                );
                this.setState({
                    emailList: uniq([email].concat(emailList))
                });
            } catch (e) {
                message.error(e.message);
            }
        }
    }, 300);

    handleSubmit = e => {
        e.preventDefault();
        e.stopPropagation();
        const { form } = this.props;
        const _this = this;
        form.validateFields(error => {
            if (error) {
                return;
            }
            const dto = form.getFieldsValue();
            if (dto.authRoles.length > 0) {
                dto.authRoles = this.state.roleList.filter(
                    item => dto.authRoles.indexOf(item.id) > -1
                );
            }
            dto.inviteFrom = 'econfig';
            console.log(dto);
            _this.props.hideDrawer();
            if (_this.isEdit) {
                dto.id = this.props.memberInfo.userId;
                this.props.updateAdmin(dto);
            } else {
                this.props.addAdmin(dto);
            }
        });
    };

    render() {
        const { getFieldDecorator, getFieldsError } = this.props.form;
        const { emailList } = this.state;
        const formItemLayout = {
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        };
        return (
            <Form onSubmit={this.handleSubmit} className="memberInfoDrawerForm">
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0082
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('inviteEmail', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(
                                this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0082
                                ),
                                this.props.intl.formatMessage
                            ),
                            emailRule(
                                this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0082
                                ),
                                this.props.intl.formatMessage
                            ),
                            {
                                validator: this.handleBlur
                            }
                        ],
                        validateTrigger: 'onBlur'
                    })(
                        <Select
                            disabled={!!this.props.memberInfo.id}
                            showSearch
                            showArrow={false}
                            defaultActiveFirstOption={false}
                            filterOption={false}
                            onSearch={this.fetchEmail}
                            onFocus={this.handleFocus}
                            // onBlur={this.handleBlur}
                            notFoundContent={null}
                        >
                            {emailList.map(item => (
                                <Option key={item}>{item}</Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0256
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('authRoles', {
                        initialValue: [],
                        rules: [
                            getRequiredRule(
                                this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0256
                                ),
                                this.props.intl.formatMessage
                            )
                        ]
                    })(
                        <Select
                            options={this.state.roleList.map(item => {
                                return { label: item.roleName, value: item.id };
                            })}
                            onChange={value => {
                                this.setState(
                                    {
                                        showSystemOptions:
                                            value === 'econfig_soft_admin'
                                    },
                                    () => {
                                        this.props.form.validateFields();
                                    }
                                );
                            }}
                        >
                            {this.state.roleList.map(item => (
                                <Option key={item.id}>{item.roleName}</Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
                {this.state.showSystemOptions && (
                    <Form.Item
                        {...formItemLayout}
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0257
                        )}
                    >
                        {getFieldDecorator('appIds', {
                            initialValue: [],
                            rules: [
                                getRequiredRule(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0257
                                    ),
                                    this.props.intl.formatMessage
                                )
                            ]
                        })(
                            <Select
                                mode="multiple"
                                optionFilterProp="children"
                                onFocus={this.getSofts}
                                onBlur={() => {
                                    this.setState({ softList: [] });
                                }}
                            >
                                {this.state.softList.map(item => (
                                    <Option
                                        key={item.appId}
                                        value={item.appId}
                                        appName={item.appName}
                                    >
                                        {item.appName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                )}
                <AbsoluteDiv>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        disabled={fieldHasError(getFieldsError())}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0236
                        )}
                    </Button>
                </AbsoluteDiv>
            </Form>
        );
    }
}

export default Form.create({})(MemberInfoDrawer);
