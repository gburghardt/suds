var app = {
	requestView: null
};

jQuery(function() {
	app.requestView = new Suds.RequestView({el: jQuery("#request-form")});
});
