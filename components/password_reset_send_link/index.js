// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {sendPasswordResetEmail, sendSMS} from 'mattermost-redux/actions/users';

import PasswordResetSendLink from './password_reset_send_link';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        sendPasswordResetEmail,
        sendSMS,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(PasswordResetSendLink);
