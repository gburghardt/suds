Suds.RequestView = Backbone.View.extend({
	events: {
		"click button[type=reset]": "confirmResetForm",
		"click .request-headers button.btn-danger": "removeHeader",
		"click .request-headers-actions button": "addHeader",
		"keypress .request-headers input[type=text]": "addHeader",
		"submit": "makeSOAPRequest",
		"click button[data-action=beautify-xml]": "beautifyRequestBodyXml",
		"click button[data-action=minify-xml]": "minifyRequestBodyXml",
		"click button[data-action=body-history-apply]": "applySelectedBodyHistory"
	},

	transport: null,

	initialize: function() {
		this.focus();
		var $hostValue = this.$el.find("input[value='Host']").next("input");

		if (!$hostValue.val()) {
			$hostValue.val(window.location.hostname);
		}

		this.fillBodyHistory();
	},

	addHeader: function(event) {
		if ((event.type === "keypress" && event.keyCode == 13) || event.type == "click") {
			event.stopPropagation();
			event.preventDefault();
			var templateVars = {
				temp_id: new Date().getTime()
			};
			var template = document.getElementById("request-header-tpl").innerHTML;
			var $newHeader = jQuery(template);
			this.$el.find(".request-headers-actions").before($newHeader);
			$newHeader.find(":input:first").focus();
		}
	},

	applySelectedBodyHistory: function(event) {
		event.preventDefault();
		var body = this.$el.find(".body-history").val();

		if (body) {
			this.$el.find("textarea").val(decodeURIComponent(body));
		}
	},

	beautifyRequestBodyXml: function(event) {
		event.preventDefault();
		var $body = this.$el.find("textarea");
		$body.val(vkbeautify.xml($body.val()));
	},

	confirmResetForm: function(event) {
		if (!confirm("Are you sure you want to clear the form?")) {
			event.preventDefault();
		}
		else {
			this.focus();
		}
	},

	fillBodyHistory: function() {
		var historyStr = localStorage["Suds.RequestView.bodyHistory"];
		var history = JSON.parse(historyStr || "[]");
		var $history = this.$el.find(".body-history");
		var options = [];

		for (var i = 0, length = history.length; i < length; i++) {
			options.push('<option value="' + encodeURIComponent(history[i]) + '">' + (i + 1) + '</option>');
		}

		$history.append(options.join(""));
	},

	focus: function() {
		this.$el.find(":input:first").focus().select();
	},

	makeSOAPRequest: function(event) {
		event.preventDefault();
		console.info("Make SOAP request");

		try {
			if (this.transport) { this.transport.abort(); }
		}
		catch (error) {
			console.warn(error);
		}

		try {
			this.transport = new XMLHttpRequest();
			var $headers = this.$el.find("fieldset.request-headers input");
			var method = this.$el.find("select[name=request\\[method\\]]").val().toUpperCase();
			var url = this.$el.find("input[name=request\\[url\\]]").val();
			var body = this.$el.find("textarea").val();
			var that = this;
			var $readyState = jQuery("#transport-readyState").html("...");
			var $status = jQuery("#transport-status").html("...");
			jQuery("#transport textarea").val("...");

			if (!url) {
				alert("Please provide a URL");
				this.$el.find("input[name=request\\[url\\]]").focus();
				return;
			}

			this.transport.open(method, url, true);

			$headers.each(function(i) {
				if (/name\]$/.test(this.name) && this.value) {
					console.debug("Set request header: " + this.value + "=" + $headers[i + 1].value);
					that.transport.setRequestHeader(this.value, $headers[i + 1].value);
				}
			});

			this.transport.setRequestHeader("Content-Length", body.length);

			this.transport.onreadystatechange = function() {
				$readyState.html(this.readyState);

				if (this.readyState === 4) {
					$status.html(this.status);
					that.recordRequest(this);
					that.transport.onreadystatechange = that.transport = that = null;
				}
			};

			this.recordBodyHistory(body);
			this.transport.send(body);
		}
		catch (error) {
			console.error(error);
		}
	},

	minifyRequestBodyXml: function(event) {
		event.preventDefault();
		var $body = this.$el.find("textarea");
		$body.val(vkbeautify.xmlmin($body.val()));
	},

	recordBodyHistory: function(s) {
		var history = JSON.parse(localStorage["Suds.RequestView.bodyHistory"] || "[]");

		if (history.indexOf(s) < 0) {
			history.push(s);

			if (history.length > 10) {
				history.shift();
			}

			localStorage["Suds.RequestView.bodyHistory"] = JSON.stringify(history);
			this.$el.find(".body-history").append('<option value="' + encodeURIComponent(s) + '">' + history.length + '</option>');
		}
	},

	recordRequest: function(transport) {
		var $el = jQuery("#transport");
		$el.find("textarea").val(vkbeautify.xml(transport.responseText));
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
