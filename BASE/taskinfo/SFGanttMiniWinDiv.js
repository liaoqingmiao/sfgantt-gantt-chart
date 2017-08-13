	function SFGanttMiniWinDiv(bodyDiv)
	{
		var maskDiv=document.createElement("div");
		SFGlobal.setProperty(maskDiv.style,{position:'absolute',top:'0px',width:'100%',height:'100%',backgroundColor:'#000000',zIndex:800});
		SFEvent.addListener(maskDiv,"mousedown",SFEvent.cancelBubble);
		SFGlobal.setOpacity(maskDiv,0.4);
		var container=document.createElement("div");
		var borderWidth=2;
		SFGlobal.setProperty(container.style,{position:'absolute',border:'solid '+borderWidth+'px #1E2025'});
		SFGlobal.setProperty(this,{headHeight:20,borderWidth:borderWidth,container:container,bodyDiv:bodyDiv,maskDiv:maskDiv});
		var headTable=document.createElement("table");
		SFGlobal.setProperty(headTable,{height:this.headHeight+'px',width:'100%',bgColor:'#1E2025'});
		var row=headTable.insertRow(-1);
		var cell=row.insertCell(-1);
		SFGlobal.setProperty(cell.style,{noWrap:'true',overflow:'hidden'});
		var div=document.createElement("div");
		cell.appendChild(div);
		SFGlobal.setProperty(div.style,{color:'#FFFFFF',noWrap:'true',position:'absolute',paddingLeft:'5px',width:'100%',overflow:'hidden',top:'2px',fontSize:'13px'});
		cell=row.insertCell(-1);
		SFGlobal.setProperty(cell,{width:20,innerHTML:'×'});
		SFGlobal.setProperty(cell.style,{color:'#FFFFFF',cursor:'pointer',align:'center'});
		SFEvent.bind(cell,"click",this,this.hidden);
		container.appendChild(headTable);
	}
	SFGanttMiniWinDiv.prototype.show=function(div,title)
	{
		if(div.parentNode){div.parentNode.removeChild(div);}
		var container=this.container,bodyDiv=this.bodyDiv;
		//清除原来的内容
		while(container.firstChild.nextSibling)
		{
			container.removeChild(container.firstChild.nextSibling);
		}
		//清除原来的标题
		var titleDiv=container.firstChild.rows[0].cells[0].firstChild;
		while(titleDiv.firstChild){titleDiv.removeChild(titleDiv.firstChild);}
		titleDiv.appendChild(document.createTextNode(title));
		container.appendChild(div);
		this.bodyDiv.appendChild(this.maskDiv);
		this.bodyDiv.appendChild(container);
		var borderWidth=this.borderWidth;
		SFGlobal.setProperty(container.style,{width:div.offsetWidth+borderWidth*2+'px',height:div.offsetHeight+this.headHeight+borderWidth*2+'px',zIndex:'900',left:(bodyDiv.offsetWidth-div.offsetWidth-borderWidth*2)/2+'px',top:(bodyDiv.offsetHeight-div.offsetHeight-this.headHeight-borderWidth*2)/2+'px'});
	}
	SFGanttMiniWinDiv.prototype.hidden=function(e)
	{
		this.bodyDiv.removeChild(this.maskDiv);
		this.bodyDiv.removeChild(this.container);
	}
	window.SFGanttMiniWinDiv=SFGanttMiniWinDiv;