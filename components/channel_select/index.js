// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {getMyChannels} from 'panguaxe-redux/selectors/entities/channels';
import {getCurrentUserLocale} from 'panguaxe-redux/selectors/entities/i18n';
import {sortChannelsByTypeAndDisplayName} from 'panguaxe-redux/utils/channel_utils';

import ChannelSelect from './channel_select.jsx';

const getMyChannelsSorted = createSelector(
    getMyChannels,
    getCurrentUserLocale,
    (channels, locale) => {
        return [...channels].sort(sortChannelsByTypeAndDisplayName.bind(null, locale));
    }
);

function mapStateToProps(state) {
    return {
        channels: getMyChannelsSorted(state),
    };
}

export default connect(mapStateToProps)(ChannelSelect);
