const s3 = require('s3')

class S3Publisher{
    constructor(config){
        let {accessKeyId, secretAccessKey, region, localDir, s3PutObjectParams} = config;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.region = region;
        this.localDir = localDir;
        this.s3PutObjectParams = s3PutObjectParams;
    }

    unixBackslashes (input){
        const isExtendedLengthPath = /^\\\\\?\\/.test(input);
        const hasNonAscii = /[^\u0000-\u0080]+/.test(input);

        if (isExtendedLengthPath || hasNonAscii) {
            return input;
        }

        return input.replace(/\\/g, '/');
    }

    winBackslashes (input){
        return input.replace(/\//g,'\\');
    }

    publish(callback){
        let clientConfig = {
            //maxAsyncS3: 20,     // this is the default 
            //s3RetryCount: 3,    // this is the default 
            //s3RetryDelay: 1000, // this is the default 
            //multipartUploadThreshold: 20971520, // this is the default (20 MB) 
            //multipartUploadSize: 15728640, // this is the default (15 MB) 
            s3Options: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
                region: this.region
                // any other options are passed to new AWS.S3(). See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
            }
        };
        var client = s3.createClient(clientConfig);

        var params = {
            localDir: this.unixBackslashes(this.localDir),
            deleteRemoved: true, // default false, whether to remove s3 objects that have no corresponding local file. 
            s3Params: this.s3PutObjectParams
            /*{
                Bucket: "s3 bucket name",
                Prefix: "some/remote/dir/",
                // other options supported by putObject, except Body and ContentLength. See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
            }*/
          };

          let progressAmount = undefined;
          let progressTotal = undefined;
          let onProgressUpdate = function(amount, total){
          };

          function checkUpdateProgress(amount, total){
              if(progressTotal!=total || progressAmount!=amount){
                progressTotal = total;
                progressAmount = amount;
                if(onProgressUpdate)
                    onProgressUpdate(amount, total);
              }
          }

          var uploader = client.uploadDir(params);
          uploader.on('error', function(err) {
            callback(err);
          });
          uploader.on('progress', function() {
            checkUpdateProgress(uploader.progressAmount, uploader.progressTotal);
          });
          uploader.on('end', function() {
            callback(undefined);
          });
    }
}

module.exports = S3Publisher;