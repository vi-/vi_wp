const fs = require('fs');

const colors = {
  red: '#fa0000',
  blue: '#0000fa',
  green: '#00fa00',
};

const sassContents = (obj) => {
  let result = '';
  Object.keys(obj).forEach((key) => {
    result += `$${key}: ${obj[key]};\n`;
  });
  return result;
};

fs.writeFile('globalColours.scss', sassContents(colors), (err) => {
  if (err) throw err;
  // eslint-disable-next-line no-console
  console.log('colors sass file created...');
});
