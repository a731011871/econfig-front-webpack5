import React from 'react';
import PropTypes from 'prop-types';
import { Select, message, Divider } from 'antd';
import { includes } from 'lodash';
import {authServices} from 'src/service/authService';
import { i18nMessages } from 'src/i18n';

const Option = Select.Option;

class SiteSelect extends React.PureComponent {
    static propTypes = {
        projectId: PropTypes.string,
        onChange: PropTypes.func,
        selectRoleInfo: PropTypes.object,
        formatMessage: PropTypes.func,
        value: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            siteList: [],
        };
    }

    componentDidMount() {}


    searchSite = async (keyWords = '') => {
        const selectSiteIds = this.props.value;
        // this.props.toggleLoading();
        try {
            const siteList = await authServices.getAssignedSiteList(
                this.props.projectId,
                keyWords,
                99999
            );
            this.setState({
                siteList: siteList.data
                    .filter(item => !includes(selectSiteIds, item.siteId))
                    .map(item => {
                        return {
                            label: `${
                                item.secondaryCode
                                    ? `[${item.secondaryCode}]`
                                    : ''
                            }${item.aliasName}${
                                item.professionName
                                    ? `(${item.professionName})`
                                    : ''
                            }`,
                            value: item.siteId || ''
                        };
                    }),
            });
            // this.props.toggleLoading();
        } catch (e) {
            message.error(e.message);
        }
    };

    changeSites = (values, options) => {
        console.log(options);
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(values);
        }
    }

    allSelect = () => {
        const onChange = this.props.onChange;
        const values = this.state.siteList.map(item => ({ key: item.value, label: item.label }));
        if (onChange) {
            onChange(values);
        }
    };

    render() {
        const { formatMessage, selectRoleInfo, value } = this.props;
        const disabled = selectRoleInfo.needSite === 0;
        return (
            <Select
                style={{ width: 300 }}
                value={value}
                showSearch
                allowClear
                labelInValue
                mode="multiple"
                filterOption
                optionFilterProp="children"
                disabled={disabled}
                placeholder={
                    !disabled
                        ? formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0297
                        )
                        : selectRoleInfo.nullSiteDefaultValue ===
                        'NONE'
                            ? formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0197
                            )
                            : formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0296
                            )
                }
                onFocus={this.searchSite}
                onChange={this.changeSites}
                onBlur={() => { this.setState({ siteList: [] }); }}
                dropdownRender={menu => (
                    <div>
                        {menu}
                        <Divider style={{ margin: '4px 0' }} />
                        <a
                            style={{
                                display: 'Block',
                                padding: '5px 12px'
                            }}
                            onMouseDown={e => {
                                e.preventDefault();
                            }}
                            onClick={this.allSelect}
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}
                        </a>
                    </div>
                )}
            >
                {this.state.siteList.map(item => (
                    <Option value={item.value} key={item.value} dataRef={item}>
                        {item.label}
                    </Option>
                ))}
            </Select>
        );
    }
}

export default SiteSelect;
