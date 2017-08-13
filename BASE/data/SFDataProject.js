	/**
	采用MS Project的XML格式作为数据源的数据适配器对象，用来处理对Project的Xml文件格式的支持
	SFDataProject不支持将任务或资源的移动操作保存到XML文件；
	@param {XmlDocument} [doc] 包含数据的XML对象，如果不存在，会新建一个空的XML数据对象
	@extends SFDataXmlBase
	@class
	*/
	function SFDataProject(doc,config)
	{
		SFGlobal.setProperty(this,{taskReader:{},taskWriter:{},resourceReader:{},resourceWriter:{},linkReader:{},linkWriter:{},assignmentReader:{},assignmentWriter:{}});
		config=config?config:new SFConfig();
		SFConfig.applyProperty(this,config.getConfigObj("SFDataProject"));
		SFGlobal.setProperty(this,{doc:doc,config:config});
		/**
		是否将数据的更改写入到源文件之中，如果设置为true，就可以获取最终修改后的XML文件，不过会降低性能
		@name SFDataProject#saveChange
		@type Bool
		@default false
		*/
		this.addDefaultProperty();
	}
	SFDataProject.prototype=new window.SFDataXmlBase();
	/**
	@private
	数据源的初始化，每个数据源的实现都会重写此方法
	*/
	SFDataProject.prototype.initialize=function()
	{
		SFDataXmlBase.prototype.initialize.apply(this,arguments);
	}
	/**
	@private
	初始化数据源的XML文档
	@param {XmlDocument} doc
	*/
	SFDataProject.prototype.loadXml=function(doc)
	{
		if(doc){this.doc=doc;}
		doc=this.doc;
		if(!doc)
		{
			this.doc=doc=SFAjax.createDocument();
		}
		if(!doc.documentElement)
		{
			doc.appendChild(doc.createElement("Project"));
		}
		var node=this.doc.documentElement,child=node.firstChild;
		while(child)
		{
			switch(child.nodeName)
			{
				case "Tasks":
					this.tasksNode=child;
					break;
				case "Resources":
					this.resourcesNode=child;
					break;
				case "Assignments":
					this.assignmentsNode=child;
					break;
				case "ExtendedAttributes":
					this.addExtendedAttributes(child);
					break;
			}
			child=child.nextSibling
		}
		this.loaded=true;
	}
	/**
	@private
	返回数据源使用的工作日历对象
	@returns {SFWorkingCalendar}
	*/
	SFDataProject.prototype.getCalendar=function()
	{
		var calId;
		var node=SFAjax.selectSingleNode(this.doc.documentElement,"CalendarUID");
		if(node)
		{
			calId=SFAjax.getNodeValue(node);
			var calsNode=SFAjax.selectSingleNode(this.doc.documentElement,"Calendars");
			for(var child=calsNode.firstChild;child;child=child.nextSibling)
			{
				if(child.nodeName!="Calendar"){continue;}
				if(SFAjax.getNodeValue(SFAjax.selectSingleNode(child,"UID"))==calId)
				{
					return this.readCalendar(child); 
				}
			}
		}
		return SFWorkingCalendar.getCalendar("Standard");
	}
	/**
	@private
	获得用来包含所有任务的Tasks节点，如果不存在，则创建
	@returns {XmlNode}
	*/
	SFDataProject.prototype.getTasksNode=function()
	{
		if(!this.loaded){this.loadXml()}
		if(!this.tasksNode)
		{
			this.tasksNode=this.doc.createElement("Tasks");
			this.doc.documentElement.appendChild(this.tasksNode);
		}
		return this.tasksNode;
	}
	/**
	@private
	获得用来包含所有资源的Resources节点，如果不存在，则创建
	@returns {XmlNode}
	*/
	SFDataProject.prototype.getResourcesNode=function()
	{
		if(!this.loaded){this.loadXml()}
		if(!this.resourcesNode)
		{
			this.resourcesNode=this.doc.createElement("Resources");
			this.doc.documentElement.appendChild(this.resourcesNode);
		}
		return this.resourcesNode;
	}
	/**
	@private
	获得用来包含所有资源分配的Assignments节点，如果不存在，则创建
	@returns {XmlNode}
	*/
	SFDataProject.prototype.getAssignmentsNode=function()
	{
		if(!this.loaded){this.loadXml()}
		if(!this.assignmentsNode)
		{
			this.assignmentsNode=this.doc.createElement("Assignments");
			this.doc.documentElement.appendChild(this.assignmentsNode);
		}
		return this.assignmentsNode;
	}
	/**
	@private
	读取并返回根任务
	@returns {SFDataTask}
	*/
	SFDataProject.prototype.readRootTask=function()
	{
		var rootTaskNode=SFAjax.getNextSibling(this.getTasksNode().firstChild,"Task");
		if(!rootTaskNode)
		{
			var task=this.addTask();
			return task;
		}
		return this.readTask(rootTaskNode);
	}
	/**
	@private
	读取并返回指定任务的第一个子任务，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataTask}
	*/
	SFDataProject.prototype.readTaskFirstChild=function(task)
	{
	    if(!task.node){return null;}
		var selfLevel=task.OriginalLevel;
		var node=SFAjax.getNextSibling(task.node.nextSibling,"Task");
		if(node)
		{
			var level=SFAjax.selectSingleNode(node,"OutlineLevel")?SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"OutlineLevel")):SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"OutlineNumber")).split(".").length;
			if(level>selfLevel)
			{
				return this.readTask(node);
			}
		}
		return null;
	}
	/**
	@private
	读取并返回指定任务的下一个同级任务，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataTask}
	*/
	SFDataProject.prototype.readTaskNextSibling=function(task)
	{
	     if(!task.node){return null;}
		var selfLevel=task.OriginalLevel;
		//不停对下一个兄弟节点进行遍历
		for(var node=task.node.nextSibling;node;node=node.nextSibling)
		{
			if(node.nodeName!="Task"){continue;}
			//先找出大纲
			var level=SFAjax.selectSingleNode(node,"OutlineLevel")?SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"OutlineLevel")):SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"OutlineNumber")).split(".").length;
			if(level>selfLevel){continue;}//如果是当前节点的子节点，则不理会
			if(level==selfLevel)//如果是同级节点
			{
				return this.readTask(node);
			}
			break;
		}
		return null;
	}
	/**
	@private
	读取并返回根资源
	@returns {SFDataResource}
	*/
	SFDataProject.prototype.readRootResource=function()
	{
		var rootResourceNode=this.getResourcesNode().firstChild;
		if(!rootResourceNode)
		{
			var resource=this.addResource("0");
			return resource;
		}
		return this.readResource(rootResourceNode);
	}
	/**
	@private
	读取并返回指定资源的第一个子资源，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataResource}
	*/
	SFDataProject.prototype.readResourceFirstChild=function(resource)
	{
	     if(!resource.node){return null;}
		if(resource.node!=SFAjax.getNextSibling(this.getResourcesNode().firstChild,"Resource")){return null;}
		return this.readResource(SFAjax.getNextSibling(resource.node.nextSibling,"Resource"));
	}
	/**
	@private
	读取并返回指定资源的下一个同级资源，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataResource}
	*/
	SFDataProject.prototype.readResourceNextSibling=function(resource)
	{
	    if(!resource.node){return null;}
		if(resource.node==SFAjax.getNextSibling(this.getResourcesNode().firstChild,"Resource")){return null;}
		return this.readResource(SFAjax.getNextSibling(resource.node.nextSibling,"Resource"));
	}
	/**
	@private
	读取并返回指定任务的第一个链接，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataLink}
	*/
	SFDataProject.prototype.readTaskFirstLink=function(task)
	{
		var node,taskNode=task.node;
		if(!taskNode){return null;}
		for(node=taskNode.firstChild;node;node=node.nextSibling){if(node.nodeName=="PredecessorLink" || node.nodeName=="SuccessorLink"){break;}}
		if(node==null){node=SFAjax.selectSingleNode(taskNode,"Links/*");}
		return this.readTaskLink(task,node);
	}
	/**
	@private
	读取并返回指定任务的下一个链接，如果不存在，则返回null
	@param {SFDataTask} task
	@param {SFDataLink} link
	@returns {SFDataLink}
	*/
	SFDataProject.prototype.readTaskNextLink=function(task,link)
	{
		var node,linkNode=link.node;
		if(!linkNode){return null;}
		for(node=linkNode.nextSibling;node;node=node.nextSibling){if(node.nodeName=="PredecessorLink" || node.nodeName=="SuccessorLink"){break;}}
		if(!node && linkNode.parentNode.nodeName!="Links")
		{
			node=SFAjax.selectSingleNode(linkNode,"../Links/*");
		}
		return this.readTaskLink(task,node);
	}
	/**
	@private
	读取并返回指定任务的第一个资源分配，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataAssignment}
	*/
	SFDataProject.prototype.readTaskFirstAssignment=function(task)
	{
		var uid=task.UID;
		for(var node=this.getAssignmentsNode().firstChild;node;node=node.nextSibling)
		{
			if(node.nodeName!="Assignment"){continue;}
			if(SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"TaskUID"))==uid)
			{
				return this.readTaskAssignment(task,node);
			}
		}
		return null;
	}
	/**
	@private
	读取并返回指定任务的下一个资源分配，如果不存在，则返回null
	@param {SFDataTask} task
	@param {SFDataAssignment} assignment
	@returns {SFDataAssignment}
	*/
	SFDataProject.prototype.readTaskNextAssignment=function(task,assignment)
	{
	    if(!assignment.node){return null;}
		var uid=task.UID;
		for(var node=assignment.node.nextSibling;node;node=node.nextSibling)
		{
			if(node.nodeName!="Assignment"){continue;}
			if(SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"TaskUID"))==uid)
			{
				return this.readTaskAssignment(task,node);
			}
		}
		return null;
	}
	/**
	@private
	读取并返回指定资源的第一个分配，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataAssignment}
	*/
	SFDataProject.prototype.readResourceFirstAssignment=function(resource)
	{
		var uid=resource.UID;
		for(var node=this.getAssignmentsNode().firstChild;node;node=node.nextSibling)
		{
			if(node.nodeName!="Assignment"){continue;}
			if(SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"ResourceUID"))==uid)
			{
				return this.readResourceAssignment(resource,node);
			}
		}
		return null;
	}
	/**
	@private
	读取并返回指定资源的下一个资源分配，如果不存在，则返回null
	@param {SFDataResource} resource
	@param {SFDataAssignment} assignment
	@returns {SFDataAssignment}
	*/
	SFDataProject.prototype.readResourceNextAssignment=function(resource,assignment)
	{
	    if(!assignment.node){return null;}
		var uid=resource.UID;
		for(var node=assignment.node.nextSibling;node;node=node.nextSibling)
		{
			if(node.nodeName!="Assignment"){continue;}
			if(SFAjax.getNodeValue(SFAjax.selectSingleNode(node,"ResourceUID"))==uid)
			{
				return this.readResourceAssignment(resource,node);
			}
		}
		return null;
	}
	/**
	@private
	在指定的位置插入新任务并返回
	@param {SFDataTask} parent 新任务的父任务
	@param {SFDataTask} pTask 新任务的上一个同级任务，如果新任务是父任务的第一个子任务，则为null
	@returns {SFDataTask}
	*/
	SFDataProject.prototype.addTask=function(parent,pTask)
	{
		var task=new SFDataTask();
		if(this.saveChange)
		{
			var tasksNode=this.getTasksNode();
			var node=tasksNode.ownerDocument.createElement("Task");
			if(parent)
			{
				var beforeNode=pTask?pTask.node:parent.node;
				if(beforeNode.nextSibling)
				{
					tasksNode.insertBefore(node,beforeNode.nextSibling);
				}
				else
				{
					tasksNode.appendChild(node);
				}
			}
			else
			{
				tasksNode.insertBefore(node,tasksNode.firstChild);
			}
			task.node=node;
		}
		return task;
	}
	/**
	@private
	删除指定的任务
	@param {SFDataTask} task 需要删除的任务
	*/
	SFDataProject.prototype.deleteTask=function(task)
	{
		if(!this.saveChange){return;}
		task.node.parentNode.removeChild(task.node);
	}
	/**
	@private
	在指定的位置插入新资源并返回
	@param {SFDataResource} parent 新资源的父资源
	@param {SFDataResource} pResource 新资源的上一个同级资源，如果新资源是父资源的第一个子资源，则为null
	@returns {SFDataResource}
	*/
	SFDataProject.prototype.addResource=function(parent,pResource)
	{
		var resource=new SFDataResource();
		if(this.saveChange)
		{
			var resourcesNode=this.getResourcesNode();
			var node=resourcesNode.ownerDocument.createElement("Resource");
			var beforeNode=pResource?pResource.node:parent.node;
			if(beforeNode.nextSibling)
			{
				resourcesNode.insertBefore(node,beforeNode.nextSibling);
			}
			else
			{
				resourcesNode.appendChild(node);
			}
			resource.node=node;
		}
		return resource;
	}
	/**
	@private
	删除指定的资源
	@param {SFDataResource} resource 需要删除的资源
	*/
	SFDataProject.prototype.deleteResource=function(resource)
	{
		if(!this.saveChange){return;}
		resource.node.parentNode.removeChild(resource.node);
	}
	/**
	@private
	在指定的任务之间添加链接并返回
	@param {SFDataTask} selfTask 链接的后置任务
	@param {SFDataTask} preTask 链接的前置任务
	@param {Number} type 链接的类型，请参看{@link SFDataLink#Type}
	@returns {SFDataLink}
	*/
	SFDataProject.prototype.addLink=function(selfTask,preTask,type)
	{
		var link=new SFDataLink();
		if(this.saveChange)
		{
			var doc=selfTask.node.ownerDocument;
			var node=doc.createElement("PredecessorLink");
			var child=doc.createElement("PredecessorUID");
			SFAjax.setNodeValue(child,preTask.UID);
			node.appendChild(child);
			link.node=node;
			if(type)
			{
				var child=doc.createElement("Type");
				SFAjax.setNodeValue(child,type);
				node.appendChild(child);
				link.setProperty("Type",type);
			}
			selfTask.node.appendChild(node);
		}
		return link;
	}
	/**
	@private
	删除指定的链接
	@param {SFDataLink} link 需要删除的链接
	*/
	SFDataProject.prototype.deleteLink=function(link)
	{
		if(!this.saveChange){return;}
		link.node.parentNode.removeChild(link.node);
	}
	/**
	@private
	添加一个资源分配并返回
	@param {SFDataTask} task 分配的任务
	@param {SFDataResource} resource 分配的资源
	@param {Number} unit 资源的占用比例，0-1的小数
	@returns {SFDataAssignment}
	*/
	SFDataProject.prototype.addAssignment=function(task,resource,units)
	{
		var assignment=new SFDataAssignment();
		if(this.saveChange)
		{
			var doc=this.doc;
			var node=doc.createElement("Assignment");
			var child=doc.createElement("TaskUID");
			SFAjax.setNodeValue(child,task.UID);
			node.appendChild(child);
			var child=doc.createElement("ResourceUID");
			SFAjax.setNodeValue(child,resource.UID);
			node.appendChild(child);
			if(units)
			{
				var child=doc.createElement("Units");
				SFAjax.setNodeValue(child,units);
				node.appendChild(child);
				assignment.setProperty("Units",units);
			}
			assignment.node=node;
			this.getAssignmentsNode().appendChild(node);
		}
		return assignment;
	}
	/**
	@private
	删除指定的资源分配
	@param {SFDataAssignment} assignment 需要删除的资源分配
	*/
	SFDataProject.prototype.deleteAssignment=function(assignment)
	{
		if(!this.saveChange){return;}
		assignment.node.parentNode.removeChild(assignment.node);
	}
	window.SFDataProject=SFDataProject;