	/**
	这是一个甘特图功能控件，本控件实现剪切板的功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttClipboardControl()
	{
	}
	SFGanttClipboardControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttClipboardControl.prototype.initialize=function(gantt)
	{
		if(gantt.disableClipboard || !window.clipboardData){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttClipboardControl"));
		SFGlobal.setProperty(this,{gantt:gantt});
		SFGlobal.setProperty(gantt,{
			copyTask:SFEvent.getCallback(this,this.copyTask),
			pasteTask:SFEvent.getCallback(this,this.pasteTask),
			canPasteTask:SFEvent.getCallback(this,this.canPasteTask)
		});
		return true;
	}
	/**
	获取用来序列化XML的对象
	@private
	*/
	SFGanttClipboardControl.prototype.getXml=function()
	{
		if(!this.xml)
		{
			var adapter=this.gantt.getData().adapter;
			if(false && (adapter instanceof SFDataXmlBase))
			{
				this.xml=adapter;
			}
			else
			{
				this.xml=new SFDataXml(SFAjax.createDocument());
				this.xml.initialize();
			}
		}
		return this.xml;
	}
	/**
	读取剪切板XMl文本数据
	@returns {String}
	*/
	SFGanttClipboardControl.prototype.getData=function()
	{
		var data=window.clipboardData.getData("Text");
		if(!data){return null;}
		try{
			var node=SFAjax.createDocument(data);
			if(node.documentElement){return node.documentElement;}
		}catch(e){}
		return null
	}
	/**
	复制当前任务到剪切板
	*/
	SFGanttClipboardControl.prototype.copyTask=function()
	{
		var gantt=this.gantt;
		if(!gantt.getFocusElement){return false;}
		var task=gantt.getFocusElement();
		if(!task){return false;}
		//复制任务
		var cTask=new SFDataTask(),
			xml=this.getXml(),
			ignoreProperty=(this.taskClipboardIgnoreProperty||"").split(",");
		for(var key in task){if(task.hasOwnProperty(key)){cTask[key]=task[key]};}
		cTask.node=cTask.node?cTask.node.cloneNode(false):xml.doc.createElement("Task");
		//序列化任务
		for(var proName in xml.taskWriter)
		{
			if(cTask[proName]!==undefined && !SFGlobal.findInArray(ignoreProperty,proName))
			{
				xml.updateItem(xml.taskWriter,cTask,proName,cTask[proName]);
			}
		}
		window.clipboardData.setData("Text",SFAjax.getXmlString(cTask.node));
		return true;
	}
	/**
	粘贴剪切板任务到当前任务
	*/
	SFGanttClipboardControl.prototype.pasteTask=function()
	{
		if(!this.canPasteTask()){return false;}
		var gantt=this.gantt,
			node=this.getData(),
			xml=this.getXml(),
			cTask=xml.readTask(node),		//将剪切板临时任务
			task=gantt.getFocusElement(),
			ignoreProperty=(this.taskClipboardIgnoreProperty||"").split(",");
		//将剪切板临时任务属性设置到新任务
		for(var proName in xml.taskWriter)
		{
			if(cTask[proName]!==undefined && !SFGlobal.findInArray(ignoreProperty,proName))
			{
				task.setProperty(proName,cTask[proName]);
			}
		}
	}
	/**
	判断当前是否能进行任务的粘贴
	@returns {Bool} 如果能粘贴，则返回true
	*/
	SFGanttClipboardControl.prototype.canPasteTask=function()
	{
		var node=this.getData(),gantt=this.gantt;
		if(!gantt.getFocusElement){return false;}
		if(!gantt.getFocusElement()){return false;}
		if(!node || node.nodeName!="Task"){return false;}
		return true
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttClipboardControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.copyTask
		delete gantt.pasteTask
		delete gantt.canPasteTask
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttClipboardControl=SFGanttClipboardControl;