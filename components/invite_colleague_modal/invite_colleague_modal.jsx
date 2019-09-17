// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import './invite_colleague_modal.scss'
import {Button, Form, Input} from 'element-react';
import * as Utils from "../../utils/utils";
import {t} from "../../utils/i18n";

class InviteColleagueModal extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        modalId: PropTypes.string.isRequired,
        onHide: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
        intl: intlShape.isRequired,
        actions: PropTypes.shape({}),
    };

    constructor(props) {
        super(props);
        this.state = {
            form: {
                newPassword: "",
                oldPassword: "",
            },
            isEyeOpen: false,
            isShowErrorMes: false,
            errorMes: " 您输入的原密码错误，请重新输入。",
            colleagueList: [
                {
                    phone: '',
                    username: "",
                },
                {
                    phone: '',
                    username: "",
                },
                {
                    phone: '',
                    username: "",
                },
            ]
        }
    }


    onChange(key, value) {
        console.log(this.state.form);
        this.setState({
            form: Object.assign({}, this.state.form, {[key]: value})
        });
    }

    handleCancel = () => {
        this.props.onHide();
    };

    handleSubmit = () => {
        let colleagueList = this.state.colleagueList;
        let tempList = [];
        for (let i in colleagueList) {
            if ((colleagueList[i]["phone"] !== "" && colleagueList[i]["username"] === "") || (colleagueList[i]["phone"] === "" && colleagueList[i]["username"] !== "")) {
                let errorMessage = "表单数据需同时存在，请完善表单/删去无效数据";
                this.setState({
                    isShowErrorMessage: true,
                    errorMessage: errorMessage,
                });
                console.log(errorMessage);
                return
            }
            if (colleagueList[i]["phone"] !== "" && colleagueList[i]["username"] !== "") {
                tempList.push(colleagueList[i])
            }
        }

        for (let i in tempList) {
            if (!Utils.isPhone(tempList[i]["phone"])) {
                let errorMessage = "手机号号码不正确";
                this.setState({
                    isShowErrorMessage: true,
                    errorMessage: errorMessage,
                });
                console.log(errorMessage);
                return
            }
            let byteLength = Utils.getStringByteLength(tempList[i]["username"]);
            if (byteLength < 4 || byteLength > 32) {
                let errorMessage = "长度限制为4-32字节";
                this.setState({
                    isShowErrorMessage: true,
                    errorMessage: errorMessage,
                });
                console.log(errorMessage);
                return
            }
        }
        if (tempList.length === 0) {
            let errorMessage = "不存在手机号与姓名都合理的表单行";
            this.setState({
                isShowErrorMessage: true,
                errorMessage: errorMessage,
            });
            console.log(errorMessage);
            return
        }
        let data = {
            teamId: this.props.currentTeamId,
            userId: this.props.currentUserId,
            colleagueList: tempList
        };
        console.log(data);
        this.setState({
            isShowErrorMessage: false,
            errorMessage: "",
        });

        this.props.actions.inviteColleagues(data)
            .then((res) => {
                if (res.result !== undefined && res.result.Flag) {
                    this.props.onHide();
                } else {
                    this.setState({
                        isShowErrorMessage: true,
                        errorMessage: "邀请失败，请稍后尝试",
                    })
                }
            })
    };

    onClickAddLine = () => {
        let colleagueList = JSON.parse(JSON.stringify(this.state.colleagueList));
        colleagueList.push({phone: "", username: ""});
        this.setState({
            colleagueList
        })
    };

    onChangeFormInput = (index, key, e) => {
        let colleagueList = JSON.parse(JSON.stringify(this.state.colleagueList));
        colleagueList[index][key] = e.target.value;
        this.setState({
            colleagueList
        });
        console.log(this.state.colleagueList);
    };

    render() {
        return (
            <Modal
                dialogClassName='invite-colleague'
                show={this.props.show}
                onHide={this.props.onHide}
                id='invite-colleague'
                role='dialog'
                aria-labelledby='inviteColleagueModalLabel'
            >
                <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="64"
                      className="demo-ruleForm">
                    <Modal.Header closeButton={false}>
                        <Modal.Title
                            componentClass='div'
                            id='inviteColleagueModalLabel'
                        >
                            邀请同事加入
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={this.state.isShowErrorMessage ? "tips" : "displayNone"}>
                            <i className="el-icon-circle-close"/>
                            {this.state.errorMessage}
                        </div>
                        <div className={"form-title"}>
                            <span>手机号码</span>
                            <span>姓名</span>
                        </div>
                        <div className={"form-inputs"}>
                            {
                                this.state.colleagueList.map((colleague, index) => {
                                    return (
                                        <div className={"form-input"} key={index}>
                                            <input placeholder="请输入手机号" value={colleague["phone"]}
                                                   onChange={this.onChangeFormInput.bind(this, index, 'phone')}/>
                                            <input placeholder="请输入姓名"
                                                   value={colleague["username"]}
                                                   onChange={this.onChangeFormInput.bind(this, index, 'username')}/>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className={"add-more"} onClick={this.onClickAddLine}>
                            <i className="el-icon-plus"/>
                            添加邀请人
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-danger'
                            onClick={this.handleSubmit}
                            id='inviteColleagueYes'
                        >
                            发送邀请
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

export default injectIntl(InviteColleagueModal);
