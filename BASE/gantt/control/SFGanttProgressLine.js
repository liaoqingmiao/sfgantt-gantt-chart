	/**
	这是一个甘特图功能控件，本控件实现任务甘特图进度线的显示
	@extends SFGanttControl
	@param {Date} [time] 进度线的时间，默认为当前时间
	@param {Json} [config] 进度线的显示参数
	@param {String} [config.vertexImg] 进度线的顶点图标，默认为<img src="http://www.51diaodu.cn/sfgantt/img/task_head_4_red.gif"/>
	@param {Number[]} [config.vertexSize] 进度线的顶点图标大小，默认为[11,11]
	@param {Number[]} [config.progressType] 进度线的类型，有normal(显示所有的进度),earlier(显示在指定时间之前的进度),later(显示在指定时间之后的进度)三种
	@param {Json} [config.vertexStyle] 进度线的顶点图标CSS附加样式，例如{border:'solid 1px green'}
	@param {Json} [config.lineColor='red'] 进度线的线条颜色
	@param {Json} [config.lineWeight=1] 进度线的线条宽度
	@class
	*/
	function SFGanttProgressLine(time,config)
	{
		this.time=time?SFGlobal.getDate(time):new Date();
		this.progressType="normal";
		SFGlobal.setProperty(this,{vertexSize:[11,11],lineColor:'red',lineWeight:1});
		SFGlobal.setProperty(this,config);
	}
	SFGanttProgressLine.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttProgressLine.prototype.initialize=function(gantt)
	{
		if(!gantt.getMapPanel){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttProgressLine"));
		if(!SFGanttProgressLine.listIndex){SFGanttProgressLine.listIndex=0;}
		this.proTag="progressLine_"+(SFGanttProgressLine.listIndex++);
		SFGlobal.setProperty(this,{
			gantt:gantt,
			taskHeight:12,	
			lineStyle:gantt.config.getConfigObj("SFGanttProgressLine/lineStyle")
		});
		this.taskPadding=gantt.itemHeight-this.taskHeight;
		//图表的任务显示层
		var linesDiv=this.div=gantt.container.ownerDocument.createElement('div');
		SFGlobal.setProperty(linesDiv.style,{position:'absolute',fontSize:'0px',top:'-1px',left:'0px',zIndex:190});
		gantt.getMapPanel().appendChild(linesDiv);
		this.listeners=[
			SFEvent.bind(gantt,"afterscalechange",this,this.onScale),
			SFEvent.bind(gantt,"taskinview",this,this.drawLine),
			SFEvent.bind(gantt,"taskoutview",this,this.clearLine),
			SFEvent.bind(gantt,"taskchange",this,this.updateLine),
			SFEvent.bind(gantt,"elementheightchanged",this,this.onScale)
		];
		if(this.lineNoticeFields && gantt.setTooltip)
		{
			gantt.setTooltip(linesDiv,SFEvent.getCallback(this,this.getTooltip))
		}
		this.onScale();
		return true;
	}
	/**
	根据浏览器的支持得到对应的Canvas
	@private
	@returns {__MapGraphics}
	*/
	SFGanttProgressLine.prototype.getGraphics=function()
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
	在甘特图缩放比例变化或者添加、删除任务时完全的重绘所有线条
	@private
	*/
	SFGanttProgressLine.prototype.onScale=function()
	{
		var viewTasks=this.gantt.getViewElements();
		if(!viewTasks){return}
		for(var i=0;i<viewTasks.length;i++)
		{
			this.clearLine(viewTasks[i],0);
		}
		if(!this.refreshTimeout){this.refreshTimeout=window.setInterval(SFEvent.getCallback(this,this.onTime),100);}
		this.changed=true;
		this.idleTimes=0;
	}
	/**
	在接收到重绘请求之后的延时处理以提升性能
	@private
	*/
	SFGanttProgressLine.prototype.onTime=function()
	{
		if(!this.changed)
		{
			this.idleTimes++;
			if(this.idleTimes>4)
			{
				window.clearInterval(this.refreshTimeout);
				delete this.refreshTimeout
				this.refresh();
			}
			return;
		}
		this.changed=false;
	}
	/**
	重绘所有进度线条
	@private
	*/
	SFGanttProgressLine.prototype.refresh=function()
	{
		//设置起始绘制原点
		var viewTasks=this.gantt.getViewElements();
		if(!viewTasks){return}
		if(this.refreshTimeout){window.clearTimeout(this.refreshTimeout);}
		this.refreshTimeout=null;
		for(var i=0;i<viewTasks.length;i++)
		{
			this.drawLine(viewTasks[i],i);
		}
	}
	/**
	判断一个任务是否应该绘制顶点
	@param {SFDataTask} task
	@returns {Bool} 如果需要绘制，返回true
	@private
	*/
	SFGanttProgressLine.prototype.hasVertex=function(task)
	{
		return  task.Start && 
			task.Finish && 
			task.Start<=this.time &&
			(task.PercentComplete!=100 || (task.Finish>=this.time));
	}
	/**
	返回一个任务的顶点对应的时间
	@param {SFDataTask} task
	@returns {Date}
	@private
	*/
	SFGanttProgressLine.prototype.getVertexTime=function(task)
	{
		var percentComplete=task.PercentComplete?task.PercentComplete:0,time=task.Start.valueOf()+(task.Finish-task.Start)*percentComplete/100;
		switch(this.progressType)
		{
			case "earlier":
				time=Math.min(time,this.time);
				break;
			case "later":
				time=Math.max(time,this.time);
				break;
		}
		return time;
	}
	/**
	绘制指定任务和下一个视图任务之间的进度线
	@param {SFDataTask} task 
	@private
	*/
	SFGanttProgressLine.prototype.drawLine=function(task)
	{
		if(this.refreshTimeout){return;}//如果马上要重回全部，则取消
		var gantt=this.gantt,scale=gantt.getScale();
		if(!scale){return}//如果还没有定义缩放比例，则取消
		var drawObj=gantt.getElementDrawObj(task);
		if(drawObj[this.proTag]){return;}//如果已经绘制完成，则取消
		if(!this.hasVertex(task)){return;}//如果此任务处没有顶点，则取消

		//在这里寻找上一个有效顶点
		var objTask=task.getPreviousView();
		while(objTask)
		{
			if(this.hasVertex(objTask)){break;}
			objTask=objTask.getPreviousView();
		}
		var sp,ep;
		if(!objTask)
		{//如果上一个有效顶点不存在，则从最上端指定时间线的位置处开始连线
			sp=[gantt.getMapPanelPosition(this.time),0];
		}
		else
		{
			
			sp=[gantt.getMapPanelPosition(this.getVertexTime(objTask)),gantt.getElementViewTop(objTask)+gantt.getElementDrawObj(objTask).height/2];
		}
		var ep=[gantt.getMapPanelPosition(this.getVertexTime(task)),gantt.getElementViewTop(task)+gantt.getElementDrawObj(task).height/2];
		//下面开始画顶点
		var vertexSize=this.vertexSize,vImg=gantt.createImage(this.vertexImg?this.vertexImg:"task_head_4",{color:this.vertexColor?this.vertexColor:'#FF0000',size:this.vertexSize})
		SFGlobal.setProperty(vImg.style,{position:'absolute',fontSize:"0px",left:(ep[0]-Math.floor(vertexSize[0]/2))+'px',top:(ep[1]-Math.floor(vertexSize[1]/2))+'px'});
		drawObj[this.proTag]=vImg;
		this.div.appendChild(vImg);
		//下面开始画线
		var graphics=this.getGraphics();
		graphics.setLineColor(this.lineColor);
		graphics.setLineWeight(this.lineWeight);
		drawObj[this.proTag+"_l"]=graphics.div;
		var op={x:Math.min(sp[0],ep[0]),y:Math.min(sp[1],ep[1])}
		graphics.setPosition(op);
		graphics.start({x:0,y:0},1,{x:Math.abs(sp[0]-ep[0]),y:Math.abs(sp[1]-ep[1])});
		graphics.moveTo({x:sp[0]-op.x,y:sp[1]-op.y});
		graphics.lineTo({x:ep[0]-op.x,y:ep[1]-op.y});
		graphics.finish();
		graphics._task=task;
		this.div.appendChild(graphics.div);
	}
	/**
	清除指定任务和下一个视图任务之间的进度线
	@private
	@param {SFDataTask} task 
	@param {Number} viewIndex 该任务在视图任务数组之中的索引
	*/
	SFGanttProgressLine.prototype.clearLine=function(task,viewIndex)
	{
		var drawObj=this.gantt.getElementDrawObj(task);
		if(!drawObj){return}
		if(drawObj[this.proTag])
		{
			SFEvent.deposeNode(drawObj[this.proTag]);
			delete drawObj[this.proTag];
			SFEvent.deposeNode(drawObj[this.proTag+"_l"]);
			delete drawObj[this.proTag+"_l"];
		}
	}
	/**
	在任务发生变化时检查并在需要时重绘进度线
	@private
	@param {SFDataTask} task 
	@param {String[]} changedFields 更改过的属性名称数组
	*/
	SFGanttProgressLine.prototype.updateLine=function(task,changedFields)
	{
		var redrawAll=false,redraw=false;
		for(var i=0;i<changedFields.length;i++)
		{
			var field=changedFields[i];
			if(field=='Collapse')
			{
				redrawAll=true;
				break;
			}
			if(!redraw && (field=='Start' || field=='Finish'  || field=='PercentComplete'))
			{
				redraw=true;
			}
		}
		if(redrawAll)
		{
			this.onScale();
		}
		else if(redraw)
		{
			//在这里寻找上一个有效顶点
			var lastTask=task.getNextView();
			while(lastTask)
			{
				if(this.hasVertex(lastTask)){break;}
				lastTask=lastTask.getNextView();
			}
			if(lastTask)
			{
				this.clearLine(lastTask);
				this.drawLine(lastTask);
			}
			this.clearLine(task);
			this.drawLine(task);
		}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttProgressLine.prototype.remove=function()
	{
		this.onScale();
		if(this.refreshTimeout){window.clearInterval(this.refreshTimeout);}
		delete this.refreshTimeout;
		SFEvent.deposeNode(this.div);
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	/**
	销毁此功能控件以释放内存
	*/
	SFGanttProgressLine.prototype.depose=function()
	{
		for(var key in this){this[key]=null;}
	}
	window.SFGanttProgressLine=SFGanttProgressLine;