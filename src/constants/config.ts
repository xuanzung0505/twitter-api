import minimist from 'minimist'

const options = minimist(process.argv.slice(2))

export const isProduction = Boolean(options.production)
