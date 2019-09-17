// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

import {Permissions} from 'panguaxe-redux/constants';

import * as UserAgent from 'utils/user_agent.jsx';
import Constants from 'utils/constants.jsx';

import logoImage from 'images/ithpower/login/logo_words.png';
import FileUpload from 'components/file_upload';
import {getFileThumbnailUrl, getFileUrl, sortFileInfos} from 'panguaxe-redux/utils/file_utils';
import {intlShape} from 'react-intl';
import './deal_invite.scss'
import {Button, Form, Input, Menu, Upload} from 'element-react';
import 'element-theme-default';
import {browserHistory} from "../../utils/browser_history";
import {StoragePrefixes} from "../../utils/constants";
import * as Utils from "../../utils/utils";
import {generateId} from "../../utils/utils";
import LocalStorageStore from "../../stores/local_storage_store";
import * as GlobalActions from "../../actions/global_actions";
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

const TEAMS_PER_PAGE = 200;
const TEAM_MEMBERSHIP_DENIAL_ERROR_ID = 'api.team.add_members.user_denied';

export default class DealInvite extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        currentUserRoles: PropTypes.string,
        currentUserIsGuest: PropTypes.string,
        customDescriptionText: PropTypes.string,
        isMemberOfTeam: PropTypes.bool.isRequired,
        listableTeams: PropTypes.array,
        siteName: PropTypes.string,
        canCreateTeams: PropTypes.bool.isRequired,
        canManageSystem: PropTypes.bool.isRequired,
        canJoinPublicTeams: PropTypes.bool.isRequired,
        canJoinPrivateTeams: PropTypes.bool.isRequired,
        history: PropTypes.object,
        siteURL: PropTypes.string,
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
            loadRolesIfNeeded: PropTypes.func.isRequired,
            addUserToTeam: PropTypes.func.isRequired,
            updateInviteReply: PropTypes.func.isRequired,
            getTeamsByUserId: PropTypes.func.isRequired,
        }).isRequired,
        draft: PropTypes.shape({
            message: PropTypes.string.isRequired,
            uploadsInProgress: PropTypes.array.isRequired,
            fileInfos: PropTypes.array.isRequired,
        }).isRequired,
    };
    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);
        this.lastBlurAt = 0;
        this.lastChannelSwitchAt = 0;
        this.draftsForChannel = {};

        this.state = {
            clientId: generateId(),
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


            loadingTeamId: '',
            error: null,
            showPage: '',
            invites: {
                isJoin: true,
            },
            form: {
                username: '',
                nickname: "",
                enterpriseFullName: '',
                enterpriseShortName: '',
                industryCode: '',
                industryName: '',
                logoId: ''
            },
            enterpriseInvite: [],
            enterpriseTeam: "",
            enterpriseChannel: "",
            industryType: {
                activeIndustryPCodeName: '',
                activeIndustryPCodeIndex: "A",
                industryTypeSearch: '',
                isShowSearchList: false,
                industryTypeId: 0,
                searchList: [],
                pCodeList: [],
                tCodeList: [],
                codeList: [],
            },

            rules: {},

        };
    }

    componentWillMount() {
        this.props.actions.getTeamsWithInviteByTelPhone()
            .then((res) => {
                if (res.data.Flag) {
                    if (res.data.Data !== null) {
                        if (res.data.Data.Rows.length > 0) {
                            this.setState({
                                enterpriseInvite: res.data.Data.Rows,
                                showPage: Constants.DEAL_INVITE_TYPE.INVITE,
                            });
                        }
                    } else {
                        this.props.actions.getTeamsByUserId({userId: this.props.currentUserId})
                            .then((res) => {
                                console.log(res);
                                if (res.result !== undefined && res.result.length > 0) {
                                    this.finishSignin();
                                } else {
                                    this.setState({
                                        showPage: Constants.DEAL_INVITE_TYPE.FILL_IN,
                                    })
                                }
                            });
                    }
                }
            });
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        const {
            actions,
            currentUserRoles,
        } = this.props;

        actions.loadRolesIfNeeded(currentUserRoles.split(' '));
    }

    handleSearchChange = (e) => {


        let industryType = this.state.industryType;
        if (e.target.value === "") {
            industryType.isShowSearchList = false;
            this.setState({
                industryType
            });
            return
        }

        industryType.industryTypeSearch = e.target.value;

        this.props.actions.getIndustriesByNameLike(industryType.industryTypeSearch)
            .then((res) => {


                let data = res.result;
                if (data.Flag) {
                    industryType.searchList = data.Data.Rows;


                    industryType.isShowSearchList = true;
                    for (let i in industryType.searchList) {
                        industryType.searchList[i]["name"] = industryType.searchList[i]["name"].replace(industryType.industryTypeSearch, "<a>" + industryType.industryTypeSearch + "</a>");
                        let tCode;
                        for (let j in industryType.tCodeList) {
                            if (industryType.searchList[i]["pCode"] === industryType.tCodeList[j]["code"]) {
                                tCode = industryType.tCodeList[j];
                                break
                            }
                        }
                        for (let j in industryType.pCodeList) {
                            if (tCode["pCode"] === industryType.pCodeList[j]["code"]) {
                                industryType.searchList[i]["pName"] = industryType.pCodeList[j]["name"];
                                break
                            }
                        }
                    }
                    this.setState({
                        industryType
                    })
                }
            })
    };
    clearError = (e) => {
        e.preventDefault();

        this.setState({
            error: null,
        });
    };

    onChange(key, value) {
        this.setState({
            form: Object.assign(this.state.form, {[key]: value})
        });
    }


    handleIndustryChoose = () => {

        this.setState({
            showPage: Constants.DEAL_INVITE_TYPE.INDUSTRY_TYPE
        });

        this.props.actions.getAllPCodeList()
            .then((res) => {


                let data = res.result;
                if (data.Flag) {
                    let industryType = this.state.industryType;
                    industryType.pCodeList = data.Data.Rows;
                    for (let i in industryType.pCodeList) {
                        industryType.pCodeList[i]["name"] = industryType.pCodeList[i]["name"].replace(/、/g, "/").replace("及", "/");
                    }
                    industryType.activeIndustryPCodeName = industryType.pCodeList[0]["name"];
                    industryType.activeIndustryPCodeIndex = industryType.pCodeList[0]["code"];
                    this.setState({
                        industryType: industryType
                    });

                    let firstPCode = industryType.pCodeList[0]["pCode"];
                    this.handlePCodeChoose(firstPCode)
                }
            });
        this.props.actions.getAllTCodeList()
            .then((res) => {

                let data = res.result;
                if (data.Flag) {
                    let industryType = this.state.industryType;
                    industryType.tCodeList = data.Data.Rows;
                    this.setState({
                        industryType
                    })
                }
            })
    };
    handleFillInForm = () => {
        let form = this.state.form;
        if (form.username === "" || form.enterpriseFullName === "" || form.enterpriseShortName === "" || form.formIndustryCode === "" || form.formLogoUrl === "") {
            return
        }
        let data = {
            username: form.username,
            nickname: form.nickname,
            enterpriseFullName: form.enterpriseFullName,
            enterpriseShortName: form.enterpriseShortName,
            formIndustryCode: form.industryCode,
            formLogoUrl: form.logoId
        };
        this.props.actions.saveFillInTheMessage(data)
            .then((res) => {
                console.log("创建企业成功");
                this.finishSignin();
            });
    };

    finishSignin = (team) => {
        const experimentalPrimaryTeam = this.props.experimentalPrimaryTeam;
        const query = new URLSearchParams(this.props.location.search);
        const redirectTo = query.get('redirect_to');

        Utils.setCSRFFromCookie();

        // Record a successful login to local storage. If an unintentional logout occurs, e.g.
        // via session expiration, this bit won't get reset and we can notify the user as such.
        LocalStorageStore.setWasLoggedIn(false);
        if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
            browserHistory.push(redirectTo);
        } else if (team) {
            browserHistory.push(`/${team.name}`);
        } else if (experimentalPrimaryTeam) {
            browserHistory.push(`/${experimentalPrimaryTeam}`);
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    };

    handlePCodeChoose = (e) => {

        let industryType = this.state.industryType;
        industryType.activeIndustryPCodeIndex = e;

        for (let i in industryType.pCodeList) {
            if (industryType.pCodeList[i]["code"] === e) {
                industryType.activeIndustryPCodeName = industryType.pCodeList[i]['name']
            }
        }
        this.props.actions.getCodeListByPCode(e)
            .then((res) => {
                let data = res.result;
                if (data.Flag) {
                    industryType.codeList = [];
                    // 将数据形成 [{two:x, three:[x, x]}, {}, {}]
                    let resultList = data.Data.Rows;
                    for (let i in resultList) {
                        if (resultList[i]["pCode"] === e) {
                            let tempMap = {};
                            tempMap["two"] = resultList[i];
                            industryType.codeList.push(tempMap);
                        }
                    }

                    for (let i in industryType.codeList) {
                        let tempList = [];
                        for (let j in resultList) {
                            if (resultList[j]["pCode"] === industryType.codeList[i]["two"]["code"]) {
                                tempList.push(resultList[j]);
                                industryType.codeList[i]["three"] = tempList
                            }
                        }
                    }


                    this.setState({
                        industryType: industryType
                    })
                }
            });
    };

    handleIndustryTypeChoose = (code, name, e) => {

        name = name.replace("<a>", "").replace("</a>", "");
        let form = this.state.form;
        form.industryCode = code;
        form.industryName = name;
        this.setState({
            form,
            showPage: Constants.DEAL_INVITE_TYPE.FILL_IN
        });
    };
    handleInvitesJoin = (isJoin, enterpriseId, e) => {
        this.props.actions.updateInviteReply(isJoin, enterpriseId)
            .then((res) => {
                let data = res.result;
                if (data.Flag) {
                    if (data.Data !== "") {
                        this.setState({
                            enterpriseTeamId: data.Data["teamId"],
                            enterpriseChannelId: data.Data["channelId"]
                        })
                    }
                    let enterpriseInvite = this.state.enterpriseInvite;
                    enterpriseInvite.shift();
                    if (enterpriseInvite.length === 0 && this.state.enterpriseTeamId === "") {
                        this.setState({
                            enterpriseInvite: enterpriseInvite,
                            showPage: Constants.DEAL_INVITE_TYPE.FILL_IN
                        })
                    } else if (enterpriseInvite.length === 0 && this.state.enterpriseTeamId !== "") {
                        this.finishSignin()
                    } else {
                        this.setState({
                            enterpriseInvite: enterpriseInvite,
                        });
                    }
                }
            })
    };
    handleSearchResultDiv = () => {
        let industryType = this.state.industryType;
        industryType.isShowSearchList = false;
        this.setState({
            industryType
        })
    };

    handleCutPic = () => {
        this.setState({
            showPage: Constants.DEAL_INVITE_TYPE.CUT_PIC
        })
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


    /*  ========================================= */
    _crop() {
        // image in dataUrl
        console.log(this.refs.cropper.getCroppedCanvas().toDataURL());
    }

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
                    showPage: Constants.DEAL_INVITE_TYPE.FILL_IN
                })
            }
        });
    };
    handleUploadLogoCancel = () => {
        this.setState({
            showPage: Constants.DEAL_INVITE_TYPE.FILL_IN
        })
    };

    dataURLtoFile = (dataurl, filename) => {//将base64转换为文件
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
    }

    //调用
    render() {
        const {} = this.props;
        let openContent;
        if (this.state.showPage === Constants.DEAL_INVITE_TYPE.INVITE) {

            openContent = (
                this.state.enterpriseInvite.map((enterprise, index) =>
                    <div className='invite' key={enterprise["id"]} style={{display: index === 0 ? "block" : "none"}}>
                        <div className="company" id={enterprise["id"]}>{enterprise["fullName"]}</div>
                        <div className="message">邀请您加入团队，确定加入吗？</div>
                        <div>
                            <button className="cancel" type="button"
                                    onClick={this.handleInvitesJoin.bind(this, -1, enterprise["id"])}>取消
                            </button>
                            <button className="join" type="button"
                                    onClick={this.handleInvitesJoin.bind(this, 1, enterprise["id"])}>加入
                            </button>
                        </div>
                    </div>
                )
            )
        } else if (this.state.showPage === Constants.DEAL_INVITE_TYPE.FILL_IN) {
            openContent = (
                <div className="fill-in">
                    <div className={"head-line"}>完善信息</div>
                    <div className="table-title">
                        <div className="up">填写基本信息</div>
                        <div className="down">请务必填写真实完整信息，方便大家与你联系</div>
                    </div>
                    <Form labelPosition="right" labelWidth="100" model={this.state.form}
                          className="demo-form-stacked"
                          rules={this.state.rules}>
                        <div className={"form-main"}>
                            <div className={"form-left"}>
                                <Form.Item label="姓名" className="username" prop="username">
                                    <Input placeholder="请填写真实姓名" value={this.state.form.username}
                                           onChange={this.onChange.bind(this, 'username')}/>
                                </Form.Item>
                                <Form.Item label="花名" className="nickname" prop="nickname">
                                    <Input placeholder="请填写常用称呼" value={this.state.form.nickname}
                                           onChange={this.onChange.bind(this, 'nickname')}/>
                                </Form.Item>
                                <Form.Item label="企业全称" className="enterprise-fullName"
                                           prop="enterpriseFullName">
                                    <Input placeholder="请填写公司真实完整名称" value={this.state.form.enterpriseFullName}
                                           onChange={this.onChange.bind(this, 'enterpriseFullName')}/>
                                </Form.Item>
                                <Form.Item label="企业简称" className="enterprise-shortName"
                                           prop="enterpriseShortName">
                                    <Input placeholder="请填写公司简称" value={this.state.form.enterpriseShortName}
                                           onChange={this.onChange.bind(this, 'enterpriseShortName')}/>
                                </Form.Item>
                                <Form.Item label="企业所在行业" className="industryType" prop="industryType">
                                    <Input placeholder="请填写公司所在行业" value={this.state.form.industryName}
                                           onClick={this.handleIndustryChoose}/>
                                </Form.Item>
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
                                    <div>上传公司标志</div>
                                </div>
                            </div>
                        </div>
                        <Button type="primary" className="submit" onClick={this.handleFillInForm.bind(this)}>完成</Button>
                    </Form>
                </div>
            )
        } else if (this.state.showPage === Constants.DEAL_INVITE_TYPE.INDUSTRY_TYPE) {

            openContent = (
                <div className="industry-type">
                    <div className={"head-line"}>行业类型</div>
                    <div className={"industry-search"} onClick={this.handleSearchResultDiv}>
                        <input
                            className="search"
                            placeholder="搜索行业名称"
                            value={this.state.industryTypeSearch}
                            onChange={this.handleSearchChange}
                            onClick={this.handleSearchChange}
                        />
                        <div
                            className={"search-list " + (this.state.industryType.isShowSearchList ? "isShow" : "istShow")}>
                            {
                                this.state.industryType.searchList.map((industryTypes, index) => {
                                    return (
                                        <div className={"search-item"} key={industryTypes.code}
                                             onClick={this.handleIndustryTypeChoose.bind(this, industryTypes.code, industryTypes.name)}>
                                            <span dangerouslySetInnerHTML={{__html: industryTypes.name}}/>
                                            <span>{industryTypes.pName}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="industry-list">
                        <Menu mode="vertical" defaultActive={this.state.industryType.activeIndustryPCodeIndex}
                              className="el-menu-vertical-demo industry-menu"
                              onSelect={this.handlePCodeChoose.bind(this)}>
                            {
                                this.state.industryType.pCodeList.map((industryType, index) => (
                                    <Menu.Item index={industryType.code} key={industryType.code}>
                                        {industryType.name}
                                    </Menu.Item>)
                                )
                            }
                        </Menu>
                        <div className={"industry-data"}>
                            {
                                this.state.industryType.codeList.map((twoAndThree, index) =>
                                    <div className={"industry-item"} key={twoAndThree["two"]["code"]}>
                                        <div
                                            className={"industry-title"}>{twoAndThree["two"]["name"]}</div>
                                        <div className={"industry-detail"}>
                                            <div className={"industry-line"}>
                                                {
                                                    twoAndThree["three"].map((industryType, index) =>
                                                        <span className={"industry-name"} key={industryType.code}
                                                              onClick={this.handleIndustryTypeChoose.bind(this, industryType.code, industryType.name)}>
                                                            {industryType.name}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            )
        } else if (this.state.showPage === Constants.DEAL_INVITE_TYPE.CUT_PIC) {
            let fileUpload = (
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
            );

            openContent = (
                <div className={"cut-pic"}>
                    <div className={"pic-main"}>
                        <div className={"pic-title"}>
                            编辑图片
                        </div>
                        <div className={"pic-cropper"}>
                            <Cropper
                                ref='cropper'
                                src={this.state.form.logoId === "" ? logoImage : getFileUrl(this.state.form.logoId)}
                                style={{height: 300, width: 300}}
                                // Cropper.js options
                                aspectRatio={1}
                                guides={false}
                                crop={this._crop.bind(this)}
                            />
                        </div>
                    </div>
                    <div className={"edit-main"}>
                        {fileUpload}
                        <div className={"right"}>
                            <button onClick={this.handleUploadLogoCancel}>取消</button>
                            <button onClick={this.handelUploadLogoOK}>确定</button>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="deal-invite">
                {openContent}
            </div>
        )

    }

}
