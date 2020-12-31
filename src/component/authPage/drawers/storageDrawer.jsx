import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Checkbox } from 'antd';
import './siteDrawer.less';
import { cloneDeep } from 'lodash';
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

class storageDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        storageList: PropTypes.array,
        saveStorage: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            checkedList: [],
            indeterminate: false,
            checkAll: false
        };
    }

    onChange = checkedList => {
        this.setState({
            checkedList,
            indeterminate:
                !!checkedList.length &&
                checkedList.length < this.props.storageList.length,
            checkAll: checkedList.length === this.props.storageList.length
        });
    };

    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked
                ? this.props.storageList.map(item => item.id)
                : [],
            indeterminate: false,
            checkAll: e.target.checked
        });
    };

    saveStorage = () => {
        const project = cloneDeep(this.props.project);
        project.storageIds = project.storageIds.concat(this.state.checkedList);
        this.props.saveStorage([project]);
        this.props.onClose();
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="siteDrawer">
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
                    options={this.props.storageList.map(item => {
                        return { label: item.storeroomName, value: item.id };
                    })}
                    value={this.state.checkedList}
                    onChange={this.onChange}
                />
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.checkedList.length}条*/}
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0285).replace('xx', this.state.checkedList.length || 0)}
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
