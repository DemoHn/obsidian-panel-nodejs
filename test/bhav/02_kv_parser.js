const KVParser = require("../../app/proc/parser");
const fs = require("fs");
const expect = require('chai').expect;

describe('KVParser', () => {

    let test_file = ".test.properties";
    let parser;
    
    beforeEach(()=>{
        // just create file
        fs.openSync(test_file, "w");
        parser = new KVParser(test_file);
        parser.add("port", 25565);
    });

    describe('write config', ()=>{
        it("shall success", ()=>{
            parser.dumps();
            const content = fs.readFileSync(test_file, {encoding:"utf8"});
            const expected_content = "port=25565";
            expect(content).to.be.equal(expected_content);
        });
    });

    describe("read config", ()=>{
        it("shall success", ()=>{
            parser.dumps();
            let keys = parser.loads();
            expect(keys["port"]).to.be.equal("25565");
        });
    });

    describe("trim spaces", ()=>{
        it("no spaces after each value", ()=>{
            parser.add("motd", "习习蛤蛤     ");
            parser.dumps();
            let keys = parser.loads();
            expect(keys["motd"]).to.be.equal("习习蛤蛤");
        });
    });

    describe("null value", ()=>{
        it("seed=  &  max-height= ", ()=>{
            parser.add("seed", "");
            parser.add("max-height", null);
            parser.dumps();
            let keys = parser.loads();
            expect(keys["seed"]).to.be.equal("");
            expect(keys["max-height"]).to.be.equal("");
        });
    });


    afterEach(()=>{
        // delete file
        fs.unlinkSync(test_file);
    });
});