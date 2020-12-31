import React from 'react';
import PropTypes from 'prop-types';
import { i18nMessages } from 'src/i18n';
import { Modal, Select, Divider } from 'antd';

export default class SelectRole extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        roleList: PropTypes.array,
        onSelectRole: PropTypes.func,
        appId: PropTypes.string
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
            selectValue: this.props.roleList.map(item => item.id)
        });
    };

    onOk = () => {
        this.props.onSelectRole(this.state.selectValue);
    };

    render() {
        const { formatMessage, appId } = this.props;
        const { selectValue } = this.state;
        return (
            <Modal
                className="roleProjectSiteModal"
                title={formatMessage(i18nMessages.ECONFIG_FRONT_A0293)}
                width={640}
                onOk={this.onOk}
                onCancel={this.props.onCancel}
                visible={this.props.visible}
            >
                <div className="mBottom8">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0636)}
                </div>
                <Select
                    style={{ width: '100%' }}
                    showSearch
                    allowClear
                    value={selectValue}
                    mode={appId === 'sms' ? null : 'multiple'}
                    optionFilterProp="children"
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0292
                    )}
                    onChange={this.changeSites}
                    dropdownRender={
                        appId === 'sms'
                            ? menu => menu
                            : menu => (
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
                            )
                    }
                >
                    {this.props.roleList.map(item => (
                        <Select.Option
                            value={item.id}
                            key={item.id}
                            dataRef={item}
                        >
                            {item.roleName}
                        </Select.Option>
                    ))}
                </Select>
            </Modal>
        );
    }
}
