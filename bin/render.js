#!/usr/bin/env node

/* eslint-disable global-require */

const mkdirp = require('mkdirp');
const path = require('path');
const program = require('commander'); // eslint-disable-line
const { readdirSync, readFileSync, writeFile } = require('fs');
const bunyan = require('bunyan');

const render = require('../lib/renderer');

const log = bunyan.createLogger({
    name: 'html-in-pdf-out-cli',
    level: 'debug',
})

const DATA_PHI = path.join(__dirname, '../data');

function renderAll(dir) {
    const files = readdirSync(dir);
    return Promise.all(files.map(async file => {
        await renderPDF(`${dir}/${file}`);
    }));
}

function renderPDF(filepath) {
    const filename = path.basename(filepath).split('.html')[0];
    const dest = `${DATA_PHI}/${filename}.pdf`;
    const file = readFileSync(filepath, 'utf8');
    log.info(filepath, filename, 'Rendering');

    return new Promise((resolve, reject) => {
        render(file).then(data => {
            log.info(typeof file, 'Finished rendering. Writing to machine');
            mkdirp(DATA_PHI, (err) => {
                log.info(`Output will be written to ${dest}`);

                log.debug(`Writing output to ${dest}`);
                writeFile(dest, data, (werr) => {
                    if (werr) {
                        log.error({ err: werr }, `Error writing file ${dest}`);
                        reject(werr);
                    }

                    log.info(`Wrote ${dest}`);
                    resolve();
                });
            });
        })
    })
}

const done = () => {
    log.info('Done');
    process.exit();
};

const run = (action, callback = done) => async (...args) => {
    return action(...args).then(callback);
};

program
    .version('0.1.0');

program
    .command('pdf <filepath>')
    .description('Retrieve and compile raw CCD report for a user')
    .action(run(renderPDF));

program
    .command('pdfs <filepath>')
    .description('Retrieve and compile raw CCD report for a user')
    .action(run(renderAll));

program.on('command:*', () => {
    log.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' '),
    );

    process.exit(1);
});

program.parse(process.argv);

