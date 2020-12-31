import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

export function deptItem(props) {
    // const [showButton, changeButton] = useState(false);
    // console.log(showButton);
    return (
        <div className="deptItem">
            <span className="deptName mRight15">{props.name || ''}</span>
            <div className="deptButtons Visibility InlineBlock">
                <a
                    className="mRight8"
                    onClick={e => {
                        e.stopPropagation();
                        props.editDept();
                    }}
                >
                    <Icon type="edit" />
                </a>
                <a
                    className="mRight5"
                    onClick={e => {
                        e.stopPropagation();
                        props.deleteDept();
                    }}
                >
                    <Icon type="delete" />
                </a>
            </div>
        </div>
    );
}

deptItem.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    deleteDept: PropTypes.func,
    editDept: PropTypes.func
};
