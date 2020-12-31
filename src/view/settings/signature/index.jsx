import React from 'react';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import styled from 'styled-components';
import TmsTable from 'component/tmsTable';
import { Button, Divider, Tag, Popconfirm, message } from 'antd';
import { drawerFun } from 'component/drawer';
import AddSignature from './addSignature';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const SignatureContainer = styled.div`
    padding: 10px 15px;
    height: 100%;
    .new-signature {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
`;

@injectIntl
class Signature extends React.Component {
    state = {
        tableData: [],
        buttonLoading: false
    };

    columns = [
        {
            title: 'OID',
            dataIndex: 'oid',
            width: 150
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0117
            ),
            width: '150px',
            dataIndex: 'signName'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0118
            ),
            width: 120,
            dataIndex: 'signMethod',
            render: text =>
                text === '0'
                    ? this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0592
                    )
                    : this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0593
                    )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0119
            ),
            width: 400,
            dataIndex: 'responsibilityDeclare'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0120
            ),
            dataIndex: 'status',
            width: 100,
            render: text =>
                text === '0' ? (
                    <Tag className="tms-tag-disable">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0143
                        )}
                    </Tag>
                ) : (
                    <Tag className="tms-tag-enable">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0144
                        )}
                    </Tag>
                )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0121
            ),
            width: 120,
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.handleEditEvent(record)}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0098
                        )}
                    </a>
                    <Divider type="vertical" />
                    <Popconfirm
                        title={`${this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0252
                        )}[${record.signName}]?`}
                        onConfirm={() => this.handleDeleteEvent(record.id)}
                    >
                        <a>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0145
                            )}
                        </a>
                    </Popconfirm>
                </span>
            )
        }
    ];

    handleNewEvent = () => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0259
            ),
            width: 500,
            compontent: props => (
                <AddSignature
                    tableEvent={this.tableEvent}
                    isAdd={true}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    handleEditEvent = res => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0098
            ),
            width: 500,
            compontent: props => (
                <AddSignature
                    tableEvent={this.tableEvent}
                    signatureInfo={res}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    handleDeleteEvent = async signid => {
        try {
            await $http.delete(parseApiUrl(urls.deleteSign, { signid }));
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.tableEvent.fetchData({ pageNo: 1, pageSize: 10 });
        } catch (e) {
            message.error(e.message);
        }
    };

    render() {
        return (
            <SignatureContainer>
                <div className="new-signature">
                    <Button onClick={this.handleNewEvent} type="primary">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0259
                        )}
                    </Button>
                </div>
                <TmsTable
                    intl={this.props.intl}
                    columns={this.columns}
                    url={urls.getSigns}
                    tableEvent={ref => (this.tableEvent = ref)}
                />
            </SignatureContainer>
        );
    }

    componentDidMount() {
        this.tableEvent.fetchData({ pageNo: 1, pageSize: 50 });
    }
}

export default Signature;
