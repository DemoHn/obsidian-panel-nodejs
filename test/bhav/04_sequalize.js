const expect = require('chai').expect;
const Sequelize = require("sequelize");
const fs = require("fs");
describe('Sequelize', () => {

    let sequelize;
    let User;
    beforeEach((done)=>{
        sequelize = new Sequelize('ob_panel','ob_panel', null, {
            dialect: "sqlite",
            storage: `${__dirname}/test.db`
        });
        User = sequelize.define('user',{
            uid: {
                type: Sequelize.INTEGER,
                auoIncrement: true 
            },
            username: Sequelize.STRING,
            birthday: Sequelize.DATE
        });
        done();
    });

    describe('#create', ()=> {
        it('create table succeed', (done)=>{
            sequelize.sync().then(()=>{
                return User.create({
                    id: 1,
                    username: 'demohn',
                    birthday: new Date(2000,2,1)
                });
            }).then((data)=>{
                try{
                    expect(data.get().username).is.to.be.equal("demohn");
                    done();
                }catch(err){
                    done(err);
                    return ;
                }
            })
        });
    });

    describe('#queryAll',()=>{
        it('get all data',(done)=>{
            sequelize.sync().then(()=>{
                return User.bulkCreate([
                    {
                        username: "A",
                        birthday: new Date(2000,2,1)
                    },
                    {
                        "username":"B",
                        birthday: new Date(2010,2,2)
                    }
                ]);
            }).then(()=>{
                return User.findAll();
            }).then((users)=>{
                try{
                    expect(users).to.have.lengthOf(2);
                    done();
                }catch(err){
                    done(err);
                    return ;
                }
            });
        });
    });

    describe('#queryById',()=>{
        it('get first data',(done)=>{
            sequelize.sync().then(()=>{
                return User.bulkCreate([
                    {
                        username: "C",
                        birthday: new Date(2000,2,1)
                    },
                    {
                        "username":"D",
                        birthday: new Date(2010,2,2)
                    }
                ]);
            }).then(()=>{
                return User.findById(1);
            }).then((users)=>{
                try{
                    expect(users.get().username).to.be.equal("C");
                    done();
                }catch(err){
                    done(err);
                    return ;
                }
            });
        });
    });

    describe('#count',()=>{
        it('get rows\' number',(done)=>{
            sequelize.sync().then(()=>{
                return User.bulkCreate([{
                        username: "C",
                        birthday: new Date(2000,2,1)
                    },{
                        username: "E",
                        birthday: new Date(2012,2,1)
                    },{
                        "username":"D",
                        birthday: new Date(2010,2,2)
                    }]);
            }).then(()=>{
                return User.count();
            }).then((count)=>{
                try{
                    expect(count).to.be.equal(3);
                    done();
                }catch(err){
                    done(err);
                    return ;
                }
            });
        });
    });

    describe('#sort',()=>{
        it('get youngest user',(done)=>{
            sequelize.sync().then(()=>{
                return User.bulkCreate([{
                        username: "B",
                        birthday: new Date(2014,2,1)
                    },{
                        username: "C",
                        birthday: new Date(2012,2,1)
                    },{
                        "username":"D",
                        birthday: new Date(2010,2,1)
                    }]);
            }).then(()=>{
                return User.findAll({
                    limit:1,
                    order: '"birthday" DESC'
                })
            }).then((users)=>{
                try{
                    expect(users[0].get().username).to.be.equal("B");
                    done();
                }catch(err){
                    done(err);
                    return ;
                }
            });
        });
    });

    describe('#delete', ()=>{
        it('delete row "B"',(done)=>{
            sequelize.sync().then(()=>{
                return User.bulkCreate([{
                        username: "B",
                        birthday: new Date(2014,2,1)
                    },{
                        username: "C",
                        birthday: new Date(2012,2,1)
                    },{
                        "username":"D",
                        birthday: new Date(2010,2,1)
                    }]);
            }).then(()=>{
                return User.destroy({
                    where:{
                        username: "B"
                    }
                })
            }).then(()=>{
                return User.count()
            }).then((count)=>{
                try{
                    expect(count).to.be.equal(2);
                    done();
                }catch(err){
                    done(err);
                    return ;
                }
            });
        });
    });

    afterEach(()=>{
        fs.unlinkSync(`${__dirname}/test.db`);
    })
});
