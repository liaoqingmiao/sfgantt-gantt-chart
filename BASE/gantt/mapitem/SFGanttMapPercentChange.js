	/**
	本绘制项实现拖拽更改百分比的功能
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapPercentChange()
	{
	}
	SFGanttMapPercentChange.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapPercentChange.prototype.initialize=function(control)
	{
		if(control.gantt.readOnly || control.gantt.disableUpdateTask || control.disableDragChangePercent){return false;}
		SFGlobal.setProperty(this,{control:control,name:'PercentChange'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapPercentChange.prototype.show=function(task,mapObj)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf(),percent=task.PercentComplete,control=this.control,gantt=control.gantt,height=control.taskHeight;
		if(start>=finish || task.Milestone || task.Summary || gantt.readOnly || !task.canSetProperty("PercentComplete")){return;}
		percent=percent?percent:0;
		var left=(finish-start)/gantt.getScale()*percent/100;
		var div=mapObj.taskDiv.ownerDocument.createElement('div');
		mapObj[this.name]=div;
		div.style.cssText="position:absolute;width:"+(Math.floor((control.taskHeight-1)/2))+"px;background-color:#FFFFFF;left:"+left+"px;top:"+Math.ceil(control.taskPadding/2)+"px;height:"+(height+2)+"px;z-index:250;font-size:0px;cursor:col-resize;";
		mapObj.taskDiv.appendChild(div);
		SFGlobal.setOpacity(div,0.01);
	}
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapPercentChange.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf(),percent=task.PercentComplete,control=this.control,gantt=control.gantt;
		if(start>=finish || task.Summary || gantt.readOnly || !task.canSetProperty("PercentComplete") || gantt.disableUpdateTask || control.disableDragChangePercent){this.remove(task,mapObj);return;}
		var div=mapObj[this.name];
		if(!div)
		{
			this.show(task,mapObj);
		}
		else
		{
			var style=div.style,percent=percent?percent:0;
			if(SFGlobal.findInArray(changedFields,"PercentComplete") || SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish"))
			{
				style.left=(finish-start)/gantt.getScale()*percent/100+"px";
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
	SFGanttMapPercentChange.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		var percent=task.PercentComplete;
		percent=percent?percent:0;
		if(div){div.style.left=(task.Finish-task.Start)/this.control.gantt.getScale()*percent/100+"px";}
	}
	/**
	@private
	鼠标在任务上按下时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapPercentChange.prototype.onMouseDown=function(task,mapObj,e)
	{
		if(e.target!=mapObj[this.name]){return;}
		var control=this.control;
		new SFDragObject(control.div,SFEvent.getCallback(this,this.onPercentMove)).onMouseDown(e);
	}
	/**
	@private
	在拖拽百分比的过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttMapPercentChange.prototype.onPercentMove=function(sp,lp,type)
	{
		var control=this.control,gantt=control.gantt,task=control.dragTask,mapObj=gantt.getElementDrawObj(control.dragTask)[control.proTag],percentDiv=mapObj.Percent;
		if(!percentDiv){return;}
		var percent=task.PercentComplete,start=task.Start,finish=task.Finish,size=(finish-start)/gantt.getScale();
		if(!percent){percent=0;}
		if(type=="start")
		{
			if(gantt.getTooltip)
			{
				var tooltip=gantt.getTooltip();
				tooltip.setContent(control.getTaskTooltipContent(task,control.tooltipTitle.progress,["name","PercentComplete"]));
				var position=SFEvent.getPageOffset(mapObj.BarNormal,gantt.container);
				position[1]+=gantt.getElementDrawObj(task).height;
				tooltip.show(position);
			}
		}
		if(type!="end")
		{
			percent=Math.round(percent+(lp[0]-sp[0])*100/size);
			percent=Math.min(Math.max(0,percent),100);
			percentDiv.style.width=(finish-start)/gantt.getScale()*percent/100+"px";
			if(gantt.getTooltip)
			{
				gantt.getTooltip().setContent(control.getTaskTooltipContent({PercentComplete:percent,Name:task.Name},control.tooltipTitle.progress,["name","PercentComplete"]))
			}
		}
		else
		{
			var p=parseInt(percent+(lp[0]-sp[0])*100/size);
			p=Math.min(Math.max(0,p),100);
			if(!task.setProperty("PercentComplete",p))
			{
				percent=task.getProperty("PercentComplete");
				if(!percent){percent=0;}
				percentDiv.style.width=(finish-start)/gantt.getScale()*percent/100+"px";
			}
		}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapPercentChange.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapPercentChange=SFGanttMapPercentChange;