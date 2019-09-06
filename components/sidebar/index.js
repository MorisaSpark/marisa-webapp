// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Preferences} from 'panguaxe-redux/constants/index';
import {
    getCurrentChannel,
    getSortedUnreadChannelIds,
    getOrderedChannelIds,
    getUnreads,
} from 'panguaxe-redux/selectors/entities/channels';

import Permissions from 'panguaxe-redux/constants/permissions';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {getBool as getBoolPreference, getSidebarPreferences} from 'panguaxe-redux/selectors/entities/preferences';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';
import {haveITeamPermission} from 'panguaxe-redux/selectors/entities/roles';
import {getCurrentTeam} from 'panguaxe-redux/selectors/entities/teams';

import {switchToChannelById} from 'actions/views/channel';
import {openModal} from 'actions/views/modals';
import {close} from 'actions/views/lhs';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);
    const currentTeam = getCurrentTeam(state);

    const canCreatePublicChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PUBLIC_CHANNEL});
    const canCreatePrivateChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PRIVATE_CHANNEL});

    const sidebarPrefs = getSidebarPreferences(state);
    const lastUnreadChannel = state.views.channel.keepChannelIdAsUnread;
    const unreadChannelIds = getSortedUnreadChannelIds(state, lastUnreadChannel);
    const orderedChannelIds = getOrderedChannelIds(
        state,
        lastUnreadChannel,
        sidebarPrefs.grouping,
        sidebarPrefs.sorting,
        sidebarPrefs.unreads_at_top === 'true',
        sidebarPrefs.favorite_at_top === 'true',
    );

    const channelSwitcherOption = getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'channel_switcher_section',
        'true'
    );

    return {
        config,
        unreadChannelIds,
        orderedChannelIds,
        channelSwitcherOption,
        currentChannel,
        currentTeammate,
        currentTeam,
        currentUser: getCurrentUser(state),
        canCreatePublicChannel,
        canCreatePrivateChannel,
        isOpen: getIsLhsOpen(state),
        unreads: getUnreads(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            close,
            switchToChannelById,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
