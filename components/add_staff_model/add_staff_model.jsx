// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';

import * as Utils from 'utils/utils.jsx';

import './add_staff_model.scss'
import Constants, {StoragePrefixes} from "../../utils/constants";
import 'element-theme-default';
import FileUpload from 'components/file_upload';
import {getFileThumbnailUrl, getFileUrl, sortFileInfos} from 'panguaxe-redux/utils/file_utils';
import logoImage from 'images/ithpower/login/logo_words.png';
import {Button, Checkbox, Dialog, Form, Input, Menu, MessageBox, Radio, Select} from 'element-react';
import {Steps} from 'antd';
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/es/locale/zh_CN';
import 'antd/dist/antd.css';
import * as UserAgent from "../../utils/user_agent";
import {generateId} from "../../utils/utils";

const {Step} = Steps;

export default class AddStaffModel extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        show: PropTypes.bool,
        onHide: PropTypes.func,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.draftsForChannel = {};

        this.state = {
            isShowPage: true,

            showPage: Constants.ADD_STAFF.MAIN_FORM,
            showPageChild: Constants.ADD_STAFF.ADD_STAFF_BATCH,
            isExchangeManagerPage: false,
            isAddStaffBatchPage: false,
            isCutPicPage: false,
            addBatchStepNum: 0,
            activeTab: 'general',
            activeSection: '',
            confirmModal: false,

            resultList: [],
            form: {
                username: "",
                nickname: "",
                sex: 1,
                logoId: "",
                phone: "",
                landLine: "",
                email: "",
                departmentChooseId: 0,
                departmentInputName: "",
                isManager: false,
                dutyName: "",
                teamId: this.props.currentTeamId,
            },
            departmentMes: {
                isShowDepartmentList: false,
                departmentList: [],
                resultList: [],
                managerMes: {
                    username: Constants.ADD_STAFF.DEFAULT_MANAGER
                }
            },
            rules: {
                username: [
                    {required: true, message: "请输入", trigger: 'blur'}
                ]
            },
            errorMes: {
                isShow: false,
                message: "",
            },
            draft: {
                message: "",
                uploadsInProgress: [],
                fileInfos: []
            },
            message: "",
            submitting: false,
            showPostDeletedModal: false,
            enableSendButton: false,
            showEmojiPicker: false,
            showConfirmModal: false,
            channelTimezoneCount: 0,
            preview: false,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            orientation: null,
        };
    }

    componentDidMount() {
        if (!Utils.isMobile()) {
            $('.settings-modal .settings-content').perfectScrollbar();
        }
    }

    componentWillMount() {
        this.getAllDepartmentsByTeamId();
        this.props.actions.getTeamById({teamId: this.props.currentTeamId})
            .then((res) => {
                if (res.result !== undefined) {
                    let form = this.state.form;
                    form.departmentInputName = res.result.display_name;
                    this.setState({
                        form,
                    })
                }
            })
    }

    getAllDepartmentsByTeamId = () => {
        this.props.actions.getAllDepartmentsByTeamId(this.props.currentTeamId)
            .then((res) => {
                if (res.result !== undefined && res.result.Flag) {
                    let departmentMes = this.state.departmentMes;
                    departmentMes.isShowDepartmentList = true;
                    departmentMes.departmentList = res.result.Data.Rows;

                    let resultList = [];
                    for (let index in departmentMes.departmentList) {
                        if (departmentMes.departmentList[index]["mark"] === undefined || departmentMes.departmentList[index]["mark"] === false) {
                            let showName = this.getShowName(departmentMes.departmentList[index], departmentMes.departmentList);
                            departmentMes.departmentList[index]["showName"] = showName;
                            departmentMes.departmentList[index]["showNameShort"] = showName.length >= 11 ? ("..." + showName.substr(-11)) : showName;
                            resultList.push(departmentMes.departmentList[index])
                        }
                    }
                    departmentMes.resultList = resultList;
                    this.setState({
                        departmentMes: departmentMes,
                        resultList,
                    })
                }
            });
    };

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

    onChange(key, value) {
        this.setState({
            form: Object.assign(this.state.form, {[key]: value})
        });
        if (key === "departmentInputName") {
            let departmentMes = this.state.departmentMes;
            departmentMes.managerMes = {username: Constants.ADD_STAFF.DEFAULT_MANAGER};
            let form = this.state.form;
            form.isManager = false;
            for (let index in this.state.departmentMes.resultList) {
                if (this.state.departmentMes.resultList[index]["showName"] === value) {
                    this.props.actions.getUser(this.state.departmentMes.resultList[index]["managerId"])
                        .then((res) => {
                            if (res.data !== undefined) {
                                let departmentMes = this.state.departmentMes;
                                departmentMes.managerMes = res.data;
                                this.setState({
                                    departmentMes
                                })
                            }
                        })
                }
            }
            this.setState({
                departmentMes,
                form,
            })
        }
    }

    handleCutPic = () => {
        this.setState({
            isCutPicPage: true,
        })
    };
    onChangeIsManager = () => {
        let form = this.state.form;
        if (this.state.form.username !== "" && this.state.departmentMes.managerMes.username === "") {
            form.isManager = !form.isManager;
            this.setState({
                form
            })
        } else if (this.state.form.username !== "" && this.state.departmentMes.managerMes.username !== "") {
            if (form.isManager) {
                form.isManager = false;
                this.setState({
                    form
                })
            } else {
                this.setState({
                    isExchangeManagerPage: true,
                })
            }
        } else {
            form.isManager = false;
            this.setState({
                form
            })
        }
    };
    onClickConfirm = () => {
        let errorMes = this.state.errorMes;
        let byteLength = Utils.getStringByteLength(this.state.form.username);
        if (byteLength < 4 || byteLength > 32) {
            errorMes.isShow = true;
            errorMes.message = "姓名输入为空/长度不对";
            this.setState({
                errorMes,
            });
            return
        }
        console.log(this.state.form);
        // this.props.actions.addStaff(this.state.form)
        //     .then((res) => {
        //         let result = res.result;
        //         if (result !== undefined && result.Flag) {
        //             console.log(this.state.form);
        //             this.close();
        //         }
        //     })
    };
    onClickCancel = () => {
        this.close();
    };

    onClickShowPageAddBatch = () => {
        this.setState({
            isAddStaffBatchPage: true
        })
    };

    onClickToggleShowDepartmentList = () => {
        let departmentMes = this.state.departmentMes;
        departmentMes.isShowDepartmentList = !departmentMes.isShowDepartmentList;
        this.setState({
            departmentMes,
        });
    };

    getShowName(department, list) {
        if (department["pId"] === 0) {
            department["mark"] = true;
            return department["name"];
        } else {
            for (let index in list) {
                if (department["pId"] === list[index]["id"]) {
                    department["mark"] = true;
                    return this.getShowName(list[index], list) + "-" + department["name"]
                }
            }
        }
    }

    close = () => {
        if (this.state.hasChanges) {
            this.setState({confirmModal: true});
        } else {
            this.props.actions.closeModal();
        }
    };
    handleChange = (showName) => {
        let resultList = this.state.departmentMes.resultList;
        for (let index in resultList) {
            if (resultList[index]["showName"] === showName) {
                let form = this.state.form;
                form.isManager = false;
                form.departmentChooseId = resultList[index]["id"];
                form.departmentInputName = showName;
                this.setState({
                    form
                });
                this.props.actions.getUser(resultList[index]["managerId"])
                    .then((res) => {
                        if (res.data !== undefined) {
                            let departmentMes = this.state.departmentMes;
                            departmentMes.managerMes = res.data;
                            this.setState({
                                departmentMes
                            })
                        }
                    })
            }
        }
    };

    onClickConfirmIsManager = (is) => {
        console.log('this.');
        let form = this.state.form;
        form.isManager = is;
        let departmentMes = this.state.departmentMes;
        departmentMes.managerMes.username = form.username;
        this.setState({
            form,
            departmentMes,
            isExchangeManagerPage: false,
        });
    };

    onBlur = (key) => {
        let errorMes = this.state.errorMes;
        if (key === "username") {
            let byteLength = Utils.getStringByteLength(this.state.form.username);
            if (byteLength < 4 || byteLength > 32) {
                errorMes.isShow = true;
                errorMes.message = "长度需在4-32之间";
            }
            else {
                errorMes.isShow = false;
                errorMes.message = "";
            }
        }
        if (key === "nickname") {
            let byteLength = Utils.getStringByteLength(this.state.form.nickname);
            if (byteLength < 4 || byteLength > 32) {
                errorMes.isShow = true;
                errorMes.message = "长度需在4-32之间";
            }
            else {
                errorMes.isShow = false;
                errorMes.message = "";
            }
        }
        this.setState({
            errorMes,
        });
        console.log(this.state.errorMes);
    };
    /*  上传文件相关   ============================ */
    getFileCount = () => {
        const draft = this.state.draft;
        return draft.fileInfos.length + draft.uploadsInProgress.length;
    };
    getFileUploadTarget = () => {
        if (this.refs.textbox) {
            return this.refs.textbox.getWrappedInstance();
        }

        return null;
    };

    handleFileUploadChange = () => {
        this.focusTextbox();
    };

    focusTextbox = (keepFocus = false) => {
        if (this.refs.textbox && (keepFocus || !UserAgent.isMobile())) {
            this.refs.textbox.getWrappedInstance().focus();
        }
    };
    handleUploadStart = (clientIds, channelId) => {
        const uploadsInProgress = [
            ...this.state.draft.uploadsInProgress,
            ...clientIds,
        ];

        const draft = {
            ...this.state.draft,
            uploadsInProgress,
        };

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
        this.draftsForChannel[channelId] = draft;

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        this.focusTextbox();
    }
    handleFileUploadComplete = (fileInfos, clientIds, channelId) => {
        let form = this.state.form;
        form.logoId = fileInfos[0].id;
        this.setState({
            form
        });
        const draft = {...this.draftsForChannel[channelId]};

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            if (draft.uploadsInProgress) {
                const index = draft.uploadsInProgress.indexOf(clientIds[i]);

                if (index !== -1) {
                    draft.uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                }
            }
        }

        if (draft.fileInfos) {
            draft.fileInfos = sortFileInfos(draft.fileInfos.concat(fileInfos), this.props.locale);
        }

        this.draftsForChannel[channelId] = draft;
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
        const enableSendButton = this.handleEnableSendButton(this.state.message, draft.fileInfos);
        this.setState({enableSendButton});
    };
    handleUploadError = (err, clientId, channelId) => {
        const draft = {...this.draftsForChannel[channelId]};

        let serverError = err;
        if (typeof err === 'string') {
            serverError = new Error(err);
        }

        if (clientId !== -1 && draft.uploadsInProgress) {
            const index = draft.uploadsInProgress.indexOf(clientId);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                const modifiedDraft = {
                    ...draft,
                    uploadsInProgress,
                };
                this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft);
                this.draftsForChannel[channelId] = modifiedDraft;
            }
        }

        this.setState({serverError});
    };
    handleUploadProgress = ({clientId, name, percent, type}) => {
        const uploadsProgressPercent = {...this.state.uploadsProgressPercent, [clientId]: {percent, name, type}};
        this.setState({uploadsProgressPercent});
    };

    handleEnableSendButton(message, fileInfos) {
        return message.trim().length !== 0 || fileInfos.length !== 0;
    };

    _crop() {
        // image in dataUrl
        console.log(this.refs.cropper.getCroppedCanvas().toDataURL());
    }

    dataURLtoFile = (dataurl, filename) => {//将base64转换为文件
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
    };


    handelUploadLogoOK = () => {
        let base64 = this.refs.cropper.getCroppedCanvas().toDataURL();
        let filename = generateId() + ".png";
        let imgUrl = this.dataURLtoFile(base64, filename);
        this.props.actions.uploadFile(
            imgUrl,
            filename,
            "",
            "",
            generateId(),
        ).then((res) => {
            if (res !== "") {
                let result = JSON.parse(res["text"]);

                let form = this.state.form;
                form.logoId = result["file_infos"][0]["id"];
                console.log(res);
                console.log(result);
                this.setState({
                    form: form,
                    isCutPicPage: false,
                })
            }
        });
    };
    handleUploadLogoCancel = () => {
        this.setState({
            isCutPicPage: false,
        })
    };

    /*  ========================================= */

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
        let innerHtml;
        if (this.state.showPage === Constants.ADD_STAFF.MAIN_FORM) {
            innerHtml = (
                <div className={"add-staff-main"}>
                    <div className={"title"}>添加员工</div>
                    <div className={"tips"}>
                        <span>温馨提示：您可以批量导入员工</span>
                        <span onClick={this.onClickShowPageAddBatch}>批量导入</span>
                    </div>
                    <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="52"
                          className="demo-ruleForm">
                        <div className={"form-part-0"}>
                            <div className={"left"}>
                                <Form.Item label="姓名" prop="username" className={"username"}>
                                    <Input placeholder="请填写真实姓名" value={this.state.form.username}
                                           onChange={this.onChange.bind(this, 'username')}
                                           onBlur={this.onBlur.bind(this, 'username')}/>
                                </Form.Item>
                                <Form.Item label="花名" prop="nickname" className={"nickname"}>
                                    <Input placeholder="请填写常用称呼" value={this.state.form.nickname}
                                           onChange={this.onChange.bind(this, 'nickname')}
                                           onBlur={this.onBlur.bind(this, 'nickname')}/>
                                </Form.Item>
                                <div className={"usage-tips"}>花名优先于姓名使用</div>
                                <div className={"sex-item"}>
                                    <span className={"sex"}>性别</span>
                                    <Radio value="1" checked={this.state.form.sex === 1}
                                           onChange={this.onChange.bind(this, 'sex', 1)}>男</Radio>
                                    <Radio value="0" checked={this.state.form.sex === 0}
                                           onChange={this.onChange.bind(this, 'sex', 0)}>女</Radio>
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
                            <Form.Item label="手机" prop="phone" className={"phone"}>
                                <Input placeholder="账号即为手机号" value={this.state.form.phone}
                                       onChange={this.onChange.bind(this, 'phone')}/>
                            </Form.Item>
                            <Form.Item label="座机" prop="landLine" className={"landLine"}>
                                <Input placeholder="请填写常用座机号" value={this.state.form.landLine}
                                       onChange={this.onChange.bind(this, 'landLine')}/>
                            </Form.Item>
                            <Form.Item label="邮箱" prop="email" className={"email"}>
                                <Input placeholder="请填写公司邮箱" value={this.state.form.email}
                                       onChange={this.onChange.bind(this, 'email')}/>
                            </Form.Item>
                        </div>
                        <hr/>
                        <div className={"form-part-2"}>
                            <Form.Item label="部门" prop="departmentChooseId" className={"departmentChooseId"}>
                                <Input placeholder="请输入/选择" value={this.state.form.departmentInputName}
                                       onChange={this.onChange.bind(this, 'departmentInputName')}/>
                                <Select value={this.state.form.departmentInputName}
                                        onChange={this.handleChange}>
                                    {this.state.departmentMes.resultList.map((department, index) => {
                                        return <Select.Option key={department["id"]}
                                                              label={department["showNameShort"]}
                                                              value={department["showName"]}/>
                                    })}
                                </Select>
                                <span className={"now-manager"}>
                                    <span>主管:</span>
                                    <span>{this.state.form.isManager ? this.state.form.username : this.state.departmentMes.managerMes.username}</span>
                                </span>
                            </Form.Item>
                            <div className={"input-tip"}>
                                可直接输入。如输入“研发部-测试部”若2个部门均未设置，则系统添加“研发部”及其以下级部门“测试部”。
                            </div>
                            <Form.Item label="身份" prop="isManager" className={"isManager"}>
                                <Checkbox checked={this.state.form.isManager}
                                          onChange={this.onChangeIsManager}>部门主管</Checkbox>
                            </Form.Item>
                            <Form.Item label="职务" prop="dutyName" className={"dutyName"}>
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
            )
        }
        let addStaffBatchPage = (
            <Dialog
                title="批量导入员工"
                size="tiny"
                visible={this.state.isAddStaffBatchPage}
                onCancel={() => this.setState({isAddStaffBatchPage: false})}
                lockScroll={false}
                className={"add-staff-batch"}
            >
                <Dialog.Body>
                    <Steps current={this.state.addBatchStepNum} direction={"vertical"} size={"small"}>
                        <Step/>
                        <Step/>
                        <Step/>
                    </Steps>
                    <div className={"add-batch-right"}>
                        <div className={"step-0"}>
                            <span>请先下载Excel通讯录模版，按格式填写员工信息</span>
                            <Button type={"primary"}>下载模板</Button>
                        </div>
                        <div className={"step-1"}>
                            <span className={"part-left"}>
                                <div>选择填好的员工信息表</div>
                                <div>未上传表格</div>
                            </span>
                            <Button type={"primary"}>选择文件</Button>
                        </div>
                        <div className={"step-2"}>
                            <Button type={"primary"}>上传员工表格</Button>
                            <span className={"part-right"}>互次方科技-员工表.xls</span>
                        </div>
                    </div>
                </Dialog.Body>
            </Dialog>
        );
        let exchangeManagerPage = (
            <Dialog
                title="更换主管"
                size="tiny"
                visible={this.state.isExchangeManagerPage}
                onCancel={() => this.setState({isExchangeManagerPage: false})}
                lockScroll={false}
                className={"exchange-manager"}
            >
                <Dialog.Body>
                    <div className={"main-mes"}>
                        研发部当前主管是“{this.state.departmentMes.managerMes.username}”，您确定更换为“{this.state.form.username}”吗？
                    </div>
                    <div className={"button-mes"}>
                        <Button onClick={this.onClickConfirmIsManager.bind(this, false)}>取消</Button>
                        <Button onClick={this.onClickConfirmIsManager.bind(this, true)} type={"primary"}>确定</Button>
                    </div>
                </Dialog.Body>
            </Dialog>
        );
        let cutPicPage = (
            <Dialog
                size="tiny"
                title={"编辑头像"}
                visible={this.state.isCutPicPage}
                onCancel={() => this.setState({isCutPicPage: false})}
                lockScroll={false}
                className={"cut-pic"}
            >
                <Dialog.Body>
                    <div className={"pic-main"}>
                        <div>
                            <Cropper
                                ref='cropper'
                                src={this.state.form.logoId === "" ? logoImage : getFileUrl(this.state.form.logoId)}
                                style={{height: 309, width: 309}}
                                // Cropper.js options
                                aspectRatio={1}
                                guides={false}
                                crop={this._crop.bind(this)}
                            />
                        </div>
                    </div>
                    <div className={"edit-main"}>
                        <div className={"re-choose-pic"}>
                            <FileUpload
                                ref='fileUpload'
                                fileCount={this.getFileCount()}
                                getTarget={this.getFileUploadTarget}
                                onFileUploadChange={this.handleFileUploadChange}
                                onUploadStart={this.handleUploadStart}
                                onFileUpload={this.handleFileUploadComplete}
                                onUploadError={this.handleUploadError}
                                onUploadProgress={this.handleUploadProgress}
                                rootId={this.props.rootId}
                                currentChannelId={"enterpriseLogoUploadFiles"}
                                postType='enterpriseLogo'
                            />
                            <button className={"reChoose"}>重新选图片</button>
                        </div>

                        <div className={"right"}>
                            <button onClick={this.handleUploadLogoCancel}>取消</button>
                            <button onClick={this.handelUploadLogoOK}>确定</button>
                        </div>
                    </div>
                </Dialog.Body>
            </Dialog>
        );

        if (this.state.showPage) {
            return (
                <RootPortal>
                    <FullScreenModal
                        show={Boolean(this.props.show)}
                        onClose={this.close}
                    >
                        <div className='AddStaffModal'>
                            {innerHtml}
                            {addStaffBatchPage}
                            {exchangeManagerPage}
                            {cutPicPage}
                        </div>
                    </FullScreenModal>
                </RootPortal>
            )
        }
    }
}
