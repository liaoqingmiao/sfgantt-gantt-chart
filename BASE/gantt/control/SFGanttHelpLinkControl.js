	/**
	这是一个甘特图功能控件，本控件实现甘特图右上角的问号图标，用来连接到帮助文档
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttHelpLinkControl()
	{
	}
	SFGanttHelpLinkControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttHelpLinkControl.prototype.initialize=function(gantt)
	{
		var container,doc=gantt.container.ownerDocument;
		/**
		是否禁止禁止帮助链接的加载
		@name SFConfig.configItems.SFGantt_disableHelpLink
		@type Bool
		@default false
		*/
		if(gantt.disableHelpLink || !gantt.getLayout || !(container=gantt.getLayout("head"))){return false;}
		var helpDiv=this.div=doc.createElement("div");
		SFGlobal.setProperty(helpDiv.style,{position:'absolute',backgroundColor:gantt.headBgColor,width:'16px',right:'0px',top:'0px',textAlign:'right',padding:'3px'});
		var helpLink=doc.createElement("a");
		SFGlobal.setProperty(helpLink.style,{fontSize:'24px',color:'#000000',textDecoration:'none'});
		helpLink.appendChild(doc.createTextNode("?"));
		helpLink.title=(window.SFNS && window.SFNS.vinfo)?SFGlobal.getDateString(SFGlobal.getDate(window.SFNS.vinfo.time),"s"):"";
		SFGlobal.setProperty(helpLink,{href:'<%HelpLink%>',target:'_blank'});
		helpDiv.appendChild(helpLink);
		container.appendChild(helpDiv);
		return true;
	}
	window.SFGanttHelpLinkControl=SFGanttHelpLinkControl;