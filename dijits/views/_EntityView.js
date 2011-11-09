/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views._EntityView");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("czarTheory.dijits.views._EntityView",[dijit._Widget, dijit._Templated],{
	
	parent: null,
	deleteLink: null,
	canDelete: true,
	updateLink: null,
	canUpdate: true,
	properties: null,
	allowedProperties: null,
	idProperty: 'id',
	animateOnCreate: true,
	
	
	postCreate: function(){
		this.inherited(arguments);
		
		// Prep the Dom element with incomming values
		var prop;
		if(this.allowedProperties == null){
			this.allowedProperties = [];
			for(prop in this.properties) {
				this.allowedProperties.push(prop);
			}
		} else {
			var newProperties = {};
			var i;
			for(i = 0; i<this.allowedProperties.length; i++){
				prop = this.allowedProperties[i];
				newProperties[prop] = this.properties[prop];
			}
			this.properties = newProperties;
		}
		this._updateDom(this.properties);

		//Prep the Animations
		if(this.showAnimationProperties == null) {
			this.showAnimationProperties = {
				node: this.domNode,
				duration: 1500,
				properties: {
					backgroundColor: {
						start: "#e6e688",
						end: "#e6e6e6"
					}
				}
			};
		}
		
		if(this.updateAnimationProperties == null){
			this.updateAnimationProperties = this.showAnimationProperties;
		}
		
		this._showAnimation = dojo.animateProperty(this.showAnimationProperties);
		if(this.showAnimationProperties === this.updateAnimationProperties) {
			this._updateAnimation = this._showAnimation;
		} else {
			this._updateAnimation = dojo.animateProperty(this.updateAnimationProperties);
		}
		if(this.animateOnCreate) this._showAnimation.play();
	},
	
	_showAnimation: null,
	
	_updateAnimation: null,
	
	showAnimationProperties: null,
	
	updateAnimationProperties: null,
	
	_setValueAttr: function(data){
		var changed = {};
		var prop;
		var i;
		for(i = 0; i<this.allowedProperties.length; i++){
			prop = this.allowedProperties[i];
			if(prop == this.idProperty) {
				if(this.properties[this.idProperty] != data[prop]) {
					console.warn("WARNING: Identifiers mismatch in update")
				}
			} else if(this.properties[prop] != data[prop]){
				changed[prop] = data[prop];
				this.properties[prop] = data[prop];
			}
		}
		this._updateDom(changed);
		this._updateAnimation.play();
		console.log("played.");
	},
	
	_getValueAttr: function(){
		var output = {};
		var prop;
		for(prop in this.properties){
			var item = this.properties[prop];
			if(typeof item === "object"){output[prop] = item.id;}
			else {output[prop] = item}
		}
		return output;
	},
	
	getId: function(){
		return this.properties[this.idProperty];
	},
	
	_updateDom: function(changes){
		var prop;
		for(prop in changes){
			var item = changes[prop];
			if(typeof item === "object") {this.set(prop,item.label)}
			else {
				this.set(prop,item);
			}
		}
	}
});