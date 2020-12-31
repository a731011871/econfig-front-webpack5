import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { i18nMessages } from 'src/i18n';
import './index.less';

function VerifiedModal(props) {
    const { visible, onClose, verifiedUrl, intl } = props;
    return (
        <Modal
            className="verifiedModal"
            title={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0737)}
            visible={visible}
            width={1100}
            maskClosable={false}
            footer={null}
            // okText={localMessage('ok')}
            // cancelText={localMessage('cancel')}
            // onOk={onSubmit}
            onCancel={onClose}
        >
            <iframe
                src={verifiedUrl}
                frameborder="0"
                width="100%"
                height="100%"
            />
        </Modal>
    );
}

VerifiedModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    verifiedUrl: PropTypes.string.isRequired
};

export default VerifiedModal;
