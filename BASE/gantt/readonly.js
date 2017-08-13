function setGanttReadOnly()
{
	var SFData=window.SFData;
	SFData.prototype.addModule=function(type)
	{
		this.modules.push(type);
		this.elementUids[type]={};
		this["get"+type+"ByUid"]=function(uid,force){return this.getElementByUid(type,uid,force);}
		this["register"+type]=function(element){return this.registerElement(type,element);}
		this["unregister"+type]=function(element){return this.unregisterElement(type,element);}
		this["canAdd"+type]=function(){return false;}
		this["canDelete"+type]=function(){return false;}
	}
	SFData.prototype.addTreeModule=function(type)
	{
		this.addModule(type);
		this["getRoot"+type]=function(item){return this.getRootElement(type);}
		this["read"+type+"FirstChild"]=function(item){return this.readElementFirstChild(type,item);}
		this["read"+type+"NextSibling"]=function(item){return this.readElementNextSibling(type,item);}
		this["get"+type+"ByOutline"]=function(outline){return this.getElementByOutline(type,outline);}
		this["compare"+type]=function(sItem,eItem){return this.compareElement(sItem,eItem);}
		this["unregister"+type]=function(element){return this.unregisterTreeElement(type,element);}
		this["canMove"+type]=function(element,pElement,preElement){return false;}
	}
	SFData.prototype.canMoveElement=function(){return false;}
	delete SFData.prototype.addElement;
	delete SFData.prototype.deleteElement;
	delete SFData.prototype.updateElement;
	delete SFData.prototype.addTreeElement;
	delete SFData.prototype.deleteTreeElement;
	delete SFData.prototype.moveElement;

	var SFDataAdapter=window.SFDataAdapter;
	delete SFDataAdapter.prototype.updateTask;
	delete SFDataAdapter.prototype.addTask;
	delete SFDataAdapter.prototype.deleteTask;
	delete SFDataAdapter.prototype.moveTask;
	delete SFDataAdapter.prototype.updateResource;
	delete SFDataAdapter.prototype.addResource;
	delete SFDataAdapter.prototype.deleteResource;
	delete SFDataAdapter.prototype.moveResource;
	delete SFDataAdapter.prototype.updateLink;
	delete SFDataAdapter.prototype.addLink;
	delete SFDataAdapter.prototype.deleteLink;
	delete SFDataAdapter.prototype.updateAssignment;
	delete SFDataAdapter.prototype.addAssignment;
	delete SFDataAdapter.prototype.deleteAssignment;

	var SFDataTask=window.SFDataTask;
	delete SFDataTask.prototype.addPredecessorLink;
	delete SFDataTask.prototype.addSuccessorLink;
	delete SFDataTask.prototype.addAssignment;

	var SFDataResource=window.SFDataResource;
	delete SFDataResource.prototype.addAssignment

	var SFDataXmlBase=window.SFDataXmlBase;
	delete SFDataXmlBase.prototype.updateItem
	delete SFDataXmlBase.prototype.updateTask
	delete SFDataXmlBase.prototype.updateLink
	delete SFDataXmlBase.prototype.updateResource
	delete SFDataXmlBase.prototype.updateAssignment

	var SFDataProject=window.SFDataProject;
	delete SFDataProject.prototype.addTask
	delete SFDataProject.prototype.deleteTask
	delete SFDataProject.prototype.addLink
	delete SFDataProject.prototype.deleteLink
	delete SFDataProject.prototype.addResource
	delete SFDataProject.prototype.deleteResource
	delete SFDataProject.prototype.addAssignment
	delete SFDataProject.prototype.deleteAssignment

	var SFDataXml=window.SFDataXml;
	delete SFDataXml.prototype.addTask
	delete SFDataXml.prototype.deleteTask
	delete SFDataXml.prototype.addLink
	delete SFDataXml.prototype.deleteLink
	delete SFDataXml.prototype.addResource
	delete SFDataXml.prototype.deleteResource
	delete SFDataXml.prototype.addAssignment
	delete SFDataXml.prototype.deleteAssignment
	delete SFDataXml.prototype.moveTask
	delete SFDataXml.prototype.moveResource

	var SFGantt=window.SFGantt;
	SFGantt.prototype.addMenuItems=function()
	{
		var names=this.config.getConfig("SFGantt/menuText");
		this.addContextMenuItem(function(ma){return (ma.type=="chart")?1:0},function(ma){ma.gantt.zoomIn();},names.ZoomIn,'icon_zoomin',"ZoomIn",551);
		this.addContextMenuItem(function(ma){return (ma.type=="chart")?1:0},function(ma){ma.gantt.zoomOut();},names.ZoomOut,'icon_zoomout',"ZoomOut",556);

		this.addContextMenuItem(function(ma){return (ma.type=="list" && ma.gantt.getFocusTask() && ma.gantt.getFocusTask().Start)?1:0},function(ma){ma.gantt.focusIntoView();},names.FocusIntoView,'icon_taskgoto',"FocusIntoView",601);

		this.addContextMenuItem(function(ma){return (ma.type=="column" && ma.gantt.mapBodyDiv.style.display=='none')?1:0},function(ma){ma.gantt.collapseMap();},names.ShowMap,null,'ShowMap',801);
		this.addContextMenuItem(function(ma){return (ma.type=="column" && ma.gantt.mapBodyDiv.style.display!='none')?1:0},function(ma){ma.gantt.collapseMap();},names.HideMap,null,'HideMap',806);
		this.addContextMenuItem(function(ma){return (ma.type=="column" && ma.gantt.listBodyDiv.style.display=='none')?1:0},function(ma){ma.gantt.collapseList();},names.ShowList,null,'ShowList',850);
		this.addContextMenuItem(function(ma){return (ma.type=="column" && ma.gantt.listBodyDiv.style.display!='none')?1:0},function(ma){ma.gantt.collapseList();},names.HideList,null,'HideList',856);

		this.addContextMenuItem(function(ma){return (ma.type=="logo")?1:0},function(ma){window.open("http://www.51diaodu.cn/sfgantt/help/");},names.Help,null,'Help',901);
		this.addContextMenuItem(function(ma){return (ma.type=="logo")?1:0},function(ma){window.open("http://www.51diaodu.cn/sfgantt/");},names.About,null,'About',951);
	//	this.addContextMenuItem(function(ma){return (ma.gantt.getFocusTask())?1:0},function(ma){ma.gantt.degradeSelectedTasks();},'任务信息','icon_taskinfo');

	}
	SFGantt.prototype.setData=function(data)
	{
		this.data=data;
		SFConfig.applyProperty(data,this.config.getConfigObj("SFData"));
		this.dataListeners=[
			SFEvent.bind(data,"aftertaskchange",this,this.onTaskChange),
			SFEvent.bind(data,"afterlinkupdate",this,this.onLinkUpdate)
		]
	}
	delete SFGantt.prototype.onTaskAdd;
	delete SFGantt.prototype.onTaskDelete;
	delete SFGantt.prototype.onTaskMove;
	delete SFGantt.prototype.onLinkAdd;
	delete SFGantt.prototype.onLinkDelete;
	delete SFGantt.prototype.onLinkAdd;
	delete SFGantt.prototype.addTask;
	delete SFGantt.prototype.checkTaskReadOnly;
	delete SFGantt.prototype.deleteTask;
	delete SFGantt.prototype.getTopSelectedTasks;
	delete SFGantt.prototype.upgradeSelectedTasks;
	delete SFGantt.prototype.degradeSelectedTasks;
	delete SFGantt.prototype.upgradeTask;
	delete SFGantt.prototype.degradeTask;
	delete SFGantt.prototype.addTasksLinks;
	delete SFGantt.prototype.removeTasksLinks;
}