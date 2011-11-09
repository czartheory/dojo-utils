/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views.CommunityMember");

dojo.require("czarTheory.dijits.views._EntityView");

dojo.declare("czarTheory.dijits.views.CommunityMember", czarTheory.dijits.views._EntityView, {
	
	templateString: dojo.cache('czarTheory.dijits.views', 'CommunityMember.html'),
	
	attributeMap: {
		id: "",
		emailOrId: {node: "labelNode", type:"innerHTML"},
		communityRole: {node: "cRoleNode", type:"innerHTML"},
		appraisalRole: {node: "aRoleNode", type:"innerHTML"}
	}
});