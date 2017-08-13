	/**
	本绘制项实现一般任务横条的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapBarNormal()
	{
	}
	SFGanttMapBarNormal.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapBarNormal.prototype.initialize=function(control)
	{
		SFGlobal.setProperty(this,{control:control,name:'BarNormal'});
		return true;
	};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapBarNormal.prototype.show=function(task,mapObj,scale)
	{
		var start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start>=finish || task.Milestone || task.Summary){return;}
		var control=this.control,gantt=control.gantt,div=mapObj.taskDiv.ownerDocument.createElement('div');
		scale=scale?scale:gantt.getScale();
		mapObj[this.name]=div;
		var height=control.taskHeight*(gantt.isTracking?control.trackNormalHeightScale:1);
		div.style.cssText="position:absolute;font-size:0px;z-index:100;left:0px;width:"+((finish-start)/scale)+"px;top:"+Math.ceil(control.taskPadding/2+control.taskHeight*control.trackNormalTopScale)+"px;height:"+height+"px;cursor:move;";
		var taskStyle=control.getTaskStyle(task),bStyle=taskStyle.barStyle;
		if(bStyle)
		{
			if(bStyle.bgImage)
			{
				gantt.setBackgroundImage(div,bStyle.bgImage,{color:bStyle.bgColor});
			}
			SFGlobal.setProperty(div.style,bStyle);
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
	SFGanttMapBarNormal.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var gantt=this.control.gantt,start=task.Start.valueOf(),finish=task.Finish.valueOf();
		if(start>=finish || task.Summary){this.remove(task,mapObj);return;}
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
			if(SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish"))
			{
				div.style.left="0px";
				style.width=((finish-start)/gantt.getScale())+"px";
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
	SFGanttMapBarNormal.prototype.getTooltip=function(task,mapObj,tooltip,e)
	{
		if(e.target!=mapObj[this.name] || !this.control.taskNoticeFields){return false;}
		var control=this.control;
		if(tooltip && tooltip.bindObject==task && tooltip.bindType=="Task"){return false;}
		var table=control.getTaskTooltipContent(task,control.tooltipTitle.task,control.taskNoticeFields.split(","));
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
	SFGanttMapBarNormal.prototype.onScale=function(task,mapObj,scale)
	{
		var div=mapObj[this.name];
		if(div){div.style.width=((task.Finish-task.Start)/scale)+"px";}
	}
	/**
	@private
	鼠标在任务上按下时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapBarNormal.prototype.onMouseDown=function(task,mapObj,e)
	{
		if(e.target!=mapObj[this.name]){return;}
		//下面这一句我不知道是干啥，可能是无效的语句
		SFEvent.trigger(mapObj[this.name],"click",[]);
		new SFDragObject(this.control.div,SFEvent.getCallback(this,this.onMove),{interval:32}).onMouseDown(e);
	}
	/**
	@private
	在拖拽任务条的过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttMapBarNormal.prototype.onMove=function(sp,lp,type)
	{
		var control=this.control,gantt=control.gantt,task=control.dragTask,mapObj=gantt.getElementDrawObj(task)[control.proTag];
		var span=[lp[0]-sp[0],lp[1]-sp[1]]
		if(!control.dragType)
		{
			if(Math.sqrt(Math.pow(span[0],2)+Math.pow(span[1],2))<5){return;}
			if(span[0]==0 || span[1]/span[0]>2 && !control.gantt.readOnly && control.gantt.data.canAddLink(task) && !control.gantt.disableAddLink && !control.disableDragAddLink)
			{
				control.dragType="Link";
				control.startHeight=mapObj.taskDiv.offsetTop;
				//从这里开始设置拖动时候现实的提示信息
				var link={Type:1,PredecessorTask:task};
				control.dragLink=link;
				if(gantt.getTooltip)
				{
					var tooltip=gantt.getTooltip();
					gantt.getTooltip().setEnable(false);
					tooltip.setContent(control.getLinkTooltipContent(link));
					tooltip.show([0,0]);
				}
				mapObj[this.name].style.borderStyle="dashed";
			}
			else if((span[1]==0 || span[0]/span[1]>2) && !gantt.readOnly && task.canSetProperty("Start") && !control.gantt.disableUpdateTask && !control.disableDragMoveTask)
			{
				control.dragType="Start";
				if(gantt.getTooltip)
				{
					var tooltip=gantt.getTooltip();
					tooltip.setContent(control.getTaskTooltipContent(task,control.tooltipTitle.task,["Start","Finish"]));
					gantt.getTooltip().setEnable(false);
					var position=SFEvent.getPageOffset(mapObj.taskDiv,gantt.container);
					position[1]+=gantt.getElementDrawObj(task).height;
					tooltip.show(position);
				}
				/** 
					@event
					@name SFGantt#taskbardragstart
					@private
					@description 在甘特图的任务条拖动过程开始时触发，没有地方在使用
					@param {SFDataTask} task 被拖动的任务
				 */
				SFEvent.trigger(gantt,"taskbardragstart",[task]);
			}
			else{return;}
		}
		if(control.dragType=="Start")
		{
			var offset=span[0]*gantt.getScale();
			var start=new Date(task.Start.valueOf()+offset),finish=new Date(task.Finish.valueOf()+offset);
			if(type!="end")
			{
				//检查是不是到达了区域的边缘
				var left=lp[0]+gantt.getMapPanel().offsetLeft;
				if(left<=0 || left>gantt.getLayout("mapBody").offsetWidth)//如果鼠标拖拽到了左侧边界
				{
					this.dmDir=(left<=0)?-1:1;
					this.lastOffset=span[0];
					if(!this.dmt){this.dmt=window.setInterval(SFEvent.getCallback(this,this.onTime),32);}
				}
				else
				{
					if(this.dmt)
					{
						window.clearInterval(this.dmt);
						delete this.dmt;
					}
				}
				//调整位置
				mapObj[this.name].style.left=gantt.getMapPanelPosition(start)-gantt.getTimePanelPosition(task.Start)+"px";
				if(gantt.getTooltip)
				{
					gantt.getTooltip().setContent(control.getTaskTooltipContent({Start:start,Finish:finish},control.tooltipTitle.task,["Start","Finish"]));
					gantt.getTooltip().setEnable(false);
				}
			}
			else
			{
				if(this.dmt)
				{
					window.clearInterval(this.dmt);
					delete this.dmt;
				}
				if(task.canSetProperty("Finish",finish) && task.canSetProperty("Start",start))
				{
					task.setProperty("Finish",finish);
					task.setProperty("Start",start);
					/** 
						@event
						@name SFGantt#taskbardragend
						@private
						@description 在甘特图的任务条拖动过程结束时触发，似乎已经过期，没有地方在使用
						@param {SFDataTask} task 被拖动的任务
					 */
				}
				else
				{//如果不能设置，则恢复
					mapObj[this.name].style.left="0px";
				}
				SFEvent.trigger(gantt,"taskbardragend",[task]);
				if(gantt.getTooltip){gantt.getTooltip().setEnable(true);}
				delete control.dragType
			}
		}
		else
		{
			//清除所有线条
			if(control.dragFlagLine){SFEvent.deposeNode(control.dragFlagLine);}
			if(type!="end")
			{
				var offset=SFEvent.getPageOffset(mapObj.taskDiv,control.div);
				var points=[];
				points.push([sp[0],sp[1]]);
				points.push([lp[0],lp[1]]);
				//开始绘制线条
				var minX=Number.MAX_VALUE,minY=Number.MAX_VALUE,maxX=0,maxY=0;
				for(var i=0;i<points.length;i++)
				{
					minX=Math.min(minX,points[i][0])
					minY=Math.min(minY,points[i][1])
					maxX=Math.max(maxX,points[i][0])
					maxY=Math.max(maxY,points[i][1])
				}
				var graphics=this.getGraphics();
				control.div.appendChild(graphics.div);
				graphics.setLineColor("#000000")
				graphics.setLineWeight(1);
				graphics.setPosition({x:minX,y:minY});
				graphics.start({x:0,y:0},1,{x:maxX-minX,y:maxY-minY});
				graphics.moveTo({x:points[0][0]-minX,y:points[0][1]-minY});
				for(var i=1;i<points.length;i++)
				{
					graphics.lineTo({x:points[i][0]-minX,y:points[i][1]-minY});
				}
				graphics.finish();
				control.dragFlagLine=graphics.div;
				//在这里计算当前拖动到了哪个任务上
				var distance=lp[1]-control.startHeight;
				var t=task;
				if(distance<0){t=t.getPreviousViewTask();}
					//首先通过循环找到对应纵向位置的第一个任务
				while(t)
				{
					var nextDis=distance+(distance<0?1:-1)*gantt.getElementHeight(t);
					if(distance*nextDis<=0){break;}
					t=distance>0?t.getNextViewTask():t.getPreviousViewTask();
					distance=nextDis;
				}
					//在通过时间找到横向对应的任务
				var eTime=gantt.getTimeByMapPanelPosition(lp[0]);
				while(t)
				{
					if(t.Start<=eTime && eTime<=t.Finish){break;}
					t=distance>0?t.getNextViewTask():t.getPreviousViewTask();
					if(gantt.getElementHeight(t)>0){t=null;}
				}
				if(t==task){t=null;}
				//在这里判断是不是正好处在该甘特条上，如果不是，则退出
				if(t)
				{
					var objSpan=gantt.getElementDrawObj(t)[control.proTag].taskDiv;
					var objOffset=SFEvent.getPageOffset(objSpan,control.div);
					if(lp[0]<objOffset[0]-10 || lp[0]>objOffset[0]+objSpan.offsetWidth+10){t=null;}
				}
				var lastLinkTask=control.dragLink.SuccessorTask,linkTaskMapObj;
				
				if(lastLinkTask!=t)
				{
					if(t)
					{
						linkTaskMapObj=gantt.getElementDrawObj(t)[control.proTag];
						if(linkTaskMapObj && linkTaskMapObj[this.name])
						{
							linkTaskMapObj[this.name].style.borderStyle="dashed";
						}
					}
					if(lastLinkTask)
					{
						linkTaskMapObj=gantt.getElementDrawObj(lastLinkTask)[control.proTag];
						if(linkTaskMapObj && linkTaskMapObj[this.name])
						{
							linkTaskMapObj[this.name].style.borderStyle="solid";
						}
					}
					control.dragLink.SuccessorTask=t;
					if(gantt.getTooltip)
					{
						gantt.getTooltip().setContent(control.getLinkTooltipContent(control.dragLink));
						gantt.getTooltip().setEnable(false);
					}
				}
			}
			else
			{
				//如果当前任务和目标任务都存在，则添加链接
				var lastLinkTask=control.dragLink.SuccessorTask;
				if(control.dragLink && lastLinkTask)
				{
					lastLinkTask.addPredecessorLink(task,1);
				}
				//清除目标任务的边框虚线
				if(lastLinkTask)
				{
					var linkTaskMapObj=gantt.getElementDrawObj(lastLinkTask)[control.proTag];
					if(linkTaskMapObj && linkTaskMapObj[this.name])
					{
						linkTaskMapObj[this.name].style.borderStyle="solid";
					}
				}
				//清除当前任务的边框虚线
				mapObj[this.name].style.borderStyle="solid";
				if(gantt.getTooltip){gantt.getTooltip().setEnable(true);}
				delete control.dragType;
				delete control.dragTask;
			}
		}
	}
	/**
	@private
	如果鼠标在拖拽过程之中接近了边界，则自动的调整甘特的起始时间
	*/
	SFGanttMapBarNormal.prototype.onTime=function()
	{
		var control=this.control,gantt=control.gantt,task=control.dragTask,mapObj=gantt.getElementDrawObj(task)[control.proTag];
		gantt.setStartTime(new Date(gantt.getStartTime().valueOf()+gantt.getScale()*6*this.dmDir));
		this.lastOffset+=6*this.dmDir
		var start=new Date(task.Start.valueOf()+this.lastOffset*gantt.getScale());
		mapObj[this.name].style.left=gantt.getMapPanelPosition(start)-gantt.getTimePanelPosition(task.Start)+"px";
	}
	/**
	根据浏览器的支持得到对应的Canvas
	@private
	@returns {__MapGraphics}
	*/
	SFGanttMapBarNormal.prototype.getGraphics=function()
	{
		var graphics=[SFGraphicsSvg,SFGraphicsVml,SFGraphicsCanvas,SFGraphicsDiv];
		for(var i=0;i<graphics.length;i++)
		{
			if(graphics[i].isSupport())
			{
				return new graphics[i]();
			}
		}
		return new SFGraphics(true);
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapBarNormal.prototype.remove=function(task,mapObj)
	{
		SFEvent.deposeNode(mapObj[this.name]);
		delete mapObj[this.name];
	}
	window.SFGanttMapBarNormal=SFGanttMapBarNormal;