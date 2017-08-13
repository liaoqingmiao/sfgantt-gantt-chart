	/**
	本绘制项实现拖拽更改任务的结束时间的功能
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapResize()
	{
	}
	SFGanttMapResize.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapResize.prototype.initialize=function(control)
	{
		if(control.gantt.readOnly || control.gantt.disableUpdateTask || control.disableDragResizeTask){return false;}
		SFGlobal.setProperty(this,{control:control,name:'Resize'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapResize.prototype.show=function(task,mapObj,scale)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf(),control=this.control,gantt=control.gantt,height=gantt.getElementDrawObj(task).height;
		scale=scale?scale:gantt.getScale();
		if(start>=finish || task.Milestone || task.Summary || gantt.readOnly || !task.canSetProperty("Finish")){return;}
		var div=mapObj.taskDiv.ownerDocument.createElement('div');
		mapObj[this.name]=div;
		div.style.cssText="position:absolute;width:"+(control.taskHeight-1)+"px;left:"+((finish-start)/scale-Math.floor((control.taskHeight-1)/2))+"px;top:"+Math.ceil(control.taskPadding/2)+"px;height:"+(height/2+2)+"px;z-index:150;font-size:0px;cursor:w-resize;";
		mapObj.taskDiv.appendChild(div);
	}
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapResize.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf(),control=this.control,gantt=control.gantt,height=gantt.getElementHeight(task);
		if(start>=finish || task.Summary || gantt.readOnly || !task.canSetProperty("Finish") || gantt.disableUpdateTask || control.disableDragResizeTask){this.remove(task,mapObj);return;}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj);
		}
		else
		{
			var style=div.style;
			if(SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish")){style.left=((finish-start)/gantt.getScale()-Math.floor((control.taskHeight-1)/2))+"px";}
		}
	}
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapResize.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		if(div){div.style.left=((task.Finish-task.Start)/scale)+"px";}
	}
	/**
	@private
	鼠标在任务上按下时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapResize.prototype.onMouseDown=function(task,mapObj,e)
	{
		if(e.target!=mapObj[this.name]){return;}
		var control=this.control;
		new SFDragObject(control.div,SFEvent.getCallback(this,this.onResizeMove)).onMouseDown(e);
	}
	/**
	@private
	在拖拽更改大小的过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttMapResize.prototype.onResizeMove=function(sp,lp,type)
	{
		var control=this.control,gantt=control.gantt,task=control.dragTask,barDiv=gantt.getElementDrawObj(task)[control.proTag].BarNormal,scale=gantt.getScale();
		if(type=="start")
		{
			if(gantt.getTooltip)
			{
				var tooltip=gantt.getTooltip();
				tooltip.setContent(control.getTaskTooltipContent(task,control.tooltipTitle.task,["Start","Finish"]));
				var position=SFEvent.getPageOffset(barDiv,gantt.container);
				position[1]+=gantt.getElementDrawObj(task).height;
				tooltip.show(position);
			}
		}
		var finish=task.Finish.valueOf()+[lp[0]-sp[0]]*scale;
		finish=Math.max(task.Start.valueOf(),finish)
		if(type!="end")
		{
			barDiv.style.width=(finish-task.Start.valueOf())/scale+"px";
			if(gantt.getTooltip)
			{
				gantt.getTooltip().setContent(control.getTaskTooltipContent({Start:task.Start,Finish:new Date(finish)},control.tooltipTitle.task,["Start","Finish"]))
			}
		}
		else
		{
			if(!task.setProperty("Finish",new Date(finish)))
			{
				barDiv.style.width=(task.Finish.valueOf()-task.Start.valueOf())/scale+"px";
			}
		}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapResize.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapResize=SFGanttMapResize;