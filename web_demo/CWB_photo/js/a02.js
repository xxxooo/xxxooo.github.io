
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function setTimeData(callback) {
    var datetime = new Date();
    datetime = addMinutes(datetime, -2);
    var m = datetime.getMinutes();
    datetime.setMinutes( m - (m % 10) );

    var list = [];
    for (var i = 0; i < 72; i++) {
        list.unshift( datetime.toString('yyyy-MM-dd-HH-mm') );
        datetime = addMinutes(datetime, -10);
    }
    callback(list);
}

function cer(list) {
    cq = new CerX('nr', list, []);
	cq.run();
}

setTimeData(cer);
