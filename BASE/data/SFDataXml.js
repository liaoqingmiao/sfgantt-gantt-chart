	/**
	采用向日葵甘特图指定的XML格式作为数据源的数据适配器对象，这种xml格式是在ms project的xml格式的基础上，进行一些节点的调整以提升Web性能，并支持按需下载技术；
	@see 关于此格式的详细说明请参考 <a href="http://www.51diaodu.cn/sfgantt/docs/sfgantt%20xml%20introduce/sfgantt_schema.html">向日葵甘特图XML格式说明</a>.
	@extends SFDataXmlBase
	@class
	*/
	function SFDataXml(url,config)
	{
		SFGlobal.setProperty(this,{taskReader:{},taskWriter:{},resourceReader:{},resourceWriter:{},linkReader:{},linkWriter:{},assignmentReader:{},assignmentWriter:{}});
		var doc=(typeof(url)=="string")?this.loadUrl(url):url;
		config=config?config:new SFConfig();
		/**
		是否将数据的更改写入到源文件之中，如果设置为true，就可以获取最终修改后的XML文件，不过会降低性能
		@name SFDataXml#saveChange
		@type Bool
		@default false
		*/
		SFConfig.applyProperty(this,config.getConfigObj("SFDataXml"));
		SFGlobal.setProperty(this,{doc:doc,config:config});
		this.addDefaultProperty();
	}
	SFDataXml.prototype=new window.SFDataXmlBase();
	/**
	@private
	数据源的初始化，每个数据源的实现都会重写此方法
	*/
	SFDataXml.prototype.initialize=function()
	{
		SFDataXmlBase.prototype.initialize.apply(this,arguments);
	}
	/**
	@private
	加载指定URL的XML文档并返回，这是一个同步的加载过程，直接返回结果
	@param {String} url xml文档的URL地址
	@returns {XmlDocument} 返回加载完成后的XML文档
	*/
	SFDataXml.prototype.loadUrl=function(url)
	{
		var doc;
		function onXmlLoad(d){doc=d;}
		SFAjax.loadXml(url,onXmlLoad,false);
		return doc;
	}
	/**
	@private
	返回数据源使用的工作日历对象
	@returns {SFWorkingCalendar}
	*/
	SFDataXml.prototype.getCalendar=function()
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
	读取并返回根任务
	@returns {SFDataTask}
	*/
	SFDataXml.prototype.readRootTask=function()
	{
		var rootTaskNode=SFAjax.selectSingleNode(this.doc.documentElement,"Task");
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
	SFDataXml.prototype.readTaskFirstChild=function(task)
	{
		if(!task.node){return null;}
		if(task.node.getAttribute("ChildrenDataUrl"))//如果节点是一个大纲,并且存在需要下载的数据
		{
			var doc=this.loadUrl(task.node.getAttribute("ChildrenDataUrl"));
			task.node.removeAttribute("ChildrenDataUrl");
			var tasksNode=SFAjax.selectSingleNode(task.node,"Tasks");
			if(!tasksNode)
			{
				tasksNode=task.node.ownerDocument.createElement("Tasks");
				task.node.appendChild(tasksNode);
			}
			while(doc.documentElement.firstChild)
			{
				var taskNode=doc.documentElement.firstChild;
				doc.documentElement.removeChild(taskNode);
				tasksNode.appendChild(taskNode);
			}
		}
		return this.readTask(SFAjax.selectSingleNode(task.node,"Tasks/Task"));
	}
	/**
	@private
	读取并返回指定任务的下一个同级任务，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataTask}
	*/
	SFDataXml.prototype.readTaskNextSibling=function(task)
	{
		if(!task.node){return null;}
		if(task.node.getAttribute("NextSiblingDataUrl"))//如果节点是一个大纲,并且存在需要下载的数据
		{
			var doc=this.loadUrl(task.node.getAttribute("NextSiblingDataUrl"));
			task.node.removeAttribute("NextSiblingDataUrl");
			var tasksNode=SFAjax.selectSingleNode(task.getParentTask().node,"Tasks");
			while(doc.documentElement.firstChild)
			{
				var taskNode=doc.documentElement.firstChild;
				doc.documentElement.removeChild(taskNode);
				tasksNode.appendChild(taskNode);
			}
		}
		return this.readTask(SFAjax.getNextSibling(task.node.nextSibling,"Task"));
	}
	/**
	@private
	读取并返回根资源
	@returns {SFDataResource}
	*/
	SFDataXml.prototype.readRootResource=function()
	{
		var rootResourceNode=SFAjax.selectSingleNode(this.doc.documentElement,"Resource");
		if(!rootResourceNode)
		{
			var resource=this.addResource();
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
	SFDataXml.prototype.readResourceFirstChild=function(resource)
	{
		if(!resource.node){return null;}
		if(resource.node.getAttribute("ChildrenDataUrl"))//如果节点是一个大纲,并且存在需要下载的数据
		{
			var doc=this.loadUrl(resource.node.getAttribute("ChildrenDataUrl"));
			resource.node.removeAttribute("ChildrenDataUrl");
			var resourcesNode=SFAjax.selectSingleNode(resource.node,"Resources");
			if(!resourcesNode)
			{
				resourcesNode=resource.node.ownerDocument.createElement("Resources");
				resource.node.appendChild(resourcesNode);
			}
			while(doc.documentElement.firstChild)
			{
				var resourceNode=doc.documentElement.firstChild;
				doc.documentElement.removeChild(resourceNode);
				resourcesNode.appendChild(resourceNode);
			}
		}
		return this.readResource(SFAjax.selectSingleNode(resource.node,"Resources/Resource"));
	}
	/**
	@private
	读取并返回指定资源的下一个同级资源，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataResource}
	*/
	SFDataXml.prototype.readResourceNextSibling=function(resource)
	{
		if(!resource.node){return null;}
		if(resource.node.getAttribute("NextSiblingDataUrl"))//如果节点是一个大纲,并且存在需要下载的数据
		{
			var doc=this.loadUrl(resource.node.getAttribute("NextSiblingDataUrl"));
			resource.node.removeAttribute("NextSiblingDataUrl");
			var resourcesNode=SFAjax.selectSingleNode(resource.getParentResource().node,"Resources");
			while(doc.documentElement.firstChild)
			{
				var resourceNode=doc.documentElement.firstChild;
				doc.documentElement.removeChild(resourceNode);
				resourcesNode.appendChild(resourceNode);
			}
		}
		return this.readResource(SFAjax.getNextSibling(resource.node.nextSibling,"Resource"));
	}
	/**
	@private
	读取并返回指定任务的第一个链接，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataLink}
	*/
	SFDataXml.prototype.readTaskFirstLink=function(task)
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
	SFDataXml.prototype.readTaskNextLink=function(task,link)
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
	SFDataXml.prototype.readTaskFirstAssignment=function(task)
	{
		if(!task.node){return null;}
		return this.readTaskAssignment(task,SFAjax.selectSingleNode(task.node,"Assignments/Assignment"));
	}
	/**
	@private
	读取并返回指定任务的下一个资源分配，如果不存在，则返回null
	@param {SFDataTask} task
	@param {SFDataAssignment} assignment
	@returns {SFDataAssignment}
	*/
	SFDataXml.prototype.readTaskNextAssignment=function(task,assignment)
	{
		if(!assignment.node){return null;}
		return this.readTaskAssignment(task,SFAjax.getNextSibling(assignment.node.nextSibling,"Assignment"))
	}
	/**
	@private
	读取并返回指定资源的第一个分配，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataAssignment}
	*/
	SFDataXml.prototype.readResourceFirstAssignment=function(resource)
	{
		if(!resource.node){return null;}
		return this.readTaskAssignment(resource,SFAjax.selectSingleNode(resource.node,"Assignments/Assignment"));
	}
	/**
	@private
	读取并返回指定资源的下一个资源分配，如果不存在，则返回null
	@param {SFDataResource} resource
	@param {SFDataAssignment} assignment
	@returns {SFDataAssignment}
	*/
	SFDataXml.prototype.readResourceNextAssignment=function(resource,assignment)
	{
		if(!assignment.node){return null;}
		return this.readTaskAssignment(resource,SFAjax.getNextSibling(assignment.node.nextSibling,"Assignment"))
	}
	/**
	@private
	在指定的位置插入节点
	@param {XmlNode} node 需要插入的xml节点
	@param {SFDataElement} parent 插入位置的父元素,如果直接在文档根节点下插入，则为null
	@param {SFDataElement} previousSibling 插入位置的上一个同级元素,如果是父元素的第一个子元素，则为null
	@param {String} gName 节点组名称
	*/
	SFDataXml.prototype.insertNode=function(node,parent,previousSibling,gName)
	{
		if(parent)
		{
			var parentNode=SFAjax.selectSingleNode(parent.node,gName);
			if(!parentNode)
			{
				parentNode=parent.node.ownerDocument.createElement(gName);
				parent.node.appendChild(parentNode);
			}
			if(previousSibling)
			{
				if(previousSibling.node.nextSibling)
				{
					parentNode.insertBefore(node,previousSibling.node.nextSibling);
				}
				else
				{
					parentNode.appendChild(node);
				}
			}
			else
			{
				parentNode.insertBefore(node,parentNode.firstChild);
			}
		}
		else
		{
			this.doc.documentElement.appendChild(node);
		}
	}
	/**
	@private
	在指定的位置插入新任务并返回
	@param {SFDataTask} parent 新任务的父任务
	@param {SFDataTask} pTask 新任务的上一个同级任务，如果新任务是父任务的第一个子任务，则为null
	@returns {SFDataTask}
	*/
	SFDataXml.prototype.addTask=function(parent,pTask)
	{
		var task=new SFDataTask();
		if(this.saveChange)
		{
			var node=parent.node.ownerDocument.createElement("Task");
			this.insertNode(node,parent,pTask,"Tasks");
			task.node=node;
		}
		return task;
	}
	/**
	@private
	删除指定的任务
	@param {SFDataTask} task 需要删除的任务
	*/
	SFDataXml.prototype.deleteTask=function(task)
	{
		if(!this.saveChange){return;}
		task.node.parentNode.removeChild(task.node);
	}
	/**
	@private
	移动任务到指定的位置
	@param {SFDataTask} task 需要移动的任务
	@param {SFDataTask} parent 新位置的父任务
	@param {SFDataTask} pTask 新位置的上一个同级任务，如果新位置是父任务的第一个子任务，则为null
	*/
	SFDataXml.prototype.moveTask=function(task,parentTask,pTask)
	{
		if(!this.saveChange){return;}
		task.node.parentNode.removeChild(task.node);
		this.insertNode(task.node,parentTask,pTask,"Tasks");
	}
	/**
	@private
	在指定的位置插入新资源并返回
	@param {SFDataResource} parent 新资源的父资源
	@param {SFDataResource} pResource 新资源的上一个同级资源，如果新资源是父资源的第一个子资源，则为null
	@returns {SFDataResource}
	*/
	SFDataXml.prototype.addResource=function(parent,pResource)
	{
		var resource=new SFDataResource();
		if(this.saveChange)
		{
			var node=parent.node.ownerDocument.createElement("Resource");
			this.insertNode(node,parent,pResource,"Resources");
			resource.node=node;
		}
		return resource;
	}
	/**
	@private
	删除指定的资源
	@param {SFDataResource} resource 需要删除的资源
	*/
	SFDataXml.prototype.deleteResource=function(resource)
	{
		if(!this.saveChange){return;}
		resource.node.parentNode.removeChild(resource.node);
	}
	/**
	@private
	移动资源到指定的位置
	@param {SFDataResource} resource 需要移动的资源
	@param {SFDataResource} parent 新位置的父资源
	@param {SFDataResource} pResource 新位置的上一个同级资源，如果新位置是父资源的第一个子资源，则为null
	*/
	SFDataXml.prototype.moveResource=function(resource,parentResource,pResource)
	{
		if(!this.saveChange){return;}
		resource.node.parentNode.removeChild(resource.node);
		this.insertNode(resource.node,parentResource,pResource,"Resources");
	}
	/**
	@private
	在指定的任务之间添加链接并返回
	@param {SFDataTask} selfTask 链接的后置任务
	@param {SFDataTask} preTask 链接的前置任务
	@param {Number} type 链接的类型，请参看{@link SFDataLink#Type}
	@returns {SFDataLink}
	*/
	SFDataXml.prototype.addLink=function(selfTask,preTask,type)
	{
		var link=new SFDataLink();
		if(this.saveChange)
		{
			var doc=selfTask.node.ownerDocument;
			var node=doc.createElement("PredecessorLink");
			var child=doc.createElement("PredecessorUID");
			SFAjax.setNodeValue(child,preTask.UID);
			node.appendChild(child);
			var child=doc.createElement("Type");
			SFAjax.setNodeValue(child,type);
			node.appendChild(child);
			link.node=node;
			link.setProperty("Type",type);
			var linksNode=SFAjax.selectSingleNode(selfTask.node,"Links");
			if(!linksNode)
			{
				linksNode=selfTask.node.ownerDocument.createElement("Links");
				selfTask.node.appendChild(linksNode);
			}
			linksNode.appendChild(node);
		}
		return link;
	}
	/**
	@private
	删除指定的链接
	@param {SFDataLink} link 需要删除的链接
	*/
	SFDataXml.prototype.deleteLink=function(link)
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
	SFDataXml.prototype.addAssignment=function(task,resource,units)
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
			var child=doc.createElement("Units");
			SFAjax.setNodeValue(child,units);
			node.appendChild(child);
			assignment.node=node;
			var assignmentsNode=SFAjax.selectSingleNode(task.node,"Assignments");
			if(!assignmentsNode)
			{
				assignmentsNode=task.node.ownerDocument.createElement("Assignments");
				task.node.appendChild(assignmentsNode);
			}
			assignmentsNode.appendChild(node);
		}
		return assignment;
	}
	/**
	@private
	删除指定的资源分配
	@param {SFDataAssignment} assignment 需要删除的资源分配
	*/
	SFDataXml.prototype.deleteAssignment=function(assignment)
	{
		if(!this.saveChange){return;}
		assignment.node.parentNode.removeChild(assignment.node);
	}
	window.SFDataXml=SFDataXml;