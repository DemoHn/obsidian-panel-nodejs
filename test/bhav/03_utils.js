const utils = require("../../utils");
const expect = require('chai').expect;

describe('utils', () => {
    
    describe('get version', ()=>{
        it("satisfy `X.Y.Z` format", ()=>{
            let version = utils.get_version();
            expect(/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)).to.be.true;
        });
    });

    describe("get debug", ()=>{
        it("shall success", ()=>{
            let is_debug = utils.is_debug();
            expect(is_debug).to.be.false;
        });
    });

    describe("types", ()=>{
        it("isNumber, isJSONString, isFunction, isArray shall work", ()=>{
            const types = utils.types;

            expect(types.isArray([1,2,3])).to.be.true;
            expect(types.isArray("ASDF")).to.be.false;

            expect(types.isJSONString()).to.be.false;
            expect(types.isJSONString([1,2])).to.be.false;
            expect(types.isJSONString("{\"a\":1}")).to.be.true;

            expect(types.isNumber(12)).to.be.true;
            expect(types.isNumber("12")).to.be.false;

            expect(types.likeNumber("12")).to.be.true;
            expect(types.likeNumber(12)).to.be.true;
            expect(types.likeNumber("0x02")).to.be.true;
            
            expect(types.isString("asdf")).to.be.true;
            expect(types.isString({})).to.be.false;
        });
    });

    describe("rtn.success & rtn.error", ()=>{
        it("shall return JSON string", ()=>{
            const rtn = utils.rtn;
            const types = utils.types;

            expect(types.isJSONString(rtn.success(true))).to.be.true;
            expect(types.isJSONString(rtn.error("400"))).to.be.true;
        });
    });

    describe('get config', ()=>{
        it("shall read configuration file correctly", ()=>{
            const config = utils.get_config();
            expect(config["global"]["zhao"]).to.be.oneOf([0,1]);
        });
    });

    describe('dump config', ()=>{
        it("shall dump config data correctly", ()=>{
            const config = utils.dump_config({'A':{'B':2}});
            expect(config).to.be.equal("A:\n  B: 2\n");
        });
    });
    
    describe('nickname', () => {
        it("shall return correctly", ()=>{
            const nickname = utils.nickname.get(0);
            expect(nickname).to.be.equal("kill-egg");
        })
    });
});