	/**
	这是一个甘特图功能控件，本控件管理一组在当前视图之中的实体列表，
	其实在甘特图之中，这样的列表完全可以有多个的，这样才更灵活的控制缓存，不过在现在，暂时只有一个
	因为只有一个并且依赖于甘特图的大小，因此此控件暂时依赖SFGanttLayoutControl
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttViewItemsControl(elementType)
	{
		this.elementType=elementType;
	}
	SFGanttViewItemsControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttViewItemsControl.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout || !gantt.getLayout("bodyScroll")){return false;}
		SFGlobal.setProperty(this,{gantt:gantt,heightSpan:[0,0],viewElements:[]});
		gantt.getViewTop=SFEvent.getCallback(this,this.getViewTop);
		gantt.getViewElements=SFEvent.getCallback(this,this.getViewElements);
		gantt.getViewIndex=SFEvent.getCallback(this,this.getViewIndex);
		gantt.getElementViewTop=SFEvent.getCallback(this,this.getElementViewTop);
		gantt.setScrollTop=SFEvent.getCallback(this,this.setScrollTop);
		gantt.scrollToElement=SFEvent.getCallback(this,this.scrollToElement);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onGanttInit),
			SFEvent.bind(gantt,"scroll",this,this.onScroll),
			SFEvent.bind(gantt,"afterresize",this,this.showViewElements),
			SFEvent.bind(gantt,"elementheightchanged",this,this.onHeightChange)
		];
		return true;
	}
	/**
	在甘特图初始化时进行必要的事件绑定操作
	@private
	*/
	SFGanttViewItemsControl.prototype.onGanttInit=function()
	{
		var gantt=this.gantt,data=gantt.getData(),el=this.elementType.toLowerCase();
		this.listeners=this.listeners.concat([
			SFEvent.bind(data,"after"+el+"move",this,this.onElementMove),
			SFEvent.bind(data,"after"+el+"add",this,this.onElementAdd),
			SFEvent.bind(data,"after"+el+"delete",this,this.onElementDelete),
			SFEvent.bind(data,"after"+el+"change",this,this.onElementChange)
		]);
		this.setScrollTop(gantt.scrollTop?gantt.scrollTop:0);
	}
	/**
	设置当前甘特图的滚动高度，即纵向滚动条的位置
	@param {Number} top  滚动高度的值
	*/
	SFGanttViewItemsControl.prototype.setScrollTop=function(top)
	{
		this.onScroll(top);
		var gantt=this.gantt,scrollDiv=gantt.getLayout("bodyScroll");
		if(gantt.forPrint)
		{
			scrollDiv.firstChild.style.position="relative";
			scrollDiv.firstChild.style.top=-top+"px";
		}
		else
		{
			scrollDiv.scrollTop=top;
		}
	}
	/**
	获取当前甘特图的滚动高度，即纵向滚动条的位置，甘特图开始的时候该值为0，随着滚动条的滚动而变化
	@returns {Number}
	*/
	SFGanttViewItemsControl.prototype.getScrollTop=function()
	{
		return this.scrollTop?this.scrollTop:0;
	}
	/**
	在甘特图滚动时候更新视图的显示
	@private
	*/
	SFGanttViewItemsControl.prototype.onScroll=function(scrollTop)
	{
		if(scrollTop)
		{
			this.scrollTop=scrollTop;
		}
		else
		{
			var gantt=this.gantt,scrollDiv=gantt.getLayout("bodyScroll");
			this.scrollTop=gantt.forPrint?(-parseInt(scrollDiv.firstChild.style.top)):scrollDiv.scrollTop;
		}
		this.showViewElements();
	}
	/**
	将一个元素加入到当前视图
	@private
	@param {SFDataElement} element
	@param {Number} index 该元素在视图元素数组之中的索引
	*/
	SFGanttViewItemsControl.prototype.inViewElement=function(element,index)
	{
		var gantt=this.gantt;
		if(index<0)//如果是在末尾添加
		{
			this.viewElements.push(element);
			index=this.viewElements.length-1;
		}
		else
		{
			this.viewElements.splice(index,0,element);
		}
		if(this.viewElements[1] && index==0)
		{//只有在上面添加的时候，才需要向上扩充内容
			this.heightSpan[0]-=gantt.getElementHeight(element);
		}
		else
		{//否则向下面扩充内容
			this.heightSpan[1]+=gantt.getElementHeight(element);
		}
		SFEvent.trigger(gantt,"heightspanchange",[this.heightSpan]);
		/** 
			@event
			@name SFGantt#taskinview
			@description 在一个任务进入当前甘特图视图时触发
			@param {SFDataTask} task
			@param {Number} index 此任务原来在视图任务数组之中的索引
		 */
		/** 
			@event
			@name SFGantt#resourceinview
			@description 在一个资源进入当前甘特图视图时触发
			@param {SFDataResource} resource
			@param {Number} index 此任务原来在视图资源数组之中的索引
		 */
		SFEvent.trigger(gantt,this.elementType.toLowerCase()+"inview",[element,index]);
	}
	/**
	将一个元素从当前视图之中移除
	@private
	@param {Number} index 该元素在视图元素数组之中的索引
	*/
	SFGanttViewItemsControl.prototype.outViewElement=function(index)
	{
		if(index<0){index=this.viewElements.length-1}
		if(index<0){return;}
		var element=this.viewElements.splice(index,1)[0],gantt=this.gantt,drawObj=gantt.getElementDrawObj(element);
		if(index==0 && this.viewElements.length>0 && !element.isHidden())
		{//只有在上面移除的时候，才需要向上压缩内容,并且这个element必须不是被删除
			this.heightSpan[0]+=drawObj.height;
		}
		else
		{
			this.heightSpan[1]-=drawObj.height;
		}
		SFEvent.trigger(gantt,"heightspanchange",[this.heightSpan]);
		/** 
			@event
			@name SFGantt#taskoutview
			@description 在一个任务从当前甘特图视图之中移出时触发
			@param {SFDataTask} task
			@param {Number} index 此任务在视图任务数组之中的索引
		 */
		/** 
			@event
			@name SFGantt#resourceoutview
			@description 在一个资源从当前甘特图视图之中移出时触发
			@param {SFDataResource} resource
			@param {Number} index 此任务在视图任务数组之中的索引
		 */
		SFEvent.trigger(gantt,this.elementType.toLowerCase()+"outview",[element,index]);
	}
	/**
	根据元素获得该元素在视图元素数组之中的索引
	@name SFGantt.prototype.getViewIndex
	@function
	@param {SFDataElement} element
	@returns {Number} 如果没有找到，返回-1
	*/
	SFGanttViewItemsControl.prototype.getViewIndex=function(element)
	{
		for(var i=this.viewElements.length-1;i>=0;i--)
		{
			if(element==this.viewElements[i]){return i;}
		}
		return -1;
	}
	/**
	获得当前视图之中第一个元素在整个数据视图之中的位置
	@name SFGantt.prototype.getViewTop
	@private
	@function
	@returns {Number}
	*/
	SFGanttViewItemsControl.prototype.getViewTop=function()
	{
		return this.heightSpan[0];
	}
	/**
	在发生折叠等操作无法在原来数据的基础上计算高度范围时就完全重新计算高度范围
	@private
	*/
	SFGanttViewItemsControl.prototype.resetHeightSpan=function()
	{
		var firstView=this.viewElements[0],height=0,found=false,gantt=this.gantt;
		if(firstView)
		{
			for(var t=gantt.getData().getRootElement(this.elementType).getFirstChild();t;t=t.getNextView())
			{
				if(t==firstView)
				{
					found=true;
					break;
				}
				height+=gantt.getElementDrawObj(t).height;
			}
			if(found)
			{
				var span=this.heightSpan[0]-height;
				this.heightSpan[0]=height;
				this.heightSpan[1]-=span;
			}
		}
		else
		{
			this.heightSpan=[0,0];
		}
		SFEvent.trigger(gantt,"heightspanchange",[this.heightSpan]);
	}
	/**
	将视图的刷新延缓处理以提升性能
	@private
	*/
	SFGanttViewItemsControl.prototype.delayShowViewElements=function()
	{
		if(!this.dst){this.dst=window.setInterval(SFEvent.getCallback(this,this.onShowTime),32);}
		this.showChanged=true;
		this.showIdleTimes=0;
	}
	/**
	在延缓时间到期时开始绘制视图
	@private
	*/
	SFGanttViewItemsControl.prototype.onShowTime=function()
	{
		if(!this.showChanged)
		{
			this.showIdleTimes++;
			if(this.showIdleTimes>4)
			{
				window.clearInterval(this.dst);
				delete this.dst
				this.showViewElements(true);
			}
			return;
		}
		this.showChanged=false;
	}
	/**
	这个函数选择出当前在视图之中的任务并进行显示
	@param {Bool} check 是否需要检查现有视图之中的空缺元素
	@private
	*/
	SFGanttViewItemsControl.prototype.showViewElements=function(check)
	{
		var gantt=this.gantt,scrollDiv=gantt.getLayout("bodyScroll"),enlargeHeight=gantt.viewEnlargeHeight,bufferHeight=gantt.viewBufferHeight+enlargeHeight;
		var startHeight=this.getScrollTop()-enlargeHeight;
		var endHeight=startHeight+scrollDiv.clientHeight+enlargeHeight*2;
		//如果需要做内部数据检查，则先检查是否存在需要补充的数据
		if(check && this.viewElements.length>1)
		{
			var height=this.heightSpan[0];
			var j=0;
			for(var i=0;i<this.viewElements.length-1;i++)
			{
				var startElement=this.viewElements[i],endElement=this.viewElements[i+1];
				if(startElement.getNextView()!=endElement)//如果中间需要补充数据
				{
					for(var element=startElement.getNextView();element && element!=endElement;element=element.getNextView())//补充数据直到接上
					{
						height+=gantt.getElementHeight(element);
						this.inViewElement(element,i+(++j),true);
						if(height>endHeight)//如果补充的数据已经达到指定高度
						{
							break;
						}
					}
					i+=j;
					j=0;
				}
				else
				{
					height+=gantt.getElementHeight(startElement);
				}
				if(height>endHeight)//如果补充的数据已经达到指定高度，则将剩下的数据清空
				{
					this.removeViewElements(i+j);
					this.heightSpan[1]=height;
					SFEvent.trigger(gantt,"heightspanchange",[this.heightSpan]);
					break;
				}
			}
		}
		while(this.viewElements[0] && this.heightSpan[0]+gantt.getElementHeight(this.viewElements[0])<startHeight-bufferHeight)//如果有的列已经完全在视图上方，则认为移出
		{
			this.outViewElement(0);
		}
		while(this.viewElements[0]&& this.heightSpan[1]-gantt.getElementHeight(this.viewElements[this.viewElements.length-1])>endHeight+bufferHeight)//如果有的列已经完全在视图下方，则认为移出
		{
			this.outViewElement(-1);
		}
		if(!this.viewElements[0])//如果列表为空,则初始化列表,即在其中加入第一个任务
		{
			var height=0,element=gantt.data.getRootElement(this.elementType).getNext();
			while(height<startHeight && element)
			{
				if(height+gantt.getElementHeight(element)>=startHeight){break;}
				height+=gantt.getElementHeight(element);
				element=element.getNextView();
			}
			if(!element)
			{//如果找不到该任务，说明拖动超出范围，或者当前没有可显示的任务(列表为空时)
				if(height>0)
				{//如果是拖动超出范围，则使用最大的范围重新显示
					this.setScrollTop(height);
				}
				return;
			}
			this.heightSpan=[height,height];
			SFEvent.trigger(gantt,"heightspanchange",[this.heightSpan]);
			this.inViewElement(element,-1);
		}
		while(this.heightSpan[1]<endHeight)//底端需要补充内容
		{
			var element=this.viewElements[this.viewElements.length-1].getNextView();
			if(!element){break}
			this.inViewElement(element,-1);
		}
		while(this.heightSpan[0]>startHeight)//顶端需要补充内容,注意，假如viewElements数组为空，顶端肯定不需要补充内容的
		{
			var element=this.viewElements[0].getPreviousView();
			if(!element){break}
			this.inViewElement(element,0);
		}
	}
	/**
	获取指定元素在整个数据视图之中的位置
	@name SFGantt.prototype.getElementViewTop
	@private
	@function
	@param {SFDataElement} element
	@returns {Number}
	*/
	SFGanttViewItemsControl.prototype.getElementViewTop=function(element)
	{
		var firstElement=this.viewElements[0];
		var gantt=this.gantt,dir=gantt.data.compareElement(firstElement,element)>0,height=0;
		for(var t=element;t;t=dir?t.getPreviousView():t.getNextView())
		{
			if(t==element && dir){continue;}
			if(t==firstElement && !dir){break;}
			height+=gantt.getElementHeight(t)*(dir?1:-1);
			if(t==firstElement){break;}
		}
		return this.getViewTop()+height;
	}
	/**
	将视图元素数组之中索引为index之后的元素全部移除
	@private
	@param {Number} index
	*/
	SFGanttViewItemsControl.prototype.removeViewElements=function(index)
	{
		for(var i=this.viewElements.length-1;i>index;i--)
		{
			this.outViewElement(-1,true);
		}
	}
	/**
	获取当前的视图元素数组
	@private
	@returns {SFDataElement}
	*/
	SFGanttViewItemsControl.prototype.getViewElements=function()
	{
		return this.viewElements;
	}
	/**
	在元素属性变化时判断属性是否会影响视图范围，并做出响应
	@private
	@param {SFDataElement} element
	@param {String} name 更改的属性名称
	@param {variant} 更改后的属性值
	@param {variant} 更改前的属性值
	*/
	SFGanttViewItemsControl.prototype.onElementChange=function(element,name,value,bValue)
	{
		switch(name)
		{
			case "Collapse":
				//如果该任务的上级任务本来就是被折叠，则不作任何处理
				if(element.isHidden()){return;}
				//首先判断折叠操作影响的内容是不是在当前的视图范围之上
				var needRefresh=this.viewElements[0] && this.gantt.data.compareElement(element,this.viewElements[0])>0;
				var collapse=element.Collapse;
				if(collapse)
				{
					for(var i=0;i<this.viewElements.length;i++)
					{
						if(element!=this.viewElements[i] && element.contains(this.viewElements[i]))
						{
							this.outViewElement(i,true);
							i--;
						}
					}
				}
				if(needRefresh){this.resetHeightSpan();}
				this.showViewElements(!collapse);
				break;
			case "LineHeight":
				break;
		}
	}
	/**
	在元素属性变化时判断属性是否会影响视图范围，并做出响应
	@private
	@param {SFDataElement} element
	@param {String} name 更改的属性名称
	@param {variant} 更改后的属性值
	@param {variant} 更改前的属性值
	*/
	SFGanttViewItemsControl.prototype.onHeightChange=function(element,value,bValue)
	{
		//如果该任务的上级任务本来就是被折叠，则不作任何处理
		if(element.isHidden()){return;}
		//如果是在视图上方的任务在变化行高，则需要对heightSpan进行更新
		if(this.viewElements[0] && this.gantt.data.compareElement(element,this.viewElements[0])>=0)
		{
			var span=value-(bValue?bValue:this.gantt.itemHeight);
			this.heightSpan[0]+=span;
			this.heightSpan[1]+=span;
			SFEvent.trigger(this.gantt,"heightspanchange",[this.heightSpan]);
		}
		var index=this.getViewIndex(element);
		this.outViewElement(index,true);
		this.gantt.removeElementDrawObj(element);
		this.delayShowViewElements();
	}
	/**
	在新增元素时更新视图元素数组
	@private
	@param {SFDataElement} element 新增加的元素
	*/
	SFGanttViewItemsControl.prototype.onElementAdd=function(element)
	{
		//如果该任务的上级任务在删除之前被折叠，则不作任何处理
		if(element.isHidden()){return;}
		var flag=false;
		//如果在视图的上方新建任务，则应将heightSpan更新
		if(this.viewElements[0] && this.gantt.data.compareElement(element,this.viewElements[0])>0)
		{
			var height=this.gantt.getElementHeight(element);
			this.heightSpan[0]+=height;
			this.heightSpan[1]+=height;
			/** 
				@event
				@name SFGantt#heightspanchange
				@private
				@description 在甘特图的视图范围发生变化时触发
				@param {Number[]} heightSpan 新的视图范围
			 */
			SFEvent.trigger(this.gantt,"heightspanchange",[this.heightSpan]);
			flag=true;
		}
		if(flag || this.viewElements.length==0 || SFGlobal.findInArray(this.viewElements,element.getNextView()) || SFGlobal.findInArray(this.viewElements,element.getPreviousView()))
		{
			this.delayShowViewElements();
		}
	}
	/**
	在移动元素时更新视图元素数组
	@private
	@param {SFDataElement} element 移动的元素
	@param {SFDataElement} pElement 元素原来的位置的父元素
	@param {SFDataElement} preElement 元素原来的位置的前一个兄弟元素
	*/
	SFGanttViewItemsControl.prototype.onElementMove=function(element,pElement,preElement)
	{
		//这下任务的移动实现起来可就复杂了,以下三种情况必须要对视图的heightspan做处理:
		//1.把上方显示的节点移动到下方，或者隐藏
		//2.把上方隐藏的节点或下方的节点，移动到上方显示出来
		//下面根据以上分析得到确定是否需要对heightspan进行处理的参数
		var data=this.gantt.data;
		var oIsUS=(!pElement.Collapse && !pElement.isHidden())&& this.viewElements[0] && data.compareElement((preElement?preElement.getLastDescendant(true):pElement),this.viewElements[0])>0;
		var nIsUS=(!element.isHidden())&& this.viewElements[0] && data.compareElement(element,this.viewElements[0])>0;
		//下面将视图之中的element或者element的子任务进行移出处理
		for(var i=0;i<=this.viewElements.length;i++)
		{
			if(element.contains(this.viewElements[i]))
			{
				var t=this.viewElements[i];
				this.outViewElement(i,true);
				this.gantt.removeElementDrawObj(t);
				i--;
			}
		}
		if(oIsUS!=nIsUS){this.resetHeightSpan();}
		this.delayShowViewElements();
	}
	/**
	在删除元素时更新视图元素数组
	@private
	@param {SFDataElement} element 删除的元素
	@param {SFDataElement} pElement 元素原来的位置的父元素
	@param {SFDataElement} preElement 元素原来的位置的前一个兄弟元素
	*/
	SFGanttViewItemsControl.prototype.onElementDelete=function(element,pElement,preElement)
	{
		//如果该任务的上级任务在删除之前被折叠，则不作任何处理
		if(pElement.Collapse || pElement.isHidden()){return;}
		//首先判断删除操作影响的内容是不是在当前的视图范围之上
		var lastView=preElement?preElement.getLastDescendant(true):pElement,viewElements=this.viewElements;
		var needRefresh=viewElements[0] && this.gantt.data.compareElement(lastView,viewElements[0])>0;
		//对视图之中的所有任务进行检查，如果存在该任务的下级任务则移出视图
		for(var i=viewElements.length-1;i>=0;i--)
		{
			if(viewElements[i].isHidden())
			{
				var t=viewElements[i];
				this.outViewElement(i,true);
			}
		}
		if(needRefresh){this.resetHeightSpan();}//这种情况下需要重新计算heightSpan的值和bodyHeight的值
		if(this.Selected){this.removeSelectedElement(element);}
		this.delayShowViewElements();
	}
	/**
	滚动甘特图以让指定的任务显示在视图中
	@name SFGantt.prototype.scrollToElement
	@function
	@private
	@param {SFDataElement} element 数据元素
	@param {Number} [offset=0] 默认将指定任务调整到视图最上端，可以通过这个参数调整向下的偏移度，这样可以实现将指定的任务执行到视图中间
	*/
	SFGanttViewItemsControl.prototype.scrollToElement=function(element,offset)
	{
		offset=offset?offset:0;
		this.gantt.setScrollTop(Math.max(0,this.gantt.getElementViewTop(element)-offset));
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttViewItemsControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getViewTop;
		delete gantt.getViewElements;
		delete gantt.getViewIndex;
		delete gantt.getElementViewTop;
		delete gantt.setScrollTop;
		delete gantt.scrollToElement;
		delete this.viewElements;
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttViewItemsControl=SFGanttViewItemsControl;