	/**
	这是一个数据插件，本数据插件用来实现甘特图更改记录的功能，加载此插件之后，甘特图会记录所有的元素增加、删除、修改、移动的信息，并可以随时获取这些信息
	可以通过将这些信息发布到服务端以保证客户端信息和服务端总是同步，
	目前暂时只支持对任务和链接的更新进行记录
	@extends SFDataComponent
	@class
	*/
	function SFDataLogging(data)
	{//data参数是为了和以前的版本保持兼容
		this.setTaskFields("Name,Start,Finish,Summary,PercentComplete,Notes")
		this.setLinkFields("Type");
		this.clear();
		if(data){data.addComponent(this);}
	}
	SFDataLogging.prototype=new window.SFDataComponent();
	/**
	@private
	数据插件的初始化，每个插件的实现都会重写此方法
	@param {SFData} data
	*/
	SFDataLogging.prototype.initialize=function(data)
	{
		this.start(data);
	}
	/**
	开始记录数据的更改记录
	@param {SFData} data 参数是甘特数据对象
	*/
	SFDataLogging.prototype.start=function(data)
	{
		this.stop();
		this.listeners=[
			SFEvent.bind(data,"aftertaskadd",this,this.onTaskAdd),
			SFEvent.bind(data,"aftertaskdelete",this,this.onTaskDelete),
			SFEvent.bind(data,"aftertaskmove",this,this.onTaskMove),
			SFEvent.bind(data,"aftertaskchange",this,this.onTaskChange),

			SFEvent.bind(data,"afterlinkadd",this,this.onLinkAdd),
			SFEvent.bind(data,"afterlinkdelete",this,this.onLinkDelete),
			SFEvent.bind(data,"afterlinkchange",this,this.onLinkChange)
			];
	}
	/**
	清空已经记录的更改记录，例如在一批更改已经获取并发布到服务端之后，可以清空以避免重复处理
	*/
	SFDataLogging.prototype.clear=function()
	{
		SFGlobal.setProperty(this,{
			newTasks:[],updateTasks:[],moveTasks:[],deleteTasks:[],
			newLinks:[],updateLinks:[],deleteLinks:[]
		});
	}
	/**
	获得包含所有更新记录的XML文档，可用于向后台发送更改数据。
	@see 关于XML文档格式请参考<a href="http://www.51diaodu.cn/sfgantt/docs/logging/schema.html">更改记录XML文档格式</a>.
	@returns {XmlDocument}
	*/
	SFDataLogging.prototype.getXml=function()
	{
		var doc=SFAjax.createDocument();
		var root=doc.createElement("Log");
		doc.appendChild(root);
		//任务的添加、删除、移动、修改
		var elements=this.newTasks;
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"AddTasks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				if(!element.task.data){continue;}
				var elementNode=this.addNode(groupNode,"Task");
				this.addPropertyNode(elementNode,element.task,["UID"]);
				this.addPropertyNode(elementNode,element.task,element.fields);
				if(element.task.getParentTask()){this.addNode(elementNode,"ParentUID",element.task.getParentTask().UID);}
				if(element.task.getPreviousSibling()){this.addNode(elementNode,"PreviousUID",element.task.getPreviousSibling().UID);}
			}
		}
		var elements=this.updateTasks;
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"UpdateTasks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				if(!element.task.data){continue;}
				var elementNode=this.addNode(groupNode,"Task");
				this.addPropertyNode(elementNode,element.task,["UID"]);
				this.addPropertyNode(elementNode,element.task,element.fields);
			}
		}
		var elements=this.moveTasks;
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"MoveTasks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				if(!element.task.data){continue;}
				var elementNode=this.addNode(groupNode,"Task");
				this.addPropertyNode(elementNode,element.task,["UID"]);
				if(element.task.getParentTask()){this.addNode(elementNode,"ParentUID",element.task.getParentTask().UID);}
				if(element.task.getPreviousSibling()){this.addNode(elementNode,"PreviousUID",element.task.getPreviousSibling().UID);}
			}
		}
		var elements=this.deleteTasks;
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"DeleteTasks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				var elementNode=this.addNode(groupNode,"Task");
				this.addPropertyNode(elementNode,element.task,["UID"]);
			}
		}
		//链接的添加、删除、修改
		var elements=this.newLinks;
		
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"AddLinks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				if(!element.link.data){continue;}
				var elementNode=this.addNode(groupNode,"Link");
				this.addPropertyNode(elementNode,element.link,["UID","Type"]);
				//this.addPropertyNode(elementNode,element.link,element.fields);
				this.addPropertyNode(elementNode,element.link,element.fields);
				if(element.link.getPredecessorTask()){this.addNode(elementNode,"PredecessorUID",element.link.getPredecessorTask().UID);}
				if(element.link.getSuccessorTask()){this.addNode(elementNode,"SuccessorUID",element.link.getSuccessorTask().UID);}
			}
		}
		var elements=this.updateLinks;
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"UpdateLinks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				if(!element.link.data){continue;}
				var elementNode=this.addNode(groupNode,"Link");
				this.addPropertyNode(elementNode,element.link,["UID"]);
				if(element.link.getPredecessorTask()){this.addNode(elementNode,"PredecessorUID",element.link.getPredecessorTask().UID);}
				if(element.link.getSuccessorTask()){this.addNode(elementNode,"SuccessorUID",element.link.getSuccessorTask().UID);}
				this.addPropertyNode(elementNode,element.link,element.fields);
			}
		}
		var elements=this.deleteLinks;
		if(elements && elements.length>0)
		{
			var groupNode=this.addNode(root,"DeleteLinks");
			for(var i=0;i<elements.length;i++)
			{
				var element=elements[i];
				var elementNode=this.addNode(groupNode,"Link");
				this.addPropertyNode(elementNode,element.link,["UID"]);
			}
		}

		return doc;
	}
	/**
	只有部分属性的更改会被记录下来，这个函数用来设置任务需要记录的属性列表,
	如果不进行设置，默认为"Name,Start,Finish,Summary,PercentComplete,Notes"
	@param {String} fields 逗号分隔的任务属性名称列表，请参考{@link SFDataTask}的Fields项
	*/
	SFDataLogging.prototype.setTaskFields=function(fields)
	{
		this.taskFields=typeof(fields)=="string"?fields.split(","):fields;
	}
	/**
	在新增加任务之后进行记录
	@private
	@param {SFDataTask} task 新增加的任务
	*/
	SFDataLogging.prototype.onTaskAdd=function(task)
	{
		var obj=SFGlobal.findInArray(this.deleteTasks,task,function(a,b){return a.task==b});//支持Delete-Add模式
		if(obj){SFGlobal.deleteInArray(this.deleteTasks,obj);return;}
		obj=SFGlobal.findInArray(this.moveTasks,task,function(a,b){return a.task==b});//支持Move-Add模式
		if(obj){SFGlobal.deleteInArray(this.moveTasks,obj);}
		var fields=[];
		obj=SFGlobal.findInArray(this.updateTasks,task,function(a,b){return a.task==b});//支持Update-Add模式
		if(obj){SFGlobal.deleteInArray(this.updateTasks,obj);fields=obj.fields;}
		this.newTasks.push({task:task,fields:fields});
	}
	/**
	在删除任务之后进行记录
	@private
	@param {SFDataTask} task 删除的任务
	*/
	SFDataLogging.prototype.onTaskDelete=function(task)
	{
		var obj=SFGlobal.findInArray(this.newTasks,task,function(a,b){return a.task==b});//支持Add-Delete模式
		if(obj){SFGlobal.deleteInArray(this.newTasks,obj);return;}
		obj=SFGlobal.findInArray(this.moveTasks,task,function(a,b){return a.task==b});//支持Move-Delete模式
		if(obj){SFGlobal.deleteInArray(this.moveTasks,obj);}
		obj=SFGlobal.findInArray(this.updateTasks,task,function(a,b){return a.task==b});//支持Update-Delete模式
		if(obj){SFGlobal.deleteInArray(this.updateTasks,obj);}
		this.deleteTasks.push({task:task});
	}
	/**
	在移动任务之后进行记录
	@private
	@param {SFDataTask} task 移动的任务
	@param {SFDataTask} pTask 任务原位置的父任务
	@param {SFDataTask} preTask 任务原位置的前置任务
	*/
	SFDataLogging.prototype.onTaskMove=function(task,pTask,preTask)
	{
		if(SFGlobal.findInArray(this.deleteTasks,task,function(a,b){return a.task==b})){return;}//支持Delete-Move模式
		if(SFGlobal.findInArray(this.newTasks,task,function(a,b){return a.task==b})){return;}//支持Add-Move模式
		if(SFGlobal.findInArray(this.moveTasks,task,function(a,b){return a.task==b})){return;}//支持Move-Move模式
		this.moveTasks.push({task:task});
	}
	/**
	在任务被更改之后进行记录
	@private
	@param {SFDataTask} task 更改的任务
	@param {String} name 更改的属性名称
	@param {variant} value 更改后的属性值
	*/
	SFDataLogging.prototype.onTaskChange=function(task,name,value)
	{
		if(SFGlobal.findInArray(this.deleteTasks,task,function(a,b){return a.task==b})){return;}//支持Delete-Update模式
		if(!SFGlobal.findInArray(this.taskFields,name)){return;}
		var obj=SFGlobal.findInArray(this.newTasks,task,function(a,b){return a.task==b});//支持Add-Update模式
		if(!obj){obj=SFGlobal.findInArray(this.updateTasks,task,function(a,b){return a.task==b});}//支持Update-Update模式
		if(!obj){this.updateTasks.push(obj={task:task,fields:[]});}
		if(SFGlobal.findInArray(obj.fields,name)){return;}
		obj.fields.push(name);
	}
	/**
	只有部分属性的更改会被记录下来，这个函数用来设置链接需要记录的属性列表,
	如果不进行设置，默认为"Type"
	@param {String} fields 逗号分隔的链接属性名称列表，请参考{@link SFDataLink}的Fields项
	*/
	SFDataLogging.prototype.setLinkFields=function(fields)
	{
		this.linkFields=typeof(fields)=="string"?fields.split(","):fields;
	}
	/**
	在新增加链接之后进行记录
	@private
	@param {SFDataLink} link 新增加的链接
	*/
	SFDataLogging.prototype.onLinkAdd=function(link)
	{
		var obj=SFGlobal.findInArray(this.deleteLinks,link,function(a,b){return a.link==b});//支持Delete-Add模式
		if(obj){SFGlobal.deleteInArray(this.deleteLinks,obj);return;}
		var fields=[];
		obj=SFGlobal.findInArray(this.updateLinks,link,function(a,b){return a.link==b});//支持Update-Add模式
		if(obj){SFGlobal.deleteInArray(this.updateLinks,obj);fields=obj.fields;}
		this.newLinks.push({link:link,fields:fields});
		
	}
	/**
	在删除链接之后进行记录
	@private
	@param {SFDataLink} link 删除的链接
	*/
	SFDataLogging.prototype.onLinkDelete=function(link)
	{
		var obj=SFGlobal.findInArray(this.newLinks,link,function(a,b){return a.link==b});//支持Add-Delete模式
		if(obj){SFGlobal.deleteInArray(this.newLinks,obj);return;}
		obj=SFGlobal.findInArray(this.updateLinks,link,function(a,b){return a.link==b});//支持Update-Delete模式
		if(obj){SFGlobal.deleteInArray(this.updateLinks,obj);}
		this.deleteLinks.push({link:link});
	}
	/**
	在更改链接之后进行记录
	@private
	@param {SFDataLink} link 更改的链接
	@param {String} name 更改的属性名称
	@param {variant} value 更改后的属性值
	*/
	SFDataLogging.prototype.onLinkChange=function(link,name,value)
	{
		if(SFGlobal.findInArray(this.deleteLinks,link,function(a,b){return a.link==b})){return;}//支持Delete-Update模式
		if(!SFGlobal.findInArray(this.linkFields,name)){return;}
		var obj=SFGlobal.findInArray(this.newLinks,link,function(a,b){return a.link==b});//支持Add-Update模式
		if(!obj){obj=SFGlobal.findInArray(this.updateLinks,link,function(a,b){return a.link==b});}//支持Update-Update模式
		if(!obj){this.updateLinks.push(obj={link:link,fields:[]});}
		if(SFGlobal.findInArray(obj.fields,name)){return;}
		obj.fields.push(name);
	}
	/**
	为节点添加一个指定名称名称和值的子节点
	@private
	@param {XmlNode} parentNode
	@param {String} name 子节点名称
	@param {variant} value 子节点的值
	@returns {XmlNode} 返回新增加的节点
	*/
	SFDataLogging.prototype.addNode=function(parentNode,name,value)
	{
		var child=parentNode.ownerDocument.createElement(name);
		if(value!=null)
		{
			child.appendChild(parentNode.ownerDocument.createTextNode(this.pack(value)));
		}
		parentNode.appendChild(child);
		return child;
	}
	/**
	添加指定元素的多个属性节点
	@private
	@param {XmlNode} node
	@param {SFDataElement} element
	@param {String[]} property 属性名称数组
	*/
	SFDataLogging.prototype.addPropertyNode=function(node,element,property)
	{
		property=property?property:["UID"]
		for(var i=property.length-1;i>=0;i--)
		{
			this.addNode(node,property[i],element[property[i]]);
		}
	}
	/**
	暂停记录，暂停之后，不会自动的清空原有的更新记录
	*/
	SFDataLogging.prototype.stop=function()
	{
		if(!this.listeners){return;}
		var listener;
		while(listener=this.listeners.pop()){SFEvent.removeListener(listener);}
	}
	/**
	将属性值转化为字符串以便写入到XML之中
	@private
	@param {variant} value 属性值
	@returns {String}
	*/
	SFDataLogging.prototype.pack=function(value)
	{
		switch(typeof(value))
		{
			case "boolean":
				return value?'1':'0';
			case "object":
				if(value.constructor==Date)
				{
					return SFGlobal.getDateString(value,"s");
				}
				break;
		}
		return value.toString();
	}
	/**
	销毁此插件以释放内存
	*/
	SFDataLogging.prototype.depose=function()
	{
		this.stop();
		this.clear();
		for(var key in this){this[key]=null;}
	}
	window.SFDataLogging=SFDataLogging;