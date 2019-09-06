// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setStatus} from 'panguaxe-redux/actions/users';
import {Client4} from 'panguaxe-redux/client';
import {getCurrentUser, getStatusForUserId} from 'panguaxe-redux/selectors/entities/users';
import {Preferences} from 'panguaxe-redux/constants';
import {get} from 'panguaxe-redux/selectors/entities/preferences';

import {openModal} from 'actions/views/modals';

import StatusDropdown from 'components/status_dropdown/status_dropdown.jsx';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state);

    if (!currentUser) {
        return {};
    }

    const userId = currentUser.id;
    return {
        userId,
        profilePicture: Client4.getProfilePictureUrl(userId, currentUser.last_picture_update),
        autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, userId, ''),
        status: getStatusForUserId(state, userId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            setStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusDropdown);
