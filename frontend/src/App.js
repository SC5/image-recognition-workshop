import React, { Component } from 'react';
import './App.css';

import { endpoint } from './config.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      labels: [''],
      status: 'Select an image'
    };
  }

  _handleSubmit(event) {
    event.preventDefault();
    return this._getSignedUrl()
      .then((data) =>
        this._uploadFile(Object.assign({}, data, { file: this.state.file })))
      .then((filename) =>
        this._getLabels(filename))
      .then((response) => {
        const labels =
          response.Labels
            .map(({Confidence, Name}) =>
              `${Name} (${Confidence})`);

        return this.setState({
          status: 'Select an image',
          labels
        });
      });
  }

  _getSignedUrl() {
    const url = `${endpoint}/signed-url`;
    this.setState({
      status: 'Getting URL for upload...'
    });
    return fetch(url, { mode: 'cors' })
      .then(response => response.json())
      .then(response => Object.assign(response));
  }

  _uploadFile({ url, filename, file }){
    return new Promise((resolve) => {
      const reader = new FileReader();
      this.setState({
        status: 'Uploading image...'
      });
      reader.onloadend = () =>
        fetch(url, {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'content-length': file.size,
          },
          body: reader.result,
        }).then(() => resolve(filename));

      reader.readAsArrayBuffer(file);
    });
  }

  _getLabels(filename) {
    const url = `${endpoint}/labels/${filename}`;
    this.setState({
      status: 'Getting labels...'
    });
    return fetch(url, {
      mode: 'cors',
    })
      .then(response => response.json());
  }

  _handleImageChange(e) {
    e.preventDefault();
    this.setState({
      labels: ['']
    });
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file,
        imagePreviewUrl: reader.result,
        status: 'Press "Get labels" button'
      });
    };

    reader.readAsDataURL(file)
  }

  render() {
    let { imagePreviewUrl, labels, status } = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      const divStyle = {
        backgroundImage: 'url(' + imagePreviewUrl + ')'
      }
      $imagePreview = (<div className="previewImage" style={ divStyle }></div>);
    } else {
      $imagePreview = (<div></div>);
    }
    return (
      <div className="container">
        <h1>Image Recognition Workshop</h1>
        <div className="header">
          <div className="form">
            <form onSubmit={(e) => this._handleSubmit(e)}>
              <input className="fileInput" name="file" id="file" type="file" onChange={(e) => this._handleImageChange(e)}/>
              <label htmlFor="file">Choose an image</label>
              <button className="submitButton" type="submit" onClick={(e) => this._handleSubmit(e)}>Get labels</button>
            </form>
          </div>
          <div className="status">
            <span>{status}</span>
          </div>
        </div>
        <div className="content">
          <div className="image">
            <div className="imgPreview">
              {$imagePreview}
            </div>
          </div>
          <div className="labels">
            {labels.map((label, i) => {
              return <div key={i} className="label">{label}</div>;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
