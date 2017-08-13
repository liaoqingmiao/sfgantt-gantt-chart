	/**
	这是一个甘特图功能控件，本控件实现在甘特图上显示任务之间的链接肩头的功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttLinksMap()
	{
	}
	SFGanttLinksMap.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttLinksMap.prototype.initialize=function(gantt)
	{
		if(gantt.disableLinksMap || !gantt.getMapPanel){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttTasksMap"));
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttLinksMap"));
		SFGlobal.setProperty(this,{
			gantt:gantt,
			arrayPadding:10,					//箭头和任务之间的距离(特定情况下使用)
			linkStyles:gantt.config.getConfigObj("SFGantt/linkStyle")
		});
		this.taskPadding=gantt.itemHeight-this.taskHeight;
		//图表的任务显示层
		var linksDiv=this.div=gantt.container.ownerDocument.createElement('div');
		SFGlobal.setProperty(linksDiv.style,{position:'absolute',fontSize:'0px',top:'-1px',left:'0px',zIndex:200});
		gantt.getMapPanel().appendChild(linksDiv);
		this.linkNoticeFields=this.linkNoticeFields?SFGanttField.getLinkFields(this.linkNoticeFields.split(",")):null;
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onInit),
			SFEvent.bind(gantt,"afterscalechange",this,this.onScale),
			SFEvent.bind(gantt,"taskinview",this,this.drawLinks),
			SFEvent.bind(gantt,"taskoutview",this,this.clearLinks),
			SFEvent.bind(gantt,"taskchange",this,this.updateLinks),
			SFEvent.bind(gantt,"elementheightchanged",this,this.onScale),
			SFEvent.bind(linksDiv,"click",this,this.onLinkClick),
			SFEvent.bind(linksDiv,"dblclick",this,this.onLinkDblClick)
		];
		if(this.linkNoticeFields && gantt.setTooltip)
		{
			gantt.setTooltip(linksDiv,SFEvent.getCallback(this,this.getTooltip))
		}
		this.inited=false;
		this.onInit();
		return true;
	}
	/**
	在甘特图初始化时进行必要的事件绑定
	@private
	*/
	SFGanttLinksMap.prototype.onInit=function()
	{
		var data=this.gantt.getData();
		if(!data || this.inited){return;}
		this.listeners=this.listeners.concat([
			SFEvent.bind(data,"linkregister",this,this.drawLink),
			SFEvent.bind(data,"linkunregister",this,this.clearLink),
			SFEvent.bind(data,"afterlinkchange",this,this.updateLink),
			SFEvent.bind(data,"aftertaskadd",this,this.onScale),
			SFEvent.bind(data,"aftertaskdelete",this,this.onScale)
		]);
		this.inited=true;
		this.refresh();
	}
	/**
	在甘特图缩放比例变化或者添加、删除任务时完全的重绘所有箭头
	@private
	*/
	SFGanttLinksMap.prototype.onScale=function()
	{
		var viewTasks=this.gantt.getViewElements();
		if(!viewTasks){return}
		for(var i=0;i<viewTasks.length;i++)
		{
			this.clearLinks(viewTasks[i],0);
		}
		this.changed=true;
		this.idleTimes=0;
		if(!this.gantt.forPrint)
		{
			if(!this.refreshTimeout){this.refreshTimeout=window.setInterval(SFEvent.getCallback(this,this.onTime),100);}
		}
		else
		{
			this.refresh();
		}
	}
	/**
	在接收到重绘请求之后的延时处理以提升性能
	@private
	*/
	SFGanttLinksMap.prototype.onTime=function()
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
	重绘所有链接箭头
	@private
	*/
	SFGanttLinksMap.prototype.refresh=function()
	{
		//设置起始绘制原点
		var viewTasks=this.gantt.getViewElements();
		if(!viewTasks){return}
		if(this.refreshTimeout){window.clearTimeout(this.refreshTimeout);}
		this.refreshTimeout=null;
		for(var i=0;i<viewTasks.length;i++)
		{
			this.drawLinks(viewTasks[i],i);
		}
	}
	/**
	绘制指定任务的所有链接箭头
	@param {SFDataTask} task 
	@param {Number} viewIndex 该任务在视图任务数组之中的索引
	@private
	*/
	SFGanttLinksMap.prototype.drawLinks=function(task,viewIndex)
	{
		var links=task.getPredecessorLinks();
		for(var i=0;i<links.length;i++)
		{
			this.drawLink(links[i],true);
		}
		var links=task.getSuccessorLinks();
		for(var i=0;i<links.length;i++)
		{
			this.drawLink(links[i],false);
		}
	}
	/**
	清除指定任务的所有链接箭头
	@private
	@param {SFDataTask} task 
	@param {Number} viewIndex 该任务在视图任务数组之中的索引
	*/
	SFGanttLinksMap.prototype.clearLinks=function(task,viewIndex)
	{
		var links=task.getPredecessorLinks();
		for(var i=0;i<links.length;i++)
		{
			this.clearLink(links[i]);
		}
		var links=task.getSuccessorLinks();
		for(var i=0;i<links.length;i++)
		{
			this.clearLink(links[i]);
		}
	}
	/**
	在任务发生变化时检查并在需要时重绘箭头
	@private
	@param {SFDataTask} task 
	@param {String[]} changedFields 更改过的属性名称数组
	*/
	SFGanttLinksMap.prototype.updateLinks=function(task,changedFields)
	{
		var redrawAllLink=false,redrawLink=false;
		for(var i=0;i<changedFields.length;i++)
		{
			var field=changedFields[i];
			if(field=='Collapse')
			{
				redrawAllLink=true;
				break;
			}
			if(!redrawLink && (field=='Start' || field=='Finish'))
			{
				redrawLink=true;
			}
		}
		if(redrawAllLink)
		{
			this.onScale();
		}
		else if(redrawLink)
		{
			this.clearLinks(task,0);
			this.drawLinks(task);
		}
	}
	/**
	在链接发生变化时检查并在需要时重绘箭头
	@private
	@param {SFDataLink} link
	*/
	SFGanttLinksMap.prototype.updateLink=function(link)
	{
		if(this.gantt.getElementDrawObj(link))
		{
			this.clearLink(link);
			this.drawLink(link);
		}
	}
	/**
	绘制指定的链接箭头
	@private
	@param {SFDataLink} link
	*/
	SFGanttLinksMap.prototype.drawLink=function(link)
	{
		if(this.refreshTimeout){return;}
		var gantt=this.gantt,objTask=link.PredecessorTask,task=link.SuccessorTask,scale=gantt.getScale();
		if(gantt.getElementDrawObj(link).linkImg){return;}
		//如果箭头的终点任务被隐藏，则不绘制箭头
		if(!scale || objTask.isHidden() || task.isHidden()){return;}
		var drawObj=gantt.getElementDrawObj(link),
			objFinish=objTask.Milestone?objTask.Start:objTask.Finish,
			finish=task.Milestone?task.Start:task.Finish;
		if(!objTask.Start || !objFinish || !task.Start || !finish){return;}
		var sOffset=[gantt.getMapPanelPosition(objTask.Start),gantt.getElementViewTop(objTask)+2];
		var eOffset=[gantt.getMapPanelPosition(task.Start),gantt.getElementViewTop(task)+2];
		//下面针对显示的纵向偏移做处理：
		var lineOffset;
		if(gantt.getElementHeight(objTask)==0 && (lineOffset=gantt.getElementHeight(objTask)-gantt.getElementDrawObj(objTask).height)!=0){sOffset[1]+=lineOffset;}
		if(gantt.getElementHeight(task)==0 && (lineOffset=gantt.getElementHeight(task)-gantt.getElementDrawObj(task).height)!=0){eOffset[1]+=lineOffset;}

		var sWidth=(objFinish-objTask.Start)/scale;
		var eWidth=(finish-task.Start)/scale;
		var taskTop=Math.ceil(this.taskPadding/2+this.taskHeight*this.trackNormalTopScale)-1,taskHeight=Math.ceil(this.taskHeight*(gantt.isTracking?this.trackNormalHeightScale:1)),barTop=Math.ceil(taskTop+taskHeight/2);
		var dir,arrowSize,position,points=[],arrowStyle={},lineStyle={borderStyle:'solid'},color='#000000';
		var className=link.ClassName;
		className=className?className:this.linkStyle;
		var linkStyle=this.linkStyles[className];
		if(linkStyle)
		{
			if(linkStyle.color){color=linkStyle.color;}
			if(linkStyle.lineStyle){lineStyle=linkStyle.lineStyle;}
		}
		lineStyle.borderColor=color;
		switch(parseInt(link.Type))
		{
			case 0://完成->完成
				dir="left";
				arrowSize=[5,9];
				var asLeft=sOffset[0]+sWidth;
				var asTop=sOffset[1]+barTop;
				var aeLeft=eOffset[0]+eWidth;
				var aeTop=eOffset[1]+barTop;
				var aLeft=Math.max(asLeft,aeLeft)+this.arrayPadding;
				points.push([asLeft,asTop]);
				points.push([aLeft,asTop]);
				points.push([aLeft,aeTop]);
				points.push([aeLeft,aeTop]);
				position=[aeLeft,aeTop-Math.floor(arrowSize[1]/2)];
				break;
			case 2://开始->完成
				dir="left";
				arrowSize=[5,9];
				//开始计算位置
				var asLeft=sOffset[0];
				var asTop=sOffset[1]+barTop;
				var aeLeft=eOffset[0]+eWidth+arrowSize[0];
				var aeTop=eOffset[1]+barTop;
				points.push([asLeft,asTop]);
				points.push([asLeft-this.arrayPadding,asTop]);
				points.push([asLeft-this.arrayPadding,eOffset[1]]);
				points.push([eOffset[0]+eWidth+this.arrayPadding,eOffset[1]]);
				points.push([eOffset[0]+eWidth+this.arrayPadding,aeTop]);
				points.push([aeLeft,aeTop]);
				position=[aeLeft-arrowSize[0],aeTop-Math.floor(arrowSize[0]/2)];
				break;
			case 3://开始->开始
				dir="right";
				arrowSize=[5,9];
				var asLeft=sOffset[0];
				var asTop=sOffset[1]+barTop;
				var aeLeft=eOffset[0];
				var aeTop=eOffset[1]+barTop;
				var aLeft=Math.min(asLeft,aeLeft)-this.arrayPadding;
				points.push([asLeft,asTop]);
				points.push([aLeft,asTop]);
				points.push([aLeft,aeTop]);
				points.push([aeLeft,aeTop]);
				position=[aeLeft-arrowSize[0],aeTop-Math.floor(arrowSize[1]/2)];
				break;
			case 1://完成->开始
			default:
				var asLeft=sOffset[0]+sWidth;
				var asTop=sOffset[1]+barTop;
				if(objFinish<=task.Start && eOffset[1]!=sOffset[1])
				{
					dir=sOffset[1]>eOffset[1]?"up":"down";
					arrowSize=[9,5];
					//开始计算位置
					var aeLeft=eOffset[0];
					if(objFinish.valueOf()==objTask.Start.valueOf()){asTop-=3;}//如果起点任务是一个大纲
					var aeTop=sOffset[1]>eOffset[1]?(eOffset[1]+(gantt.itemHeight-taskTop-taskHeight)+this.taskHeight):(eOffset[1]+taskTop-arrowSize[1]);
					if(finish.valueOf()-task.Start.valueOf()==0){aeTop-=3;}//如果终点任务是一个大纲
					if(finish.valueOf()-task.Start.valueOf()!=0 && objFinish.valueOf()!=objTask.Start.valueOf())
					{
						aeLeft=Math.max(aeLeft,asLeft+5);
					}
					points.push([asLeft,asTop]);
					points.push([aeLeft,asTop]);
					points.push([aeLeft,aeTop]);
					position=[(aeLeft-Math.floor(arrowSize[0]/2)-1),aeTop];
				}
				else
				{
					dir="right";
					arrowSize=[5,9];
					//开始计算位置
					var aeLeft=eOffset[0]-arrowSize[0];
					var aeTop=eOffset[1]+barTop;
					points.push([asLeft,asTop]);
					if(eOffset[1]!=sOffset[1])
					{
						points.push([asLeft+this.arrayPadding,asTop]);
						points.push([asLeft+this.arrayPadding,eOffset[1]]);
						points.push([eOffset[0]-this.arrayPadding,eOffset[1]]);
						points.push([eOffset[0]-this.arrayPadding,aeTop]);
					}
					points.push([aeLeft,aeTop]);
					position=[aeLeft,aeTop-Math.floor(arrowSize[1]/2)];
				}
				break;
		}
		drawObj.linkPaths=this.getLinkPaths(points,lineStyle,link);
		
		var linkImg=gantt.createImage("arrow_"+dir,{color:color,position:position});
		SFGlobal.setProperty(linkImg.style,arrowStyle);
		SFGlobal.setProperty(linkImg.style,{position:'absolute',fontSize:"0px"});
		drawObj.linkImg=linkImg;
		linkImg._link=link;
		this.div.appendChild(linkImg);
	}
	/**
	通过点坐标数组绘制出路径线条，并返回相应的层
	@private
	@param {Number[][]} points 需要绘制线条的路径数组
	@param {Json} linkStyle 链接线的CSS样式对象
	@param {SFDataLink} link 链接元素
	@returns {HtmlElement[]} 返回绘制的所有层数组
	*/
	SFGanttLinksMap.prototype.getLinkPaths=function(points,linkStyle,link)
	{
		var paths=[],doc=this.gantt.container.ownerDocument;
		for(var i=1;i<points.length;i++)
		{
			var div=doc.createElement('div');
			SFGlobal.setProperty(div.style,linkStyle);
			SFGlobal.setProperty(div.style,{position:'absolute',fontSize:"0px",borderWidth:'0px'});
			if(points[i-1][0]==points[i][0])
			{
				SFGlobal.setProperty(div.style,{borderRightWidth:'1px',height:Math.abs(points[i][1]-points[i-1][1])+'px',width:0+'px',left:(points[i][0]-1)+'px',top:(Math.min(points[i][1],points[i-1][1]))+'px'});
			}
			else if(points[i-1][1]==points[i][1])
			{
				SFGlobal.setProperty(div.style,{borderTopWidth:'1px',width:Math.abs(points[i][0]-points[i-1][0])+'px',height:0+'px',left:(Math.min(points[i][0],points[i-1][0]))+'px',top:(points[i][1])+'px'});
			}
			this.div.appendChild(div);
			div.aaa='bbb'
			div._link=link;
			paths.push(div);
		}
		return paths;
	}
	/**
	清除已经绘制的链接箭头
	@private
	@param {SFDataLink} link 链接元素
	*/
	SFGanttLinksMap.prototype.clearLink=function(link)
	{
		var drawObj=this.gantt.getElementDrawObj(link);
		if(!drawObj){return}
		if(drawObj.linkImg)
		{
			SFEvent.deposeNode(drawObj.linkImg);
			drawObj.linkImg._link=null;
			drawObj.linkImg=null;
		}
		if(drawObj.linkPaths)
		{
			var p;
			while(p=drawObj.linkPaths.pop())
			{
				p._link=null;
				SFEvent.deposeNode(p);
			}
			drawObj.linkPaths=null;
		}
		this.gantt.removeElementDrawObj(link)
	}
	/**
	在链接线被点击时触发链接元素的点击事件
	@private
	@param {Event} e 浏览器的鼠标事件
	*/
	SFGanttLinksMap.prototype.onLinkClick=function(e)
	{
		var link=e.target._link;
		if(!link){return;}
		/** 
			@event
			@name SFGantt#linkclick
			@description 在一个链接被单击时触发。
			@param {SFDataLink} link 被单击的链接.
			@param {Event} e 浏览器的鼠标事件
		 */
		SFEvent.trigger(this.gantt,"linkclick",[link,e]);
	}
	/**
	在链接线被双击时触发链接元素的双击事件
	@private
	@param {Event} e 浏览器的鼠标事件
	*/
	SFGanttLinksMap.prototype.onLinkDblClick=function(e)
	{
		var link=e.target._link;
		if(!link){return;}
		SFEvent.cancelBubble(e);
		/** 
			@event
			@name SFGantt#linkdblclick
			@description 在一个链接被双击时触发。
			@param {SFDataLink} link 被双击的链接.
		 */
		SFEvent.trigger(this.gantt,"linkdblclick",[link]);
	}
	/**
	鼠标在链接上滑过时显示提示信息
	@private
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器的鼠标事件
	@returns {Bool} 如果需要显示提示，返回true,否则返回false
	*/
	SFGanttLinksMap.prototype.getTooltip=function(tooltip,e)
	{
		var link=e.target._link,doc=this.gantt.container.ownerDocument;
		if(!link){return;}
		if(tooltip.bindObject==link){return false;}
		var table=doc.createElement("table");
		table.style.fontSize="12px";
		var row=table.insertRow(-1);
		var cell=row.insertCell(-1);
		SFGlobal.setProperty(cell,{align:'center',colSpan:2,noWrap:true});
		cell.appendChild(doc.createTextNode(this.tooltipTitle.link));
		for(var i=0;i<this.linkNoticeFields.length;i++)
		{
			row=table.insertRow(-1);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			this.linkNoticeFields[i].showHead(cell);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			this.linkNoticeFields[i].showBody(cell,link,this);
		}
		tooltip.bindObject=link;
		tooltip.setContent(table);
		return true;
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttLinksMap.prototype.remove=function()
	{
		this.onScale();
		if(this.refreshTimeout){window.clearInterval(this.refreshTimeout);}
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	/**
	销毁此功能控件以释放内存
	*/
	SFGanttLinksMap.prototype.depose=function()
	{
		if(this.delayTimeout){window.clearTimeout(this.delayTimeout);}
		SFEvent.deposeNode(this.div);
		SFEvent.clearListeners(this);
		for(var key in this){this[key]=null;}
	}
	window.SFGanttLinksMap=SFGanttLinksMap;