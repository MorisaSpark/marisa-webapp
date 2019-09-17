import React from 'react'
import Constants from "../../utils/constants";
import * as Utils from "../../utils/utils";
import {FormattedMessage} from 'react-intl';

export default class GetVerifyCodeButton extends React.Component {
    static   propTypes = {
        newPhone: PropTypes.string.isRequired,
        typeM: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            newPhone: props.newPhone,
            typeM: props.typeM,
            title: props.newPhone,
            isCountDown: false,
            deadTime: 10,
            internal: 10,
            isShowMessage: false,
            serverError: "",
            error: "",
        };

    }

    //倒计60s
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

    submitSendSMS = () => {
        if (this.state.isCountDown) {
            return;
        }
        const newPhone = this.props.newPhone;
        const typeM = this.state.typeM;
        if (!Utils.isPhone(newPhone)) {
            this.setState({
                isShowMessage: true,
                serverError: '请输入有效的手机号',
                error: (
                    <FormattedMessage
                        id={'password_send.error'}
                        defaultMessage={'Please enter a valid phone number.'}
                    />
                ),
            });
            console.log("请输入有效的手机号");
            return;
        } else {
            this.setState({
                isShowMessage: false,
            })
        }
        this.props.actions.sendSMS(newPhone, typeM)
            .then((data) => {
                if (data["data"] === true) {
                    console.log(data);
                    let deadTime = this.state.internal;
                    this.count();
                    this.setState({
                        deadTime: deadTime,
                        isCountDown: true
                    })
                } else {

                }
            });
    };

    render() {
        return (
            <button
                id='verificationCodeButton'
                type='button'
                className={'btn btn-primary btn-send-sms ' + (this.state.isCountDown ? "css-ban-click" : "")}
                onClick={this.submitSendSMS}
            >
                {this.state.isCountDown ? (this.state.deadTime + " 秒") : ("获取验证码")}
            </button>
        )
    }
}
