// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {getFileUrl} from 'mattermost-redux/utils/file_utils';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import ConfirmModal from 'components/confirm_modal.jsx';
import RootPortal from 'components/root_portal';

import * as Utils from 'utils/utils.jsx';
import {AsyncComponent} from 'components/async_load';
import loadSettingsSidebar from 'bundle-loader?lazy!components/settings_sidebar.jsx';

import './add_staff_model.scss'
import TeamSettings from 'components/team_settings';
import Constants from "../../utils/constants";
import 'element-theme-default';

import {Divider} from 'antd';
import {Button, Form, Input, Menu, Upload, Radio, Checkbox} from 'element-react';

export default class AddStaffModel extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        onHide: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'general',
            activeSection: '',
            form: {
                username: "",
                nickname: "",
                sex: 1,
                logoId: "",
                phone: "",
                landLine: "",
                email: "",
                departmentList: {
                    id: "",
                    name: "",
                },
                departmentChooseId: "",
                isManager: true,
                dutyName: ""
            },
            rules: {
                username: [
                    {required: true, message: "请输入", trigger: 'blur'}
                ]
            }
        };
    }

    componentDidMount() {
        if (!Utils.isMobile()) {
            $('.settings-modal .settings-content').perfectScrollbar();
        }
    }

    updateTab = (tab) => {
        this.setState({
            activeTab: tab,
            activeSection: '',
        });

        if (!Utils.isMobile()) {
            $('.settings-modal .modal-body').scrollTop(0).perfectScrollbar('update');
        }
    };

    updateSection = (section) => {
        if ($('.section-max').length) {
            $('.settings-modal .modal-body').scrollTop(0).perfectScrollbar('update');
        }

        this.setState({activeSection: section});
    };

    closeModal = () => {
        this.props.onHide();
    };

    collapseModal = () => {
        $(ReactDOM.findDOMNode(this.refs.modalBody)).closest('.modal-dialog').removeClass('display--content');

        this.setState({
            active_tab: '',
            active_section: '',
        });
    };

    handleHide = () => {
        this.props.onHide();
    };

    // called after the dialog is fully hidden and faded out
    handleHidden = () => {
        this.setState({
            activeTab: 'general',
            activeSection: '',
        });
    };

    onChange(key, value) {
        this.setState({
            form: Object.assign(this.state.form, {[key]: value})
        });
    }

    handleCutPic = () => {
        this.setState({
            showPage: Constants.ADD_STAFF.CUT_PIC
        })
    };
    onChangeIsManager = () => {
        let form = this.state.form;
        form.isManager = !form.isManager;
        this.setState({
            form
        })
    };
    onClickConfirm = () => {
    };
    onClickCancel = () => {

    };

    render() {
        const tabs = [];
        tabs.push({
            name: 'general',
            uiName: Utils.localizeMessage('team_settings_modal.generalTab', 'General'),
            icon: 'icon fa fa-cog',
            iconTitle: Utils.localizeMessage('generic_icons.settings', 'Settings Icon')
        });
        tabs.push({
            name: 'import',
            uiName: Utils.localizeMessage('team_settings_modal.importTab', 'Import'),
            icon: 'icon fa fa-upload',
            iconTitle: Utils.localizeMessage('generic_icons.upload', 'Upload Icon')
        });

        return (
            <RootPortal>
                <FullScreenModal
                    show={Boolean(this.props.show)}
                    onClose={this.close}
                >
                    <div className='AddStaffModal'>
                        {/*<ConfirmModal*/}
                        {/*modalClass='invitation-modal-confirm'*/}
                        {/*onConfirm={this.state.confirmModal ? this.confirmClose : this.confirmBack}*/}
                        {/*onCancel={this.state.confirmModal ? this.cancelClose : this.cancelBack}*/}
                        {/*/>*/}
                        <div className={"add-staff-main"}>
                            <div className={"title"}>添加员工</div>
                            <div className={"tips"}>
                                <span>温馨提示：您可以批量导入员工</span>
                                <span>批量导入</span>
                            </div>
                            <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="52"
                                  className="demo-ruleForm">
                                <div className={"form-part-0"}>
                                    <div className={"left"}>
                                        <Form.Item label="姓名" prop="username" class={"username"}>
                                            <Input placeholder="请填写真实姓名" value={this.state.form.username}
                                                   onChange={this.onChange.bind(this, 'username')}/>
                                        </Form.Item>
                                        <Form.Item label="花名" prop="nickname" class={"nickname"}>
                                            <Input placeholder="请填写常用称呼" value={this.state.form.nickname}
                                                   onChange={this.onChange.bind(this, 'nickname')}/>
                                        </Form.Item>
                                        <div className={"usage-tips"}>花名优先于姓名使用</div>
                                        <div className={"sex-item"}>
                                            <span className={"sex"}>性别</span>
                                            <Radio value="1" checked={this.state.value === 1}
                                                   onChange={this.onChange.bind(this)}>男</Radio>
                                            <Radio value="0" checked={this.state.value === 0}
                                                   onChange={this.onChange.bind(this)}>女</Radio>
                                        </div>
                                    </div>
                                    <div
                                        className="avatar-uploader"
                                        onClick={this.handleCutPic}
                                    >
                                        {/*{fileUpload}*/}
                                        {this.state.form.logoId ?
                                            <img src={getFileUrl(this.state.form.logoId)} className="avatar"/> : ""}

                                        <div className="el-upload__text upload-logo">
                                            <i className="el-icon-plus avatar-uploader-icon"/>
                                            <div>上传头像</div>
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                                <div className={"form-part-1"}>
                                    <Form.Item label="手机" prop="phone" class={"phone"}>
                                        <Input placeholder="账号即为手机号" value={this.state.form.phone}
                                               onChange={this.onChange.bind(this, 'phone')}/>
                                    </Form.Item>
                                    <Form.Item label="座机" prop="landLine" class={"landLine"}>
                                        <Input placeholder="请填写常用座机号" value={this.state.form.landLine}
                                               onChange={this.onChange.bind(this, 'landLine')}/>
                                    </Form.Item>
                                    <Form.Item label="邮箱" prop="email" class={"email"}>
                                        <Input placeholder="请填写公司邮箱" value={this.state.form.email}
                                               onChange={this.onChange.bind(this, 'email')}/>
                                    </Form.Item>
                                </div>
                                <hr/>
                                <div className={"form-part-2"}>
                                    <Form.Item label="部门" prop="departmentChooseId" class={"departmentChooseId"}>
                                        <Input placeholder="默认为公司名称" value={this.state.form.departmentChooseId}
                                               onChange={this.onChange.bind(this, 'departmentChooseId')}/>
                                        <span className={"now-manager"}>
                                            <span>主管：</span>
                                            <span>小玄子</span>
                                        </span>
                                    </Form.Item>
                                    <div className={"input-tip"}>
                                        可直接输入。如输入“研发部-测试部”若2个部门均未设置，则系统添加“研发部”及其以下级部门“测试部”。
                                    </div>
                                    <Form.Item label="身份" prop="isManager" class={"isManager"}>
                                        <Checkbox checked={this.state.form.isManager}
                                                  onChange={this.onChangeIsManager}>部门主管</Checkbox>
                                    </Form.Item>
                                    <Form.Item label="职务" prop="dutyName" class={"dutyName"}>
                                        <Input placeholder="请填写公司职务" value={this.state.form.dutyName}
                                               onChange={this.onChange.bind(this, 'dutyName')}/>
                                    </Form.Item>
                                </div>

                                <div className={"form-part-3"}>
                                    <Button onClick={this.onClickCancel}>取消</Button>
                                    <Button onClick={this.onClickConfirm} type="primary">确定</Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </FullScreenModal>
            </RootPortal>
        );
    }
}
