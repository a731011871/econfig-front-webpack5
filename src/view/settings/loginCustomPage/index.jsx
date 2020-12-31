import React from 'react';
import urls, { parseApiUrl } from 'utils/urls';
import { formatEmpty } from 'utils/utils';
import { $http } from 'utils/http';
import { pickBy, debounce } from 'lodash';
import { Button, message, Divider, Popconfirm } from 'antd';
import CommonTable from 'tms-common-table1x';
import { previewFun } from './components/loginPreview';
import { drawerFun } from 'component/drawer';
import AddCustomPage from './components/addCustomPage';
import UploadTemlate from './components/uploadTemlate';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

import './index.less';

@injectIntl
class LoginCustomPage extends React.Component {
    state = {
        loading: false,
        dataSource: []
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0439
            ),
            width: 150,
            dataIndex: 'appName'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0433
            ),
            width: 200,
            dataIndex: 'userProperty'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0434
            ),
            dataIndex: 'urlAddress',
            render: text => {
                const url = `https://${text}.${document.domain
                    .split('.')
                    .slice(-2)
                    .join('.')}`;
                return (
                    <React.Fragment>
                        <span>{url}</span>{' '}
                        <a onClick={() => this.onCopy(url)}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0103
                            )}
                        </a>
                    </React.Fragment>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0086
            ),
            width: 200,
            dataIndex: 'status',
            render: text => {
                if (text === '0') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0594
                            )}
                        </span>
                    );
                }
                if (text === '1') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0595
                            )}
                        </span>
                    );
                }
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0508
            ),
            width: 200,
            dataIndex: 'templateFilename',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0087
            ),
            width: 250,
            dataIndex: 'id',
            render: (text, record) => {
                return (
                    <React.Fragment>
                        {record.confType !== 'static' && (
                            <React.Fragment>
                                <a
                                    href="javascript:void(0)"
                                    onClick={() =>
                                        this.onEditAdnPreview(record, 'preview')
                                    }
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0435
                                    )}
                                </a>
                                <Divider type="vertical" />
                                <a
                                    href="javascript:void(0)"
                                    onClick={() =>
                                        this.onEditAdnPreview(record, 'edit')
                                    }
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0098
                                    )}
                                </a>
                                <Divider type="vertical" />
                            </React.Fragment>
                        )}
                        {record.status === '0' && (
                            <React.Fragment>
                                <Popconfirm
                                    title={`${this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0442
                                    )}`}
                                    onConfirm={() =>
                                        this.onPublich(text, record)
                                    }
                                >
                                    <a href="javascript:void(0)">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0436
                                        )}
                                    </a>
                                </Popconfirm>
                                <Divider type="vertical" />
                            </React.Fragment>
                        )}

                        <Popconfirm
                            title={`${this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0228
                            )}`}
                            onConfirm={() => this.onDelete(text)}
                        >
                            <a href="javascript:void(0)">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0101
                                )}
                            </a>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <a
                            href="javascript:void(0)"
                            onClick={() => this.onUploadTemplate(record)}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0509
                            )}
                        </a>
                        {
                            record.templateFileid && (
                                <React.Fragment>
                                    <Divider type="vertical" />
                                    <Popconfirm
                                        title={`${this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0785
                                        )}`}
                                        onConfirm={() =>
                                            this.onDownLoadFile(record.templateFileid)
                                        }
                                    >
                                        <a
                                            href="javascript:void(0)"
                                        >
                                            {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0786)}
                                        </a>
                                    </Popconfirm>
                                </React.Fragment>
                            )
                        }
                        
                    </React.Fragment>
                );
            }
        }
    ];

    componentWillMount() {
        this.getDatas();
    }

    onDownLoadFile = debounce(async (fileId) => {
        try {
            const result = await $http.get(parseApiUrl(urls.getFile, { fileId }));
            window.open(result.previewUrl);
        } catch (e) {
            message.error(e.message);
        }
    }, 1000)

    onUploadTemplate = record => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0511
            ),
            width: 500,
            compontent: props => (
                <UploadTemlate
                    intl={this.props.intl}
                    record={record}
                    getDatas={this.getDatas}
                    {...props}
                />
            )
        });
    };

    onCopy = url => {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.setAttribute('value', url);
        input.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            console.log('复制成功');
        }
        document.body.removeChild(input);
        message.success(
            this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0512)
        );
    };

    onEditAdnPreview = (record, isPreview) => {
        const params = pickBy(
            {
                url:
                    `https://${record.urlAddress}.${document.domain
                        .split('.')
                        .slice(-2)
                        .join('.')}` || '',
                logo: record.logo || '',
                loginUrlName1: record.loginUrlName1 || '',
                loginUrl1: record.loginUrl1 || '',
                loginUrlName2: record.loginUrlName2 || '',
                loginUrl2: record.loginUrl2 || '',
                loginUrlName3: record.loginUrlName3 || '',
                loginUrl3: record.loginUrl3 || '',
                appName: record.appNameDiy || '',
                themeColor: record.themeColor || '',
                taimeiLogo: record.taimeiLogo || '',
                corporateBanner: record.corporateBanner || '',
                id: record.id
            },
            item => item !== ''
        );
        console.log(params);
        console.log(isPreview);
        previewFun({
            ...params,
            intl: this.props.intl,
            getDatas: this.getDatas,
            isPreview
        });
    };

    onDelete = async id => {
        try {
            await $http.post(`${urls.delLoginPageConfig}?id=${id}`);
            this.getDatas();
        } catch (e) {
            message.error(e.message);
        }
    };

    onPublich = async (id, record) => {
        try {
            await $http.post(`${urls.editLoginPageConfig}`, {
                id,
                status: '1',
                urlAddress: record.urlAddress
            });
            this.getDatas();
        } catch (e) {
            message.error(e.message);
        }
    };

    getDatas = async () => {
        try {
            this.setState({ loading: true });
            const dataSource =
                (await $http.post(urls.findLoginPageConfig, {})) || [];
            this.setState({ dataSource, loading: false });
        } catch (e) {
            message.error(e.message);
        }
    };

    onAdd = () => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0329
            ),
            width: 500,
            compontent: props => (
                <AddCustomPage
                    intl={this.props.intl}
                    getDatas={this.getDatas}
                    {...props}
                />
            )
        });
    };

    render() {
        const { dataSource } = this.state;
        return (
            <div className="login-custom-page">
                <div className="login-custom-page-header">
                    {this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0432
                    )}
                    <a href="http://static.mobilemd.cn/public/dyn/tms-template/1.0.4//tms-template.zip">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0510
                        )}
                    </a>
                </div>
                <div className="login-custom-page-buttons">
                    <Button
                        type="primary"
                        className="Right"
                        onClick={this.onAdd}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0329
                        )}
                    </Button>
                </div>
                <CommonTable
                    serviceKey="cspAdmin"
                    dataSource={dataSource}
                    columns={this.columns}
                    loading={false}
                    outerFilter={false}
                    pagination={false}
                />
            </div>
        );
    }
}

export default LoginCustomPage;
