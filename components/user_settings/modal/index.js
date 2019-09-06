// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {sendVerificationEmail} from 'panguaxe-redux/actions/users';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';

import UserSettingsModal from './user_settings_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalChannelOrganization = config.ExperimentalChannelOrganization === 'true';
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';

    return {
        currentUser: getCurrentUser(state),
        closeUnusedDirectMessages,
        experimentalChannelOrganization,
        sendEmailNotifications,
        requireEmailVerification,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            sendVerificationEmail,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModal);
