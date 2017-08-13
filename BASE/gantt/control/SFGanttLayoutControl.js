	/**
	这是一个甘特图功能控件，本控件是甘特图的布局控件，用来实现甘特图的界面布局，并为其他的控件提供支持，因此，依赖此控件的空间特别多，可以说，没有此控件，基本上甘特图是不能运行的
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttLayoutControl()
	{
		this.panels={};
	}
	SFGanttLayoutControl.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttLayoutControl.prototype.initialize=function(gantt,container)
	{
		this.gantt=gantt;
		this.spaceWidth=gantt.spaceWidth;
		gantt.getLayout=SFEvent.getCallback(this,this.getLayout);
		gantt.collapseMap=gantt.collapseChart=SFEvent.getCallback(this,this.collapseChart);
		gantt.collapseList=SFEvent.getCallback(this,this.collapseList);
		gantt.isListShow=SFEvent.getCallback(this,this.isListShow);
		gantt.isChartShow=SFEvent.getCallback(this,this.isChartShow);
		gantt.setListWidth=SFEvent.getCallback(this,this.setListWidth);
		this.createLayout(container);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onColumnResize),
			SFEvent.bind(gantt,"heightchange",this,this.onHeightChange),
			SFEvent.bind(gantt,"afterresize",this,this.onGanttResize)
		]
		return true;
	}
	/**
	获得指定名称的布局层
	@private
	@name SFGantt.prototype.getLayout
	@function
	@param {String} name
	@returns {HtmlElement}
	*/
	SFGanttLayoutControl.prototype.getLayout=function(name)
	{
		return this.panels[name];
	}
	/**
	创建各个布局层，重写该方法可以完全的更改甘特图的整个布局
	@private
	@param {HtmlElement} container 用来显示甘特图的层
	*/
	SFGanttLayoutControl.prototype.createLayout=function(container)
	{
		var gantt=this.gantt,panels=this.panels,doc=container.ownerDocument;
		/**
		左侧列表的宽度
		@name SFConfig.configItems.SFGantt_listWidth
		@type Number
		@default 200
		*/
		/**
		左侧ID列表的宽度，实际上也就是显示LOGO的宽度
		@name SFConfig.configItems.SFGantt_idCellWidth
		@type Number
		@default 36
		*/
		/**
		甘特图顶端部分的高度像素值
		@name SFConfig.configItems.SFGantt_headHeight
		@type Number
		@default 36
		*/
		/**
		甘特图底端部分的高度像素值
		@name SFConfig.configItems.SFGantt_footHeight
		@type Number
		@default 17
		*/
		/**
		甘特图上所有的分隔线的颜色
		@name SFConfig.configItems.SFGantt_borderColor
		@type Color
		@default #CDCDCD
		*/
		var listWidth=gantt.listWidth*1,mapWidth=gantt.getViewSize()[0]-listWidth-gantt.idCellWidth;
		if(listWidth<=0 || mapWidth<=0){this.spaceWidth=10;}
		//建立甘特图的头层
		if(gantt.headHeight>0)
		{
			var headDiv=panels.head=doc.createElement('div');
			SFGlobal.setCursor(listHeadDiv,'default');
			SFEvent.setUnSelectable(headDiv);
			SFGlobal.setProperty(headDiv.style,{position:'absolute',zIndex:100,left:'0px',top:'0px',width:'100%',height:gantt.headHeight+'px',backgroundColor:gantt.headBgColor,borderBottom:'solid 1px '+gantt.borderColor});
				if(listWidth>0)
				{
					//列表的Head头，即用来显示字段的层
					var listHeadDiv=panels.listHead=doc.createElement("div");
					SFGlobal.setProperty(listHeadDiv.style,{position:'absolute',top:'0px',left:gantt.idCellWidth+'px',height:gantt.headHeight+'px',overflow:'hidden',borderLeft:'solid 1px '+gantt.borderColor});
					headDiv.appendChild(listHeadDiv);
				}
				if(mapWidth>0)
				{
					//图表的Head头，即用来显示日历的层
					var mapHeadDiv=panels.mapHead=doc.createElement("div");
					SFGlobal.setProperty(mapHeadDiv.style,{position:'absolute',top:'0px',height:gantt.headHeight+'px',top:'0px',left:'0px',width:'100%',overflowX:'hidden',borderLeft:'solid 1px '+gantt.borderColor,borderRight:'solid 1px '+gantt.borderColor});
					headDiv.appendChild(mapHeadDiv);
				}
			container.appendChild(headDiv);
		}

		//body层的全局纵向滚动条
		var bodyScrollDiv=panels.bodyScroll=doc.createElement('div');
		SFGlobal.setProperty(bodyScrollDiv.style,{position:'absolute',zIndex:100,overflowY:'hidden',overflowX:'hidden',left:'0px',top:gantt.headHeight+1+'px',width:'100%',height:(gantt.getContainer().offsetHeight-gantt.headHeight-gantt.footHeight)+'px'});
			//body层，包含list层和图表层
			var bodyDiv=panels.body=doc.createElement('div');
				if(gantt.idCellWidth>0)
				{
					//list的ID列
					var listIdDiv=panels.listId=doc.createElement("div");
					SFGlobal.setProperty(listIdDiv.style,{position:'absolute',width:gantt.idCellWidth+'px',overflow:'hidden'});
					bodyDiv.appendChild(listIdDiv);
				}
				if(listWidth>0)
				{
					//list的内容列
					var listBodyDiv=panels.listBody=doc.createElement("div");
					SFGlobal.setProperty(listBodyDiv.style,{position:'absolute',left:gantt.idCellWidth+'px',overflow:'hidden',borderLeft:'solid 1px '+gantt.borderColor,backgroundColor:'#FFFFFF'});
					bodyDiv.appendChild(listBodyDiv);
				}
				if(mapWidth>0)
				{
					//map的内容列
					var mapBodyDiv=panels.mapBody=doc.createElement("div");
					SFEvent.setUnSelectable(mapBodyDiv);
					if(gantt.setContextMenu){gantt.setContextMenu(mapBodyDiv,function(menu){menu.type="chart";return true});}
					SFGlobal.setProperty(mapBodyDiv.style,{position:'absolute',overflow:'hidden'});
					bodyDiv.appendChild(mapBodyDiv);
				}
			bodyScrollDiv.appendChild(bodyDiv);
		container.appendChild(bodyScrollDiv);

		//建立甘特图的底部滚动条层，一共显示两个滚动条
		if(gantt.footHeight>0)
		{
			var footDiv=panels.foot=doc.createElement('div');
			/**
			甘特图底端部分的背景色
			@name SFConfig.configItems.SFGantt_bottomBgColor
			@type Color
			@default #F4F4F4
			*/
			SFGlobal.setProperty(footDiv.style,{position:'absolute',zIndex:100,left:'0px',bottom:'0px',width:'100%',height:gantt.footHeight+'px',backgroundColor:gantt.bottomBgColor});
				if(listWidth>0)
				{
					//用来显示list底部滚动条的层
					var listFootDiv=panels.listFoot=doc.createElement("div");
					SFGlobal.setProperty(listFootDiv.style,{position:'absolute',left:'0px',height:'100%',bottom:'0px',fontSize:'0px',overflow:'hidden'});
					footDiv.appendChild(listFootDiv);
				}
				if(mapWidth>0)
				{
					//用来显示图表底部滚动条的层
					var mapFootDiv=panels.mapFoot=doc.createElement("div");
					SFGlobal.setProperty(mapFootDiv.style,{position:'absolute',height:'100%',bottom:'0px',fontSize:'0px',overflow:'hidden'});
					footDiv.appendChild(mapFootDiv);
				}
			container.appendChild(footDiv);
		}
		return true;
	}
	/**
	在甘特图的左右分栏大小变化时执行的响应
	@private
	*/
	SFGanttLayoutControl.prototype.onColumnResize=function()
	{
		var spaceW=this.spaceWidth,scrollWidth=0,panels=this.panels,gantt=this.gantt,listIdWidth=gantt.idCellWidth,listWidth;
		var listDisplay=this.listHidden?"none":"";
		if(panels.listHead){panels.listHead.style.display=listDisplay;}
		if(panels.listBody){panels.listBody.style.display=listDisplay;}
		if(panels.listFoot){panels.listFoot.style.display=listDisplay;}
		var mapDisplay=this.mapHidden?"none":"";
		if(panels.mapHead){panels.mapHead.style.display=mapDisplay;}
		if(panels.mapBody){panels.mapBody.style.display=mapDisplay;}
		if(panels.mapFoot){panels.mapFoot.style.display=mapDisplay;}
		if(!panels.listBody || !panels.mapBody){spaceW=0;}

		if(!panels.listBody || this.listHidden)
		{
			listWidth=0;
		}
		else if (!panels.mapBody || this.mapHidden)
		{
			listWidth=panels.bodyScroll.clientWidth-listIdWidth-spaceW;
		}
		else
		{
			listWidth=gantt.listWidth*1;
			listWidth=Math.max(listWidth,10);
		}
		var mapWidth=panels.bodyScroll.clientWidth-listWidth-listIdWidth-spaceW;
		if(panels.mapBody && mapWidth-scrollWidth<10)
		{
			listWidth+=mapWidth-scrollWidth-10;
			mapWidth=10+scrollWidth;
		}
		
		if(!this.listHidden)
		{
			if(panels.listBody){panels.listBody.style.width=listWidth+"px";}
			if(panels.listHead){panels.listHead.style.width=listWidth+"px";}
			if(panels.listFoot){panels.listFoot.style.width=listWidth+listIdWidth+"px";}
		}
		if(!this.mapHidden)
		{
			if(panels.mapHead){panels.mapHead.style.left=listIdWidth+listWidth+spaceW+"px";}
			if(panels.mapHead){panels.mapHead.style.width=mapWidth-scrollWidth+"px";}
			if(panels.mapBody){panels.mapBody.style.left=listWidth+spaceW+listIdWidth+"px";}
			if(panels.mapBody){panels.mapBody.style.width=mapWidth-scrollWidth+"px";}
			if(panels.mapFoot){panels.mapFoot.style.left=listWidth+spaceW+listIdWidth+"px";}
			if(panels.mapFoot){panels.mapFoot.style.width=mapWidth-scrollWidth+"px";}//减去滚动条宽度
		}
		/** 
			@event
			@name SFGantt#layoutchange
			@private
			@description 在甘特图布局发生变化时触发
		 */
		SFEvent.trigger(gantt,"layoutchange");
	}
	/**
	在甘特图视图大小变化时执行的响应
	@private
	@param {Number[]} size 甘特图新的视图大小
	*/
	SFGanttLayoutControl.prototype.onGanttResize=function(size)
	{
		var gantt=this.gantt;
		this.panels.bodyScroll.style.height=(size[1]-gantt.headHeight-gantt.footHeight)+'px';
		this.onColumnResize();
	}
	/**
	切换甘特图左侧列表的显示\隐藏状态,默认列表是显示的
	@name SFGantt.prototype.collapseList
	@function
	*/
	SFGanttLayoutControl.prototype.collapseList=function()
	{
		if(!this.listHidden && this.mapHidden)
		{
			this.collapseChart();
		}
		this.listHidden=!this.listHidden;
		this.onColumnResize();
	}
	/**
	切换甘特图右侧图表的显示\隐藏状态，默认图表是显示的
	@name SFGantt.prototype.collapseChart
	@function
	*/
	SFGanttLayoutControl.prototype.collapseChart=function()
	{
		if(!this.mapHidden && this.listHidden)
		{
			this.collapseList();
		}
		this.mapHidden=!this.mapHidden;
		this.onColumnResize();
	}
	/**
	判断当前列表是否在显示状态
	@name SFGantt.prototype.isListShow
	@function
	@returns {Bool} 如果在显示中，则返回true,如果在隐藏中，返回false
	*/
	SFGanttLayoutControl.prototype.isListShow=function()
	{
		return !this.listHidden;
	}
	/**
	判断当前图表是否在显示状态
	@name SFGantt.prototype.isChartShow
	@function
	@returns {Bool} 如果在显示中，则返回true,如果在隐藏中，返回false
	*/
	SFGanttLayoutControl.prototype.isChartShow=function()
	{
		return !this.mapHidden;
	}
	/**
	设置列表的显示宽度,图表的显示宽度为甘特图的总宽度减去列表的显示宽度,因此没有直接设置图表显示宽度的方法
	@name SFGantt.prototype.setListWidth
	@function
	@param {Number} width 宽度像素值
	*/
	SFGanttLayoutControl.prototype.setListWidth=function(width)
	{
		var gantt=this.gantt;
		width=Math.max(width,0);
		width=Math.min(width,this.panels.bodyScroll.clientWidth-gantt.idCellWidth-10);
		gantt.listWidth=width;
		this.onColumnResize();
	}
	/**
	在甘特图数据总高度变化时执行的响应，设置内容层的高度
	@private
	@param {Number} bodyHeight 内容层的总高度
	*/
	SFGanttLayoutControl.prototype.onHeightChange=function(bodyHeight)
	{
		var panels=this.panels,height=(bodyHeight+64)+"px";
		if(panels.mapBody){panels.mapBody.style.height=height;}
		else if(panels.body){panels.body.style.height=height;}
	}
	/**
	在功能控件被移除时执行的方法
	@private
	*/
	SFGanttLayoutControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getLayout
		delete gantt.collapseMap
		delete gantt.collapseList
		delete gantt.isListShow
		delete gantt.isChartShow
		delete gantt.setListWidth
		var panels=this.panels;
		for(var key in panels)
		{
			SFEvent.deposeNode(panels[key]);
		}
		this.panels={};
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttLayoutControl=SFGanttLayoutControl;