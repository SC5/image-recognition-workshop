'use strict';

const AWS = require('aws-sdk');
const uuidV4 = require('uuid/v4');

const s3 = new AWS.S3();

const createResponse = (error, data) => {
  const statusCode = error ? 500 : 200;
  const body = error || data;
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
};

module.exports.handler =
  (event, context, callback) => {
    let filename = '';
    let action = '';
    if (event.pathParameters) {
      filename = event.pathParameters.filename;
      action = 'getObject';
    } else {
      filename = uuidV4();
      action = 'putObject';
    }
    return s3.getSignedUrl(action, {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
    }, (err, url) =>
      callback(null, createResponse(err, { url, filename })));
  };
