import React from 'react';
import { Button, Input } from 'antd';
import styled from 'styled-components';
const { Search } = Input;
import {injectIntl} from 'react-intl';
import { i18nMessages } from 'src/i18n';

const TableHeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

@injectIntl
class TableHeader extends React.Component {

    static defaultProps = { 
        placeholder: '',
        onSearch: () => {},
        onAdd: () => {}
    }

    render() {
        return (
            <TableHeaderContainer>
                <Search
                    placeholder={this.props.placeholder || this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0241)}
                    onSearch={(value) => this.props.onSearch(value)}
                    style={{ width: 200 }}
                />
                <Button onClick={this.props.onAdd} type="primary">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0259)}</Button>
            </TableHeaderContainer>
        );
    }


}

export default TableHeader;