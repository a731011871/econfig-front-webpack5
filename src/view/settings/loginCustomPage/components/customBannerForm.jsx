import React from 'react';
import { pickBy } from 'lodash';
import { DEFAULT_PAGE_DATAS } from 'utils/utils';
import { i18nMessages } from 'src/i18n';
import { Form, message } from 'antd';
import { SaveAndCancelDom } from 'component/drawer';
import TmsUpload from '@tms/react-cropper';
import 'rc-color-picker/assets/index.css';


class CustomBannerForm extends React.Component {

    constructor(props) {
        super(props);
        const { corporateBanner = DEFAULT_PAGE_DATAS.corporateBanner } = this.props.customDatas;
        this.state = {
            corporateBanner: [{url: corporateBanner}],
            logoLoading: false
        };
    }

    render() {
        const { corporateBanner } = this.state;
        return (
            <Form layout="vertical">
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0455)}>
                    <div>
                        <TmsUpload
                            lang="zh_CN"
                            value={corporateBanner}
                            beforeUpload={this.beforeUpload}
                            onChange={this.onImgChange}
                        />
                    </div>
                    <span className="title-tip-ccc">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0456)}</span>
                </Form.Item>
                <SaveAndCancelDom intl={this.props.intl} onHandleClick={this.handleSubmit} onCancelClick={this.onCancelClick} />
            </Form>
        );
    }

    onCancelClick = () => {
        const { corporateBanner = DEFAULT_PAGE_DATAS.corporateBanner } = this.props.originCustomDatas;
        this.setState({
            corporateBanner
        });
    }

    handleSubmit = () => {
        const { corporateBanner = '' } = this.state;
        this.props.onPolymerization(pickBy({ corporateBanner: corporateBanner.length > 0 ? corporateBanner[0].url : '' }, d => d !== ''));
        this.props.onClose();
    }

    onImgChange = (imgs) => {
        this.setState({corporateBanner: imgs || []});
    }

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const patt = /\.(jpg|png|jpeg)$/i;
            const isImg = file.name;
            if(!patt.test(isImg)) {
                message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0308));
                return reject(false);
            }
            const isLt2M = file.size / 1024 / 1024 < 3;
            if (!isLt2M) {
                message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0371).replace('xx', 3));
                return reject(false);
            }
            return resolve(true);
        });
    }

}

export default CustomBannerForm;