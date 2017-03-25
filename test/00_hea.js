const expect = require('chai').expect;

describe('Hea', () => {
  describe('1+1=2', ()=> {
    it('1+1 shall be 2', ()=>{
        expect(1+1).to.be.equal(2);
    });
  });

  describe('5 > 2', ()=>{
      it('5 shall be larger than 2', ()=>{
        expect(5).to.be.above(2);
      });
  });

  describe('[1,2,3]', ()=>{
    it('[1,2,3].map((x)=>{reutrn x*2}) shall be [2,4,6]', ()=>{
      expect([1,2,3].map((x)=>{return x*2})).to.deep.equal([2,4,6]);
    })
  })
});
