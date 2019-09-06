// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {getOpenGraphMetadataForUrl} from 'panguaxe-redux/selectors/entities/posts';
import {getBool} from 'panguaxe-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';

import {editPost} from 'actions/views/posts';

import {Preferences} from 'utils/constants';

import PostAttachmentOpenGraph from './post_attachment_opengraph.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);

    return {
        currentUserId: getCurrentUserId(state),
        enableLinkPreviews: config.EnableLinkPreviews === 'true',
        hasImageProxy: config.HasImageProxy === 'true',
        openGraphData: getOpenGraphMetadataForUrl(state, ownProps.link),
        previewEnabled: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, true),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            editPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAttachmentOpenGraph);
