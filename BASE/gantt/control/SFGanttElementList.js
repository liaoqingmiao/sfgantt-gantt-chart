	/**
	这是一个甘特图功能控件，本控件用来实现甘特图的实体列表
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttElementList(config)
	{
		SFGlobal.setProperty(this,config);
	}
	SFGanttElementList.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttElementList.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout){return false;}
		var container=this.container=gantt.getLayout(this.mainList?"listId":"listBody"),doc=gantt.container.ownerDocument;
		if(!container){return false;}
		this.gantt=gantt;
		this.elementStyles=gantt.config.getConfigObj("SFGantt/"+gantt.elementType.toLowerCase()+"Style")
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttElementList"));
		if(!SFGanttElementList.listIndex){SFGanttElementList.listIndex=0;}
		this.proTag="listRow_"+(SFGanttElementList.listIndex++);
		var table=this.div=doc.createElement("table");
		SFGlobal.setProperty(table,{bgColor:gantt.borderColor,border:0,cellSpacing:1,cellPadding:0});
		SFGlobal.setProperty(table.style,{fontSize:'0px',position:'relative',left:'-2px',top:'-3px',tableLayout:'fixed',zIndex:100});
		SFEvent.setUnSelectable(table);
		//第一行，用来进行宽度定义
		var fRow=table.insertRow(-1),bgColor=this.bgColor;
		bgColor=bgColor?bgColor:"#FFFFFF";
		SFGlobal.setProperty(fRow,{bgColor:bgColor});
		var sum=0,fields=this.fields=SFGanttField.getFields(gantt.elementType,this.fieldNames);
		var fCell=fRow.insertCell(-1);//第一列用来进行高度定义
		SFGlobal.setProperty(fCell,{width:1});
		var whiteSpace=document.compatMode?'nowrap':'pre';
		SFGlobal.setProperty(fCell.style,{overflowX:'hidden',fontSize:'0px',whiteSpace:whiteSpace});
		//没有直接通过设置列的高度而是在里面放置一个层，来设置层的高度
		//这样做是因为在IE之中打印时直接设置列高度超过1000px左右时会失效
		var div=doc.createElement("div"),widths=[];
		SFGlobal.setProperty(div.style,{position:'relative',left:'-1px',width:"1px"});
		fCell.appendChild(div);
		for(var j=0;j<fields.length;j++)
		{
			fCell=fRow.insertCell(-1);
			SFGlobal.setProperty(fCell.style,{overflow:'hidden',fontSize:'0px',whiteSpace:whiteSpace});
			var width=fields[j].width;
			widths.push(width);
			sum+=width+1;
			SFGlobal.setProperty(fCell,{width:width});
		}
		//在最后添加一列，用来在最后添加任务
		var fRow=table.insertRow(-1);
		SFGlobal.setProperty(fRow,{bgColor:bgColor});
		var fCell=fRow.insertCell(-1);//第一行用来进行高度定义
		
		SFGlobal.setProperty(fCell,{height:(gantt.itemHeight-1)*1});
		SFGlobal.setProperty(fCell.style,{overflow:'hidden',whiteSpace:whiteSpace});
		for(var j=0;j<this.fields.length;j++)
		{
			fCell=fRow.insertCell(-1);
			SFGlobal.setProperty(fCell.style,{overflow:'hidden',whiteSpace:whiteSpace});
		}
		table.width=sum+3;
		this.container.appendChild(table);
		var et=this.elementType.toLowerCase();
		var listeners=this.listeners=[
			SFEvent.bind(gantt,"resize",this,this.onResize),
			SFEvent.bind(gantt,et+"inview",this,this.drawElement),
			SFEvent.bind(gantt,et+"outview",this,this.clearElement),
			SFEvent.bind(gantt,et+"change",this,this.updateElement),
			SFEvent.bind(table,"click",this,this.onTableClick),
			SFEvent.bind(table,"dblclick",this,this.onTableDblClick)
		];
		if(gantt.setContextMenu){gantt.setContextMenu(table,function(menu){menu.type="list";return true});}
		listeners.push(SFEvent.bind(table,"mousedown",this,this.onTableMouseDown));
		//开始支持纵向拖拽
		if(this.mainList)
		{
			//为支持可变行高改变而改变鼠标样式
			if(!this.disableAdjustLineHeight && !gantt.inline){listeners.push(SFEvent.bind(table,"mousemove",this,this.onTableMouseOver));}
		}
		else
		{
			listeners.push(SFEvent.bind(container,"scroll",this,function(){if(container.scrollLeft!=0){container.scrollLeft=0;}}));
			listeners.push(SFEvent.bind(gantt,"listfieldsscroll",this,this.onHeadMove));
			listeners.push(SFEvent.bind(gantt,"listfieldsresize",this,this.onHeadResize));
		}
		this.onHeadResize(widths);
		if(this.disableDragOrder || gantt.inline){this.mainList=null;}
		if(gantt.setCursor){gantt.setCursor(table,this.mainList?'lineselect.cur,default':'fieldedit.cur,default');}
		this.onResize();
		return true;
	}
	/**
	@private
	通过调整第一行(空白行)的高度来保持和甘特图视图高度的一致
	*/
	SFGanttElementList.prototype.setViewTop=function()
	{
		var top=this.gantt.getViewTop();
		this.div.rows[0].cells[0].firstChild.style.height=top+1+"px";
	}
	/**
	@private
	通过调整最后一行(空白行)的高度来保证底下不会出现空白
	*/
	SFGanttElementList.prototype.onResize=function()
	{
		var rows=this.div.rows,gantt=this.gantt;
		rows[rows.length-1].height=Math.max(gantt.itemHeight,gantt.viewSize[1]-gantt.headHeight-gantt.footHeight)-1;
	}
	/**
	@private
	应用行的样式
	@param {HtmlElement} row html的一个表格行
	@param {SFDataElement} element 该行对应的元素，将根据元素的属性来选择样式
	*/
	SFGanttElementList.prototype.applyRowStyle=function(row,element)
	{
		var className=element.ClassName;
		className=className?className:this.elementStyle;
		var elementStyle=this.elementStyles[className];
		if(elementStyle)
		{
			var style=element.Selected?elementStyle.listSelectedStyle:elementStyle.listStyle;
			if(style)
			{
				SFGlobal.setProperty(row.style,style);
				return;
			}
		}
		/**
		左侧list列表之中的任务被选中时的背景色
		@name SFConfig.configItems.SFGantt_listFocusColor
		@type Color
		@default #DDDDDD
		*/
		var gantt=this.gantt,style=this.mainList?
			(element.Selected?{backgroundColor:gantt.listFocusColor}:{backgroundColor:this.gantt.idCellBgColor}):
			(element.Selected?{backgroundColor:gantt.listFocusColor}:{backgroundColor:"#FFFFFF"});
		SFGlobal.setProperty(row.style,style);
	}
	/**
	@private
	绘制一行
	@param {SFDataElement} element 该行对应的元素，将根据元素的属性来选择样式
	@param {Number} viewIndex 绘制行的位置，是在当前视图中所有行数组之中的索引
	*/
	SFGanttElementList.prototype.drawElement=function(element,viewIndex)
	{
		if(viewIndex==0){this.setViewTop();}
		var gantt=this.gantt,drawObj=gantt.getElementDrawObj(element),height=drawObj.height;
		//绘制右边的详细内容
		var row=this.div.insertRow(viewIndex+1);
		//下面针对内容偏移做处理
		if(//gantt.getElementHeight(element)<=0
			(gantt.getElementHeight(element)<=0 && !(gantt.hideSummary && gantt.inline && element.Summary && element.getFirstChild() && !element.getFirstChild().Summary)) ||
			((gantt.hideSummary && gantt.inline) && (!element.Summary && element.getParent() && element.getParent().getFirstChild()==element))
			)
		{
			row.style.display="none";
		}
		if(height==0){height=gantt.itemHeight}
		
		var render=true;
		if((gantt.hideSummary && gantt.inline) && (!element.Summary && element.getParent())){render=false}
		
		this.applyRowStyle(row,element);
		//如果是右侧的列,则应该显示右边箭头图标,否则是十字图标
		var cell=row.insertCell(-1);
		var whiteSpace=document.compatMode?'nowrap':'pre';
		SFGlobal.setProperty(cell,{height:(height-1)*1,width:1});
		cell.style.cssText="overflow:hidden;white-space:"+whiteSpace+";font-size:0px;";
		drawObj[this.proTag]=row;
		if(render){row._Element=element;}
		var doc=this.container.ownerDocument,fields=this.fields,fontSize=gantt.fontSize;
		/**
		甘特图上显示的字体大小
		@name SFConfig.configItems.SFGantt_fontSize
		@type Number
		@default 12
		*/
		for(var j=0;j<fields.length;j++)
		{
			var cell=doc.createElement("td");
			var text=[];
			text.push("overflow:hidden");
			text.push("white-space:"+whiteSpace);
			text.push("font-size:"+fontSize+"px");
			if(element.Summary){text.push("font-weight:bolder");}
			cell.style.cssText=text.join(";");
			if(render){fields[j].showBody(cell,element,this);}
			else
			{
				cell.vAlign="top";
				var div=document.createElement("div");
				SFGlobal.setProperty(div.style,{width:'100%',position:'relative',top:'-1px',backgroundColor:'#FFFFFF',height:'1px',fontSize:'0px',overflow:'hidden'});
				cell.appendChild(div);
			}
			row.appendChild(cell);
		}
	}
	/**
	@private
	清除一行的内容
	@param {SFDataElement} element 该行对应的元素，将根据元素的属性来选择样式
	@param {Number} viewIndex 绘制行的位置，是在当前视图中所有行数组之中的索引
	*/
	SFGanttElementList.prototype.clearElement=function(element,viewIndex)
	{
		if(viewIndex==0){this.setViewTop();}
		this.clearInputCell();
		var drawObj=this.gantt.getElementDrawObj(element);
		SFEvent.deposeNode(drawObj[this.proTag]);
		drawObj[this.proTag]=null;
	}
	/**
	@private
	退出当前正在进行的编辑状态
	*/
	SFGanttElementList.prototype.clearInputCell=function()
	{
		if(this.focusObj && this.focusObj.inputCell>=0)
		{
			var element=this.focusObj.element,field=this.fields[this.focusObj.inputCell],drawObj=this.gantt.getElementDrawObj(element),cells=drawObj[this.proTag].cells,div=cells[this.focusObj.inputCell+1];
			field.showBody(div,element,this);
			this.focusObj.inputCell=-1;
			/** 
				@event
				@name SFGantt#afterfieldeditend
				@description 在一个元素的域退出编辑模式后触发
				@param {SFGanttField} fiels 已被编辑的域信息.
				@param {SFDataElement} element 已被修改的元素.
				@param {HtmlElement} div 当前该域的显示层
			 */
			SFEvent.trigger(this.gantt,"afterfieldeditend",[field,element,div]);
		}
	}
	/**
	@private
	在列表头移动时移动当前的列表位置
	@param {Number} position 当前的列表头位置
	*/
	SFGanttElementList.prototype.onHeadMove=function(position)
	{
		this.div.style.left=position+"px";
	}
	/**
	@private
	在列表头宽度发生变化时更新各列的宽度
	@param {Number[]} widths 新的表列表头各列宽度数组
	*/
	SFGanttElementList.prototype.onHeadResize=function(widths)
	{
		var table=this.div,cells=table.rows[0].cells,sum=0;
		for(var i=0;i<widths.length;i++)
		{
			cells[i+1].width=widths[i];
			sum+=widths[i]+1;
		}
		table.width=sum+3;
		this.widths=widths;
	}
	/**
	@private
	获得当前鼠标事件对应的行
	@param {Event} e 浏览器鼠标事件
	@returns {HtmlElement} 对应的行HTML元素
	*/
	SFGanttElementList.prototype.getEventRow=function(e)
	{
		var target=e.target;
		var row,node=target;
		while(node)
		{
			if(node.nodeName=="TR"){row=node}
			if(node==this.div){break;}
			node=node.parentNode;
		}
		if(!row || !row._Element){return;}
		return row;
	}
	/**
	@private
	在鼠标移动的时候判断鼠标的位置，确定是否显示可变行高的鼠标样式
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttElementList.prototype.onTableMouseOver=function(e)
	{
		var row=this.getEventRow(e);
		if(!row)
		{//如果不是在某个行上移动，则通过位置计算出精确的行
			var height=SFEvent.getEventPosition(e,this.div)[1];
			for(row=this.div.rows[0];row;row=row.nextSibling)
			{
				height-=row.offsetHeight;
				if(height<0){break;}
			}
			if(!row || !row._Element){return;}
		}
		var element=row._Element,gantt=this.gantt;
		var size=3,height=SFEvent.getEventRelative(e,row)[1];
		if(height<size || height>=gantt.getElementHeight(element)-size-1)
		{
			var t=height<size?element.getPreviousView():element;
			if(t && t.canSetProperty("LineHeight"))
			{
				if(gantt.setCursor){gantt.setCursor(this.div,'heightChange.cur,default');}
				this.dragMode="itemHeight";
				return;
			}
		}
		if(gantt.setCursor){gantt.setCursor(this.div,element.Selected?'orderdrag.cur,move':'lineselect.cur,default');}
		this.dragMode="";
	}
	/**
	@private
	在列鼠标被按下的时候执行的操作,即开始拖动
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttElementList.prototype.onTableMouseDown=function(e)
	{
		var row=this.getEventRow(e);
		if(!row){return;}
		var element=row._Element;
		/** 
			@event
			@name SFGantt#taskmousedown
			@private
			@description 在甘特图上的一个任务被鼠标按下时触发
			@param {SFDataTask} task
			@param {Event} e 浏览器鼠标事件
		 */
		SFEvent.trigger(this.gantt,this.elementType.toLowerCase()+"mousedown",[element,e]);
		if(SFEvent.getEventButton(e)!=1){return;}
		if(this.mainList)
		{
			if(this.dragMode=="itemHeight")
			{
				if(SFEvent.getEventPosition(e,row)[1]<3)
				{
					element=element.getPreviousView();
					if(!element){return;}
					row=this.gantt.getElementDrawObj(element)[this.proTag];
				}
			}
			this.dragElement=element;
			new SFDragObject(row,SFEvent.getCallback(this,(this.dragMode=="itemHeight")?this.onItemHeightMove:this.onTableMove)).onMouseDown(e);
		}
	}
	/**
	@private
	鼠标拖拽更改行高的过程之中持续触发，更改对应行的行高
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttElementList.prototype.onItemHeightMove=function(sp,lp,type)
	{
		var element=this.dragElement,gantt=this.gantt;
		if(type=="start"){this.startHeight=gantt.getElementHeight(element);return;}
		var cell=gantt.getElementDrawObj(element)[this.proTag].cells[0];
		var height=Math.max(this.startHeight+lp[1]-sp[1],10);
		if(type!="end")
		{
			cell.height=height-1;
		}
		else
		{
			cell.height=this.startHeight-1;
			if(this.startHeight!=height)
			{
				element.setProperty("LineHeight",height);
			}
		}
	}
	/**
	@private
	鼠标拖拽移动任务的过程之中持续触发，判断当前移动的目标位置
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttElementList.prototype.onTableMove=function(sp,lp,type)
	{
		if(type!="end")
		{
			var dir=lp[1]>sp[1];
			var gantt=this.gantt,element=this.dragElement;
			var distance=dir?(lp[1]-gantt.getElementHeight(element)):lp[1];
			while(element)
			{
				var newElement=dir?element.getNextView():element.getPreviousView();
				if(!newElement){break;}
				var height=gantt.getElementHeight(newElement);
				if(newElement && newElement!=this.gantt.data.getRootElement(this.elementType) && (dir?(distance-height/2):(distance+height/2))*(dir?1:-1)>0)
				{
					element=newElement;
					distance=dir?(distance-height):(distance+height);
				}
				else
				{
					break;
				}
			}
			this.dragDir=dir;
			this.flagElement=element;
			this.mainList.showElementMoveFlag(element,this.dragElement,this.dragDir);
		}
		else
		{
			if(this.flagElement && this.flagElement!=this.dragElement)
			{
				this.moveElement(this.dragElement,this.flagElement,this.dragDir);
			}
			this.mainList.showElementMoveFlag(this.dragElement,this.dragElement);//清除标示的显示
		}
		
	}
	/**
	@private
	显示元素移动的位置标志
	@param {SFDataElement} element 当前拖拽位置的元素
	@param {SFDataElement} dragElement 当前正在被拖拽的元素
	@param {Bool} dir 当前拖拽的方向，如果是向下拖动，则为true,否则为false
	*/
	SFGanttElementList.prototype.showElementMoveFlag=function(element,dragElement,dir)
	{
		if(this.flagDiv)
		{
			if(element==this.flagElement){return;}
			SFEvent.deposeNode(this.flagDiv);
			this.flagDiv=null;
			this.flagElement=element;
		}
		if(!element || dragElement.contains(element)){return;}
		var gantt=this.gantt,height=SFEvent.getPageOffset(gantt.getElementDrawObj(element)[this.proTag],this.container)[1],doc=this.container.ownerDocument;
		height=dir?(height+gantt.getElementHeight(element)-14):(height-14);
		var table=doc.createElement("table");
		table.cellSpacing=0;
		SFGlobal.setProperty(table.style,{position:'absolute',width:'100%',zIndex:200,height:'21px',left:'3px',top:height+'px'});
		var row=table.insertRow(-1);
		var cell=row.insertCell(-1);
		cell.width=3;
		var leftImg=doc.createElement("img");
		SFGlobal.setProperty(leftImg.style,{width:'3px',height:'21px'});
		this.gantt.setBackgroundImage(leftImg,"dragflag_left");
		cell.appendChild(leftImg);
		var cell=row.insertCell(-1);
		this.gantt.setBackgroundImage(cell,"dragflag_right");
		this.container.appendChild(table);
		this.flagDiv=table;
	}
	/**
	@private
	移动一个任务到新的位置，该位置是以flagElement来定位的
	@param {SFDataElement} element 被移动的元素
	@param {SFDataElement} flagElement 移动的目标位置的元素
	@param {Bool} dir 此参数为true在flagElement之后创建，为false代表在flagElement之前创建，
	*/
	SFGanttElementList.prototype.moveElement=function(element,flagElement,dir)
	{
		var pElement,preElement=null,postElement=null;
		if(dir)//如果是向下添加
		{
			var nElement=flagElement.getNextView();
			if(!nElement || nElement.getOutlineLevel()<flagElement.getOutlineLevel())
			{
				preElement=flagElement;
			}
			else
			{
				postElement=nElement;
			}
		}
		else//如果是向上添加
		{
			var pElement=flagElement.getPreviousView();
			if(!pElement || pElement.getOutlineLevel()<=flagElement.getOutlineLevel())
			{
				postElement=flagElement;
			}
			else
			{
				preElement=pElement;
			}
		}
		var data=this.gantt.data;
		if(preElement)
		{
			data.moveElement(element.elementType,element,preElement.getParent(),preElement);
		}
		else
		{
			data.moveElement(element.elementType,element,postElement.getParent(),postElement.getPreviousSibling());
		}
	}
	/**
	@private
	在任务属性发生变化时进行响应
	@param {SFDataElement} element 被更改的元素
	@param {String[]} changedFields 更改的属性列表
	*/
	SFGanttElementList.prototype.updateElement=function(element,changedFields)
	{
		var gantt=this.gantt;
		if(element==gantt.getData().getRootElement(this.elementType)){return;}
		var drawObj=gantt.getElementDrawObj(element);
		var row=drawObj[this.proTag];
		if(!row){return;}
		if(SFGlobal.findInArray(changedFields,"Selected"))
		{
			var selected=element.Selected;
			if(!selected &&this.focusObj && this.focusObj.element==element){this.clearInputCell();}
			this.applyRowStyle(row,element);
			if(this.mainList && gantt.setCursor)//如果是左侧列被选中,则应该更改图标提示用户可拖动
			{
				gantt.setCursor(row,selected?'orderdrag.cur,move':'lineselect.cur,default');
			}
		}
		if(SFGlobal.findInArray(changedFields,"ClassName"))
		{
			this.applyRowStyle(row,element);
		}
		for(var i=0;i<this.fields.length;i++)
		{
			if(!this.fields[i].checkUpdate(changedFields)){continue;}
			var cell=row.cells[i+1];
			SFEvent.deposeNode(cell,true);
			var style=cell.style;
			style.fontSize=gantt.fontSize+'px';
			this.fields[i].showBody(cell,element,this);
		}
		if(SFGlobal.findInArray(changedFields,"Summary"))
		{
			for(var i=0;i<this.fields.length;i++)
			{
				row.cells[i+1].style.fontWeight=element.Summary?'bolder':'';
			}
		}
	}
	/**
	@private
	在列表被双击时执行的响应
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttElementList.prototype.onTableDblClick=function(e)
	{
		var row=this.getEventRow(e);
		if(!row){return;}
		var element=row._Element;
		//计算当前点击在哪一个格上
		var index=this.getFieldIndex(row,e),fields=this.fields;
		if(index<0){return;}
		SFEvent.trigger(this.gantt,this.elementType.toLowerCase()+"dblclick",[element,"list",fields[index].Name]);
		if(this.editEvent=="dblclick")
		{
			this.startInput(element,index);
		}
	}
	/**
	@private
	计算鼠标点击在第几列上，如果返回-1,则没有点击在有效的列上
	@param {HtmlElement} row 点击所在的行
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttElementList.prototype.getFieldIndex=function(row,e)
	{
		//计算当前点击在哪一个格上
		var j,left=SFEvent.getEventPosition(e,row)[0],fields=this.fields,widths=this.widths;
		for(j=0;j<widths.length;j++)
		{
			left-=widths[j]+1;
			if(left<0){break;}
		}
		if(j==fields.length){return -1;}
		return j;
	}
	/**
	开始对指定元素的指定列进行编辑
	@param {SFDataElement} element 指定的元素
	@param {Number} index 编辑的列的序号
	*/
	SFGanttElementList.prototype.startInput=function(element,index)
	{
		var gantt=this.gantt;
		/**
		是否以只读模式显示甘特图，只读模式下任何关于数据更改的操作都被禁止
		@name SFConfig.configItems.SFGantt_readOnly
		@type Bool
		@default false
		*/
		if(!gantt.readOnly && !gantt.disableUpdateElement && !this.disableInput)
		{
			var fields=this.fields,field=fields[index];
			this.clearInputCell();
			if(field.inputFunc && !field.ReadOnly && (!field.inputData || element.canSetProperty(field.inputData)))
			{
				var returnObj={returnValue:true},div=gantt.getElementDrawObj(element)[this.proTag].cells[index+1];
				/** 
					@event
					@name SFGantt#beforefieldeditstart
					@description 在一个元素的域进入编辑模式前触发
					@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表不进入编辑模式.
					@param {SFGanttField} fiels 正在被编辑的域信息.
					@param {SFDataElement} element 正在被修改的元素.
					@param {HtmlElement} div 当前该域的显示层
				 */
				SFEvent.trigger(gantt,"beforefieldeditstart",[returnObj,field,element,div]);
				if(returnObj.returnValue)
				{
					this.focusObj={inputCell:index,element:element}
					field.showInput(div,element,this);
					/** 
						@event
						@name SFGantt#afterfieldeditstart
						@description 在一个元素的域进入编辑模式后触发
						@param {SFGanttField} fiels 正在被编辑的域信息.
						@param {SFDataElement} element 正在被修改的元素.
						@param {HtmlElement} div 当前该域的显示层
					 */
					SFEvent.trigger(gantt,"afterfieldeditstart",[field,element,div]);
				}
			}
		}
	}
	/**
	@private
	在列表被单击的时候执行的响应
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttElementList.prototype.onTableClick=function(e)
	{
		var row=this.getEventRow(e),gantt=this.gantt;
		if(!row){if(gantt.clearSelectedElement){gantt.clearSelectedElement();}return;}
		var element=row._Element;
		SFEvent.trigger(gantt,this.elementType.toLowerCase()+"click",[element,e]);
		/**
		用户进入编辑模式的方式，"click"为左键单击，"dblclick"为左键双击，"none"为不允许用户操作进入编辑模式
		@name SFConfig.configItems.SFGanttElementList_editEvent
		@type String
		@default "click"
		*/
		if(this.editEvent=="click")
		{
			var index=this.getFieldIndex(row,e);
			if(index>-1)
			{
				this.startInput(element,index);
			}
		}
	}
	window.SFGanttElementList=SFGanttElementList;