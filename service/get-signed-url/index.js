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
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true,
    },
    body: JSON.stringify(body),
  };
};

module.exports.handler =
  (event, context, callback) => {
    const filename = uuidV4();
    return s3.getSignedUrl('putObject', {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
    }, (err, url) => {
      return callback(null, createResponse(err, { url, filename }));
    });
  };
