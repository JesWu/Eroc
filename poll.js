var poll = {
    creator: null,
    question: null,
    yes: 0,
    no: 0,
    voteList: new Array()
}

//returns true is successful in creating poll, false if failed.
function createPoll(id, question){
    if(poll.creator != null){
        return false;
    }
    poll.creator = id;
    poll.question = question;
    poll.yes = 0;
    poll.no = 0;
    poll.voteList = new Array();
    return true;
}

//true on duccess, false on fail.
function voteYes(id){
    if(!hasVoted(id)){
        poll.voteList.push(id)
        poll.yes += 1;
        return true;
    }
    return false;
}

function getYes(){
    return poll.yes;
}

function getNo(){
    return poll.no;
}

function getQuestion(){
    return poll.question;
}

//true on duccess, false on fail.
function voteNo(id){
    if(!hasVoted(id)){
        poll.voteList.push(id)
        poll.no += 1;
        return true;
    }
    return false;
}

//see if user has voted. true if they have, false else.
function hasVoted(id){
    if(poll.voteList.length == 0) return false;
    for(voteID of poll.voteList){
        if(voteID == id) return true;
    }
    return false;
}

function isPoll(){
    return poll.creator != null;
}

function isOwner(id){
    return poll.creator == id;
}

function closePoll(id){
    if(poll.creator == id){
        poll.creator = null;
        poll.question = null;
        poll.yes = 0;
        poll.no = 0;
        poll.voteList = new Array();
        return true;
    }
    return false;
}

function returnResults(){
    var resultStr = "";
    resultStr += poll.question + "\n";
    resultStr += "\n";
    resultStr += "Yes: " + poll.yes + "\n";
    resultStr += "No: " + poll.no + "\n";
    return resultStr;
}

module.exports = {
    createPoll: createPoll,
    voteYes: voteYes,
    voteNo: voteNo,
    hasVoted: hasVoted,
    isPoll: isPoll,
    closePoll, closePoll,
    returnResults, returnResults,
    getYes: getYes,
    getNo: getNo,
    getQuestion: getQuestion,
    isOwner, isOwner
}