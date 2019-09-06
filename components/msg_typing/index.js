// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {makeGetUsersTypingByChannelAndPost} from 'panguaxe-redux/selectors/entities/typing';

import MsgTyping from './msg_typing.jsx';

function makeMapStateToProps() {
    const getUsersTypingByChannelAndPost = makeGetUsersTypingByChannelAndPost();

    return function mapStateToProps(state, ownProps) {
        const typingUsers = getUsersTypingByChannelAndPost(state, {channelId: ownProps.channelId, postId: ownProps.postId});

        return {
            typingUsers,
        };
    };
}

export default connect(makeMapStateToProps)(MsgTyping);
