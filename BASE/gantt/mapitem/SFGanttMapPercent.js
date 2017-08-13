	/**
	本绘制项实现任务百分比条的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapPercent()
	{
	}
	SFGanttMapPercent.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapPercent.prototype.initialize=function(control)
	{
		SFGlobal.setProperty(this,{control:control,name:'Percent'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapPercent.prototype.show=function(task,mapObj)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start>=finish || task.Milestone || task.Summary){return;}
		var control=this.control,gantt=control.gantt,div=mapObj.taskDiv.ownerDocument.createElement('div');
		var height=control.taskHeight*(gantt.isTracking?control.trackNormalHeightScale:1),percent=task.PercentComplete;
		percent=percent?percent:0;
		percent=Math.max(0,Math.min(percent,100));
		var width=(finish-start)/gantt.getScale()*percent/100;
		div.style.cssText="position:absolute;font-size:0px;z-index:200;left:0px;width:"+width+"px;top:"+Math.ceil(control.taskPadding/2+control.taskHeight*control.trackNormalTopScale+height/4)+"px;height:"+Math.ceil(height/2)+"px;";
		var taskStyle=control.getTaskStyle(task);
		if(taskStyle.percentBarStyle){SFGlobal.setProperty(div.style,taskStyle.percentBarStyle);}
		mapObj.taskDiv.appendChild(div);
		mapObj[this.name]=div;
	}
	/**
	@private
	鼠标在任务上划过时显示的显示实时提示信息
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapPercent.prototype.getTooltip=function(task,mapObj,tooltip,e)
	{
		if(e.target!=mapObj[this.name] || !this.control.taskProgressNoticeFields){return false;}
		var control=this.control;
		if(tooltip && tooltip.bindObject==task && tooltip.bindType=="Percent"){return false;}
		var table=control.getTaskTooltipContent(task,control.tooltipTitle.progress,control.taskProgressNoticeFields.split(","));
		tooltip.bindObject=task;
		tooltip.bindType="Percent";
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
	SFGanttMapPercent.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start>=finish || task.Summary){this.remove(task,mapObj);return;}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj);
		}
		else
		{
			var style=div.style;
			if(SFGlobal.findInArray(changedFields,"PercentComplete") || SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish"))
			{
				var percent=task.PercentComplete;
				percent=percent?percent:0;
				style.width=(finish-start)/this.control.gantt.getScale()*percent/100+"px";
			}
		}
	}
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapPercent.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		var percent=task.PercentComplete;
		percent=percent?percent:0;
		if(div){div.style.width=(task.Finish-task.Start)/this.control.gantt.getScale()*percent/100+"px";}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapPercent.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapPercent=SFGanttMapPercent;