// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateUserActive, revokeAllSessionsForUser, promoteGuestToUser, demoteUserToGuest} from 'panguaxe-redux/actions/users';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';
import {getBotAccounts} from 'panguaxe-redux/selectors/entities/bots';
import {loadBots} from 'panguaxe-redux/actions/bots';

import * as Selectors from 'panguaxe-redux/selectors/entities/admin';

import SystemUsersDropdown from './system_users_dropdown.jsx';

function mapStateToProps(state) {
    const bots = getBotAccounts(state);
    return {
        config: Selectors.getConfig(state),
        currentUser: getCurrentUser(state),
        bots,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateUserActive,
            revokeAllSessionsForUser,
            promoteGuestToUser,
            demoteUserToGuest,
            loadBots,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsersDropdown);
