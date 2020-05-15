module.exports = {
    testEnvironment: 'node',
    preset: '@shelf/jest-mongodb',
    collectCoverage: true,
    collectCoverageFrom: [
        './server/**/*'
    ],
    coverageDirectory: './coverage',
    coverageThreshold: {
        'global': {
            'statements': 65,
            'branches': 50,
            'functions': 45,
            'lines': 65
        }
    },
    verbose: true
};