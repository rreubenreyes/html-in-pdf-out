const bunyan = require('bunyan');
const pdf = require('html-pdf');
const path = require('path');
const { readFileSync } = require('fs');

const css = readFileSync(path.join(__dirname, "./cda.css"));

const log = bunyan.createLogger({
    name: 'html-in-pdf-out',
    level: 'debug'
});

const pdfOptions = {
    type: 'pdf',
    phantomPath: './node_modules/.bin/phantomjs',
};

const formatting = 'html { zoom: 0.64999 !important;' // 0.65 breaks the font size. Why? Who knows?
    + 'font-family: sans-serif !important; }';

/**
 * @param  {String|Buffer}  String or buffer representation of valid HTML
 * @return {Promise<Buffer>}  A PDF file buffer
 */
module.exports = function render(html) {
    log.info('Generating PDF')
    const file = html
        .toString()
        .replace('<link rel="stylesheet" type="text/css" href="./cda.css" />', `<style type="text/css>${css}</style>`);

    return new Promise((resolve, reject) => {
        pdf.create(file, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                log.error({ err }, 'Something went wrong', err.stack);
                reject(err);
            }
            log.info('Done')
            resolve(buffer);
        });
    });
}
