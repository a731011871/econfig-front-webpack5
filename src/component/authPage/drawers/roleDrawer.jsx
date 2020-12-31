import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Checkbox, Radio, message } from 'antd';
import './siteDrawer.less';
import { cloneDeep, includes } from 'lodash';
import { i18nMessages } from 'src/i18n';

const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

class roleDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        authType: PropTypes.string,
        onClose: PropTypes.func,
        roleList: PropTypes.array,
        saveRole: PropTypes.func,
        type: PropTypes.oneOf(['new', 'edit']),
        selectProjects: PropTypes.array,

        edcAppType: PropTypes.string // edc中的角色类型（前端系统，后端系统），根据系统类型，有不同的添加角色处理
    };

    constructor(props) {
        super(props);
        let roleList = props.roleList;
        const selectProjects = props.selectProjects;
        if (props.type === 'edit' && props.appId !== 'econfig') {
            roleList = roleList.filter(item => item.isEdit || includes(selectProjects[0].roleIds, item.id));
        } else if (props.appId !== 'econfig'){
            roleList = roleList.filter(item => item.isEdit);
        }
        this.state = {
            roleList,
            checkedList: [],
            checkedValue: '',
            indeterminate: false,
            checkAll: false,
            projectData: []
        };
    }

    get isEdit() {
        return this.props.type === 'edit';
    }

    componentDidMount() {
        if (this.isEdit) {
            const project = this.props.selectProjects[0];
            const projectData = project.roleIds.map((item, index) => ({
                roleId: project.roleIds[index],
                siteIds: project.siteIds[index]
            }));
            const checkedList = this.state.roleList
                .filter(item => includes(project.roleIds, item.id))
                .map(item => item.id);
            this.setState({
                projectData,
                checkedList,
                checkAll: checkedList.length === this.state.roleList.length,
                indeterminate:
                    checkedList.length > 0 &&
                    checkedList.length < this.state.roleList.length
            });
        }
    }

    onChange = checkedList => {
        this.setState({
            checkedList,
            indeterminate:
                !!checkedList.length &&
                checkedList.length < this.state.roleList.length,
            checkAll: checkedList.length === this.state.roleList.length
        });
    };

    radioChange = e => {
        this.setState({
            checkedValue: e.target.value
        });
    };

    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked
                ? this.state.roleList.map(item => item.id)
                : [],
            indeterminate: false,
            checkAll: e.target.checked
        });
    };

    saveRole = () => {
        /**
         * edc有两种授权模型（前端系统/后端系统）
         * 前端系统时，角色为第二列，原添加逻辑不变
         * 后端系统时，添加角色逻辑和 authType=2, 4的添加逻辑相同
         * */
        const { authType, edcAppType } = this.props;
        if (authType === '1') {
            const projectList = this.state.checkedList.map(item => {
                return {
                    projectIds: [],
                    envIds: [],
                    roleIds: [item],
                    siteIds: []
                };
            });
            this.props.saveRole(this.props.appId, projectList);
        } else if (authType === '5') {
            const projectList = this.state.checkedList.map(item => {
                return {
                    projectIds: [],
                    roleIds: [item],
                    storageIds: []
                };
            });
            this.props.saveRole(this.props.appId, projectList);
        } else if (
            includes(['2', '4'], authType) ||
            (authType === '8' && edcAppType === 'ecollect_admin_role')
        ) {
            /** edc后端系统时，添加角色逻辑和 authType=2, 4的添加逻辑相同*/
            const projectList = this.state.checkedList.map(item => {
                return {
                    projectIds: [],
                    roleIds: [item],
                    siteIds: []
                };
            });
            this.props.saveRole(this.props.appId, projectList);
        } else if (includes(['9'], authType)) {
            if (this.state.checkedValue) {
                const projectList = [
                    {
                        projectIds: [],
                        roleIds: [this.state.checkedValue],
                        softIds: []
                    }
                ];
                this.props.saveRole(this.props.appId, projectList);
            } else {
                message.error(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0292
                    )
                );
                return;
            }
        } else if (authType === '3') {
            const projectList = this.state.checkedList.map(item => {
                return {
                    projectIds: [],
                    roleIds: [item],
                    productDataIds: []
                };
            });
            this.props.saveRole(this.props.appId, projectList);
        } else {
            const selectProjects = cloneDeep(this.props.selectProjects);
            const { checkedList } = this.state;
            if (authType === '6' && this.props.type === 'edit') {
                let projectData = cloneDeep(this.state.projectData);
                projectData = projectData.filter(item =>
                    includes(checkedList, item.roleId)
                );
                checkedList.forEach(item => {
                    if (
                        !includes(
                            projectData.map(projectItem => projectItem.roleId),
                            item
                        )
                    ) {
                        projectData.push({ roleId: item, siteIds: [] });
                    }
                });
                const projects = { projectIds: selectProjects[0].projectIds };
                projects.roleIds = projectData.map(item => item.roleId);
                projects.siteIds = projectData.map(item => item.siteIds);
                this.props.saveRole([projects]);
            } else {
                selectProjects.forEach(projectItem => {
                    projectItem.roleIds = checkedList;
                    projectItem.siteIds = checkedList.map((item, index) =>
                        projectItem.siteIds[index]
                            ? projectItem.siteIds[index]
                            : []
                    );
                });
                this.props.saveRole(selectProjects);
            }
        }
        this.props.onClose();
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="siteDrawer">
                {this.props.appId !== 'econfig' && (
                    <div className="mBottom15">
                        <Checkbox
                            indeterminate={this.state.indeterminate}
                            onChange={this.onCheckAllChange}
                            checked={this.state.checkAll}
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}
                        </Checkbox>
                    </div>
                )}
                {this.props.appId !== 'econfig' ? (
                    <CheckboxGroup
                        options={this.state.roleList.map(item => {
                            return { label: item.roleName, value: item.id };
                        })}
                        value={this.state.checkedList}
                        onChange={this.onChange}
                    />
                ) : (
                    <RadioGroup
                        options={this.state.roleList.map(item => {
                            return { label: item.roleName, value: item.id };
                        })}
                        value={this.state.checkedValue}
                        onChange={this.radioChange}
                    />
                )}
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.checkedList.length}角色*/}
                        {formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0290
                        ).replace(
                            'xx',
                            this.props.appId === 'econfig'
                                ? this.state.checkedValue
                                    ? 1
                                    : 0
                                : this.state.checkedList.length || 0
                        )}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveRole}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default roleDrawer;
