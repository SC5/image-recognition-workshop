#!/usr/bin/env bash

npm run build

BUCKET="s3://$1"

aws s3 rm $BUCKET --recursive
aws s3 cp ./build $BUCKET --recursive