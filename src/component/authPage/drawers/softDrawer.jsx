import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import styled from 'styled-components';
import { i18nMessages } from 'src/i18n';
import { Select, Button } from 'antd';

const Option = Select.Option;
const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;

class softDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        selectSoftIds: PropTypes.array,
        selectRole: PropTypes.array,
        softList: PropTypes.array,
        record: PropTypes.object,
        addDataItem: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            selectValues: []
        };
    }

    onChange = values => {
        this.setState({
            selectValues: values
        });
    };

    saveSoft = () => {
        const record = cloneDeep(this.props.selectRole);
        record.softIds = record.softIds.concat(this.state.selectValues);
        this.props.addDataItem([record]);
        this.props.onClose();
    };

    render() {
        const { softList } = this.props;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="softDrawer">
                <Select
                    className="mBottom15"
                    mode="multiple"
                    // labelInValue
                    value={this.state.selectValues}
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0447
                    )}
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    onChange={this.onChange}
                    style={{ width: '100%' }}
                >
                    {softList.length > 0
                        ? softList.map(soft => (
                            <Option
                                key={soft.appId}
                                title={soft.appName}
                            >
                                {soft.appName}
                            </Option>
                        ))
                        : null}
                </Select>
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0533
                        ).replace('xx', this.state.selectValues.length || 0)}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveSoft}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default softDrawer;
