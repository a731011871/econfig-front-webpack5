import React from 'react';
import {
    Form,
    message,
    Select,
    Row,
    Col,
    Input,
    Icon,
    Tooltip,
    TreeSelect,
    Modal
} from 'antd';
import PropTypes from 'prop-types';
import { includes } from 'lodash';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import { timeZones } from 'utils/utils';
import AreaSelect from 'component/areaSelect';
import { LoadingHoc } from 'component/LoadingHoc';
import { emailRule, getRequiredRule, isName } from 'utils/validateRules';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import { deptService } from 'src/service/deptService';
import './index.less';

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1342126_c77run85f1u.js'
});
const TreeNode = TreeSelect.TreeNode;
const Option = Select.Option;
const confirm = Modal.confirm;
// const TextArea = Input.TextArea;
// const CheckboxGroup = Checkbox.Group;

@injectIntl
@LoadingHoc
@Form.create()
class UserInfo extends React.Component {
    static propTypes = {
        saveMember: PropTypes.func,
        memberInfo: PropTypes.object,
        operateData: PropTypes.object,
        edit: PropTypes.bool,
        selectUserByEmail: PropTypes.func, // 保存 根据邮箱查到的人员信息
        changeUserInfo: PropTypes.func // 更改禁用状态，锁定状态后手动更改人员信息字段
    };

    constructor(props) {
        super(props);
        this.state = {
            showSystemOptions: false, // 显示系统选择
            accountHasError: false, //用户名错误信息
            emailList: [], // 模糊查询邮箱列表
            positionList: [], // 系统列表
            departmentList: [], // 部门列表
            roleList: [], // 权限列表
            countryList: [], // 国家
            languageList: [], // 语言列表
            accountDisabled: true, // 用户名是否禁用
            selectUserInfo: {}, // 根据邮箱查出来的人员信息
            showItem: false,
            loading: true
        };
    }

    get disabledInput() {
        return !this.props.edit;
    }

    get editPlatformUser() {
        // 1-是 0-否 是否可以编辑平台信息(用户名、邮箱地址、手机号、密码、姓名、英文名、语言、区域、详细地址、时区、是否锁定、是否禁用)
        return this.props.operateData.isEditPlatformUser === '0';
    }

    get editTenantUser() {
        // 1-是 0-否 是否可以编辑租户信息(身份标签标记（内部员工、外部用户）、所属部门（可以多个）、职位、工号、激活状态)
        return this.props.operateData.isEditTenantUser === '0';
    }

    componentDidMount = async () => {
        this.props.toggleLoading();
        try {
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            const departmentList = await deptService.fetchDepartment();
            const languageList = await $http.get(urls.getLanguages);
            const countryList = await $http.get(urls.getCountry);
            this.props.toggleLoading();
            this.setState({
                positionList: positionList || [],
                languageList,
                countryList,
                departmentList,
                loading: false
            });
            this.props.form.setFieldsValue(
                Object.assign({}, this.props.memberInfo, {
                    position: !includes(
                        positionList.map(item => item.id),
                        this.props.memberInfo.position
                    )
                        ? ''
                        : this.props.memberInfo.position,
                    // userProperty:
                    //     this.props.memberInfo.userProperty === 'TMUser'
                    //         ? ''
                    //         : this.props.memberInfo.userProperty
                })
            );
            this.props.form.validateFields();
            this.props.form.validateFields();
        } catch (e) {
            message.error(e.message);
        } finally {
        }
    };

    handleBlur = async (rule, values, callback) => {
        const email = this.props.form.getFieldValue('email');
        if (email !== this.props.memberInfo.email && email) {
            try {
                await $http.get(`${urls.checkEmailIsExist}?email=${email}`);
            } catch (e) {
                callback(e.message);
                // message.error(e.message);
            }
        }
        callback();
    };

    // accountBlur = async (rule, values, callback) => {
    //     const accountName = this.props.form.getFieldValue('accountName');
    //     if (accountName) {
    //         if (
    //             !/^[a-zA-Z0-9@._-]*$/.test(accountName) &&
    //             !this.props.memberInfo.accountName
    //         ) {
    //             callback(
    //                 this.props.intl.formatMessage(
    //                     i18nMessages.ECONFIG_FRONT_A0428
    //                 )
    //             );
    //         }
    //         try {
    //             const data = await $http.get(
    //                 `${urls.checkAccountName}?accountName=${accountName}`
    //             );
    //             if (!data) {
    //                 callback('用户名已经存在');
    //             }
    //         } catch (e) {
    //             message.error(e.message);
    //         }
    //     }
    //     callback();
    // };

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

    showRenSendConfirm = () => {
        const _this = this;
        const { email, userId } = this.props.memberInfo;
        const { source } = this.props.operateData;
        confirm({
            title: _this.props.intl
                .formatMessage(i18nMessages.ECONFIG_FRONT_A0234)
                .replace('xx', email),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    await $http.get(`${urls.cspResendInvite}`, {
                        email,
                        userId,
                        source
                    });
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0235
                        )
                    );
                } catch (e) {
                    message.error(e.message);
                }
            },
            onCancel() {}
        });
    };

    changeEnableConfirm = () => {
        const _this = this;
        const { enabled, userId, email } = this.props.memberInfo;
        confirm({
            title: _this.props.intl
                .formatMessage(
                    enabled === '1'
                        ? i18nMessages.ECONFIG_FRONT_A0500
                        : i18nMessages.ECONFIG_FRONT_A0501
                )
                .replace('xx', email),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    if (enabled === '1') {
                        await $http.put(
                            parseApiUrl(urls.cspDisableUser, { userId })
                        );
                    } else {
                        await $http.put(
                            parseApiUrl(urls.cspEnableUser, { userId })
                        );
                    }
                    message.success(
                        this.props.intl.formatMessage(
                            enabled === '1'
                                ? i18nMessages.ECONFIG_FRONT_A0232
                                : i18nMessages.ECONFIG_FRONT_A0231
                        )
                    );
                    _this.props.changeUserInfo({
                        ..._this.props.memberInfo,
                        enabled: enabled === '1' ? '0' : '1'
                    });
                    _this.props.form.setFieldsValue({
                        enabled: enabled === '1' ? '0' : '1'
                    });
                } catch (e) {
                    message.error(e.message);
                }
            },
            onCancel() {}
        });
    };

    changeLockedConfirm = () => {
        const _this = this;
        const { email, userId } = this.props.memberInfo;
        confirm({
            title: _this.props.intl
                .formatMessage(i18nMessages.ECONFIG_FRONT_A0502)
                .replace('xx', email),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    await $http.put(
                        parseApiUrl(urls.cspUnLocklUser, { userId })
                    );
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0422
                        )
                    );
                    _this.props.changeUserInfo({
                        ..._this.props.memberInfo,
                        locked: '0'
                    });
                    _this.props.form.setFieldsValue({ locked: '0' });
                } catch (e) {
                    message.error(e.message);
                }
            },
            onCancel() {}
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const rowGutter = 40;
        const formatMessage = this.props.intl.formatMessage;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };
        return !this.state.loading ? (
            <div>
                <div className="Font18 pLeft40 mTop24 BorderBottomD pBottom15">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0009)}
                </div>
                <Form className="userInfoForm">
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0082
                                )}
                            >
                                {/*邮箱必填需要先判断当前人员有没有邮箱，如果有的话必填，没有的话不必填*/}
                                {getFieldDecorator('email', {
                                    initialValue: '',
                                    rules: [
                                        emailRule(
                                            formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0082
                                            ),
                                            formatMessage
                                        ),
                                        this.props.memberInfo.email ? getRequiredRule(
                                            formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0082
                                            ),
                                            formatMessage
                                        ) : {},
                                        {
                                            validator: this.handleBlur
                                        }
                                    ],
                                    validateFirst: true,
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
                                        maxLength={100}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0081
                                )}
                            >
                                {getFieldDecorator('userName', {
                                    initialValue: '',
                                    rules: [
                                        // {
                                        //     required: this.props.memberInfo
                                        //         .userName,
                                        //     message: this.props.intl
                                        //         .formatMessage(
                                        //             i18nMessages.ECONFIG_FRONT_A0325
                                        //         )
                                        //         .replace(
                                        //             'xxx',
                                        //             this.props.intl.formatMessage(
                                        //                 i18nMessages.ECONFIG_FRONT_A0081
                                        //             )
                                        //         )
                                        // },
                                        {
                                            validator: (
                                                rule,
                                                value,
                                                callback
                                            ) => {
                                                if (value && !isName(value)) {
                                                    callback(
                                                        formatMessage(
                                                            i18nMessages.ECONFIG_FRONT_A0415
                                                        )
                                                    );
                                                } else if (value && value.length > 50) {
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
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
                                        maxLength={50}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
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
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
                                        maxLength={100}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0153
                                )}
                            >
                                {getFieldDecorator('jobNumber', {
                                    initialValue: '',
                                    rules: []
                                })(
                                    <Input
                                        disabled={
                                            this.disabledInput ||
                                            this.editTenantUser
                                        }
                                        maxLength={100}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
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
                                                .indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                        disabled={
                                            this.disabledInput ||
                                            this.editTenantUser
                                        }
                                    >
                                        {this.state.positionList.map(item => (
                                            <Option key={item.id}>
                                                {item.name}
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0089
                                )}
                            >
                                {getFieldDecorator('languageType', {
                                    initialValue: 'zh_CN',
                                    rules: []
                                })(
                                    <Select
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
                                    >
                                        {this.state.languageList.map(item => (
                                            <Option key={item.locale}>
                                                {item.name}
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0083
                                )}
                            >
                                {getFieldDecorator('mobile', {
                                    initialValue: '',
                                    rules: [
                                        // {
                                        //     required: this.props.memberInfo
                                        //         .mobile,
                                        //     message: this.props.intl
                                        //         .formatMessage(
                                        //             i18nMessages.ECONFIG_FRONT_A0325
                                        //         )
                                        //         .replace(
                                        //             'xxx',
                                        //             this.props.intl.formatMessage(
                                        //                 i18nMessages.ECONFIG_FRONT_A0083
                                        //             )
                                        //         )
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
                                            this.disabledInput ||
                                            !!this.props.memberInfo.isBind ||
                                            this.editPlatformUser
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
                                            this.props.memberInfo.isBind &&
                                            'Blue'
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
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0148
                                )}
                            >
                                {getFieldDecorator('accountName', {
                                    initialValue: '',
                                    rules: []
                                })(<Input disabled />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
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
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
                                        placeholder={formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0051
                                        )}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
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
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
                                        maxLength={255}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
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
                                        placeholder={this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0275
                                        )}
                                        disabled={
                                            this.disabledInput ||
                                            this.editPlatformUser
                                        }
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
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                wrapperCol={{ span: 12 }}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0120
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
                                {this.props.memberInfo.status !== '1' &&
                                    !this.editTenantUser && (
                                    <a
                                        className="InlineBlock"
                                        style={{
                                            position: 'absolute',
                                            right: -75
                                        }}
                                        onClick={this.showRenSendConfirm}
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0147
                                        )}
                                    </a>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0223
                                )}
                            >
                                {getFieldDecorator('userProperty', {
                                    initialValue: '',
                                    rules: []
                                })(
                                    <Select
                                        disabled={
                                            this.disabledInput ||
                                            this.editTenantUser ||
                                            this.props.memberInfo
                                                .userProperty === 'TMUser' ||
                                            this.props.memberInfo
                                                .userProperty === 'CompanyUser'
                                        }
                                    >
                                        <Option key="CompanyUser">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0544
                                            )}
                                        </Option>
                                        <Option key="OutUser">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0006
                                            )}
                                        </Option>
                                        {this.props.memberInfo.userProperty ===
                                            'TMUser' && (
                                            <Option key="TMUser" disabled>
                                                {/* {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0547
                                            )} */}
                                                {this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0006
                                                )}
                                            </Option>
                                        )}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
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
                                        disabled={
                                            this.disabledInput ||
                                            this.editTenantUser
                                        }
                                    >
                                        {this.renderTreeNodes(
                                            this.state.departmentList
                                        )}
                                    </TreeSelect>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                wrapperCol={{ span: 12 }}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0497
                                )}
                            >
                                {getFieldDecorator('enabled', {
                                    initialValue: '',
                                    rules: []
                                })(
                                    <Select disabled>
                                        <Option key="1">正常</Option>
                                        <Option key="0">已禁用</Option>
                                    </Select>
                                )}
                                {!this.editTenantUser && (
                                    <a
                                        className="InlineBlock"
                                        style={{
                                            position: 'absolute',
                                            right: -75
                                        }}
                                        onClick={this.changeEnableConfirm}
                                    >
                                        {this.props.intl.formatMessage(
                                            this.props.memberInfo.enabled ===
                                                '1'
                                                ? i18nMessages.ECONFIG_FRONT_A0143
                                                : i18nMessages.ECONFIG_FRONT_A0144
                                        )}
                                    </a>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                {...formItemLayout}
                                wrapperCol={{ span: 12 }}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0498
                                )}
                            >
                                {getFieldDecorator('locked', {
                                    initialValue: '',
                                    rules: []
                                })(
                                    <Select disabled>
                                        <Option key="1">已锁定</Option>
                                        <Option key="0">正常</Option>
                                    </Select>
                                )}
                                {this.props.memberInfo.locked === '1' &&
                                    !this.editPlatformUser && (
                                    <a
                                        className="InlineBlock"
                                        style={{
                                            position: 'absolute',
                                            right: -75
                                        }}
                                        onClick={this.changeLockedConfirm}
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0499
                                        )}
                                    </a>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        ) : null;
    }
}

export default UserInfo;
