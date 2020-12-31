import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, message, Checkbox } from 'antd';
import { authServices } from 'src/service/authService';
import { includes } from 'lodash';
// import { LoadingHoc } from 'src/component/LoadingHoc';
import { i18nMessages } from 'src/i18n';
import '../drawers/siteDrawer.less';

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

class storageDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        saveStorage: PropTypes.func,
        project: PropTypes.string,
        index: PropTypes.number
    };

    constructor(props) {
        super(props);
        this.state = {
            storageList: [],
            checkedList: [],
            indeterminate: false,
            checkAll: false
        };
    }

    componentDidMount() {
        this.searchStorage();
    }

    onChange = checkedList => {
        this.setState({
            checkedList,
            indeterminate:
                !!checkedList.length &&
                checkedList.length < this.state.storageList.length,
            checkAll: checkedList.length === this.state.storageList.length
        });
    };

    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked
                ? this.state.storageList.map(item => item.value)
                : [],
            indeterminate: false,
            checkAll: e.target.checked
        });
    };

    searchStorage = async () => {
        const selectStorageIds =
            Object.keys(this.props.project.storageMap[this.props.index] || {}) ||
            [];
        // this.props.toggleLoading();
        let index = 0;
        if (this.props.project.projectIds.length > 1) {
            index = this.props.index;
        }
        try {
            const storageList = await authServices.getAssignedStorageList(
                this.props.project.projectIds[index],
                'esupply'
            );
            this.setState({
                storageList: storageList
                    .filter(item => !includes(selectStorageIds, item.id))
                    .map(item => {
                        return {
                            label: item.storeroomName,
                            value: item.id || ''
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

    saveStorage = () => {
        const selectProject = this.props.project;
        const storages = {};
        this.state.storageList
            .filter(item => includes(this.state.checkedList, item.value))
            .forEach(item => {
                storages[item.value] = item.label;
            });
        selectProject.storageMap[this.props.index] = Object.assign(
            {},
            selectProject.storageMap[this.props.index],
            storages
        );
        console.log('selectProject', selectProject);
        this.props.saveStorage([selectProject]);
        this.props.onClose();
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="storageDrawer">
                {/*<Search*/}
                {/*className="mBottom15"*/}
                {/*placeholder={formatMessage(*/}
                {/*i18nMessages.ECONFIG_FRONT_A0241*/}
                {/*)}*/}
                {/*onSearch={this.searchstorage}*/}
                {/*style={{ width: '100%' }}*/}
                {/*/>*/}
                <div className="mBottom15">
                    <Checkbox
                        indeterminate={this.state.indeterminate}
                        onChange={this.onCheckAllChange}
                        checked={this.state.checkAll}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}
                    </Checkbox>
                </div>
                <CheckboxGroup
                    options={this.state.storageList}
                    value={this.state.checkedList}
                    onChange={this.onChange}
                />
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.checkedList.length}个库房*/}
                        {formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0375
                        ).replace('xx', this.state.checkedList.length || 0)}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveStorage}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default storageDrawer;
