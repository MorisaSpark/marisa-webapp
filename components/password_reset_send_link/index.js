// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {sendPasswordResetEmail, sendSMS, createUser, checkPhoneIsSignUp} from 'mattermost-redux/actions/users';
import {login} from 'actions/views/login';
import PasswordResetSendLink from './password_reset_send_link';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        login,
        sendPasswordResetEmail,
        sendSMS,
        createUser,
        checkPhoneIsSignUp,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(PasswordResetSendLink);
