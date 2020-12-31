import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { Table } from 'antd';
import { i18nMessages } from 'src/i18n';
import { formatEmpty } from 'utils/utils';

function ViewQuote(props) {
    const [quoteData, setQuoteData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { projectId, formatMessage } = props;
    const columns = [
        {
            title: formatMessage(i18nMessages.ECONFIG_FRONT_A0019),
            width: 150,
            dataIndex: 'projectName',
            render: text => formatEmpty(text)
        },
        {
            title: formatMessage(i18nMessages.ECONFIG_FRONT_A0580),
            width: 150,
            dataIndex: 'tenantName',
            render: text => formatEmpty(text)
        },
        {
            title: formatMessage(i18nMessages.ECONFIG_FRONT_A0581),
            width: 150,
            dataIndex: 'appName',
            render: text => formatEmpty(text)
        },
        {
            title: formatMessage(i18nMessages.ECONFIG_FRONT_A0582),
            width: 150,
            dataIndex: 'quoteUserName',
            render: text => formatEmpty(text)
        },
        {
            title: formatMessage(i18nMessages.ECONFIG_FRONT_A0583),
            width: 150,
            dataIndex: 'quoteTime',
            render: text => formatEmpty(text)
        }
    ];
    useEffect(() => {
        const getQuote = async () => {
            const data = await $http.post(urls.getPros, {
                projectIds: [projectId]
            });
            setQuoteData(data || []);
            setLoading(false);
        };
        getQuote();
    }, [projectId]);
    return (
        <div>
            <Table
                columns={columns}
                dataSource={quoteData}
                pagination={false}
                loading={loading}
            />
        </div>
    );
}

ViewQuote.propTypes = {
    projectId: PropTypes.string.isRequired,
    formatMessage: PropTypes.func
};

export default ViewQuote;
