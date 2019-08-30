const bunyan = require('bunyan');
const pdf = require('html-pdf');

const log = bunyan.createLogger({
    name: 'html-in-pdf-out',
    level: 'debug'
});

const pdfOptions = {
    type: 'pdf',
    phantomPath: './node_modules/.bin/phantomjs',
};

const formatting = 'html { zoom: 0.55 !important;' // 0.65 breaks the font size. Why? Who knows?
    + 'font-family: sans-serif !important; }';

/**
 * @param  {String|Buffer}  String or buffer representation of valid HTML
 * @return {Promise<Buffer>}  A PDF file buffer
 */
module.exports = function render(html) {
    log.info('Generating PDF')
    const file = html
        .toString()
        .replace('<style type="text/css">', `<style type="text/css">${formatting}`);

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
