import React from 'react';
import PropType from 'prop-types';
import { Cascader, message } from 'antd';
import { isEqual, findIndex, debounce } from 'lodash';
// import tmsRequest from 'tms-request';
import {LoadingHoc} from '../LoadingHoc';
import { $http } from 'utils/http';
import { getCurrentLanguage } from 'utils/utils';

// export const $http = tmsRequest.create({
//     timeout: 500000,
//     cache: true
// });

@LoadingHoc
class AreaSelect extends React.Component {
    static propTypes = {
        value: PropType.any,
        onChange: PropType.func,
        disabled: PropType.bool,
        placeholder: PropType.string,
        type: PropType.oneOf([1, 2, 3, 4]) // 类型 1-国家/省/市/区县  2-省/市/区县 3-国家/省/市 4 省市
    };

    static defaultProps = {
        value: [],
        onChange: () => {},
        type: 2
    };

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps && nextProps.value.length > 0) {
            return {
                // ...(nextProps.value || {})
                value: nextProps.value || []
            };
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(this.props.value, prevProps.value)) {
            this.getDefaultData();
        }
    }

    /**
     * @return {void}
     */
    async componentDidMount() {
        this.props.toggleLoading();
        try {
            let firstData = [];
            const countries = await $http.get(
                '../api/omp-service/getCountries'
            );
            const province = await $http.get(
                '../api/omp-service/getProvinces/2b1f8485-1b5f-4c08-906b-4c569c8df59b'
            );
            if (this.props.type === 1 || this.props.type === 3) {
                firstData = countries;
            } else {
                firstData = province;
            }
            const options = firstData.map(dataItem => {
                // level：地址等级 1-国家级 2-省级 3-市级 4-区/县级
                return {
                    value: dataItem.id,
                    label: this.state.language === 'en_US' ? (dataItem.enName || dataItem.cnName) : dataItem.cnName,
                    isLeaf: false,
                    level: dataItem.level
                };
            });
            this.setState({ options });
        } catch (e) {
            message.error(e.message);
        } finally {
            this.props.toggleLoading();
        }
    }

    state = {
        inputValue: '',
        options: [],
        value: [],
        language: getCurrentLanguage()
    };

    async getDefaultData() {
        const { value } = this.props;
        let { options } = this.state;
        // if (this.state.options.length > 0) {
        this.props.toggleLoading();
        try {
            if (options.length === 0) {
                let firstData = [];
                const countries = await $http.get(
                    '../api/omp-service/getCountries'
                );
                const province = await $http.get(
                    `../api/omp-service/getProvinces/2b1f8485-1b5f-4c08-906b-4c569c8df59b`
                );
                if (this.props.type === 1 || this.props.type === 3) {
                    firstData = countries;
                } else {
                    firstData = province;
                }
                const newOptions = firstData.map(dataItem => {
                    // level：地址等级 1-国家级 2-省级 3-市级 4-区/县级
                    return {
                        value: dataItem.id,
                        label: this.state.language === 'en_US' ? (dataItem.enName || dataItem.cnName) : dataItem.cnName,
                        isLeaf: false,
                        level: dataItem.level
                    };
                });
                options = newOptions;
            }
            if (value.length >= 2) {
                const firstIndex = findIndex(
                    options,
                    item => item.value === value[0]
                );
                if (
                    !options[firstIndex].children ||
                    !options[firstIndex].children.length
                ) {
                    let secondData = [];
                    if (this.props.type === 1 || this.props.type === 3) {
                        secondData = await $http.get(
                            `../api/omp-service/getProvinces/${value[0]}`
                        );
                    } else {
                        secondData = await $http.get(
                            `../api/omp-service/getCities/${value[0]}`
                        );
                    }
                    const childrenData = secondData.map(dataItem => {
                        return {
                            value: dataItem.id,
                            label: this.state.language === 'en_US' ? (dataItem.enName || dataItem.cnName) : dataItem.cnName,
                            isLeaf: this.props.type === 4,
                            level: dataItem.level
                        };
                    });
                    options[firstIndex].children = childrenData;
                }
            }
            if (value.length >= 3) {
                let thirdData = [];
                const firstIndex = findIndex(
                    options,
                    item => item.value === value[0]
                );
                const secondIndex = findIndex(
                    options[firstIndex].children,
                    item => item.value === value[1]
                );
                if (
                    !options[firstIndex].children[secondIndex].children ||
                    !options[firstIndex].children[secondIndex].children.length
                ) {
                    if (this.props.type === 1 || this.props.type === 3) {
                        thirdData = await $http.get(
                            `../api/omp-service/getCities/${value[1]}`
                        );
                    } else {
                        thirdData = await $http.get(
                            `../api/omp-service/getCounties/${value[1]}`
                        );
                    }
                    const childrenData = thirdData.map(dataItem => {
                        return {
                            value: dataItem.id,
                            label: this.state.language === 'en_US' ? (dataItem.enName || dataItem.cnName) : dataItem.cnName,
                            isLeaf: this.props.type !== 1,
                            level: dataItem.level
                        };
                    });
                    options[firstIndex].children[
                        secondIndex
                    ].children = childrenData;
                }
            }
            if (value.length === 4) {
                const fourthData = await $http.get(
                    `../api/omp-service/getCounties/${value[2]}`
                );
                const childrenData = fourthData.map(dataItem => {
                    return {
                        value: dataItem.id,
                        label: this.state.language === 'en_US' ? (dataItem.enName || dataItem.cnName) : dataItem.cnName,
                        isLeaf: true,
                        level: dataItem.level
                    };
                });
                const firstIndex = findIndex(
                    options,
                    item => item.value === value[0]
                );
                const secondIndex = findIndex(
                    options[firstIndex].children,
                    item => item.value === value[1]
                );
                const thirdIndex = findIndex(
                    options[firstIndex].children[secondIndex].children,
                    item => item.value === value[2]
                );
                options[firstIndex].children[secondIndex].children[
                    thirdIndex
                ].children = childrenData;
            }
            this.setState({ options });
        } catch (e) {
            message.error('未匹配到对应区域');
            console.log(e.message);
        } finally {
            this.props.toggleLoading();
        }
        // }
    }

    onChange = (value, selectedOptions) => {
        const endOption = selectedOptions[selectedOptions.length - 1];
        const inputValue = selectedOptions.map(o => o.label).join(', ');
        this.setState({
            inputValue
        });
        if (endOption &&
            (!endOption.children || !endOption.children.length) &&
            (endOption.level === 1 ||
                endOption.level === 2 ||
                (endOption.level === 3 &&
                    (this.props.type === 1 || this.props.type === 2)))
        ) {
            this.loadData(selectedOptions);
        }
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(value);
        }
    };

    loadData = debounce(selectedOptions => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        // load options lazily
        let getUrl = '';
        if (targetOption.level === 1) {
            getUrl = `../api/omp-service/getProvinces/${targetOption.value}`;
        } else if (targetOption.level === 2) {
            getUrl = `../api/omp-service/getCities/${targetOption.value}`;
        } else if (targetOption.level === 3) {
            getUrl = `../api/omp-service/getCounties/${targetOption.value}`;
        }
        if (targetOption.level === 4) return;
        $http.get(getUrl).then(data => {
            targetOption.loading = false;
            // if (!data.length) { targetOption.isLeaf = true; }
            targetOption.children = data.length
                ? data.map(dataItem => {
                    return {
                        value: dataItem.id,
                        label: this.state.language === 'en_US' ? (dataItem.enName || dataItem.cnName) : dataItem.cnName,
                        level: dataItem.level,
                        isLeaf:
                              this.props.type === 3 || this.props.type === 4
                                  ? targetOption.level === 2
                                  : targetOption.level === 3
                    };
                })
                : null;
            this.setState(
                {
                    options: [...this.state.options]
                },
                () => {}
            );
        });
    }, 500);

    filter = (inputValue, path) => {
        console.log(path);
        return path.some(
            option => option.level === 1 &&
                option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >
                -1
        ) && path.filter(item => item.level > 1).length === 0;
    };

    // async getCounty() {
    //
    // }
    render() {
        return (
            <Cascader
                options={this.state.options}
                loadData={this.loadData}
                onChange={this.onChange}
                changeOnSelect
                size={this.props.size}
                placeholder={this.props.placeholder || ''}
                allowClear
                showSearch={{ filter: this.filter }}
                disabled={this.props.disabled}
                value={this.props.value}
            />
        );
    }
}

export default AreaSelect;
