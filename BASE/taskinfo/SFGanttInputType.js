	function SFGanttInputType(showFunc,parseFunc)
	{
		this.show=showFunc;
		this.parse=parseFunc;
	}
	SFGanttInputType.init=function()
	{
		SFGanttInputType.types={
			Percent:		new SFGanttInputType(SFGanttInputType.PercentShow,		SFGanttInputType.PercentParse),
			Text:			new SFGanttInputType(SFGanttInputType.TextShow,			SFGanttInputType.TextParse),
			Textarea:		new SFGanttInputType(SFGanttInputType.TextareaShow,		SFGanttInputType.TextParse),
			Time:			new SFGanttInputType(SFGanttInputType.TimeShow,			SFGanttInputType.TimeParse),
			Constraint:		new SFGanttInputType(SFGanttInputType.ConstraintShow,	SFGanttInputType.SelectParse),
			Predecessor:	new SFGanttInputType(SFGanttInputType.PredecessorShow,	SFGanttInputType.SelectParse)
		};
	}
	SFGanttInputType.show=function(div,value)
	{
		return this.input.show.apply(this,[div,value]);
	}
	SFGanttInputType.parse=function(div,obj,key)
	{
		var value=this.input.parse.apply(this,[div]);
		var node=SFAjax.selectSingleNode(obj.node,key);
		if(!node)
		{
		    node=obj.node.ownerDocument.createElement(key);
		    obj.node.appendChild(node);
		}
		SFAjax.setNodeValue(node,value);
		var value=this.type.read.apply(this,[node]);
		if(obj.setProperty)
		{
			obj.setProperty(key,value);
		}
		else
		{
			obj[key]=value;
		}
		return value;
	}
	SFGanttInputType.TextShow=function(div,value)
	{
		var input=document.createElement("input");
		input.size=30;
		input.value=(value!=null?value:'');
		div.appendChild(input);
	}
	SFGanttInputType.TextParse=function(div)
	{
		return div.firstChild.value;
	}
	SFGanttInputType.TextareaShow=function(div,value)
	{
		var input=document.createElement("textarea");
		input.value=value?value:'';
		SFGlobal.setProperty(input,{cols:30,rows:5});
		div.appendChild(input);
	}
	SFGanttInputType.TextareaParse=function(div)
	{
		return div.firstChild.value;
	}
	SFGanttInputType.PercentShow=function(div,value)
	{
		var input=document.createElement("input");
		input.size=3;
		input.value=(value!=null?parseInt(value):0);
		div.appendChild(input);
		div.appendChild(document.createTextNode("%"));
	}
	SFGanttInputType.PercentParse=function(div)
	{
		return parseInt(div.firstChild.value);
	}
	SFGanttInputType.TimeShow=function(div,value)
	{
		var input=document.createElement("input");
		input.size=20;
		input.value=value?SFGlobal.getDateString(value,"s").replace('T',' '):'';
		div.appendChild(input);
	}
	SFGanttInputType.TimeParse=function(div)
	{
		var str=div.firstChild.value.replace(' ','T');
		return str;
	}
	SFGanttInputType.ConstraintShow=function(div,value)
	{
		var select=document.createElement("select");
		var array=SFGanttTask.getConstraintTypeArray();
		for(var i=0;i<array.length;i++)
		{
			var option=document.createElement("option");
			SFGlobal.setProperty(option,{text:array[i],value:i});
			select.options.add(option);
		}
		select.selectedIndex=value;
		div.appendChild(select);
	}
	SFGanttInputType.PredecessorShow=function(div,value)
	{
		var select=document.createElement("select");
		var array=SFGanttLink.getTypeArray();
		for(var i=0;i<array.length;i++)
		{
			var option=document.createElement("option");
			SFGlobal.setProperty(option,{text:array[i],value:i});
			select.options.add(option);
		}
		select.selectedIndex=value;
		div.appendChild(select);
	}
	SFGanttInputType.SelectParse=function(div)
	{
		return div.firstChild.selectedIndex;
	}
	if(!window._obscure){SFGanttInputType.init();}
	window.SFGanttInputType=SFGanttInputType;