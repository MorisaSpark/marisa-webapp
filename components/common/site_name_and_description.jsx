// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import phoneLogoWords from 'images/ithpower/login/phone_logo_words.png';
import './site_name_and_description.scss'

export default class SiteNameAndDescription extends React.PureComponent {
    static propTypes = {
        customDescriptionText: PropTypes.string,
        siteName: PropTypes.string,
    };

    static defaultProps = {
        siteName: 'Mattermost',
    };

    render() {
        const {
            customDescriptionText,
            siteName,
        } = this.props;
        let description = null;
        if (customDescriptionText) {
            description = customDescriptionText;
        }
        // else {
        //     description = (
        //         <FormattedMessage
        //             id='web.root.signup_info'
        //             defaultMessage='All team communication in one place, searchable and accessible anywhere'
        //         />
        //     );
        // }

        return (
            <React.Fragment>
                <h1 id='site_name'><img className='phoneLogoWords' src={phoneLogoWords} alt="tu"/></h1>
                <h4
                    id='site_description'
                    className='color--light'
                >
                    {description}
                </h4>
            </React.Fragment>
        );
    }
}
