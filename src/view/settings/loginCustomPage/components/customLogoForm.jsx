import React from 'react';
import { pickBy } from 'lodash';
import { DEFAULT_PAGE_DATAS } from 'utils/utils';
import { i18nMessages } from 'src/i18n';
import { Form, Radio, message } from 'antd';
import { SaveAndCancelDom } from 'component/drawer';
import ColorPicker from 'rc-color-picker';
import TmsUpload from '@tms/react-cropper';
import 'rc-color-picker/assets/index.css';


class CustomLogoForm extends React.Component {

    constructor(props) {
        super(props);
        const { logo = '', themeColor = DEFAULT_PAGE_DATAS.themeColor, taimeiLogo = DEFAULT_PAGE_DATAS.taimeiLogo } = this.props.customDatas;
        console.log(taimeiLogo);
        this.state = {
            logoLoading: false,
            logo: [{url: logo}],
            themeColor,
            taimeiLogo
        };
    }

    render() {
        const { logo, taimeiLogo, themeColor } = this.state;
        return (
            <Form layout="vertical">
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0458)}>
                    <div style={{overflow: 'hidden'}}>
                        <TmsUpload
                            lang="zh_CN"
                            value={logo}
                            beforeUpload={this.beforeUpload}
                            onChange={this.onImgChange}
                        />
                    </div>
                    <span className="title-tip-ccc">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0459)}</span>
                </Form.Item>
                <div className="costom-line" />
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0460)}>
                    <ColorPicker color={themeColor} onChange={this.onColorChange}>
                        <span className="rc-color-picker-trigger" />
                    </ColorPicker>
                </Form.Item>
                <div className="costom-line" />
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0461)}>
                    <Radio.Group onChange={this.onTaimeiLogoChange} value={taimeiLogo}>
                        <Radio value={DEFAULT_PAGE_DATAS.taimeiLogo}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0462)}</Radio>
                        <Radio value={DEFAULT_PAGE_DATAS.ctaimeiLogo}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0463)}</Radio>
                    </Radio.Group>
                </Form.Item>
                <SaveAndCancelDom intl={this.props.intl} onCancelClick={this.onCancelClick} onHandleClick={this.handleSubmit} />
            </Form>
        );
    }

    onImgChange = (imgs) => {
        this.setState({logo: imgs || []});
    }

    handleSubmit = () => {
        const { logo = [], themeColor, taimeiLogo } = this.state;
        this.props.onPolymerization(pickBy({logo: logo.length > 0 ? logo[0].url : '', themeColor, taimeiLogo}, d => d !== ''));
        this.props.onClose();
    }

    onTaimeiLogoChange = (e) => {
        this.setState({
            taimeiLogo: e.target.value
        });
    }

    onCancelClick = () => {
        const { logo = '', themeColor = DEFAULT_PAGE_DATAS.themeColor, taimeiLogo = DEFAULT_PAGE_DATAS.taimeiLogo } = this.props.originCustomDatas;
        this.setState({
            logo, themeColor, taimeiLogo
        });
    }

    onToggleSketch = () => {
        this.setState({
            showSketchPicker: !this.state.showSketchPicker
        });
    }

    onColorChange = (e) => {
        this.setState({
            themeColor: e.color
        });
    }

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const patt = /\.(jpg|png|jpeg)$/i;
            const isImg = file.name;
            if(!patt.test(isImg)) {
                message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0308));
                return reject(false);
            }
            const isLt2M = file.size / 1024 / 1024 < 1;
            if (!isLt2M) {
                message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0371).replace('xx', 1));
                return reject(false);
            }
            return resolve(true);
        });
    }
}

export default CustomLogoForm;