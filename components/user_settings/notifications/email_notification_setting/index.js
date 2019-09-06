// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Preferences} from 'panguaxe-redux/constants';

import {savePreferences} from 'panguaxe-redux/actions/preferences';

import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/common';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {get as getPreference} from 'panguaxe-redux/selectors/entities/preferences';

import EmailNotificationSetting from './email_notification_setting';

function mapStateToProps(state) {
    const config = getConfig(state);
    const emailInterval = parseInt(getPreference(
        state,
        Preferences.CATEGORY_NOTIFICATIONS,
        Preferences.EMAIL_INTERVAL,
        Preferences.INTERVAL_NOT_SET.toString(),
    ), 10);

    return {
        currentUserId: getCurrentUserId(state),
        emailInterval,
        enableEmailBatching: config.EnableEmailBatching === 'true',
        sendEmailNotifications: config.SendEmailNotifications === 'true',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailNotificationSetting);
