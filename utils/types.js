/*
Javascript's type judging is VERY VERY VERY weird!
So I wrote this utility to help me.

It's similiar of underscore's isXXX function

Nigshoxiz
23/03/2017
*/
module.exports = {
    isArray : (item)=>{
        return Array.isArray(item);
    },
    isFunction : (item)=>{
	    let getType = {};
    	return item && getType.toString.call(item) === '[object Function]';
    },
    isJSONString : (item)=>{
        try{
            const s = JSON.parse(item);
        }catch(e){
            return false;
        }
        return true;
    },
    
    isNumber :(item)=>{
        return item && typeof item === 'number';
    },
    // different from isNumber, this method also checks whether
    // a string has format of number (i.e. can be transformed to a Number)
    // e.g. : '0x23' => true
    //        'asdf' => false
    likeNumber : (item)=>{
        return !isNaN(parseFloat(item)) && isFinite(item);
    },
    isString : (item)=>{
        return item !== null && typeof item === "string";
    }
}