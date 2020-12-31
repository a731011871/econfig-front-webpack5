import React from 'react';
import { Upload, Icon, message, Col, Input, Form, Button, Spin } from 'antd';
import { i18nMessages } from 'src/i18n';
import {injectIntl} from 'react-intl';
import { formItemLayout } from 'src/component/universalForm';
import urls from 'utils/urls';
import { encrypt } from 'utils/utils';
import { debounce } from 'lodash';
import { $http } from 'utils/http';



@injectIntl
@Form.create()
class SetTrailOs extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    state = {
        loading: false,
        buttonLoading: false,
        logoImageUrl: '',
        bannerImageUrl: '',
        logoLoading: false,
        bannerLoading: false,
        tenantInfo: {}
    }

    componentDidMount() {
        this.init();
    }

    init = async () => {
        console.log(this.props.form);
        const { setFieldsValue } = this.props.form;
        try {
            this.setState({
                loading: true
            });
            const tenantInfo = await $http.get(urls.getTenantInfo);
            this.setState({
                tenantInfo,
                logoImageUrl: tenantInfo.loginLogo,
                bannerImageUrl: tenantInfo.loginPic,
                loading: false
            });
            setFieldsValue({loginUrl: tenantInfo.loginUrl || ''});
        }catch(e) {
            message.error(e.message);
        }
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields( async (err, values) => {
            if (!err) {
                const { logoImageUrl = '', bannerImageUrl = '', tenantInfo } = this.state;
                console.log('Received values of form: ', values, logoImageUrl, bannerImageUrl);
                try {
                    this.setState({
                        buttonLoading: true
                    });
                    await $http.post(urls.updateTenantLogo, {
                        loginLogo: logoImageUrl,
                        loginPic: bannerImageUrl,
                        loginUrl: values.loginUrl || '',
                        id: tenantInfo.id,
                        tenantId: tenantInfo.tenantId
                    });
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0219));
                    this.init();
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({
                        buttonLoading: false
                    });
                }
            }
        });
    }, 500);

    validatorUrl = async (rule, value, callback) => {
        if(!value) {
            return;
        }
        try {
            const { tenantInfo } = this.state;
            if(value === tenantInfo.loginUrl) {
                callback();
            }
            const result = await $http.post(urls.isExistLoginUrl, {
                loginUrl: value
            });
            if (!result) {
                callback();
            }else {
                callback(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0365));
            }
        }catch(e) {
            message.error(e.message);
            callback('接口错误');
        }
    }

    beforeUpload = (file, maxSize) => {
        const patt = /\.(jpg|png|jpeg)$/i;
        const isImg = file.name;
        if(!patt.test(isImg)) {
            message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0308));
        }
        const isLt2M = file.size / 1024 / 1024 < maxSize;
        if (!isLt2M) {
            message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0371).replace('xx', maxSize));
        }
        return patt.test(isImg) && isLt2M;
    }

    render() {
        const { buttonLoading, logoImageUrl, bannerImageUrl, logoLoading, bannerLoading, loading } = this.state;
        const { getFieldDecorator } = this.props.form;
        const hostArr = window.location.host.split('.');
        const url = hostArr.length === 2 ? hostArr.join('.') : hostArr.slice(1).join('.');

        const logoUploadButton = (
            <div>
                <Icon type={logoLoading ? 'loading' : 'plus'} />
            </div>
        );

        const bannerUploadButton = (
            <div>
                <Icon type={bannerLoading ? 'loading' : 'plus'} />
            </div>
        );

        return (
            <Spin spinning={loading}>
                <div className="trialos-container" >
                    <Form layout="vertical">
                        <Col
                            span={24}
                        >
                            <Form.Item
                                {...formItemLayout}
                                label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0368)}
                            >   
                                {getFieldDecorator('loginUrl', { 
                                    rules: [
                                        {
                                            pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/,
                                            message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0370)
                                        },
                                        {
                                            validator: this.validatorUrl,
                                        }, 
                                    ],
                                    // validateFirst: true,
                                    validateTrigger: 'onBlur',
                                })(
                                    <Input
                                        style={{width: '300px'}}
                                        addonAfter={`.${url}`}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col
                            span={24}
                        >
                            <Form.Item
                                {...formItemLayout}
                                label={<div>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0363)} <span class="img-tipe">({this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0366)})</span></div>}
                            >   
                                <div className="uploader-card-close">
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        className="uploader-logo"
                                        showUploadList={false}
                                        beforeUpload={file => this.beforeUpload(file, 3)}
                                        customRequest={(res) => this.customRequest(res, 'logoImageUrl')}
                                    >
                                        {logoImageUrl ? <img src={logoImageUrl} alt="avatar" /> : logoUploadButton}
                                    </Upload>
                                    <Button 
                                        className="close-button" 
                                        size="small"
                                        onClick={() => {
                                            this.setState({
                                                logoImageUrl: ''
                                            });
                                        }}
                                    >
                                        删除
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>
                        <Col
                            span={24}
                        >
                            <Form.Item
                                {...formItemLayout}
                                label={<div>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0364)} <span class="img-tipe">({this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0367)})</span></div>}
                            >   
                                <div className="uploader-card-close">
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        className="uploader-card"
                                        showUploadList={false}
                                        beforeUpload={file => this.beforeUpload(file, 10)}
                                        customRequest={(res) => this.customRequest(res, 'bannerImageUrl')}
                                    >
                                        {bannerImageUrl ? <img src={bannerImageUrl} alt="avatar" /> : bannerUploadButton}
                                    </Upload>
                                    <Button 
                                        className="close-button" 
                                        size="small"
                                        onClick={() => {
                                            this.setState({
                                                bannerImageUrl: ''
                                            });
                                        }}
                                    >
                                        删除
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>
                        <Col
                            span={24}
                            style={{ textAlign: 'center', marginTop: 10 }}
                        >
                            <Button
                                loading={buttonLoading}
                                type="primary"
                                onClick={this.handleSubmit}
                            >
                                {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                            </Button>
                        </Col>
                    </Form>
                </div>
            </Spin>
        );
    }

    customRequest = (res, type) => {
        this.setState({ uploading: true });
        const sso_loginInfo = JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}');
        const formData = new FormData();

        const obj = {
            appId: 'econfig',
            fileName: res.file.name,
            contentType: res.file.type,
            tenantId: sso_loginInfo.tenantId
        };

        const str = Object.keys(obj).map(function(key){
            return `${key}=${obj[key]}`;
        }).sort().join('&');
        
        formData.append('file', res.file);
        formData.append('appId', 'econfig');
        formData.append('contentType', res.file.type);
        formData.append('fileName', res.file.name);
        formData.append('fileSize', res.file.size);
        formData.append('sign', encrypt(str));
        formData.append('tenantId', sso_loginInfo.tenantId);

        const f = res.file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            //加载图片获取图片真实宽度和高度
            const image = new Image();
            image.onload= () => {
                const width = image.width;
                const height = image.height;
                if(type === 'logoImageUrl') {
                    if(width > 700 || height > 120) {
                        message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0372));
                        return;
                    }
                } else if(type === 'bannerImageUrl') {
                    if(width > 420 || height > 460) {
                        message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0373));
                        return;
                    }
                }
        
                if(type === 'logoImageUrl') {
                    this.setState({
                        logoLoading: true
                    });
                } else if(type === 'bannerImageUrl') {
                    this.setState({
                        bannerLoading: true
                    });
                }
               
                $http.post(urls. newupload, formData).then(result => {
                    if(type === 'logoImageUrl') {
                        this.setState({
                            logoImageUrl: result.previewUrl || '',
                            logoLoading: false
                        });
                    } else if(type === 'bannerImageUrl') {
                        this.setState({
                            bannerImageUrl: result.previewUrl || '',
                            bannerLoading: false
                        });
                    }
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    this.setState({
                        logoLoading: false,
                        bannerLoading: false
                    });
                });

            };
            image.src= data;
        };
        reader.readAsDataURL(f);
    }
}

export default SetTrailOs;