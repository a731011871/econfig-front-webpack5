import React, { useState } from 'react';
import { Checkbox, Button } from 'antd';
import { includes, uniq } from 'lodash';
import PropTypes from 'prop-types';
import { i18nMessages } from 'src/i18n';

function FilterColumnContent(props) {
    const { columns, filterColumns, formatMessage, onClose } = props;
    const [checkColumns, setCheckColumns] = useState(filterColumns);
    const checkAll = e => {
        setCheckColumns(
            e.target.checked
                ? columns.map(item => item.dataIndex)
                : ['userName', 'email']
        );
    };
    const checkItem = (e, dataIndex) => {
        let checkList = checkColumns;
        if (e.target.checked) {
            if (includes(['roleIds', 'siteIds', 'action'], dataIndex)) {
                checkList = uniq(
                    checkColumns.concat(['roleIds', 'siteIds', 'action'])
                );
            } else {
                checkList = checkColumns.concat([dataIndex]);
            }
        } else {
            if (includes(['roleIds', 'siteIds', 'action'], dataIndex)) {
                checkList = checkColumns.filter(
                    checkItem =>
                        !includes(['roleIds', 'siteIds', 'action'], checkItem)
                );
            } else {
                checkList = checkColumns.filter(
                    checkItem => checkItem !== dataIndex
                );
            }
        }
        setCheckColumns(checkList);
    };
    return (
        <div style={{ width: 220 }}>
            <div>{formatMessage(i18nMessages.ECONFIG_FRONT_A0643)}</div>
            <div
                style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '3px 3px 0 0 ',
                    padding: 10,
                    borderBottom: 0
                }}
            >
                <Checkbox
                    indeterminate={
                        checkColumns.length > 1 &&
                        checkColumns.length < columns.length
                    }
                    onChange={checkAll}
                    checked={checkColumns.length === columns.length}
                >
                    {`${checkColumns.length}/${columns.length}${formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0644
                    )}`}
                </Checkbox>
            </div>
            <div
                style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '0 0 3px 3px',
                    padding: 10
                }}
            >
                {columns.map(item => (
                    <Checkbox
                        checked={includes(checkColumns, item.dataIndex)}
                        className="Block mBottom8 mLeft0"
                        key={item.dataIndex}
                        disabled={includes(
                            ['userName', 'email'],
                            item.dataIndex
                        )}
                        value={item.dataIndex}
                        onChange={e => checkItem(e, item.dataIndex)}
                    >
                        {item.title}
                    </Checkbox>
                ))}
            </div>
            <div
                style={{
                    textAlign: 'right',
                    marginTop: 10
                }}
            >
                <Button
                    className="mRight10"
                    onClick={() => {
                        setCheckColumns(filterColumns);
                        onClose(filterColumns); }
                    }
                >
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
                </Button>
                <Button type="primary" onClick={() => onClose(checkColumns)}>
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                </Button>
            </div>
        </div>
    );
}

FilterColumnContent.propTypes = {
    filterColumns: PropTypes.array,
    columns: PropTypes.array,
    onClose: PropTypes.func,
    formatMessage: PropTypes.func
};

export default FilterColumnContent;
