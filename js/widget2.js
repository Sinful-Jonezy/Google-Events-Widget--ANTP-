//Browser On Load Event
$(document).ready(function() {

    var w = Blz.Widget;
    var reloading = true, //Keeps track if the bg is reloading
        reloading_timeout = false; //Checks if the min reload time has hit
    var mouse_over_header = false;
    var local_storage_events = localStorage.getItem("events") || "[]";
    var $list = $('#events_ul');

    log('Initial Storage', localStorage);

    // When anything in localStorage changes
    $(window).bind('storage', function () {
        log("[EVENT] Storage Changed", localStorage);
        var incoming_events = localStorage.getItem("events") || "";
        var widget_update = !!(localStorage.getItem("widget_update") == "true");
        var widget_notifications = JSON.parse(w.getPref('widget_notify'));
        var widget_alerts = JSON.parse(w.getPref('widget_alert'));

        // Alerts, block out the calendar
        refresh_alerts(widget_alerts);

        // Notifications are deletable via user
        for(key in widget_notifications){
            if(key == "base"){
                log("NOTIFICATION: '" + widget_notifications[key] + "'");
                for(base_key in widget_notifications.base)
                    notify(widget_notifications.base[base_key]);
                delete widget_notifications.base;
            }else{
                log("NOTIFICATION: [" + key + "] = '" + widget_notifications[key] + "'");
                notify(key, widget_notifications[key]);
            }
        }
        localStorage['widget_notify'] = JSON.stringify(widget_notifications);
        reloading =  !!(localStorage.getItem("bg_reloading") == "true");
        refreshButton();

        //Check if any events changed or where added
        if(widget_update || (local_storage_events.localeCompare(incoming_events) != 0 && incoming_events.length > 0)){
            log("[NOTICE] Some events have changed. Forced=" + widget_update);
            localStorage.removeItem("widget_update");
            local_storage_events = incoming_events;
            updateContent();
        }
    });

    function updateBG(){
        log("[NOTICE] SENT BG UPDATE");
        localStorage['bg_update'] = true;
    }

    function refreshButton(force){
        if(reloading || force){
            $('#refresh').addClass('spin');
            reloading_timeout = true;
            setTimeout(function(){
                reloading_timeout = false;
                $(window).trigger('storage');
            }, 1000);
        }else{
            if(!reloading_timeout){
                $('#refresh').removeClass('spin');
            }
        }
    }

    $('#refresh').click(function(){
        refreshButton(true);
        updateBG();
    });

    /*
     Main Update function. Loads the events from the localstorage
     and displays them.
     */
    function updateContent(){
        events = JSON.parse(local_storage_events);
        events == null ? events = [] : true;
        log("[DEBUG] Updating Content with Events: ", events);

        var now = new Date();
        var eventCount = 0, displayEventCount = 0;
        if (events.length == 0) {
            return;
        }

        //<ul data-role="listview" data-theme="a" data-divider-theme="c">
        $list.children(":not(.notification)").remove();
        var displayDayCount = w.getPref('days_to_show'), offset = 0;
        for (var index = 0, showDays = (!isNaN(displayDayCount)) ? displayDayCount : 5; index < showDays; index++) {
            offset = index;
            var cStart = new Blz.GData.Date().addDays(offset).resetHours(),
                cEnd = new Date(cStart.date.getFullYear(), cStart.date.getMonth(), cStart.date.getDate(), 23, 59, 59, 0);

            var header = getHeaderDateString(cStart);
            if (offset == 0) header += ' - ' + getResourceString('TODAY');
            else if (offset == 1) header += ' - ' + getResourceString('TOMORROW');
            $list.append($.fn._cal_header(header, 0));

            events.sort($.fn.appointmentCompare);

            for (var i=0, len=events.length; i<len; i++) {

                //convert start/end to date object
                var event = events[i];
                event.start = new Date(event.start);
                event.end = new Date(event.end);
                //Check if the event belongs in this day
                if(event.end<=cStart.date||event.start>=cEnd) continue;

                eventCount++;

                var location = (event.location && event.location.length > 0) ? event.location : '';
                var time = (event.allDay) ? getResourceString('ALL_DAY_EVENT') : getTimeString(event.start);
                var color = $.xcolor.lighten(event.color, 3, 25);
                var remain = (now < event.start) ? getRemainTimeString(event.start) : '';
                var tooltip = [event.title,time,remain,location].join(' ');

                var $li = $.fn._cal_event(event.title, location, time, event.link, color);
                if(event.allDay == 0 && event.end < now) $li.css('opacity', w.getPref('event_old_fade_amount'));
                $list.append($li.attr({title:tooltip}));
                displayEventCount++;
            }

        }

        $list.listview('refresh');
        update_cal_header_counts($list);

        $list.bind('mousewheel', function(e, d) {
            var height = $('#events ul').height(), scrollHeight = $('#events ul').get(0).scrollHeight;
            if((this.scrollTop === (scrollHeight - height) && d < 0) || (this.scrollTop === 0 && d > 0)) {
                e.preventDefault();
            }
        });
    }

    function update_cal_header_counts($list){
        $list.find('li[data-role="list-divider"]').each(function(){
            var total = $(this).nextUntil('li[data-role="list-divider"]').length;
            $(this).find('span.ui-li-count').html(total);
        });
    }

    function notify(name, msg){
        if(arguments.length == 1){ msg = name; name = ""; }
        if(msg == "" || msg === false){
            $list.find('.notification-' + name).slideUp(function(){ $(this).remove(); })
        }else{
            if(name != "" && $list.find('.notification-' + name).length > 0)return;
            $list.prepend($('<li/>').html(msg).addClass('notification').addClass('notification-' + name).css('cursor', 'notallowed').attr('data-corners','false').attr('data-shadow','false').attr('data-icon','alert').attr('data-theme','e').click(function(){ $(this).slideUp(function(){ $(this).remove();})}));
        }
    }

    /* Alerts the user with the object of given events */
    function refresh_alerts(alerts){
        var key = null;
        if(Object.keys(alerts).length == 0){
            $("#loader-box").stop().animate({top: $("body").height(), opacity: 0}, 500, function(){
                $(this).html(""); //Clear it!
            });
            return;
        }

        // Ensure the alert container is visible
        $("#loader-box").stop().animate({top: "35px", opacity: 1}, 2000, 'easeOutBounce');

        // Check if any alerts should be removed
        $("#loader-box h1").each(function(){
            var exists = false;
            for(key in alerts)if($(this).hasClass('alert-' + key)){ exists = true; break; }
            if(!exists)$(this).fadeOut('slow', function(){ $(this).remove();});
        });

        // Add the new alerts
        for(key in alerts){
            if($("#loader-box h1.alert-" + key).length == 0)
                $("#loader-box").append($("<h1/>").addClass('alert-' + key).html(alerts[key]));
        }

        // If no alerts are left, hide the box and clear it
        if($("#loader-box h1").length == 0)
            $("#loader-box").stop().animate({top: $("body").height(), opacity: 0}, 500, function(){ $(this).html(""); });
    }
    //Trigger storage to show messages
    $(window).trigger('storage');
    updateContent();
});