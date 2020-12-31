import React from 'react';
import PropTypes from 'prop-types';
import { Table, message, ConfigProvider } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
// import {find, includes, slice} from 'lodash';
import SearchForm from './searchForm';
// import { LoadingHoc } from '../../component/LoadingHoc';
import { i18nMessages } from 'src/i18n';
import moment from 'moment/moment';
import { queryParamBuilder } from 'utils/functions';
import zh_CN from 'antd/es/locale/zh_CN';
import en_US from 'antd/es/locale/en_US';
import { getCurrentLanguage } from 'utils/utils';

const Content = text => <div style={{ wordBreak: 'break-word' }}>{text}</div>;

class productSearch extends React.PureComponent {
    static propTypes = {
        changeProduct: PropTypes.func,
        onClose: PropTypes.func,
        selectValues: PropTypes.array,
        intl: PropTypes.object,
        appId: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            selectValues: props.selectValues || [],
            searchObj: {
                pageNo: 1,
                pageSize: 50,
                startTime: moment()
                    .subtract(1, 'year')
                    .format('YYYY-MM-DD HH:mm:ss'),
                endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                isMarket: ''
            },
            systemList: [],
            userTotal: 0,
            productList: [],
            showAuthPage: false,
            selectUserId: ''
        };
    }

    // 语言对应的Map
    langMap = {
        zh_CN: {
            intl: 'zh',
            locale: zh_CN
        },
        en_US: {
            intl: 'en',
            locale: en_US
        }
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0521
            ),
            width: 230,
            dataIndex: 'commonZhName',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0522
            ),
            dataIndex: 'commonEnName',
            width: 230,
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0523
            ),
            width: 100,
            dataIndex: 'activeIngredient',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0524
            ),
            width: 150,
            dataIndex: 'manufacture',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0525
            ),
            width: 80,
            dataIndex: 'isMarket',
            render: text =>
                text
                    ? text === '0'
                        ? this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0526
                        )
                        : this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0527
                        )
                    : ''
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0528
            ),
            width: 100,
            dataIndex: 'productZhName',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0529
            ),
            width: 180,
            dataIndex: 'authNum',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0530
            ),
            width: 180,
            dataIndex: 'dateCreateTime',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0531
            ),
            width: 150,
            dataIndex: 'specification',
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0532
            ),
            width: 120,
            dataIndex: 'appName'
        }
    ];

    // async componentDidMount() {
    //     try {
    //         const result = await axios.get(urls.getFilterSoftList);
    //         const list = result.filter(
    //             item =>
    //                 item.authType &&
    //                 item.authType !== '-1' &&
    //                 item.appId !== 'econfig'
    //         );
    //         const searchObj = {
    //             ...this.state.searchObj,
    //             authType: list[0].authType,
    //             appId: list[0].appId
    //         };
    //         this.setState({
    //             systemList: list || [],
    //             searchObj
    //         });
    //         this.fetchProduct(searchObj);
    //     } catch (e) {
    //         message.error(e.message);
    //     }
    // }

    fetchProduct = async searchObj => {
        console.log(searchObj);
        this.setState({ searchObj });
        try {
            const searchParams = new queryParamBuilder()
                .appendCondition('isMarket', 'equal', searchObj.isMarket)
                .appendCondition(
                    'commonZhName',
                    'contains',
                    searchObj.commonZhName
                )
                .appendCondition(
                    'commonEnName',
                    'contains',
                    searchObj.commonEnName
                )
                .appendCondition(
                    'activeIngredient',
                    'contains',
                    searchObj.activeIngredient
                )
                .appendCondition(
                    'manufacture',
                    'in',
                    searchObj.manufacture.join(',')
                )
                .appendCondition(
                    'productZhName',
                    'contains',
                    searchObj.productZhName
                )
                .appendCondition('authNum', 'contains', searchObj.authNum)
                .appendCondition('appId', 'equal', this.props.appId)
                .appendCondition(
                    'specification',
                    'contains',
                    searchObj.specification
                )
                .appendCondition(
                    'createTime',
                    'between',
                    searchObj.startTime &&
                        searchObj.endTime &&
                        `${searchObj.startTime},${searchObj.endTime}`
                );
            searchParams.pageNo = searchObj.pageNo;
            searchParams.pageSize = searchObj.pageSize;
            const productResult = await $http.post(
                urls.productSearch,
                searchParams
            );
            this.setState({
                productList: productResult.list || [],
                productTotal: productResult.total || 0
            });
        } catch (e) {
            message.error(e.message);
        } finally {
            // this.props.toggleLoading();
        }
    };

    resetUserList = () => {
        this.setState({
            productList: [],
            searchObj: {
                pageNo: 1,
                pageSize: 50,
                startTime: moment()
                    .subtract(1, 'year')
                    .format('YYYY-MM-DD HH:mm:ss'),
                endTime: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        });
    };

    onSelectChange = selectValues => {
        this.setState({ selectValues });
        this.props.changeProduct(selectValues);
    };

    render() {
        const rowSelection = {
            selectedRowKeys: this.state.selectValues,
            onChange: this.onSelectChange
        };
        return (
            <ConfigProvider locale={this.langMap[getCurrentLanguage()].locale}>
                <div className="pAll10">
                    <SearchForm
                        searchObj={this.state.searchObj}
                        fetchProduct={this.fetchProduct}
                        toggleLoading={() => {}}
                        selectValues={this.state.selectValues}
                        resetUserList={this.resetUserList}
                        intl={this.props.intl}
                    />
                    <Table
                        rowKey="id"
                        rowSelection={rowSelection}
                        scroll={{ y: 300, x: 1500 }}
                        pagination={{
                            size: 'small',
                            total: this.state.productTotal || 0,
                            showSizeChanger: true,
                            defaultPageSize: 50,
                            current: this.state.searchObj.pageNo,
                            pageSize: this.state.searchObj.pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            // showTotal: total => <span>{`共${total}条`}</span>,
                            onChange: (pageNo, pageSize) => {
                                this.fetchProduct({
                                    ...this.state.searchObj,
                                    pageNo,
                                    pageSize
                                });
                            },
                            onShowSizeChange: (pageNo, pageSize) => {
                                this.fetchProduct({
                                    ...this.state.searchObj,
                                    pageNo,
                                    pageSize
                                });
                            }
                        }}
                        dataSource={this.state.productList}
                        columns={this.columns}
                    />
                </div>
            </ConfigProvider>
        );
    }
}

export default productSearch;
