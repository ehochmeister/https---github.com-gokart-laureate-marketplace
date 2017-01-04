/**
 * Helper Method: Includes
 * Polyfill for String.prototype.includes
 * @link http://stackoverflow.com/questions/31221341/ie-does-not-support-includes-method
 */
 if (!String.prototype.includes) {
  String.prototype.includes = function() {
    'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

/**
 * Get Course ID
 * Gets course_id from querystring
 * Performs cleanup in instances of multiple "?" characters, happens in BB redirects
 */
 function get_course_id() {
  return 'EXAMPLE';
  // var course_id = null;
  // if(getUrlVars().course_id) {
  //   course_id = getUrlVars().course_id;
  // }
  // if(course_id && course_id.includes('?')) {
  //   course_id = course_id.substring(0, course_id.indexOf('?'));
  // }
  // return course_id;
}

/**
 * Vue Template: Late Policy
 */
 var LatePolicyVue = Vue.extend({
  template: '#late-policy-template',
  props: ['assignment']
});

 Vue.component('late-policy', LatePolicyVue);

/**
 * Vue Template: Status Key
 */
 var StatusKeyVue = Vue.extend({
  template: '#status-key-template'
});

 Vue.component('status-key', StatusKeyVue);

/**
 * Vue Template: Assignment Row
 */
 var lastShown = null;
 var AssignmentRowVue = Vue.extend({
  props: ['assignment','current_week_number','index','context','week','debug'],
  data: function () {
    return { lastWeekNumber: null };
  },
  template: '#assignment-row',
  methods: {
    lastshown: function(flag) {

      var context = this.assignment.weekNumber+this.context;

      if(lastShown == context) {
        lastShown = context;
        return false;
      }

      lastShown = context;
      return true;

    },
    // In Dashboard context, show only items due soon
    contextToggle: function(context,assignment) {
      if(context === 'dashboard' && assignment.isDueSoon) {
        return true;
      }
      if(context === 'course-progress' || context === 'all-items') {
        return true;
      }
      return false;
    },
    workOnItem: function(event,assignment) {

      console.log('workOnItem');
      console.debug('workOnItem',assignment);

      var trackingData = {
        'event': 'gotoItem',
        'itemID': assignment.id,
        'itemName': assignment.name,
        'itemStatus': assignment.status,
        'itemPoints': assignment.points,
        'itemDeepLink': assignment.deepLink,
        'itemHref': assignment.href
      };

      dataLayer.push(trackingData);

      if(assignment.deep_link) {
        event.preventDefault();
        ActivateLink(assignment.deep_link,'BBWindow',event.currentTarget);
        console.log(['ActivateLink','BBWindow',assignment.deep_link]);
      } else {
        console.warn('No deep link for content ID ' + contentID);
      }

    }
  }
});

 Vue.component('assignment-row', AssignmentRowVue);

 /**
  * Vue Template: Tooltip Trigger Button
  */
  var TooltipTriggerBtnVue = Vue.extend({
    props: ['assignment'],
    template: '#tooltip-trigger-button',
    components: {
      'late-policy': LatePolicyVue
    },
    methods: {

      tooltip: function(event) {

        console.log('tooltip-click');

        if($('.v-tooltip:visible').length) {
          $(document).unbind('click.tooltiphandler');
          $('.v-tooltip:visible').hide();
        }

        // Chrome sees nearest .v-tooltip as a sibling element, which is technically incorrect
        if($(event.target).siblings('.v-tooltip').length) {
          $(event.target).siblings('.v-tooltip').fadeIn(100,function() {
            $(document).one('click.tooltiphandler', function() {
              $('.v-tooltip:visible').fadeOut(200);
            });
          });
        }

        // Firefox sees nearest .v-tooltip as a child element, which is technically correct
        if($(event.target).children('.v-tooltip').length) {
          $(event.target).children('.v-tooltip').fadeIn(100,function() {
            $(document).one('click.tooltiphandler', function() {
              $('.v-tooltip:visible').fadeOut(200);
            });
          });
        }
      }
    }
  });

  Vue.component('tooltip-trigger-button', TooltipTriggerBtnVue);

/**
 * Initialize Vue.js
 * @link http://v1.vuejs.org/guide/
 */
 var vm = new Vue({
  el: '#app',
  data: {
    api_endpoint: (get_course_id()) ? 'webapps/gkl-coursetracker-BBLEARN/ws/currentuser/courses/' + get_course_id() + '/assignments.txt' : null,
    assignments: null,
    assignments_meta: null,
    back_to_blackboard: null,
    course_name: null,
    course_id: get_course_id(),
    course_end_date: null,
    course_start_date: null,
    current_date: moment('2016-11-28').tz(moment.tz.guess()), // Create new Moment JS Date with local time zone
    debug: (getUrlVars().debug === 'true') ? true : false,
    help_link: null,
    meta_api_endpoint: (get_course_id()) ? 'bbcswebdav/institution/USW1/00coursetrackertest/config/' + get_course_id() + '.txt' : null,
    navigation: [],
    num_assignments_due_soon: this.assessmentsDueSoon,
    num_assignments_due_soon_but_submitted: 5,
    show_course_progress: false,
    show_all_items: true,
    username: null
  },

  /**
   * Vue Ready
   */
   ready: function() {

    var self = this;

    console.debug('course_id:',self.course_id);

    // TODO: Replace this approach by giving the app an error state handler
    if(!self.course_id) {
      return;
    }

    console.debug('current_date',this.current_date.format());

    // Get AJAX/JSON data and complete setup, or log error to console
    console.debug('api_endpoint',this.api_endpoint);
    var resource = this.$resource(this.api_endpoint);
    resource.get().then(function (response) {
      var data = JSON.parse(response.data);

      // For some reason, Walden production API uses `course` and QA uses `courseDto`
      if(data.course && !data.courseDto ) {
        data.courseDto = data.course;
      }

      if(data.user && data.assignments && data.courseDto) {
        self.completeSetup(data);
      } else {
        // TODO: Replace this approach by giving the app an error state
        self.course_id = false;
        console.error("Assignments API Error","Critical details missing from the response.");
      }
    }, function (response) {
      var data = JSON.parse(response.data);
      self.course_id = false;
      console.error("Assignments API Error",response.status,response.statusText,data.message);
    });

    // For some reason foundation() isn't working unless there is a setTimeout
    // Possibly due to loading conflict with Foundation/VueJS?
    setTimeout(function(){

      // Initialize Zurb Foundation
      $(document).foundation();

      // Manually trigger off-canvas toggle events because Firefox wasn't working
      $('[data-open], [data-close]').on('click', function(event) {
        $('#offCanvasRight').foundation('toggle');
      });

      // Adjust Menu Heights on Resize
      self.setNavMaxHeight();
    }, 500);
    $(window).on('resize', debounce(self.setNavMaxHeight, 200));
    debounce(self.setNavMaxHeight, 500);
  },


  /**
   * Vue Computed Properties
   */
   computed: {

     /**
      * Computed Property: Assessments
      * A massaged representation of the assignments property
      * Extends assignments from the API with other useful properties
      *
      * Aside: We create a separate computed property here instead of updating the assignments object.
      * Doing otherwise seems to make VueJS to raise an infinite loop warning.
      */
      assessments: {
       cache: true,
       get: function(){

         var self = this;

         // var assignments = sort_assignments(self.assignments),
         var assignments = self.assignments,
         assignments_meta = self.assignments_meta,
         assessments = [];

         $.each( assignments, function( id, assignment ) {

          // Don't include the "Total" columns that come bundled with assignment data
          if(assignment.name === 'Total' || assignment.name === 'Weighted Total' || assignment.name === 'Final Letter Grade') {
            return;
          }

          // Debug in a more minimal manner, leaving out other Vue methods and properties
          // console.debug('assignment',JSON.parse(JSON.stringify(assignment)));

          // Append link attribute from assignment metadata config, if available.
          assignment.href = null;
          if(assignment.id && assignments_meta && assignments_meta[assignment.id] && assignments_meta[assignment.id].href) {
            assignment.href = assignments_meta[assignment.id].href;
          }

          // Append deep_link attribute from assignment metadata config, if available.
          assignment.deep_link = null;
          if(assignment.id && assignments_meta && assignments_meta[assignment.id] && assignments_meta[assignment.id].deep_link) {
            assignment.deep_link = assignments_meta[assignment.id].deep_link;
          }

          // Convert due date to Moment instance
          assignment.due = null;
          if(assignment.dueDate) {
            assignment.due = moment(assignment.dueDate);
            delete assignment.dueDate;
          } else {
            console.warn('Assignment', assignment.id, assignment.name, 'excluded because it has due date of', assignment.dueDate);
            return;
          }

          // By default, peer responses to Discussions are typically due one day after
          // TODO: Check if peer response due date is available in metadata config
          assignment.dueDatePeerResponse = null;
          if(assignment.due) {
            assignment.dueDatePeerResponse = moment(assignment.due).add(24,'hours');
          }

          // Guess the type of assignment
          assignment.type = 'assignment';
          if(assignment.name.includes('Discussion') || assignment.name.includes('Forum')) {
            assignment.type = 'discussion';
          }

          // Warn if discussion is missing due dates
          if(assignment.type === 'discussion' && assignment.dueDatePeerResponse === null) {
            console.warn('Assignment', assignment.id, 'is a discussion with a blank peer response due date');
          }

          // Get assignment week number based on date difference
          var weekNumber = function () {
            var diff = moment( assignment.due.clone().startOf('isoWeek') ).diff( self.course_start_date.startOf('isoWeek') ,'week');
            if(diff < 0) { diff = 0; }
            diff++;
            return diff;
          };

          assignment.weekNumber = weekNumber();

          // Convert late, un-submitted assignments to OVERDUE status
          var isOverdue = function() {
            if(assignment.status === "SUBMITTED") {
              return false;
            }
            if(assignment.status === "OVERDUE") {
              return true;
            }
            var current_date = moment(self.current_date);
            var dueDate = moment(assignment.due);
            var overDueDate = dueDate.add(0,'days');

            if(current_date.isSameOrAfter(overDueDate)) {
              return true;
            }
            return false;
          };

          // Convert overdue or incomplete work to MISSED status
          var isMissed = function() {

            // If an instructor gives a student a zero to let them know they have missed their assignment,
            // the assignment still shows up as 'SUBMITTED' in blackboard.
            // We need to set assignments with a grade of 0.00 as 'MISSED'.
            if(assignment.status === "SUBMITTED" && assignment.grade === 0.00) {
              return true;
            }

            if(assignment.status === "SUBMITTED") {
              return false;
            }
            var current_date = moment(self.current_date);
            var dueDate = moment(assignment.due);
            var missedDate = dueDate.add(7,'days');

            if(current_date.isSameOrAfter(missedDate)) {
              return true;
            }
            return false;
          };

          if(isOverdue()) {
            assignment.status = 'OVERDUE';
          }

          if(isMissed()) {
            assignment.status = 'MISSED';
          }

          // Flag items that should appear in Dashboard under 'Due In the Next Five Days'
          // It's acknowledged that is a ton of logic in here.
          // In short, if an assignment still has any chance of earning points, include it 'In the Next Five Days'.
          assignment.isDueSoon = null;
          var isDueSoon = function() {

            var current_date = moment(self.current_date);
            var six_days_from_now = moment(current_date).add(6,'days').add(12,'hours'); // Front-end says "5 days", but offer some extra padding for things due in 5-6 days or so
            var dueDate = moment(assignment.due);

            // console.debug('isDueSoon?',assignment.name,assignment.status,assignment.due.format(),assignment.dueDatePeerResponse.format());

            if(assignment.status === 'OVERDUE') {
              return true;
            }

            if(dueDate.isAfter(six_days_from_now)) {
              return false;
            }

            if(current_date.isAfter(assignment.dueDatePeerResponse)) {
              return false;
            }

            if(assignment.type === 'assignment' && assignment.status === 'SUBMITTED') {
              return false;
            }

            if(assignment.type === 'discussion' && current_date.isBefore(assignment.dueDatePeerResponse)) {
              return true;
            }

            if(assignment.type === 'discussion' && assignment.status === 'MISSED' ) {
              return true;
            }

            if(dueDate.isBefore(six_days_from_now)) {
              return true;
            }

            return false;

          };

          assignment.isDueSoon = isDueSoon();

          // Append object to array of assessments
          assessments.push(assignment);

        });

        assessments = sort_assignments(assessments);

        // Debug in a more minimal manner, leaving out other Vue methods and properties
        console.debug('assessments',JSON.parse(JSON.stringify(assessments)));

        return assessments;

      }
    },
     /**
      * Computed Property: assessmentsDueSoon
      * Returns filtered set of assignments that are due sooon
      */
      assessmentsDueSoon: {
        cache: true,
        get: function() {
          var assessments = this.assessments;
          var arr = [];
          $.each( assessments, function( id, assessment ) {
            if(assessment.isDueSoon) {
              arr.push(assessment);
            }
          });
          return arr;
        }
      },

      /**
       * Computed Property: assessmentsDueThisWeek
       * Returns filtered set of assignments that are due in the current week
       */
       assessmentsDueThisWeek: {
         cache: true,
         get: function() {
           var self = this;
           var assessments = self.assessments;
           var arr = [];
           $.each( assessments, function( id, assessment ) {
             if(assessment.weekNumber == self.current_week_number) {
               arr.push(assessment);
             }
           });
           return arr;
         }
       },

       /**
        * Computed Property: submittedAssessmentsDueThisWeek
        * Returns filtered set of submitted assignments that are due in the current week
        */
        submittedAssessmentsDueThisWeek: {
          cache: true,
          get: function() {
            var self = this;
            var assessments = self.assessmentsDueThisWeek;
            var arr = [];
            $.each( assessments, function( id, assessment ) {
              if(assessment.status === 'SUBMITTED') {
                arr.push(assessment);
              }
            });
            return arr;
          }
        },

      /**
       * Computed Property: Weeks
       * Returns an array of assessments by week
       */
       weeks: {
        cache: true,
        get: function() {
          var self = this;
          var assessments = self.assessments;
          var weekNumber = self.current_week_number;
          var weeks = {};
          $.each( assessments, function( id, assessment ) {
            weeks[assessment.weekNumber] = {
              hasItemsDueSoon: false,
              isCurrent: weekNumber === assessment.weekNumber,
              items: []
            };
          });
          $.each( assessments, function( id, assessment ) {
            weeks[assessment.weekNumber].items.push(assessment);
            if(assessment.isDueSoon) {
              weeks[assessment.weekNumber].hasItemsDueSoon = true;
            }
          });
          return weeks;
        }
      },

     /**
      * Computed Property: submittedAssessmentsDueSoon
      * Returns filtered set of assignments that are due soon, but have already been submitted
      */
      submittedAssessmentsDueSoon: {
        cache: true,
        get: function() {
          var assessments = this.assessmentsDueSoon;
          var arr = [];
          $.each( assessments, function( id, assessment ) {
            if(assessment.status === 'SUBMITTED') {
              arr.push(assessment);
            }
          });
          return arr;
        }
      },

     /**
      * Computed Property: course_has_started
      * Returns Boolean
      */
      course_has_started: {
        cache: true,
        get: function() {
          var current_date = this.current_date;
          var course_start_date = this.course_start_date;
          // console.debug('course_has_started?',current_date.format(),course_start_date.format());

          if( current_date.isSameOrAfter(course_start_date) ) {
            return true;
          }
          return false;
        }
      },

      /**
       * Computed Property: course_has_ended
       * Returns Boolean
       */
       course_has_ended: {
         cache: true,
         get: function() {
           var current_date = this.current_date;
           var course_end_date = this.course_end_date;
           if( current_date.isAfter(course_end_date) ) {
             return true;
           }
           return false;
         }
       },

      /**
       * Computed Property: course_days_remaining
       * Returns number of days remaining from today to the course end date
       */
       course_days_remaining: function() {

        var current_date = this.current_date;
        var course_end_date = this.course_end_date;

        var remaining = moment(course_end_date).diff( current_date ,'days');

        if(remaining < 0) {
          remaining = 0;
        }

        return remaining;

      },

     /**
      * Computed Property: Current Week Number
      * Returns current week number within the course
      */
      current_week_number: {
        cache: true,
        get: function() {

          var current_date = moment(this.current_date);
          var course_start_date = moment(this.course_start_date);

          if(!course_start_date.isValid()) {
            console.warn('current_week_number: course_start_date is',course_start_date.format());
            return;
          }

          if(!current_date.isValid()) {
            console.warn('current_week_number: current_date is',course_start_date.format());
            return;
          }

          var course_start_date_monday = course_start_date.startOf('isoweek');
          var current_date_monday = current_date.startOf('isoweek');

          var diff = moment(current_date_monday).diff(course_start_date_monday,'week');

          if(diff < 0) { diff = 0; }

          diff++;

          console.log('current_week_number',diff);

          return diff;
        }
      }
    },

  /**
   * Vue Methods
   */
   methods: {

    /**
     * Method: completeSetup
     * Finish processing things after we received the JSON response we were expecting
     */
     completeSetup: function(data) {

      var self = this;

      if(!this.debug) {
        this.silenceDebugMessages();
      }

      console.log('completeSetup');

      // Prefer hashed username for analytics privacy
      if(data.user && typeof data.user.usernameHashed !== undefined && data.user.usernameHashed) {
        this.username = data.user.usernameHashed;
      }
      else if(data.user && data.user.username) {
        this.username = data.user.username;
      }

      // Populate assignments property from the API
      if(data.assignments) {
        this.assignments = data.assignments;
      }

      // Set page title from the API
      if(data.courseDto && data.courseDto.name) {
        document.title = 'EXAMPLE | ' + document.title;
      }

      // Safely Test and Parse Unix Timestamp in Milliseconds (startDate)
      //
      // Temporarily disabled, because course start/end dates defined in Blackboard are not actually used by students
      // We'll use the dates set in the course config file instead
      //
      // if(data.courseDto && data.courseDto.startDate) {
      //   if(moment(data.courseDto.startDate).isValid()) {
      //     console.debug( 'startDate', data.courseDto.startDate, moment(data.courseDto.startDate).format() );
      //     this.course_start_date = moment(data.courseDto.startDate);
      //   } else {
      //     console.error('Invalid Course Start Date',data.courseDto.startDate);
      //   }
      // } else {
      //   console.warn('Blackboard API: courseDto.startDate is',data.courseDto.startDate);
      // }

      // Safely Test and Parse Unix Timestamp in Milliseconds (endDate)
      //
      // Temporarily disabled, because course start/end dates defined in Blackboard are not actually used by students
      // We'll use the dates set in the course config file instead
      //
      // if(data.courseDto && data.courseDto.endDate) {
      //   if(moment(data.courseDto.endDate).isValid()) {
      //     console.debug( 'endDate', data.courseDto.endDate, moment(data.courseDto.endDate).format() );
      //     this.course_end_date = moment(data.courseDto.endDate);
      //   } else {
      //     console.error('Invalid Course End Date',data.courseDto.endDate);
      //   }
      // } else {
      //   console.warn('Blackboard API: courseDto.endDate is',data.courseDto.endDate);
      // }

      // Retrieve additional course meta data
      console.debug('meta_api_endpoint',this.meta_api_endpoint);
      if(this.meta_api_endpoint) {
        var resource = this.$resource(this.meta_api_endpoint);
        resource.get().then(function (response) {
          var data = JSON.parse(response.data);
          self.assignments_meta = data.assignments; // TODO Check for existence of data.assignments

          // Toggle section display based on config file preference
          self.show_course_progress = data.show_course_progress;
          self.show_all_items = data.show_all_items;

          // Don't display these sections if course has not started yet
          //
          // EDIT: Omit this logic for now because it is generating false-positives
          // Instead, we'll check if course_has_started in the HTML template for now
          // if(!self.course_has_started) {
          //   self.show_course_progress = false;
          //   self.show_all_items = false;
          // }

          // Back to Blackboard URL via config
          self.back_to_blackboard = data.back_to_blackboard;

          // Blackboard Help URL via config
          self.help_link = data.help;

          // Sidebar Navigation via config
          self.navigation = data.navigation;

          // Human Readable Course Name via config (TODO: Check if available in API)
          self.course_name = data.course_name;

          // Set Course Start Date via config file if not provided by API
          // Expects ISO 8601 Format: http://momentjs.com/docs/#/parsing/special-formats/
          if(!self.course_start_date && data.course_start_date) {
            self.course_start_date = moment(data.course_start_date,moment.ISO_8601);
            console.debug('course_start_date set via config using ISO_8601 format',self.course_start_date.format());
          }

          // Set Course End Date via config file if not provided by API
          // Expects ISO 8601 Format: http://momentjs.com/docs/#/parsing/special-formats/
          if(!self.course_end_date && data.course_end_date) {
            self.course_end_date = moment(data.course_end_date,moment.ISO_8601);
            console.debug('course_end_date set via config using ISO_8601 format',self.course_end_date.format());
          }

          // Final check to verify that we have no start date
          // If the course has no start date in Blackboard or the JSON config,
          // consider this course to have incomplete data and make it error out
          if(!data.course_start_date) {
            self.course_id = false;
          }

        }, function (response) {
          var data = JSON.parse(response.data);
          console.error('Metadata API Error',response.status,response.statusText,response.data.message);
        });
      }

      this.registerAnalyticsEvents();

    },

    /**
     * Method: registerAnalyticsEvents
     * Initializes dataLayer for Google Tag Manager / Analytics
     * This is an ideal place to shoehorn other analytics watchers/functionality
     */
     registerAnalyticsEvents: function() {
      console.log('registerAnalyticsEvents');
      try {
        dataLayer.push({
          'courseID': this.course_id,
          'userID': this.username
        });
      } catch(error){
        console.error(error);
      }
    },

    /**
     * Method: setNavMaxHeight
     * Adjust Menu Heights on Resize
     */
     setNavMaxHeight: function() {
      console.log('setNavMaxHeight');
      // measure and set max-height of nav.hide-for-medium
      var pad = 28; // 2.8rem
      var maxHeight = $('a.selected').outerHeight() + $('nav.hide-for-medium .menu').outerHeight() + pad;
      $('nav.hide-for-medium').css({'max-height': maxHeight + 'px'});
    },

    /**
     * Method: silenceDebugMessages
     * Silence Debug Messages in Production
     * If ?debug=true is set in the querystring, debug messages will be allowed. See method completeSetup().
     * @link https://stackoverflow.com/questions/1215392/how-to-quickly-and-conveniently-disable-all-console-log-statements-in-my-code
     */
     silenceDebugMessages: function() {
      try {
        if (typeof(window.console) != "undefined") {

          window.console.log = function () {
          };
          window.console.info = function () {
          };
          window.console.warn = function () {
          };
          window.console.error = function () {
          };
          window.console.debug = function () {
          };
        }
        if (typeof(alert) !== "undefined") {
          alert = function ()
          {

          };
        }
      } catch (ex) {

      }
    }
  }
});

/**
 * Vue Directive: Tooltip Attributes
 */
 Vue.directive('tooltip', {
  bind: function (el) {
    var $tooltip = $(el).find('.v-tooltip');
    $(el).addClass('v-tooltip--trigger').on('click.vue-tooltip', function(event) {
      if ($tooltip[0] && !$tooltip[0].contains(event.target)) {
        $tooltip.fadeToggle(200);
      }
    });
    $tooltip
    .prepend('<button type="button" class="v-tooltip--exit"><span class="u-visually-hidden">Exit</span></button>')
    .on('click.vue-tooltip', 'button.v-tooltip--exit', function() {
      $tooltip.fadeOut(200);
    });
  },
});

/**
 * Helper Function: Debounce
 * @link https://davidwalsh.name/function-debounce
 */
 function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Helper Function: Get Querystring Variables
 * @link http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
 */
 function getUrlVars()
 {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++)
  {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

/**
 * Helper Function: Sort Assignments
 * Returns array of assignments sorted by due date
 */
 function sort_assignments(assignments) {
  return assignments.sort(function(a, b) {
    return a.due - b.due;
  });
}

/**
 * Vue StartOfWeek Filter
 * @example "Sep 21 at 5:46 AM CDT"
 */
 Vue.filter('startofweek', function (date) {
  var d = moment(date).clone().startOf('isoWeek');
  return d.format('MMM D');
});

 /**
  * Vue EndOfWeek Filter
  * @example "Sep 21 at 5:46 AM CDT"
  */
  Vue.filter('endofweek', function (date) {
    var d = moment(date).clone().endOf('isoWeek');
    return d.format('MMM D');
  });

/**
 * Vue Timestamp Filter
 * @example "Sep 21 at 5:46 AM CDT"
 */
 Vue.filter('timestamp', function (date) {
  var local_timezone = moment.tz.guess();
  return moment(date).tz(local_timezone).format('MMM D, YYYY') + ' at ' + moment(date).tz(local_timezone).format('h:mm A z');
});

/**
 * Vue Datestamp Filter
 * @example "September 21, 2016"
 */
 Vue.filter('datestamp', function (date) {
  var local_timezone = moment.tz.guess();
  return moment(date).tz(local_timezone).format('MMMM D, YYYY');
});
