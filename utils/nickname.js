/* This is a number-to-nickname transformer,
    It aims to replace numbers (i.g. inst_id) to its unique nickname
    that is easier for memorizing.

    e.g. : 12 -> eins-west
*/

// len = 15
const noun_dict = [
    "egg", "zoo", "arm", "hat", "ice",
    "spy", "jam", "hot", "cat", "key",
    "dog", "pen", "bat", "fox", "map"
]

// len = 18
const verb_dict = [
    "kill", "run", "see", "get", "eat", "pump",
    "tick", "bite", "act", "chop", "meet", "omit", "quit",
    "roll", "pull", "push", "kiss", "wait", "tear"
]

module.exports = {
    get(num, sep = "-"){
        let n = parseInt(num);
        let m = n;
        let str = "";

        if(n == 0){
            return `${verb_dict[0]}${sep}${noun_dict[0]}`;
        }
        while(n > 0){
            str += `${verb_dict[n % 15]}${sep}${noun_dict[n % 18]}`;
            n = Math.floor(n / 90);

            if(m >= 90){
                str += sep;
            }

            m = m - n * 90;
        }

        return str;
    }
}
    
