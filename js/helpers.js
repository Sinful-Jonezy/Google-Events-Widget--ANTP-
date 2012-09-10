/*
 Logging Functions
 */
function log(msg, obj){
    //return;
    if(typeof obj === 'undefined' || obj == null){
        console.log("%s", msg);
    }else{
        console.log("%s: %o", msg, obj);
    }
}
jQuery.fn.log = function (msg) {
    log(msg, this);
    return this;
};



/* 
	Given a date, returns the remaining time as a string
*/
function getRemainTimeString(date) {
	var now = new Date();
	var remain = '', minutes = Math.ceil((date - now) / (60 * 1000));
	if (minutes == 1) {
		remain =  getResourceString('TO_GO_MINUTE',[1]); // TBD
	} else if (minutes < 60) {
		remain = (minutes > 1) ? getResourceString('TO_GO_MINUTES',[minutes]) : w.getResourceString('TO_GO_MINUTE',[minutes]);
	} else if (minutes >= 60) {
		var hours = Math.floor(Number(minutes) / 60);
		minutes = minutes - 60 * hours;
		if (hours > 1) {
			remain = (minutes > 1) ? getResourceString('TO_GO_HOURS_MINUTES',[hours,minutes]) : getResourceString('TO_GO_HOURS_MINUTE',[hours,minutes]);
		} else {
			remain = (minutes > 1) ? getResourceString('TO_GO_HOUR_MINUTES',[hours,minutes]) : getResourceString('TO_GO_HOUR_MINUTE',[hours,minutes]);
		}
	}
	return remain;
}
/* Looks in the locales for a formatted string */
function getResourceString(b, a) {
	if (typeof (chrome) != "undefined" && typeof (chrome.i18n) != "undefined") {
		return chrome.i18n.getMessage(b, a)
	}
	return b
}

/* Returns the date string for a new day header */
function getHeaderDateString(date) {
	var monthNames = getResourceString('SHORTMONTH_NAMES').split(',');
	var dayNames = getResourceString('SHORTDAY_NAMES').split(',');
	return getResourceString('HEADER_DATE',[monthNames[date.getMonth()-1],date.getDate(),dayNames[date.getDay()]]);
}