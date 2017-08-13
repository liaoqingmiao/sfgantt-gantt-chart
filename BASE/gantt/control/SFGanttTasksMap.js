	/**
	这是一个甘特图功能控件，本控件用来实现任务横道图的绘制
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttTasksMap(config)
	{
		SFConfig.applyProperty(this,config);
		this.items=[];
	}
	SFGanttTasksMap.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTasksMap.prototype.initialize=function(gantt)
	{
		if(!gantt.getMapPanel){return false;}
		SFGlobal.setProperty(this,{
			gantt:gantt,
			taskStyles:gantt.config.getConfigObj("SFGantt/taskStyle")
		});
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttTasksMap"));
		if(!SFGanttTasksMap.listIndex){SFGanttTasksMap.listIndex=0;}
		this.proTag="taskMap_"+(SFGanttTasksMap.listIndex++);
		if(!this.taskStyles){this.taskStyles={};}
		this.taskPadding=gantt.itemHeight-this.taskHeight;
		//图表的任务显示层
		var doc=gantt.container.ownerDocument,tasksDiv=this.div=doc.createElement('div');
		SFGlobal.setProperty(this.div.style,{position:'relative',fontSize:'0px',left:'0px',top:'-1px',zIndex:100});
		var firstDiv=doc.createElement('div');
		SFGlobal.setProperty(firstDiv.style,{position:'relative',padding:'0px',margin:'0px',border:'0px'});
		tasksDiv.appendChild(firstDiv);
		gantt.getMapPanel().appendChild(tasksDiv);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onInitialize),
			SFEvent.bind(gantt,"afterscalechange",this,this.onScale),
			SFEvent.bind(gantt,"taskinview",this,this.drawTask),
			SFEvent.bind(gantt,"taskoutview",this,this.clearTask),
			SFEvent.bind(gantt,"taskchange",this,this.updateTask),
			SFEvent.bind(tasksDiv,"dblclick",this,this.onDblClick),
			SFEvent.bind(tasksDiv,"click",this,this.onClick),
			SFEvent.bind(tasksDiv,"mousedown",this,this.onMouseDown)
		];
		if(gantt.setTooltip)
		{
			gantt.setTooltip(tasksDiv,SFEvent.getCallback(this,this.getTooltip))
		}
		return true;
	}
	/**
	@private
	添加一个横道图的绘制项目
	@param {SFGanttMapItem} item
	@returns {Bool} 如果添加成功，返回true,否则返回false
	*/
	SFGanttTasksMap.prototype.addItem=function(item)
	{
		if(!item){return;}
		if(!item.initialize(this)){return false;}
		this.items.push(item);
		return true;
	}
	/**
	@private
	通过调整空白元素的高度来保持和甘特图视图高度的一致
	*/
	SFGanttTasksMap.prototype.setViewTop=function()
	{
		var top=this.gantt.getViewTop();
		this.div.firstChild.style.height=top+"px";
	}
	/**
	@private
	根据任务返回任务应该使用的样式
	@param {SFDataTask} task
	@returns {Json} 任务的样式配置
	*/
	SFGanttTasksMap.prototype.getTaskStyle=function(task)
	{
		var className=task.ClassName,taskStyles=this.taskStyles;
		/**
		网络图默认的任务显示样式
		@name SFConfig.configItems.SFGanttTasksMap_taskStyle
		@type String
		@default TaskNormal
		*/
		className=className && taskStyles[className]?className:this.taskStyle;
		return taskStyles[className];
	}
	/**
	@private
	绘制指定的任务
	@param {SFDataTask} task
	@param {Number} viewIndex 该任务在当前视图任务中的索引
	*/
	SFGanttTasksMap.prototype.drawTask=function(task,viewIndex)
	{
		var gantt=this.gantt,scale=gantt.getScale();
		if(!scale){return;}
		if(viewIndex==0){this.setViewTop();}
		var drawObj=gantt.getElementDrawObj(task);
		var mapObj=drawObj[this.proTag]={};
		var start=task.Start,finish=task.Finish,height=gantt.getElementHeight(task);
		var taskDiv=this.div.ownerDocument.createElement('div'),childNodes=this.div.childNodes;
		taskDiv.style.cssText="position:relative;top:"+(height-gantt.getElementDrawObj(task).height)+"px;left:"+gantt.getMapPanelPosition(start)+"px;height:"+height+"px"
		mapObj.taskDiv=taskDiv;

		if(drawObj.height>0)
		{
			taskDiv._element=task;
			var items=this.items;
			if(finish && start && finish>=start)
			{
				for(var i=items.length-1;i>=0;i--)
				{
					items[i].show(task,mapObj,scale);
				}
			}
		}

		if(viewIndex+1==childNodes.length)
		{
		    this.div.appendChild(taskDiv);
		}
		else
		{
		    this.div.insertBefore(taskDiv,childNodes[viewIndex+1]);
		}
	}
	/**
	@private
	在任务发生变化时进行响应，检查并在需要时重绘任务
	@param {SFDataTask} task
	@param {String[]} changedFields 任务更新的属性名称列表
	*/
	SFGanttTasksMap.prototype.updateTask=function(task,changedFields)
	{
		if(!this.gantt.getElementDrawObj(task)){return;}
		var drawObj=this.gantt.getElementDrawObj(task),mapObj=drawObj[this.proTag];
		if(!mapObj){return;}
		var start=task.Start,finish=task.Finish;
		mapObj.taskDiv.style.left=this.gantt.getMapPanelPosition(start)+"px";
		var items=this.items,canShow=(finish && start && finish>=start && drawObj.height>0);
		if(SFGlobal.findInArray(changedFields,"Selected"))
		{
			mapObj.taskDiv.style.backgroundColor=task.Selected?"#DDDDDD":'';
		}
		for(var i=items.length-1;i>=0;i--)
		{
			if(canShow)
			{
				items[i].onUpdate(task,mapObj,changedFields);
			}
			else
			{
				items[i].remove(task,mapObj);
			}
		}
	}
	/**
	@private
	清除对指定任务的绘制
	@param {SFDataTask} task
	@param {Number} viewIndex 该任务在当前视图任务中的索引
	*/
	SFGanttTasksMap.prototype.clearTask=function(task,viewIndex)
	{
		if(viewIndex==0){this.setViewTop();}
		var drawObj=this.gantt.getElementDrawObj(task);
		if(!drawObj){return}
		var mapObj=drawObj[this.proTag];
		if(!mapObj){return}
		var items=this.items;
		for(var i=items.length-1;i>=0;i--)
		{
			items[i].remove(task,mapObj);
		}
		if(mapObj){mapObj.taskDiv._element=null;}
		SFEvent.deposeNode(mapObj.taskDiv);
		drawObj[this.proTag]=null;
	}
	/**
	@private
	获得当前鼠标事件对应的任务
	@param {Event} e 浏览器鼠标事件
	@returns {SFDataTask} task
	*/
	SFGanttTasksMap.prototype.getEventElement=function(e)
	{
		if(!e.target){e.target=e.srcElement}
		for(var node=e.target;node;node=node.parentNode)
		{
			if(node==this.div){return null;}
			if(node._element){return node._element;}
		}
	}
	/**
	@private
	在鼠标双击横道图时触发对应任务的双击事件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttTasksMap.prototype.onDblClick=function(e)
	{
		var task=this.getEventElement(e);
		if(!task){return;}
		/** 
			@event
			@name SFGantt#taskdblclick
			@description 在一个任务被双击时触发。
			@param {SFDataTask} task 被双击的任务.
		 */
		SFEvent.trigger(this.gantt,"taskdblclick",[task,"chart"]);
	}
	/**
	@private
	在鼠标单击横道图时触发对应任务的单击事件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttTasksMap.prototype.onClick=function(e)
	{
		var task=this.getEventElement(e);
		if(!task){return;}
		/** 
			@event
			@name SFGantt#taskclick
			@description 在一个任务被单击时触发。
			@param {SFDataTask} task 被单击的任务.
			@param {Event} e 浏览器鼠标事件
		 */
		SFEvent.trigger(this.gantt,"taskclick",[task,e]);
	}
	/**
	@private
	在鼠标在横道图上按下的时候调用各个绘制项目的鼠标响应
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttTasksMap.prototype.onMouseDown=function(e)
	{
		if(SFEvent.getEventButton(e)!=1){return;}
		var task=this.getEventElement(e);
		if(!task){return;}
		SFEvent.trigger(this.gantt,"taskmousedown",[task,e]);
		this.dragTask=task;
		var mapObj=this.gantt.getElementDrawObj(task)[this.proTag];
		var items=this.items;
		for(var i=items.length-1;i>=0;i--)
		{
			items[i].onMouseDown(task,mapObj,e);
		}
	}
	/**
	@private
	在地图初始化时初始化所有绘制项目
	*/
	SFGanttTasksMap.prototype.onInitialize=function()
	{
		//设置起始绘制原点
		this.addItem(new SFGanttMapMilestoneHead());
		this.addItem(new SFGanttMapSummaryHead());
		this.addItem(new SFGanttMapBarSummary());
		this.addItem(new SFGanttMapBarNormal());
		this.addItem(new SFGanttMapText());
		this.addItem(new SFGanttMapResize());
		this.addItem(new SFGanttMapPercentChange());
		this.addItem(new SFGanttMapPercent());
		this.addItem(new SFGanttMapBarTrack());
		this.addItem(new SFGanttMapMilestoneTrackHead());
	//	this.addItem(new SFGanttMapLinks());
		var gantt=this.gantt;
		if(!gantt.getScale()){return;}
		//重新绘制所有视图内的任务
		var viewTasks=gantt.getViewElements();
		for(var i=0;i<viewTasks.length;i++)
		{
			this.drawTask(viewTasks[i],i);
		}
	}
	/**
	@private
	在地图缩放等级变化时执行的操作
	*/
	SFGanttTasksMap.prototype.onScale=function()
	{
		//设置起始绘制原点
		var gantt=this.gantt,scale=gantt.getScale();
		if(!scale){return;}
		//重新绘制所有视图内的任务
		var viewTasks=gantt.getViewElements(),items=this.items;
		for(var i=0;i<viewTasks.length;i++)
		{
			var task=viewTasks[i],mapObj=this.gantt.getElementDrawObj(task)[this.proTag];
			if(!mapObj){continue;}
			var start=task.Start;
			mapObj.taskDiv.style.left=gantt.getMapPanelPosition(start)+"px";
			for(var j=items.length-1;j>=0;j--)
			{
				items[j].onScale(task,mapObj,scale);
			}
		}
	}
	/**
	@private
	鼠标在横道图上滑过时调用各个绘制项目的响应来显示提示信息
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器的鼠标事件
	@returns {Bool} 如果需要显示提示，返回true,否则返回false
	*/
	SFGanttTasksMap.prototype.getTooltip=function(tooltip,e)
	{
		var task=this.getEventElement(e);
		if(!task){return;}
		var items=this.items,mapObj=this.gantt.getElementDrawObj(task)[this.proTag];
		for(var i=items.length-1;i>=0;i--)
		{
			if(items[i].getTooltip(task,mapObj,tooltip,e)){return true;}
		}
		return false;
	}
	/**
	@private
	通过指定的属性列表返回任务的鼠标滑过提示信息层
	@param {SFDataTask} task 指定的任务
	@param {String} title 提示信息标题
	@param {String[]} fields 需要显示的任务列名称数组，请参考{@link SFGanttField.taskFields}
	@returns {HtmlElement}
	*/
	SFGanttTasksMap.prototype.getTaskTooltipContent=function(task,title,fields)
	{
		var doc=this.div.ownerDocument,table=doc.createElement("table");
		table.style.fontSize="12px";
		SFGlobal.setProperty(table,{});
		var row=table.insertRow(-1);
		var cell=row.insertCell(-1);
		SFGlobal.setProperty(cell,{align:'center',colSpan:2,noWrap:true});
		cell.appendChild(doc.createTextNode(title));

		fields=SFGanttField.getTaskFields(fields);
		for(var i=0;i<fields.length;i++)
		{
			var field=fields[i];
			row=table.insertRow(-1);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			field.showHead(cell);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			field.showBody(cell,task,this);
		}
		return table;
	}
	/**
	@private
	返回链接的鼠标滑过提示信息层
	@param {SFDataLink} link 指定的任务
	@returns {HtmlElement}
	*/
	SFGanttTasksMap.prototype.getLinkTooltipContent=function(link)
	{
		var doc=this.div.ownerDocument,table=doc.createElement("table");
		table.style.fontSize="12px";
		SFGlobal.setProperty(table,{});
		var row=table.insertRow(-1);
		var cell=row.insertCell(-1);
		SFGlobal.setProperty(cell,{align:'center',colSpan:2,noWrap:true});
		var title=this.tooltipTitle['link'];
		cell.appendChild(doc.createTextNode(title));

		var fields=SFGanttField.getFields("Link",this.linkAddNoticeFields.split(","));

		for(var i=0;i<fields.length;i++)
		{
			var field=fields[i];
			row=table.insertRow(-1);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			field.showHead(cell);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			field.showBody(cell,link,this);
		}
		return table;
	}
	window.SFGanttTasksMap=SFGanttTasksMap;