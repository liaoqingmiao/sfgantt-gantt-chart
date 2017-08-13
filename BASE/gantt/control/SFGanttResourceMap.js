	/**
	这是一个甘特图功能控件，本控件用来实现任务横道图的绘制
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttResourceMap(config)
	{
		SFConfig.applyProperty(this,config);
		this.items=[];
	}
	SFGanttResourceMap.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttResourceMap.prototype.initialize=function(gantt)
	{
		if(!gantt.getMapPanel){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttResourceMap"));
		if(!SFGanttResourceMap.listIndex){SFGanttResourceMap.listIndex=0;}
		this.proTag="resourceMap_"+(SFGanttResourceMap.listIndex++);
		SFGlobal.setProperty(this,{
			gantt:gantt,
			taskStyles:gantt.config.getConfigObj("SFGantt/taskStyle")
		});
		if(!this.taskStyles){this.taskStyles={};}
		this.taskPadding=gantt.itemHeight-this.taskHeight;
		this.resourcePadding=gantt.itemHeight-this.resourceHeight;
		//图表的任务显示层
		var doc=gantt.container.ownerDocument,resourcesDiv=this.div=doc.createElement('div');
		SFGlobal.setProperty(this.div.style,{position:'relative',fontSize:'0px',left:'0px',top:'-1px',zIndex:100});
		var firstDiv=doc.createElement('div');
		SFGlobal.setProperty(firstDiv.style,{position:'relative',padding:'0px',margin:'0px',border:'0px'});
		resourcesDiv.appendChild(firstDiv);
		gantt.getMapPanel().appendChild(resourcesDiv);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onInitialize),
			SFEvent.bind(gantt,"afterscalechange",this,this.onScale),
			SFEvent.bind(gantt,"resourceinview",this,this.drawResource),
			SFEvent.bind(gantt,"resourceoutview",this,this.clearResource),
			SFEvent.bind(gantt,"resourcechange",this,this.updateResource),
			SFEvent.bind(gantt,"afterassignmentadd",this,this.drawAssignment),
			SFEvent.bind(gantt,"afterassignmentdelete",this,this.clearAssignment),
			SFEvent.bind(resourcesDiv,"dblclick",this,this.onDblClick),
			SFEvent.bind(resourcesDiv,"click",this,this.onClick),
			SFEvent.bind(resourcesDiv,"mousedown",this,this.onMouseDown)
		];
		if(gantt.setTooltip)
		{
			gantt.setTooltip(resourcesDiv,SFEvent.getCallback(this,this.getTooltip))
		}
		return true;
	}
	/**
	@private
	添加一个横道图的绘制项目
	@param {SFGanttMapItem} item
	@returns {Bool} 如果添加成功，返回true,否则返回false
	*/
	SFGanttResourceMap.prototype.addItem=function(item)
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
	SFGanttResourceMap.prototype.setViewTop=function()
	{
		var top=this.gantt.getViewTop();
		this.div.firstChild.style.height=top+"px";
	}
	/**
	@private
	绘制指定的资源
	@param {SFDataResource} resource
	@param {Number} viewIndex 该资源在当前视图任务中的索引
	*/
	SFGanttResourceMap.prototype.drawResource=function(resource,viewIndex)
	{
		var gantt=this.gantt,scale=gantt.getScale();
		if(!scale){return;}
		if(viewIndex==0){this.setViewTop();}
		var drawObj=gantt.getElementDrawObj(resource);
		var mapObj=drawObj[this.proTag]={};

		var height=gantt.getElementHeight(resource);
		var resourceDiv=this.div.ownerDocument.createElement('div'),childNodes=this.div.childNodes;
		resourceDiv.style.cssText="position:relative;top:"+(height-gantt.getElementDrawObj(resource).height)+"px;left:0px;height:"+height+"px"
		mapObj.resourceDiv=resourceDiv;

		if(drawObj.height>0)
		{
			var assignments = resource.getAssignments();
			for(var i=0;i<assignments.length;i++)
			{
				this.drawAssignment(assignments[i]);
			}
		}

		if(viewIndex+1==childNodes.length)
		{
		    this.div.appendChild(resourceDiv);
		}
		else
		{
		    this.div.insertBefore(resourceDiv,childNodes[viewIndex+1]);
		}
	}
	/**
	@private
	在资源发生变化时进行响应，检查并在需要时重绘资源
	@param {SFDataResource} resource
	@param {String[]} changedFields 资源更新的属性名称列表
	*/
	SFGanttResourceMap.prototype.updateResource=function(resource,changedFields)
	{
		if(!this.gantt.getElementDrawObj(resource)){return;}
		var drawObj=this.gantt.getElementDrawObj(resource),mapObj=drawObj[this.proTag];
		if(!mapObj){return;}

		if(SFGlobal.findInArray(changedFields,"Selected"))
		{
			mapObj.resourceDiv.style.backgroundColor=resource.Selected?"#DDDDDD":'';
		}
	}
	/**
	@private
	清除对指定资源的绘制
	@param {SFDataResource} resource
	@param {Number} viewIndex 该资源在当前视图任务中的索引
	*/
	SFGanttResourceMap.prototype.clearResource=function(resource,viewIndex)
	{
		if(viewIndex==0){this.setViewTop();}
		var drawObj=this.gantt.getElementDrawObj(resource);
		if(!drawObj){return}
		var mapObj=drawObj[this.proTag];
		if(!mapObj){return}
		var assignments = resource.getAssignments();
		for(var i=0;i<assignments.length;i++)
		{
			this.clearAssignment(assignments[i]);
		}
		SFEvent.deposeNode(mapObj.resourceDiv);
		drawObj[this.proTag]=null;
	}
	/**
	@private
	绘制指定的分配
	@param {SFDataAssignment} assignment
	*/
	SFGanttResourceMap.prototype.drawAssignment=function(assignment)
	{
		var gantt=this.gantt,scale=gantt.getScale();
		if(!scale){return;}
		var resourceDiv=gantt.getElementDrawObj(assignment.getResource())[this.proTag].resourceDiv;
		if(!resourceDiv){return;}
		var drawObj=gantt.getElementDrawObj(assignment.getTask());
		var mapObj=drawObj[this.proTag]={};
		var taskDiv=this.div.ownerDocument.createElement('div');
		resourceDiv.appendChild(taskDiv);
		var task =assignment.getTask(),start=task.Start,finish=task.Finish,height=gantt.getElementHeight(task);
		taskDiv.style.cssText="position:absolute;top:"+(height-gantt.getElementDrawObj(task).height)+"px;left:"+gantt.getMapPanelPosition(start)+"px;height:"+height+"px"
		mapObj.taskDiv=taskDiv;
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
	/**
	@private
	在分配发生变化时进行响应，检查并在需要时重绘分配
	@param {SFDataAssignment} assignment
	 @param {String[]} changedFields 分配更新的属性名称列表
	 @param {String} changedType 分配更新的类型，task代表任务，默认是分配本身
	*/
	SFGanttResourceMap.prototype.updateAssignment=function(assignment,changedFields,changeType)
	{
		if(!this.gantt.getElementDrawObj(assignment.getTask())){return;}
		var drawObj=this.gantt.getElementDrawObj(assignment.getTask()),mapObj=drawObj[this.proTag];
		if(!mapObj){return;}
		var task=assignment.getTask(),start=task.Start,finish=task.Finish;
		mapObj.taskDiv.style.left=this.gantt.getMapPanelPosition(start)+"px";
		var items=this.items,canShow=(finish && start && finish>=start && drawObj.height>0);
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
	清除对指定分配的绘制
	@param {SFDataAssignment} assignment
	*/
	SFGanttResourceMap.prototype.clearAssignment=function(assignment)
	{
		var drawObj=this.gantt.getElementDrawObj(assignment.getTask());
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
	根据任务返回任务应该使用的样式
	@param {SFDataTask} task
	@returns {Json} 任务的样式配置
	*/
	SFGanttResourceMap.prototype.getTaskStyle=function(task)
	{
		var className=task.ClassName,taskStyles=this.taskStyles;
		className=className && taskStyles[className]?className:this.taskStyle;
		return taskStyles[className];
	}
	/**
	@private
	在任务发生变化时进行响应，检查并在需要时重绘任务
	@param {SFDataTask} task
	@param {String[]} changedFields 任务更新的属性名称列表
	*/
	SFGanttResourceMap.prototype.updateTask=function(task,name)
	{
		var assignments=task.getAssignments();
		for(var i=0;i<assignments.length;i++)
		{
			this.updateAssignment(assignments[i],[name],"task");
		}
	}
	/**
	@private
	获得当前鼠标事件对应的任务
	@param {Event} e 浏览器鼠标事件
	@returns {SFDataTask} task
	*/
	SFGanttResourceMap.prototype.getEventElement=function(e)
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
	SFGanttResourceMap.prototype.onDblClick=function(e)
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
	SFGanttResourceMap.prototype.onClick=function(e)
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
	SFGanttResourceMap.prototype.onMouseDown=function(e)
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
	SFGanttResourceMap.prototype.onInitialize=function()
	{
		//设置起始绘制原点
		this.addItem(new SFGanttMapMilestoneHead());
		this.addItem(new SFGanttMapSummaryHead());
		this.addItem(new SFGanttMapBarSummary());
		this.addItem(new SFGanttMapBarNormal());
		this.addItem(new SFGanttMapResize());
		this.addItem(new SFGanttMapPercentChange());
		this.addItem(new SFGanttMapPercent());
		this.addItem(new SFGanttMapBarTrack());
		this.addItem(new SFGanttMapMilestoneTrackHead());
		var gantt=this.gantt;
		if(!gantt.getScale()){return;}
		this.listeners.push(SFEvent.bind(gantt.getData(),"aftertaskupdate",this,this.updateTask));
		//重新绘制所有视图内的任务
		var viewResources=gantt.getViewElements();
		for(var i=0;i<viewResources.length;i++)
		{
			this.drawResource(viewResources[i],i);
		}
	}
	/**
	@private
	在地图缩放等级变化时执行的操作
	*/
	SFGanttResourceMap.prototype.onScale=function()
	{
		//设置起始绘制原点
		var gantt=this.gantt,scale=gantt.getScale();
		if(!scale){return;}
		//重新绘制所有视图内的任务
		var viewResources=gantt.getViewElements(),items=this.items;
		for(var i=0;i<viewResources.length;i++)
		{
			var resource=viewResources[i],mapObj=this.gantt.getElementDrawObj(resource)[this.proTag];
			if(!mapObj){continue;}
			var assignments=resource.getAssignments();
			for(var k=0;k<assignments.length;k++)
			{
				var assignment=assignments[k],
					task=assignment.getTask(),
					start=task.Start;
				var drawObj=this.gantt.getElementDrawObj(assignment.getTask());
				if(!drawObj){return}
				var mapObj=drawObj[this.proTag];
				if(!mapObj){return}
				mapObj.taskDiv.style.left=gantt.getMapPanelPosition(start)+"px";
				for(var j=items.length-1;j>=0;j--)
				{
					items[j].onScale(task,mapObj,scale);
				}
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
	SFGanttResourceMap.prototype.getTooltip=function(tooltip,e)
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
	SFGanttResourceMap.prototype.getTaskTooltipContent=function(task,title,fields)
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
	SFGanttResourceMap.prototype.getLinkTooltipContent=function(link)
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
	window.SFGanttResourceMap=SFGanttResourceMap;