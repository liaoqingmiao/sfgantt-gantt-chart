	/**
	拖拽功能的实现类
	@ignore
	@private
	@class
	@param {HtmlElement} div 需要实现拖放的层名称
	@param {Function} handle		在拖放过程之中持续调用的方法
	@param {HtmlElement} [config.container]	用来计算当前层的位置的父层，默认就是当前层，
	@param {Number} [config.interval=256]		触发事件的毫秒数间隔，
	@param {Bool} [config.rtp=false]			是否需要即时调整层的位置
	*/
	function SFDragObject(div,handle,config)
	{
		SFGlobal.setProperty(this,{div:div,handle:handle,container:div,interval:256});
		SFGlobal.setProperty(this,config);
	}
	/**
	@ignore
	开始拖拽过程
	@private
	@param		{Event} e	拖拽开始的鼠标按下事件
	*/
	SFDragObject.prototype.onMouseDown=function(e)
	{
		SFEvent.cancelBubble(e);
		var div=this.div,doc=div.ownerDocument;
		if(div.setCapture){div.setCapture();}
		var point=SFEvent.getEventPosition(e,this.container);
		SFGlobal.setProperty(this,{
			ml:SFEvent.bind(doc,"mousemove",this,this.onMouseMove),
			ul:SFEvent.bind(doc,"mouseup",this,this.onMouseUp),
			sp:point,
			lp:point,
			timeout:window.setInterval(SFEvent.getCallback(this,this.onTime),this.interval)
		});
		//如果需要即时定位，则先记录下原先的位置
		if(this.rtp)
		{
			var style=div.style;
			this.dsp={x:parseInt(style.left),y:parseInt(style.top)}
		}
		this.handle(point,point,"start");
	}
	/**
	@ignore
	在move事件发生的时候持续触发
	@private
	@param		{Event} e	拖拽过程中的鼠标移动事件
	*/
	SFDragObject.prototype.onMouseMove=function(e)
	{
		SFEvent.cancelBubble(e);
		var point=SFEvent.getEventPosition(e,this.container),rtp=this.rtp;
		this.lp=point;
		this.moveed=true;
		if(rtp)//如果需要即时定位
		{
			var dsp=this.dsp,sp=this.sp;
			var px=dsp.x+rtp.x*(point.x-sp.x),py=dsp.y+rtp.y*(point.y-sp.y);
			var rtpLimit=this.rtpLimit;
			if(rtpLimit)
			{
				if(rtpLimit.minX){px=Math.max(px,rtpLimit.minX);}
				if(rtpLimit.maxX){px=Math.min(px,rtpLimit.maxX);}
				if(rtpLimit.minY){py=Math.max(py,rtpLimit.minY);}
				if(rtpLimit.maxY){py=Math.min(py,rtpLimit.maxY);}
			}
			SFGlobal.setProperty(this.div.style,{left:px+"px",top:py+"px"});
		}
	}
	/**
	@ignore
	在指定间隔时间内持续触发
	@private
	*/
	SFDragObject.prototype.onTime=function()
	{
		if(this.div && this.moveed)
		{
			this.handle(this.sp,this.lp);
			this.moveed=false;
		}
	}
	/**
	@ignore
	结束拖拽过程
	@private
	@param		{Event} e	拖拽结束的鼠标移动事件
	*/
	SFDragObject.prototype.onMouseUp=function(e)
	{
		this.onTime();
		var doc=this.div.ownerDocument;
		SFEvent.cancelBubble(e);
		SFEvent.removeListener(this.ml);
		SFEvent.removeListener(this.ul);
		window.clearInterval(this.timeout);
		delete this.div;
		delete this.container;
		if(doc.releaseCapture){doc.releaseCapture();}
		this.handle(this.sp,this.lp,"end");
	}
	/**
	@ignore
	设置div层的拖拽逻辑
	@private
	@param		{HtmlElement} div	允许拖拽的层
	@param	{Function} handle	在拖拽开始后持续调用的函数
	@param	{HtmlElement} [config.container=div]	用来计算当前层的位置的父层，默认就是当前层，
	@param	{Number} [config.interval=256]		触发事件的毫秒数间隔，
	@param	{Bool} [config.rtp=false]			是否需要即时调整层的位置
	@returns {EventListener} 返回实现此拖拽的事件监视器，清除监视器即可取消拖拽逻辑
	*/
	SFDragObject.setup=function(div,handle,config)
	{
		return SFEvent.addListener(div,"mousedown",function(e)
		{
			if(SFEvent.getEventButton(e)!=1){return;}
			var obj=new SFDragObject(div,handle,config);
			obj.onMouseDown(e);
		});
	}
	window.SFDragObject=SFDragObject;