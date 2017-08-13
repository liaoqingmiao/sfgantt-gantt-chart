	/**
	向日葵甘特图(SFGantt JavaScript API)之中用来进行事件处理的类，该类的所有方法都是静态方法，因此不需要构造该类的实例而直接使用方法即可
	@example
	SFEvent.addListener(obj,event,handle);
	@class
	*/
	function SFEvent(){}
	/**
	获取对obj的handle方法的回调函数
	@param		{Object} obj	对象
	@param	{Function} handle	对象的方法
	@returns {Function}	返回一个函数，调用此函数相当于调用obj的handle方法
	*/
	SFEvent.getCallback=function(obj,handle){return function(){return handle.apply(obj,arguments)};}
	/**
	判断一个对象是不是需要使用浏览器集成的模式来进行事件的触发
	@private
	@param		{Object} obj	对象
	@returns {Bool}	如果是浏览器集成的对象，则返回true,否则返回false
	*/
	SFEvent.isHtmlControl=function(obj){return (obj.tagName || obj.nodeName || obj==window);}
	/**
	返回浏览器的事件
	@private
	@param		{arguments} argu	根据一个arguments数组返回当前浏览器的Event事件
	@returns {Event}	返回事件
	*/
	SFEvent.getEvent=function(argu)
	{
		if(!argu){argu=[];}
		if(!argu[0]){argu[0]=window.event;}
		if(argu[0] && !argu[0].target && argu[0].srcElement){argu[0].target=argu[0].srcElement}
		return argu;
	}
	/**
	创建对hObj对象的hMethod方法的事件适配器
	@private
	@param		{Object} obj	对象
	@param	{Function} method	对象的方法
	@returns {Function}	返回事件适配器函数
	*/
	SFEvent.createAdapter=function(obj,method)
	{
		return function(){method.apply(obj,SFEvent.getEvent(arguments));}
	};
	/**
	中止windows集成事件处理的执行并返回false
	@param		{Event} [e]	浏览器的事件对象
	*/
	SFEvent.cancelBubble=function(e)
	{
		e=e?e:window.event;
		if(!e){return;}
		if(e.stopPropagation)
		{
			e.preventDefault();
			e.stopPropagation();
		}
		else
		{
			e.cancelBubble=true;
			e.returnValue=false
		}
	};
	/**
	中止windows集成事件处理的执行并返回true
	@param		{Event} [e]	浏览器的事件对象
	*/
	SFEvent.returnTrue=function(e)
	{
		e=e?e:window.event;
		if(!e){return;}
		if(e.stopPropagation)
		{
			e.stopPropagation();
		}
		else
		{
			e.cancelBubble=true;
			e.returnValue=true;
		}
	};
	/**
	将hObj对象的hMethod方法绑定到obj的event事件，返回一个listener对象
	@param		{Object} obj
	@param	{String} event	要绑定的事件名称
	@param		{Object} hObj
	@param	{Function} hMethod
	@returns {EventListener}	返回事件监视器
	*/
	SFEvent.bind=function(obj,event,hObj,hMethod,once)
	{
		return SFEvent.addListener(obj,event,SFEvent.isHtmlControl(obj)?SFEvent.createAdapter(hObj,hMethod):SFEvent.getCallback(hObj,hMethod),once);
	};
	/**
	销毁一个HTML节点，并清除所有在节点上绑定的事件
	@private
	@param			{HtmlElement} node
	@param	{Bool} onlyChild	如果为true则不清除node本身，而是将node所有的子节点清除
	*/
	SFEvent.deposeNode=function(node,onlyChild)
	{
		if(!node){return;}
		if(node.parentNode && !onlyChild){node.parentNode.removeChild(node);}
		if(!onlyChild)
		{
			SFEvent.clearListeners(node);
			if(node._SF_E_){node._SF_E_=null;}
		}
		var child;
		while(child=node.firstChild)
		{
			SFEvent.deposeNode(child);
		}
	}
	/**
	根据事件监视器返回一个句柄，指定该事件监视器只会被执行一次就删除监视
	@private
	@param	{Function} handle
	@param {EventListener}	listener 事件监视器
	@returns {Function} 返回新的事件句柄
	*/
	SFEvent.runOnceHandle=function(handle,listener){return function(){handle.apply(this,arguments);SFEvent.removeListener(listener);}}
	/**
	将handle函数绑定到obj的event事件，返回一个listener对象
	@param		{Object} obj
	@param	{String} event	要绑定的事件名称
	@param	{Function} handle
	@returns {EventListener}	返回事件监视器
	*/
	SFEvent.addListener=function(obj,event,handle,once)
	{
		var listener=[obj,event];
		if(once){handle=SFEvent.runOnceHandle(handle,listener)}
		var type=SFEvent.isHtmlControl(obj);
		if(type)
		{//如果是HTML控件，则以HTML控件作为对象来运行
			handle=SFEvent.createAdapter(obj,handle);
			if(obj.addEventListener){obj.addEventListener(event,handle,false);}
			else if(obj.attachEvent){obj.attachEvent("on"+event,handle);}
			else
			{//针对onload这种事件
				var oldEvent =obj["on"+event];
				if(typeof(oldEvent)=='function')
				{
					obj["on"+event]= function(){oldEvent();handle();};
				}
				else
				{
					obj["on"+event]=handle;
				}
			}
		}
		listener.push(handle);
		if(!obj._SF_E_){obj._SF_E_=[];}
		if(!SFGlobal.findInArray(obj._SF_E_,event)){obj._SF_E_.push(event);}
		if(obj["_SF_E_"+event] && type!="shape")
		{
			obj["_SF_E_"+event].push(listener);
		}
		else
		{
			obj["_SF_E_"+event]=(type=="shape")?[]:[listener];
		}
		if(!SFEvent.allEvents){SFEvent.allEvents=[];}
		if(event!="unload"){SFEvent.allEvents.push(listener);}
		return listener;
	};
	/**
	删除事件监视器注册
	@param	{EventListener} listener	要清除的事件监视器
	*/
	SFEvent.removeListener=function(listener)
	{
		if(!listener || listener.length==0){return;}
		try{
		if(SFEvent.isHtmlControl(listener[0]))
		{
			if(listener[0].removeEventListener)
			{
				listener[0].removeEventListener(listener[1],listener[2],false);
			}
			else if(listener[0].detachEvent)
			{
				listener[0].detachEvent("on"+listener[1],listener[2]);
			}
			else
			{
				listener[0]["on"+listener[1]]=null;
			}
		}
		}catch(e){}
		SFGlobal.deleteInArray(listener[0]["_SF_E_"+listener[1]],listener);
		SFGlobal.deleteInArray(SFEvent.allEvents,listener);
		while(listener.length>0){listener.pop()}
	};
	/**
	删除所有事件注册
	@param		{Object} obj	要清除事件的对象
	@param	{String} event	如果指定了事件名称，则只清除这种事件
	*/
	SFEvent.clearListeners=function(obj,event)
	{
		if(!obj || !obj._SF_E_){return;}
		if(!event)
		{
			for(var i=obj._SF_E_.length-1;i>=0;i--)
			{
				SFEvent.clearListeners(obj,obj._SF_E_[i]);
			}
			return;
		}
		var listener,listeners=obj["_SF_E_"+event];
		while(listener=listeners.pop()){SFEvent.removeListener(listener)}
	};
	/**
	删除所有系统之中事件注册
	@private
	*/
	SFEvent.clearAllListeners=function()
	{
		var listeners=SFEvent.allEvents;
		if(listeners)
		{
			for(var i=listeners.length-1;i>=0;i--)
			{
				SFEvent.removeListener(listeners[i]);
			}
		}
		SFEvent.allEvents=null;
	};
	/**
	触发obj的event事件，args是触发的参数
	@param		{Object} obj	事件触发源
	@param	{String} event	要触发的事件名称,如果要捕获所有事件，使用"*"
	@param	{Array} args	触发事件所用的参数
	@returns {Bool}	事件触发结果，一般只有before类型的事件会有事件触发结果
	*/
	SFEvent.trigger=function(obj,event,args)
	{
		if(SFEvent.isHtmlControl(obj))
		{
			try{
			if(obj.fireEvent){obj.fireEvent("on"+event);}
			if(obj.dispatchEvent){obj.dispatchEvent(event);}
			}catch(e){}
		}
		if(!args){args=[];}
		var listeners=obj["_SF_E_"+event];
		if(listeners&&listeners.length>0)
		{
			for(var i=0;i<listeners.length;i++)
			{
				var listener=listeners[i];
				if(listener && listener[2])
				{
					listener[2].apply(obj,args);
				}
			}
		}
	}
	/**
	计算层左上角相对于另一个层左上角的位置
	@private
	@param	{HtmlElement} obj
	@param	{HtmlElement} [container=document.body] 默认为整个页面
	@returns {[x,y]}
	*/
	SFEvent.getPageOffset=function(obj,container)
	{
		var point=[0,0];
		var a=obj;
		while(a && a.offsetParent && a!=container)
		{
			point[0]+=a.offsetLeft;
			point[1]+=a.offsetTop;
			a=a.offsetParent
			if(a)
			{
				point[0]-=a.scrollLeft;
				point[1]-=a.scrollTop;
			}
		}
		return point;
	}
	/**
	计算事件e发生的位置相对于container层左上角的位置
	@param	{Event} e
	@param	{HtmlElement} container
	@returns {[x,y]}
	*/
	SFEvent.getEventPosition=function(e,container)
	{
		if(typeof e.clientX!="undefined")
		{
			var rect = container.getBoundingClientRect(); 
			return [e.clientX-rect.left, e.clientY-rect.top] 
		}
		/*
		if(typeof e.offsetX!="undefined")
		{
			var src=e.target||e.srcElement;
			var offset=[e.offsetX,e.offsetY];
			while(src&&src!=container)
			{
				if(!(src.clientWidth==0 && src.clientHeight==0 && src.offsetParent && src.offsetParent.nodeName=="TD"))
				{
					offset[0]+=src.offsetLeft;
					offset[1]+=src.offsetTop;
				}
				src=src.offsetParent;
				if(src)
				{
					offset[0]-=src.scrollLeft;
					offset[1]-=src.scrollTop;
				}
				else
				{
					var s=SFEvent.getPageOffset(container);
					return [offset[0]-s[0],offset[1]-s[1]];
				}
			}
			return offset;
		}*/
		if(typeof e.pageX!="undefined")
		{
			var offset=SFEvent.getPageOffset(container);
			return [e.pageX-offset[0],e.pageY-offset[1]];
		}
		return [0,0];
	}
	/**
	计算事件e发生的位置相对于container层左上角的位置
	@private
	@param	{Event} e
	@param	{HtmlElement} container
	@returns {[x,y]}
	*/
	SFEvent.getEventRelative=function(e,container)
	{
		return SFEvent.getEventPosition(e,container);
	}
	/**
	根据鼠标事件判断鼠标按下的键
	@param	{Event} e
	@returns {Number}	1代表左键，2代表右键
	*/
	SFEvent.getEventButton=function(e)
	{
		return (document.all&& !+'\v1')?e.button:(e.button==2?2:1);
	}
	/**
	设置HTML层的内容不允许被选中
	@param {HtmlElement} obj 指定的层
	@private
	*/
	SFEvent.setUnSelectable=function(obj)
	{
		if(document.all)
		{
			obj.unselectable="on";
			obj.onselectstart=SFEvent.falseFunction
		}
		else
		{
			obj.style.MozUserSelect="text";
		}
	}
	/**
	一个简单的返回false的函数
	@private
	*/
	SFEvent.falseFunction=function()
	{
		return false;
	}
	/**
	初始化事件系统，主要是添加事件监视，以在页面卸载的时候清除所有的事件，避免在IE下出现事件泄漏问题
	@private
	*/
	SFEvent.load=function()
	{
		if(!SFEvent._ganttUnloadListener){SFEvent._ganttUnloadListener=SFEvent.addListener(window,"unload",SFEvent.clearAllListeners);}
	}
	window.SFEvent=SFEvent;
	if(!window._obscure){SFEvent.load()}