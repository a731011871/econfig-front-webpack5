import React from 'react';
import { Col, Input, Form, Select, Radio } from 'antd';
import { isArray, isEmpty } from 'lodash';
import AreaSelect from '../areaSelect';
import { Phone, checkMobile } from 'src/component/phone';

const { TextArea } = Input;

const formItemLayoutTop = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 24 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 }
    }
};

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 24 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 }
    }
};

const formItemLayout24 = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 23 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 23 }
    }
};

export { formItemLayout, formItemLayout24, formItemLayoutTop };

export function universalform({
    key,
    label,
    value = '',
    title = '',
    bottomText = '',
    span = 12,
    rules = [],
    type = 'input',
    size = 'default',
    require = false,
    maxLength = null,
    disabled = false,
    allowClear = true,
    filterOption = false,
    selectList = [],
    onSearch = null,
    onSelect = null,
    onChange = null,
    onBlur = null,
    mode = 'multiple',
    placeholder = '',
    validateTrigger = 'onChange',
    validateFirst = false,
    customFormItemLayout = {},
    labelInValue = false,
    getFieldDecorator
}) {
    const econfigLanguage =
        localStorage.getItem('econfigLanguage') ||
        (
            JSON.parse(localStorage.getItem('sso_loginAccountInfo') || '{}')
                .selectLanguage || {}
        ).key;
    const isUniversalformSearch = typeof onSearch === 'function' ? true : false;
    const isUniversalformSelect = typeof onSelect === 'function' ? true : false;
    const isUniversalformChange = typeof onChange === 'function' ? true : false;
    const isUniversalformBlur = typeof onBlur === 'function' ? true : false;
    const itemValue = value === 'undefined' ? '' : value;
    const rulesArray = isArray(rules) ? rules : [rules];
    const rulesLengthObject =
        maxLength === null
            ? {}
            : {
                max: maxLength,
                message:
                      econfigLanguage === 'zh_CN'
                          ? `不允许超过${maxLength}个字符!`
                          : `cannot be longer than ${maxLength} characters`
            };

    switch (type) {
        case 'input':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        },
                                        rulesLengthObject,
                                        ...rulesArray
                                    ],
                                    validateFirst,
                                    validateTrigger
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(
                            <Input
                                title={title}
                                autocomplete="off"
                                placeholder={
                                    placeholder ||
                                    `${
                                        econfigLanguage === 'zh_CN'
                                            ? '请输入'
                                            : 'Please enter '
                                    }${label}`
                                }
                                size={size}
                                disabled={disabled}
                                rows={4}
                                onBlur={isUniversalformBlur ? onBlur : null}
                            />
                        )}
                        {bottomText !== '' ? bottomText : null}
                    </Form.Item>
                </Col>
            );
        case 'password':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        },
                                        rulesLengthObject,
                                        ...rulesArray
                                    ],
                                    validateFirst,
                                    validateTrigger
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(
                            <Input.Password
                                autocomplete="new-password"
                                placeholder={
                                    placeholder ||
                                    `${
                                        econfigLanguage === 'zh_CN'
                                            ? '请输入'
                                            : 'Please enter '
                                    }${label}`
                                }
                                size={size}
                                disabled={disabled}
                                rows={4}
                            />
                        )}
                    </Form.Item>
                </Col>
            );
        case 'textarea':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout24}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        },
                                        rulesLengthObject,
                                        ...rulesArray
                                    ],
                                    validateFirst,
                                    validateTrigger
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(
                            <TextArea
                                placeholder={
                                    placeholder ||
                                    `${
                                        econfigLanguage === 'zh_CN'
                                            ? '请输入'
                                            : 'Please enter '
                                    }${label}`
                                }
                                disabled={disabled}
                                rows={4}
                            />
                        )}
                    </Form.Item>
                </Col>
            );
        case 'multiple_input':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        }
                                    ],
                                    validateFirst,
                                    validateTrigger
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(
                            <Select
                                allowClear={allowClear}
                                size={size}
                                mode={mode}
                                disabled={disabled}
                                placeholder={
                                    placeholder ||
                                    `${
                                        econfigLanguage === 'zh_CN'
                                            ? '请选择'
                                            : 'Please choose '
                                    }${label}`
                                }
                                showSearch={isUniversalformSearch}
                                labelInValue={labelInValue}
                                filterOption={
                                    filterOption
                                        ? (input, option) =>
                                            option.props.children.indexOf(
                                                input
                                            ) >= 0
                                        : false
                                }
                                onSearch={
                                    isUniversalformSearch ? onSearch : null
                                }
                                onSelect={
                                    isUniversalformSelect ? onSelect : null
                                }
                                onChange={
                                    isUniversalformChange ? onChange : null
                                }
                            >
                                {selectList.map(item => (
                                    <Select.Option
                                        title={item.name}
                                        key={item.value}
                                        item={item}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                        {bottomText !== '' ? bottomText : null}
                    </Form.Item>
                </Col>
            );
        case 'single_dropdown':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        }
                                    ]
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(
                            <Select
                                allowClear={allowClear}
                                size={size}
                                disabled={disabled}
                                defaultActiveFirstOption={false}
                                placeholder={
                                    placeholder ||
                                    `${
                                        econfigLanguage === 'zh_CN'
                                            ? '请选择'
                                            : 'Please choose '
                                    }${label}`
                                }
                                showSearch={isUniversalformSearch}
                                labelInValue={labelInValue}
                                filterOption={
                                    filterOption
                                        ? (input, option) =>
                                            option.props.children.indexOf(
                                                input
                                            ) >= 0
                                        : false
                                }
                                onSearch={
                                    isUniversalformSearch ? onSearch : null
                                }
                                onSelect={
                                    isUniversalformSelect ? onSelect : null
                                }
                                onChange={
                                    isUniversalformChange ? onChange : null
                                }
                            >
                                {selectList.map(item => (
                                    <Select.Option
                                        title={item.name}
                                        key={item.value}
                                        item={item}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                </Col>
            );
        case 'radio':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        }
                                    ]
                                },
                                isEmpty(itemValue)
                                    ? { initialValue: itemValue }
                                    : {}
                            )
                        )(
                            <Radio.Group>
                                {selectList.map(item => (
                                    <Radio
                                        key={item.value}
                                        item={item}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </Form.Item>
                </Col>
            );
        case 'only_read':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {itemValue || '-'}
                    </Form.Item>
                </Col>
            );
        case 'areaselect':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    initialValue: itemValue,
                                    rules: [
                                        {
                                            required: require,
                                            message: `${label}${
                                                econfigLanguage === 'zh_CN'
                                                    ? '是必填项'
                                                    : ' is required'
                                            }!`
                                        }
                                    ]
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(
                            <AreaSelect
                                placeholder={placeholder || ''}
                                type={1}
                                size={size}
                            />
                        )}
                    </Form.Item>
                </Col>
            );
        case 'phone':
            return (
                <Col span={span} key={key}>
                    <Form.Item
                        {...formItemLayout}
                        {...customFormItemLayout}
                        label={label}
                        required={require}
                    >
                        {getFieldDecorator(
                            key,
                            Object.assign(
                                {},
                                {
                                    initialValue: itemValue,
                                    rules: [{ validator: checkMobile }]
                                },
                                itemValue ? { initialValue: itemValue } : {}
                            )
                        )(<Phone size={size} />)}
                    </Form.Item>
                </Col>
            );
    }
}
