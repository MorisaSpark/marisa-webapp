// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants.jsx';
import {isKeyPressed, isPhone} from 'utils/utils';

import './invite_colleague_modal.scss'
import {Button, Form, Input, Menu, Upload, Radio, Checkbox, MessageBox, Dialog} from 'element-react';

class InviteColleagueModal extends React.PureComponent {
    static propTypes = {

        /**
         * Current user id.
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Current team id.
         */
        currentTeamId: PropTypes.string.isRequired,

        /**
         * hide action
         */

        onHide: PropTypes.func.isRequired,

        /**
         * show or hide modal
         */

        show: PropTypes.bool.isRequired,

        intl: intlShape.isRequired,

        actions: PropTypes.shape({

            /**
             * An action to remove user from team
             */

            leaveTeam: PropTypes.func.isRequired,

            /**
             * An action to toggle the right menu
             */

            toggleSideBarRightMenu: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            colleagueList: [
                {
                    phone: "",
                    username: ""
                },
                {
                    phone: "",
                    username: ""
                },
                {
                    phone: "",
                    username: ""
                },
            ],
            isShowErrorMessage: false,
            errorMessage: "",
        }
    }

    count = () => {
        let deadTime = this.state.internal;
        let isCountDown = true;
        let timer1 = setInterval(() => {
            console.log(deadTime);
            console.log(isCountDown);
            deadTime--;
            if (deadTime <= 0) {
                isCountDown = false;
                window.clearInterval(timer1)
            }
            this.setState({deadTime: deadTime, isCountDown: isCountDown})
        }, 1000);
    };

    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('keypress', this.handleKeyPress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleSubmit(e);
        }
    };

    handleSubmit = () => {

        let colleagueList = this.state.colleagueList;
        for (let i in colleagueList) {
            if (!(colleagueList[i]["phone"] === "" && colleagueList[i]["username"] === "") || isPhone(colleagueList[i]["phone"])) {
                this.setState({
                    isShowErrorMessage: true,
                    errorMessage: "缺少内容、手机号有误",
                });
                return
            }
        }

        this.props.actions.inviteColleague(colleagueList)
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

    onChange(key, value) {
        this.setState({
            form: Object.assign(this.state.form, {[key]: value})
        });
    }

    onClickAddLine = () => {
        let colleagueList = this.state.colleagueList;
        colleagueList.push({phone: "", username: ""});
        this.setState({
            colleagueList
        })
    };

    render() {
        return (
            <Modal
                dialogClassName='invite-colleague'
                show={this.props.show}
                onHide={this.props.onHide}
                id='changePhoneModal'
                role='dialog'
                aria-labelledby='changePhoneModalLabel'
            >
                <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="64"
                      className="demo-ruleForm">
                    <Modal.Header closeButton={false}>
                        <Modal.Title
                            componentClass='div'
                            id='changePhoneModalLabel'
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
                                            <Input placeholder="请输入手机号" value={colleague.username}/>
                                            <Input placeholder="请输入姓名" value={colleague.phone}/>
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
                            id='changePhoneYes'
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
