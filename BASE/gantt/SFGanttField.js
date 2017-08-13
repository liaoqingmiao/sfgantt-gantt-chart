	/**
	用来代表甘特图之中一个显示列定义的类，其他所有的列定义都是继承此类，甘特图左侧列表之中的各列和右侧图标之中的相关信息的显示都是通过一个或多个域来完成的，SFGanttField类管理这些域
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"起始时间"
	@param {Function} [obj.headFunc] 列的表头绘制方法
	@param {Function} [obj.bodyFunc] 列的表内容绘制方法
	@param {Function} [obj.inputFunc] 如果该列支持编辑，列的编辑模式绘制方法
	@param {String} [obj.inputData] 如果该列支持编辑，列的所编辑的属性字段名称，例如"Start"
	@param {String} [obj.bodyData] 该列的表内容对应的属性字段名称，例如"Start"，如果有多个，用逗号分隔，当这些字段变化时，将会重绘此列
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@class
	*/
	function SFGanttField()
	{
		if(arguments.length<=0){return;}
		SFGlobal.setProperty(this,{width:100,headText:'',headStyle:{textAlign:'center'},bodyStyle:{textAlign:'left'},inputStyle:{}});
		var obj=arguments[0];
		if(typeof(obj)!="object")
		{
			var argu=arguments;
			obj={};
			if(argu[0]){obj.width=argu[0];}
			if(argu[1]){obj.headText=argu[1];}
			if(argu[2]){obj.headFunc=argu[2];}
			if(argu[3]){obj.bodyFunc=argu[3];}
			if(argu[4]){obj.inputFunc=argu[4];}
			if(argu[5]){obj.inputData=argu[5];}
			if(argu[6]){obj.bodyData=argu[6];}
		}
		SFGlobal.setProperty(this,obj);
	}
	/**
	根据列名称和类型获得指定的列对象
	@private
	@param {String} type 列类型，例如"Task","Link","Resource"或"Assignment"
	@param {String} name 列名称，例如"Start"
	@returns {SFGanttField}
	*/
	SFGanttField.getField=function(type,name)
	{
		var fields=SFGanttField["_Fields_"+type];
		if(!fields || !fields[name]){SFGanttField.setField(type,name,new SFGanttField(100,name));}
		if(!fields){fields=SFGanttField["_Fields_"+type];}
		return fields[name];
	}
	/**
	根据列名称数组和类型获得指定的列对象数组
	@private
	@param {String} type 列类型，例如"Task","Link","Resource"或"Assignment"
	@param {String[]} name 列名称数组，例如["Start","Finish"]
	@returns {SFGanttField[]}
	*/
	SFGanttField.getFields=function(type,names)
	{
		var fields=[];
		for(var i=0;i<names.length;i++)
		{
			if(!names[i]){continue;}
			fields.push(SFGanttField.getField(type,names[i]));
		}
		return fields;
	}
	/**
	注册指定类型和名称的列
	@private
	@param {String} type 列类型，例如"Task","Link","Resource"或"Assignment"
	@param {String} name 列名称，例如"myProperty"
	@param {SFGanttField} 列对象
	*/
	SFGanttField.setField=function(type,name,field)
	{
		var fields=SFGanttField["_Fields_"+type];
		if(!fields){fields=SFGanttField["_Fields_"+type]={};}
		fields[name]=field;
		field.Name=name;
	}
	/**
	根据列名称数组获得对应的任务列对象数组
	@private
	@param {String[]} name 列名称数组，例如["Start","Finish"]
	@returns {SFGanttField[]}
	*/
	SFGanttField.getTaskFields=function(names){return SFGanttField.getFields("Task",names);}
	/**
	根据列名称数组获得对应的资源列对象数组
	@private
	@param {String[]} name 列名称数组，例如["Name","Notes"]
	@returns {SFGanttField[]}
	*/
	SFGanttField.getResourceFields=function(names){return SFGanttField.getFields("Resource",names);}
	/**
	根据列名称数组获得对应的链接列对象数组
	@private
	@param {String[]} name 列名称数组，例如["FromTask","ToTask"]
	@returns {SFGanttField[]}
	*/
	SFGanttField.getLinkFields=function(names){return SFGanttField.getFields("Link",names);}
	/**
	根据列名称获得对应的任务列对象
	@param {String} name 列名称，例如"Start"，所有系统集成任务列的定义请参看 {@link SFGanttField.taskFields}
	@returns {SFGanttField} 返回对应的列对象
	*/
	SFGanttField.getTaskField=function(name){return SFGanttField.getField("Task",name);}
	/**
	根据列名称获得对应的资源列对象
	@param {String} name 列名称，例如"Name"，所有系统集成任务列的定义请参看 {@link SFGanttField.resourceFields}
	@returns {SFGanttField} 返回对应的列对象
	*/
	SFGanttField.getResourceField=function(name){return SFGanttField.getField("Resource",name);}
	/**
	根据列名称获得对应的链接列对象
	@param {String} name 列名称，例如"FromTask"，所有系统集成链接列的定义请参看 {@link SFGanttField.linkFields}
	@returns {SFGanttField} 返回对应的列对象
	*/
	SFGanttField.getLinkField=function(name){return SFGanttField.getField("Link",name);}
	/**
	注册指定名称的任务列
	@param {String} name 列名称，例如"myProperty"
	@param {SFGanttField} field 列对象
	*/
	SFGanttField.setTaskField=function(name,field){return SFGanttField.setField("Task",name,field);}
	/**
	注册指定名称的资源列
	@param {String} name 列名称，例如"myProperty"
	@param {SFGanttField} field 列对象
	*/
	SFGanttField.setResourceField=function(name,field){return SFGanttField.setField("Resource",name,field);}
	/**
	注册指定名称的链接列
	@param {String} name 列名称，例如"myProperty"
	@param {SFGanttField} field 列对象
	*/
	SFGanttField.setLinkField=function(name,field){return SFGanttField.setField("Link",name,field);}
	/**
	添加指定的任务列，此函数是为了和以前的版本兼容，现在已经过期
	@private
	@deprecated
	*/
	SFGanttField.addTaskField=function(name,width,headText,headFunc,bodyFunc,inputFunc,inputData,bodyData){SFGanttField.setField("Task",name,new SFGanttField({width:width,headText:headText,headFunc:headFunc,bodyFunc:bodyFunc,inputFunc:inputFunc,inputData:inputData,bodyData:bodyData}));}


	/**
	设置列宽度
	@param {Number} width 列宽度的像素值
	*/
	SFGanttField.prototype.setWidth=function(width){this.width=parseInt(width);}
	/**
	设置列的表格头文字
	@param {String} text 表格头文字，支持HTML
	*/
	SFGanttField.prototype.setHeadText=function(text){this.headText=text;}
	/**
	设置列的表格头对齐方式
	@param {String} align 对齐方式，有"left","center","right"三种对齐方式
	*/
	SFGanttField.prototype.setHeadAlign=function(align){this.setHeadStyle({textAlign:align});}
	/**
	设置列的表格头显示字体颜色
	@param {String} color 颜色值，例如"red"或者"#FF0000"
	*/
	SFGanttField.prototype.setHeadColor=function(color){this.setHeadStyle({color:color})}
	/**
	设置列的表格头显示背景色
	@param {String} color 颜色值，例如"red"或者"#FF0000"
	*/
	SFGanttField.prototype.setHeadBgColor=function(color){this.setHeadStyle({backgroundColor:color});}
	/**
	以CSS方式直接设置列的表格头显示样式表
	@param {Json} style 需要设置的样式表集合，例如{backgroundColor:'#666600',fontSize:'13px'}
	*/
	SFGanttField.prototype.setHeadStyle=function(obj){SFGlobal.setProperty(this.headStyle,obj);}
	/**
	设置列的表格内容对齐方式
	@param {String} align 对齐方式，有"left","center","right"三种对齐方式
	*/
	SFGanttField.prototype.setBodyAlign=function(align){this.setBodyStyle({textAlign:align});}
	/**
	设置列的表格内容显示字体颜色
	@param {String} color 颜色值，例如"red"或者"#FF0000"
	*/
	SFGanttField.prototype.setBodyColor=function(color){this.setBodyStyle({color:color});}
	/**
	设置列的表格内容显示背景颜色
	@param {String} color 颜色值，例如"red"或者"#FF0000"
	*/
	SFGanttField.prototype.setBodyBgColor=function(color){this.setBodyStyle({backgroundColor:color});}
	/**
	以CSS方式直接设置列的表格内容显示样式表
	@param {Json} style 需要设置的样式表集合，例如{backgroundColor:'#666600',fontSize:'13px'}
	*/
	SFGanttField.prototype.setBodyStyle=function(obj){SFGlobal.setProperty(this.bodyStyle,obj);}
	/**
	设置列的编辑模式绘制方法
	@private
	@param {Function} handle编辑模式绘制方法的函数
	*/
	SFGanttField.prototype.setInputHandle=function(handle){this.inputFunc=handle;}
	/**
	以CSS方式直接设置列的表格标记模式样式表
	@param {Json} style 需要设置的样式表集合，例如{backgroundColor:'#666600',fontSize:'13px'}
	*/
	SFGanttField.prototype.setInputStyle=function(obj){SFGlobal.setProperty(this.inputStyle,obj);}
	/**
	设置列是否只读，如果设置为只读,则在点击一列的时候该列不会进入编辑状态，如果设置为false(默认为false)，必须指定编辑状态的绘制句柄
	@param {Bool} ReadOnly
	*/
	SFGanttField.prototype.setReadOnly=function(ReadOnly){this.ReadOnly=ReadOnly;}
	/**
	显示表格头
	@private
	@param {HtmlElement} cell 用来显示表格头的容器
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttField.prototype.showHead=function(cell,list)
	{
		SFEvent.deposeNode(cell,true);
		SFGlobal.setProperty(cell.style,this.headStyle);
		return this.headFunc(cell,list);
	}
	/**
	显示表格内容
	@private
	@param {HtmlElement} cell 用来显示表格内容的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttField.prototype.showBody=function(cell,element,list)
	{
		SFEvent.deposeNode(cell,true);
		SFGlobal.setProperty(cell.style,this.bodyStyle);
		return this.bodyFunc(cell,element,list);
	}
	/**
	显示编辑界面
	@private
	@param {HtmlElement} cell 用来显示编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttField.prototype.showInput=function(cell,element,list)
	{
		SFEvent.deposeNode(cell,true);
		SFGlobal.setProperty(cell.style,this.bodyStyle);
		SFGlobal.setProperty(cell.style,this.inputStyle);
		return this.inputFunc(cell,element,list);
	}
	/**
	在元素被更新时，检查所当前列是否需要重绘
	@private
	@param {Json} changedFields 元素的更新字段列表
	returns {Bool} 如果需要重绘，返回true
	*/
	SFGanttField.prototype.checkUpdate=function(changedFields)
	{
		if(!this.bodyData){return false;}
		var datas=this.bodyData.split(",");
		for(var j=0;j<datas.length;j++)
		{
			for(var k=0;k<changedFields.length;k++)
			{
				if(changedFields[k]==datas[j])
				{
					return true;
				}
			}
		}
		return false;
	}
	/**
	默认的表格头绘制方法，将列的headText内容直接显示在表格头之中，支持HTML语法
	@private
	@param {HtmlElement} cell 用来显示表格头的容器
	*/
	SFGanttField.prototype.headFunc=function(cell)
	{
		cell.innerHTML=this.headText;
	}
	/**
	默认的表格内容绘制方法，将bodyData字段的内容直接显示在表格内容之中
	@private
	@param {HtmlElement} cell 用来显示表格内容的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttField.prototype.bodyFunc=function(cell,element,list)
	{
		var value=element[this.bodyData];
		value=(typeof(value)!="undefined")?value:"";
		cell.appendChild(cell.ownerDocument.createTextNode(value));
	}
	/**
	创建编辑的默认输入框
	@private
	@param {HtmlElement} div 用来显示输入框的容器
	@returns {HtmlElement} 创建完成的输入框HTML元素
	*/
	SFGanttField.prototype.createInput=function(div)
	{
		var input=div.ownerDocument.createElement("input");
		SFGlobal.setProperty(input.style,{width:"100%",height:"100%",border:'solid 2px #000000',overflow:'hidden'});
		SFEvent.addListener(input,"click",SFEvent.returnTrue);
		SFEvent.addListener(input,"mouseup",SFEvent.returnTrue);
		SFEvent.addListener(input,"mousedown",function(e)
		{
			SFEvent.removeListener(input.cml);
			input.cml=SFEvent.addListener(input,"contextmenu",SFEvent.returnTrue);
			SFEvent.returnTrue(e);
		});
		SFEvent.addListener(input,"selectstart",SFEvent.returnTrue);
		input.cml=SFEvent.addListener(input,"contextmenu",SFEvent.cancelBubble);
		return input;
	}
	/**
	默认的表格编辑模式绘制方法，以单行文本框方式输入
	@private
	@param {HtmlElement} cell 用来显示编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttField.prototype.inputFunc=function(cell,element,list)
	{
		var inputData=this.inputData,field=this;
		var value=element[this.inputData];
		var input=this.createInput(cell,field,list);
		input.value=(typeof(value)!="undefined")?value:"";
		SFEvent.addListener(input,"keydown",function(e)
		{
			if(e.keyCode==27)
			{
				var value=element[inputData];
				input.value=(typeof(value)!="undefined")?value:"";
			}
			if(e.keyCode==13)
			{
				element.setProperty(inputData,input.value);
				SFEvent.deposeNode(cell,true);
				field.showBody(cell,element,list);
			}
		});
		SFEvent.addListener(input,"change",function()
		{
			element.setProperty(inputData,input.value);
		});
		cell.appendChild(input);
		input.focus();
	}

	/**
	用来对Bool值进行显示和编辑的列定义
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"关键"
	@param {String} [obj.bodyData] 该列对应的属性字段名称，例如"Critical"
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldBool()
	{
		if(arguments.length<=0){return}
		SFGanttField.apply(this,arguments);
		this.inputData=this.bodyData;
	}
	SFGanttFieldBool.prototype=new SFGanttField();
	/**
	将Bool值显示为"是\否"的绘制方法
	@private
	@param {HtmlElement} cell 用来显示表格内容的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldBool.prototype.bodyFunc=function(cell,element,list)
	{
		if(!this.ReadOnly)
		{
			this.inputFunc(cell,element,list);
			return;
		}
		var value=element[this.bodyData];
		var boolTypes=list.gantt.config.getConfig("SFGanttField/boolTypes")
		cell.appendChild(cell.ownerDocument.createTextNode(value?boolTypes[1]:boolTypes[0]));
	}
	/**
	将Bool值使用复选框来编辑的绘制方法
	@private
	@param {HtmlElement} cell 用来显示编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldBool.prototype.inputFunc=function(cell,element,list)
	{
		var inputData=this.inputData,field=this;
		var value=element[this.bodyData];
		var input=cell.ownerDocument.createElement("input");
		input.type="checkbox";
		cell.appendChild(input);
		input.checked=!!value;
		SFEvent.addListener(input,"click",function(e)
		{
			var btn=SFEvent.getEventButton(e);
			if(btn && btn!=1){return;}
			element.setProperty(inputData,input.checked);
			SFEvent.returnTrue(e);
		});
	}

	/**
	用来对百分比数字进行显示和编辑的列定义
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"完成百分比"
	@param {String} [obj.bodyData] 该列对应的属性字段名称，例如"PercentComplete"
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldPercent()
	{
		SFGanttField.apply(this,arguments);
		this.inputFunc=this.bodyFunc;
	}
	SFGanttFieldPercent.prototype=new SFGanttField();
	/**
	将Bool值显示为一个可拖动横条的绘制方法，此方法同时也是编辑界面绘制方法
	@private
	@param {HtmlElement} cell 用来显示表格内容的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldPercent.prototype.bodyFunc=function(cell,element,list)
	{
		var value=element[this.bodyData],doc=cell.ownerDocument;
		value=(typeof(value)!="undefined")?value:0;
		value=Math.max(0,Math.min(value,100));
		var div=doc.createElement("div");
		SFGlobal.setProperty(div.style,{position:'relative',width:'90%',height:'100%',backgroundColor:'#FFFFFF',border:'solid 1px #000000',textAlign:'center'});
		cell.appendChild(div);
		var span=doc.createElement("div");
		SFGlobal.setProperty(span.style,{position:'absolute',left:'0px',top:'0px',width:value+'%',height:'100%',backgroundColor:'#999999',zIndex:2});
		div.appendChild(span);
		if(!this.ReadOnly)
		{
			var bar=doc.createElement("div");
			SFGlobal.setProperty(bar.style,{position:'absolute',left:value+'%',top:'0px',width:'2px',height:'100%',backgroundColor:'blue',zIndex:3});
			SFGlobal.setCursor(bar,'col-resize');
			SFDragObject.setup(bar,SFEvent.getCallback(this,this.onBarMove(element,div)),{container:div});
			div.appendChild(bar);
		}
		var text=doc.createElement("span");
		SFGlobal.setProperty(text.style,{position:'relative',zIndex:4});
		text.appendChild(doc.createTextNode(value+"%"));
		div.appendChild(text);
	}
	/**
	生成在用户拖动百分比条时执行的函数的回调函数
	@private
	@param {SFDataElement} element 当前元素
	@param {HtmlElement} div 当前显示百分比条的层
	@returns {Function}
	*/
	SFGanttFieldPercent.prototype.onBarMove=function(element,div)
	{
		return function(sp,lp,type)
		{
			var width=Math.min(Math.max(lp[0],0),div.offsetWidth-2);
			var percent=Math.round(100*width/(div.offsetWidth-2));
			if(type!="end")
			{
				div.firstChild.style.width=width+"px";
				div.firstChild.nextSibling.style.left=width+"px";
				div.lastChild.nodeValue=percent+"%";
			}
			else
			{
				element.setProperty(this.bodyData,percent);
			}
		}
	}
	/**
	用来显示一个实体信息的列定义,列一定只读
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"完成百分比"
	@param {String} [obj.bodyData] 该列对应的属性字段名称，例如"PercentComplete"
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldElement()
	{
		SFGanttField.apply(this,arguments);
		this.ReadOnly=true;
	}
	SFGanttFieldElement.prototype=new SFGanttField();
	/**
	显示对应的元素信息的绘制方法
	@private
	@param {HtmlElement} cell 用来显示表格内容的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldElement.prototype.bodyFunc=function(cell,element,list)
	{
		var target=element[this.bodyData];
		if(!target){return;}
		var info="("+SFGanttField.getField(target.elementType,"UID").headText+" "+target.UID+") "+target.Name;
		cell.appendChild(cell.ownerDocument.createTextNode(info));
	}

	/**
	用来显示一个实体是否被选中的列定义，列的bodyData被强制为"Selected"，并且列的ReadOnly无效
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"完成百分比"
	@class
	@extends SFGanttFieldBool
	*/
	function SFGanttFieldSelected()
	{
		SFGanttFieldBool.apply(this,arguments);
		this.bodyData="Selected";
	}
	SFGanttFieldSelected.prototype=new SFGanttFieldBool();
	/**
	将可点击直接选中的复选框用来更改元素的选中状态
	@private
	@param {HtmlElement} cell 用来显示编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldSelected.prototype.inputFunc=function(cell,element,list)
	{
		var inputData=this.inputData,field=this;
		var value=element[this.bodyData];
		var input=cell.ownerDocument.createElement("input");
		input.type="checkbox";
		cell.appendChild(input);
		input.checked=!!value;
		SFEvent.addListener(input,"mouseup",SFEvent.returnTrue);
		SFEvent.addListener(input,"mousedown",SFEvent.returnTrue);
		SFEvent.addListener(input,"click",function(e)
		{
			SFEvent.returnTrue(e);
			element.setProperty("Selected",input.checked);
		});
	}

	/**
	用来对比较长的文本进行显示和编辑的列定义
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"完成百分比"
	@param {String} [obj.bodyData] 该列对应的属性字段名称，例如"PercentComplete"
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldLongText()
	{
		SFGanttField.apply(this,arguments);
		this.inputData=this.bodyData;
	}
	SFGanttFieldLongText.prototype=new SFGanttField();
	/**
	提供长段的文本显示和编辑的方法
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldLongText.prototype.inputFunc=function(cell,element,list)
	{
		var inputData=this.inputData,field=this;
		var value=element[inputData];
		var position=SFEvent.getPageOffset(cell,list.container);
		var input=cell.ownerDocument.createElement("textarea");
		SFGlobal.setProperty(input.style,{position:'absolute',left:position[0]+'px',top:position[1]+'px',width:(this.width-2)+"px",height:"100px",border:'solid 1px #000000',overflow:'hidden',zIndex:100});
		SFEvent.addListener(input,"click",SFEvent.returnTrue);
		SFEvent.addListener(input,"mouseup",SFEvent.returnTrue);
		SFEvent.addListener(input,"mousedown",function(e)
		{
			SFEvent.removeListener(input.cml);
			input.cml=SFEvent.addListener(input,"contextmenu",SFEvent.returnTrue);
			SFEvent.returnTrue(e);
		});
		SFEvent.addListener(input,"selectstart",SFEvent.returnTrue);
		input.cml=SFEvent.addListener(input,"contextmenu",SFEvent.cancelBubble);
		input.value=(typeof(value)!="undefined")?value:"";
		if(!this.ReadOnly)
		{//如果不为只读，则加入事件支持
			SFEvent.addListener(input,"keydown",function(e)
			{
				if(e.keyCode==27)
				{
					var value=element[inputData];
					input.value=(typeof(value)!="undefined")?value:"";
				}
			});
			SFEvent.addListener(input,"change",function()
			{
				element.setProperty(inputData,input.value);
			});
		}
		else
		{
			input.disabled=true;
		}
		SFEvent.addListener(input,"blur",function()
		{
			SFEvent.deposeNode(input);
		});
		list.container.appendChild(input);
		input.focus();
	}
	/**
	用来对日期时间格式进行显示和编辑的列定义，需要说明的是，这个列定义并没有提供日期的可视化输入界面
	实际上甘特图自身并不提供日期的可视化输入功能，不过可以加载其他JS类型的可视化日期界面，详细使用方法可参照范例
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"起始时间"
	@param {String} [obj.bodyData] 该列对应的属性字段名称，例如"Start"
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldDateTime()
	{
		SFGanttField.apply(this,arguments);
		this.inputData=this.bodyData;
	}
	SFGanttFieldDateTime.prototype=new SFGanttField();
	/**
	提供日期显示的方法，将日期显示为在 {@link SFConfig.SFGanttField/dateShowFormat}配置项之中指定的格式
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldDateTime.prototype.bodyFunc=function (cell,element,list)
	{
		var v=element[this.bodyData];
		var str=(v&&v>0)?SFGlobal.getDateString(element[this.bodyData],list.gantt.config.getConfig("SFGanttField/dateShowFormat")):"";
		cell.appendChild(cell.ownerDocument.createTextNode(str));
	}
	/**
	提供日期时间编辑的方法，仅仅提输入检查，不提供可视化输入日期的方式
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldDateTime.prototype.inputFunc=function(cell,element,list)
	{
		if(this.disableSummaryEdit && element.Summary)
		{
			SFEvent.deposeNode(cell,true);
			this.showBody(cell,element,list);
			return;
		}
		var inputData=this.inputData,field=this;
		var value=element[field.inputData];
		value=(typeof(value)!="undefined")?value:new Date();
		var input=SFGanttField.createInput(cell,field,list);
		var config=list.gantt.config.getConfig("SFGanttField");
		input.value=SFGlobal.getDateString(value,config.dateInputFormat);
		SFEvent.addListener(input,"keydown",function(e)
		{
			if(e.keyCode==27)
			{
				var value=element[field.inputData];
				input.value=SFGlobal.getDateString(value,config.dateInputFormat);
			}
			if(e.keyCode==13)
			{
				if(input.value)
				{
					var value=SFGlobal.getDate(input.value);
					if(value && !isNaN(value))
					{
						element.setProperty(inputData,value);
						SFEvent.deposeNode(cell,true);
						field.showBody(cell,element,list);
					}
					else
					{
						if(config.noticeWrongFormat){alert(config.noticeWrongFormat);}
						input.focus();
					}
				}
				else
				{
					element.setProperty(inputData,null);
				}
			}
		});
		SFEvent.addListener(input,"change",function()
		{
			if(input.value)
			{
				var value=SFGlobal.getDate(input.value);
				if(value && !isNaN(value))
				{
					element.setProperty(inputData,value);
				}
				else
				{
					if(config.noticeWrongFormat){alert(config.noticeWrongFormat);}
					input.focus();
				}
			}
			else
			{
				element.setProperty(inputData,null);
			}
		});
		
		cell.appendChild(input);
		input.focus();
	}
	/**
	用来显示两个日期字段之间工期的列定义，这个列被强制为只读，不允许编辑,
	该列会使用数据的工作日历来计算工期
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"工期"
	@param {String} [obj.bodyData] 该列对应的起始和结束属性字段名称，以逗号分隔，例如"Start,Finish"
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldDuration()
	{
		SFGanttField.apply(this,arguments);
		this.ReadOnly=true;
	}
	SFGanttFieldDuration.prototype=new SFGanttField();
	/**
	提供工期显示的方法
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldDuration.prototype.bodyFunc=function (cell,element,list)
	{
		var data=this.bodyData.split(","),start=element[data[0]],finish=element[data[1]],num=0;
		if(!start || !finish){return ;}
		cell.appendChild(cell.ownerDocument.createTextNode(SFGlobal.formatString(list.gantt.config.getConfig("SFGanttField/durationFormat"),element.getDuration(start,finish))));
	}
	/**
	用来使用一个自定义的转换表进行显示和选择的列的定义,例如可能需要定义将数据源之中的"Student"显示为"学生"，"Teacher"显示为"老师"，
	可以使用此列定义来实现，在编辑的时候，将会显示下拉选单改变此列的内容
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"类型"
	@param {String} [obj.bodyData] 该列对应的起始和结束属性字段名称，以逗号分隔，例如"Start,Finish"
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@param {Json} obj.options 定义转换表，例如{Student:'学生',Teacher:'老师'}
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldSelecter()
	{
		SFGanttField.apply(this,arguments);
		this.inputData=this.bodyData;
	}
	SFGanttFieldSelecter.prototype=new SFGanttField();
	/**
	获得转换表数组，目前没有支持根据元素不同而改变转换表的功能
	@private
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	@returns {Array}
	*/
	SFGanttFieldSelecter.prototype._getOptions=function(element,list)
	{
		var options=this.getOptions(element,list);
		if(options)
		{
			if(!options.length)
			{
				var item,opts=options;
				options=[];
				for(item in opts)
				{
					if(typeof(opts[item])=="string")
					{
						options.push([item,opts[item]]);
					}
				}
			}
		}
		return options;
	}
	/**
	返回转换表配置
	@private
	@returns {Json}
	*/
	SFGanttFieldSelecter.prototype.getOptions=function()
	{
		return this.options;
	}
	/**
	提供根据转换表映射显示内容的方法
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldSelecter.prototype.bodyFunc=function(cell,element,list)
	{
		var inputData=this.inputData,field=this,options=this._getOptions(element,list),doc=cell.ownerDocument;
		var value=element[inputData];
		for(var i=0;i<options.length;i++)
		{
			if(typeof(options[i])=="object" && options[i].length>1 && options[i][0]==value)
			{
				cell.appendChild(doc.createTextNode(options[i][1]));
				return;
			}
			if(typeof(options[i])!="object" && i==value)
			{
				cell.appendChild(doc.createTextNode(options[i]));
				return;
			}
		}
		cell.appendChild(doc.createTextNode((typeof(value)!="undefined")?value:""));
	}
	/**
	提供根据转换表映射显示下拉选单进行编辑的方法
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldSelecter.prototype.inputFunc=function(cell,element,list)
	{
		var inputData=this.inputData,field=this,options=this._getOptions(element,list);
		var value=element[inputData];
		var input=cell.ownerDocument.createElement("select");
		SFEvent.addListener(input,"click",SFEvent.returnTrue);
		SFEvent.addListener(input,"mouseup",SFEvent.returnTrue);
		SFEvent.addListener(input,"mousedown",function(e)
		{
			SFEvent.removeListener(input.cml);
			input.cml=SFEvent.addListener(input,"contextmenu",SFEvent.returnTrue);
			SFEvent.returnTrue(e);
		});
		SFEvent.addListener(input,"selectstart",SFEvent.returnTrue);
		input.cml=SFEvent.addListener(input,"contextmenu",SFEvent.cancelBubble);
		for(var i=0;i<options.length;i++)
		{
			var oi=options[i];
			if(typeof(oi)!="object"){oi=[i,oi];}
			input.options.add(new Option(oi[1],oi[0]));
		}
		input.value=(typeof(value)!="undefined")?value:"";
		SFEvent.addListener(input,"change",function()
		{
			element.setProperty(inputData,input.value);
		});
		cell.appendChild(input);
		input.focus();
	}
	/**
	用来显示树形层次结构名称的列定义,此列将元素的名称根据元素的大纲以树形的结构显示，
	该列可以编辑，编辑的内容为元素的名称字段内容
	该列的bodyData和inputData都被强制指定，不允许配置
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"名称"
	@param {Bool} [obj.ReadOnly=false] 该列是否只读
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldTreeName()
	{
		SFGanttField.apply(this,arguments);
		this.bodyData="Name,Summary,Collapse";
		this.inputData="Name";
	}
	SFGanttFieldTreeName.prototype=new SFGanttField();
	/**
	将名称按照大纲显示为树形结构的方法
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldTreeName.prototype.bodyFunc=function (cell,element,list)
	{
		var doc=cell.ownerDocument;
		if(list)
		{
			for(var p=element;p;p=p.getParent())
			{
				if(p==element && element.Summary){continue;}
				cell.appendChild(doc.createTextNode("　"));
			}
		}
		if(element.Summary && list && !(list.gantt.hideSummary && list.gantt.inline))//如果是大纲，则允许折叠
		{
			var img=this.getCollapseImg(list.gantt,element.Collapse);
			cell.appendChild(img);
			SFEvent.addListener(img,"click",function(e){SFEvent.returnTrue(e);element.setProperty("Collapse",!element.Collapse);});
		}
		cell.appendChild(doc.createTextNode((element.Name?element.Name:'')));
	}
	/**
	创建一个折叠按钮图片并返回
	@private
	@param {SFGantt} gantt 甘特图对象
	@param {Bool} collapse 如果是关闭按钮，则为true,否则为false
	@returns {HtmlElement} 返回HTML的IMG元素
	*/
	SFGanttFieldTreeName.prototype.getCollapseImg=function(gantt,collapse)
	{
		var img=gantt.createImage("collapse_"+(collapse?"close":"open"));
		SFGlobal.setProperty(img.style,{margin:'1px',cursor:'pointer'});
		return img;
	}
	/**
	用来显示一个Icon列表的列定义,此列根据元素的属性在表格之中显示一系列状态图标，
	该列不可以编辑
	该列的bodyData和inputData都根据图标指定，不允许直接配置
	@param {Json} obj 列的定义信息
	@param {Number} [obj.width=100] 列的显示宽度，默认为100像素
	@param {String} [obj.headText=''] 列的表头内容，例如"状态"
	@class
	@extends SFGanttField
	*/
	function SFGanttFieldIcon()
	{
		SFGanttField.apply(this,arguments);
		this.ReadOnly=true;
		this.bodyDatas=[];
		this.icons=[];
	}
	SFGanttFieldIcon.prototype=new SFGanttField();
	/**
	表格头绘制方法，此列在表格头之中也会显示一个图标
	@private
	@param {HtmlElement} cell 用来显示表格头的容器
	*/
	SFGanttFieldIcon.prototype.headFunc=function(cell,list)
	{
		var img=list.gantt.createImage("icon_taskstatus");
		SFGlobal.setProperty(img.style,{position:"relative"});
		cell.appendChild(img);
	}
	/**
	将在表格之中显示状态图标的方法
	@private
	@param {HtmlElement} cell 用来显示内容或编辑界面的容器
	@param {SFDataElement} element 当前行对应的数据元素
	@param {SFGanttControl} list 当前调用显示的控件对象
	*/
	SFGanttFieldIcon.prototype.bodyFunc=function(cell,element,list)
	{
		cell.vAlign="middle";
		var img;
		for(var i=0;i<this.icons.length;i++)
		{
			if(img=this.icons[i].showHandle.apply(this,[element,list.gantt]))
			{
				cell.appendChild(img);
			}
		}
	}
	/**
	创建一个HTML图标对象
	@private
	@param {SFGantt} gantt 甘特图对象
	@param {String} name 图片名称
	@returns {HtmlElement} 返回HTML IMG对象
	*/
	SFGanttFieldIcon.prototype.createImage=function(gantt,name)
	{
		var img=gantt.createImage(name);
		SFGlobal.setProperty(img.style,{position:"relative"});
		return img;
	}
	/**
	新添加一种图标定义
	@param {Function} showHandle 定义如何显示图标的函数
	@param {String} data 定义在元素的哪些字段变化之后需要重新绘制图标
	*/
	SFGanttFieldIcon.prototype.addIcon=function(showHandle,data)
	{
		if(data)
		{
			var datas=data.split(",");
			for(var i=datas.length-1;i>=0;i--){if(!SFGlobal.findInArray(this.bodyDatas,datas[i])){this.bodyDatas.push(datas[i]);}}
			this.bodyData=this.bodyDatas.join(",");
		}
		this.icons.push({showHandle:showHandle});
	}
	/**
	初始化系统预先定义的列
	@private
	*/
	SFGanttField.init=function()
	{
		if(SFGanttField.inited){return;}
		SFGanttField.inited=true;
		//下面的这些函数是为了和以前的机制兼容
		SFGanttField.NormalHead=SFGanttField.prototype.headFunc;
		SFGanttField.NormalBody=SFGanttField.prototype.bodyFunc;
		SFGanttField.BoolBody=SFGanttFieldBool.prototype.bodyFunc
		SFGanttField.BoolInput=SFGanttFieldBool.prototype.inputFunc
		SFGanttField.BoolCheckbox=SFGanttFieldBool.prototype.inputFunc
		SFGanttField.createInput=SFGanttField.prototype.createInput
		SFGanttField.NormalInput=SFGanttField.prototype.inputFunc;
		SFGanttField.DateBody=SFGanttFieldDateTime.prototype.bodyFunc;
		SFGanttField.DateInput=SFGanttFieldDateTime.prototype.inputFunc;
		var config=window._SFGantt_config.SFGanttField;
		var names=config.fieldTexts;
		/**
		@name SFGanttField.taskFields
		@namespace 所有系统预定义的任务列，可使用  {@link SFGanttField.getTaskField}方法来获得这些列
		*/
		/**
		空的任务列，不显示任何内容，
		默认宽度 36,只读
		@name SFGanttField.taskFields.Empty
		@type SFGanttField
		*/
		SFGanttField.setTaskField("Empty",		new SFGanttField({width:36,ReadOnly:true}));
		/**
		显示 {@link SFDataTask#UID}的列，
		默认宽度 36,只读
		@name SFGanttField.taskFields.UID
		@type SFGanttField
		*/
		SFGanttField.setTaskField("UID",		new SFGanttField({width:36,bodyData:'UID',headText:names.UID,ReadOnly:true,bodyStyle:{textAlign:'center'}}));
		/**
		显示 {@link SFDataTask#ID}的列，
		默认宽度 36,只读
		@name SFGanttField.taskFields.ID
		@type SFGanttField
		*/
		SFGanttField.setTaskField("ID",			new SFGanttField({width:36,bodyData:'ID',headText:names.ID,ReadOnly:true,bodyStyle:{textAlign:'center'}}))
		/**
		只显示和编辑名称 {@link SFDataTask#Name}的列，和下面的Name列大小写不同，也显示不同的内容，
		默认宽度 120
		@name SFGanttField.taskFields.name
		@type SFGanttField
		*/
		SFGanttField.setTaskField("name",		new SFGanttField({width:120,bodyData:'Name',headText:names.TaskName}));
		/**
		用任务的大纲将 {@link SFDataTask#Name}显示为树形的列，请注意大小写，
		默认宽度 120
		@name SFGanttField.taskFields.Name
		@type SFGanttFieldTreeName
		*/
		SFGanttField.setTaskField("Name",		new SFGanttFieldTreeName({width:120,headText:names.TaskName}));
		/**
		显示大纲数字( {@link SFDataTask#OutlineNumber})的列，
		默认宽度 100，只读
		@name SFGanttField.taskFields.OutlineNumber
		@type SFGanttField
		*/
		SFGanttField.setTaskField("OutlineNumber",	new SFGanttField({width:100,bodyData:'OutlineNumber',headText:names.OutlineNumber,ReadOnly:true}));
		/**
		显示任务状态图标的列，可以使用该列的 {@link SFGanttFieldIcon#addIcon}方法来自定义图标，
		默认宽度 100，只读
		系统之中默认支持了以下图标
		<ul>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_finished.gif"/> 当任务已完成时( {@link SFDataTask#PercentComplete}属性为100)显示</li>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_constraint2.gif"/> 当任务有限制类型( {@link SFDataTask#ConstraintType}为2,3,5,7)时显示</li>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_constraint4.gif"/> 当任务有限制类型( {@link SFDataTask#ConstraintType}为4,6)时显示</li>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_notes.gif"/> 当任务有备注信息( {@link SFDataTask#Notes})时显示</li>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_hyperlink.gif"/> 当任务有链接地址( {@link SFDataTask#HyperlinkAddress})时显示</li>
		</ul>
		@name SFGanttField.taskFields.StatusIcon
		@type SFGanttFieldIcon
		*/
		var field=new SFGanttFieldIcon({width:32,headText:names.StatusIcon});
		field.addIcon(function(element,gantt)
			{
				if(!element.PercentComplete || element.PercentComplete<100){return;}
				var img=this.createImage(gantt,"icon_finished");
				if(gantt.setTooltip)
				{
					gantt.setTooltip(img,function(tooltip)
					{
						if(tooltip.bindObject==img){return false;}
						tooltip.bindObject=img;
						tooltip.setContent(gantt.container.ownerDocument.createTextNode(SFGlobal.formatString(config.tooltipPercentComplete,SFGlobal.getDateString(element.Finish,config.dateShowFormat))))
						return true;
					});
				}
				return img;
			},"PercentComplete");
		field.addIcon(function(element,gantt)
			{
				if(!element.ConstraintType || element.ConstraintType<=1){return;}
				var img=this.createImage(gantt,"icon_constraint"+element.ConstraintType);
				if(gantt.setTooltip)
				{
					gantt.setTooltip(img,function(tooltip)
					{
						if(tooltip.bindObject==img){return false;}
						tooltip.bindObject=img;
						var str=SFGlobal.formatString(config.tooltipConstraint,[config.constraintTypes[element.ConstraintType],SFGlobal.getDateString(element.ConstraintDate,config.dateShowFormat)])
						tooltip.setContent(gantt.container.ownerDocument.createTextNode(str));
						return true
					});
				}
				return img;
			},"ConstraintType,ConstraintDate");
		field.addIcon(function(element,gantt)
			{
				if(!element.Notes){return;}
				var img=this.createImage(gantt,"icon_notes")
				if(gantt.setTooltip)
				{
					gantt.setTooltip(img,function(tooltip)
					{
						if(tooltip.bindObject==img){return false;}
						tooltip.bindObject=img;
						var str=SFGanttField.getField(element.elementType,"Notes").headText+": \""+element.Notes+"\"";
						tooltip.setContent(gantt.container.ownerDocument.createTextNode(str));
						return true;
					});
				}
				return img;
			},"Notes");
		field.addIcon(function(element,gantt)
			{
				if(!element.HyperlinkAddress){return;}
				var link=gantt.container.ownerDocument.createElement("a");
				link.href=element.HyperlinkAddress;
				link.target="_blank";
				var img=this.createImage(gantt,"icon_hyperlink");
				link.appendChild(img)
				if(gantt.setTooltip)
				{
					gantt.setTooltip(img,function(tooltip)
					{
						if(tooltip.bindObject==img){return false;}
						tooltip.bindObject=img;
						var str=element.Hyperlink?element.Hyperlink:element.HyperlinkAddress;
						tooltip.setContent(gantt.container.ownerDocument.createTextNode(str));
						return true;
					});
				}
				return link;
			},"HyperlinkAddress,Hyperlink");
		SFGanttField.setTaskField("StatusIcon",		field);
		/**
		显示任务工期的列，根据 {@link SFDataTask#Start}和 {@link SFDataTask#Finish}的时间间隔根据工作日历定义显示工期的天数
		默认宽度 60
		@name SFGanttField.taskFields.Duration
		@type SFGanttFieldDuration
		*/
		SFGanttField.setTaskField("Duration",		new SFGanttFieldDuration({width:60,bodyData:'Start,Finish',headText:names.Duration}));
		/**
		显示和编辑任务的开始时间 {@link SFDataTask#Start}
		默认宽度 100
		@name SFGanttField.taskFields.Start
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("Start",		new SFGanttFieldDateTime({width:100,bodyData:'Start',headText:names.Start,disableSummaryEdit:true}));
		/**
		显示和编辑任务的结束时间 {@link SFDataTask#Finish}
		默认宽度 100
		@name SFGanttField.taskFields.Finish
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("Finish",		new SFGanttFieldDateTime({width:100,bodyData:'Finish',headText:names.Finish,disableSummaryEdit:true}));
		/**
		显示和编辑任务的备注信息 {@link SFDataTask#Notes}
		默认宽度 100
		@name SFGanttField.taskFields.Notes
		@type SFGanttFieldLongText
		*/
		SFGanttField.setTaskField("Notes",		new SFGanttFieldLongText({width:100,bodyData:'Notes',headText:names.Notes}));
		/**
		显示和更改任务的样式 {@link SFDataTask#ClassName}
		默认宽度 120
		@name SFGanttField.taskFields.ClassName
		@type SFGanttFieldSelecter
		*/
		SFGanttField.setTaskField("ClassName",		new SFGanttFieldSelecter({width:120,bodyData:'ClassName',headText:names.ClassName}));
		SFGanttField.getTaskField("ClassName").getOptions=true?(function(element,list)
		{
			return {TaskNormal:'TaskNormal',TaskImportant:'TaskImportant',TaskUnimportant:'TaskUnimportant'};
		}):null;
		/**
		显示和更改任务的限制类型 {@link SFDataTask#ConstraintType}
		默认宽度 120
		@name SFGanttField.taskFields.ConstraintType
		@type SFGanttFieldSelecter
		*/
		SFGanttField.setTaskField("ConstraintType",	new SFGanttFieldSelecter({width:120,bodyData:'ConstraintType',headText:names.ConstraintType,options:window._SFGantt_config.SFGanttField.constraintTypes}));
		/**
		显示和更改任务的限制时间 {@link SFDataTask#ConstraintDate}
		默认宽度 100
		@name SFGanttField.taskFields.ConstraintDate
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("ConstraintDate",	new SFGanttFieldDateTime({width:100,bodyData:'ConstraintDate',headText:names.ConstraintDate}));
		/**
		显示和更改任务是否是关键任务 {@link SFDataTask#Critical}
		默认宽度 30
		@name SFGanttField.taskFields.Critical
		@type SFGanttFieldBool
		*/
		SFGanttField.setTaskField("Critical",		new SFGanttFieldBool({width:30,bodyData:'Critical',headText:names.Critical}));
		/**
		显示任务是否被选中，也可以点击选中该任务
		默认宽度 30
		@name SFGanttField.taskFields.Selected
		@type SFGanttFieldSelected
		*/
		SFGanttField.setTaskField("Selected",		new SFGanttFieldSelected({width:30,headText:names.Selected}));
		/**
		显示任务的前置任务，该列只读
		默认宽度 100
		@name SFGanttField.taskFields.PredecessorTask
		@type SFGanttField
		*/
		SFGanttField.setTaskField("PredecessorTask",		new SFGanttField({width:100,headText:names.PredecessorTask,bodyFunc:function(cell,task,list)
			{
				var ans=[],tasks=task.getPredecessorTasks();
				for(var i=0;i<tasks.length;i++)
				{
					ans.push(tasks[i].Name);
				}
				cell.appendChild(cell.ownerDocument.createTextNode(ans.join(",")));
			},ReadOnly:true}));
		/**
		显示任务的后置任务，该列只读
		默认宽度 100
		@name SFGanttField.taskFields.SuccessorTask
		@type SFGanttField
		*/
		SFGanttField.setTaskField("SuccessorTask",		new SFGanttField({width:100,headText:names.SuccessorTask,bodyFunc:function(cell,task,list)
			{
				var ans=[],tasks=task.getSuccessorTasks();
				for(var i=0;i<tasks.length;i++)
				{
					ans.push(tasks[i].Name);
				}
				cell.appendChild(cell.ownerDocument.createTextNode(ans.join(",")));
			},ReadOnly:true}));
		/**
		显示任务的资源，该列只读
		默认宽度 100
		@name SFGanttField.taskFields.Resource
		@type SFGanttField
		*/
		SFGanttField.setTaskField("Resource",		new SFGanttField({width:100,bodyData:'Resource',headText:names.Resource,bodyFunc:function(cell,task,list)
			{
				var ans=[],assignments=task.getAssignments();
				for(var i=0;i<assignments.length;i++)
				{
					var resource=assignments[i].getResource();
					if(resource)
					{
						var name=resource.Name;
						if(assignments[i].Units!=1)
						{
							name+='['+(assignments[i].Units*100)+'%]';
						}
						ans.push(name);
					}
				}
				cell.appendChild(cell.ownerDocument.createTextNode(ans.join(",")));
			},ReadOnly:true}));
		/**
		显示和更改任务的完成百分比 {@link SFDataTask#PercentComplete}
		默认宽度 100
		@name SFGanttField.taskFields.PercentComplete
		@type SFGanttFieldPercent
		*/
		SFGanttField.setTaskField("PercentComplete",	new SFGanttFieldPercent({width:100,bodyData:'PercentComplete',headText:names.PercentComplete}));
		/**
		显示和更改任务的实际开始时间 {@link SFDataTask#ActualStart}
		默认宽度 100
		@name SFGanttField.taskFields.ActualStart
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("ActualStart",	new SFGanttFieldDateTime({width:100,bodyData:'ActualStart',headText:names.ActualStart,disableSummaryEdit:true}));
		/**
		显示和更改任务的实际结束时间 {@link SFDataTask#ActualFinish}
		默认宽度 100
		@name SFGanttField.taskFields.ActualFinish
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("ActualFinish",	new SFGanttFieldDateTime({width:100,bodyData:'ActualFinish',headText:names.ActualFinish,disableSummaryEdit:true}));
		/**
		显示任务的实际工期 {@link SFDataTask#ActualDuration}
		默认宽度 60 只读
		@name SFGanttField.taskFields.ActualDuration
		@type SFGanttFieldDuration
		*/
		SFGanttField.setTaskField("ActualDuration",	new SFGanttFieldDuration({width:60,bodyData:'ActualStart,ActualFinish',headText:names.ActualDuration}));
		/**
		显示任务的基准开始时间 {@link SFDataTask#BaselineStart}
		默认宽度 100
		@name SFGanttField.taskFields.BaselineStart
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("BaselineStart",	new SFGanttFieldDateTime({width:100,bodyData:'BaselineStart',headText:names.BaselineStart,disableSummaryEdit:true}));
		/**
		显示任务的基准结束时间 {@link SFDataTask#BaselineFinish}
		默认宽度 100
		@name SFGanttField.taskFields.BaselineFinish
		@type SFGanttFieldDateTime
		*/
		SFGanttField.setTaskField("BaselineFinish",	new SFGanttFieldDateTime({width:100,bodyData:'BaselineFinish',headText:names.BaselineFinish,disableSummaryEdit:true}));


		/**
		@name SFGanttField.resourceFields
		@namespace 所有系统预定义的资源列，可使用  {@link SFGanttField.getResourceField}方法来获得这些列
		*/
		/**
		空的资源列，不显示任何内容，
		默认宽度 36,只读
		@name SFGanttField.resourceFields.Empty
		@type SFGanttField
		*/
		SFGanttField.setResourceField("Empty",		new SFGanttField({width:36,ReadOnly:true}));
		/**
		显示 {@link SFDataResource#UID}的列，
		默认宽度 36,只读
		@name SFGanttField.resourceFields.UID
		@type SFGanttField
		*/
		SFGanttField.setResourceField("UID",		new SFGanttField({width:36,bodyData:'UID',headText:names.UID,ReadOnly:true,bodyStyle:{textAlign:'center'}}));
		/**
		显示 {@link SFDataResource#ID}的列，
		默认宽度 36,只读
		@name SFGanttField.resourceFields.ID
		@type SFGanttField
		*/
		SFGanttField.setResourceField("ID",			new SFGanttField({width:36,bodyData:'ID',headText:names.ID,ReadOnly:true,bodyStyle:{textAlign:'center'}}))
		/**
		只显示和编辑名称 {@link SFDataResource#Name}的列，和下面的Name列大小写不同，也显示不同的内容，
		默认宽度 120
		@name SFGanttField.resourceFields.name
		@type SFGanttField
		*/
		SFGanttField.setResourceField("name",		new SFGanttField({width:120,bodyData:'Name',headText:names.ResourceName}));
		/**
		用资源的大纲将 {@link SFDataResource#Name}显示为树形的列，请注意大小写，
		默认宽度 120
		@name SFGanttField.resourceFields.Name
		@type SFGanttFieldTreeName
		*/
		SFGanttField.setResourceField("Name",		new SFGanttFieldTreeName({width:120,headText:names.ResourceName}));
		/**
		显示大纲数字( {@link SFDataResource#OutlineNumber})的列，
		默认宽度 100，只读
		@name SFGanttField.resourceFields.OutlineNumber
		@type SFGanttField
		*/
		SFGanttField.setResourceField("OutlineNumber",	new SFGanttField({width:100,bodyData:'OutlineNumber',headText:names.OutlineNumber,ReadOnly:true}));
		/**
		显示资源状态图标的列，可以使用该列的 {@link SFGanttFieldIcon#addIcon}方法来自定义图标，
		默认宽度 100，只读
		系统之中默认支持了以下图标
		<ul>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_notes.gif"/> 当资源有备注信息( {@link SFDataResource#Notes})时显示</li>
			<li><img src="http://www.51diaodu.cn/sfgantt/img/icon_hyperlink.gif"/> 当资源有链接地址( {@link SFDataResource#HyperlinkAddress})时显示</li>
		</ul>
		@name SFGanttField.resourceFields.StatusIcon
		@type SFGanttFieldIcon
		*/
		var field=new SFGanttFieldIcon({width:32,headText:names.StatusIcon});
		field.addIcon(function(element,gantt)
			{
				if(!element.Notes){return;}
				var img=this.createImage(gantt,"icon_notes");
				if(gantt.setTooltip)
				{
					gantt.setTooltip(img,function(tooltip)
					{
						if(tooltip.bindObject==img){return false;}
						tooltip.bindObject=img;
						var str=SFGanttField.getField(element.elementType,"Notes").headText+": \""+element.Notes+"\"";
						tooltip.setContent(gantt.container.ownerDocument.createTextNode(str));
						return true;
					});
				}
				return img;
			},"Notes");
		field.addIcon(function(element,gantt)
			{
				if(!element.HyperlinkAddress){return;}
				var link=gantt.container.ownerDocument.createElement("a");
				link.href=element.HyperlinkAddress;
				link.target="_blank";
				var img=this.createImage(gantt,"icon_hyperlink");
				link.appendChild(img)
				if(gantt.setTooltip)
				{
					gantt.setTooltip(img,function(tooltip)
					{
						if(tooltip.bindObject==img){return false;}
						tooltip.bindObject=img;
						var str=element.Hyperlink?element.Hyperlink:element.HyperlinkAddress;
						tooltip.setContent(gantt.container.ownerDocument.createTextNode(str));
						return true;
					});
				}
				return link;
			},"HyperlinkAddress,Hyperlink");
		SFGanttField.setResourceField("StatusIcon",		field);
		/**
		显示和编辑资源的备注信息 {@link SFDataResource#Notes}
		默认宽度 100
		@name SFGanttField.resourceFields.Notes
		@type SFGanttFieldLongText
		*/
		SFGanttField.setResourceField("Notes",		new SFGanttFieldLongText({width:100,bodyData:'Notes',headText:names.Notes}));
		/**
		显示和更改资源的样式 {@link SFDataResource#ClassName}
		默认宽度 120
		@name SFGanttField.resourceFields.ClassName
		@type SFGanttFieldSelecter
		*/
		SFGanttField.setResourceField("ClassName",		new SFGanttFieldSelecter({width:120,bodyData:'ClassName',headText:names.ClassName}));
		SFGanttField.getResourceField("ClassName").getOptions=true?(function(element,list)
		{
			return {ResourceNormal:'ResourceNormal',ResourceImportant:'ResourceImportant'};
		}):null;
		/**
		显示和更改资源是否是关键资源 {@link SFDataResource#Critical}
		默认宽度 30
		@name SFGanttField.resourceFields.Critical
		@type SFGanttFieldBool
		*/
		SFGanttField.setResourceField("Critical",		new SFGanttFieldBool({width:30,bodyData:'Critical',headText:names.Critical}));
		/**
		显示资源是否被选中，也可以点击选中该资源
		默认宽度 30
		@name SFGanttField.resourceFields.Selected
		@type SFGanttFieldSelected
		*/
		SFGanttField.setResourceField("Selected",		new SFGanttFieldSelected({width:30,headText:names.Selected}));
		/**
		显示资源的任务，该列只读
		默认宽度 100
		@name SFGanttField.resourceFields.Task
		@type SFGanttField
		*/
		SFGanttField.setResourceField("Task",		new SFGanttField({width:100,bodyData:'Resource',headText:names.Resource,bodyFunc:function(cell,resource,list)
			{
				var ans=[],assignments=resource.getAssignments();
				for(var i=0;i<assignments.length;i++)
				{
					var res=assignments[i].getResource();
					if(res)
					{
						var name=res.Name;
						if(assignments[i].Units!=1)
						{
							name+='['+(assignments[i].Units*100)+'%]';
						}
						ans.push(name);
					}
				}
				cell.appendChild(cell.ownerDocument.createTextNode(ans.join(",")));
			},ReadOnly:true}));



		/**
		@name SFGanttField.linkFields
		@namespace 所有系统预定义的链接列，可使用  {@link SFGanttField.getLinkField}方法来获得这些列
		*/
		SFGanttField.linkFields={};
		/**
		显示和更改链接的类型 {@link SFDataLink#Type}
		默认宽度 100
		@name SFGanttField.linkFields.Type
		@type SFGanttFieldSelecter
		*/
		SFGanttField.setLinkField("Type",		new SFGanttFieldSelecter({width:100,bodyData:'Type',headText:names.LinkType,options:window._SFGantt_config.SFGanttField.linkTypes}));
		/**
		显示链接的起始任务信息
		默认宽度 100，只读
		@name SFGanttField.linkFields.FromTask
		@type SFGanttFieldElement
		*/
		SFGanttField.setLinkField("FromTask",		new SFGanttFieldElement({width:100,bodyData:'PredecessorTask',headText:names.FromTask}));
		/**
		显示链接的目标任务信息
		默认宽度 100，只读
		@name SFGanttField.linkFields.ToTask
		@type SFGanttFieldElement
		*/
		SFGanttField.setLinkField("ToTask",		new SFGanttFieldElement({width:100,bodyData:'SuccessorTask',headText:names.ToTask}));
	}
	if(!window._obscure){SFGanttField.init();}
	window.SFGanttField=SFGanttField;
	window.SFGanttFieldBool=SFGanttFieldBool;
	window.SFGanttFieldPercent=SFGanttFieldPercent;
	window.SFGanttFieldElement=SFGanttFieldElement;
	window.SFGanttFieldSelected=SFGanttFieldSelected;
	window.SFGanttFieldLongText=SFGanttFieldLongText;
	window.SFGanttFieldDateTime=SFGanttFieldDateTime;
	window.SFGanttFieldDuration=SFGanttFieldDuration;
	window.SFGanttFieldSelecter=SFGanttFieldSelecter;
	window.SFGanttFieldTreeName=SFGanttFieldTreeName;
	window.SFGanttFieldIcon=SFGanttFieldIcon;