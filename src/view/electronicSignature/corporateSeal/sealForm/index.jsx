import React, { useState } from 'react';
import { Form, Input, Upload, Modal, Icon, message, Button } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { getRequiredRule } from 'utils/validateRules';
import { i18nMessages } from 'src/i18n';
import styled from 'styled-components';

// const formItemLayout = {
//     labelCol: {
//         xs: { span: 5 },
//         sm: { span: 5 }
//     },
//     wrapperCol: {
//         xs: { span: 15 },
//         sm: { span: 15 }
//     }
// };

const ModalBox = styled(Modal)`
    .ant-upload.ant-upload-select-picture-card {
        background: #fff;
    }
`;

const SealForm = props => {
    const { form, visible, onClose, sealInfo, intl } = props;
    const { id: sealId, url } = sealInfo;
    const { getFieldDecorator } = form;
    const [loading, setLoading] = useState(false);
    const [sealImage, setSealImage] = useState(sealId ? url : '');

    const beforeUpload = (file, maxSize) => {
        const patt = /\.(jpg|png|jpeg|svg)$/i;
        const isImg = file.name;
        if (!patt.test(isImg)) {
            message.error(intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0308));
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < maxSize;
        if (!isLt2M) {
            message.error(
                intl
                    .formatMessage(i18nMessages.ECONFIG_FRONT_A0371)
                    .replace('xx', maxSize)
            );
            return false;
        }
        return patt.test(isImg) && isLt2M;
    };

    const getBase64ByFile = file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            setSealImage(reader.result);
        };
    };

    const customRequest = res => {
        console.log(res);
    };

    const onSubmit = () => {
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            try {
                setLoading(true);
                if (!sealId) {
                    await $http.post(urls.addSeal, {
                        name: values.name || '',
                        base64Img: sealImage.split(',')[1],
                        type: '0'
                    });
                } else {
                    await $http.put(
                        `${urls.updateSeal}?sealId=${sealId}&name=${values.name}`
                    );
                }
                message.success(
                    sealId
                        ? intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0331)
                        : intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262)
                );
                onClose();
            } catch (error) {
                message.error(error.message);
                setLoading(false);
            }
        });
    };

    const logoUploadButton = (
        <div>
            <Icon type="plus" />
        </div>
    );
    return (
        <ModalBox
            title={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0742)}
            visible={visible}
            width={700}
            footer={[
                <Button key="back" onClick={onClose}>
                    {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={onSubmit}
                >
                    {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}
                </Button>
            ]}
            // okText={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}
            // cancelText={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
            // onOk={onSubmit}
            onCancel={onClose}
        >
            <Form>
                <Form.Item
                    label={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0743)}
                >
                    {getFieldDecorator('name', {
                        initialValue: sealInfo.name || '',
                        rules: [
                            getRequiredRule(
                                intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0743
                                ),
                                intl.formatMessage
                            )
                        ]
                    })(<Input autoComplete="off" maxLength={50} />)}
                </Form.Item>
                <Form.Item
                    label={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0744)}
                >
                    <span
                        style={{
                            color: 'red',
                            fontSize: 12,
                            lineHeight: 'normal',
                            marginBottom: 8,
                            display: 'inline-block'
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0745)}
                    </span>
                    {getFieldDecorator('base64Img', {
                        initialValue: sealImage,
                        rules: [
                            {
                                required: !sealId,
                                message: intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0746
                                )
                            }
                        ]
                    })(
                        <Upload
                            name="avatar"
                            disabled={!!sealId}
                            listType="picture-card"
                            showUploadList={false}
                            className="logo-uploader"
                            transformFile={getBase64ByFile}
                            beforeUpload={file => beforeUpload(file, 5)}
                            customRequest={res => customRequest(res)}
                        >
                            {sealImage ? (
                                <img
                                    style={{ width: '100px', height: '100px' }}
                                    src={sealImage}
                                    alt="avatar"
                                />
                            ) : (
                                logoUploadButton
                            )}
                        </Upload>
                    )}
                </Form.Item>
                {/* <div style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 16 }} onClick={onClose}>
                        取消
                    </Button>
                    <Button type="primary" onClick={onSubmit}>
                        确定
                    </Button>
                </div> */}
            </Form>
        </ModalBox>
    );
};

export default Form.create()(SealForm);
