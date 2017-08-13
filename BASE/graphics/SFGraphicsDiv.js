	/**
	直接使用层实现的画笔，这个主要用在其他画笔技术都不支持的情况下使用，必须要引用jsGraphics对象才能使用
	@private
	@extends SFGraphics
	@class
	*/
	function SFGraphicsDiv()
	{
		var div=this.div=document.createElement("div");
		SFGlobal.setProperty(div.style,{position:'absolute',zIndex:420});
		this.ctx=new window.jsGraphics(div);
	}
	/**
	返回浏览器是否支持此画笔
	@returns {Bool} 如果支持返回true,否则返回false
	*/
	SFGraphicsDiv.isSupport=function()
	{
		return !!window.jsGraphics;
	}
	SFGraphicsDiv.prototype=new SFGraphics();
	/**
	开始绘制过程
	@param {SFPoint} origin 绘制的原点位置
	@param {Number} scale 当前地图的缩放比例
	@param {SFPoint} size 绘制区域的大小
	*/
	SFGraphicsDiv.prototype.start=function(origin,scale,size)
	{
		SFGlobal.setProperty(this,{origin:origin,size:size,scale:scale,pathArr:[]});
	}
	/**
	将绘制点移动到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsDiv.prototype.moveTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		var arr={xPoints:[(point.x-origin.x)/scale],yPoints:[(point.y-origin.y)/scale]};
		pathArr.push(arr);
	}
	/**
	从绘制点划线到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsDiv.prototype.lineTo=function(point)
	{
		var pathArr=this.pathArr,arr=pathArr[pathArr.length-1],scale=this.scale,origin=this.origin;
		arr.xPoints.push((point.x-origin.x)/scale);
		arr.yPoints.push((point.y-origin.y)/scale);
	}
	/**
	结束绘制过程
	*/
	SFGraphicsDiv.prototype.finish=function()
	{
		this.lastScale=this.scale;
		this.reDraw();
	}
	/**
	设置绘制内容的缩放比例
	@param {Number} scale 缩放比例
	*/
	SFGraphicsDiv.prototype.setScale=function(scale)
	{
		this.lastScale=scale;
		var size=this.size;
		SFGlobal.setProperty(this.div.style,{width:size.x/scale+"px",height:size.y/scale+"px"});
		this.reDraw();
	}
	/**
	设置线条的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsDiv.prototype.setLineColor=function(color)
	{
		if(color=="transparent"){color=""}
		this.lineColor=color;
		this.reDraw();
	}
	/**
	设置填充区域的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsDiv.prototype.setFillColor=function(color)
	{
		if(color=="transparent"){color=""}
		this.bgcolor=color;
		this.reDraw();
	}
	/**
	设置显示不透明度
	@param {Number} opacity 不透明度(0-1的小数，0代表完全透明，1代表完全不透明)
	*/
	SFGraphicsDiv.prototype.setOpacity=function(opacity)
	{
		SFGlobal.setProperty(this.div.style,{
			filter:"progid:DXImageTransform.Microsoft.Alpha(opacity="+parseInt(opacity*100)+")",
			MozOpacity:opacity,
			opacity:opacity
		});
	}
	/**
	设置线条显示的线宽
	@param {Number} weight 线条粗细
	*/
	SFGraphicsDiv.prototype.setLineWeight=function(weight)
	{
		this.lineWeight=weight;
		this.reDraw();
	}
	/**
	设置线条显示的样式
	@param {String} style 线条样式名称，支持如下几种："solid"(实线),"dotted"(点线),"dashed"(虚线)
	*/
	SFGraphicsDiv.prototype.setLineStyle=function(style)
	{
		this.lineStyle=style.toLowerCase();
	}
	/**
	重绘绘制的图形
	@private
	*/
	SFGraphicsDiv.prototype.reDraw=function()
	{
		var scale=this.scale,lastScale=this.lastScale,size=this.size,div=this.div,pathArr=this.pathArr;
		if(!size || !pathArr || pathArr.length==0){return;}
		SFGlobal.setProperty(div,{width:size.x/lastScale,height:size.y/lastScale});
		var ctx=this.ctx;
		ctx.clear();
		for(var i=0;i<pathArr.length;i++)
		{
			var p=pathArr[i],xPoints,yPoints;
			if(scale==lastScale)
			{
				xPoints=p.xPoints;
				yPoints=p.yPoints;
			}
			else
			{
				xPoints=new Array(p.xPoints.length);
				yPoints=new Array(p.yPoints.length);
				var s=scale/lastScale,pxs=p.xPoints,pys=p.yPoints;
				for(var j=xPoints.length-1;j>=0;j--)
				{
					xPoints[j]=pxs[j]*s
					yPoints[j]=pys[j]*s
				}
			}
			if(this.bgcolor)
			{
				ctx.setColor(this.bgcolor);
				ctx.fillPolygon(xPoints,yPoints);
			}
			if(this.lineColor)
			{
				ctx.setColor(this.lineColor);
				ctx.setStroke((this.lineStyle && this.lineStyle!="solid" && window.Stroke)?window.Stroke.DOTTED:this.lineWeight);
				ctx.drawPolyline(xPoints,yPoints);
			}
		}
		ctx.paint();
	}
	window.SFGraphicsDiv=SFGraphicsDiv