import React, {Component} from 'react';
import './upload_part.scss';
import ReactDOM from 'react-dom'
import Cropper from 'react-cropper';
import {sortFileInfos, getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';
import LogoImage from 'images/ithpower/login/logo_words.png';

export default class UploadPart extends Component {
    _crop() {
        // image in dataUrl
        console.log(this.refs.cropper.getCroppedCanvas().toDataURL());
    }

    constructor(props) {
        super(props);
        this.state = {
            picSrcId: this.props.picSrcId,
        }
    }

    render() {
        return (
            <div>
                <Cropper
                    ref='cropper'
                    src={this.state.picSrcId === "" ? "" : getFileUrl(this.state.picSrcId)}
                    style={{height: 300, width: 300}}
                    // Cropper.js options
                    aspectRatio={1}
                    guides={false}
                    crop={this._crop.bind(this)}/>
            </div>
        );
    }
}
