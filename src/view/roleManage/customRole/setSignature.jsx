import React from 'react';
import urls from 'utils/urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { i18nMessages } from 'src/i18n';
import { Form, message, Radio } from 'antd';
import { SaveDom } from 'component/drawer';

const RadioGroup = Radio.Group;

const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
};

const SignatureDiv = styled.div`
    line-height: 20px;
    font-size: 13px;
    padding-left: 24px;
    word-break: break-all;
`;

@Form.create()
class SetSignature extends React.Component {

    static propTypes = {
        isEdit: PropTypes.bool // 是否可编辑
    }

    static defaultProps = {
        isEdit: '0'
    }

    state = {
        buttonLoading: false,
        roleInfo: {}
    }

    componentWillMount() { 
        const { roleInfo = {} } = this.props;
        this.setState({ roleInfo });
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({buttonLoading: true});
                const { onClose, flushCustomTable, roleInfo = {} } = this.props;
                // if(values.id === 'no') {
                //     message.success('修改成功!');
                //     flushCustomTable();
                //     this.setState({buttonLoading: false});
                //     onClose();
                //     return;
                // }
                try{
                    await $http.get(urls.updateAuthSignInfo, {
                        roleId: roleInfo.id,
                        signIds: values.id === 'no' ? '' : values.id
                    });
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230));
                    flushCustomTable();
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({buttonLoading: false});
                    onClose();
                }
            }
        });
    }, 500)

    render() {
        const { buttonLoading } = this.state;
        const { signatureList = [], roleInfo: { signIds = []}, isEdit} = this.props;
        const { getFieldDecorator } = this.props.form;
        
        return (
            <Form>
                <Form.Item >
                    {getFieldDecorator('id', {
                        initialValue: signIds[0] || 'no',
                    })(
                        <RadioGroup disabled={isEdit === '0'}>
                            {
                                signatureList.map(item => {
                                    return (
                                        <React.Fragment key={item.id} >
                                            <Radio style={radioStyle} value={item.id}>{item.signName}</Radio>
                                            <SignatureDiv>{item.responsibilityDeclare}</SignatureDiv>
                                        </React.Fragment>
                                    );
                                })
                            }
                        </RadioGroup>
                    )}
                </Form.Item>
                
                {isEdit === '1' &&<SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} intl={this.props.intl} />}
            </Form>
        );
    }
}

export default SetSignature;