import React from 'react';
import urls from 'utils/urls';
import { debounce } from 'lodash';
import { $http } from 'utils/http';
import { getBasicInfoAreaValues } from 'utils/functions';
import { i18nMessages } from 'src/i18n';
import { encrypt } from 'utils/utils';
import { Form, Col, message, Upload, Icon } from 'antd';
import { universalform, formItemLayoutTop } from 'src/component/universalForm';
import { injectIntl } from 'react-intl';
import CompanyLogoUrl from '../../../public/assets/images/ico_company.svg';
import Project from '@tms/tenant-project';

@injectIntl
@Form.create()
class BaseInfo extends React.Component {
    state = {
        companyList: [], // 所属集团公司
        enterpriseInfo: {}, // 企业信息
        currentSelectCompany: {}, // 当前选择所属集团公司
        buttonLoading: false,
        logoUrl: CompanyLogoUrl,
        logoLoading: '',
        visible: false
    };

    componentWillMount() {
        this.getEnterpriseInfo();
    }

    // 初始化企业信息
    getEnterpriseInfo = async () => {
        try {
            // const econfigLanguage = localStorage.getItem('econfigLanguage') || ((JSON.parse(localStorage.getItem('sso_loginAccountInfo') || '{}').selectLanguage || {}).key);
            const enterpriseInfo = await $http.get(urls.getEconfigEnterpriseInfo);
            // enterpriseInfo.tenantType = 'INSTITUTION';
            await this.onCompanySearch('', enterpriseInfo.groupCompany || '');
            this.FormElement[
                'groupCompany'
            ].onSearch = this.onCompanySearch;
            /**
             * 当类型是机构的时候，去掉公司网址，加上法人代表
             * 当企业类型是申办方，机构，CRO的时候，所属集团公司的数据要从不同的接口来获取
             */
            let tenantType = '';
            if (enterpriseInfo.tenantType === 'INSTITUTION') {
                this.FormElement[
                    'groupCompany'
                ].label = this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0226
                );
                this.FormElement[
                    'tenantName'
                ].label = this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0313
                );
                tenantType = this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0247);
                delete this.FormElement['webHome'];
            } else if (enterpriseInfo.tenantType === 'CRO') {
                tenantType = 'CRO';
                delete this.FormElement['legalPerson'];
            } else if (enterpriseInfo.tenantType === 'SPONSOR') {
                tenantType = this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0022);
                delete this.FormElement['legalPerson'];
            } else if(enterpriseInfo.tenantType === 'OTHER'){
                tenantType = this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0621);
            }
            
            this.setState({
                enterpriseInfo: {
                    ...enterpriseInfo,
                    areas: getBasicInfoAreaValues(enterpriseInfo),
                    tenantType,
                },
                
                logoUrl: enterpriseInfo.logoUrl || CompanyLogoUrl
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    // 搜索公司医院
    onCompanySearch = debounce(async (name = '', id = '') => {
        const companyListOriginDatas = await $http.post(urls.getNewCompanyList, {
            pools: ['TEMP_SPONSOR','INSTITUTION','SPONSOR','CRO'],
            name,
            pageNo: 1,
            pageSize: 10,
            ids: id
        });
        const companyList =
            companyListOriginDatas.list &&
            companyListOriginDatas.list.map(item => {
                return {
                    name: item.name,
                    value: item.id
                };
            });
        this.setState({ companyList });
    }, 500);

    // 申办方
    onSponsorSearch = debounce(async name => {
        const companyListOriginDatas = await $http.post(urls.getCompanyList, {
            criteria: {
                conditions: [
                    {
                        entityName: 'CompanyPharmnetPO',
                        joint: 'AND',
                        operator: 'contains',
                        propertyName: 'companyName',
                        value: name || ''
                    }
                ]
            },
            pageNo: 1,
            pageSize: 10,
            paging: true
        });
        const companyList =
            companyListOriginDatas.list &&
            companyListOriginDatas.list.map(item => {
                return {
                    name: item.companyName,
                    value: item.companyName
                };
            });
        this.setState({ companyList });
    }, 500);

    // CRO
    onCroSearch = debounce(async name => {
        const croListOriginDatas = await $http.post(urls.getCroList, {
            criteria: {
                conditions: [
                    {
                        entityName: 'CompanyPharmnetPO',
                        joint: 'AND',
                        operator: 'contains',
                        propertyName: 'name',
                        value: name || ''
                    }
                ]
            },
            pageNo: 1,
            pageSize: 10,
            paging: true
        });
        const croList =
            croListOriginDatas.list &&
            croListOriginDatas.list.map(item => {
                return {
                    name: item.name,
                    value: item.name
                };
            });
        this.setState({ companyList: croList });
    }, 500);

    // 机构
    onInstitutionSearch = debounce(async name => {
        const institutionListOriginDatas = await $http.post(
            urls.getInstitution,
            {
                criteria: {
                    conditions: [
                        {
                            entityName: 'CompanyPharmnetPO',
                            joint: 'AND',
                            operator: 'contains',
                            propertyName: 'name',
                            value: name || ''
                        }
                    ]
                },
                pageNo: 1,
                pageSize: 10,
                paging: true
            }
        );
        const institutionList =
            institutionListOriginDatas.list &&
            institutionListOriginDatas.list.map(item => {
                return {
                    name: item.name,
                    value: item.name
                };
            });
        this.setState({ companyList: institutionList });
    }, 500);

    FormElement = {
        logoUrl: {
            key: 'logoUrl',
            label: 'LOGO',
            // require: true,
            customFormItemLayout: formItemLayoutTop
        },
        tenantType: {
            key: 'tenantType',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0052
            ),
            type: 'input',
            require: true,
            disabled: true,
            customFormItemLayout: formItemLayoutTop
        },
        tenantName: {
            key: 'tenantName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0053
            ),
            type: 'input',
            require: true,
            disabled: true,
            customFormItemLayout: formItemLayoutTop
        },
        socialCreditCode: {
            key: 'socialCreditCode',
            disabled: true,
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0054
            ),
            type: 'input',
            // require: true,
            customFormItemLayout: formItemLayoutTop
        },
        groupCompany: {
            key: 'groupCompany',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0055
            ),
            type: 'single_dropdown',
            onSearch: this.onSponsorSearch,
            customFormItemLayout: formItemLayoutTop
        },
        contactPerson: {
            key: 'contactPerson',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0056
            ),
            type: 'input',
            maxLength: 150,
            customFormItemLayout: formItemLayoutTop
        },
        contactMobile: {
            key: 'contactMobile',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0057
            ),
            type: 'input',
            maxLength: 150,
            customFormItemLayout: formItemLayoutTop
        },
        webHome: {
            key: 'webHome',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0058
            ),
            type: 'input',
            maxLength: 200,
            customFormItemLayout: formItemLayoutTop
        },
        legalPerson: {
            key: 'legalPerson',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0225
            ),
            type: 'input',
            maxLength: 150,
            customFormItemLayout: formItemLayoutTop
        },
        contactFax: {
            key: 'contactFax',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0059
            ),
            type: 'input',
            maxLength: 150,
            customFormItemLayout: formItemLayoutTop
        },
        areas: {
            key: 'areas',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0060
            ),
            type: 'areaselect',
            customFormItemLayout: formItemLayoutTop
        },
        address: {
            key: 'address',
            span: 24,
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0061
            ),
            type: 'textarea',
            maxLength: 200,
            customFormItemLayout: formItemLayoutTop
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let tenantType = '';
                this.setState({ buttonLoading: true });
                const { enterpriseInfo, logoUrl } = this.state;
                const country = values.areas[0] || '';
                const province = values.areas[1] || '';
                const city = values.areas[2] || '';
                const county = values.areas[3] || '';
                if (values.tenantType === '机构' || values.tenantType === 'Organization') {
                    tenantType = 'INSTITUTION';
                } else if (values.tenantType === 'CRO') {
                    tenantType = 'CRO';
                } else if (values.tenantType === '申办方' || values.tenantType === 'sponsor') {
                    tenantType = 'SPONSOR';
                } else if(values.tenantType === '其他' || values.tenantType === 'Other'){
                    tenantType = 'OTHER';
                }
                try {
                    const params = {
                        ...values,
                        tenantId: enterpriseInfo.tenantId,
                        tenantType,
                        country,
                        province,
                        city,
                        county,
                        groupCompany: values.groupCompany || '',
                        logoUrl
                    };
                    delete params.tenantName;
                    await $http.put(urls.updateEconfigTenant, params);
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0230
                        )
                    );
                } catch (e) {
                    message.warning(e.message);
                } finally {
                    this.setState({ buttonLoading: false });
                }
            }
        });
    }, 500);

    // 获取与设置FORM
    getFormItem = datas => {
        const { companyList = [], logoUrl = CompanyLogoUrl, logoLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);
        const econfigLanguage = localStorage.getItem('econfigLanguage') || ((JSON.parse(localStorage.getItem('sso_loginAccountInfo') || '{}').selectLanguage || {}).key);

        const logoUploadButton = (
            <div>
                <Icon type={logoLoading ? 'loading' : 'plus'} />
            </div>
        );

        this.FormElement['groupCompany'].selectList = companyList;

        datas.areas = [
            datas.country,
            datas.province,
            datas.city,
            datas.county
        ].filter(item => !!item);

        return FormElements.map(item => {
            if(item === 'logoUrl') {
                return (
                    <Col span={this.FormElement[item].span} key={this.FormElement[item].key}>
                        <Form.Item
                            label={(
                                <React.Fragment>
                                    {this.FormElement[item].label}
                                    <span className="title-tip-ccc">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0378)}</span>
                                </React.Fragment>
                            )}
                        >
                            {getFieldDecorator(this.FormElement[item].key, 
                                {
                                    initialValue: logoUrl,
                                    rules: [
                                        {
                                            required: this.FormElement[item].require,
                                            message: `${this.FormElement[item].label}${econfigLanguage === 'zh_CN' ? '是必填项' : ' is required'}!`,
                                        },
                                    ],
                                }
                            )(
                                <Upload
                                    name="avatar"
                                    listType="picture-card"
                                    showUploadList={false}
                                    className="logo-uploader"
                                    beforeUpload={file => this.beforeUpload(file, 100)}
                                    customRequest={(res) => this.customRequest(res)}
                                >
                                    {logoUrl ? <img style={{width: '100px', height: '100px'}} src={logoUrl || CompanyLogoUrl} alt="avatar" /> : logoUploadButton}
                                </Upload>
                            )}
                        </Form.Item>
                    </Col>
                );
            }
            if(item === 'tenantName') {
                let tv = '';
                if (econfigLanguage === 'zh_CN') {
                    tv = datas.tenantName;
                    
                } else if(econfigLanguage === 'en_US') {
                    tv = datas.enTenantName || datas.tenantName;
                }
                return universalform({
                    ...this.FormElement[item],
                    getFieldDecorator,
                    value: tv
                });
                
            }
            return universalform({
                ...this.FormElement[item],
                getFieldDecorator,
                value: datas[item]
            });
        });
    };

    beforeUpload = (file, maxSize) => {
        const patt = /\.(jpg|png|jpeg)$/i;
        const isImg = file.name;
        if(!patt.test(isImg)) {
            message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0308));
        }
        const isLt2M = file.size / 1024 / 1024 < maxSize;
        if (!isLt2M) {
            message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0371).replace('xx', maxSize));
        }
        return patt.test(isImg) && isLt2M;
    }

    customRequest = (res) => {
        this.setState({ uploading: true });
        const sso_loginInfo = JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}');
        const formData = new FormData();

        const obj = {
            appId: 'econfig',
            fileName: res.file.name,
            contentType: res.file.type,
            tenantId: sso_loginInfo.tenantId
        };

        const str = Object.keys(obj).map(function(key){
            return `${key}=${obj[key]}`;
        }).sort().join('&');
        
        formData.append('file', res.file);
        formData.append('appId', 'econfig');
        formData.append('contentType', res.file.type);
        formData.append('fileName', res.file.name);
        formData.append('fileSize', res.file.size);
        formData.append('sign', encrypt(str));
        formData.append('tenantId', sso_loginInfo.tenantId);

        this.setState({
            logoLoading: true
        });
       
        $http.post(urls. newupload, formData).then(result => {
            this.setState({
                logoUrl: result.previewUrl || CompanyLogoUrl,
                logoLoading: false
            });
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            this.setState({
                logoLoading: false,
            });
        });
    }

     // CRO查找
     onCroSearch = debounce(async (name, callback) => {
         try{
             const croListOriginDatas = await $http.post(urls.getNewCompanyList, {
                 'name': name || '',
                 'pools': ['CRO'],
                 'pageNo': 1,
                 'pageSize': 10,
             });
             const croList = croListOriginDatas.list && croListOriginDatas.list.map(item => {
                 return {
                     name: item.name,
                     value: item.id,
                     isLocalized: item.isLocalized,
                     socialCreditCode: item.socialCreditCode
                 };
             });
             this.setState({ croList }, () => {
                 if(callback) callback();
             });
         }catch(e) {
             message.error(e.message);
         }
     }, 500)

     render() {

         return (
             <div
                 style={{
                     width: '80%',
                     padding: '20px 0 0 20px',
                     overflow: 'hidden'
                 }}
             >
                 <button onClick={() => this.setState({visible: true})}>asdasd</button>

                 {/* <Project 
                     appId="sms"
                     type="1"
                     title={'项目名称'}
                     visible={this.state.visible}
                     projectId={'2c94b7c972369dd9017250857be40069'}
                     onClose={() => this.setState({visible: false})}
                     onCallback={({ type }) => {
                         console.log(type);
                     }}
                 /> */}

                 <Project 
                     appId="sms" 
                     type="3"
                     title="asdad"
                     projectId={'2c94b7c972369dd901725089add4006f'}
                     onUnassignFun={(centerIds) => {
                         return new Promise((resolve, reject) => {
                             console.log(centerIds);
                             const a = 1;
                             if(a === 1) {
                                 resolve(true);
                             }
                             message.error('adadsad');
                             reject(false);
                         });
                     }}
                     onAddCenterFun={(c) => {
                         console.log(c);
                     }}
                     visible={this.state.visible}
                     onClose={() => this.setState({visible: false})}
                     // 回调
                     onCallback={({ projectId, projectName, type, customFieldValues }) => {
                         console.log(projectId, projectName, type, customFieldValues);
                     }}
                     customFieldValues={
                         {
                             'projectInput': '11111',
                             'projectSingleDropdown': {
                                 'key': 'ff8080816bd981dd016bd9df330506cf',
                                 'label': 'H&S有限公司北京办事处'
                             },
                             'uploadItem': [
                                 {
                                     'fileId': 'asdasdad',
                                     'name': 'IMG_0060.JPG',
                                     'status': 'done',
                                     'uid': 'rc-upload-1597309408414-12',
                                     'url': 'http://file.test.com/resources/2c9488bd73e6be470173e7161f060c00.JPG'
                                 },
                                 {
                                     'fileId': '2222',
                                     'name': 'IMG_0059.JPG',
                                     'status': 'done',
                                     'uid': 'rc-upload-1597309408414-14',
                                     'url': 'http://file.test.com/resources/2c9488bd73e6be470173e716b24c0c09.JPG'
                                 }
                             ],
                             'projectMultiple': [
                                 {
                                     'key': 'ff8080816bd981dd016bd9df330506cf',
                                     'label': 'H&S有限公司北京办事处'
                                 }
                             ]
                         }
                     }
                     customFields={{
                         // 字段名
                         projectInput: { 
                             // 字段名
                             key: 'projectInput', 
                             // 显示fieldName
                             label: '自定义字段', 
                             // 字段类型 input 普通文本
                             type: 'input', 
                             // 是否必填
                             //  require: true,
                             // 默认24 
                             span: 24, 
                             // 最大长度
                             maxLength: 200, 
                             // 正则表达式校验
                             rules: [ 
                                 {
                                     pattern: /^[0-9]*$/, 
                                     message: '请输入正整数!'
                                 }
                             ],
                         },
                         projectSingleDropdown: {
                             key: 'projectSingleDropdown',
                             label: '自定义字段_下拉单选',
                             type: 'single_dropdown',
                             //  require: true,
                             // 同antd
                             labelInValue: true, 
                             span: 24,
                             // 支持搜索
                             //  filterOption: true, 
                             onSearch: this.onCroSearch,
                             // 下拉框数据格式 name->value
                             selectList: this.state.croList, 
                         },
                         uploadItem: {
                             key: 'uploadItem',
                             label: '上传',
                             type: 'upload',
                             //  require: true,
                             //  beforeUpload: (file, getFieldValue) => {
                             //      return new Promise((resolve, reject) => {
                             //          const patt = /\.(jpg|png|jpeg)$/i;
                             //          const isImg = file.name;
                             //          const len = getFieldValue('uploadItem') || [];
                             //          if(len.length >= 2) {
                             //              message.error('只能上传两个文件!');
                             //              return reject(false);
                             //          }
                             //          if(!patt.test(isImg)) {
                             //              message.error('文件格式不匹配!');
                             //              return reject(false);
                             //          }
                             //          return resolve(true);
                             //      });
                             //  }
                         },
                         projectMultiple: {
                             key: 'projectMultiple',
                             label: '自定义字段_下拉多选',
                             type: 'multiple_input',
                             //  require: true,
                             // 同antd
                             labelInValue: true, 
                             span: 24,
                             // 支持搜索
                             //  filterOption: true, 
                             onSearch: this.onCroSearch,
                             // 下拉框数据格式 name->value
                             selectList: this.state.croList, 
                         },
                     }}
                 />
             </div>
         );
     }
}

export default BaseInfo;
