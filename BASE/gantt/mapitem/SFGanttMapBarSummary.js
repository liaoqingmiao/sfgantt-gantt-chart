	/**
	本绘制项实现概要任务横条的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapBarSummary()
	{
	}
	SFGanttMapBarSummary.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapBarSummary.prototype.initialize=function(control)
	{
		SFGlobal.setProperty(this,{control:control,name:'BarSummary'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapBarSummary.prototype.show=function(task,mapObj,scale)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if((start>=finish || task.Milestone) || !task.Summary){return;}
		var control=this.control,gantt=control.gantt,div=mapObj.taskDiv.ownerDocument.createElement('div');
		scale=scale?scale:gantt.getScale();
		mapObj[this.name]=div;
		div.style.cssText="position:absolute;font-size:0px;z-index:100;left:0px;width:"+((finish-start)/scale)+"px;top:"+Math.ceil(control.taskPadding/2)+"px;height:"+Math.floor(control.taskHeight/2-1)+"px;";
		var taskStyle=control.getTaskStyle(task);
		if(taskStyle.summaryBarStyle){SFGlobal.setProperty(div.style,taskStyle.summaryBarStyle);}
		mapObj.taskDiv.appendChild(div);
	}
	/**
	@private
	鼠标在任务上划过时显示的显示实时提示信息
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapBarSummary.prototype.getTooltip=function(task,mapObj,tooltip,e)
	{
		if(e.target!=mapObj[this.name] || !this.control.taskNoticeFields){return false;}
		var control=this.control;
		if(tooltip && tooltip.bindObject==task && tooltip.bindType=="Task"){return false;}
		var table=control.getTaskTooltipContent(task,control.tooltipTitle.summary,control.taskNoticeFields.split(","));
		tooltip.bindObject=task;
		tooltip.bindType="Task";
		tooltip.setContent(table);
		return true;
	}
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapBarSummary.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var gantt=this.control.gantt,start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start>=finish || !task.Summary){this.remove(task,mapObj);return;}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj,gantt.getScale());
		}
		else
		{
			var style=div.style;
			if(SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish")){style.width=((finish-start)/gantt.getScale())+"px";}
		}
	}
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapBarSummary.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		if(div){div.style.width=((task.Finish-task.Start)/scale)+"px";}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapBarSummary.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapBarSummary=SFGanttMapBarSummary;