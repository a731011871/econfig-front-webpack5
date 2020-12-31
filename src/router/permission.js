import React, { lazy } from 'react';
const RoleManage = lazy(() => import('../view/roleManage'));
const AdminPage = lazy(() => import('../view/adminPage'));
const SystemPage = lazy(() => import('../view/systemPage'));
const ProjectUser = lazy(() => import('../view/projectUser'));
const WarehouseManagement = lazy(() =>
    import('../view/settings/warehouseManagement')
);
const EmailSetting = lazy(() => import('../view/settings/emailSetting'));
const DeptManagement = lazy(() => import('../view/deptManagement'));
const EnvironmentManagement = lazy(() =>
    import('../view/settings/environmentManagement')
);
const UserManagement = lazy(() => import('../view/userManagement'));
const BaseInfo = lazy(() => import('../view/baseInfo'));
const Log = lazy(() => import('../view/log'));
const Safety = lazy(() => import('../view/settings/safety'));
const Dictionary = lazy(() => import('../view/settings/dictionary'));
const Signature = lazy(() => import('../view/settings/signature'));
const ProjectManage = lazy(() => import('../view/projectManage'));
const SetTrailOs = lazy(() => import('../view/setTrailOs'));
const SystemConfig = lazy(() => import('../view/settings/systemConfig'));
const LoginCustomPage = lazy(() => import('../view/settings/loginCustomPage'));
const AuthSearch = lazy(() => import('../view/authSearch'));
const Index = lazy(() => import('../view/home'));
const Sponsor = lazy(() => import('../view/settings/sponsor'));
const Cro = lazy(() => import('../view/settings/cro'));
const Institution = lazy(() => import('../view/settings/institution'));
const SystemAudit = lazy(() => import('../view/systemAudit'));
const AuthorizationTrace = lazy(() => import('../view/authorizationTrace'));
const ElectronicSignature = lazy(() => import('../view/electronicSignature'));

// 首页权限控制
const permissionRouters = {
    index: () => <Index />,
    soft_list: () => <SystemPage />,
    user_manage: UserManagement,
    project_manage: props => <ProjectManage {...props} />,
    // 'user_manage':() => <ProjectUser />,
    role_manage: () => <RoleManage />,
    project_user: props => <ProjectUser {...props} />,
    department_manage: props => <DeptManagement {...props} />,
    log_search: () => <Log />,
    base_info: () => <BaseInfo />,
    admin: () => <AdminPage />,
    data_dictionary: () => <Dictionary />,
    pwd_safe: () => <Safety />,
    sign_set: () => <Signature />,
    env_manage: () => <EnvironmentManagement />,
    store_manage: () => <WarehouseManagement />,
    email_config: () => <EmailSetting />,
    set_trialos: () => <SetTrailOs />,
    system_config: () => <SystemConfig />,
    loginpage: () => <LoginCustomPage />,
    auth_search: AuthSearch,
    sponsor_manage: () => <Sponsor />,
    cro_manage: () => <Cro />,
    institution_manage: () => <Institution />,
    system_audit: () => <SystemAudit />,
    authorization_trace: AuthorizationTrace,
    electronic_signature: ElectronicSignature
};

export { permissionRouters };
