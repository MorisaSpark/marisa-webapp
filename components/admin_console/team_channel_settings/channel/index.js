// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {connect} from 'react-redux';

import {ChannelsSettings} from './channel_settings';

function mapStateToProps(state) {
    const config = getConfig(state);
    const siteName = config.SiteName;

    return {
        siteName,
    };
}

export default connect(mapStateToProps)(ChannelsSettings);
