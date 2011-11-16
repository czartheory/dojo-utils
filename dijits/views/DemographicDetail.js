/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views.DemographicDetail");

dojo.require("czarTheory.dijits.views._EntityView");

dojo.declare("czarTheory.dijits.views.DemographicDetail", [czarTheory.dijits.views._EntityView], {
	
	templateString: dojo.cache('czarTheory.dijits.views', 'DemographicDetail.html'),
	animateOnCreate:false,
	animateOnUpdate:false,
	normalBackgroundColor: "#d2d2d2",

	attributeMap: {
		id: "",
		label: {
			node: "labelNode", 
			type:"innerHTML"
		},
		distribution: {
			node: "dataTypeNode", 
			type:"innerHTML"
		}
	},
	
	postCreate: function(){
		this.allowedProperties = [
			'allowNull',
			'dataType',
			'distribution',
			'isCustom',
			'isUnique',
			'label',
			'options',
			'verifyWithParticipants',
			'visibleInSurveys'
		];
		this.inherited(arguments);
		dojo.style(this.domNode, "margin-left", "-260px");
	},
	
	firstLoaded: false,
	_setValueAttr: function(values){
		if(!this.firstLoaded){
			console.log("animating");
			dojo.animateProperty({
				node: this.domNode,
				duration: 400,
				properties: {
					marginLeft:0
				}
			}).play();
			this.firstLoaded = true;
		}
		this.inherited(arguments);
	},
	
	_setOptionsAttr: function(options){
		if(!options){
			dojo.addClass(this.optionsNode,"dijitHidden");
			dojo.addClass(this.optionsList,"dijitHidden");
		} else {
			dojo.removeClass(this.optionsNode,"dijitHidden");
			dojo.removeClass(this.optionsList,"dijitHidden");
			this.optionsList.innerHTML = options;
		}
	},
	
	_setAllowNullAttr: function(allowNull){
		if(allowNull){
			dojo.addClass(this.allowNullNode,"allowed");
		} else {
			dojo.removeClass(this.allowNullNode,"allowed");
		}
	},

	_setVisibleInSurveysAttr: function(visibleInSurveys){
		if(visibleInSurveys){
			dojo.addClass(this.inSurveyNode,"allowed");
		} else {
			dojo.removeClass(this.inSurveyNode,"allowed");
		}
	},

//	_setUseForGraphingAttr: function(useForGraphing){
//		if(useForGraphing){
//			dojo.addClass(this.inGraphingNode,"allowed");
//		} else {
//			dojo.removeClass(this.inGraphingNode,"allowed");
//		}
//	},

	_setVerifyWithParticipantsAttr: function(verifyWithParticipants){
		if(verifyWithParticipants){
			dojo.addClass(this.needsVerifyNode,"allowed");
		} else {
			dojo.removeClass(this.needsVerifyNode,"allowed");
		}
	},
	
	_setIsCustomAttr: function(isCustom){
		if(isCustom){
			this.set("canUpdate",true);
			this.set("canDelete",true);
			dojo.addClass(this.mandatoryNode,"dijitHidden");
		} else {
			this.set("canUpdate",false);
			this.set("canDelete",false);
			if(this.firstLoaded) dojo.removeClass(this.mandatoryNode,"dijitHidden");
		}
	}
});