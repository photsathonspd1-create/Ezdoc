const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, function(redirectResponse) {
          redirectResponse.pipe(file);
          file.on('finish', function() {
            file.close(resolve);
          });
        }).on('error', function(err) {
          fs.unlink(dest);
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on('finish', function() {
          file.close(resolve);
        });
      }
    }).on('error', function(err) {
      fs.unlink(dest);
      reject(err);
    });
  });
};

Promise.all([
  download('https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Regular.ttf', 'public/fonts/Sarabun-Regular.ttf'),
  download('https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Bold.ttf', 'public/fonts/Sarabun-Bold.ttf')
]).then(() => {
  console.log('Fonts downloaded successfully');
}).catch(console.error);