import React from 'react';
import PropTypes from 'prop-types';
import {cloneDeep, includes, uniq} from 'lodash';
import styled from 'styled-components';
import { i18nMessages } from 'src/i18n';
import { Select, Button, Table, Divider } from 'antd';
import { modalFun } from 'src/component/modal';
import ProductSearch from './productSearch';

const Option = Select.Option;
const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
    z-index: 99;
`;
const Content = text => <div style={{ wordBreak: 'break-word' }}>{text}</div>;

class productDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        productList: PropTypes.array,
        selectProductIds: PropTypes.array,
        selectRecords: PropTypes.object, //site中需要选择项目的单条数据
        saveProduct: PropTypes.func
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0337
            ),
            dataIndex: 'commonZhName',
            width: 120,
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0338
            ),
            dataIndex: 'authNum',
            width: 120,
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0339
            ),
            dataIndex: 'specification',
            width: 130,
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0340
            ),
            dataIndex: 'manufacture',
            width: 200,
            render: Content
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0087
            ),
            dataIndex: 'id',
            key: 'action',
            render: id => {
                return (
                    <a
                        style={{ width: 50, display: 'block' }}
                        href="javascript:void(0)"
                        onClick={() => {
                            this.deleteProduct(id);
                        }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0145
                        )}
                    </a>
                );
            }
        }
    ];

    constructor(props) {
        super(props);
        this.state = {
            selectProduct:
                this.props.productList.filter(item =>
                    includes(props.selectProductIds || [], item.id)
                ) || [],
            isAll: false,
            selectValues: props.selectProductIds || [],
            productSelectkey: '1' // pv  产品由全选切换为全部时候，Select选中值渲染卡死，定义一个Select的Key,加快Select渲染速度
        };
    }

    newHandleChange = values => {
        const productList = this.props.productList.filter(item =>
            includes(values, item.id)
        );
        // const projectList = this.state.projectList.filter(item => item.projectId !== value[0]);
        const isAll = values.indexOf('ALL') >= 0;
        this.setState({
            // projectList,
            selectProduct: isAll ? [] : productList,
            selectValues: isAll ? ['ALL'] : values,
            isAll,
            productSelectkey: isAll ? Math.random() : '1'
        });
    };

    deleteProduct = productId => {
        this.setState({
            selectProduct: this.state.selectProduct.filter(
                item => item.id !== productId
            ),
            selectValues: this.state.selectValues.filter(
                item => item !== productId
            )
        });
    };

    saveProduct = () => {
        const selectRecords = cloneDeep(this.props.selectRecords);
        selectRecords.forEach(item => {
            // item.productDataIds = uniq(item.productDataIds.concat(
            //     this.state.selectProduct.map(item => item.id)
            // ));
            item.productDataIds = this.state.selectProduct.map(item => item.id);
            if (this.state.isAll) {
                item.productDataIds = ['ALL'];
            }
        });
        this.props.saveProduct(selectRecords);
        this.props.onClose();
    };

    showProductSearch = () => {
        modalFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0520
            ),
            width: 1200,
            compontent: props => (
                <ProductSearch
                    {...props}
                    selectValues={this.state.selectValues}
                    intl={this.props.intl}
                    appId={this.props.appId}
                    changeProduct={this.newHandleChange}
                />
            )
        });
    };

    allSelect = () => {
        const selectValues = uniq(this.props.productList.filter(item => item.id !== 'ALL').map(item => item.id));
        this.setState({
            selectValues,
            selectProduct: this.props.productList.filter(item => item.id !== 'ALL'),
            isAll: false
        });
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        const SelectAll =
            this.state.selectValues.length > 0 &&
            this.state.selectValues[0] === 'ALL';
        const productDataList = this.props.productList.map(item => {
            return { id: item.id, commonZhName: item.commonZhName };
        });
        return (
            <div className="productDrawer">
                <a
                    className={`mBottom8 Block ${SelectAll && 'Gray_9e'}`}
                    style={{ textDecoration: 'none' }}
                    onClick={SelectAll ? null : this.showProductSearch}
                >
                    {this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0520
                    )}
                </a>
                <Select
                    className="mBottom15"
                    mode="multiple"
                    key={this.state.productSelectkey}
                    value={this.state.selectValues}
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0051
                    )}
                    notFoundContent={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0189
                    )}
                    onSelect={this.onSelect}
                    onChange={this.newHandleChange}
                    style={{ width: '100%' }}
                    filterOption
                    allowClear
                    optionFilterProp="children"
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
                                {formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}
                            </a>
                        </div>
                    )}
                >
                    <Option key={`ALL`} name={`全部`}>
                        全部
                    </Option>
                    {productDataList
                        .filter(item => item.id && item.commonZhName)
                        .map(product => (
                            <Option
                                disabled={this.state.isAll}
                                key={product.id}
                                name={product.commonZhName}
                            >
                                {product.commonZhName}
                            </Option>
                        ))}
                </Select>
                <div className="selectData">
                    <div>{formatMessage(i18nMessages.ECONFIG_FRONT_A0190)}</div>
                    <div className="selectProductList">
                        <Table
                            dataSource={this.state.selectProduct}
                            columns={this.columns}
                            pagination={false}
                            scroll={{ y: 240 }}
                        />
                        {/*{this.state.selectProduct.map(item => (*/}
                        {/*<div*/}
                        {/*className="productItem flexRow overflowHidden mTop8"*/}
                        {/*key={item.id}*/}
                        {/*>*/}
                        {/*<span*/}
                        {/*className="InlineBlock flex overflow_ellipsis mLeft15 pRight15"*/}
                        {/*title={item.id}*/}
                        {/*>*/}
                        {/*{item.commonZhName}*/}
                        {/*</span>*/}
                        {/*<Icon*/}
                        {/*type="close"*/}
                        {/*className="pointer"*/}
                        {/*onClick={() => {*/}
                        {/*this.deleteProduct(item.id);*/}
                        {/*}}*/}
                        {/*/>*/}
                        {/*</div>*/}
                        {/*))}*/}
                    </div>
                </div>
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.selectProduct.length}条*/}
                        {formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0285
                        ).replace('xx', this.state.selectProduct.length || 0)}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveProduct}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default productDrawer;
