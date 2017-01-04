# Installation Notes

This front-end package relies on the JSON API provided by the Course Tracker API Building Block.

First, you must confirm that that the API is returning a JSON response by visiting the the URL:

	https://wa.elearning.laureate.net/webapps/gkl-coursetracker-BBLEARN/ws/currentuser/courses/<COURSE_ID>/assignments

For example:

	https://wa.elearning.laureate.net/webapps/gkl-coursetracker-BBLEARN/ws/currentuser/courses/USW1.EDPD.8044.WC.DEV.MASTER/assignments

	https://qa03-01.blackboard.laureate.net/webapps/gkl-coursetracker-BBLEARN/ws/currentuser/courses/USW1.EDPD.8044.WC.DEV.MASTER/assignments


## Installation

1. Unzip this package on the Blackboard server to a directory housing static HTML and assets, e.g.

		https://wa.elearning.laureate.net/bbcswebdav/institution/course-tracker/index.html
		https://wa.elearning.laureate.net/bbcswebdav/institution/course-tracker/tests.html
		https://wa.elearning.laureate.net/bbcswebdav/institution/course-tracker/config/
		https://wa.elearning.laureate.net/bbcswebdav/institution/course-tracker/assets/

2. To update assignment links or change the course start date, edit the course meta JSON file, e.g. `/config/USW1.EDPD.8044.WC.DEV.MASTER.json`.

   It is highly recommended that you test changes to the config file with a tool like [JSON Lint](http://jsonlint.com), [JSON Editor Online](http://www.jsoneditoronline.org), or [Atom](https://atom.io).

3. Finally, load the `index.html` page from your web server with the `course_id` parameter in your querystring, like this:
	
		https://wa.elearning.laureate.net/path/to/index.html?course_id=<course_id>

		https://qa03-01.blackboard.laureate.net/bbcswebdav/institution/USW1/00coursetrackertest/index.html?course_id=USW1.EDPD.8044.WC.DEV.MASTER


## Testing and QA

### Test Suite

A basic test suite is included to verify the API and config files include the necessary data. Load `tests.html` from your web server.

	https://wa.elearning.laureate.net/path/to/tests.html?course_id=<course_id>

	https://qa03-01.blackboard.laureate.net/bbcswebdav/institution/USW1/00coursetrackertest/tests.html?course_id=USW1.EDPD.8044.WC.DEV.MASTER


### Testing Future Dates and Debugging

If the course has not started yet, or you wish to test the application at a future date, you can use the `?date=` querystring parameter, like this:

	/bbcswebdav/institution/USW1/00coursetrackertest/index.html?course_id=USW1.EDPD.8044.WC.DEV.MASTER&date=2016-09-01

Furthermore, the application includes a `?debug=true` feature flag, which dumps helpful information to the console, and displays test details in the Dashboard.

	/bbcswebdav/institution/USW1/00coursetrackertest/index.html?course_id=USW1.EDPD.8044.WC.DEV.MASTER&date=2016-09-01&debug=true