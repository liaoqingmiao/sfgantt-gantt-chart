	/**
	此控件是甘特图之中的显示信息窗口的控件，加载了此控件之后就可以使用地图的打开窗口的方法，
	@class
	@private
	*/
	function SFGanttDialogControl()
	{
	}
	SFGanttDialogControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttDialogControl.prototype.initialize=function(gantt)
	{
		if(this.gantt){return false;}
		gantt.openDialog=SFEvent.getCallback(this,this.openDialog);
		gantt.closeDialog=SFEvent.getCallback(this,this.closeDialog);
		this.gantt=gantt;
		return true;
	}
	/**
	在甘特图上显示一个浮动窗口
	@name SFGantt.prototype.openDialog
	@function
	@param {HtmlElement|String} [content] 窗口的内容，为一个HTML元素或者字符串
	@param {Json} [config] 窗口的显示参数
	@param {Number[]} [config.size] 窗口内容的大小,如[500,400]代表宽度为500，高度为400，如果不设置，默认为甘特图大小的一半
	@param {Bool} [config.isModal] 是否是模式窗口，如果为true,则打开此窗口时，甘特图上的项目都会被半透明的遮罩遮住，不允许操作，只能在当前的模式窗口上进行操作
	@param {String} [config.title] 窗口的标题
	*/
	SFGanttDialogControl.prototype.openDialog=function(content,config)
	{
		if(this.isOpen){this.closeDialog();}
		config=config?config:{};
		var gantt=this.gantt,viewSize=gantt.getViewSize(),container=this.gantt.getContainer();
		var size=config.size?config.size:[parseInt(viewSize[0]/2),parseInt(viewSize[1]/2)];
		var wSize=[size[0]+10,size[1]+35];
		var div=this.div,contentDiv;
		if(!div)
		{
			var div=this.div=document.createElement("div");
			SFGlobal.setProperty(div.style,{position:'absolute',overflow:'hidden',zIndex:990,border:'solid 1px #000000',backgroundColor:'#FFFFFF'});
			var titleDiv=document.createElement("div");
			SFGlobal.setProperty(titleDiv.style,{position:'relative',borderBottom:'solid 1px #000000',backgroundColor:'#999999',width:'100%',height:'21px'});
			div.appendChild(titleDiv);
			var titleSpan=document.createElement("div");
			SFGlobal.setProperty(titleSpan.style,{position:'relative',width:'100%',height:'16px',fontSize:'14px',fontWeight:'bolder',padding:'4px',paddingLeft:'10px',cursor:'move'});
			titleDiv.appendChild(titleSpan);
			var closeBtn=document.createElement("div")
			SFGlobal.setProperty(closeBtn.style,{position:'absolute',right:'2px',top:'-8px',fontSize:'25px',backgroundColor:'#999999',cursor:'pointer'});
			closeBtn.appendChild(document.createTextNode("×"));
			div.appendChild(closeBtn);
			this.listeners=[SFEvent.bind(closeBtn,"click",this,this.closeDialog)];
			var contentDiv=document.createElement("div");
			SFGlobal.setProperty(contentDiv.style,{position:'relative',fontSize:'13px',margin:'5px'});
			div.appendChild(contentDiv);
		}
		else
		{
			contentDiv=div.lastChild;
		}
		SFGlobal.setProperty(div.style,{left:(viewSize[0]-wSize[0])/2+'px',top:(viewSize[1]-wSize[1])/2+'px',width:wSize[0]+'px',height:wSize[1]+'px'});
		SFGlobal.setProperty(contentDiv.style,{width:size[0]+'px',height:size[1]+'px'});
		//标题的显示
		if(config.title)
		{
			div.firstChild.firstChild.innerHTML=config.title;
		}
		else
		{
			SFEvent.deposeNode(div.firstChild.firstChild,true);
		}
		//内容的显示
		if(typeof(content)=="object")
		{
			contentDiv.appendChild(content);
		}
		else
		{
			contentDiv.innerHTML=content;
		}
		container.appendChild(div);
		//如果是模式窗口，则用透明层将甘特图遮住
		if(config.isModal)
		{
			//现在开始使用遮罩层
			var maskDiv=this.maskDiv;
			if(!maskDiv)
			{
				var maskDiv=this.maskDiv=document.createElement("div");
				SFGlobal.setProperty(maskDiv.style,{position:'absolute',zIndex:950,backgroundColor:'#000000'});
				SFGlobal.setOpacity(maskDiv,0.7);
			}
			SFGlobal.setProperty(maskDiv.style,{left:'0px',top:'0px',width:viewSize[0]+'px',height:viewSize[1]+'px'});
			container.appendChild(maskDiv);
		}
		else
		{
			if(this.maskDiv){container.removeChild(this.maskDiv);}
		}
		/** 
			@event
			@name SFGantt#dialogopen
			@param {Json} [config] 窗口的显示参数
			@description 在浮动窗口打开时触发。
		 */
		 this.isOpen=true;
		SFEvent.trigger(this.gantt,"dialogopen",[config]);
	}
	/**
	关闭浮动窗口
	@name SFGantt.prototype.closeDialog
	@function
	*/
	SFGanttDialogControl.prototype.closeDialog=function()
	{
		var container=this.gantt.getContainer();
		if(this.maskDiv){container.removeChild(this.maskDiv);}
		if(this.div){
			while(this.div.lastChild.firstChild){this.div.lastChild.removeChild(this.div.lastChild.firstChild);}
			container.removeChild(this.div);
		}
		/** 
			@event
			@name SFGantt#dialogclose
			@description 在浮动窗口被关闭时触发。
		 */
		this.isOpen=false;
		SFEvent.trigger(this.gantt,"dialogclose");
	}
	/**
	在功能控件被移除时执行的方法
	@private
	*/
	SFGanttDialogControl.prototype.remove=function()
	{
		this.closeDialog();
		var gantt=this.gantt;
		delete gantt.openDialog
		delete gantt.closeDialog
		delete this.maskDiv
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttDialogControl=SFGanttDialogControl;
