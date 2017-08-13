	/**
	这是一个甘特图功能控件，本控件用来实现任务横道图的绘制
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGantElementSeparator(config)
	{
		SFConfig.applyProperty(this,config);
	}
	SFGantElementSeparator.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGantElementSeparator.prototype.initialize=function(gantt)
	{
		if(!gantt.getMapPanel){return false;}
		SFGlobal.setProperty(this,{
			gantt:gantt
		});
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGantElementSeparator"));
		if(!SFGantElementSeparator.listIndex){SFGantElementSeparator.listIndex=0;}
		this.proTag="elementSeparator_"+(SFGantElementSeparator.listIndex++);
		//图表的任务显示层
		var doc=gantt.container.ownerDocument,elementsDiv=this.div=doc.createElement('div');
		SFGlobal.setProperty(this.div.style,{position:'absolute',fontSize:'0px',left:'0px',top:'-1px',width:'100%',height:'100%',zIndex:100});
		var firstDiv=doc.createElement('div'),elementType=gantt.elementType.toLowerCase();
		SFGlobal.setProperty(firstDiv.style,{position:'relative',padding:'0px',margin:'0px',border:'0px'});
		elementsDiv.appendChild(firstDiv);
		gantt.getMapPanel().className="MapPanel"
		gantt.getMapPanel().appendChild(elementsDiv);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onInitialize),
			SFEvent.bind(gantt,"move",this,this.onMapMove),
			SFEvent.bind(gantt,elementType+"inview",this,this.drawElement),
			SFEvent.bind(gantt,elementType+"outview",this,this.clearElement),
			SFEvent.bind(gantt,elementType+"change",this,this.updateElement)
		];
		this.onInitialize();
		return true;
	}
	/**
	@private
	通过调整空白元素的高度来保持和甘特图视图高度的一致
	*/
	SFGantElementSeparator.prototype.setViewTop=function()
	{
		var top=this.gantt.getViewTop();
		this.div.firstChild.style.height=top+"px";
	}
	/**
	@private
	通过调整空白元素的高度来保持和甘特图视图高度的一致
	*/
	SFGantElementSeparator.prototype.onMapMove=function(time)
	{
		this.div.style.left=this.gantt.getTimePanelPosition(time)+"px";
	}
	/**
	@private
	在地图初始化时初始化所有绘制项目
	*/
	SFGantElementSeparator.prototype.onInitialize=function()
	{
		var gantt=this.gantt,viewElements=gantt.getViewElements();
		//重新绘制所有视图内的任务
		for(var i=0;i<viewElements.length;i++)
		{
			this.drawElement(viewElements[i],i);
		}
	}
	/**
	@private
	绘制指定的任务
	@param {SFDataElement} element
	@param {Number} viewIndex 该任务在当前视图任务中的索引
	*/
	SFGantElementSeparator.prototype.drawElement=function(element,viewIndex)
	{
		if(viewIndex==0){this.setViewTop();}
		var gantt=this.gantt
			drawObj=gantt.getElementDrawObj(element),
			mapObj=drawObj[this.proTag]=this.div.ownerDocument.createElement('div'),
			childNodes=this.div.childNodes,
			height=gantt.getElementHeight(element);
		mapObj.style.cssText="position:relative;width:200%;border-bottom:dotted 1px #808080;top:0px;left:-50%;height:"+(height-1)+"px"
		if(viewIndex+1==childNodes.length)
		{
		    this.div.appendChild(mapObj);
		}
		else
		{
		    this.div.insertBefore(mapObj,childNodes[viewIndex+1]);
		}
	}
	/**
	@private
	在任务发生变化时进行响应，检查并在需要时重绘任务
	@param {SFDataElement} element
	@param {String[]} changedFields 任务更新的属性名称列表
	*/
	SFGantElementSeparator.prototype.updateElement=function(element,changedFields)
	{
		if(!this.gantt.getElementDrawObj(element)){return;}
		var drawObj=this.gantt.getElementDrawObj(element),mapObj=drawObj[this.proTag];
		if(!mapObj){return;}
	}
	/**
	@private
	清除对指定任务的绘制
	@param {SFDataElement} element
	@param {Number} viewIndex 该任务在当前视图任务中的索引
	*/
	SFGantElementSeparator.prototype.clearElement=function(element,viewIndex)
	{
		if(viewIndex==0){this.setViewTop();}
		var drawObj=this.gantt.getElementDrawObj(element);
		if(!drawObj){return}
		var mapObj=drawObj[this.proTag];
		if(!mapObj){return}
		SFEvent.deposeNode(mapObj);
		drawObj[this.proTag]=null;
	}
	window.SFGantElementSeparator=SFGantElementSeparator;