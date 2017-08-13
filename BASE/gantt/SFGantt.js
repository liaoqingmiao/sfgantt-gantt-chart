	/**
	甘特图对象,本对象是甘特图的主体对象,代表页面上的甘特图实例，你也可以在页面上运行多个甘特图实例
	@param {SFConfig} gConfig 甘特图的配置参数，这些参数直接影响到甘特图的绘制，其中的大部分设置之后在本次甘特图实例之中不能更改
	@param {SFData} data 甘特图的数据对象，也就是甘特图所显示的数据的来源
	@class
	*/
	function SFGantt(gConfig,data)
	{
		gConfig=this.config=gConfig?gConfig:new SFConfig();
		this.elementType="Task";
		SFConfig.applyProperty(this,gConfig.getConfigObj("SFGantt"));
		this.initContainer();
		this.setViewSize(SFGlobal.getElementSize(this.container));
		this.controls=[];
		var doc=this.container.ownerDocument;
		if(doc.createDocumentFragment){this.containerFragment=doc.createDocumentFragment();}
		var elementList;
		
		this.addControl(new SFGanttTooltipControl());
		this.addControl(new SFGanttContextMenuControl());
		this.addControl(new SFGanttImageControl());
		this.addControl(new SFGanttCursorControl());
		this.addControl(new SFGanttDragResizeControl());
		this.addControl(new SFGanttHelpLinkControl());
		this.addControl(new SFGanttLogoControl());
		this.addControl(new SFGanttSizeLimitControl());
		this.addControl(new SFGanttClipboardControl());
		this.addControl(new SFGanttAutoResizeControl());
		this.addControl(new SFGanttElementSelectControl({elementType:this.elementType}));
		this.addControl(new SFGanttChangeEventControl({elementType:this.elementType}));
		/**
		是否网络图模式
		@name SFConfig.configItems.SFGantt_showNetwork
		@type Bool
		@default false
		*/
		if(this.showNetwork)
		{
			this.addControl(new SFGanttNetworkControl());
		}
		else
		{
			this.addControl(new SFGanttLayoutControl());
			this.addControl(new SFGanttBodyHeightControl());
			/**
			任务甘特图左侧主体列表之中的各个列名称,用逗号分隔，所有系统集成任务列的定义请参看{@link SFGanttField.taskFields}
			@name SFConfig.configItems.SFGantt_taskFieldNames
			@type String
			@default StatusIcon,Name,Start,Finish,Limit
			*/
			/**
			任务甘特图左侧ID列表之中的各个列名称,用逗号分隔，所有系统集成任务列的定义请参看{@link SFGanttField.taskFields}
			@name SFConfig.configItems.SFGantt_taskIdFieldNames
			@type String
			@default Empty
			*/
			/**
			资源甘特图左侧主体列表之中的各个列名称,用逗号分隔，所有系统集成资源列的定义请参看{@link SFGanttField.resourceFields}
			@name SFConfig.configItems.SFGantt_resourceFieldNames
			@type String
			@default StatusIcon,Name
			*/
			/**
			资源甘特图左侧ID列表之中的各个列名称,用逗号分隔，所有系统集成资源列的定义请参看{@link SFGanttField.resourceFields}
			@name SFConfig.configItems.SFGantt_resourceIdFieldNames
			@type String
			@default Empty
			*/
			this.addControl(new SFGanttFieldList(this[this.elementType.toLowerCase()+"FieldNames"].split(",")));
			this.addControl(new SFGanttDrawControl());
			this.addControl(new SFGanttViewItemsControl(this.elementType));
			this.addControl(new SFGanttScrollControl());
			/**
			图片文件URL目录的路径
			@name SFConfig.configItems.SFGantt_imgPath
			@type String
			@default http://www.51diaodu.cn/sfgantt/img/
			*/
			/**
			图片文件的扩展名,线上的版本因为要使用缓存，在原有扩展名后加上了.aspx
			@name SFConfig.configItems.SFGantt_imgType
			@type String
			@default .gif.aspx
			*/
			/**
			甘特图中间主体部分的背景色
			@name SFConfig.configItems.SFGantt_bodyBgColor
			@type Color
			@default #FFFFFF
			*/
			/**
			左侧ID列表的背景颜色
			@name SFConfig.configItems.SFGantt_idCellBgColor
			@type Color
			@default #F4F4F4
			*/
			this.addControl(elementList=new SFGanttElementList({fieldNames:this[this.elementType.toLowerCase()+"FieldNames"].split(","),bgColor:this.bodyBgColor,elementType:this.elementType}));
			this.addControl(new SFGanttElementList({fieldNames:this[this.elementType.toLowerCase()+"IdFieldNames"].split(","),bgColor:this.idCellBgColor,mainList:elementList,elementType:this.elementType}));
			this.addControl(new SFGanttCollapseControl());
			this.addControl(new SFGanttDialogControl());
			this.addControl(new SFGanttPrintControl());
			this.addControl(new SFGanttTimeControl());
			this.addControl(new SFGanttMapPanel());
			this.addControl(new SFGanttTimePanel());
			this.addControl(new SFGanttZoomControl());
			this.addControl(new SFGanttTimeScroller());
			this.addControl(new SFGanttDivScroller());
			switch(this.elementType)
			{
				case "Task":
					this.addControl(new SFGanttSelectTaskOperateControl());
					this.addControl(new SFGanttTasksMap());
					this.addControl(new SFGanttLinksMap());
					break;
				case "Resource":
					this.addControl(new SFGanttResourceMap());
					break;
			}
			this.addControl(new SFGanttTimeScrollNotice());
			this.addControl(new SFGanttListScrollNotice());
			this.addControl(new SFGanttCalendarControl());
			this.addControl(new SFGanttCalDiv());
			this.addControl(new SFGanttDragZoomControl());
			this.addControl(new SFGanttTimeSegmentation());
			this.addControl(new SFGanttWorkingMask());
			this.addControl(new SFGanttTimeLine());
		}
		this.addControl(new SFGanttDefaultMenuControl());
		if(this.containerFragment)
		{
		    this.container.appendChild(this.containerFragment);
		    this.containerFragment=null;
		}
		if(data){this.setData(data);}
	}
	/**
	对显示甘特图的层进行初始化操作
	@private
	*/
	SFGantt.prototype.initContainer=function()
	{
		var container=this.container;
		this.container=container=(typeof(container)=="object")?container:document.getElementById(container);
		var child,doc=this.container.ownerDocument;
		//这一句要求浏览器(特别针对IE)需要缓存背景图片功能
		try{doc.execCommand("BackgroundImageCache", false, true);}catch(e){}
		/**
		用来显示甘特图的层的ID,这个层必须已经在页面上存在
		@name SFConfig.configItems.SFGantt_container
		@type String
		*/
		var style=this.container.style;
		if(style.position!="absolute"){style.position="relative";}
		SFGlobal.setProperty(style,{padding:'0px',margin:'0px',textAlign:"left",overflow:"hidden",backgroundColor:this.bodyBgColor,fontSize:this.fontSize+'px'});
		while(child=container.firstChild){container.removeChild(child)}
	}
	/**
	向甘特图上添加一个功能控件
	@param {SFGanttControl} control
	@returns {Bool} 如果添加成功，返回true,否则返回false
	*/
	SFGantt.prototype.addControl=function(control)
	{
		if(!control){return;}
		control.added=true;
		if(!control.initialize(this,this.containerFragment?this.containerFragment:this.container)){return false;}
		this.controls.push(control);
		return true;
	}
	/**
	向甘特图上移除一个功能控件
	@param {SFGanttControl} control 需要移除的控件实例
	*/
	SFGantt.prototype.removeControl=function(control)
	{
		if(!control){return;}
		control.remove();
		control.added=false;
		SFGlobal.deleteInArray(control);
	}
	/**
	甘特图的初始化，在甘特图的数据准备好之后就会进行初始化
	@private
	*/
	SFGantt.prototype.initialize=function()
	{
		if(this.loaded || !this.data){return;}
		this.loaded=true;
		/** 
			@event
			@name SFGantt#initialize
			@private
			@description 在甘特图初始化时触发
		 */
		SFEvent.trigger(this,"initialize");
	}
	/**
	返回用来显示甘特图的层
	@returns {HtmlElement} 
	*/
	SFGantt.prototype.getContainer=function()
	{
		return this.container;
	}
	/**
	设置甘特图的视图大小
	@param {Number[]} size 大小数组，例如[800,600]代表宽度为800，高度为600
	@returns {Bool}  如果设置成功返回true,否则返回false
	*/
	SFGantt.prototype.setViewSize=function(size)
	{
		size=size||SFGlobal.getElementSize(this.container);
		var viewSize=this.viewSize;
		if(viewSize && viewSize[0]==size[0] && viewSize[1]==size[1]){return;}
		var returnObj={returnValue:true}
		/** 
			@event
			@name SFGantt#beforeresize
			@description 在更改甘特图视图大小前触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝更改此大小，这次大小调整就不会生效.
			@param {Number[]} size 甘特图打算更改为的目标大小
		 */
		SFEvent.trigger(this,"beforeresize",[returnObj,size]);
		if(!returnObj.returnValue){return false;}
		this.viewSize=size;
		/** 
			@event
			@name SFGantt#afterresize
			@description 在甘特图视图大小变化后触发
			@param {Number[]} size 甘特图当前的大小
		 */
		SFEvent.trigger(this,"afterresize",[size]);
		return true;
	}
	/**
	获取甘特图的视图大小
	@returns {Number[]} size 大小数组，例如[800,600]代表宽度为800，高度为600
	*/
	SFGantt.prototype.getViewSize=function()
	{
		return this.viewSize;
	}
	/**
	设置甘特图的数据源,注意，甘特图不支持在运行时更改数据源
	@private
	@param {SFData} data
	*/
	SFGantt.prototype.setData=function(data)
	{
		this.data=data;
		SFConfig.applyProperty(data,this.config.getConfigObj("SFData"));
		if(!this.loaded){this.initialize();}
	}
	/**
	获得甘特图的数据源
	@returns {SFData}
	*/
	SFGantt.prototype.getData=function()
	{
		return this.data;
	}
	/**
	销毁此甘特图以释放内存
	*/
	SFGantt.prototype.depose=function()
	{
		//清除所有控件
		var controls=this.controls;
		for(var i=controls.length-1;i>=0;i--){this.removeControl(controls[i]);}
		SFEvent.deposeNode(this.container,true);
	}
	window.SFGantt=SFGantt;