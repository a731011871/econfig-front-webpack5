import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import {
    Form,
    Row,
    Col,
    Select,
    Button,
    DatePicker,
    Input,
    message
    // Modal
} from 'antd';
import styled from 'styled-components';
import { i18nMessages } from 'src/i18n';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
// const confirm = Modal.confirm;
const BoxDiv = styled.div`
    padding-left: 15px;
    padding-right: 15px;
`;

@Form.create()
class searchForm extends React.PureComponent {
    static propTypes = {
        selectValues: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            manufactureList: []
        };
    }

    async componentWillMount() {
        try {
            const manufactureList = await $http.get(urls.getManufactureList);
            this.setState({
                manufactureList
            });
        } catch (e) {
            message.error(e.message);
        }
    }

    search = () => {
        // 是否重置
        this.props.form.validateFields((errors, values) => {
            if (errors) {
                return;
            }
            console.log(values);
            if (values.date && values.date.length) {
                values.startTime = moment(values.date[0]).format(
                    'YYYY-MM-DD HH:mm:ss'
                );
                values.endTime = moment(values.date[1]).format(
                    'YYYY-MM-DD HH:mm:ss'
                );
            } else {
                values.startTime = '';
                values.endTime = '';
            }
            const searchObj = {
                ...this.props.searchObj,
                ...values
            };
            this.props.fetchProduct(searchObj);
        });
    };

    reset = () => {
        this.props.form.resetFields();
        this.props.form.setFieldsValue({
            date: [moment().subtract(1, 'year'), moment()]
        });
        this.setState({ selectAuthType: '' });
        this.props.resetUserList();
    };

    render() {
        const rowGutter = 40;
        const { getFieldDecorator } = this.props.form;
        const { manufactureList } = this.state;
        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 12 }
        };
        return (
            <BoxDiv className="search" style={{ marginBottom: 15 }}>
                <Form>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0525
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('isMarket', {
                                    rules: [],
                                    initialValue: '1'
                                })(
                                    <Select>
                                        <Option value="0">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0526
                                            )}
                                        </Option>
                                        <Option value="1">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0527
                                            )}
                                        </Option>
                                        <Option value="">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0283
                                            )}
                                        </Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0521
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('commonZhName', {
                                    rules: [],
                                    initialValue: ''
                                })(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0522
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('commonEnName', {
                                    rules: [],
                                    initialValue: ''
                                })(<Input />)}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0523
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('activeIngredient', {
                                    rules: [],
                                    initialValue: ''
                                })(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0524
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('manufacture', {
                                    rules: [],
                                    initialValue: []
                                })(
                                    <Select
                                        showSearch
                                        allowClear
                                        mode="multiple"
                                        optionFilterProp="children"
                                    >
                                        {manufactureList.length > 0
                                            ? manufactureList.map(item => (
                                                <Option key={item}>
                                                    {item}
                                                </Option>
                                            ))
                                            : null}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0528
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('productZhName', {
                                    rules: [],
                                    initialValue: ''
                                })(<Input />)}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={rowGutter}>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0529
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('authNum', {
                                    rules: [],
                                    initialValue: ''
                                })(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0531
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('specification', {
                                    rules: [],
                                    initialValue: ''
                                })(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0530
                                )}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('date', {
                                    rules: [],
                                    initialValue: [
                                        moment().subtract(1, 'year'),
                                        moment()
                                    ]
                                })(<RangePicker />)}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Row>
                    <Button
                        type="primary"
                        className="Right"
                        onClick={this.search}
                    >
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0481)}
                    </Button>
                    <Button
                        type="primary"
                        className="Right mRight8"
                        onClick={this.reset}
                    >
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0018)}
                    </Button>
                    <div className="Right LineHeight32 mRight8">
                        {this.props.intl
                            .formatMessage(i18nMessages.ECONFIG_FRONT_A0285)
                            .replace('xx', this.props.selectValues.length || 0)}
                    </div>
                </Row>
            </BoxDiv>
        );
    }
}

export default searchForm;
