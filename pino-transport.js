'use strict'
    
const pump = require('pump')
const { Transform } = require('node:stream')
const abstractTransport = require('pino-abstract-transport')
const Alpino = require('./index')
const SonicBoom = require('sonic-boom')
const { isMainThread } = require('node:worker_threads');


//This function was implemented In `pino-pretty`
/**
 * Creates a safe SonicBoom instance
 *
 * @param {object} opts Options for SonicBoom
 *
 * @returns {object} A new SonicBoom stream
 */
function buildSafeSonicBoom (opts) {
    const stream = new SonicBoom(opts)
    stream.on('error', filterBrokenPipe)
    // if we are sync: false, we must flush on exit
    if (!opts.sync && isMainThread) {
      setupOnExit(stream)
    }
    return stream
  
    function filterBrokenPipe (err) {
      if (err.code === 'EPIPE') {
        stream.write = noop
        stream.end = noop
        stream.flushSync = noop
        stream.destroy = noop
        return
      }
      stream.removeListener('error', filterBrokenPipe)
    }
  }

function build(opts = {}) {
    const pretty = Alpino()
    return abstractTransport(
        function (source) {
            const stream = new Transform({
                objectMode: true,
                autoDestroy: true,
                transform(chunk, enc, cb) {
                    const line = pretty(chunk)
                    cb(null, line)
                },
            })

            let destination

            if (typeof opts.destination === 'object' && typeof opts.destination.write === 'function') {
                destination = opts.destination
            } else {
                destination = buildSafeSonicBoom({
                    dest: opts.destination || 1,
                    append: opts.append,
                    mkdir: opts.mkdir,
                    sync: opts.sync, // by default sonic will be async
                })
            }

            source.on('unknown', function (line) {
                destination.write(line + '\n')
            })

            pump(source, stream, destination)
            return stream
        },
        { parse: 'lines' }
    )
}

module.exports = build
module.exports.default = build
