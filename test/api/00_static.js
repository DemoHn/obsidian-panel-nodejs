const expect = require("chai").expect;
const utils = require("../../utils");
const app = require("../../app").app;
const request = require('supertest')(app);

describe('Static Request API', ()=>{
    
    let version;

    before(()=>{
        version = utils.get_version();
    });

    describe('GET /vendors-xxx.js', ()=>{
        it('should return 200', (done)=>{
            request.get(`/vendors-${version}.js`).expect(200, done);
        });
    });

    describe('GET /super_admin.app-xxx.js', ()=>{
        it('should return 200', (done)=>{
            request.get(`/super_admin.app-${version}.js`).expect(200, done);
        });
    });

    describe('GET /server_inst.app-xxx.js', ()=>{
        it('should return 200', (done)=>{
            request.get(`/server_inst.app-${version}.js`)
                .expect(200, done);
        });
    });

    describe('GET /', ()=>{
        it('should return 200', (done)=>{
            request.get('/').expect(302, done);
        });
    });

    describe('GET /login', ()=>{
        it('should return 200', (done)=>{
            // redirect
            request.get('/login').expect(200, done);
        });
    });

    describe('GET /startup', ()=>{
        it('should return 200', (done)=>{
            request.get('/startup').expect(200, done);
        });
    });
});