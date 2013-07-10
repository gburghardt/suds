Suds.RequestView = Backbone.View.extend({
	events: {
		"click button[type=reset]": "confirmResetForm",
		"click .request-headers button.btn-danger": "removeHeader",
		"click .request-headers-actions button": "addHeader",
		"keypress .request-headers input[type=text]": "addHeader",
		"submit": "makeSOAPRequest"
	},

	initialize: function() {
		this.focus();
		var $hostValue = this.$el.find("input[value='Host']").next("input");

		if (!$hostValue.val()) {
			$hostValue.val(window.location.hostname);
		}
	},

	addHeader: function(event) {
		if ((event.type === "keypress" && event.keyCode == 13) || event.type == "click") {
			event.stopPropagation();
			event.preventDefault();
			var template = document.getElementById("request-header-tpl").innerHTML;
			var $newHeader = jQuery(template);
			this.$el.find(".request-headers-actions").before($newHeader);
			$newHeader.find(":input:first").focus();
		}
	},

	confirmResetForm: function(event) {
		if (!confirm("Are you sure you want to clear the form?")) {
			event.preventDefault();
		}
		else {
			this.focus();
		}
	},

	focus: function() {
		this.$el.find(":input:first").focus().select();
	},

	makeSOAPRequest: function(event) {
		event.preventDefault();
		console.info("Make SOAP request");
	},

	removeHeader: function(event) {
		event.preventDefault();

		var $header = jQuery(event.target).closest("p");

		if (
			!($header.find("input[placeholder='Header name']").val() || $header.find("input[placeholder='Header value']").val()) ||
			confirm("Are you sure you want to remove this header?")) {
			$header.remove();
		}
	}
});
