	/**
	使用Canvas技术实现的画笔
	@private
	@extends SFGraphics
	@class
	*/
	function SFGraphicsCanvas()
	{
		var div=this.div=document.createElement("canvas");
		SFGlobal.setProperty(div.style,{position:'absolute',zIndex:420});
	}
	/**
	返回浏览器是否支持此画笔
	@returns {Bool} 如果支持返回true,否则返回false
	*/
	SFGraphicsCanvas.isSupport=function()
	{
		if(typeof(SFGraphicsCanvas._isSupport)=="undefined")
		{
			SFGraphicsCanvas._isSupport=!!document.createElement("canvas").getContext
		}
		return SFGraphicsCanvas._isSupport;
	}
	SFGraphicsCanvas.prototype=new SFGraphics();
	/**
	开始绘制过程
	@param {SFPoint} origin 绘制的原点位置
	@param {Number} scale 当前地图的缩放比例
	@param {SFPoint} size 绘制区域的大小
	*/
	SFGraphicsCanvas.prototype.start=function(origin,scale,size)
	{
		SFGlobal.setProperty(this,{origin:origin,size:size,scale:scale,pathArr:[]});
	}
	/**
	将绘制点移动到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsCanvas.prototype.moveTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		pathArr.push({type:'m',argu:[(point.x-origin.x)/scale,(point.y-origin.y)/scale]});
	}
	/**
	从绘制点划线到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsCanvas.prototype.lineTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		pathArr.push({type:'l',argu:[(point.x-origin.x)/scale,(point.y-origin.y)/scale]});
	}
	/**
	结束绘制过程
	*/
	SFGraphicsCanvas.prototype.finish=function()
	{
		this.lastScale=this.scale;
		this.reDraw();
	}
	/**
	清除绘制的内容
	*/
	SFGraphicsCanvas.prototype.clear=function()
	{
		var ctx=this.div.getContext("2d");
	}
	/**
	设置绘制内容的缩放比例
	@param {Number} scale 缩放比例
	*/
	SFGraphicsCanvas.prototype.setScale=function(scale)
	{
		this.lastScale=scale;
		var size=this.size;
		SFGlobal.setProperty(this.div.style,{width:size.x/scale+"px",height:size.y/scale+"px"});
		this.reDraw();
	}
	/**
	重绘绘制的图形
	@private
	*/
	SFGraphicsCanvas.prototype.reDraw=function()
	{
		var scale=this.scale,lastScale=this.lastScale,size=this.size,div=this.div,pathArr=this.pathArr;
		if(!size || !pathArr || pathArr.length==0){return;}
		SFGlobal.setProperty(div,{width:size.x/lastScale,height:size.y/lastScale});
		var ctx=div.getContext("2d");
		SFGlobal.setProperty(ctx,{
			lineCap:"round",
			lineJoin:"round",
			fillStyle:this.bgcolor,
			lineWidth:this.lineWeight/scale*lastScale,
			strokeStyle:this.lineColor,
			globalAlpha:this.opacity
		});
		ctx.beginPath();
		ctx.scale(scale/lastScale,scale/lastScale);
		for(var i=0;i<pathArr.length;i++)
		{
			var p=pathArr[i];
			switch(p.type)
			{
				case "m":
					ctx.moveTo.apply(ctx,p.argu);
					break;
				case "l":
					ctx.lineTo.apply(ctx,p.argu);
					break;
			}
		}
		if(this.bgcolor){ctx.fill();}
		if(this.lineColor){ctx.stroke();}
	}
	/**
	设置线条的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsCanvas.prototype.setLineColor=function(color)
	{
		if(color=="transparent"){color=""}
		this.lineColor=color;
		this.reDraw();
	}
	/**
	设置填充区域的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsCanvas.prototype.setFillColor=function(color)
	{
		if(color=="transparent"){color=""}
		this.bgcolor=color;
		this.reDraw();
	}
	/**
	设置显示不透明度
	@param {Number} opacity 不透明度(0-1的小数，0代表完全透明，1代表完全不透明)
	*/
	SFGraphicsCanvas.prototype.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		this.reDraw();
	}
	/**
	设置线条显示的线宽
	@param {Number} weight 线条粗细
	*/
	SFGraphicsCanvas.prototype.setLineWeight=function(weight)
	{
		this.lineWeight=weight;
		this.reDraw();
	}
	window.SFGraphicsCanvas=SFGraphicsCanvas