import React from 'react';
import { encrypt } from 'utils/utils';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { Form, message, Upload, Button, Icon } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';

@Form.create()
class UploadTemlate extends React.Component {

    constructor(props) {
        super(props);
        const { record } = this.props;
        this.state = {
            buttonLoading: false,
            uploading: false,
            fileInfo: {
                id: record.templateFileid,
                fileName: record.templateFilename,
            }
        };
    }

    componentWillMount() { 
        console.log(this.props.record);
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                try{
                    console.log(values);
                    const { onClose, getDatas, record } = this.props;
                    const { fileInfo = {} } = this.state;
                    const params = {
                        id: record.id,
                        status: '0',
                    };
                    if(fileInfo.id) {
                        params.confType = 'static';
                        params.templateFileid = fileInfo.id;
                        params.templateFilename = fileInfo.fileName;
                    }else {
                        params.confType = 'react';
                        params.templateFileid = '';
                        params.templateFilename = '';
                    }
                    delete params.app;
                    this.setState({buttonLoading: true});
                    await $http.post(urls.editLoginPageConfig, params);
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

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const imgTyps = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'];
            const isTyps = imgTyps.indexOf(file.type) === -1 ? false : true;
            if (!isTyps) {
                message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0513));
                return reject(false);
            }
            return resolve(true);                           
        });
    };

    render() {
        const { buttonLoading, uploading, fileInfo } = this.state;

        const logoUploadButton = (
            <div>
                <Icon style={{fontSize: '20px'}} type={uploading ? 'loading' : 'plus'} />
            </div>
        );

        return (
            <Form layout="vertical">
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

export default UploadTemlate;