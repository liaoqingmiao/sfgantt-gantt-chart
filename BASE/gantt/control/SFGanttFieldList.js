	/**
	这是一个甘特图功能控件，本控件是列表头表格的实现
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttFieldList(fieldNames)
	{
		this.fieldNames=fieldNames;
	}
	SFGanttFieldList.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttFieldList.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout){return false;}
		var container=gantt.getLayout("listHead"),doc=gantt.container.ownerDocument;
		if(!container){return false;}
		var fields=this.fields=SFGanttField.getFields(gantt.elementType,this.fieldNames),table=doc.createElement("table");
		SFGlobal.setProperty(this,{container:container,gantt:gantt,div:table,fieldIndex:-1});
		SFGlobal.setProperty(table,{bgColor:gantt.borderColor,border:0,cellSpacing:1,cellPadding:0});
		SFGlobal.setProperty(table.style,{fontSize:'0px',height:(gantt.headHeight+2)+"px",left:'-2px',top:'-1px',position:'relative',tableLayout:'fixed'});
		var row=this.div.insertRow(-1);
		/**
		甘特图顶端部分的背景色
		@name SFConfig.configItems.SFGantt_headBgColor
		@type Color
		@default #F4F4F4
		*/
		SFGlobal.setProperty(row,{bgColor:gantt.headBgColor});
		var cell=row.insertCell(-1);
		cell.width=1;
		this.widths=[];
		for(var i=0;i<fields.length;i++)
		{
			cell=row.insertCell(-1);
			cell.vAlign='top';
			var width=fields[i].width*1;
			SFGlobal.setProperty(cell.style,{overflow:'hidden',fontSize:gantt.fontSize+'px',whiteSpace:(document.compatMode?'nowrap':'pre')});
			fields[i].showHead(cell,this);
			this.widths.push(width);
		}
		container.appendChild(this.div);
		SFGlobal.setProperty(gantt,{
			getFieldsList:SFEvent.getCallback(this,this.getList),
			getFieldsWidth:SFEvent.getCallback(this,this.getWidth),
			setFieldsWidth:SFEvent.getCallback(this,this.setWidth)
		});
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.setWidth),
			SFDragObject.setup(table,SFEvent.getCallback(this,this.onDrag)),
			SFEvent.bind(table,"mousemove",this,this.onMouseMove),
			SFEvent.bind(container,"scroll",this,this.onScroll)
		]
		return true;
	}
	/**
	@private
	在列表滚动条变化的时候触发列表头移动事件
	*/
	SFGanttFieldList.prototype.onScroll=function()
	{
		/** 
			@event
			@name SFGantt#listfieldsscroll
			@private
			@description 在甘特图列表头滚动时触发
			@param {Number} left 列表头的滚动位置.
		 */
		SFEvent.trigger(this.gantt,"listfieldsscroll",[parseInt(this.div.style.left)]);
	}
	/**
	@private
	获取list之中各列的宽度
	*/
	SFGanttFieldList.prototype.getList=function()
	{
		return this.fields;
	}
	/**
	@private
	获取list之中各列的宽度
	*/
	SFGanttFieldList.prototype.getWidth=function()
	{
		return this.widths;
	}
	/**
	@private
	设置list层和图表层之间的大小关系
	*/
	SFGanttFieldList.prototype.setWidth=function(widths)
	{
		widths=this.widths=widths||this.widths;
		var table=this.div,cells=table.rows[0].cells,sum=0;
		for(var i=0;i<widths.length;i++)
		{
			cells[i+1].width=widths[i];
			sum+=widths[i]*1+1;
		}
		table.width=sum+3;
		/** 
			@event
			@name SFGantt#listfieldsresize
			@private
			@description 在甘特图列表头大小发生变化时触发
			@param {Number[]} widths 各个列表头的大小.
		 */
		SFEvent.trigger(this.gantt,"listfieldsresize",[this.widths]);
	}
	/**
	@private
	在鼠标划过时根据鼠标的位置来确定当前的鼠标样式
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttFieldList.prototype.onMouseMove=function(e)
	{
		var index=-1,left=SFEvent.getEventPosition(e,this.div)[0]-3,widths=this.widths;
		for(var i=0;i<widths.length;i++)
		{
			left-=widths[i]+1;
			if(Math.abs(left)<5)
			{
				index=i;
				break;
			}
			if(left<0){break;}
		}
		this.fieldIndex=index;
		SFGlobal.setCursor(this.div,index<0?"default":"col-resize,se-resize");
	}
	/**
	@private
	在拖拽更改列宽的过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttFieldList.prototype.onDrag=function(sp,lp,type)
	{
		if(type=="start")
		{
			SFGlobal.setCursor(this.div,"col-resize,se-resize");
			this.dragNum=this.fieldIndex;
			this.dragWidth=this.widths[this.fieldIndex];
			return;
		}
		var width=Math.max(this.dragWidth+lp[0]-sp[0],20);
		this.widths[this.dragNum]=width;
		this.setWidth();
		if(type=="end"){SFGlobal.setCursor(this.div,"default");}
	}
	window.SFGanttFieldList=SFGanttFieldList;