	/**
	用来加载图片的对象，在用这种模式来加载重复图片可以避免浏览器重复请求，获得更高的性能，
	每个图片加载器对应一个URL
	@param {String} src 图片的URL地址
	@private
	@class
	*/
	function SFImgLoader(src)
	{
		this.imgs=[];
		var img=new Image();
		this.img=img;
		SFEvent.bind(img,"load",this,this.onLoad);
		img.src=src;
		if(img.complete){this.onLoad();}
	}
	/**
	添加一个图片实例由此对象来管理
	@param {Image} img html的Img标签对象
	@private
	@class
	*/
	SFImgLoader.prototype.addImg=function(img)
	{
		this.imgs.push(img);
		if(this.loaded)
		{
			this.onLoad();
		}
	}
	/**
	在图片加载完成时操作，设置所有标签的地址
	@private
	@class
	*/
	SFImgLoader.prototype.onLoad=function()
	{
		this.loaded=true;
		var img;
		while(img=this.imgs.pop())
		{
			if(img.tagName.toLowerCase()=="img")
			{
				img.src=this.img.src;
			}
			else
			{
				img.style.backgroundImage="url("+this.img.src+")";
			}
		}
	}
	/**
	销毁此对象
	@private
	@class
	*/
	SFImgLoader.prototype.depose=function()
	{
		this.imgs.length=0;
		SFEvent.clearListeners(this);
		for(var key in this){this[key]=null;}
	}
	/**
	设置img标签的src属性，让浏览器开始加载此图片
	@param {Image} img html的Img标签对象
	@param {String} src 图片的URL地址
	@private
	@class
	*/
	SFImgLoader.setImageSrc=function(img,src)
	{
		if(!SFImgLoader.objs){SFImgLoader.objs={};}
		if(!SFImgLoader.objs[src]){SFImgLoader.objs[src]=new SFImgLoader(src);}
		SFImgLoader.objs[src].addImg(img);
	}
	/**
	根据节点和路径，销毁指定的节点
	@param {Image} img html的Img标签对象
	@param {String} src 图片的URL地址
	@private
	@class
	*/
	SFImgLoader.depose=function(img,src)
	{
		if(SFImgLoader.objs)
		{
			for(var key in SFImgLoader.objs)
			{
				if(!SFImgLoader.objs[key] instanceof SFImgLoader){continue;}
				var loader=SFImgLoader.objs[key];
				if(loader){loader.depose();}
				SFImgLoader.objs[key]=null;
				delete SFImgLoader.objs[key];
			}
		}
	}
	window.SFImgLoader=SFImgLoader;