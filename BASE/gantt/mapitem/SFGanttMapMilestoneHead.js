	/**
	本绘制项实现任务里程碑头图标的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapMilestoneHead()
	{
	}
	SFGanttMapMilestoneHead.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapMilestoneHead.prototype.initialize=function(control)
	{
		SFGlobal.setProperty(this,{control:control,name:'MilestoneHead'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapMilestoneHead.prototype.show=function(task,mapObj)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start<finish && !task.Milestone){return;}
		var control=this.control,gantt=control.gantt,taskStyle=control.getTaskStyle(task);
		var img=mapObj[this.name]=gantt.createImage(taskStyle.milestoneImage||"task_head_3",{color:(taskStyle.milestoneImageColor||"#000000"),position:[(-Math.floor((control.taskHeight-1)/2)),Math.ceil(control.taskPadding/2)],size:[(control.taskHeight-1),(control.taskHeight-1)]});
		SFGlobal.setProperty(img.style,{position:'absolute',zIndex:150});
		mapObj.taskDiv.appendChild(img);
	}
	/**
	@private
	鼠标在任务上划过时显示的显示实时提示信息
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapMilestoneHead.prototype.getTooltip=function(task,mapObj,tooltip,e)
	{
		if(e.target!=mapObj[this.name] || !this.control.taskNoticeFields){return false;}
		var control=this.control;
		if(tooltip.bindObject==task && tooltip.bindType=="Task"){return false;}
		var table=control.getTaskTooltipContent(task,control.tooltipTitle.milestone,control.taskNoticeFields.split(","));
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
	SFGanttMapMilestoneHead.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var gantt=this.control.gantt,start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start!=finish){this.remove(task,mapObj);return;}
		if(SFGlobal.findInArray(changedFields,"ClassName"))
		{
			this.remove(task,mapObj);
			this.show(task,mapObj);
			return;
		}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj);
		}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapMilestoneHead.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapMilestoneHead=SFGanttMapMilestoneHead;