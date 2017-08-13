	/**
	这是一个甘特图功能控件，本控件用来实现甘特图上的右键菜单的功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttContextMenuControl()
	{
		this.contextMenuItems=[];
	}
	SFGanttContextMenuControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttContextMenuControl.prototype.initialize=function(gantt)
	{
		if(gantt.disableContextMenu){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFMenu"));
		this.gantt=gantt;
		var container=this.container=gantt.getContainer(),doc=gantt.container.ownerDocument;
		var table=this.div=doc.createElement("table");
		SFGlobal.setProperty(table,{cellSpacing:0,border:0,cellPadding:0});
		SFGlobal.setProperty(table.style,{position:'absolute',zIndex:700});
		SFGlobal.setProperty(table.style,this.tableStyle);
		SFGlobal.setProperty(gantt,{
			addContextMenuItem:SFEvent.getCallback(this,this.addItem),
			getContextMenuItemById:SFEvent.getCallback(this,this.getItemById),
			removeContextMenuItem:SFEvent.getCallback(this,this.removeItem),
			setContextMenu:SFEvent.getCallback(this,this.setContextMenu)
		});
		this.listeners=[
			SFEvent.addListener(container,"contextmenu",SFEvent.cancelBubble),
			SFEvent.bind(container,"mousedown",this,this.onMouseDown),
			SFEvent.bind(table,"mousemove",this,this.onItemMouseOver),
			SFEvent.bind(table,"mousedown",this,this.onItemClick),
			SFEvent.bind(doc,"mousedown",this,this.hidden)
		];
		return true;
	}
	/**
	设置甘特图上的右键触发点
	@private
	@name SFGantt.prototype.setContextMenu
	@function
	@param {HtmlElement} div 能触发右键的层
	@param {Function} handle 在右键点击时，用来配置右键菜单显示的句柄
	*/
	SFGanttContextMenuControl.prototype.setContextMenu=function(div,handle)
	{
		if(!div._SF_E_){div._SF_E_=[];}
		div._SF_E_.contextMenu=handle;
	}
	/**
	在鼠标在右键触发点上点击时执行的操作，判断是否是右键点击，如果是，则显示菜单
	@param {Event} e 右键按下事件
	*/
	SFGanttContextMenuControl.prototype.onMouseDown=function(e)
	{
		var btn=SFEvent.getEventButton(e);
		if(btn==4){SFEvent.returnTrue(e);}
		if(btn!=2){return;}
		this.event=e;
		var target=e.target;
		while(target)
		{
			if(target._SF_E_ && target._SF_E_ .contextMenu && target._SF_E_ .contextMenu(this,e))
			{
				SFEvent.cancelBubble(e);
				if(this.items){this.hidden();}
				var items=[],allItems=this.contextMenuItems;
				for(var i=0;i<allItems.length;i++)
				{
					var type=allItems[i].showHandle(this,e);
					if(type==1){items.push(allItems[i]);}
				}
				this.items=items;
				var position=SFEvent.getEventRelative(e,this.container);
				this.show(position);
				return;
			}
			target=target.parentNode;
		}
	}
	/**
	增加一个右键菜单项，可以指定菜单在何时显示、点击之后执行的动作、菜单显示文字和图标，用户在甘特图上点击右键的时候，系统会创建一个MenuEvent对象，该对象有如下属性：<br/>
	gantt ： 当前的甘特图对象，是一个<link>SFGantt</link><br/>
	type ： 右键点击的位置类型，有以下几种：column(点击在中间分隔条上),logo(点击在甘特图的logo上),map(点击在右侧图表上),list(点击在左侧列表上)<br/>
	@name SFGantt.prototype.addContextMenuItem
	@function
	@param {Function} showHandle 这个参数指定在甘特图右键点击的时候是否应该显示该菜单项，这个参数应该是一个JavaScript function，在甘特图上右键被点击的时候，将会调用该函数，该函数返回1代表显示该菜单项，返回数字0代表不显示该菜单项，该函数的参数是MenuEvent对象
	@param {Function} runHandle 这个参数指定一个JavaScript function，这个函数在用户点击该菜单项的时候执行，该函数的参数是MenuEvent对象
	@param {String} text 菜单项的显示文字
	@param {String} [icon] 菜单项的图标URL地址,不指定则不显示图标
	@param {String} [id] 菜单项的ID，设置ID后，可以通过ID来修改或删除此菜单项
	@param {Number} [index=500] 菜单项的排序索引，各个菜单项将会按照这个顺序从大到小排列
	@returns {SFMenuItem} 返回刚添加的菜单项
	*/
	SFGanttContextMenuControl.prototype.addItem=function(showHandle,runHandle,text,icon,id,index)
	{
		if(id)
		{
			for(var i=0;i<this.contextMenuItems.length;i++)
			{
				if(id==this.contextMenuItems[i].id==id){return false;}
			}
		}
		var menuItem=new SFMenuItem(showHandle,runHandle,text,icon,id,index);
		this.contextMenuItems.push(menuItem);
		return menuItem;
	}
	/**
	通过菜单项ID返回该菜单项,如果不存在,则返回null
	@name SFGantt.prototype.getContextMenuItemById
	@function
	@param {String} id 菜单项的ID
	@returns {SFMenuItem}
	*/
	SFGanttContextMenuControl.prototype.getItemById=function(id)
	{
		for(var i=0;i<this.contextMenuItems.length;i++)
		{
			if(id==this.contextMenuItems[i].id)
			{
				return this.contextMenuItems[i];
			}
		}
		return null;
	}
	/**
	通过id删除一个右键菜单项,并返回被删除的菜单项,系统集成的菜单项也可以被删除
	@name SFGantt.prototype.removeContextMenuItem
	@function
	@param {SFMenuItem|String} item 菜单项或菜单项的ID
	@returns {SFMenuItem} 返回刚删除的菜单项
	*/
	SFGanttContextMenuControl.prototype.removeItem=function(id)
	{
		if(typeof(id)=="object"){id=id.id;}
		if(id)
		{
			for(var i=0;i<this.contextMenuItems.length;i++)
			{
				if(this.contextMenuItems[i].id==id)
				{
					return this.contextMenuItems.splice(i,1);
				}
			}
		}
		return null;
	}
	/**
	显示右键菜单
	@private
	@param {Number[]} position 菜单项的显示位置
	*/
	SFGanttContextMenuControl.prototype.show=function(position)
	{
		var container=this.container,table=this.div;
		this.createItemContent();
		container.appendChild(table);
		var left=position[0]+1,top=position[1]+1;
		if(left+table.offsetWidth>container.offsetWidth){left=position[0]-table.offsetWidth-1;}
		if(top+table.offsetHeight>container.offsetHeight){top=position[1]-table.offsetHeight-1;}
		SFGlobal.setProperty(table.style,{left:left+"px",top:top+"px"});
	}
	/**
	隐藏右键菜单
	@private
	*/
	SFGanttContextMenuControl.prototype.hidden=function()
	{
		this.focusObj=null;
		var items=this.items;
		if(items)
		{
			for(var i=0;i<items.length;i++)
			{
				items[i].row=null;
			}
			this.items=null;
		}
		SFEvent.deposeNode(this.div,true);
		if(this.div.parentNode==this.container)
		{
			this.container.removeChild(this.div);
		}
	}
	/**
	创建右键菜单的显示内容
	@private
	*/
	SFGanttContextMenuControl.prototype.createItemContent=function()
	{
		this.items.sort(function(a,b){if(a.index==b.index){return 0;}return a.index>b.index?1:-1;});
		var doc=this.container.ownerDocument;
		for(var i=0;i<this.items.length;i++)
		{
			var item=this.items[i];
			var row=this.div.insertRow(-1);
			var cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{width:34,height:24,bgColor:'#F6F6F6',align:'center'});
			if(item.icon)
			{
				var img=this.gantt.createImage(item.icon,{size:[16,16]});
				cell.appendChild(img);
			}
			cell=row.insertCell(-1);
			SFGlobal.setProperty(cell,{noWrap:'true'});
			SFGlobal.setProperty(cell.style,{paddingLeft:'10px',paddingRight:'25px',fontSize:'13px',cursor:'default'});
			cell.innerHTML=item.text;
			item.row=row;
		}
	}
	/**
	获得当前鼠标在哪个菜单项上
	@param {Event} e 浏览器的鼠标事件
	@private
	@returns {SFMenuItem}
	*/
	SFGanttContextMenuControl.prototype.getFocusItem=function(e)
	{
		if(!this.items){return null;}
		var target=e.target,row,table=this.div;
		while(target)
		{
			if(target==table){break;}
			if(target.nodeName=="TR"){row=target}
			target=target.parentNode;
		}
		if(!row){return null;}
		for(var i=table.rows.length-1;i>=0;i--)
		{
			if(row==table.rows[i])
			{
				return this.items[i];
			}
		}
		return null;
	}
	/**
	在鼠标移动到菜单项目上方的时候执行的响应
	@param {Event} e 浏览器的鼠标事件
	@private
	*/
	SFGanttContextMenuControl.prototype.onItemMouseOver=function(e)
	{
		var item=this.getFocusItem(e);
		if(!item){return;}
		var focusObj=this.focusObj;
		if(focusObj)
		{
			focusObj.row.style.backgroundColor="";
			focusObj.row.cells[0].style.backgroundColor="#F6F6F6";
		}
		this.focusObj=item;
		item.row.style.backgroundColor="#C4E0F2";
		item.row.cells[0].style.backgroundColor="#C4E0F2";
	}
	/**
	在菜单项目被点击的时候执行的响应
	@param {Event} e 浏览器的鼠标事件
	@private
	*/
	SFGanttContextMenuControl.prototype.onItemClick=function(e)
	{
		var item=this.getFocusItem(e);
		if(!item){return;}
		SFEvent.cancelBubble(e);
		this.hidden();
		if(item.runHandle){item.runHandle(this);}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttContextMenuControl.prototype.remove=function()
	{
		this.hidden();
		var gantt=this.gantt;
		delete gantt.addContextMenuItem
		delete gantt.getContextMenuItemById
		delete gantt.removeContextMenuItem
		delete gantt.setContextMenu
		delete this.contextMenuItems
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	
	
	/**
	甘特图上的右键菜单项对象，每个右键菜单项代表一个右键功能
	@param {Function} showHandle 这个参数指定在甘特图右键点击的时候是否应该显示该菜单项，这个参数应该是一个JavaScript function，在甘特图上右键被点击的时候，将会调用该函数，该函数返回1代表显示该菜单项，返回数字0代表不显示该菜单项，该函数的参数是MenuEvent对象
	@param {Function} runHandle 在用户点击该右键菜单时执行的操作，该函数的参数与showHandle的参数相同
	@param {String} text 菜单项的显示文字
	@param {String} icon 菜单项的图标URL地址
	@param {String} id 菜单项的ID，设置ID后，可以通过ID来修改或删除此菜单项
	@param {Number} index 菜单项的排序索引，各个菜单项将会按照这个顺序从大到小排列
	@class
	*/
	function SFMenuItem(showHandle,runHandle,text,icon,id,index)
	{
		if(!id)
		{
			if(!SFMenuItem.idNum){SFMenuItem.idNum=0}
			id="MenuItem_"+(SFMenuItem.idNum++);
		}
		index=index?index:500;
		this.setIcon(icon);
		SFGlobal.setProperty(this,{showHandle:showHandle,runHandle:runHandle,text:text,id:id,index:index});
	}
	/**
	获得菜单的显示顺序，在显示菜单时，index越大的越显示在后面
	@returns {Number}
	*/
	SFMenuItem.prototype.getIndex=function()
	{
		return this.index;
	}
	/**
	设置菜单的显示顺序，在显示菜单时，index越大的越显示在后面
	@param {Number} index 一般在1-1000
	*/
	SFMenuItem.prototype.setIndex=function(index)
	{
		this.index=parseInt(index);
	}
	/**
	获取菜单项的显示文字
	@returns {String}
	*/
	SFMenuItem.prototype.getText=function()
	{
		return this.text;
	}
	/**
	设置菜单项的显示文字
	@param {String} text
	*/
	SFMenuItem.prototype.setText=function(text)
	{
		this.text=text;
	}
	/**
	设置菜单项的显示图标
	@param {String} icon 图标的URL路径,图标应该是16*16大小
	*/
	SFMenuItem.prototype.setIcon=function(icon)
	{
		this.icon=icon;
	}
	window.SFMenuItem=SFMenuItem;
	window.SFGanttContextMenuControl=SFGanttContextMenuControl;