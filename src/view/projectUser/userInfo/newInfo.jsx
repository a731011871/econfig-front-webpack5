import React from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    Select,
    Row,
    Input,
    message,
    Icon,
    Modal,
    Tooltip
} from 'antd';
import { injectIntl } from 'react-intl';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { timeZones } from 'utils/utils';
import { getBasicInfoAreaValues } from 'utils/functions';
import AreaSelect from 'component/areaSelect';
import { i18nMessages } from 'src/i18n';
import { uniq } from 'lodash';
import { getRequiredRule, isEmail } from 'utils/validateRules';

const TextArea = Input.TextArea;
const Option = Select.Option;
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1342126_c77run85f1u.js'
});

const { confirm } = Modal;

@injectIntl
class UserInfo extends React.Component {
    static propTypes = {
        disabledInput: PropTypes.bool,
        userInfo: PropTypes.object,
        setUserInfo: PropTypes.func,
        toggleLoading: PropTypes.func,
        changeSaveDisabled: PropTypes.func
    };

    static contextTypes = {
        globalization: PropTypes.boolean
    };

    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
            positionList: [],
            email: ''
        };
    }

    getData = async (userInfo, email) => {
        try {
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            const languageList = await $http.get(urls.getLanguages);
            const countryList = await $http.get(urls.getCountry);
            this.setState(
                { positionList, languageList, countryList, userInfo, email },
                () => {
                    this.props.form.setFieldsValue({
                        ...userInfo,
                        email,
                        area: getBasicInfoAreaValues(userInfo)
                    });
                }
            );
        } catch (e) {
            message.error(e.message);
        }
    };

    handleBlur = async (rule, value, callback) => {
        this.props.changeSaveDisabled();
        const { setFieldsValue } = this.props.form;
        const { formatMessage } = this.props.intl;
        if (value) {
            // if (value && value !== this.state.email) {
            //     const emails = value.split(';').filter(item => item);
            const emails = uniq(
                value.match(/[\w-]+(\.[\w-]+)*\.?@[\w-]+(\.[\w-]+)+/g)
            );
            try {
                const errorEmails = [];
                this.props.toggleLoading();
                emails.forEach(item => {
                    if (!isEmail(item)) {
                        errorEmails.push(item);
                        // throw new Error(
                        //     this.props.intl
                        //         .formatMessage(i18nMessages.ECONFIG_FRONT_A0327)
                        //         .replace('xxx', item)
                        // );
                    }
                });
                /**
                 * 对输入的邮箱进行检测*/
                const data =
                    (await $http.post(urls.checkEmailToProjectUser, emails)) ||
                    {};
                /**
                 * 如果输入一个用户邮箱，此用户已存在且可被邀请，接口返回此用户信息，获取用户的授权和详细信息
                 * 如果输入的邮箱中有不可用或者格式不对的邮箱，出弹层提示，自动删除不合格邮箱
                 * */
                if (
                    data &&
                    data.userId &&
                    (!data.errEmails || !data.errEmails.length)
                ) {
                    this.getData(data, value);
                    this.props.setUserInfo(data);
                    setFieldsValue({ emails: emails.join(';') });
                } else {
                    this.setState({ userInfo: {}, email: value });
                    this.props.setUserInfo({});
                    // this.props.form.setFieldsValue({ email: value });
                    // 4.7新增
                    if (
                        errorEmails.length > 0 ||
                        (data.errEmails && data.errEmails.length > 0)
                    ) {
                        confirm({
                            title: `${formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0423
                            )}?`,
                            content: (
                                <div>
                                    {data.errEmails &&
                                        data.errEmails.length > 0 && (
                                        <React.Fragment>
                                            <h5
                                                style={{
                                                    margin: '20px 0 0 0'
                                                }}
                                            >
                                                {formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0424
                                                )}
                                                    :
                                            </h5>
                                            <div>
                                                {data.errEmails &&
                                                        data.errEmails.map(
                                                            (item, index) => (
                                                                <div
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </div>
                                                            )
                                                        )}
                                            </div>
                                        </React.Fragment>
                                    )}
                                    {errorEmails.length > 0 && (
                                        <React.Fragment>
                                            <h5
                                                style={{ margin: '20px 0 0 0' }}
                                            >
                                                {formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0425
                                                )}
                                                :
                                            </h5>
                                            <div>
                                                {errorEmails.map(
                                                    (item, index) => (
                                                        <div key={index}>
                                                            {item}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </React.Fragment>
                                    )}
                                </div>
                            ),
                            cancelText: this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0281
                            ),
                            okText: this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0279
                            ),
                            onOk() {
                                const rightEmails =
                                    emails
                                        .filter(
                                            item =>
                                                data.errEmails &&
                                                data.errEmails.indexOf(item) <
                                                    0 &&
                                                errorEmails.indexOf(item) < 0
                                        )
                                        .join(';') || [];
                                setFieldsValue({ emails: rightEmails });
                            }
                        });
                    } else {
                        setFieldsValue({ emails: emails.join(';') });
                    }
                    if (errorEmails.length > 0) {
                        throw new Error(
                            `${errorEmails.join(';')}${formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0426
                            )}`
                        );
                    }
                    if (data.errEmails && data.errEmails.length > 0) {
                        throw new Error(
                            `${data.errEmails &&
                                data.errEmails.join(';')}${formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0427
                            )}`
                        );
                    }
                }
            } catch (e) {
                callback(e.message);
                this.setState({ userInfo: {}, email: value });
                this.props.setUserInfo({});
            } finally {
                this.props.changeSaveDisabled();
                this.props.toggleLoading();
            }
        } else if (!value) {
            /**
             * 删除已输入的邮箱，要吧前一次获取的人员信息清空
             * */
            this.setState({ userInfo: {}, email: '' });
            this.props.setUserInfo({});
            this.props.form.resetFields();
            this.props.changeSaveDisabled();
        }
        callback();
    };

    render() {
        const { globalization } = this.context;
        const { getFieldDecorator } = this.props.form;
        const { formatMessage } = this.props.intl;
        const rowGutter = 40;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };
        const showItem = this.state.userInfo.userId;
        return (
            <Form className="userInfoForm">
                <div className="Font18 pLeft40 mTop24 BorderBottomD pBottom15">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0150)}
                </div>
                <Row gutter={rowGutter} className="mTop20 mLeft40">
                    <Form.Item
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        label={`${formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0150
                        )}(${formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0382
                        )}${formatMessage(i18nMessages.ECONFIG_FRONT_A0495)})`}
                    >
                        {getFieldDecorator('emails', {
                            initialValue: '',
                            rules: [
                                getRequiredRule(
                                    formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0150
                                    ),
                                    formatMessage
                                ),
                                {
                                    validator: this.handleBlur
                                }
                            ],
                            validateFirst: true,
                            validateTrigger: 'onBlur'
                        })(
                            <TextArea
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0332
                                )}
                                autosize={{ minRows: 4 }}
                            />
                        )}
                    </Form.Item>
                </Row>
                {showItem && (
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
                                // )
                            ]
                        })(<Input disabled maxLength={50} />)}
                    </Form.Item>
                )}
                {showItem && !globalization && (
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0088)}
                    >
                        {getFieldDecorator('enName', {
                            initialValue: '',
                            rules: []
                        })(<Input disabled maxLength={100} />)}
                    </Form.Item>
                )}
                {showItem && [
                    <Form.Item
                        key="accountName"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0148)}
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
                        })(<Input disabled />)}
                    </Form.Item>,
                    <Form.Item
                        key="jobNumber"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0153)}
                    >
                        {getFieldDecorator('jobNumber', {
                            initialValue: '',
                            rules: []
                        })(<Input disabled maxLength={100} />)}
                    </Form.Item>,
                    <Form.Item
                        key="position"
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
                                disabled
                            >
                                {this.state.positionList.map(item => (
                                    <Option key={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>,
                    <Form.Item
                        key="languageType"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0089)}
                    >
                        {getFieldDecorator('languageType', {
                            initialValue: 'zh_CN',
                            rules: []
                        })(
                            <Select disabled>
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
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0083)}
                    >
                        {getFieldDecorator('mobile', {
                            initialValue: '',
                            rules: [
                                {
                                    pattern: /^[0-9]*$/,
                                    message: formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0404
                                    )
                                }
                            ]
                        })(<Input disabled maxLength={50} />)}
                        <Tooltip
                            placement="bottom"
                            title={
                                this.state.userInfo.isBind
                                    ? formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0429
                                    )
                                    : formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0430
                                    )
                            }
                        >
                            <IconFont
                                className={this.state.userInfo.isBind && 'Blue'}
                                type={
                                    this.state.userInfo.isBind
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
                        key="area"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0255)}
                    >
                        {getFieldDecorator('area', {
                            initialValue: [],
                            rules: []
                        })(
                            <AreaSelect
                                type={1}
                                disabled
                                placeholder={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )}
                            />
                        )}
                    </Form.Item>,
                    <Form.Item
                        key="timeZone"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0090)}
                    >
                        {getFieldDecorator('timeZone', {
                            initialValue: '',
                            rules: []
                        })(
                            <Select
                                placeholder={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0275
                                )}
                                disabled
                            >
                                {timeZones.map(item => (
                                    <Option value={item.value} key={item.value}>
                                        {this.props.intl.formatMessage(
                                            i18nMessages[item.i18nKey]
                                        )}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>,
                    <Form.Item
                        key="address"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0061)}
                    >
                        {getFieldDecorator('address', {
                            initialValue: '',
                            rules: []
                        })(<Input disabled maxLength={255} />)}
                    </Form.Item>,
                    <Form.Item
                        key="status"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0120)}
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
                    </Form.Item>
                ]}
            </Form>
        );
    }
}

export default Form.create({})(UserInfo);
