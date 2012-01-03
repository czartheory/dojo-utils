/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits.ParticipantLister");

dojo.require("czarTheory.dijits._FlyoutMultiLister");
dojo.require("czarTheory.dijits.views.ParticipantDetail");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.store.Memory");
dojo.require("dojo.data.ObjectStore");

dojo.declare("czarTheory.dijits.ParticipantLister",[czarTheory.dijits._FlyoutMultiLister],{

	demographicTarget: ""
	,demographics: null
	,_elementsRegistered: false
	,_addElementQueue: null
	,_customFormElements: null

	,templateString: dojo.cache('czarTheory.dijits', 'ParticipantLister.html')
	
	,getPrevious: function(node){
		var previous = node.previousSibling;
		while(previous && previous.nodeType != 1){previous = previous.previousSibling;}
		return previous;
	}

	,postMixInProperties: function() {
		this.inherited(arguments);

		this.demographics = [];
		this._addElementQueue = [];
		this._customFormElements = {};

		var last = this.demographicTarget[this.demographicTarget.length-1];
		if(last != '/') this.demographicTarget += '/';
		dojo.subscribe(this.demographicTarget, this, this._demographicsChange); 
	}

	,startup: function(){
		this.inherited(arguments);
		
		var elements = this._form.getDescendants();
		for(var i=0; i<elements.length; i++){
			var id = elements[i].id;
			if("demographic_" === id.slice(0,12)){
				id = id.slice(12);
				this._customFormElements[id] = {
					element: elements[i]
					,labelNode: this.getPrevious(elements[i].domNode.parentNode)
				};
			} else if(id === "participant_submit") {
				this._submitButtonNode = elements[i].domNode;
			}
		}

		this._elementsRegistered = true;
		for(var j=0; j<this._addElementQueue.length; j++){
			this._addFormElement(this._addElementQueue[j]);
		}
		this._addElementQueue = null;
	}
	
	,_demographicsChange: function(data){
		switch(data.method){
			case 'QUERY':
				var items = data.items;
				for(var i = 0; i < items.length; i++){this._demographicRetreived(items[i]);}
				break;
			
			case 'GET':this._demographicRetreived(data.item);break;
			case 'PUT':this._demographicUpdated(data.item);break;
			case 'POST':this._demographicAdded(data.item);break;
			case 'DELETE':this._demographicDeleted(data.id);break;
			default:console.warn('Not familiar with store method "' + method + '"', data);
		}
	}
	
	,_locateDemographic: function (id){
		for (var i=0; i<this.demographics.length; i++){
			if(this.demographics[i].id == id) return i;
		}
		return null;
	}

	,_demographicRetreived: function(item){
		console.log('retreived item:', item.columnName);
		var index = this._locateDemographic(item.id);
		if(index == null) this._demographicAdded(item);
	}
	
	,_demographicAdded: function(item){
		this.demographics.push(item);
		this.itemDetailWidget.addDemographic(item);
		this._addFormElement(item);
	}
	
	,_addFormElement: function(item){
		if(!item.isCustom) return;
		
		if(!this._elementsRegistered){
			this._addElementQueue.push(item);
			return;
		}
		
		if(this._customFormElements[item.id] != null){
			this._customFormElements[item.id].data = item;
			return;	
		} 
		
		var dtNode = dojo.create('dt',{
			id: 'demographic_' + item.id + '-label'
			,innerHTML: item.label
		},this._submitButtonNode, 'before');
		var ddNode = dojo.create('dd',{},dtNode, 'after');
		
		var created = this._placeFormElement(item,ddNode);
		this._customFormElements[item.id] = {
			element: created
			,labelNode: dtNode
			,data: item
		}
	}
	
	,_placeFormElement: function(item,domNode){
		var dist = item.distribution.distribution;
		var widget = null;
		var options = item.options;

		var props = {
			id: 'demographic_' + item.id
			,name: 'demographic_' + item.id
			,required: !item.allowNull
		}

		switch(dist){
			case 'identifier':
			case 'uniqueIdentifier':
				widget = new dijit.form.ValidationTextBox(props);
				break;

			case 'categorical':
			case 'ordered':
				var data = [];
				for(var i = 0; i<item.options.categories.length; i++){
					var category = item.options.categories[i];
					data.push({id:category,label:category});
				}
				var objectStore = new dojo.store.Memory({label:'label',data:data});
				props.store = dojo.data.ObjectStore({objectStore: objectStore});
				props.searchAttr = "label";
				props.placeHolder = "Select an option";
				props.value = null;
				
				if(dist !== 'ordered' && options.anyInput){
					console.log("filtering select about to be created");
					widget = new dijit.form.ComboBox(props);
				}
				else {widget = new dijit.form.FilteringSelect(props);} 
				break;

			case 'numeric':
				var constraints = {};
				var rangeMessage = "you must enter a Number";
				options.min = parseInt(options.min);
				options.max = parseInt(options.max);

				if(options.min){
					constraints.min = options.min;
					if(options.max) {
						constraints.max = options.max;
						rangeMessage += ' between ' + options.min + ' and ' + options.max + ".";
					} else {
						rangeMessage += ' greater than or equal to ' + options.min + ".";
					}
				} else if(options.max) {
					constraints.max = options.max;
					rangeMessage += ' less than or equal to ' + options.max + ".";
				}
				
				props.rangeMessage = rangeMessage;
				props.invalidMessage = "Please enter only whole numbers.<br/>No spaces or letters, please.";
				constraints.places = 0;
				props.constraints = constraints;

				widget = new dijit.form.NumberTextBox(props);
				break;

			default:
				console.error("Unknown distribution type: " + dist, item);
		}
		widget.placeAt(domNode);
		this._form.connectChildren();
		return widget;
	}

	,_demographicUpdated: function(item){
		console.log('updated item:', item.columnName);
		var index = this._locateDemographic(item.id);
		if(index == null) {
			this._demographicAdded(item);
		} else {
			this.demographics[index] = item;
			this.itemDetailWidget.updateDemographic(item);
			this._updateFormElement(item);
		}
	}
	
	,_updateFormElement: function(item){
		if(!item.isCustom) throw new Error("Non-custom element updated. Code is not ready for this: ", item);
		if(!this._elementsRegistered) throw new Error("updates attempted before this widget was created!", item);
		
		if(this._customFormElements[item.id] == null) {
			this._addFormElement(item);
			return;
		}
		
		var obj = this._customFormElements[item.id];
		var prev = obj.data;
		obj.data = item;
		
		if(item.label !== prev.label){
			obj.labelNode.innerHTML = item.label;
		}
		
		var ddNode = obj.element.domNode.parentNode;
		obj.element.destroyRecursive(false);
		
		obj.element = this._placeFormElement(item,ddNode);
	}

	,_demographicDeleted: function(id){
		console.log('item with id:' + id + ' deleted');
		var index = this._locateDemographic(id);
		if(index !== null) {
			var item = this.demographics[index];
			this.demographics.splice(index,1);
			this.itemDetailWidget.removeDemographic(item);
			this._removeFormElement(id);
		}
	}

	,_removeFormElement: function(id){
		if(!this._elementsRegistered) throw new Error("deletes attempted before this widget was created!", item);
		
		var obj = this._customFormElements[id];
		if(obj == null) return;
		this._customFormElements[id] = null;

		var ddNode = obj.element.domNode.parentNode;
		obj.element.destroyRecursive(false);
		
		dojo.destroy(ddNode);
		dojo.destroy(obj.labelNode);
	}
	
});