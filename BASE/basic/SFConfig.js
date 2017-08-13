	/**
	向日葵甘特图(SFGantt JavaScript API)之中用来对甘特图进行配置的类，配置的方式可以使用Json，也可以通过类的方法进行配置。
	@param {Json} [obj] 用Json格式指定的配置参数
	@class
	*/
	function SFConfig(obj)
	{
		this.obj=obj?obj:{};
		this.inited=false;
		if(!obj){SFConfig.addConfig(this.obj,window._SFGantt_config,false);}
	}
	/**
	根据指定的路径，读取一项配置的值，如果该值不存在，则返回通过dv参数给定的默认值
	@param	{String}	path	配置项的名称
	@param	{Object}	[dv]	在该项没有被配置时返回的默认值
	@returns {Object} 返回配置项的值，该值的类型为任意类型
	*/
	SFConfig.prototype.getConfig=function(path,dv)
	{
		if(!this.inited)
		{
			this.inited=true;
			this.parseWildcard();
		}
		var obj=this.getConfigObj(path);
		return typeof(obj)!="undefined"?obj:dv
	}
	/**
	获得指定配置项的Json节点
	@private
	@param	{String}	path	配置项的名称
	@returns {Json} 返回该Json节点
	*/
	SFConfig.prototype.getConfigObj=function(path)
	{
		if(!this.inited)
		{
			this.inited=true;
			this.parseWildcard();
		}
		var paths=path.split(new RegExp("[/\\.]"));
		var name,obj=this.obj;
		while(typeof(name=paths.shift())=="string")
		{
			if(!name){continue;}
			if(!obj || typeof(obj)!="object"){break;}
			obj=obj[name];
		}
		return obj;
	}
	/**
	设置一项配置的值
	@see <a href="../config.html">配置项列表</a>.
	@param	{String}	path	配置项的名称
	@param	{Object}	value	配置项的值，任意类型，请参看配置项说明
	@param	{Bool}	cover	假如该项已经被配置，此参数指定是否覆盖
	*/
	SFConfig.prototype.setConfig=function(path,value,cover)
	{
		var paths=path.split(new RegExp("[/\\.]"));
		var name,obj=this.obj;
		while(name=paths.shift())
		{
			if(paths[0])
			{
				if(!obj[name] || typeof(obj[name])!="object")
				{
					obj[name]={};
				}
				obj=obj[name];
			}
			else
			{
				if(cover!=false || !obj[name])
				{
					obj[name]=value;
				}
			}
		}
	}
	/**
	对内容进行通配符替换的递归函数,这是为了版本生成初始化而进行的
	@private
	@param	{Json}	obj	配置项的节点Json对象
	*/
	SFConfig.prototype.parseWildcard=function(obj)
	{
		if(!obj){obj=this.obj;}
		if(!obj){return;}
		for (var key in obj)
		{
			switch (typeof(obj[key]))
			{
				case "object":
					this.parseWildcard(obj[key]);
					break;
				case "string":
					if(obj[key].indexOf("${")>=0)
					{
						var config=this;
						obj[key]=obj[key].replace(new RegExp("\\$\\{([^\\}]+)\\}\\$","g"),function(a,b){return config.getConfig(b)});
					}
					break;
			}
		}
	}
	/**
	添加一系列的配置信息，这个函数是一个递归函数
	@private
	@param	{Json}	obj	配置项的节点Json对象
	@param	{Json}	json	要添加的配置信息
	@param	{Bool}	cover	当配置项已经存在时，是覆盖，还是忽略，如果为true,则为覆盖
	*/
	SFConfig.addConfig=function(obj,json,cover)
	{
		if(!json){return;}
		for (var key in json)
		{
			switch (typeof(json[key]))
			{
				case "function":
					break;
				case "object":
					if(SFEvent.isHtmlControl(json[key]))
					{
						obj[key]=json[key];
						continue;
					}
					if(!obj[key]){obj[key]={};}
					SFConfig.addConfig(obj[key],json[key],cover);
					break;
				default:
					if(cover!=false || !obj[key])
					{
						obj[key]=json[key];
					}
					break;
			}
		}
	}
	/**
	将某一项的配置全部应用到一个对象
	@private
	@param	{Json}	obj	指定的对象
	@param	{Json}	json	指定的配置项节点Json对象
	*/
	SFConfig.applyProperty=function(obj,json)
	{
		if(!json){return;}
		for(var key in json)
		{
			if(typeof(json[key])=="function"){continue;}
			obj[key]=json[key];
		}
	}
	/**
	@name SFConfig.configItems
	@namespace 所有配置项
	*/
	window.SFConfig=SFConfig;