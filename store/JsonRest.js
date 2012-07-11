/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.store.JsonRest");

dojo.require("dojo.store.util.QueryResults");

dojo.declare("czarTheory.store.JsonRest", null, {
	// target: String
	//		The target base URL to use for all requests to the server. This string will be
	// 	prepended to the id to generate the URL (relative or absolute) for requests
	// 	sent to the server
	target: "",

	// idProperty: String
	//		Indicates the property to use as the identity property. The values of this
	//		property should be unique.
	idProperty: "id",

	constructor: function(/*dojo.store.JsonRest*/ options){
		// summary:
		//		This is a basic store for RESTful communicating with a server through JSON
		//		formatted data.
		// options:
		//		This provides any configuration information that will be mixed into the store
		dojo.mixin(this, options);
		var last = this.target[this.target.length-1];
		if(last != '/') this.target += '/';
	},

	getIdentity: function(object){
		// summary:
		//		Returns an object's identity
		// object: Object
		//		The object to get the identity from
		//	returns: Number
		return object[this.idProperty];
	},

	parseResponse: function(response) {
		try{
			return JSON.parse(response);
		} catch (e){
			return {error: {malformedJson: response}};
		}
	},

	handleResponse: function(response, def, httpMethod, resultKey, options) {
		var data = this.parseResponse(response);
		if(data.error) {
			def.reject(data.error);
		} else {
			var publish = {method: httpMethod};
			if(typeof resultKey == 'string'){
				publish[resultKey] = data;
			}

			if(typeof options == 'object'){
				for(var key in options){
					publish[key] = options[key];
				}
			}
			dojo.publish(this.target,[publish]);
			def.resolve(data);
		}
	},

	handleError: function(response, def) {
		var data = this.parseResponse(response);
		def.reject(data.error ? data.error : data);
	},

	get: function(id, options){
		//	summary:
		//		Retrieves an object by its identity. This will trigger a GET request to the server using
		//		the url `this.target + id`.
		//	id: Number
		//		The identity to use to lookup the object
		//	returns: Object
		//		The object in the store that matches the given id.
		var headers = options || {};

		headers.Accept = "application/javascript, application/json";

		var def = new dojo.Deferred();
		var _this = this;
		dojo.xhrGet({
			url:this.target + id,
			handleAs: "text",
			headers: headers,
			load: function(response){_this.handleResponse(response, def, 'GET', 'item');},
			error: function(err,ioArgs){_this.handleError(ioArgs.xhr.responseText, def)},
			failOk: true
		});
		return def;
	},

	put: function(object, options){
		// summary:
		//		Updates an object. This will trigger a PUT request to the server
		// object: Object
		//		The object to update.
		// options: dojo.store.api.Store.PutDirectives?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		//	returns: Number
		options = options || {};
		var id = ("id" in options) ? options.id : this.getIdentity(object);

		if(typeof id === "undefined") {
			console.error("ID missing for PUT request. object: ", object, " options: " , options);
			return null;
		}

		var def = new dojo.Deferred();
		var _this = this;
		dojo.xhrPut({
			url: this.target + id,
			content: object,
			handleAs: "text",
			headers:{
//				"Content-Type": "application/json",
				Accept: "application/javascript, application/json"
			},
			load: function(response){_this.handleResponse(response, def, 'PUT', 'item');},
			error: function(err,ioArgs){_this.handleError(ioArgs.xhr.responseText, def)},
			failOk: true
		});
		return def;
	},

	add: function(object, options){
		// summary:
		//		Adds an object. This will trigger a POST request to the server
		// object: Object
		//		The object to add.
		// options: dojo.store.api.Store.PutDirectives?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		options = options || {};

		var def = new dojo.Deferred();
		var _this = this;
		dojo.xhrPost({
			url: this.target,
			content: object,
			handleAs: "text",
			headers:{
//				"Content-Type": "application/json",
				Accept: "application/javascript, application/json"
			},
			load: function(response){_this.handleResponse(response, def, 'POST', 'item');},
			error: function(err,ioArgs){_this.handleError(ioArgs.xhr.responseText, def)},
			failOk: true
		});
		return def;
	},

	remove: function(identifier){
		// summary:
		//		Deletes an object by its identity. This will trigger a DELETE request to the server.
		// id: Number
		//		The identity to use to delete the object

		var def = new dojo.Deferred();
		var _this = this;
		dojo.xhrDelete({
			url: this.target + identifier,
			handleAs: "text",
			headers:{
//				"Content-Type": "application/json",
				Accept: "application/javascript, application/json"
			},
			load: function(response){_this.handleResponse(response, def, 'DELETE', null, {id:identifier});},
			error: function(err,ioArgs){_this.handleError(ioArgs.xhr.responseText, def)},
			failOk: true
		});
		return def;
	},

	query: function(query, options){
		// summary:
		//		Queries the store for objects. This will trigger a GET request to the server, with the
		//		query added as a query string.
		// query: Object
		//		The query to use for retrieving objects from the store.
		// options: dojo.store.api.Store.QueryOptions?
		//		The optional arguments to apply to the resultset.
		//	returns: dojo.store.api.Store.QueryResults
		//		The results of the query, extended with iterative methods.
		var headers = {
			Accept: "application/javascript, application/json"
		};

		options = options || {};

		if(options.start >= 0 || options.count >= 0){
			headers.Range = "items=" + (options.start || '0') + '-' +
			(("count" in options && options.count != Infinity) ?
				(options.count + (options.start || 0) - 1) : '');
		}
		if(dojo.isObject(query)){
			query = dojo.objectToQuery(query);
			query = query ? "?" + query: "";
		}
		if(options.sort){
			query += (query ? "&" : "?") + "sort=";
			for(var i = 0; i < options.sort.length; ++i){
				var sort = options.sort[i];
				query += (i > 0 ? "," : "") + (sort.descending ? '-' : '+') + encodeURIComponent(sort.attribute);
			}
		}

		var def = new dojo.Deferred();
		var _this = this;
		var results = dojo.xhrGet({
			url: this.target + (query || ""),
			handleAs: "text",
			headers: headers,
			load: function(response,ioArgs){
				_this.handleResponse(response, def, 'QUERY', 'items',{query:ioArgs.query});
			},
			error: function(err,ioArgs){_this.handleError(ioArgs.xhr.responseText, def)},
			failOk: true
		});

		def.total = def.then(function(){
			var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
			return range && (range=range.match(/\/(.*)/)) && +range[1];
		});

		return def;
	}
});
