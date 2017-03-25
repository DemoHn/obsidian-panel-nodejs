const expect = require("chai").expect;
const watcher = require("../../process_watcher/lib/process_watcher");

describe('Process Watcher', ()=>{
    // since launching an actual MC process will cost too much time,
    // we use mock_MC.jar for testing
    let mc_config = {
        "java_bin": "java",
        "min_RAM" : 10,
        "max_RAM" : 20,
        "jar_file" : __dirname + "/mock_MC.jar",
        "proc_cwd" : __dirname
    };
/*
    let proc;
    before(()=>{
        proc = watcher.Process(mc_config);
    })

    describe('test', ()=>{
        it('output 2333 (just for fun)', ()=>{
            expect(watcher.test()).to.be.equal(2333);
        });
    });

    describe('start process', ()=>{

    })*/
});