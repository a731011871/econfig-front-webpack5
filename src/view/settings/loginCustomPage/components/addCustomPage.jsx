import React from 'react';
import { encrypt } from 'utils/utils';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { Form, Input, Select, Switch, message, Upload, Button, Icon } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';

// 只能这两个系统可以添加
const apps = ['site', 'trialos', '09'];

const appUserProperty = {
    site: ['机构用户', '申办方用户'],
    trialos: ['平台用户'],
    '09': ['机构用户', '申办方用户']
};

@Form.create()
class AddCustomPage extends React.Component {

    state = {
        buttonLoading: false,
        // 用户类型
        userTypes: [],
        // 软件列表
        softList: [], 
        // 显示登录链接
        showLinks: false,
        uploading: false,
        fileInfo: {}
    }

    componentWillMount() { 
        this.init();
    }

    init = async () => {
        try{
            // const userTypes = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('用户类型')}`) || [];
            const softList = await $http.get(urls.getSoftListFilterApp) || [];
            softList.push({
                appId: 'trialos',
                appName: 'trialOS'
            });
            this.setState({
                // userTypes,
                softList: softList.filter(item => {
                    if(apps.indexOf(item.appId) > -1) {
                        return item;
                    }
                }) || []
            });
        }catch(e){
            message.error(e.message);
        }
        
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                try{
                    const { onClose, getDatas } = this.props;
                    const { fileInfo = {} } = this.state;
                    const params = {
                        ...values,
                        appId: values.app.key,
                        appName: values.app.label,
                        isDisplay: values.isDisplay === '1' ? '1' : '0',
                        status: '0',
                    };
                    if(fileInfo.id) {
                        params.confType = 'static';
                        params.templateFileid = fileInfo.id;
                        params.templateFilename = fileInfo.fileName;
                    }else {
                        params.confType = 'react';
                    }
                    delete params.app;
                    this.setState({buttonLoading: true});
                    await $http.post(urls.loginPageConfig, params);
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262));
                    onClose();
                    getDatas();
                }catch(e){
                    message.error(e.message);
                }finally {
                    this.setState({buttonLoading: false});
                }
            }
        });
    }, 300)

    onAppSelect = (value) => {
        this.setState({
            userTypes: appUserProperty[value.key]
        });
        this.props.form.resetFields('userProperty');
    }

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const imgTyps = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'];
            const isTyps = imgTyps.indexOf(file.type) === -1 ? false : true;
            if (!isTyps) {
                message.error('上传文件的格式不正确，当前只支持zip!');
                return reject(false);
            }
            return resolve(true);                           
        });
    };

    render() {
        const { buttonLoading, userTypes, softList, showLinks, uploading, fileInfo } = this.state;
        const { getFieldDecorator } = this.props.form;

        const logoUploadButton = (
            <div>
                <Icon style={{fontSize: '20px'}} type={uploading ? 'loading' : 'plus'} />
            </div>
        );

        return (
            <Form layout="vertical">
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0437)}>
                    {getFieldDecorator('app', {
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0447),
                            },
                        ],
                    })(
                        <Select onSelect={this.onAppSelect} labelInValue={true} placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0447)}>
                            {
                                softList.map(item => <Select.Option key={item.appId}>{item.appName}</Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0433)}>
                    {getFieldDecorator('userProperty', {
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0448),
                            },
                        ],
                    })(
                        <Select placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0448)}>
                            {
                                userTypes.map((item) => <Select.Option key={item}>{item}</Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0438)}>
                    {getFieldDecorator('urlAddress', {
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0449),
                            },
                            {
                                max: 50,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '50'),
                            },
                            {
                                pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0450),
                            }
                        ],
                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0449)} addonBefore={`https://`} addonAfter={`.${document.domain.split('.').slice(-2).join('.')}`} />)}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0439)}>
                    {getFieldDecorator('appNameDiy', {
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0451),
                            },
                            {
                                max: 20,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '20'),
                            },
                        ],
                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0451)} />)}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0440)} className="mBottom0">
                    {getFieldDecorator('isDisplay', {
                    })(
                        <Switch 
                            onChange={
                                (showLinks) => {
                                    this.setState({showLinks});
                                }
                            }
                        />
                    )}
                </Form.Item>
                {
                    showLinks && (
                        <React.Fragment>
                            <div style={{border: '1px dashed #ccc', padding: '10px', borderBottom: '0px'}}>
                                <p style={{fontSize:'16px'}}>Link1:</p>
                                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0441)} className="mBottom0">
                                    {getFieldDecorator('loginUrlName1', {
                                        rules: [
                                            {
                                                max: 10,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '10'),
                                            }
                                        ],
                                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0452)} />)}
                                </Form.Item>
                                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0465)} className="mBottom0">
                                    {getFieldDecorator('loginUrl1', {
                                        rules: [
                                            {
                                                max: 500,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '500'),
                                            },
                                            {
                                                pattern: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0454),
                                            }
                                        ],
                                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0453)} />)}
                                </Form.Item>
                            </div>
                            <div style={{border: '1px dashed #ccc', padding: '10px', borderBottom: '0px'}}>
                                <p style={{fontSize:'16px'}}>Link2:</p>
                                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0441)} className="mBottom0">
                                    {getFieldDecorator('loginUrlName2', {
                                        rules: [
                                            {
                                                max: 10,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '10'),
                                            }
                                        ],
                                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0452)} />)}
                                </Form.Item>
                                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0465)} className="mBottom0">
                                    {getFieldDecorator('loginUrl2', {
                                        rules: [
                                            {
                                                max: 500,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '500'),
                                            },
                                            {
                                                pattern: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0454),
                                            }
                                        ],
                                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0453)} />)}
                                </Form.Item>
                            </div>
                            <div style={{border: '1px dashed #ccc',padding: '10px', }}>
                                <p style={{fontSize:'16px'}}>Link3:</p>
                                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0441)} className="mBottom0">
                                    {getFieldDecorator('loginUrlName3', {
                                        rules: [
                                            {
                                                max: 10,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '10'),
                                            }
                                        ],
                                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0452)} />)}
                                </Form.Item>
                                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0465)} className="mBottom0">
                                    {getFieldDecorator('loginUrl3', {
                                        rules: [
                                            {
                                                max: 500,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '500'),
                                            },
                                            {
                                                pattern: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/,
                                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0454),
                                            }
                                        ],
                                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0453)} />)}
                                </Form.Item>
                            </div>
                        </React.Fragment>
                    )
                }
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0511)} className="mBottom0"> 
                    <div className="uploader-card-close">
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="uploader-logo"
                            showUploadList={false}
                            beforeUpload={this.beforeUpload}
                            customRequest={(res) => this.customRequest(res)}
                        >
                            {fileInfo.id ? <React.Fragment><div><Icon style={{ fontSize: '20px' }}  type="file-zip" /></div>{fileInfo.fileName}</React.Fragment> : logoUploadButton}
                        </Upload>
                        <Button 
                            className="close-button" 
                            size="small"
                            onClick={() => {
                                this.setState({
                                    fileInfo: {}
                                });
                            }}
                        >
                            {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0070)}
                        </Button>
                    </div>
                </Form.Item>
                <SaveDom buttonLoading={buttonLoading} intl={this.props.intl} onHandleClick={this.handleSubmit} />
            </Form>
        );
    }

    customRequest = (res) => {
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

        this.setState({
            uploading: true
        });
       
        $http.post(urls. newupload, formData).then(result => {
            this.setState({
                fileInfo: result,
                uploading: false
            });
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            this.setState({
                uploading: false,
            });
        });
    }
}

export default AddCustomPage;