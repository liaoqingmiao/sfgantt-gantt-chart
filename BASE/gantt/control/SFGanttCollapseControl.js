	/**
	这是一个甘特图功能控件，本控件用来实现图表和列表中间的横条，如果甘特图没有显示图表或者列表，则直接拒绝显示
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttCollapseControl()
	{
	}
	SFGanttCollapseControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttCollapseControl.prototype.initialize=function(gantt,container)
	{
		if(!gantt.getLayout || gantt.disableCollapse || !gantt.getLayout("listBody") || !gantt.getLayout("mapBody") || gantt.spaceWidth<4){return false;}
		var width=this.width=gantt.spaceWidth,doc=gantt.container.ownerDocument;
		var div=this.div=doc.createElement('div');
		/**
		甘特图上图表和列表中间分隔条的背景色
		@name SFConfig.configItems.SFGantt_columnBarColor
		@type Color
		@default #F4F4F4
		*/
		SFGlobal.setProperty(div.style,{position:'absolute',zIndex:200,top:'0px',width:width+'px',height:'100%',backgroundColor:gantt.columnBarColor,borderLeft:'solid 1px '+gantt.borderColor,borderRight:'solid 1px '+gantt.borderColor});
		SFGlobal.setCursor(div,'col-resize');
			var img=this.listColImg=gantt.createImage("arrow_left",{position:[(width-5)/2,width]});
			SFGlobal.setProperty(img.style,{position:'absolute',zIndex:200});
			SFGlobal.setCursor(img,'pointer');
			div.appendChild(img);

			var img=this.mapColImg=gantt.createImage("arrow_right",{position:[(width-4)/2,width+10]});
			SFGlobal.setProperty(img.style,{position:'absolute',zIndex:200});
			SFGlobal.setCursor(img,'pointer');
			div.appendChild(img);
		container.appendChild(div);
		if(gantt.setContextMenu){gantt.setContextMenu(div,function(menu){menu.type="column";return true});}
		this.gantt=gantt;
		this.listeners=[
			SFEvent.bind(div,"mousedown",this,this.onMouseDown),
			SFEvent.bind(gantt,"layoutchange",this,this.onLayoutChange)
		];
		return true;
	}
	/**
	@private
	在甘特图发生变化时执行的响应，重新调整分隔条的位置，并设置折叠按钮的图标
	*/
	SFGanttCollapseControl.prototype.onLayoutChange=function()
	{
		var gantt=this.gantt,listDiv=gantt.getLayout("listBody"),mapDiv=gantt.getLayout("mapBody");
		var lp=SFEvent.getPageOffset(listDiv,gantt.getContainer()),mp=SFEvent.getPageOffset(mapDiv,gantt.getContainer());
		var left=Math.max(lp[0],mp[0]);
		if((!gantt.isListShow() && left==lp[0]) || (!gantt.isChartShow() && left==mp[0]))
		{
			left=SFEvent.getPageOffset(listDiv.parentNode,gantt.getContainer())[0]+listDiv.parentNode.offsetWidth;
		}
		this.div.style.left=left-this.width+"px";
		gantt.setImageSrc(this.listColImg,listDiv.offsetWidth==0?"arrow_right":"arrow_left");
		gantt.setImageSrc(this.mapColImg,listDiv.offsetWidth==0?"arrow_left":"arrow_right");
	}
	/**
	@private
	在鼠标在分隔条上按下时执行的响应，如果点击在按钮上，则执行响应的操作，如果不是，则这行拖动分隔条的操作
	@param {Event} e 鼠标按下的事件
	*/
	SFGanttCollapseControl.prototype.onMouseDown=function(e)
	{
		if(SFEvent.getEventButton(e)!=1){return;}
		SFEvent.cancelBubble(e);
		if(this.dragObj){this.onMouseUp(e);}
		var target=e.target;
		while(target && target!=this.div)
		{
			if(target==this.listColImg)
			{
				this.gantt.collapseList();
				return;
			}
			if(target==this.mapColImg)
			{
				this.gantt.collapseMap();
				return;
			}
			target=target.parentNode;
		}
		new SFDragObject(this.div,SFEvent.getCallback(this,this.onMove),{container:this.gantt.getContainer()}).onMouseDown(e);
	}
	/**
	@private
	在鼠标拖动分隔条时执行的操作，调整左右分栏大小
	@param {Number[]} sp 鼠标拖动起始位置
	@param {Number[]} lp 鼠标拖动当前位置
	@param {Number[]} type 如果是开始，则为"start",是结束，则为"end"
	*/
	SFGanttCollapseControl.prototype.onMove=function(sp,lp,type)
	{
		if(type=="start"){this.startColumn=this.gantt.listWidth*1}
		var listWidth=this.startColumn+lp[0]-sp[0]
		this.div.style.left=listWidth+this.gantt.idCellWidth+"px";
		if(type=="end"){this.gantt.setListWidth(listWidth)}
	}
	window.SFGanttCollapseControl=SFGanttCollapseControl;