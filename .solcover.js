module.exports = {
    // port: 8555,
    // testrpcOptions: '-p 6545 -u 0x54fd80d6ae7584d8e9a19fe1df43f04e5282cc43',
    // testCommand: 'mocha --timeout 5000',
    norpc: true,
    // dir: './secretDirectory',
    // copyPackages: ['openzeppelin-solidity'],
    // skipFiles: ['Routers/EtherRouter.sol']
    testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
    compileCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle compile --network coverage',
  skipFiles: [
    'MetaCoin.sol'
  ]
};
