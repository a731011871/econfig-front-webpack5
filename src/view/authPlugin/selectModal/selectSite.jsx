import React from 'react';
import PropTypes from 'prop-types';
import { i18nMessages } from 'src/i18n';
import { Modal, Select, Divider } from 'antd';

export default class SelectSite extends React.PureComponent {
    static propTypes = {
        selectValue: PropTypes.array,
        visible: PropTypes.bool,
        siteList: PropTypes.array,
        onSelectSite: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            selectValue: props.selectValue || []
        };
    }

    changeSites = values => {
        this.setState({ selectValue: values });
    };

    allSelect = () => {
        this.setState({
            selectValue: this.props.siteList.map(item => item.siteId)
        });
    };

    onOk = () => {
        this.props.onSelectSite(this.state.selectValue);
    };

    render() {
        const { formatMessage } = this.props;
        const { selectValue } = this.state;
        return (
            <Modal
                className="roleProjectSiteModal"
                title={`${formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0164
                )}-${formatMessage(i18nMessages.ECONFIG_FRONT_A0635)}`}
                width={640}
                onOk={this.onOk}
                onCancel={this.props.onCancel}
                visible={this.props.visible}
            >
                <div className="mBottom8">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0637)}
                </div>
                <Select
                    style={{ width: 450 }}
                    showSearch
                    allowClear
                    value={selectValue}
                    mode="multiple"
                    optionFilterProp="children"
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0297
                    )}
                    onChange={this.changeSites}
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
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0195
                                )}
                            </a>
                        </div>
                    )}
                >
                    {this.props.siteList.map(item => (
                        <Select.Option
                            value={item.siteId}
                            key={item.siteId}
                            dataRef={item}
                        >
                            {item.siteName}
                        </Select.Option>
                    ))}
                </Select>
            </Modal>
        );
    }
}
