// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {
    favoriteChannel,
    unfavoriteChannel,
    updateChannelNotifyProps,
} from 'panguaxe-redux/actions/channels';
import {getCustomEmojisInText} from 'panguaxe-redux/actions/emojis';
import {General} from 'panguaxe-redux/constants';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelReadOnly,
    getCurrentChannelStats,
} from 'panguaxe-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';
import {
    getCurrentUser,
    getUser,
} from 'panguaxe-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'panguaxe-redux/utils/channel_utils';

import {goToLastViewedChannel} from 'actions/views/channel';
import {openModal, closeModal} from 'actions/views/modals';
import {
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    updateRhsState,
} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import ChannelHeader from './channel_header';

const mapStateToProps = (state) => {
    const channel = getCurrentChannel(state) || {};
    const user = getCurrentUser(state);

    let dmUser;
    if (channel && channel.type === General.DM_CHANNEL) {
        const dmUserId = getUserIdFromChannelName(user.id, channel.name);
        dmUser = getUser(state, dmUserId);
    }
    const stats = getCurrentChannelStats(state) || {member_count: 0, guest_count: 0};

    return {
        teamId: getCurrentTeamId(state),
        channel,
        channelMember: getMyCurrentChannelMembership(state),
        currentUser: user,
        dmUser,
        rhsState: getRhsState(state),
        isFavorite: isCurrentChannelFavorite(state),
        isReadOnly: isCurrentChannelReadOnly(state),
        isMuted: isCurrentChannelMuted(state),
        isQuickSwitcherOpen: isModalOpen(state, ModalIdentifiers.QUICK_SWITCH),
        hasGuests: stats.guest_count > 0,
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        favoriteChannel,
        unfavoriteChannel,
        showFlaggedPosts,
        showPinnedPosts,
        showMentions,
        closeRightHandSide,
        updateRhsState,
        getCustomEmojisInText,
        updateChannelNotifyProps,
        goToLastViewedChannel,
        openModal,
        closeModal,
    }, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeader));
