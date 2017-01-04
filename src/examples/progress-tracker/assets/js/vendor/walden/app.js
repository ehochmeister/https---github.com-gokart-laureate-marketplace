var retURL				 = "";
var defServiceURL		 = "https://class.waldenu.edu/webapps/bbgs-deep-links-BBLEARN/app/wslinks";
var link                 = new Object();
link['CourseHome'] = '/webapps/blackboard/execute/launcher?type=Course&url=&id=';
link['Calendar']  = '/webapps/calendar/viewCourse?course_id=';
var thistest=getQueryVariable('course_uid');
if (thistest.length > 0) {setCourseCookie(thistest);}
var enableAnalytics = true;

function getQueryVariable( variable ) {

    var query = window.location.search.substring(1);
    var vars  = query.split('&');

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }

    return '';
}

function getBbURL ( resource ) {
    var courseID    = getQueryVariable('course_uid') || getCourseCookie();
    var rootServiceURL     = getQueryVariable('service_url') || defServiceURL;
    var serviceURL = rootServiceURL + '/' + courseID + '/' + resource + '/';
    var thisURL = "";

    jQuery.ajax({
        async: false,
        type: 'GET',
        url: serviceURL,
        success: function(data) { retData ( data ); }
    });
    thisURL=retURL;
    return thisURL;
}

function retData( data ) {
    var obj = JSON.parse( data );
    retURL = obj.links[0].url;
}

function ActivateLink ( resource, target, myObj ) {
    target= target || '';
    myObj = myObj || '';
    var fromMobileLearn = getQueryVariable('fromMobile');
    var txtURL;
    var courseid;

    if (fromMobileLearn == 'true') {
        myObj.innerHTML = 'Return to the mobile course menu using the arrow at the top of your screen.  From the menu you may access mobile versions of calendars, course tools, content, and assessments';
    } else {
        if (resource == 'Calendar') {
            target = '';
            txtURL  = getBbURL('CourseHome');
	    courseid = stripCourseID(txtURL);
            txtURL = link['Calendar'] + courseid;
        } else {
            txtURL  = getBbURL(resource);
            if (resource == 'CourseHome') {
                courseid = stripCourseID(txtURL);
                txtURL = link['CourseHome'] + courseid
            }
        }

        if (enableAnalytics) {
            sendGAEvent("deep-link", resource);
        }

        if ( txtURL.length > 0 ) {
            if (target.length > 0 ) {
                window.open ( txtURL, target);
            } else {
                window.location.href = txtURL;
            }
        }
    }
}

function setCourseCookie(courseID) {
    if (courseID.length > 0 ) {	document.cookie="courseContext=" + courseID + "; expires=Thu, 18 Dec 2099 12:00:00 UTC; path=/"; }
}

function getCourseCookie() {
    var name = "courseContext=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

function stripCourseID(txtURL) {
    var thisCourseID;
    var rxMatch = txtURL.match(/course_id=_[0-9]{1,}_[0-9]/g);

    if (rxMatch[0].length > 0 ) {
        thisCourseID=rxMatch[0].replace(/course_id=/g,'');
    }
    return thisCourseID;
}

var NaviLink = function( resource, linkName, altDescription ) {

    var targetFrame = "BBWindow";
    var qsFrame     = getQueryVariable('frame');
    var txtURL 	  = getBbURL(resource);
    if ( qsFrame.length > 0 ) { targetFrame = qsFrame; } else { targetFrame = "_top"; }

    var fromMobile = getQueryVariable('fromMobile');

    if ( fromMobile == 'true') {
        if (!altDescription) {altDescription='--undefined--';}
        return altDescription;
    } else {
        if (txtURL.indexOf("javascript") == -1) {
            return '<a href="' + txtURL + '" target="' + targetFrame + '" class="button">' + linkName + '</a>';
        } else {
            return '<a href="' + txtURL + '" target="' + targetFrame + '" class="button">' + linkName + '</a>';
        }
    }


}

var NaviLink2 = function( resource, linkName, altDescription ) {

    var targetFrame = "BBWindow";
    var qsFrame     = getQueryVariable('frame');
    var txtURL 	  = link[resource];

    if ( qsFrame.length > 0 ) { targetFrame = qsFrame; }

    var fromMobile = getQueryVariable('fromMobile');

    if ( fromMobile == 'true') {
        if (!altDescription) {altDescription='--undefined--';}
        return altDescription;
    } else {
        if (txtURL.indexOf("javascript") == -1) {
            return '<a href="' + rootURL + encodeURIComponent(txtURL) + '" target="_top" class="button">' + linkName + '</a>';
        } else {
            return '<a href="' + txtURL + '" target="' + targetFrame + '" class="button">' + linkName + '</a>';
        }
    }


}

//processing the nav links
function sendGAEvent(gaEvent, linkId) {
    var course    = getQueryVariable('course_uid') || getCourseCookie();
    var institution = jQuery("html").data("institution");

    institution = institution && institution !== "" ? institution + "-" : "";
    course = course && course !== "" ? course + "-" : "";

    var eventLabel = institution + course + linkId;

    ga('send', 'event', gaEvent, "click", eventLabel);
    return true;
}

jQuery(function(){
    jQuery(".nav-link").each(function (i, item) {
        var href = jQuery(item).attr("href");
        if (href.indexOf("html")) {
            //clear trailing #
            var result = href;
            var queryString = window.location.search;
            var hash = "";

            if (href.charAt(href.length - 1) === "#") {
                result = result.substring(0, href.length - 1);
            }
            //href has a hash
            if (result.indexOf("#") >= 0) {
                hash = result.substring(result.indexOf("#"), result.length);
                result = result.substring(0, result.indexOf("#"));
            }

            //console.log("qs = " + queryString);
            //add QS
            if (queryString !== "") {
                result += queryString + hash;
            }
            //put back href
            jQuery(item).attr("href", result);
        }
    });




    (function () {
        if (!enableAnalytics) {
            return false;
        }

        var institution = jQuery("html").data("institution");
        var course = jQuery("html").data("course");

        jQuery(".nav-link").click(function(event) {
            var linkId = jQuery(event.target).text();
            return sendGAEvent("nav-link", linkId);
        });

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-73553469-1', 'auto');
        ga('send', 'pageview');
    })();
});

