//Custom jQuery Functions
$.fn.extend({

    _msg: function(message, loading) {
        $(this).append($('<span/>').addClass((loading) ? 'indicator' : 'message').html(message));
        return this;
    },
    _cal_header: function(title, count){
        //<li data-role="list-divider" role="heading">Date<span class="ui-li-count">2</span></li>
        var count = $('<span/>').addClass('event-count').html(count);
        return $('<li/>').addClass('day_header')
            .html(title).append(count).click(function(){
                $(this).nextUntil('.day_header').slideToggle();
            });
    },
    _cal_event: function(title, location, time, url, color){
        //<li data-corners="false" data-shadow="false" data-icon="false">
        //	<span class="ui-li-aside ui-btn-inner event_color" style="padding: 0"></span>
        //	<a href="index.html">
        //		<h3 class="ui-li-heading">Event Title</h3>
        //		<p class="ui-li-aside ui-li-desc"><strong>12:00</strong>PM</p>
        //		<p class="ui-li-desc event_location">Location</p>
        //	</a>
        //</li>
        var li = $('<li/>').addClass('event');
        var event_title = $('<h3/>').addClass('event-title').html(title);
        var event_time = $('<p/>').addClass('event-time').html(time);
        var event_details = $('<a/>').attr({href:url,target:'_top'}).html(event_title).append(event_time);
        if(location){
            var event_location = $('<p/>').addClass('event-location').html(location);
            event_details.append(event_location);
        }
        li.append(event_color).append(event_details);
        var event_color = $('<span/>').addClass('event_color').css('height', location ? 30 : 20).css('padding', '0').css('background-color', color);
        li.prepend(event_color);
        return li;
    },
    appointmentCompare: function (d, c) {
		var a = new Date(d.start);
		var b = new Date(c.start);
		
        var e = a - b;
        if (e == 0) {
            if (d.title < c.title) {
                return -1;
            } else {
                if (d.title > c.title) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
        return e
    }
});