import React from 'react';
import { $http } from 'utils/http';
import CommonTable from 'tms-common-table1x';
import { i18nMessages } from 'src/i18n';

const { serviceKeyMap } = CommonTable;

class TmsTable extends React.Component {
    state = {
        loading: false,
        total: 0,
        pageSize: 50,
        tableData: []
    };

    componentWillMount() {
        // this.fetchData({});
    }

    fetchData = async ({
        pageNo = 1,
        // pageSize = 50,
        needCount = true,
        needPaging = true
    }) => {
        const { pageSize } = this.state;
        const { url } = this.props;
        const { conditions = [] } = this.props;
        if (url) {
            this.setState({ loading: true });
            const tableData = await $http.post(url, {
                needCount,
                needPaging,
                pageNo,
                pageSize,
                criteria: {
                    conditions,
                    sortProperties: [
                        {
                            propertyName: 'createTime',
                            sort: 'DESC'
                        }
                    ]
                }
            });
            this.setState({
                tableData: tableData.rows || [],
                total: tableData.total,
                loading: false,
                pageNo,
                pageSize
            });
        }
    };

    tableChange = ({ current = 1, pageSize = 50 }) => {
        this.setState({ pageSize }, () => {
            this.fetchData({
                pageNo: current,
                pageSize
            });
        });
    };

    render() {
        const { columns } = this.props;
        const { loading, total, tableData, pageNo, pageSize } = this.state;

        return (
            <CommonTable
                serviceKey={serviceKeyMap.ProcessInstance}
                dataSource={tableData}
                columns={columns}
                loading={loading}
                paginationOptions={{
                    pageSizeOptions: ['10', '20', '50', '100'],
                    size: 'small',
                    current: pageNo,
                    pageSize,
                    total: this.state.total || 0,
                    // showTotal: (total) => `共 ${total} 条`,
                    showTotal: total =>
                        `${this.props.intl
                            .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                            .replace('xx', total)}`
                }}
                onChange={this.tableChange}
                total={total}
                outerFilter={false}
            />
        );
    }

    componentDidMount() {
        if (this.props && this.props.tableEvent) {
            this.props.tableEvent(this);
        }
    }
}

export default TmsTable;
