import React, { Component } from 'react';
import { Form, Input, Button, message, Popover } from 'antd';
import { modalFun } from 'src/component/modal';
import CommonTable from 'tms-common-table1x';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { formatEmpty } from 'utils/utils';
import { i18nMessages } from 'src/i18n';
import ViewQuote from './viewQuote';

export const projectTableColumns = intl => {
    return [
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0505),
            width: 200,
            dataIndex: 'projectSerialNo',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0019),
            minWidth: 200,
            dataIndex: 'projectName'
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0020),
            width: 200,
            dataIndex: 'programCode',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0022),
            width: 240,
            dataIndex: 'candidate',
            render: text => formatEmpty(text)
        },
        // {
        //     title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0021),
        //     width: 250,
        //     dataIndex: 'projectManager',
        //     render: (text) => formatEmpty(text)
        // },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0025),
            width: 250,
            dataIndex: 'studyStageName',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0310),
            width: 150,
            dataIndex: 'therapyAreaName',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0026),
            width: 200,
            dataIndex: 'experimentType',
            render: text => formatEmpty(text)
        },
        {
            title: 'CRO',
            width: 120,
            dataIndex: 'cro',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0024),
            width: 120,
            dataIndex: 'createUserName',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0579),
            width: 120,
            dataIndex: 'createTime',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0418),
            width: 120,
            dataIndex: 'companyName',
            render: text => formatEmpty(text)
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0158),
            width: 200,
            dataIndex: 'projectDesc',
            render: text => formatEmpty(text)
        },
        // {
        //     title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0268),
        //     width: 150,
        //     dataIndex: 'projectSiteDoList',
        //     render: (text) => {
        //         if(text && text.length) {
        //             return (
        //                 <div>
        //                     {text.map(item => item.aliasName).join()}
        //                 </div>
        //             );
        //         }
        //         return '-';
        //     },

        // },
        // 引用信息
        // {
        //     title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0580),
        //     width: 150,
        //     dataIndex: 'tenantName',
        //     render: (text) => formatEmpty(text),

        // },
        // {
        //     title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0581),
        //     width: 150,
        //     dataIndex: 'appName',
        //     render: (text) => formatEmpty(text),

        // },
        // {
        //     title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0582),
        //     width: 150,
        //     dataIndex: 'quoteUserName',
        //     render: (text) => formatEmpty(text),
        // },
        // {
        //     title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0583),
        //     width: 150,
        //     dataIndex: 'quoteTime',
        //     render: (text) => formatEmpty(text),
        // },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0030),
            width: 150,
            key: 'action',
            render: (text, record) => {
                console.log(record);
                return (
                    <Popover
                        placement="leftBottom"
                        title={intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0650
                        )}
                        content={
                            <ViewQuote
                                projectId={record.id}
                                formatMessage={intl.formatMessage}
                            />
                        }
                        trigger="click"
                    >
                        <a style={{ wordBreak: 'break-word' }}>
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0650
                            )}
                        </a>
                    </Popover>
                );
            }
        }
    ];
};

@Form.create()
class QuotePrject extends Component {
    state = {
        buttonLoading: false,
        selectedRowKeys: []
    };

    onSubmit = () => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                try {
                    this.setState({ buttonLoading: true });
                    const result = await $http.post(urls.getProjectList, {
                        keyWord: values.key
                    });
                    // const result = await $http.post(urls.getPros, { key: values.key });
                    console.log(result);
                    if (result && result.length) {
                        const rowSelection = {
                            type: 'radio',
                            onChange: (s1, s2) => {
                                console.log(s1, s2);
                                this.setState({ selectedRowKeys: s2 });
                            }
                        };
                        const columns = projectTableColumns(this.props.intl);
                        modalFun({
                            title: (
                                <div style={{ display: 'flex' }}>
                                    <div>
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0568
                                        )}
                                        :
                                    </div>
                                    <div
                                        style={{ fontSize: 14, color: '#999' }}
                                    >
                                        （
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0569
                                        )}
                                        ）
                                    </div>
                                </div>
                            ),
                            width: 1000,
                            compontent: tProps => (
                                <div>
                                    <CommonTable
                                        rowSelection={rowSelection}
                                        columns={columns}
                                        dataSource={result}
                                        pagination={false}
                                        outerFilter={false}
                                        scroll={{ x: 2300 }}
                                    />
                                    <div
                                        style={{
                                            textAlign: 'right',
                                            marginTop: 20
                                        }}
                                    >
                                        <Button
                                            style={{ marginRight: 15 }}
                                            onClick={() => {
                                                tProps.onClose();
                                            }}
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0281
                                            )}
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                if (
                                                    this.state.selectedRowKeys
                                                        .length > 0
                                                ) {
                                                    tProps.onClose();
                                                    this.props.formAssignment({
                                                        projectInfo: this.state
                                                            .selectedRowKeys[0],
                                                        unReset: true,
                                                        quote: true
                                                    });
                                                } else {
                                                    message.info(
                                                        this.props.intl.formatMessage(
                                                            i18nMessages.ECONFIG_FRONT_A0341
                                                        )
                                                    );
                                                }
                                            }}
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0279
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )
                        });
                        this.props.setQuote(false);
                        this.props.form.resetFields(['key']);
                    } else {
                        message.info(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0586
                            )
                        );
                    }
                } catch (e) {
                    message.error(e.message);
                } finally {
                    this.setState({ buttonLoading: false });
                }
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form>
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0564
                    )}
                >
                    {getFieldDecorator('key', {
                        initialValue: '',
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0567
                                )
                            }
                        ]
                    })(
                        <Input
                            style={{ width: 350 }}
                            placeholder={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0567
                            )}
                        />
                    )}
                </Form.Item>
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={() => this.props.setQuote(false)}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0281
                        )}
                    </Button>
                    <Button
                        style={{ marginLeft: 10 }}
                        loading={this.state.buttonLoading}
                        onClick={this.onSubmit}
                        type="primary"
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        )}
                    </Button>
                </div>
            </Form>
        );
    }
}

export default QuotePrject;
