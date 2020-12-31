import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isEmpty, debounce, includes } from 'lodash';
import { message, Button, Upload, Modal } from 'antd';
import { fieldHasError } from 'utils/fieldHasError';
import { LoadingHoc } from 'component/LoadingHoc';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import { getBasicInfoAreaValues, getDataFromArea } from 'utils/functions';
import userTemplate from 'assets/file/userTemplate.xls';
import AuthPage from 'src/component/authPage';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import BasicInfo from './basicInfo';
import { deptService } from '../../../service/deptService';

const FixedDiv = styled.div`
    position: fixed;
    top: 58px;
    right: 10px;
    left: 10px;
    height: 60px;
    line-height: 60px;
    z-index: 3;
    background: #fff;
`;
const confirm = Modal.confirm;

@injectIntl
@LoadingHoc
class DepartmentMemberDrawerView extends React.PureComponent {
    static propTypes = {
        match: PropTypes.string,
        history: PropTypes.object,
        departmentId: PropTypes.string,
        type: PropTypes.string, // new edit 页面是邀请页面还是编辑页面
        // 从项目管理中邀请授权判断参数
        fromProjectManage: PropTypes.bool, // 是否从项目管理中邀请授权
        isInvite: PropTypes.bool, // true-邀请  false-编辑
        projectId: PropTypes.string, // 项目Id
        // 从授权查询进入人员详情
        fromAuthSearch: PropTypes.bool,
        goBack: PropTypes.func, // 从授权查询进入详情，返回列表方法
        userId: PropTypes.string
    };

    get isEdit() {
        // 是编辑页面还是要请页面
        return this.props.type === 'edit';
    }

    get departmentId() {
        return this.props.match.params.departmentId;
    }

    get userId() {
        return this.props.fromAuthSearch
            ? this.props.userId
            : this.props.match.params.userId;
    }

    constructor(props) {
        super(props);
        this.state = {
            deptInfo: {},
            // edit: !!props.fromProjectManage && !!props.isInvite, //如果是从项目管理中邀请部门用户，进入页面时候需要是编辑状态
            edit: true, //默认编辑状态 表单是填写状态还是禁用状态
            userInfo: {},
            selectUserInfo: {}, //根据邮箱查到的人员信息
            disabledSave: false // 要请部门人员时候，防止输完邮箱不onBlur直接点击保存按钮数据错误的情况，在邮箱输完onBlur时候先禁用保存按钮，数据获取完再放开
        };
        this.BasicInfo = React.createRef();
        this.authPage = React.createRef();
    }

    componentDidMount = async () => {
        try {
            this.props.toggleLoading();
            let deptInfo = {};
            if (!this.props.fromProjectManage && !this.props.fromAuthSearch) {
                deptInfo = await deptService.getDepartmentInfo(
                    this.departmentId
                );
            }
            let userInfo = {};
            if (this.userId) {
                userInfo = await deptService.getMemberInfo(this.userId);
                userInfo.area = getBasicInfoAreaValues(userInfo);
            }
            this.setState({ deptInfo, userInfo });
        } catch (e) {
            message.error(e.message);
        } finally {
            this.props.toggleLoading();
        }
    };

    updateReset = async () => {
        try {
            const userInfo = await deptService.getMemberInfo(this.userId);
            if (
                userInfo.status !== this.state.userInfo.status &&
                userInfo.status === '1'
            ) {
                window.location.reload();
            } else {
                this.authPage.current.cancelReset();
                this.setState({ userInfo, edit: !this.state.edit });
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    cancelReset = () => {
        this.BasicInfo.current.props.form.setFieldsValue(
            Object.assign(
                {
                    address: '',
                    mobile: '',
                    timeZone: '',
                    email: '',
                    userName: '',
                    enName: '',
                    jobNumber: '',
                    position: '',
                    area: []
                },
                this.state.userInfo
            )
        );
        this.authPage.current.cancelReset();
    };

    saveUser = async isSave => {
        const userInfoFormDto = this.BasicInfo.current.props.form.getFieldsValue();
        const { deptInfo, userInfo } = this.state;
        const hasError = fieldHasError(
            this.BasicInfo.current.props.form.getFieldsError()
        );
        if (hasError) {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0270)
            );
        } else {
            const authLayRoleInfnVos = this.authPage.current.getAuthDto();
            const nullAppIds = this.authPage.current.getAppIds();
            this.authPage.current.setOldAuthInfo();
            let userId = userInfo.userId || '';
            if (authLayRoleInfnVos) {
                try {
                    this.props.toggleLoading();
                    if (this.isEdit && this.state.userInfo.status === '1') {
                        // 编辑人员信息时候删除sourceForm参数
                        const oldUserInfo = Object.assign({}, userInfo);
                        delete oldUserInfo.sourceFrom;
                        await $http.post(
                            `${urls.updateUserInfo}?projectId=${this.props
                                .projectId || ''}`,
                            {
                                userId: this.state.userInfo.userId || '',
                                userManagementDto: Object.assign(
                                    {},
                                    oldUserInfo,
                                    userInfoFormDto,
                                    {
                                        sourceOrganId: userInfo.organIds
                                    },
                                    getDataFromArea(userInfoFormDto.area)
                                ),
                                appIds: nullAppIds,
                                authLayRoleInfnVos,
                                projectId: this.props.projectId || ''
                            }
                        );
                    } else {
                        userId = await $http.post(
                            `${urls.addUserInfo}?isSave=${isSave}`,
                            {
                                userId:
                                    this.state.selectUserInfo.userId ||
                                    this.state.userInfo.userId ||
                                    '',
                                inviteId:
                                    this.state.selectUserInfo.inviteId ||
                                    this.state.userInfo.inviteId ||
                                    '',
                                userManagementDto: Object.assign(
                                    {},
                                    this.state.selectUserInfo,
                                    userInfoFormDto,
                                    {
                                        organId: deptInfo.id,
                                        organType: deptInfo.organType
                                    }
                                ),
                                appIds: nullAppIds,
                                authLayRoleInfnVos
                            }
                        );
                    }
                    message.success(
                        isSave
                            ? this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0649
                              )
                            : this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0359
                              )
                    );
                    if (this.props.type === 'new') {
                        // if (this.props.location.searchObj) {
                        //     this.props.history.push({
                        //         pathname: '/department_manage',
                        //         searchObj: this.props.location.searchObj
                        //     });
                        // } else {

                        setTimeout(() => {
                            location.href = `/econfig/department_manage/edit/${deptInfo.id}/${userId}`;
                        }, 1000);
                        // }
                    } else if (
                        this.props.fromProjectManage &&
                        this.props.isInvite
                    ) {
                        //如果是从项目管理中邀请部门用户，保存完需要返回列表
                        this.props.history.goBack();
                    } else {
                        this.updateReset();
                    }
                } catch (e) {
                    message.error(e.message);
                }
                this.props.toggleLoading();
            }
        }
    };

    beforeUpload = file => {
        //根据电脑系统判断不同的文件，mac系统需要xlsx文件，其他系统xls文件
        // const platform = navigator.platform;
        // if (platform.indexOf('Mac') > -1) {
        //     const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        //     if (!isXlsx) {
        //         message.error(
        //             this.props.intl.formatMessage(
        //                 i18nMessages.ECONFIG_FRONT_A0276
        //             ) +
        //                 this.props.intl.formatMessage(
        //                     i18nMessages.ECONFIG_FRONT_A0307
        //                 ).replace('xls', 'xlsx')
        //         );
        //     }
        //     return isXlsx;
        // } else {
        //     const isXls = file.type === 'application/vnd.ms-excel';
        //     if (!isXls) {
        //         message.error(
        //             this.props.intl.formatMessage(
        //                 i18nMessages.ECONFIG_FRONT_A0276
        //             ) +
        //                 this.props.intl.formatMessage(
        //                     i18nMessages.ECONFIG_FRONT_A0307
        //                 )
        //         );
        //     }
        //     return isXls;
        // }
        //这个判断不完善，application/vnd.ms-excel是xls的文件类型，xls在mac上type为空，无法上传
        // const isXls = file.type === 'application/vnd.ms-excel';
        // if (!isXls) {
        //     message.error(
        //         this.props.intl.formatMessage(
        //             i18nMessages.ECONFIG_FRONT_A0276
        //         ) +
        //             this.props.intl.formatMessage(
        //                 i18nMessages.ECONFIG_FRONT_A0307
        //             )
        //     );
        // }
        // 只判断后缀 xls 和xlsx
        const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
        if (!includes(['xls', 'xlsx'], extension)) {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0276)
            );
        }
        return includes(['xls', 'xlsx'], extension);
        // console.log(file);
        // return true;
    };

    customRequest = res => {
        const _this = this;
        this.setState({ xlsLoading: true });
        const activeDeptInfo = this.state.deptInfo;
        const csp_loginInfo =
            JSON.parse(sessionStorage.getItem('csp_loginInfo')) || {};
        const formData = new FormData();
        formData.append('multipartFile', res.file);
        formData.append('appId', 'csp');
        formData.append('tenantId', csp_loginInfo.tenantId || 'default');
        $http
            .post(urls.upload, formData, { timeout: 60000 })
            .then(fs => {
                $http
                    .post(
                        urls.createByImportExcel,
                        Object.assign({}, fs, {
                            organId: activeDeptInfo.id
                        }),
                        { timeout: 600000 }
                    )
                    .then(excelInfo => {
                        if (excelInfo.flag) {
                            message.success(
                                `${this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0277
                                )},
                                    ${this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0278
                                    )}`
                            );
                            _this.setState({ xlsLoading: false });
                            if (_this.props.location.searchObj) {
                                _this.props.history.push({
                                    pathname: '/department_manage',
                                    searchObj: this.props.location.searchObj
                                });
                            } else {
                                _this.props.history.push('/department_manage');
                            }
                        } else {
                            const erroList = excelInfo.erroList || [];
                            if (erroList.length > 0) {
                                const _html = erroList.map(item => {
                                    return `${item}<br>`;
                                });
                                Modal.error({
                                    title: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0202
                                    ),
                                    okText: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0279
                                    ),
                                    content: (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: _html
                                            }}
                                        />
                                    )
                                });
                            }
                        }
                        this.setState({ xlsLoading: false });
                    })
                    .catch(e => {
                        message.error(e.message);
                        setTimeout(() => {
                            this.setState({ xlsLoading: false });
                        }, 800);
                    });
            })
            .catch(e => {
                message.error(e.message);
                setTimeout(() => {
                    this.setState({ xlsLoading: false });
                }, 800);
            });
    };

    deleteConfirm = debounce(
        async () => {
            const _this = this;
            const { userId, isAuth } = this.state.userInfo;
            try {
                const tips = await $http.get(urls.checkUserAuth, { userId });
                if (tips.length > 0) {
                    Modal.info({
                        title: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0202
                        ),
                        content: (
                            <div style={{ wordBreak: 'break-all' }}>
                                {parseApiUrl(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0661
                                    ),
                                    {
                                        apps: tips.map(t => t.appName).join(',')
                                    }
                                )}
                            </div>
                        ),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        onOk() {}
                    });
                } else {
                    confirm({
                        title: (
                            <div style={{ color: '#FF0000' }}>
                                {`${
                                    isAuth
                                        ? this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0318
                                          )
                                        : this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0228
                                          )
                                },${this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0535
                                )}`}
                            </div>
                        ),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        cancelText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0281
                        ),
                        // content: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0535),
                        onOk: async () => {
                            try {
                                await $http.delete(
                                    `${urls.deleteUser}?userId=${userId}&departmentId=${this.departmentId}`
                                );
                                message.success(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0233
                                    )
                                );
                                if (_this.props.fromAuthSearch) {
                                    _this.props.goBack(true);
                                } else {
                                    if (_this.props.location.searchObj) {
                                        _this.props.history.push({
                                            pathname: '/department_manage',
                                            searchObj: this.props.location
                                                .searchObj
                                        });
                                    } else {
                                        _this.props.history.push(
                                            '/department_manage'
                                        );
                                    }
                                }
                            } catch (e) {
                                message.error(e.message);
                            }
                        },
                        onCancel() {}
                    });
                }
            } catch (e) {
                message.error(e.message);
            }
        },
        500,
        { leading: true, trailing: false }
    );

    selectUserByEmail = userInfo => {
        this.setState({ selectUserInfo: userInfo, disabledSave: false });
    };

    changeDisabledSave = disabledSave => {
        this.setState({ disabledSave });
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        console.log(this.state.userInfo);
        const { disabledSave } = this.state;
        return (
            <div className="deptMemberInfoPage pTop40 Relative">
                <FixedDiv style={{ top: this.props.fromAuthSearch && 50 }}>
                    {/*如果是从项目管理和从授权查询中进入人员详情，顶部的部门信息不予显示*/}
                    {!this.props.fromProjectManage &&
                        !this.props.fromAuthSearch && (
                            <div
                                className="mLeft40 Font18 InlineBlock"
                                style={{ color: '#18b0e6' }}
                            >
                                {this.state.deptInfo.organizeName}-
                                {this.isEdit
                                    ? this.state.userInfo.userName
                                    : this.props.intl.formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0280
                                      )}
                            </div>
                        )}
                    <div className="Right InlineBlock">
                        {/*如果是部门人员列表编辑，第一个按钮为编辑取消*/}
                        {/*如果是部门邀请人员，第一个按钮是下载模板*/}
                        {/*如果是项目管理中邀请部门用户，此位置不显示*/}
                        {this.isEdit && !this.props.isInvite ? (
                            <Button
                                className=" mRight15"
                                type="primary"
                                onClick={() => {
                                    if (this.state.edit) {
                                        this.cancelReset();
                                    }
                                    this.setState({ edit: !this.state.edit });
                                }}
                            >
                                {this.state.edit
                                    ? this.props.intl.formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0281
                                      )
                                    : formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0098
                                      )}
                            </Button>
                        ) : !this.props.fromProjectManage ? (
                            <Button href={userTemplate} className="mRight15">
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0092
                                )}
                            </Button>
                        ) : null}

                        {/*如果是部门人员列表编辑，第二个按钮为删除*/}
                        {/*如果是部门邀请人员，第二个按钮是批量导入*/}
                        {/*如果是项目管理中邀请部门用户，此位置不显示*/}
                        {this.isEdit && !this.props.fromProjectManage ? (
                            <Button
                                className="mRight15"
                                type="primary"
                                onClick={this.deleteConfirm}
                            >
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0070
                                )}
                            </Button>
                        ) : !this.props.fromProjectManage &&
                          !this.props.fromAuthSearch ? (
                            <Upload
                                name="file"
                                showUploadList={false}
                                customRequest={this.customRequest}
                                beforeUpload={this.beforeUpload}
                                className="user-upload"
                            >
                                <Button
                                    type="primary"
                                    className="mRight15"
                                    loading={this.state.xlsLoading}
                                >
                                    {formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0093
                                    )}
                                </Button>
                            </Upload>
                        ) : null}

                        <Button
                            className=" mRight15"
                            onClick={() => {
                                if (this.props.fromProjectManage) {
                                    this.props.history.goBack();
                                } else if (this.props.fromAuthSearch) {
                                    this.props.goBack();
                                } else {
                                    // 如果返回列表需要记录之前的搜索状态，使用push，把搜索参数传回去
                                    this.props.history.push({
                                        pathname: '/department_manage',
                                        searchObj:
                                            this.props.location.searchObj ||
                                            null
                                    });
                                }
                            }}
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0094)}
                        </Button>
                    </div>
                </FixedDiv>
                {/*邀请人员或者编辑人员&有当前人员信息才显示详情页面，不然页面里面会报错*/}
                {!this.isEdit ||
                (this.isEdit && !isEmpty(this.state.userInfo)) ? (
                    <BasicInfo
                        wrappedComponentRef={this.BasicInfo}
                        isEdit={this.isEdit}
                        edit={this.state.edit}
                        deptInfo={this.state.deptInfo}
                        selectUserByEmail={this.selectUserByEmail}
                        memberInfo={this.state.userInfo}
                        changeDisabledSave={this.changeDisabledSave}
                        // selectDepartmentId={this.departmentId}
                    />
                ) : null}
                {!this.isEdit ||
                (this.isEdit && !isEmpty(this.state.userInfo)) ? (
                    <AuthPage
                        ref={this.authPage}
                        fromProjectManage={this.props.fromProjectManage}
                        projectId={this.props.projectId}
                        appId={this.props.match.params.appId}
                        email={this.state.userInfo.email}
                        userName={this.state.userInfo.userName}
                        intl={this.props.intl}
                        userId={this.userId}
                        userType="companyUser"
                        userProperty={this.state.userInfo.userProperty}
                        edit={!this.isEdit || this.state.edit}
                    />
                ) : null}

                <div className="TxtCenter">
                    {(this.state.edit || !this.isEdit) && (
                        <Button
                            type="primary"
                            className="mRight15 mBottom15 mTop15"
                            disabled={
                                (this.isEdit && isEmpty(this.state.userInfo)) ||
                                disabledSave
                            }
                            onClick={() => {
                                this.saveUser(true);
                            }}
                        >
                            {/*{formatMessage(*/}
                            {/*this.state.userInfo.status === '0' || !this.isEdit*/}
                            {/*? i18nMessages.ECONFIG_FRONT_A0360*/}
                            {/*: i18nMessages.ECONFIG_FRONT_A0062*/}
                            {/*)}*/}
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0062
                            )}
                        </Button>
                    )}
                    {(!this.isEdit ||
                        (this.state.userInfo.status === '0' &&
                            this.state.edit)) && (
                        <Button
                            type="primary"
                            className="mRight15 mBottom15 mTop15"
                            disabled={disabledSave}
                            onClick={() => {
                                this.saveUser(false);
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0271
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

export default DepartmentMemberDrawerView;
