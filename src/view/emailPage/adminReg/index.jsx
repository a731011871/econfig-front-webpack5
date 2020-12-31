
import React from 'react';
import md5 from 'blueimp-md5';
import { clearAllCache } from 'utils/utils';
import urls, { getQueryString, parseApiUrl } from 'utils/urls';
import { validatorPassWord, doPwdStrategy, validatorName } from 'utils/asyncSingleValidator';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { Form, Col, Button, Input, message, Modal } from 'antd';
import { universalform } from 'src/component/universalForm';

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
};
@Form.create()
class AdminReg extends React.PureComponent {

    state = {
        verificationNum: 60,
        verificationDisabled: false,
        buttonLoading: false,
        strategy: {}, // 密码规则
        languageList: [],
        positionList: [],
        listOrgan: [],
    }

    async componentWillMount() {
        const url = window.location.href;
        const tenantId = getQueryString('tenantId', url) || '';
        const { accountName = '' } = this.props.userInfo;
        if(!accountName) {
            this.FormElement['accountName'].disabled = false;
        }else {
            this.FormElement['accountName'].disabled = true;
            this.FormElement['accountName'].rules = [];
        }
        try{
            const originPositionList = await $http.post(urls.getDictItemByDictTypeNameNologin, {
                dictTypeName: '用户职位',
                refId: tenantId,
                refType: 'tenant'
            }) || [];
            const originLanguageList = await $http.get(urls.getLanguages);
            const originListOrgan = await $http.get(parseApiUrl(urls.getListOrgan, {
                tenantId
            })) || [];
            const strategy = await $http.get(urls.doPwdStrategyGetByTenantId, {
                tenantId
            }) || {};
            const positionList = originPositionList.map(item => {
                return {
                    name: item.name,
                    value: item.id
                };
            }) || [];
            const listOrgan = originListOrgan.map(item => {
                return {
                    name: item.organizeName,
                    value: item.id
                };
            });
            const languageList = originLanguageList.map(
                item => {
                    return {
                        name: item.name,
                        value: item.locale
                    };
                }
            );
            this.setState({languageList, positionList, strategy, listOrgan});
        }catch(e) {
            message.error(e.message);
        }
    }

    FormElement = {
        userName: {
            key: 'userName',
            label: '姓名',
            type: 'input',
            size: 'large',
            require: true,
            span: 24,
            customFormItemLayout: formItemLayout,
            maxLength: 50,
            rules: [
                {
                    pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\._-]*$/,
                    message: '姓名只能输入汉字，字母，数字，“-”“_”“.”'
                },
            ]
        },
        accountName: {
            key: 'accountName',
            label: '用户名',
            type: 'input',
            require: true,
            size: 'large',
            span: 24,
            validateTrigger: 'onBlur',
            validateFirst: true,
            customFormItemLayout: formItemLayout,
            maxLength: 50,
            rules: [
                {
                    pattern: /^[a-zA-Z0-9@._-]*$/,
                    message: '用户名只能输入字母，数字，“-”，“_”，“.”，“@”'
                }, 
                {
                    validator: validatorName,
                }
            ],
        },
        accountPswd: {
            key: 'accountPswd',
            label: '密码',
            type: 'password',
            size: 'large',
            customFormItemLayout: formItemLayout,
            require: true,
            span: 24,
            maxLength: 150,
        },
        accountPswdTo: {
            key: 'accountPswdTo',
            label: '确认密码',
            type: 'password',
            size: 'large',
            require: true,
            customFormItemLayout: formItemLayout,
            span: 24,
            maxLength: 150
        },
        department: {
            key: 'department',
            label: '部门',
            type: 'single_dropdown',
            size: 'large',
            require: true,
            customFormItemLayout: formItemLayout,
            span: 24,
            maxLength: 150
        },
        position: {
            key: 'position',
            label: '职位',
            type: 'single_dropdown',
            size: 'large',
            customFormItemLayout: formItemLayout,
            span: 24,
            maxLength: 150
        },
        jobNumber: {
            key: 'jobNumber',
            label: '工号',
            type: 'input',
            customFormItemLayout: formItemLayout,
            size: 'large',
            span: 24,
            maxLength: 150
        },
        areas: {
            key: 'areas',
            label: '所在地区',
            type: 'areaselect',
            size: 'large',
            require: true,
            span: 24,
            customFormItemLayout: formItemLayout
        },
        address: {
            key: 'address',
            label: '详细地址',
            type: 'input',
            size: 'large',
            span: 24,
            customFormItemLayout: formItemLayout,
            maxLength: 150
        },
        languageType: {
            key: 'languageType',
            label: '语言',
            size: 'large',
            require: true,
            customFormItemLayout: formItemLayout,
            type: 'single_dropdown',
            onSearch: this.onCroSearch,
            value: '',
            span: 24,
        },
        timeZone: {
            key: 'timeZone',
            label: '时区',
            size: 'large',
            type: 'single_dropdown',
            customFormItemLayout: formItemLayout,
            onSearch: this.onCroSearch,
            value: '',
            span: 24,
        },
        mobile: {
            key: 'mobile',
            label: '手机',
            size: 'large',
            customFormItemLayout: formItemLayout,
            type: 'phone',
            require: true,
            span: 24
        },
        verificationCode: {
            key: 'verificationCode',
            label: '验证码',
            customFormItemLayout: formItemLayout,
            type: 'input',
        }
    }

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { getFieldDecorator } = this.props.form;
        const { verificationNum, verificationDisabled, languageList, positionList, strategy, listOrgan } = this.state;
        const FormElements = Object.keys(this.FormElement);
        const timeZones = [
            {
                name:'UTC(都柏林)',
                value: '0',
            },
            {
                name:'UTC+1(罗马)',
                value: '+1',
            },
            {
                name:'UTC+2(安曼)',
                value: '+2',
            },
            {
                name:'UTC+3(莫斯科)',
                value: '+3',
            },
            {
                name:'UTC+4(巴库)',
                value: '+4',
            },
            {
                name:'UTC+5(塔什干)',
                value: '+5',
            },
            {
                name:'UTC+6(阿斯塔纳)',
                value: '+6',
            },
            {
                name:'UTC+7(曼谷)',
                value: '+7',
            },
            {
                name:'UTC+8(北京)',
                value: '+8',
            },
            {
                name:'UTC+9(东京)',
                value: '+9',
            },
            {
                name:'UTC+10(悉尼)',
                value: '+10',
            },
            {
                name:'UTC+11(所罗门群岛)',
                value: '+11',
            },
            {
                name:'UTC+12(斐济)',
                value: '+12',
            },
            {
                name:'UTC-1(亚速尔群岛)',
                value: '-1',
            },
            {
                name:'UTC-2(协调世界时间-02)',
                value: '-2',
            },
            {
                name:'UTC-3(格陵兰)',
                value: '-3',
            },
            {
                name:'UTC-4(圣地亚哥)',
                value: '-4',
            },
            {
                name:'UTC-5(切图马尔)',
                value: '-5',
            },
            {
                name:'UTC-6(中美洲)',
                value: '-6',
            },
            {
                name:'UTC-7(亚利桑那)',
                value: '-7',
            },
            {
                name:'UTC-8(下加利福尼亚州)',
                value: '-8',
            },
            {
                name:'UTC-9(阿拉斯加)',
                value: '-9',
            },
            {
                name:'UTC-10(夏威夷)',
                value: '-10',
            },
            {
                name:'UTC-11(协调世界时-11)',
                value: '-11',
            },
            {
                name:'UTC-12(国际日期变更线西)',
                value: '-12',
            },
        ];
       
        this.FormElement['timeZone'].selectList = timeZones;
        this.FormElement['languageType'].selectList = languageList;
        this.FormElement['position'].selectList = positionList;
        this.FormElement['department'].selectList = listOrgan;

        this.FormElement['accountPswd'].rules = {
            validator: doPwdStrategy(strategy, this.props.form),
        };
        this.FormElement['accountPswdTo'].rules = {
            validator: validatorPassWord(this.props.form),
        };

        return FormElements.map(
            item => {
                if(item === 'verificationCode') {
                    return (
                        <Col span={24} key={'verificationCode'}>
                            <Form.Item
                                {...formItemLayout}
                                label={'验证码'}
                            >
                                {getFieldDecorator(this.FormElement[item].key, 
                                    Object.assign({}, {
                                        rules: [
                                            {
                                                required: true,
                                                message: `${this.FormElement[item].label}是必填项!`,
                                            },
                                        ],
                                    })
                                )(
                                    <div>
                                        <Col span={15}>
                                            <Input size="large" className="input-verification" placeholder={`请输入${this.FormElement[item].label}`} rows={4} />
                                        </Col>
                                        <Col span={9}>
                                            <Button className="botton-verification" disabled={verificationDisabled} onClick={this.onVerification} size="large">{verificationNum === 60 ? '发送验证码' : `${verificationNum}秒`}</Button>
                                        </Col>
                                    </div>
                                
                                )}
                            </Form.Item>
                        </Col>
                    );
                }else {
                    return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item]});
                }
            }
        );
    }

    onVerification = debounce(async () => {
        let { verificationNum } = this.state;
        // const url = window.location.href;
        // const tenantId = getQueryString('tenantId', url) || '';
        const { getFieldValue } = this.props.form;
        const mobile = getFieldValue('mobile') || {};
        // const email = getQueryString('email', url) || '';
        if(!/^[0-9]*$/.test(mobile.phone)) {
            message.info('请输入正确的手机号');
            return;
        }
        // try {
        //     await $http.get(parseApiUrl(urls.checkMobileIsValid, {
        //         mobile
        //     }), { email });
        // } catch (e) {
        //     message.info(e.message);
        //     return;
        // }
        
        try{
            // await $http.post(urls.verifications, {
            //     existUser: false,
            //     sendTarget: mobile,
            //     sendWay: 'sms',
            //     tenantId
            // });
            await $http.post(urls.getCodeGlobal, {
                target: mobile.phone,
                sendMode: 1,
                sendWay: 'sms',
                areaCode: mobile.code.split('-')[0]
            });
            message.success('发送成功!');
            const timer = setInterval(() => {
                this.setState({ 
                    verificationNum: (--verificationNum),
                    verificationDisabled: true,
                }, () => {
                    if (verificationNum === 0) {
                        clearInterval(timer);
                        this.setState({
                            verificationNum: 60,
                            verificationDisabled: false,
                        });
                    }
                });
            }, 1000);
        }catch(e) {
            message.info(e.message);
            return;
        }
    }, 300)

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const url = window.location.href;
                const inviteId = getQueryString('inviteId', url) || '';
                const userProperty = getQueryString('inviteFrom', url) || '';
                const tenantId = getQueryString('tenantId', url) || '';
                const email = getQueryString('email', url) || '';
                const [countryId, provinceId, cityId, county] = [values.areas[0] || '', values.areas[1] || '', values.areas[2] || '', values.areas[3] || ''];
                console.log('Received values of form: ', {
                    ...values,
                    inviteId,
                    userProperty,
                    tenantId,
                    email,
                    countryId,
                    provinceId,
                    cityId,
                    county
                });
                this.setState({buttonLoading: true});
                delete values.accountPswdTo;
                delete values.areas;
                try{
                    await $http.post(urls.createTenantUserByInvite, {
                        ...values,
                        inviteId,
                        userProperty,
                        tenantId,
                        email,
                        countryId,
                        provinceId,
                        cityId,
                        county,
                        mobile: values.mobile && values.mobile.phone,
                        areaCode: values.mobile && values.mobile.code && values.mobile.code.split('-')[0],
                        accountPswd: md5(values.accountPswd)
                    });
                    Modal.success({
                        title: '提示',
                        content: '注册成功!',
                        okText: '确定',
                        onOk(){
                            clearAllCache();
                            window.location.href = '/login';
                        }
                    });
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({buttonLoading: false});
                }
            }
        });
    }, 500)

    render() {
        const { buttonLoading } = this.state;
        const { accountName = '' } = this.props.userInfo;

        return (
            <React.Fragment>
                <div className="email-page-content-con">
                    <div className="email-page-content-title">用户信息完善</div>
                </div>
                <div className="email-page-content-form">
                    <Form>
                        {
                            this.getFormItem({timeZone: '+8', languageType: 'zh_CN', accountName})
                        }
                        <Col span={6} />
                        <Col span={18} className="email-page-content-button">
                            <Button type="primary" loading={buttonLoading} size="large" onClick={this.handleSubmit}>确定</Button>
                        </Col>
                    </Form>
                </div>
            </React.Fragment>
            
        );
    }

}

export default AdminReg;