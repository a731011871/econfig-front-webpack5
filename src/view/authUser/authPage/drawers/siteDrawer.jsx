import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, message, Select, Divider } from 'antd';
import { authServices } from 'src/service/authService';
import { includes, uniq } from 'lodash';
import { i18nMessages } from 'src/i18n';
import './siteDrawer.less';

const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;
const Option = Select.Option;
// const CheckboxGroup = Checkbox.Group;

class siteDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        saveSite: PropTypes.func,
        project: PropTypes.string,
        index: PropTypes.number,
        disabled: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {
            siteList: [],
            // checkedList: [],
            // indeterminate: false,
            // checkAll: false,
            selectValues:
                Object.keys(props.project?.siteIds[props.index] || {}) || []
        };
    }

    componentDidMount() {
        this.searchSite('');
    }
    //
    // onChange = checkedList => {
    //     this.setState({
    //         checkedList,
    //         indeterminate:
    //             !!checkedList.length &&
    //             checkedList.length < this.state.siteList.length,
    //         checkAll: checkedList.length === this.state.siteList.length
    //     });
    // };
    //
    // onCheckAllChange = e => {
    //     this.setState({
    //         checkedList: e.target.checked
    //             ? this.state.siteList.map(item => item.value)
    //             : [],
    //         indeterminate: false,
    //         checkAll: e.target.checked
    //     });
    // };

    searchSite = async keyWords => {
        // const selectSiteIds =
        //     Object.keys(this.props.project.siteIds[this.props.index] || {}) ||
        //     [];
        // this.props.toggleLoading();
        let index = 0;
        if (this.props.project.projectIds.length > 1) {
            index = this.props.index;
        }
        try {
            const siteList = await authServices.getCspSiteList(
                this.props.project.projectIds[index],
                keyWords
            );
            this.setState({
                siteList: siteList
                    // .filter(item => !includes(selectSiteIds, item.siteId))
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
                checkedList: [],
                indeterminate: false,
                checkAll: false
            });
            // this.props.toggleLoading();
        } catch (e) {
            message.error(e.message);
        }
    };

    allSelect = () => {
        const selectValues = uniq(this.state.siteList.map(item => item.value));
        this.setState({
            selectValues
        });
    };

    saveSite = () => {
        const selectProject = this.props.project;
        const sites = {};
        this.state.siteList
            .filter(item => includes(this.state.selectValues, item.value))
            .forEach(item => {
                sites[item.value] = item.label;
            });
        selectProject.siteIds[this.props.index] = sites;
        // selectProject.siteIds[this.props.index] = Object.assign(
        //     {},
        //     selectProject.siteIds[this.props.index],
        //     sites
        // );
        console.log('selectProject', selectProject);
        this.props.saveSite([selectProject]);
        this.props.onClose();
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="siteDrawer">
                {/*<Search*/}
                {/*className="mBottom15"*/}
                {/*placeholder={formatMessage(*/}
                {/*i18nMessages.ECONFIG_FRONT_A0241*/}
                {/*)}*/}
                {/*onSearch={this.searchSite}*/}
                {/*style={{ width: '100%' }}*/}
                {/*/>*/}
                {/*<div className="mBottom15">*/}
                {/*<Checkbox*/}
                {/*indeterminate={this.state.indeterminate}*/}
                {/*onChange={this.onCheckAllChange}*/}
                {/*checked={this.state.checkAll}*/}
                {/*>*/}
                {/*{formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}*/}
                {/*</Checkbox>*/}
                {/*</div>*/}
                {/*<CheckboxGroup*/}
                {/*options={this.state.siteList}*/}
                {/*value={this.state.checkedList}*/}
                {/*onChange={this.onChange}*/}
                {/*/>*/}
                <Select
                    className="mBottom15"
                    mode="multiple"
                    value={this.state.selectValues}
                    disabled={!!this.props.disabled}
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0487
                    )}
                    onChange={value => {
                        this.setState({
                            selectValues: value
                        });
                    }}
                    notFoundContent={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0170
                    )}
                    // onChange={this.newHandleChange}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    allowClear
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
                    {this.state.siteList.map(project => (
                        <Option key={project.value} title={project.label}>
                            {project.label}
                        </Option>
                    ))}
                </Select>
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.checkedList.length}家中心*/}
                        {formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0291
                        ).replace('xx', this.state.selectValues.length || 0)}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveSite}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default siteDrawer;
