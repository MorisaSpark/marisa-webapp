// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelReadOnly,
} from 'panguaxe-redux/selectors/entities/channels';
import {isChannelMuted} from 'panguaxe-redux/utils/channel_utils';

import {
    closeRightHandSide as closeRhs,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';

import ChannelHeaderMobile from './channel_header_mobile';

const isCurrentChannelMuted = createSelector(
    getMyCurrentChannelMembership,
    (membership) => isChannelMuted(membership),
);

const mapStateToProps = (state) => ({
    user: getCurrentUser(state),
    channel: getCurrentChannel(state),
    isMuted: isCurrentChannelMuted(state),
    isReadOnly: isCurrentChannelReadOnly(state),
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeLhs,
        closeRhs,
        closeRhsMenu,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderMobile);
