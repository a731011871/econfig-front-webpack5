import React from 'react';
import { Input, Select, message } from 'antd';
import { $http } from 'utils/http';
import { injectIntl } from 'react-intl';

const urls = {
    getForeignCodeEnums: `/api/im-service/messageSend/getForeignCodeEnums`
};

@injectIntl
class Phone extends React.Component {

    constructor(props) {
        super(props);
        const value = props.value || {};
        console.log(props);
        this.state = {
            foreignCodeEnums: [],
            code: value.code || '',
            phone: value.phone || '',
        };
    }

    componentDidMount() {
        this.getForeignCodes();
    }

    getForeignCodes = async () => {
        try{
            const result = await $http.get(urls.getForeignCodeEnums) || {};
            const foreignCodeEnums = Object.keys(result).map((item, index) => {
                return {
                    name: `${item}(+${result[item]})`,
                    id: `${result[item]}-${index}`,
                    value: `${result[item]}`
                };
            });
            const code = foreignCodeEnums.find(item => item.value === '86').id;
            this.setState({foreignCodeEnums, code});
        }catch(e) {
            message.error(e.message);
        }
    }

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            return {
                ...(nextProps.value || {}),
            };
        }
        return null;
    }

    handlePhoneChange = e => {
        const phone = e.target.value;
        if (!('value' in this.props)) {
            this.setState({ phone });
        }
        this.triggerChange({ phone });
    };
    
    handleCodeChange = code => {
        if (!('value' in this.props)) {
            this.setState({ code });
        }
        this.triggerChange({ code });
    };

    triggerChange = changedValue => {
        const { onChange } = this.props;
        const { code, phone } = this.state;
        if (onChange) {
            onChange({
                code,
                phone,
                ...changedValue
            });
        }
    };

    render() {
        const { foreignCodeEnums, code, phone } = this.state;
        const { placeholder = '' } = this.props;
        const addonBefore = (
            <Select 
                showSearch
                className={`custom_phone`}
                size={this.props.size || 'default'}
                disabled={this.props.disabled || false}
                showArrow={false}
                value={code} 
                onChange={this.handleCodeChange}
                style={{ width: 120, fontSize: '12px', textAlign: 'center' }}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
            >
                {
                    foreignCodeEnums.map(
                        item => (
                            <Select.Option 
                                title={item.name}
                                key={item.id} 
                                value={item.id}
                                item={item}
                                style={{ fontSize: '12px' }}
                            >
                                {item.name}
                            </Select.Option>
                        )
                    )
                }
            </Select>
        );
        if(code) {
            return (
                <Input 
                    onChange={this.handlePhoneChange}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                    value={phone}
                    size={this.props.size || 'default'}
                    disabled={this.props.disabled || false}
                />
            );
        }else {
            return null;
        }
    }
}

const checkMobile = (rule, value, callback) => {
    const phone = value.phone || '';
    const code = value.code || '';
    if(!/^[0-9]*$/.test(phone)) {
        callback('手机号码不正确!');
    }
    if(phone.length > 50) {
        callback('手机号码不能大于50个字符');
    }
    if(phone && code) {
        callback();
    }
    callback('手机号码不能为空!');
};

export {
    Phone,
    checkMobile
};