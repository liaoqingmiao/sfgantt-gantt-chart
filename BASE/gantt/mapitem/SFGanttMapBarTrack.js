	/**
	本绘制项实现任务跟踪横条的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapBarTrack()
	{
	}
	SFGanttMapBarTrack.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapBarTrack.prototype.initialize=function(control)
	{
		if(!control.gantt.isTracking){return false;}
		SFGlobal.setProperty(this,{control:control,name:'BarTrack'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapBarTrack.prototype.show=function(task,mapObj,scale)
	{
		if(!task.BaselineStart || !task.BaselineFinish){return;}
		var start=task.BaselineStart.valueOf(),finish=task.BaselineFinish.valueOf();
		if(start>=finish || task.Milestone || task.Summary){return;}
		var control=this.control,gantt=control.gantt,div=mapObj.taskDiv.ownerDocument.createElement('div');
		scale=scale?scale:gantt.getScale();
		mapObj[this.name]=div;
		var height=control.taskHeight,topScale=control.trackBaselineTopScale,heightScale=control.trackBaselineHeightScale;
		div.style.cssText="position:absolute;font-size:0px;z-index:100;left:"+(start-task.Start.valueOf())/scale+"px;width:"+((finish-start)/scale)+"px;top:"+(Math.ceil(control.taskPadding/2)+height*topScale)+"px;height:"+height*heightScale+"px;";
		var taskStyle=control.getTaskStyle(task),tbStyle=taskStyle.trackBarStyle;
		if(tbStyle)
		{
			if(tbStyle.bgImage)
			{
				gantt.setBackgroundImage(div,tbStyle.bgImage,{color:tbStyle.bgColor});
			}
			SFGlobal.setProperty(div.style,tbStyle);
		}
		mapObj.taskDiv.appendChild(div);
	}
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapBarTrack.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		if(!task.BaselineStart || !task.BaselineFinish){return;}
		var gantt=this.control.gantt,start=task.BaselineStart,finish=task.BaselineFinish;
		if(!start || !finish || start.valueOf()>=finish.valueOf() || task.Summary){this.remove(task,mapObj);return;}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj);
		}
		else
		{
			if(SFGlobal.findInArray(changedFields,"ClassName"))
			{
				this.remove(task,mapObj);
				this.show(task,mapObj);
				return;
			}
			var style=div.style;
			if(SFGlobal.findInArray(changedFields,"BaselineStart") || SFGlobal.findInArray(changedFields,"BaselineFinish"))
			{
				style.width=((finish-start)/gantt.getScale())+"px";
			}
			if(SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"BaselineStart"))
			{
				style.left=((start-task.Start.valueOf())/gantt.getScale())+"px";
			}
		}
	}
	/**
	@private
	鼠标在任务上划过时显示的显示实时提示信息
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapBarTrack.prototype.getTooltip=function(task,mapObj,tooltip,e)
	{
		if(e.target!=mapObj[this.name] || !this.control.taskNoticeFields){return false;}
		var control=this.control;
		if(tooltip && tooltip.bindObject==task && tooltip.bindType=="Task"){return false;}
		var table=control.getTaskTooltipContent(task,control.tooltipTitle.task,control.taskTrackingNoticeFields.split(","));
		tooltip.bindObject=task;
		tooltip.bindType="Task";
		tooltip.setContent(table);
		return true;
	}
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapBarTrack.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		if(div)
		{
			div.style.width=((task.BaselineFinish-task.BaselineStart)/scale)+"px";
			div.style.left=((task.BaselineStart-task.Start.valueOf())/scale)+"px";
		}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapBarTrack.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapBarTrack=SFGanttMapBarTrack;