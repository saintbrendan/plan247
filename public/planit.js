var globalFirebaseKey;
var provider;

// https://planit-48748.firebaseio.com/rest/saving-data/fireblog/users.json
$(document).ready(function () {
    $(".planned.time").bind("wheel", updatePlannedTime);
    $(".planned.time").on("input", updatePlannedTime);

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDD3AjCv1X0a1Nt4K9HEKvnSWPr_ZN6_3w",
        authDomain: "planit-48748.firebaseapp.com",
        databaseURL: "https://planit-48748.firebaseio.com",
        projectId: "planit-48748",
        storageBucket: "planit-48748.appspot.com",
        messagingSenderId: "578139525428"
    };
    firebase.initializeApp(config);


    provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log("the user is " + JSON.stringify(result.user))
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });

    var now = new Date();
    var nowHHMM = now.toHHMM();
    var row = $("#tr0");
    row.find(".start").val(nowHHMM);
    updateEndDate(row, "working", parseInt(row.find(".planned.time").val()))
    $("#start").click(function () {
        var now = new Date();
        var nowHHMM = now.toHHMM();
        var row = $("#tr0");
        row.find(".start").val(nowHHMM);
        var plannedTimeVal = row.find(".planned.time").val();
        if (!isEmpty(plannedTimeVal)) {
            var plannedTime = parseInt(row.find(".planned.time").val());
            updateEndDate(row, "working", plannedTime);
            var uncle = row.next("tr");
            updateStartDates(uncle);
        }
    });
    $("button#working_to_planned").click(function () {
        workingToPlanned();
    });
    $(".actual.time").click(function (e) {
        var row = $(e.target).parents("tr");
        done(row);
    });
    $(".done").click(function (e) {
        var row = firstEmptyActualTime().parents("tr");
        console.log(row);
        done(row);
    });
    $(".save").click(function (e) {
        save();
    });
    $(".load").click(function (e) {
        load();
    });
    $("input.description").keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        var row = $(this).parents("tr");
        switch (e.which) {
            case 13: // enter
            case 40: // down
                var nextUncle = row.next("tr");
                nextUncle.find("input.description").focus();
                break;

            case 38: // up
                var prevUncle = row.prev("tr");
                prevUncle.find("input.description").focus();
                break;

            default:
                return; // exit this handler for other keys
        }
    });
    $("input.planned.time").keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        var row = $(this).parents("tr");
        switch (e.which) {
            case 13: // down
                var nextUncle = row.next("tr");
                nextUncle.find("input.planned.time").focus();
                break;

            default:
                return; // exit this handler for other keys
        }
    });
    $(".material-icons.insert").click(function () {
        var parent = $(this).parents("tr");
        var previousRow = $(parent).prev("tr");
        var previousWEnd = previousRow.find(".working.end").val();
        var previousAEnd = previousRow.find(".actual.end").val();
        var clone = parent.clone(true);
        clone.find("input").val("");
        clone.find(".working.start").val(previousWEnd);
        clone.find(".working.end").val(previousWEnd);
        clone.find(".actual.start").val(previousAEnd);
        parent.before(clone);
        clone.find("td.button").empty();
        clone.find("td.button").removeAttr("rowspan");
        clone.remove("td#sss");
    });
    $(".material-icons.delete").click(deleteRow);
    $(".material-icons.up").click(moveUp);
    $(".importance").blur(save);
    $(".urgency").blur(save);
    $(".planned.time").blur(save);
    $(".description").blur(save);
    $("#firstname").blur(load);

    var h = $(".actual.time")
        .filter(function (index) {
            return $(this).html() == "";
        })
        .first();
    console.log("this$ " + $(".actual.time"));
    console.log("h.length " + h.length);
    console.log("this$.length " + $(".actual.time").length);
    console.log("this$[0] " + $(".actual.time")[0]);
});

Date.prototype.addMinutes =
    Date.prototype.addMinutes ||
    function (minutes) {
        var milliseconds = minutes * 60000;
        return new Date(this.getTime() + milliseconds);
    };
Date.prototype.toHHMM =
    Date.prototype.toHHMM ||
    function () {
        return this.toTimeString().substr(0, 5);
    };

moveUp = function() {
    var thisRow = $(this).parents("tr");
    var previousRow = thisRow.prev("tr");
    $(previousRow).before($(thisRow));
    updateStartDates(thisRow);
}

firstEmptyActualTime = function () {
    return $(".actual.time")
        .filter(function (index) {
            return $(this).html() == "";
        })
        .first();
};

deleteRow = function(row) {
    var thisRow = $(this).parents("tr");
    var nextRow = thisRow.next("tr");
    $(thisRow).remove();
    updateStartDates(nextRow)
};

done = function (row) {
    var astart = row.find(".actual.start");
    if (!isEmpty(astart.val())) {
        var now = new Date();
        var aend = row.find(".actual.end");
        aend.val(now.toHHMM());
        var actualStartTime = getDateFromSelector(astart);
        var elapsedTime = now.getTime() - actualStartTime.getTime();
        var elapsedTimeHHMM = HHMMfromMilliseconds(elapsedTime);
        row.find(".actual.time").html(elapsedTimeHHMM);
        var plannedTime = parseInt(row.find(".planned.time").val());
        var faster = Math.round(plannedTime - elapsedTime / (60 * 1000));
        var aheadoftaskHtml = "";
        if (faster >= 0) {
            aheadoftaskHtml = "<i class='material-icons'>insert_emoticon</i>";
        }
        row.find(".aheadoftask").html(aheadoftaskHtml);
        var pend = row.find(".planned.end");
        var plannedEndTime = getDateFromSelector(pend);
        var aheadMilliseconds = plannedEndTime.getTime() - now.getTime();
        var aheadMinutes = Math.round(aheadMilliseconds / (60 * 1000));
        row.find(".ahead").html(aheadMinutes);
        var aheadMinutesHtml = "";
        if (aheadMinutes >= 0) {
            aheadMinutesHtml =
                "<i class='material-icons'>insert_emoticon</i><i class='material-icons'>insert_emoticon</i>";
        } else if (aheadMinutes < -100) {
            console.log("aheadMilliseconds " + aheadMilliseconds);
            console.log("plannedEndTime " + plannedEndTime);
            console.log("now " + now);
        }
        row.find(".aheadofschedule").html(aheadMinutesHtml);

        var uncle = row.next("tr");
        updateStartDates(uncle);
    }
};

function isIncomplete(_, row) {
    const descriptionLength = $(row).find(".description").val().length;
    const actualTimeLength = $(row).find(".actual.time").text().length;

    return descriptionLength && (!actualTimeLength);
}

load = function () {
    // with the globalkey, retrieve that object from firebase
    // populate the UI with the contents of that array.
    readFromDb(globalFirebaseKey);
}

readFromDb = function (key) {
    const userAction = async () => {
        const name = $("#firstname").val()
        const urlFirebase = 'https://planit-48748.firebaseio.com/rest/saving-data/fireblog/users/'+name+'/tasks.json'
        console.log("urlFirebase:" + urlFirebase);
        const response = await fetch(urlFirebase, {
            method: 'GET',
        });
        const tasks = await response.json();
        console.log("myJson:" + JSON.stringify(tasks));
        butterbar("Loaded 2" + tasks.length + " records");
        const rows = $("[id^=tr]");
        for (var i = 0, len = tasks.length; i < len; i++) {
            var task = tasks[i]
            console.log(task + " description:" + task.description);
            $(rows[i]).find(".importance").val(task.importance);
            $(rows[i]).find(".urgency").val(task.urgency);
            $(rows[i]).find(".planned.time").val(task.ptime);
            $(rows[i]).find(".description").val(task.description);
            $(rows[i]).find(".actual.time").val(task.atime);
        }

    }
    userAction();
}

save = function () {
    const rows = $("[id^=tr]");

    const incompleteRows = rows.filter(isIncomplete)

    // const firstRow = rows.first();
    const tasks = $.map(incompleteRows, function (row, i) {
        console.log("row i: " + row + " " + i);
        const importance = $(row).find(".importance").val();
        const urgency = $(row).find(".urgency").val();
        const ptime = $(row).find(".planned.time").val();
        const description = $(row).find(".description").val();
        const atime = $(row).find(".actual.time").val();
        return ({
            "importance": importance,
            "urgency": urgency,
            "ptime": ptime,
            "atime": atime,
            "description": description
        });
    });
    saveOpenTasks(tasks);
    butterbar("Incomplete tasks saved.  ");
}

saveOpenTasks = function(tasks) {
    const firstname = $("#firstname").val();
    const myBody = {
        name: {
            "description": "task list change",
            "tasks": tasks
        }
    };
    const yourTasks = {};
    yourTasks[firstname] = {
        "description": "task list change",
        "tasks": tasks
    };
    const theTasks = {
        "description": "task list change",
        "tasks": tasks
    };
    const userAction = async () => {
        const response = await fetch('https://planit-48748.firebaseio.com/rest/saving-data/fireblog/users/'+firstname+'.json', {
            method: 'PUT',
            body: JSON.stringify(theTasks), // string or object
        });
        const myJson = await response.json();
        const key = myJson.name
    }
    userAction();
}

butterbar = function (message) {
    const pbutterbar = $("p.butterbar")
    pbutterbar.text(new Date().toISOString() + ": " + message);
}

workingToPlanned = function () {
    var rows = $("table.schedule").find("tr");
    rows.each(function () {
        var pstart = $(this).find(".planned.start");
        var pend = $(this).find(".planned.end");
        console.log("pstart.val() " + pstart.val() + "  pend.val()" + pend.val());
        if (isEmpty(pstart.val()) || isEmpty(pend.val())) {
            var wstartval = $(this)
                .find(".working.start")
                .val();
            var wendval = $(this)
                .find(".working.end")
                .val();
            pstart.val(wstartval);
            pend.val(wendval);
        }
    });
};

function zeroPad(number) {
    if (number < 1) {
        return "00";
    }
    if (number < 10) {
        return "0" + number;
    }
    return number;
}

HHMMfromMilliseconds = function (milliseconds) {
    if (milliseconds < 0) {
        return "0:00";
    }
    var minutes = milliseconds / (60 * 1000);
    var MM = minutes % 60;
    var HH = minutes / 60;
    console.log("HH " + HH + "  MM " + MM);
    return Math.floor(HH) + ":" + zeroPad(Math.round(MM));
};

updateEndDate = function (row, cssclass, minutes) {
    console.log("row " + row + "  A ");
    var start = getDateFromSelector(row.find(".start." + cssclass));
    console.log("row " + row + "  start " + start);
    if (start.toTimeString() == "Invalid Date") {
        return "";
    }
    var end = start.addMinutes(minutes).toHHMM();
    console.log("row " + row + "  end " + end + "  start " + start);
    row.find(".end." + cssclass).val(end);
    return end;
};

updatePlannedTime = function (e) {
    $(e.target).focus();
    var parent = $(e.target).parents("tr");
    var timeval = $(e.target).val();
    var minutes = (timeval.length === 0 ? 0 : parseInt(timeval));
    minutes = minutes < 0 ? 0 : minutes;
    var wend = updateEndDate(parent, "working", minutes);
    updateStartDates(parent.next("tr"));
};

updateStartDates = function (row) {
    if (typeof row == "undefined") {
        return;
    }
    var previous = $(row).prev("tr");
    var previous_wend = previous.find(".working.end").val();
    var previous_aend = previous.find(".actual.end").val();
    var working_start = previous_aend || previous_wend;
    $(row)
        .find(".working.start")
        .val(working_start);
    $(row)
        .find(".actual.start")
        .val(previous_aend);

    var minutes_text = row.find(".planned.time").val();
    if (isEmpty(minutes_text)) {
        return;
    }
    var minutes = minutes_text.length === 0 ? 0 : parseInt(minutes_text);
    var getDateFromSelectr = getDateFromSelector(row.find(".working.start")); ////
    var wend = getDateFromSelector(row.find(".working.start"))
        .addMinutes(minutes)
        .toHHMM();
    console.log("wend "+ wend +"   getDateFromSelectr "+ getDateFromSelectr)
    row.find(".working.end").val(wend);
    if (previous_aend || previous_wend) {
        var uncle = row.next("tr");
        updateStartDates(uncle);
    }
};

// selector --> date with hours/minutes from selector
getDateFromSelector = function (selector) {
    splitVal = $(selector)
        .val()
        .split(":");
    var date = new Date();
    date.setHours(parseInt(splitVal[0]));
    date.setMinutes(parseInt(splitVal[1]));
    return date;
};

function isEmpty(str) {
    return !str || 0 === str.length;
}
