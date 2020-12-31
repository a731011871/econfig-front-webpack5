import React from 'react';
import {
    Form,
    message,
    Select,
    Input,
    Icon,
    Tooltip,
    TreeSelect
    // Popover
} from 'antd';
import PropTypes from 'prop-types';
import { includes } from 'lodash';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { timeZones } from 'utils/utils';
import AreaSelect from 'component/areaSelect';
import { LoadingHoc } from 'component/LoadingHoc';
import { emailRule, getRequiredRule, isName } from 'utils/validateRules';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import './index.less';
import { deptService } from 'src/service/deptService';
// import RegisteredUser from './registeredUser';

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1342126_c77run85f1u.js'
});
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
// const TextArea = Input.TextArea;
// const CheckboxGroup = Checkbox.Group;

@injectIntl
@LoadingHoc
@Form.create()
class UserInfo extends React.Component {
    static propTypes = {
        saveMember: PropTypes.func,
        memberInfo: PropTypes.object,
        deptInfo: PropTypes.object, //部门用户邀请用户，需要读取当前选择部门的organId
        updateMember: PropTypes.func,
        showUserList: PropTypes.func,
        edit: PropTypes.bool,
        isEdit: PropTypes.bool, // 页面是邀请人员还是编辑人员
        isLeader: PropTypes.string,
        // selectDepartmentId: PropTypes.string, // 当前选择的部门Id
        selectUserByEmail: PropTypes.func // 保存 根据邮箱查到的人员信息
    };

    static contextTypes = {
        globalization: PropTypes.boolean
    };

    constructor(props) {
        super(props);
        this.state = {
            showSystemOptions: false, // 显示系统选择
            accountHasError: false, //用户名错误信息
            emailList: [], // 模糊查询邮箱列表
            positionList: [], // 系统列表
            roleList: [], // 权限列表
            countryList: [], // 国家
            languageList: [], // 语言列表
            accountDisabled: false, // 用户名是否禁用
            selectUserInfo: {}, // 根据邮箱查出来的人员信息
            showItem: false,
            loading: true,
            isSamlflag: false,
            systemConfig: {
                outerNetSwitch: '1'
            },
            departmentList: [],
            visible: false // 已注册人员信息弹层
        };
    }

    get isEdit() {
        return this.props.isEdit;
    }

    get disabledInput() {
        return !this.props.edit && this.isEdit;
    }

    componentDidMount = async () => {
        this.props.toggleLoading();
        try {
            const isSamlflag = await $http.get(urls.isSamlflag);
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            const departmentList = await deptService.fetchDepartment();
            const languageList = await $http.get(urls.getLanguages);
            const systemConfig = await $http.get(urls.getSystemConfig);
            const countryList = await $http.get(urls.getCountry);
            this.props.toggleLoading();
            this.setState({
                positionList: positionList || [],
                languageList,
                countryList,
                loading: false,
                departmentList,
                systemConfig,
                isSamlflag: isSamlflag || false
            });
            if (this.isEdit) {
                this.props.form.setFieldsValue(
                    Object.assign({}, this.props.memberInfo, {
                        position: !includes(
                            positionList.map(item => item.id),
                            this.props.memberInfo.position
                        )
                            ? ''
                            : this.props.memberInfo.position
                    })
                );
                this.props.form.validateFields();
            }
            // 兼容新增部门用户时所属部门显示
            // else {
            //     this.props.form.setFieldsValue({
            //         organIds: [this.props.selectDepartmentId]
            //     });
            // }
            this.props.form.validateFields();
        } catch (e) {
            message.error(e.message);
        } finally {
        }
    };

    handleBlur = async (rule, values, callback) => {
        //邮箱失去焦点，要判断邮箱是否能查到人员，如果查到人员信息，赋值人员信息字段
        const email = this.props.form.getFieldValue('email');
        // 如果是新增人员  或者  编辑人员更改邮箱，根据邮箱获取人员信息，对信息字段进行赋值
        if (
            (!this.isEdit ||
                (this.isEdit && email !== this.props.memberInfo.email)) &&
            email
        ) {
            this.props.changeDisabledSave(true);
            // setTimeout(async () => {
            try {
                // 根据邮箱获取人员信息
                const data = await $http.get(
                    `${urls.getUserInfoByEmail}?email=${email}`
                );
                let hasError = false;
                // 如果是新增人员，且查到人员信息，赋值信息字段，但是不赋值用户属性字段。
                if (!this.isEdit && data && data.accountId) {
                    delete data.userProperty;
                    this.props.form.setFieldsValue(data);
                    this.props.selectUserByEmail(data);
                } else if (!this.isEdit && (!data || !data.accountId)) {
                    // 如果是新增人员，但是根据邮箱没有查到信息，重新
                    this.props.form.resetFields();
                    this.props.form.setFieldsValue({ email });
                    this.props.form.setFields({
                        accountName: {
                            value: '',
                            errors: [new Error()]
                        }
                        // userName: {
                        //     value: '',
                        //     errors: [new Error(this.props.intl.formatMessage(
                        //         i18nMessages.ECONFIG_FRONT_A0325
                        //     ).replace(
                        //         'xxx',
                        //         this.props.intl.formatMessage(
                        //             i18nMessages.ECONFIG_FRONT_A0081
                        //         )
                        //     ))]
                        // }
                    });
                    this.props.selectUserByEmail({ email });
                }
                if (!data || (this.isEdit && data.accountId)) {
                    hasError = true;
                }
                if (hasError) {
                    callback(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0272
                        )
                    );
                }
                this.setState({
                    selectUserInfo: data || {},
                    accountDisabled: this.isEdit
                        ? false
                        : data && data.accountName
                });
            } catch (e) {
                callback(e.message);
                // this.props.changeDisabledSave(false);
                // message.error(e.message);
            } finally {
                this.props.changeDisabledSave(false);
            }
            // }, 300);
        }
        callback();
    };

    accountBlur = async (rule, values, callback) => {
        const accountName = this.props.form.getFieldValue('accountName');
        if (accountName) {
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
                    callback(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0667
                        )
                    );
                }
            } catch (e) {
                message.error(e.message);
            }
        }
        callback();
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

    organChange = values => {
        //如果所属部门被删空，手动赋值顶级部门
        if (!values.length) {
            setTimeout(() => {
                this.props.form.setFieldsValue({
                    organIds: [this.state.departmentList[0].id]
                });
            }, 0);
        }
    };

    onRegisteredUser = data => {
        delete data.userProperty;
        this.props.form.setFieldsValue(data);
        this.props.selectUserByEmail(data);
        this.setState({
            selectUserInfo: data || {},
            visible: false
            // accountDisabled: data && data.accountName
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { isEdit } = this.props;
        // showItem 激活用户和未激活用户显示内容不同
        const showItem = this.props.memberInfo.status === '1';
        const formatMessage = this.props.intl.formatMessage;
        // const userInfo = JSON.parse(
        //     window.sessionStorage.getItem('sso_loginInfo')
        // );
        // const isCompanyAdmin = find(userInfo.userRoles, item => item.roleId === 'econfig_company_admin');
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };
        const globalization =
            (this.state.systemConfig.internationalAddress || '')
                .split(',')
                .indexOf(window.location.origin) > -1;
        console.log(globalization);
        return !this.state.loading ? (
            <div>
                <div className="Font18 pLeft40 mTop24 BorderBottomD pBottom15">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0009)}
                    {/*邀请已注册人员*/}
                    {/* &nbsp;&nbsp;&nbsp;
                    {!this.isEdit && (
                        <Popover
                            style={{ width: 500 }}
                            content={
                                <div>
                                    <RegisteredUser
                                        intl={this.props.intl}
                                        onRegisteredUser={this.onRegisteredUser}
                                        onVisibleClose={() => {
                                            this.setState({ visible: false });
                                        }}
                                    />
                                </div>
                            }
                            placement="bottomLeft"
                            trigger="click"
                            visible={this.state.visible}
                            onVisibleChange={visible =>
                                this.setState({ visible })
                            }
                        >
                            <a
                                className="Font15"
                                style={{ textDecoration: 'none' }}
                            >
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0560
                                )}
                            </a>
                        </Popover>
                    )} */}
                </div>
                <Form className="userInfoForm">
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0082)}
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
                                (isEdit && this.props.memberInfo.email) ||
                                !isEdit
                                    ? getRequiredRule(
                                          formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0082
                                          ),
                                          formatMessage
                                      )
                                    : {},
                                {
                                    validator: this.handleBlur
                                }
                            ],
                            validateFirst: true,
                            validateTrigger: 'onBlur'
                        })(
                            <Input
                                disabled={this.disabledInput}
                                maxLength={100}
                            />
                        )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0081)}
                    >
                        {getFieldDecorator('userName', {
                            initialValue: '',
                            rules: [
                                // getRequiredRule(
                                //     formatMessage(
                                //         i18nMessages.ECONFIG_FRONT_A0081
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
                                //             i18nMessages.ECONFIG_FRONT_A0081
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
                                disabled={this.disabledInput}
                                maxLength={50}
                            />
                        )}
                    </Form.Item>
                    {!globalization && (
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
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0153)}
                    >
                        {getFieldDecorator('jobNumber', {
                            initialValue: '',
                            rules: []
                        })(
                            <Input
                                disabled={this.disabledInput}
                                maxLength={100}
                            />
                        )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0085)}
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
                                    <Option key={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0089)}
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
                    </Form.Item>
                    {this.state.isSamlflag && !this.props.isEdit && (
                        <Form.Item
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
                                        (this.isEdit &&
                                            this.props.memberInfo
                                                .accountName) ||
                                        this.state.accountDisabled
                                    }
                                />
                            )}
                        </Form.Item>
                    )}
                    {showItem && [
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
                                    //     required: globalization
                                    //         ? false
                                    //         : this.state.systemConfig
                                    //             .outerNetSwitch !== '0',
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
                        </Form.Item>,
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
                                    // getRequiredRule(
                                    //     formatMessage(
                                    //         i18nMessages.ECONFIG_FRONT_A0148
                                    //     ),
                                    //     formatMessage
                                    // ),
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
                            })(<Input disabled />)}
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
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0275
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
                            key="status"
                            {...formItemLayout}
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
                        </Form.Item>,
                        <Form.Item
                            key="userProperty"
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
                                        (this.props.memberInfo.isEdit &&
                                            this.props.memberInfo.isEdit ===
                                                '0')
                                    }
                                >
                                    <Option key="CompanyUser">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0543
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
                    ]}
                    <Form.Item
                        key="organIds"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0470)}
                    >
                        {getFieldDecorator('organIds', {
                            initialValue: showItem
                                ? []
                                : [this.props.deptInfo.id],
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
                                onChange={this.organChange}
                            >
                                {this.renderTreeNodes(
                                    this.state.departmentList
                                )}
                            </TreeSelect>
                        )}
                    </Form.Item>
                </Form>
            </div>
        ) : null;
    }
}

export default UserInfo;
