// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannel} from 'panguaxe-redux/selectors/entities/channels';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {getUser} from 'panguaxe-redux/selectors/entities/users';
import {makeGetCommentCountForPost} from 'panguaxe-redux/selectors/entities/posts';
import {getMyPreferences} from 'panguaxe-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'panguaxe-redux/selectors/entities/teams';
import {isPostFlagged} from 'panguaxe-redux/utils/post_utils';

import {
    closeRightHandSide,
    selectPostFromRightHandSideSearch,
    selectPostCardFromRightHandSideSearch,
    setRhsExpanded,
} from 'actions/views/rhs';

import SearchResultsItem from './search_results_item.jsx';

function mapStateToProps() {
    const getCommentCountForPost = makeGetCommentCountForPost();

    return (state, ownProps) => {
        const config = getConfig(state);
        const preferences = getMyPreferences(state);
        const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
        const {post} = ownProps;
        const user = getUser(state, post.user_id);

        return {
            channel: getChannel(state, post.channel_id),
            currentTeamName: getCurrentTeam(state).name,
            commentCountForPost: getCommentCountForPost(state, {post}),
            enablePostUsernameOverride,
            isFlagged: isPostFlagged(post.id, preferences),
            isBot: user ? user.is_bot : false,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            selectPost: selectPostFromRightHandSideSearch,
            selectPostCard: selectPostCardFromRightHandSideSearch,
            setRhsExpanded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsItem);
