const authHeader = 'Basic YWRtaW46cGFzc3dvcmQ='
var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString()//.split(':');
console.log(auth)