	/**
	这是一个甘特图功能控件，本控件实际上是一个抽象类，通过继承才能使用，用来在甘特图上显示横向滚动条
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttScrollerControl()
	{
	}
	SFGanttScrollerControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttScrollerControl.prototype.initialize=function(gantt)
	{
		if(!this.layoutName ||!gantt.getLayout){return false;}
		var container=gantt.getLayout(this.layoutName);
		if(!container){return false;}
		SFEvent.setUnSelectable(container);
		var doc=container.ownerDocument,div=doc.createElement("div");
		div._cmd=1;
		SFGlobal.setProperty(div.style,{position:'absolute'});
		
		var leftImg=gantt.createImage("scroll_left");
		SFGlobal.setProperty(leftImg.style,{position:'absolute',left:'0px'});
		leftImg._cmd=1
		div.appendChild(leftImg);

		var rightImg=gantt.createImage("scroll_right");
		SFGlobal.setProperty(rightImg.style,{position:'absolute',right:'0px'});
		rightImg._cmd=1
		div.appendChild(rightImg);

		var barDiv=doc.createElement("div");
		barDiv._cmd=1
		SFGlobal.setProperty(barDiv.style,{position:'absolute'});
		
		var barLeftImg=gantt.createImage("scroll_barleft");
		SFGlobal.setProperty(barLeftImg.style,{position:'absolute',left:'0px'});
		barDiv.appendChild(barLeftImg);
		
		var barRightImg=gantt.createImage("scroll_barright");
		SFGlobal.setProperty(barRightImg.style,{position:'absolute',right:'0px'});
		barDiv.appendChild(barRightImg);
		
		var barCenterDiv=document.createElement("div");
		gantt.setBackgroundImage(barCenterDiv,"scroll_barbg");
		SFGlobal.setProperty(barCenterDiv.style,{position:'absolute',left:'3px',textAlign:'center'});

		var barCenterImg=gantt.createImage("scroll_barcenter");
		barCenterDiv.appendChild(barCenterImg);
		
		barDiv.appendChild(barCenterDiv);
		div.appendChild(barDiv);
		container.appendChild(div);
		SFGlobal.setProperty(this,{
			gantt:gantt,
			container:container,
			div:div,
			leftImg:leftImg,
			rightImg:rightImg,
			barDiv:barDiv,
			barLeftImg:barLeftImg,
			barRightImg:barRightImg,
			barCenterDiv:barCenterDiv,
			barCenterImg:barCenterImg
		});
		this.listeners=[
			SFEvent.bind(div,"mousedown",this,this.onMouseDown),
			SFEvent.bind(gantt,"layoutchange",this,this.onResize)
		];
		this.scrollLeft=0;
		return true;
	}
	/**
	@private
	在甘特图大小变化时根据新的大小调整滚动条的显示
	*/
	SFGanttScrollerControl.prototype.onResize=function()
	{
		if(!this.container){return;}
		var container=this.container,width=container.offsetWidth,height=container.offsetHeight,size=this.size;
		if(size && size[1]==height && size[0]==width){return;}
		if(width<=0)
		{
			this.div.style.display='none';
			return;
		}
		else
		{
			this.div.style.display='';
		}
		SFGlobal.setElementSize(this.div,[width,height]);
		this.div.style.display=width-height*2<=0?"none":"";
		if(width-height*2<=0){return;}
		SFGlobal.setElementSize(this.barDiv,[width-height*2,height]);
		SFGlobal.setElementSize(this.barCenterDiv,[Math.max(0,width-height*2-6),height]);
		if(!size || size[1]!=height)
		{
			SFGlobal.setElementSize(this.leftImg,[height,height]);
			SFGlobal.setElementSize(this.rightImg,[height,height]);
			SFGlobal.setElementSize(this.barLeftImg,[3,height]);
			SFGlobal.setElementSize(this.barRightImg,[3,height]);
			SFGlobal.setElementSize(this.barCenterImg,[8,height]);
		}
		this.size=[width,height];
		this.init(this.offsetWidth,this.scrollWidth,this.scrollLeft);
	}
	/**
	@private
	初始化滚动条的显示
	@param {Number} offsetWidth 滚动条的显示宽度
	@param {Number} scrollWidth 滚动条所对应的内容宽度
	@param {Number} scrollLeft 滚动条的滚动位置
	*/
	SFGanttScrollerControl.prototype.init=function(offsetWidth,scrollWidth,scrollLeft)
	{
		if(!offsetWidth || !scrollWidth){return;}
		var width=this.size[0]-this.size[1]*2;//滑动区域的大小
		this.offsetWidth=offsetWidth;
		this.scrollWidth=scrollWidth;
		this.barDiv.style.display=offsetWidth<scrollWidth?'':'none'
		var bWidth=Math.max(scrollWidth?parseInt(width*offsetWidth/scrollWidth):0,14);
		SFGlobal.setProperty(this.barDiv.style,{width:bWidth+"px"});
		SFGlobal.setProperty(this.barCenterDiv.style,{width:bWidth-6+"px"});
		this.width=width-bWidth;//可滑动范围的大小
		this.scrollTo(scrollLeft?scrollLeft:this.scrollLeft,false);
	}
	/**
	@private
	将滚动条滚动到指定的位置
	@param {Number}  滚动条的滚动位置
	@param {Bool} trigger 是否触发{@link SFGanttScrollerControl#event:scroll}事件,如果设置为false,则不会触发事件
	*/
	SFGanttScrollerControl.prototype.scrollTo=function(scrollLeft,trigger)
	{
		scrollLeft=this.scrollLeft=Math.max(Math.min(scrollLeft,this.scrollWidth-this.offsetWidth),0);
		SFGlobal.setProperty(this.barDiv.style,{left:(this.size[1]+scrollLeft/(this.scrollWidth-this.offsetWidth)*this.width)+"px"});
		if(trigger!=false)
		{
			/** 
				@event
				@name SFGanttScrollerControl#scroll
				@private
				@description 在滚动过程之中持续触发
				@param {Number} scrollLeft 当前的滚动位置.
			 */
			SFEvent.trigger(this,"scroll",[scrollLeft]);
		}
	}
	/**
	@private
	鼠标在滚动条上的任何位置按下时执行的操作
	@param {Event} e 浏览器的鼠标事件
	*/
	SFGanttScrollerControl.prototype.onMouseDown=function(e)
	{
		SFEvent.cancelBubble(e);
		if(this.pressObj || this.spaceObj){this.onMouseUp(e);}
		var gantt=this.gantt,div=this.div,doc=div.ownerDocument,target=e.target;
		if(div.setCapture){div.setCapture();}
		while(target && !target._cmd){target=target.parentNode;}
		switch(target)
		{
			case this.leftImg:
			case this.rightImg:
				var flag=(this.rightImg==target);
				gantt.setImageSrc(target,"scroll_"+(flag?'right':'left')+"1");
				var pressObj=this.pressObj={
					dir:(flag?1:-1),
					timeout:window.setInterval(SFEvent.getCallback(this,this.onButtonPress),32),
					ul:SFEvent.bind(doc,"mouseup",this,this.onMouseUp)
				};
				SFEvent.trigger(this,"scrollstart",[this.scrollLeft]);
				this.onButtonPress();
				break;
			case this.div:
				var point=SFEvent.getEventPosition(e,this.div);
				var toLeft=point[0]/(this.size[0]-this.size[1]*2)*(this.scrollWidth-this.offsetWidth);
				var spaceObj=this.spaceObj={
					toLeft:toLeft,
					timeout:window.setInterval(SFEvent.getCallback(this,this.onSpacePress),128),
					ul:SFEvent.bind(doc,"mouseup",this,this.onMouseUp)
				};
				SFEvent.trigger(this,"scrollstart",[this.scrollLeft]);
				this.onSpacePress();
				break;
			default:
				new SFDragObject(div,SFEvent.getCallback(this,this.onBarMove),{interval:32}).onMouseDown(e)
				break;
		}
	}
	/**
	@private
	鼠标在滚动条上释放时执行的操作
	@param {Event} e 浏览器的鼠标事件
	*/
	SFGanttScrollerControl.prototype.onMouseUp=function(e)
	{
		SFEvent.cancelBubble(e);
		if(e && e.target && e.target.ownerDocument.releaseCapture){e.target.ownerDocument.releaseCapture();}
		var gantt=this.gantt;
		if(this.pressObj)
		{
			var pressObj=this.pressObj;
			SFEvent.trigger(this,"scrollend",[this.scrollLeft]);
			window.clearInterval(pressObj.timeout);
			SFEvent.removeListener(pressObj.ul);
			gantt.setImageSrc(this.leftImg,"scroll_left");
			gantt.setImageSrc(this.rightImg,"scroll_right");
			this.pressObj=null;
		}
		if(this.spaceObj)
		{
			var spaceObj=this.spaceObj;
			SFEvent.trigger(this,"scrollend",[this.scrollLeft]);
			this.scrollTo(spaceObj.toLeft);
			window.clearInterval(spaceObj.timeout);
			SFEvent.removeListener(spaceObj.ul);
			this.spaceObj=null;
		}
	}
	/**
	@private
	鼠标在左、右箭头上点击时执行的操作，滚动条向响应的方向移动一段距离
	*/
	SFGanttScrollerControl.prototype.onButtonPress=function()
	{
		if(!this.pressObj){return;}
		this.scrollTo(this.scrollLeft+this.pressObj.dir*8);
	}
	/**
	@private
	鼠标在滚动条空白处点击时执行的操作，滚动条移动到点击的地点
	*/
	SFGanttScrollerControl.prototype.onSpacePress=function()
	{
		if(!this.spaceObj){return;}
		var spaceObj=this.spaceObj,toLeft=spaceObj.toLeft,point=this.scrollLeft;
		var offset=spaceObj.toLeft-this.scrollLeft;
		if(Math.abs(offset)<64){this.onMouseUp();return;}
		this.scrollTo(this.scrollLeft+(offset>0?64:-64));
	}
	/**
	@private
	在拖拽滚动条中间滑块过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttScrollerControl.prototype.onBarMove=function(sp,lp,type)
	{
		var gantt=this.gantt;
		if(type=="start")
		{
			gantt.setImageSrc(this.barLeftImg,"scroll_barleft1");
			gantt.setImageSrc(this.barCenterImg,"scroll_barcenter1");
			gantt.setImageSrc(this.barRightImg,"scroll_barright1");
			gantt.setBackgroundImage(this.barCenterDiv,"scroll_barbg1");
			/** 
				@event
				@name SFGanttScrollerControl#scrollstart
				@private
				@description 在一个滚动过程开始时触发
				@param {Number} scrollLeft 当前的滚动位置.
			 */
			SFEvent.trigger(this,"scrollstart",[this.startDragLeft=this.scrollLeft]);
			return;
		}
		this.scrollTo(this.startDragLeft+(lp[0]-sp[0])/this.width*(this.scrollWidth-this.offsetWidth));
		if(type=="end")
		{
			gantt.setImageSrc(this.barLeftImg,"scroll_barleft");
			gantt.setImageSrc(this.barCenterImg,"scroll_barcenter");
			gantt.setImageSrc(this.barRightImg,"scroll_barright");
			gantt.setBackgroundImage(this.barCenterDiv,"scroll_barbg");
			/** 
				@event
				@name SFGanttScrollerControl#scrollend
				@private
				@description 在一个滚动过程结束时触发
				@param {Number} scrollLeft 当前的滚动位置.
			 */
			SFEvent.trigger(this,"scrollend",[this.scrollLeft]);
		}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttScrollerControl.prototype.remove=function(e)
	{
		delete this.leftImg;
		delete this.rightImg;
		delete this.barDiv;
		delete this.barLeftImg;
		delete this.barRightImg;
		delete this.barCenterDiv;
		delete this.barCenterImg;
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	
	
	/**
	这是一个甘特图功能控件，本控件是左侧列表的滚动条
	@private
	@extends SFGanttScrollerControl
	@class
	*/
	function SFGanttDivScroller(targetDiv)
	{
		this.layoutName="listFoot";
	}
	SFGanttDivScroller.prototype=new SFGanttScrollerControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttDivScroller.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout){return false;}
		var targetDiv=this.targetDiv=gantt.getLayout("listHead");
		if(!targetDiv){return false;}
		if(!SFGanttScrollerControl.prototype.initialize.apply(this,arguments)){return false;}
		this.startLeft=parseInt(targetDiv.firstChild.style.left);
		this.listeners.push(SFEvent.bind(this,"scroll",this,this.onScroll));
		this.listeners.push(SFEvent.bind(gantt,"listfieldsresize",this,this.onResize));
		return true;
	}
	/**
	@private
	在甘特图大小变化时根据新的大小调整滚动条的显示
	*/
	SFGanttDivScroller.prototype.onResize=function()
	{
		if(!this.container){return;}
		SFGanttScrollerControl.prototype.onResize.apply(this,arguments);
		this.init(this.targetDiv.offsetWidth,this.targetDiv.scrollWidth+this.startLeft);
	}
	/**
	@private
	在滚动条滚动的时候触发事件
	@param {Number} scrollLeft 滚动条的当前滚动位置
	*/
	SFGanttDivScroller.prototype.onScroll=function(scrollLeft)
	{
		for(var child=this.targetDiv.firstChild;child;child=child.nextSibling)
		{
			if(!child.style){continue;}
			child.style.left=-scrollLeft+this.startLeft+"px";
		}
		SFEvent.trigger(this.targetDiv,"scroll");
	}
	

	/**
	这是一个甘特图功能控件，本控件是右侧图表的滚动条
	@private
	@extends SFGanttScrollerControl
	@class
	*/
	function SFGanttTimeScroller()
	{
		this.layoutName="mapFoot";
	}
	SFGanttTimeScroller.prototype=new SFGanttScrollerControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTimeScroller.prototype.initialize=function(gantt)
	{
		if(!SFGanttScrollerControl.prototype.initialize.apply(this,arguments)){return false;}
		this.listeners.push(SFEvent.bind(this,"scrollstart",this,this.onScrollStart));
		this.listeners.push(SFEvent.bind(this,"scroll",this,this.onScroll));
		this.listeners.push(SFEvent.bind(this,"scrollend",this,this.onScrollEnd));
		return true;
	}
	/**
	@private
	在甘特图大小变化时根据新的大小调整滚动条的显示
	*/
	SFGanttTimeScroller.prototype.onResize=function()
	{
		if(!this.container){return;}
		SFGanttScrollerControl.prototype.onResize.apply(this,arguments);
		var width=this.gantt.getLayout("mapBody").offsetWidth;
		this.init(width,width*9,width*4);
	}
	/**
	@private
	在滚动条开始滚动时执行的操作
	@param {Number} scrollLeft 滚动条的当前滚动位置
	*/
	SFGanttTimeScroller.prototype.onScrollStart=function(scrollLeft)
	{
		this.scrollObj={start:scrollLeft,startTime:this.gantt.startTime};
	}
	/**
	@private
	在滚动条滚动时持续执行的操作
	@param {Number} scrollLeft 滚动条的当前滚动位置
	*/
	SFGanttTimeScroller.prototype.onScroll=function(scrollLeft)
	{
		this.gantt.move(scrollLeft-this.scrollObj.start);
		this.scrollObj.start=scrollLeft;
	}
	/**
	@private
	在滚动条结束滚动时执行的操作
	@param {Number} scrollLeft 滚动条的当前滚动位置
	*/
	SFGanttTimeScroller.prototype.onScrollEnd=function(e)
	{
		this.onResize();
	}
	window.SFGanttScrollerControl=SFGanttScrollerControl;
	window.SFGanttDivScroller=SFGanttDivScroller;
	window.SFGanttTimeScroller=SFGanttTimeScroller;