	/**
	本绘制项实现概要任务头图标的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapSummaryHead()
	{
	}
	SFGanttMapSummaryHead.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapSummaryHead.prototype.initialize=function(control)
	{
		SFGlobal.setProperty(this,{control:control,name:'SummaryHead'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapSummaryHead.prototype.show=function(task,mapObj,scale)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf(),doc=mapObj.taskDiv.ownerDocument;
		if(start>=finish || task.Milestone || !task.Summary){return;}
		var control=this.control,gantt=control.gantt,imgs=mapObj[this.name]=[];
		scale=scale?scale:gantt.getScale();
		var taskStyle=control.getTaskStyle(task);
		for(var i=0;i<2;i++)
		{
			var left=-Math.floor((control.taskHeight-1)/2);
			if(i>0){left+=(finish-start)/scale;}
			var img=gantt.createImage(taskStyle.summaryImage||"task_head_2",{color:(taskStyle.summaryImageColor||"#000000"),position:[left,Math.ceil(control.taskPadding/2)],size:[(control.taskHeight-1),(control.taskHeight-1)]});
			imgs.push(img);
			SFGlobal.setProperty(img.style,{position:'absolute',zIndex:150});
			mapObj.taskDiv.appendChild(img);
		}
	}
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapSummaryHead.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var gantt=this.control.gantt,start=task.Start.valueOf(),finish=task.Finish.valueOf(),control=this.control;
		if(start==finish || !task.Summary){this.remove(task,mapObj);return;}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj);
		}
		else
		{
			if(SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish")){mapObj[this.name][1].style.left=(-Math.floor((control.taskHeight-1)/2)+(finish-start)/gantt.getScale())+"px"}
		}
	}
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapSummaryHead.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		if(div){div[1].style.left=(-Math.floor((this.control.taskHeight-1)/2)+(task.Finish-task.Start)/scale)+"px";}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapSummaryHead.prototype.remove=function(task,mapObj)
	{
		var imgs=mapObj[this.name];
		if(imgs)
		{
			SFEvent.deposeNode(imgs[0]);
			SFEvent.deposeNode(imgs[1]);
		}
		delete mapObj[this.name];
	}
	window.SFGanttMapSummaryHead=SFGanttMapSummaryHead;