/*
 * @Author: lei.zhao
 * @Date: 2020-08-28 14:22:10
 * @LastEditTime: 2020-08-28 17:30:27
 * @LastEditors: lei.zhao
 * @Description: 角色批量授权弹层
 * @FilePath: /econfig-front/src/view/roleManage/roleAuth/index.jsx
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { deptService } from 'src/service/deptService';
import DepartmentList from './deparmentList';

export default function RoleAuth(props) {
    const { appId, roleInfo } = props;
    console.log(appId, roleInfo);
    const [departmentList, setDept] = useState([]); //部门列表
    const [memberList, setMemberList] = useState([]); // 选择部门下的人员列表
    const [authMemberList, setAuthMemberList] = useState([]); // 当前角色授权的人员列表
    console.log(memberList,authMemberList );
    console.log(setMemberList, setAuthMemberList);
    useEffect(() => {
        const getQuote = async () => {
            const data = await deptService.fetchDepartment();
            setDept(data || []);
        };
        getQuote();
    }, []);
    const changeSelectDept = async (departmentId) => {
        const departmentMember = await deptService.fetchMember(
            departmentId
        );
        setMemberList(departmentMember);
    };
    const onOk = () => {
        alert('onOk');
    };

    return (
        <Modal
            className="roleProjectSiteModal"
            title="角色授权"
            width={1000}
            onOk={onOk}
            cancelText={null}
            onCancel={props.onCancel}
            visible={props.visible}
        >
            <div className="flexRow">
                <div style={{ flex: 1 }}>
                    <DepartmentList departmentList={departmentList} changeSelectDept={changeSelectDept}/>
                </div>
                <div style={{ flex: 2 }}>人员</div>
            </div>
        </Modal>
    );
}

RoleAuth.propTypes = {
    visible: PropTypes.bool.isRequired,
    appId: PropTypes.string.isRequired,
    roleInfo: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired
};
