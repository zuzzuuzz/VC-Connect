const https = require('https');
const tls = require('tls');

const socket = tls.connect(443, 'cloud.smilegenix.ae', { servername: 'cloud.smilegenix.ae' }, () => {
    const cert = socket.getPeerCertificate();
    console.log('--- SSL/TLS AUDIT ---');
    console.log('Subject:', cert.subject);
    console.log('Issuer:', cert.issuer);
    console.log('Valid From:', cert.valid_from);
    console.log('Valid To:', cert.valid_to);
    console.log('Days Remaining:', Math.round((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)));
    console.log('Protocol:', socket.getProtocol());
    console.log('Cipher:', socket.getCipher());
    console.log('SANs:', cert.subjectaltname);
    socket.end();
});
socket.on('error', console.error);
