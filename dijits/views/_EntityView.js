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
	animateOnUpdate: true,
	flashBackgroundColor: "#ff8",
	normalBackgroundColor: "#fff",
	animationDuration: 1500,
	
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
			if(this.properties == null) {this.properties = {};}
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
		var _this = this;
		if(this.showAnimationProperties == null) {
			this.showAnimationProperties = {
				node: _this.domNode,
				duration: _this.animationDuration,
				properties: {
					backgroundColor: {
						start: _this.flashBackgroundColor,
						end: _this.normalBackgroundColor
					}
				},
				onEnd: function(node){
					dojo.style(node,"backgroundColor",null);
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
		console.log("setting values:", data, "onto properties:",this.properties)
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
		if(this.animateOnUpdate) this._updateAnimation.play();
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
	
	_getRawPropertiesAttr: function(){
		return dojo.clone(this.properties);
	},
	
	_setCanUpdateAttr: function(canUpdate){
//		if(this.canUpdate == canUpdate) return;
		if(!this.updateAnchor) return;

		if(canUpdate){
			dojo.removeClass(this.updateAnchor, "dijitHidden");
		} else {
			dojo.addClass(this.updateAnchor,"dijitHidden");
		}
	},
	
	_setCanDeleteAttr: function(canDelete){
//		if(this.canDelete == canDelete) return;
		if(!this.deleteAnchor) return;

		if(canDelete){
			dojo.removeClass(this.deleteAnchor, "dijitHidden");
		} else {
			dojo.addClass(this.deleteAnchor,"dijitHidden");
		}
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
	},

	getId: function(){
		return this.properties[this.idProperty];
	},
	
	activate: function(){
		dojo.addClass(this.domNode,"active");
	},
	
	deactivate: function(){
		dojo.removeClass(this.domNode,"active");
	}
	
});