'use strict';

const AWS = require('aws-sdk');
const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const klawSync = require('klaw-sync');
const fileType = require('file-type');
const readChunk = require('read-chunk');

class DeployFrontend {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      deploy: {
        lifecycleEvents: []
      },
    };

    this.hooks = {
      'after:deploy:deploy': () => this.afterDeployDeploy(this.serverless, this.options),
    };
  }

  afterDeployDeploy(serverless, options) {
    if(options['deploy-frontend']) {
      const cloudformation = new AWS.CloudFormation({
        region: options.region,
      });

      const s3 = new AWS.S3({
        region: options.region,
      });

      const stackname = serverless.providers.aws.naming.getStackName();
      cloudformation.describeStacks({
        StackName: stackname,
      }).promise().then((response) => {
        const outputs = response.Stacks[0].Outputs;
        const serviceEndpoint = outputs.filter((output) => output.OutputKey === 'ServiceEndpoint')[0].OutputValue;
        const siteBucket = outputs.filter((output) => output.OutputKey === 'SiteBucket')[0].OutputValue;
        const siteURL = outputs.filter((output) => output.OutputKey === 'SiteURL')[0].OutputValue;
        return { serviceEndpoint, siteBucket, siteURL }
      }).then(({ serviceEndpoint, siteBucket, siteURL }) => {

        const frontendDir = path.resolve(process.cwd(), '..', 'frontend');
        const configFile = path.resolve(frontendDir, 'src', 'config.json');
        fs.writeFileSync(configFile, JSON.stringify({ endpoint: serviceEndpoint }, null, 2));
        process.chdir(frontendDir);
        child_process.execSync(`./deploy.sh ${siteBucket}`, { stdio:[ 0, 1, 2 ] });
        serverless.cli.log(`Website URL: ${siteURL}`);
      });
    }
  }
}

module.exports = DeployFrontend;
