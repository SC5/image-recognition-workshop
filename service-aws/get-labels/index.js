'use strict';

const AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition();
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
    console.log(event);
    const filename = event.pathParameters.filename;

    const params = {
      Image: {
        S3Object: {
          Bucket: process.env.BUCKET_NAME,
          Name: filename,
        },
      },
      MaxLabels: 100,
      MinConfidence: 50,
    };

    return rekognition.detectLabels(params).promise()
      .then(data => s3.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
      }).promise().then(() => data))
      .then(data => callback(null, createResponse(null, data)))
      .catch(error => callback(null, createResponse(error)));
  };
