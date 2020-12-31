import React from 'react';
import { Icon } from 'antd';
// import { $http } from 'utils/http';
// import { i18nMessages } from 'src/i18n';

import './index.less';

class SortButton extends React.Component {

    static defaultProps = { 
        type: '', // asc desc ''
        text: 'Demo',
    }

    render() {
        const { type, text, ...configs } = this.props;
        return (
            <div className="sort-button" {...configs}>
                <div>{text}</div>
                <div className="caret">
                    <Icon style={type === 'asc' ? {color: '#1890ff'} : {}} type="caret-up" />
                    <Icon style={type === 'desc' ? {color: '#1890ff'} : {}} type="caret-down" />
                </div>
            </div>
        );
    }


}

export default SortButton;