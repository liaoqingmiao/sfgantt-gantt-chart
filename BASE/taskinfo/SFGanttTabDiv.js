	function SFGanttTabDiv(size,gantt)
	{
		var container=document.createElement("div");
		SFGlobal.setProperty(container.style,{width:size[0]+18+"px",height:size[1]+18+23+"px",backgroundColor:'#F4F4F4',padding:'6px'});
		var headTable=document.createElement("table");
		headTable.insertRow(-1);
		SFGlobal.setProperty(headTable,{height:23,border:0,cellSpacing:0,cellPadding:0});
		container.appendChild(headTable);
		this.tabs=[];
		SFGlobal.setProperty(this,{container:container,headTable:headTable,gantt:gantt});
		var bodyDiv=document.createElement("div");
		SFGlobal.setProperty(bodyDiv.style,{width:size[0]+6+"px",height:size[1]+6+"px",overflowY:'auto',borderLeft:'solid 1px #FFFFFF',borderRight:'solid 1px #000000',borderBottom:'solid 1px #000000'});
		container.appendChild(bodyDiv);
	}
	SFGanttTabDiv.prototype.addTab=function(name,div)
	{
		var row=this.headTable.rows[0];

		var cell=row.insertCell(-1);
		cell.width=2;
		var img=this.gantt.creatImage("tab_left");
		cell.appendChild(img);

		var cell=row.insertCell(-1);
		var tabInfo={name:name,div:div,cell:cell}
		SFGlobal.setProperty(cell,{width:81,innerHTML:name,align:'center'});
		this.gantt.setBackgroundImage("tab_bg");
		SFGlobal.setProperty(cell.style,{fontSize:'12px',cursor:'default'});
		SFEvent.bind(cell,"click",this,this.onTabClick(tabInfo));

		var cell=row.insertCell(-1);
		cell.width=2;
		var img=this.gantt.creatImage("tab_right");
		cell.appendChild(img);
		this.tabs.push(tabInfo);
	}
	SFGanttTabDiv.prototype.onTabClick=function(tabInfo)
	{
		return function()
		{
			this.setFocus(tabInfo);
		}
	}
	SFGanttTabDiv.prototype.setFocus=function(tabInfo)
	{
		SFEvent.trigger(this,"focuschange",[tabInfo]);
		for(var i=0;i<this.tabs.length;i++)
		{
			var tab=this.tabs[i];
			if(tab==tabInfo)
			{
				this.gantt.setBackgroundImage(tab.cell,'tab_f_bg');
				this.gantt.setImageSrc(tab.cell.nextSibling.firstChild,'tab_f_right');
				tab.div.style.display='';
				if(tab.div.parentNode!=this.container.lastChild)
				{
					this.container.lastChild.appendChild(tab.div);
				}
			}
			else
			{
				this.gantt.setBackgroundImage(tab.cell,'tab_bg');
				this.gantt.setImageSrc(tab.cell.nextSibling.firstChild,'tab_right');
				tab.div.style.display='none';
			}
		}
	}
	SFGanttTabDiv.prototype.setTab=function(num)
	{
		this.setFocus(this.tabs[num]);
	}
	SFGanttTabDiv.prototype.getIndexByName=function(name)
	{
		for(var i=0;i<this.tabs.length;i++)
		{
			if(this.tabs[i].name==name)
			{
				return i;
			}
		}
		return -1;
	}
	window.SFGanttTabDiv=SFGanttTabDiv;