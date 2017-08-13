	function SFGanttNetworkControl(config)
	{
		var container=this.container=document.createElement("div");
		SFGlobal.setProperty(container.style,{position:"absolute",overflow:'auto',zIndex:100,width:'100%',height:'100%'});
		var div=this.div=document.createElement("div");
		this.zoom=1;
		this.zoomUnit=1.6;
		SFGlobal.setProperty(div.style,{position:"relative"});
		container.appendChild(div);
		SFGlobal.setProperty(this,config);
	}
	SFGanttNetworkControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttNetworkControl.prototype.initialize=function(gantt)
	{
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttNetworkControl"));
		this.taskStyles=gantt.config.getConfigObj("SFGantt/taskStyle");
		this.linkStyles=gantt.config.getConfigObj("SFGantt/linkStyle");
		/**
		网络图默认的线条样式
		@name SFConfig.configItems.SFGanttNetworkControl_linkStyle
		@type String
		@default RedNormal
		*/
		this.gantt=gantt;
		var div=this.div;
		if(gantt.setContextMenu){gantt.setContextMenu(div,function(menu){menu.type="network";return true});}
		/**
		网络图在任务信息框之中显示的字段列表，所有系统集成任务列的定义请参看{@link SFGanttField.taskFields}
		@name SFConfig.configItems.SFGanttNetworkControl_taskFields
		@type String
		@default name,Start,Finish,Resource
		*/
		this.taskFields=this.taskFields?SFGanttField.getTaskFields(this.taskFields.split(",")):null;
		/**
		网络图在任务鼠标提示框之中显示的字段列表，所有系统集成任务列的定义请参看{@link SFGanttField.taskFields}
		@name SFConfig.configItems.SFGanttNetworkControl_taskNoticeFields
		@type String
		@default name,UID,Duration,Resource,Notes
		*/
		this.taskNoticeFields=this.taskNoticeFields?SFGanttField.getTaskFields(this.taskNoticeFields.split(",")):null;
		gantt.showMap=SFEvent.getCallback(this,this.draw);
		gantt.zoomIn=SFEvent.getCallback(this,this.zoomIn);
		gantt.zoomOut=SFEvent.getCallback(this,this.zoomOut);
		gantt.container.appendChild(this.container);
		if(this.taskNoticeFields && gantt.setTooltip)
		{
			gantt.setTooltip(div,SFEvent.getCallback(this,this.getTooltip))
		}
		this.listeners=[
			SFEvent.bind(gantt,"taskchange",this,this.updateTask),
			SFEvent.bind(div,"mousedown",this,this.onMouseDown),
			SFEvent.bind(div,"click",this,this.onClick),
			SFEvent.bind(div,"dblclick",this,this.onDblClick)
		];
		SFDragObject.setup(this.div,SFEvent.getCallback(this,this.onDrag),{interval:32,container:this.container});
	}
	SFGanttNetworkControl.prototype.updateTask=function(task,changedFields)
	{
		if(task._div)
		{
			this.drawTask(task);
		}
	}
	SFGanttNetworkControl.prototype.drawTaskNode=function(div,task)
	{
		SFEvent.deposeNode(div,true);
		var taskStyle=this.getTaskStyle(task);
		for(var i=0;i<this.taskFields.length;i++)
		{
			var field=this.taskFields[i],span=document.createElement("div");
			field.showBody(span,task,this);
			if(field.bodyData=="Name")
			{
				SFGlobal.setProperty(span.style,{fontWeight:'bolder'});
			}
			else
			{
				span.insertBefore(document.createTextNode(field.headText?(field.headText+":"):""),span.firstChild);
			}
			SFGlobal.setProperty(span.style,{left:'5%',width:'90%',height:'18px',lineHeight:'18px'});
			SFGlobal.setProperty(span.style,taskStyle.networkLineStyle);
			SFGlobal.setProperty(span.style,{position:'relative',overflow:'hidden'});
			div.appendChild(span);
		}
	}
	/**
	@private
	应用行的样式
	@param {HtmlElement} row html的一个表格行
	@param {SFDataElement} element 该行对应的元素，将根据元素的属性来选择样式
	*/
	SFGanttNetworkControl.prototype.applyStyle=function(div,element)
	{
		var taskStyles=this.getTaskStyle(element);
		if(taskStyles)
		{
			var style=element.Selected?taskStyles.listSelectedStyle:taskStyles.listStyle;
			if(style)
			{
				SFGlobal.setProperty(div.style,style);
				return;
			}
		}
	}
	/**
	@private
	获得当前鼠标事件对应的行
	@param {Event} e 浏览器鼠标事件
	@returns {HtmlElement} 对应的行HTML元素
	*/
	SFGanttNetworkControl.prototype.getEventNode=function(e)
	{
		var target=e.target;
		while(target && !target._task){target=target.parentNode;}
		return target;
	}
	/**
	@private
	在列鼠标被按下的时候执行的操作,即开始拖动
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttNetworkControl.prototype.onMouseDown=function(e)
	{
		var target=this.getEventNode(e);
		if(!target){return;}
		var task=target._task;
		SFEvent.trigger(this.gantt,"taskmousedown",[task,e]);
	}
	/**
	@private
	在列表被单击的时候执行的响应
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttNetworkControl.prototype.onClick=function(e)
	{
		var target=this.getEventNode(e),gantt=this.gantt;
		if(!target){return;}
	//	if(!target){if(gantt.clearSelectedElement){gantt.clearSelectedElement();}return;}
		var task=target._task;
		SFEvent.trigger(gantt,"taskclick",[task,e]);
	}
	/**
	@private
	在列表被双击时执行的响应
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttNetworkControl.prototype.onDblClick=function(e)
	{
		var target=this.getEventNode(e);
		if(!target){return;}
		var task=target._task;
		SFEvent.trigger(this.gantt,"taskdblclick",[task,"network"]);
	}
	/**
	根据浏览器的支持得到对应的Canvas
	@private
	@returns {__MapGraphics}
	*/
	SFGanttNetworkControl.prototype.getGraphics=function()
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
	鼠标在链接上滑过时显示提示信息
	@private
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器的鼠标事件
	@returns {Bool} 如果需要显示提示，返回true,否则返回false
	*/
	SFGanttNetworkControl.prototype.getTooltip=function(tooltip,e)
	{
		var target=this.getEventNode(e);
		if(!target){return false;}
		var task=target._task,doc=this.gantt.container.ownerDocument;
		if(tooltip.bindObject==task){return false;}
		var table=doc.createElement("table");
		table.width=300;
		table.style.fontSize="12px";
		var row=table.insertRow(-1);
		var cell=row.insertCell(-1);
		SFGlobal.setProperty(cell,{align:'center',colSpan:2,noWrap:true});
		cell.appendChild(doc.createTextNode("任务"));
		for(var i=0;i<this.taskNoticeFields.length;i++)
		{
			row=table.insertRow(-1);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			this.taskNoticeFields[i].showHead(cell);
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{align:'left',noWrap:true});
			this.taskNoticeFields[i].showBody(cell,task,this);
		}
		tooltip.bindObject=task;
		tooltip.setContent(table);
		return true;
	}
	SFGanttNetworkControl.prototype.onDrag=function(sp,lp,type)
	{
		var parentNode=this.container;
		if(type=="start")
		{
			this.dsp=[parentNode.scrollLeft,parentNode.scrollTop]
		}
		parentNode.scrollLeft=this.dsp[0]-lp[0]+sp[0]
		parentNode.scrollTop=this.dsp[1]-lp[1]+sp[1]
	}
	SFGanttNetworkControl.prototype.searchLink=function(task,dNode,index,maxLevel)
	{
		var pTasks=task.getPredecessorTasks()
		for(var i=pTasks.length-1;i>=0;i--)
		{
			if(index==i){continue;}
			if(pTasks[i]==dNode){return true;}
			if(task._index>=dNode._index){return false;}
			if(maxLevel>0 && this.searchLink(pTasks[i],dNode,-1,maxLevel-1))
			{//如果找到了替代链接
				return true;
			}
		}
		return false;
	}
	SFGanttNetworkControl.prototype.findLongest=function(index,list,array)
	{
		if(index>this.maxLevel){return array;}
		for(var i=0;i<list.length;i++)
		{
			var task=list[i],pTasks=task.getPredecessorTasks(),result;
			for(var j=pTasks.length-1;j>=0;j--)
			{
				if(pTasks[j]._level!=index+1)
				{
					pTasks.splice(j,1);
				}
			}
			result=this.findLongest(index+1,pTasks,array.concat(task));
			if(result){return result;}
		}
		return null;
	}
	SFGanttNetworkControl.prototype.findLonger=function(list,array)
	{
		var maxLen=array.length,maxList=array;
		for(var i=0;i<list.length;i++)
		{
			var task=list[i],pTasks=task.getPredecessorTasks(),result;
			//先过滤反向的任务，在此过程之中不考虑
			for(var j=pTasks.length-1;j>=0;j--)
			{
				if(pTasks[j]._level<=task._level){pTasks.splice(j,1);}
			}
			if(list[i]._index!==undefined)
			{//如果该任务已经分配位置，则不能使用，只能在后续的任务之中查找
				//先结束当前链
				if(array.length>maxLen)
				{
					maxLen=array.length;
					maxList=array;
				}
				//再在后续任务之中查找
				result=this.findLonger(pTasks,[]);
				if(result.length>maxLen)
				{
					maxLen=result.length;
					maxList=result;
				}
			}
			else
			{//否则将当前任务加入到链条
				result=this.findLonger(pTasks,array.concat(task));
				if(result.length>maxLen)
				{
					maxLen=result.length;
					maxList=result;
				}
			}
		}
		return maxList;
	}
	//进行数据的统计和初始化
	SFGanttNetworkControl.prototype.initData=function()
	{
		var data=this.gantt.data,taskList=this.taskList={},tasks=this.tasks=[],taskCount=0;
		//初始化各个任务的级别
		for(var task=data.getRootTask();task;task=task.getNext())
		{
			if(task.Summary){continue;}
			task._level=0;
			tasks.push(task);
			taskCount++;
		}
		//计算各个之间的级别
		var times,maxLevel=0,type=this.type;
		for(times=this.maxTimes;times>0;times--)
		{
			var changed=false;
			for(var task=data.getRootTask();task;task=task.getNext())
			{
				if(task.Summary){continue;}
				var pTasks=task.getPredecessorTasks();
				for(var i=0;i<pTasks.length;i++)
				{
					if(type=="Finish")
					{
						if(task._level+1>pTasks[i]._level)
						{
							pTasks[i]._level=task._level+1;
							maxLevel=Math.max(maxLevel,pTasks[i]._level);
							changed=true
						}
					}
					else
					{
						if(pTasks[i]._level+1>task._level)
						{
							task._level=pTasks[i]._level+1;
							maxLevel=Math.max(maxLevel,task._level);
							changed=true
						}
					}
				}
			}
			if(!changed){break;}
		}
		if(type!="Finish")
		{
			for(var task=data.getRootTask();task;task=task.getNext())
			{
				if(task.Summary){continue;}
				task._level=maxLevel-task._level;
			}
		}
		this.maxLevel=maxLevel;
		if(times==0){alert('计算次数不够，可能存在循环指向1');}
		//筛选重复链接
		for(var task=data.getRootTask();task;task=task.getNext())
		{
			if(task.Summary){continue;}
			var pTasks=task.getPredecessorTasks(),levelOffset;
			for(var i=pTasks.length-1;i>=0;i--)
			{
				levelOffset=pTasks[i]._level-task._level+1;
				if(levelOffset<=0){continue;}//如果级别正好相差1，则认为肯定不是冗余链接
				if(this.searchLink(task,pTasks[i],i,levelOffset-2))
				{//如果找到了替代链接
					var link=SFGlobal.findInArray(pTasks[i].getSuccessorLinks(),task,function(a,b){return a.getSuccessorTask()==b});
					data.deleteLink(link);
				}
			}
		}
		//生成每个级别的任务数组
		for(var task=data.getRootTask();task;task=task.getNext())
		{
			if(task.Summary){continue;}
			if(!taskList[task._level]){taskList[task._level]=[]}
			taskList[task._level].push(task);
		}
		//找到最长的链条,并将其position设置为0
		var longestList=this.findLongest(0,taskList[0],[]);
		for(var i=0;i<longestList.length;i++)
		{
			longestList[i]._index=0;
		}
		//在剩下的任务之中找出次长链条，并将其position设置为1
		var engaged={};
		var cLength;
		do{
			var longer=this.findLonger(taskList[0],[]);
			cLength=longer.length;
			if(cLength<2){break;}
			//计算这个链表加上两侧之后的长度
			var sTasks=longer[0].getSuccessorTasks(),eTasks=longer[cLength-1].getPredecessorTasks(),minLev=maxLevel,maxLev=0;
			for(var i=0;i<sTasks.length;i++)
			{
				var ind=sTasks[i]._index
				if(ind===undefined){continue;}
				minLev=Math.min(minLev,ind);
			}
			if(sTasks.length==0){minLev=0;}
			for(var i=0;i<eTasks.length;i++)
			{
				var ind=eTasks[i]._index
				if(ind===undefined){continue;}
				maxLev=Math.max(maxLev,ind);
			}
			if(eTasks.length==0){maxLev=maxLevel;}
			//根据长度来计算一个合适的显示位置
			var index;
			for(var k=1;;k++)
			{
				if(!engaged[k]){engaged[k]={}}
				var i;
				for(var i=minLev;i<=maxLevel;i++)
				{
					if(engaged[k][i])
					{
						break;
					}
				}
				if(i<maxLevel){continue;}
				index=k;
				for(i=minLev;i<=maxLev;i++){engaged[index][i]=1;}
				break;
			}
			for(i=0;i<cLength;i++)
			{
				longer[i]._index=index;
			}
			
		}while(cLength>1)

		//剩下的index的值只要找到空位即可
		for(var i=0;i<=maxLevel;i++)
		{
			var list=taskList[i];
			for(var j=0;j<list.length;j++)
			{
				if(list[j]._index!==undefined){continue;}
				var index;
				for(var k=1;;k++)
				{
					if(!engaged[k]){engaged[k]={}}
					if(engaged[k][i]){continue;}
					engaged[k][i]=1;
					index=k;
					break;
				}
				list[j]._index=index;
			}
		}
		//找到最大和最小的index的值
		var minIndex=0,maxIndex=0;
		for(var task=data.getRootTask();task;task=task.getNext())
		{
			if(task.Summary){continue;}
			minIndex=Math.min(minIndex,task._index);
			maxIndex=Math.max(maxIndex,task._index);
		}
		this.maxIndex=maxIndex;
		this.minIndex=minIndex;
	}
	SFGanttNetworkControl.prototype.getNodePosition=function(node,dir)
	{
		/**
		网络图每个任务的整体宽度像素值(包含周边空白区)
		@name SFConfig.configItems.SFGanttNetworkControl_width
		@type Number
		@default 300
		*/
		/**
		网络图每个任务的整体高度像素值(包含周边空白区)
		@name SFConfig.configItems.SFGanttNetworkControl_height
		@type Number
		@default 100
		*/
		/**
		网络图每个任务的节点内容框宽度像素值
		@name SFConfig.configItems.SFGanttNetworkControl_nodeWidth
		@type Number
		@default 200
		*/
		/**
		网络图每个任务的节点内容框高度像素值
		@name SFConfig.configItems.SFGanttNetworkControl_nodeHeight
		@type Number
		@default 78
		*/
		var zoom=this.zoom,unitTop=this.height*zoom,unitLeft=this.width*zoom,num=this.maxIndex-this.minIndex+1,nodeWidth=this.nodeWidth*zoom,nodeHeight=this.nodeHeight*zoom;
		if(dir=="x")
		{
			return {x:(this.maxLevel-node._level)*unitLeft+(unitLeft-nodeWidth)/2,y:node._index*unitTop+(unitTop-nodeHeight)/2,w:nodeWidth,h:nodeHeight};
		}
		else
		{
			return {x:node._index*unitLeft+(unitLeft-nodeWidth)/2,y:(this.maxLevel-node._level)*unitTop+(unitTop-nodeHeight)/2,w:nodeWidth,h:nodeHeight};
		}
	}
	SFGanttNetworkControl.indexOf=function(array,item)
	{
		if(!array){return}
		for(var i=array.length-1;i>=0;i--)
		{
			if(array[i]==item)
			{
				return i;
			}
		}
	}
	SFGanttNetworkControl.prototype.draw=function()
	{
		if(!this.inited){this.initData();this.inited=true;}
		var data=this.gantt.data;
		var size=(this.dir=='x')?{x:this.width*(this.maxLevel+1),y:this.height*(this.maxIndex-this.minIndex+1)}:{x:this.width*(this.maxIndex-this.minIndex+1),y:this.height*(this.maxLevel+1)};
		SFGlobal.setProperty(this.div.style,{width:size.x*this.zoom+'px',height:size.y*this.zoom+'px'})
		for(var task=data.getRootTask();task;task=task.getNext())
		{
			if(task.Summary){continue;}
			this.drawTask(task);
		}
	}
	/**
	@private
	根据任务返回任务应该使用的样式
	@param {SFDataTask} task
	@returns {Json} 任务的样式配置
	*/
	SFGanttNetworkControl.prototype.getTaskStyle=function(task)
	{
		var className=task.ClassName,taskStyles=this.taskStyles;
		/**
		网络图默认的任务显示样式
		@name SFConfig.configItems.SFGanttNetworkControl_taskStyle
		@type String
		@default TaskNormal
		*/
		className=className && taskStyles[className]?className:this.taskStyle;
		return taskStyles[className];
	}
	SFGanttNetworkControl.prototype.drawTask=function(task)
	{
		var div=task._div,position=this.getNodePosition(task,this.dir),zoom=this.zoom,taskStyle=this.getTaskStyle(task);
		if(!div)
		{
			div=task._div=document.createElement("div");
			div._task=task;
			SFGlobal.setProperty(div.style,taskStyle.networkStyle);
			SFGlobal.setProperty(div.style,{fontSize:"12px",wordBreak:"break-all",zIndex:100,cursor:'pointer'});
			this.div.appendChild(div);
		}
		this.applyStyle(div,task)
		var border=parseInt(div.style.borderWidth)||0;
		SFGlobal.setProperty(div.style,{position:"absolute",width:(position.w-border*2)+"px",height:(position.h-border*2)+"px",left:position.x+"px",top:position.y+"px",overflow:"hidden",zIndex:100});
		var links=task.getPredecessorLinks();
		for(var j=links.length-1;j>=0;j--)
		{
			this.drawLink(links[j],zoom);
		}
		links=task.getSuccessorLinks();
		for(var j=links.length-1;j>=0;j--)
		{
			this.drawLink(links[j],zoom);
		}
		this.drawTaskNode(div,task);
	}
	SFGanttNetworkControl.prototype.drawLink=function(link,zoom)
	{
		/**
		网络图的显示方向，横向x,纵向y
		@name SFConfig.configItems.SFGanttNetworkControl_dir
		@type String
		@default "x"
		*/
		/**
		网络图显示时是否将箭头线条合并使图看起来更简单
		@name SFConfig.configItems.SFGanttNetworkControl_combineLine
		@type Bool
		@default false
		*/
		var task=link.SuccessorTask,dNode=link.PredecessorTask,className=link.ClassName,dir=this.dir,combineLine=this.combineLine;
		var position=this.getNodePosition(task,dir);
		/**
		网络图默认的线条样式
		@name SFConfig.configItems.SFGanttNetworkControl_linkStyle
		@type String
		@default RedNormal
		*/
		className=className?className:(this.linkFocusStyle&&(task.Selected||dNode.Selected)?this.linkFocusStyle:this.linkStyle);
		if(link._paths)
		{
			if(link._tag==className+"_"+zoom){return;}
			var line,paths=link._paths
			while(line=paths.pop())
			{
				SFEvent.deposeNode(line)
			}
			delete link._paths;
		}
		link._tag=className+"_"+zoom;
		var linkStyle=this.linkStyles[className],positionD=this.getNodePosition(dNode,dir),points=[];
		if(this.dir!="x")
		{
			var unit=Math.atan((dNode._index-task._index)/2)/Math.PI;
			unit=unit*(1-Math.atan(Math.abs(dNode._level-task._level-1)/2)/Math.PI*2);
			var sp={x:position.x+position.w*(combineLine?0.5:(0.5+unit)),y:position.y};
			var ep={x:positionD.x+positionD.w*(combineLine?0.5:(0.5-unit)),y:positionD.y+positionD.h};
			/*
			if(ep.y>=sp.y)
			{
				ep.y-=positionD.h;
				if(ep.y>sp.y)
				{
					sp.y+=positionD.h;
				}
			}*/
			points.push(sp);
			if(sp.x!=ep.x)
			{
				var offset=(this.height*zoom-position.h)*(combineLine?0.5:(0.5+unit));
				points.push({x:sp.x,y:ep.y+offset});
				points.push({x:ep.x,y:ep.y+offset});
			}
			points.push(ep);
		}
		else
		{
			var unit=Math.atan((dNode._index-task._index)/2)/Math.PI;
			unit=unit*(1-Math.atan(Math.abs(dNode._level-task._level-1)/2)/Math.PI*2);
			var sp={x:position.x,y:position.y+position.h*(combineLine?0.5:(0.5+unit))};
			var ep={x:positionD.x+positionD.w,y:positionD.y+positionD.h*(combineLine?0.5:(0.5-unit))};
			points.push(sp);
			if(sp.y!=ep.y)
			{
				var offset=(this.width*zoom-position.w)*(combineLine?0.5:(0.5+unit));
				points.push({x:ep.x+offset,y:sp.y});
				points.push({x:ep.x+offset,y:ep.y});
			}
			points.push(ep);
		}
		link._paths=this.drawLine(points,linkStyle);
	}
	SFGanttNetworkControl.prototype.drawLine=function(points,linkStyle)
	{
		var paths=[],len=points.length,gantt=this.gantt,color=linkStyle.color;
		for(var i=1;i<len;i++)
		{
			var div=document.createElement('div');
			SFGlobal.setProperty(div.style,{borderColor:color,zIndex:200});
			SFGlobal.setProperty(div.style,linkStyle.lineStyle);
			SFGlobal.setProperty(div.style,{position:'absolute',fontSize:"0px",borderWidth:'0px'});
			if(points[i-1].x==points[i].x)
			{
				SFGlobal.setProperty(div.style,{borderRightWidth:'1px',height:Math.abs(points[i].y-points[i-1].y)+'px',width:0+'px',left:(points[i].x-1)+'px',top:(Math.min(points[i].y,points[i-1].y))+'px'});
				if(i==1)
				{//显示上下箭头
					var top=points[i-1].y>points[i].y?(points[i-1].y-5):points[i-1].y;
					var img=gantt.createImage("arrow_"+(points[i-1].y>points[i].y?"down":"up"),{color:color,position:[points[i-1].x-5,top]})
					SFGlobal.setProperty(img.style,{position:'absolute',fontSize:"0px"});
					paths.push(img);
					this.div.appendChild(img);
				}
			}
			else if(points[i-1].y==points[i].y)
			{
				SFGlobal.setProperty(div.style,{borderTopWidth:'1px',width:Math.abs(points[i].x-points[i-1].x)+'px',height:0+'px',left:(Math.min(points[i].x,points[i-1].x))+'px',top:(points[i].y)+'px'});
				if(i==1)
				{//显示左右箭头
					var left=points[i-1].x>points[i].x?(points[i-1].x-5):points[i-1].x;
					var img=gantt.createImage("arrow_"+(points[i-1].x>points[i].x?"right":"left"),{color:color,position:[left,points[i].y-4]})
					SFGlobal.setProperty(img.style,{position:'absolute',fontSize:"0px"});
					paths.push(img);
					this.div.appendChild(img);
				}
			}
			this.div.appendChild(div);
			paths.push(div);
		}
		return paths;
	}
	SFGanttNetworkControl.prototype.scrollTo=function(position,point)
	{
		point=point||[0,0];
		this.container.scrollLeft=position[0]*this.zoom-point[0]
		this.container.scrollTop=position[1]*this.zoom-point[1]
	}
	SFGanttNetworkControl.prototype.zoomIn=function(point)
	{
		var zoom=this.zoom,position=[(point[0]+(this.container.scrollLeft||0))/zoom,(point[1]+(this.container.scrollTop||0))/zoom]
		this.zoom*=this.zoomUnit;
		this.draw();
		this.scrollTo(position,point);
	}
	SFGanttNetworkControl.prototype.zoomOut=function(point)
	{
		var zoom=this.zoom,position=[(point[0]+(this.container.scrollLeft||0))/zoom,(point[1]+(this.container.scrollTop||0))/zoom]
		this.zoom/=this.zoomUnit
		this.draw();
		this.scrollTo(position,point);
	}
	window.SFGanttNetworkControl=SFGanttNetworkControl;
