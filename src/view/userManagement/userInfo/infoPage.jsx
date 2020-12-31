import React from 'react';
import { Form, message, Select, Input, Icon, Tooltip, TreeSelect } from 'antd';
import PropTypes from 'prop-types';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { timeZones } from 'utils/utils';
import { LoadingHoc } from 'component/LoadingHoc';
import AreaSelect from 'component/areaSelect';
import { getBasicInfoAreaValues } from 'utils/functions';
import { emailRule, getRequiredRule, isName } from 'utils/validateRules';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import { deptService } from 'src/service/deptService';

const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
// const CheckboxGroup = Checkbox.Group;
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1342126_c77run85f1u.js'
});

@injectIntl
@LoadingHoc
class UserInfo extends React.Component {
    static propTypes = {
        saveMember: PropTypes.func,
        memberInfo: PropTypes.object,
        updateMember: PropTypes.func,
        showUserList: PropTypes.func,
        edit: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {
            showSystemOptions: false, // 显示系统选择
            hasError: false, //邮箱错误信息
            accountHasError: false, //用户名错误信息
            emailList: [], // 模糊查询邮箱列表
            roleList: [], // 权限列表
            countryList: [], // 国家
            languageList: [], // 语言列表
            inputDisabled: false, // input是否禁用
            loading: true,
            systemConfig: {
                outerNetSwitch: '1'
            },
            departmentList: []
        };
    }

    get isEdit() {
        return true;
    }

    get disabledInput() {
        return !this.props.edit;
    }

    componentDidMount = async () => {
        console.log('isEdit', this.isEdit);
        this.props.toggleLoading();
        try {
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            const languageList = await $http.get(urls.getLanguages);
            const departmentList = await deptService.fetchDepartment();
            const countryList = await $http.get(urls.getCountry);
            const systemConfig = await $http.get(urls.getSystemConfig);
            // systemConfig.internationalAddress = 'http://192.168.100.67:9080';
            this.props.toggleLoading();
            console.log(systemConfig);
            this.setState({
                languageList,
                countryList,
                positionList,
                loading: false,
                departmentList,
                systemConfig
            });
            console.log(this.props.memberInfo);
            if (this.isEdit) {
                this.props.form.setFieldsValue(
                    Object.assign({}, this.props.memberInfo, {
                        area: getBasicInfoAreaValues(this.props.memberInfo)
                    })
                );
            }
            this.props.form.validateFields();
        } catch (e) {
            message.error(e.message);
        }
    };

    handleBlur = async () => {
        const email = this.props.form.getFieldValue('email');
        if (
            (!this.isEdit ||
                (this.isEdit && email !== this.props.memberInfo.email)) &&
            email
        ) {
            try {
                // const data = await $http.get(
                //     `${urls.checkEmailToOutUser}?email=${email}`
                // );
                const cfEmails =
                    (await $http.post(urls.checkEmailToOutUser, [email])) || [];
                let hasError = false;
                if (cfEmails.length > 0) {
                    hasError = true;
                }
                this.setState(
                    {
                        hasError,
                        inputDisabled: this.isEdit ? false : cfEmails.length > 0
                    },
                    () => {
                        this.props.form.validateFields(
                            ['email'],
                            { force: true },
                            err => {
                                console.log(err);
                            }
                        );
                    }
                );
            } catch (e) {
                message.error(e.message);
            }
        }
    };

    accountBlur = async (rule, values, callback) => {
        const accountName = this.props.form.getFieldValue('accountName');
        if (
            accountName &&
            this.props.edit &&
            accountName !== this.props.memberInfo.accountName
        ) {
            if (
                !/^[a-zA-Z0-9@._-]*$/.test(accountName) &&
                (!this.isEdit ||
                    (this.isEdit && !this.props.memberInfo.accountName))
            ) {
                callback(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0428
                    )
                );
            }
            try {
                const data = await $http.get(
                    `${urls.checkAccountName}?accountName=${accountName}`
                );
                if (!data) {
                    callback('用户名已存在');
                }
            } catch (e) {
                message.error(e.message);
            }
        }
        callback();
    };

    handleFocus = () => {
        this.setState({
            hasError: false
        });
    };

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        value={item.id}
                        title={item.organizeName}
                        key={item.id}
                        organType={item.organType}
                        parentId={item.parentId || ''}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    value={item.id}
                    key={item.id}
                    parentId={item.parentId || ''}
                    organType={item.organType}
                    title={item.organizeName}
                />
            );
        });

    render() {
        const { getFieldDecorator } = this.props.form;
        const showItem = this.props.memberInfo.status === '1';
        const formatMessage = this.props.intl.formatMessage;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };
        const globalization =
            (this.state.systemConfig.internationalAddress || '')
                .split(',')
                .indexOf(window.location.origin) > -1;
        return !this.state.loading ? (
            <div>
                <div className="Font18 pLeft40 mTop24 BorderBottomD pBottom15">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0009)}
                </div>
                <Form className="userInfoForm">
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0150)}
                    >
                        {/*邮箱必填需要先判断当前人员有没有邮箱，如果有的话必填，没有的话不必填*/}
                        {getFieldDecorator('email', {
                            initialValue: '',
                            rules: [
                                emailRule(
                                    formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0150
                                    ),
                                    formatMessage
                                ),
                                this.props.memberInfo.email
                                    ? getRequiredRule(
                                          formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0150
                                          ),
                                          formatMessage
                                      )
                                    : {},
                                {
                                    validator: (rule, values, callback) => {
                                        if (this.state.hasError) {
                                            return callback(
                                                this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0272
                                                )
                                            );
                                        }
                                        callback();
                                    }
                                }
                            ]
                        })(
                            <Input
                                onFocus={this.handleFocus}
                                onBlur={this.handleBlur}
                                disabled={this.disabledInput}
                                maxLength={100}
                            />
                        )}
                    </Form.Item>
                    {showItem && [
                        <Form.Item
                            key="accountName"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0148
                            )}
                        >
                            {getFieldDecorator('accountName', {
                                initialValue: '',
                                rules: [
                                    getRequiredRule(
                                        formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0148
                                        ),
                                        formatMessage
                                    ),
                                    // {
                                    //     pattern: /^[a-zA-Z0-9@._-]*$/,
                                    //     message: formatMessage(
                                    //         i18nMessages.ECONFIG_FRONT_A0428
                                    //     )
                                    // },
                                    {
                                        validator: this.accountBlur
                                    }
                                ],
                                validateFirst: true,
                                validateTrigger: 'onBlur'
                            })(
                                <Input
                                    disabled={
                                        !this.props.edit ||
                                        (this.props.edit &&
                                            this.props.memberInfo.accountName)
                                    }
                                    maxLength={100}
                                />
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="userName"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0149
                            )}
                        >
                            {getFieldDecorator('userName', {
                                initialValue: '',
                                rules: [
                                    // getRequiredRule(
                                    //     formatMessage(
                                    //         i18nMessages.ECONFIG_FRONT_A0149
                                    //     ),
                                    //     formatMessage
                                    // ),
                                    // {
                                    //     required: globalization ? false : true,
                                    //     message: formatMessage(
                                    //         i18nMessages.ECONFIG_FRONT_A0325
                                    //     ).replace(
                                    //         'xxx',
                                    //         formatMessage(
                                    //             i18nMessages.ECONFIG_FRONT_A0149
                                    //         )
                                    //     )
                                    // },
                                    {
                                        validator: (rule, value, callback) => {
                                            if (value && !isName(value)) {
                                                callback(
                                                    formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0415
                                                    )
                                                );
                                            } else if (
                                                value &&
                                                value.length > 50
                                            ) {
                                                callback(
                                                    formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0416
                                                    )
                                                );
                                            }
                                            callback();
                                        }
                                    }
                                ],
                                validateFirst: true,
                                validateTrigger: 'onBlur'
                            })(
                                <Input
                                    disabled={this.disabledInput}
                                    maxLength={50}
                                />
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="languageType"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0089
                            )}
                        >
                            {getFieldDecorator('languageType', {
                                initialValue: 'zh_CN',
                                rules: []
                            })(
                                <Select disabled={this.disabledInput}>
                                    {this.state.languageList.map(item => (
                                        <Option key={item.locale}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="mobile"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0083
                            )}
                        >
                            {getFieldDecorator('mobile', {
                                initialValue: '',
                                rules: [
                                    // {
                                    //     required: globalization ? false : this.state.systemConfig.outerNetSwitch !== '0',
                                    //     message: formatMessage(
                                    //         i18nMessages.ECONFIG_FRONT_A0325
                                    //     ).replace(
                                    //         'xxx',
                                    //         formatMessage(
                                    //             i18nMessages.ECONFIG_FRONT_A0083
                                    //         )
                                    //     )
                                    // },
                                    {
                                        pattern: /^[0-9]*$/,
                                        message: formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0404
                                        )
                                    }
                                ]
                            })(
                                <Input
                                    disabled={
                                        globalization
                                            ? this.disabledInput
                                            : this.disabledInput ||
                                              !!this.props.memberInfo.isBind
                                    }
                                    maxLength={50}
                                />
                            )}
                            <Tooltip
                                placement="bottom"
                                title={
                                    this.props.memberInfo.isBind
                                        ? formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0429
                                          )
                                        : formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0430
                                          )
                                }
                            >
                                <IconFont
                                    className={
                                        this.props.memberInfo.isBind && 'Blue'
                                    }
                                    type={
                                        this.props.memberInfo.isBind
                                            ? 'tmyl-econfig-certified'
                                            : 'tmyl-econfig-uncertified'
                                    }
                                    style={{
                                        fontSize: 16,
                                        position: 'absolute',
                                        top: 0,
                                        right: 10
                                    }}
                                />
                            </Tooltip>
                        </Form.Item>
                    ]}
                    {showItem && !globalization && (
                        <Form.Item
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0088
                            )}
                        >
                            {getFieldDecorator('enName', {
                                initialValue: '',
                                rules: []
                            })(
                                <Input
                                    disabled={this.disabledInput}
                                    maxLength={100}
                                />
                            )}
                        </Form.Item>
                    )}
                    {showItem && [
                        <Form.Item
                            key="timeZone"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0090
                            )}
                        >
                            {getFieldDecorator('timeZone', {
                                initialValue: '',
                                rules: []
                            })(
                                <Select
                                    placeholder={formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    disabled={this.disabledInput}
                                >
                                    {timeZones.map(item => (
                                        <Option
                                            value={item.value}
                                            key={item.value}
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages[item.i18nKey]
                                            )}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="area"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0255
                            )}
                        >
                            {getFieldDecorator('area', {
                                initialValue: [],
                                rules: []
                            })(
                                <AreaSelect
                                    type={1}
                                    disabled={this.disabledInput}
                                    placeholder={formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                />
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="address"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0061
                            )}
                        >
                            {getFieldDecorator('address', {
                                initialValue: '',
                                rules: []
                            })(
                                <Input
                                    disabled={this.disabledInput}
                                    maxLength={255}
                                />
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="position"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0085
                            )}
                        >
                            {getFieldDecorator('position', {
                                initialValue: '',
                                rules: []
                            })(
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.props.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                    disabled={this.disabledInput}
                                >
                                    {this.state.positionList.map(item => (
                                        <Option key={item.id}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="status"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0086
                            )}
                        >
                            {getFieldDecorator('status', {
                                initialValue: '',
                                rules: []
                            })(
                                <Select disabled>
                                    <Option key="1">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0273
                                        )}
                                    </Option>
                                    <Option key="0">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0274
                                        )}
                                    </Option>
                                </Select>
                            )}
                        </Form.Item>,
                        <Form.Item
                            key="organIds"
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0470
                            )}
                        >
                            {getFieldDecorator('organIds', {
                                initialValue: [],
                                rules: []
                            })(
                                <TreeSelect
                                    dropdownStyle={{
                                        maxHeight: 300,
                                        overflow: 'auto'
                                    }}
                                    placeholder={formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    allowClear
                                    multiple
                                    treeDefaultExpandAll
                                    disabled={this.disabledInput}
                                >
                                    {this.renderTreeNodes(
                                        this.state.departmentList
                                    )}
                                </TreeSelect>
                            )}
                        </Form.Item>
                    ]}
                </Form>
            </div>
        ) : null;
    }
}

export default Form.create({})(UserInfo);
