import React from 'react';
import { connect } from 'src/model/index';
import { LoadingHoc } from 'component/LoadingHoc';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { debounce } from 'lodash';
import DepartmentList from './departmentList/index';
import DepartmentMember from './departmentMemberList/index';
import DepartmentDrawer from './departmentModal/index';
import { deptService } from 'src/service/deptService';
import { message, Modal } from 'antd';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import '../style.less';

@injectIntl
@LoadingHoc
@connect(state => ({
    departmentList: state.deptManagement.departmentList,
    activeDepartmentInfo: state.deptManagement.activeDepartmentInfo,
    departmentMember: state.deptManagement.departmentMember
}))
class DepartmentView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showDepartmentModal: false,
            tenantType: '', //租户类型
            editDepartment: false, // 是否编辑部门
            searchMemberObj: {} // 部门人员的搜索参数，搜索后保存，编辑部门，新增人员，删除部门等操作以后用来判断是否要全局刷新
        };
        this.departmentMemberList = React.createRef();
    }

    get activeDepartmentId() {
        return this.props.activeDepartmentInfo.id;
    }

    get deptManagementEffects() {
        return this.props.effects.deptManagement;
    }

    // /**
    //  *
    //  * @returns {Promise<void>}
    //  */
    componentDidMount = async () => {
        this.props.toggleLoading();
        try {
            this.deptManagementEffects.fetchDepartment(
                !this.props.location.searchObj
            );
            const enterpriseInfo = await $http.get(urls.getEnterpriseInfo);
            const tenantType = enterpriseInfo.tenantType;
            this.setState({ tenantType });
        } catch (e) {
            message.error(e.message);
        }
        this.props.toggleLoading();
    };

    hideDepartmentInfoDrawer = () => {
        this.setState({ showDepartmentModal: false });
    };

    changeActiveDepartment = (departmentId, organizeCasecadeUserCount) => {
        this.props.toggleLoading();
        this.departmentMemberList.current.clearSearch();
        this.deptManagementEffects.changeActiveDepartment(
            departmentId,
            organizeCasecadeUserCount
        );
        this.props.toggleLoading();
    };

    addDepartment = async departmentInfo => {
        this.hideDepartmentInfoDrawer();
        this.props.toggleLoading();
        try {
            await deptService.addDepartment(departmentInfo);
            this.deptManagementEffects.fetchDepartment(false, this.state.searchMemberObj);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0357)
            );
        } catch (e) {
            message.error(e.message);
        } finally {
            this.props.toggleLoading();
        }
    };

    deleteDepartment = async deptId => {
        try {
            this.props.toggleLoading();
            await deptService.deleteDepartment(deptId);
            this.deptManagementEffects.fetchDepartment(deptId === this.activeDepartmentId, this.state.searchMemberObj);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
        } catch (e) {
            message.error(e.message);
        } finally {
            this.props.toggleLoading();
        }
    };

    deleteDepartmentMember = departmentMemberId => {
        this.deptManagementEffects.deleteMember(
            departmentMemberId,
            'department',
            this.state.searchMemberObj
        );
    };

    fetchMember = debounce(
        (status, keyWords, pageIndex, pageSize, position) => {
            this.props.toggleLoading();
            try {
                this.deptManagementEffects.fetchMember(
                    this.activeDepartmentId,
                    status,
                    keyWords,
                    pageIndex,
                    pageSize,
                    position
                );
                this.setState({
                    searchMemberObj: {
                        status,
                        keyWords,
                        pageIndex,
                        pageSize,
                        position
                    }
                });
            } catch (e) {
                message.error(e.message);
            } finally {
                this.props.toggleLoading();
            }
        },
        300
    );

    render() {
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="department h100 flexRow mLeft16">
                {this.props.departmentList.length > 0 && (
                    <DepartmentList
                        tenantType={this.state.tenantType}
                        activeDepartmentId={this.activeDepartmentId}
                        addDepartment={this.addDepartment}
                        deptManagementEffects={this.deptManagementEffects}
                        toggleLoading={this.props.toggleLoading}
                        departmentList={this.props.departmentList || []}
                        showDepartmentModal={isEdit => {
                            this.setState({
                                showDepartmentModal: true,
                                editDepartment: isEdit
                            });
                        }}
                        searchMemberObj={this.state.searchMemberObj}
                        deleteDepartment={this.deleteDepartment}
                        changeActiveDepartment={this.changeActiveDepartment}
                    />
                )}
                {this.props.departmentList.length > 0 && (
                    <DepartmentMember
                        history={this.props.history}
                        location={this.props.location}
                        deptManagementEffects={this.deptManagementEffects}
                        activeDepartmentInfo={this.props.activeDepartmentInfo}
                        departmentMember={this.props.departmentMember}
                        activeDepartmentId={this.activeDepartmentId}
                        fetchMember={this.fetchMember}
                        intl={this.props.intl}
                        toggleLoading={this.props.toggleLoading}
                        showDepartmentModal={() => {
                            this.setState({
                                showDepartmentModal: true,
                                editDepartment: true
                            });
                        }}
                        ref={this.departmentMemberList}
                        deleteDepartmentMember={this.deleteDepartmentMember}
                        deleteDepartment={this.deleteDepartment}
                    />
                )}
                <Modal
                    className="departmentModal"
                    title={
                        this.state.editDepartment
                            ? formatMessage(i18nMessages.ECONFIG_FRONT_A0098)
                            : this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0259
                            )
                    }
                    width={600}
                    maskClosable
                    destroyOnClose
                    footer={null}
                    onCancel={this.hideDepartmentInfoDrawer}
                    visible={this.state.showDepartmentModal}
                >
                    <DepartmentDrawer
                        type="new"
                        tenantType={this.state.tenantType}
                        // departmentInfo={this.props.activeDepartmentInfo}
                        departmentList={this.props.departmentList || []}
                        // updateDepartment={this.updateDepartment}
                        hideDrawer={this.hideDepartmentInfoDrawer}
                        addDepartment={this.addDepartment}
                    />
                </Modal>
            </div>
        );
    }
}

export default DepartmentView;
