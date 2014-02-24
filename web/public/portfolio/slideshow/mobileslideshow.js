(function ()
{
	App.Slideshow = {

		data: {
		album: [],
		formats: ['jpg','png','gif'],
		aspect: 75,
		scale: 'zoom',
		duration: 3,
		transSpeed: 1000,
		transType: 'fade',
		showButtons: true,
		showBullets: false,
		allowPause: true,
		allowLoop: true

		},
		construct: function (album)
		{
			this.data.album = album;
			//this.preLoadImages(this.data.album);
			this.load();				
		},

		load: function ()
		{
			var fromLoad = true;

			if (this.data.album.length > 0)
			{
				this.attachEvents(fromLoad);	
			}	

		},
/**
		getAlbum: function()
		{
			var album = [], that = this;

			$.ajax({
	        url: that.data.albumUrl,
	        success: function (data) {

	            $(data).find("a").each(function (i) {
	               var name = this.innerText(),
	               	   extension = name.split('.').pop();

	               if($.inArray(extension, that.data.formats))
	               {
	               		album[]['url'] = data.albumUrl+name;
	               		album[]['current'] = i;
	               		album[]['next'] = i +1;
	               }		
	            });

	            console.log(album);
	        }
	    });
			//returns array of images
			return album;
		},
*/

		//set up widget dimensions on resize, but only fire once after resize is done
		debouncer: function(func, time) 
		{	
			var timeoutID,
				timeout = time || 200;

			return function() 
			{
				var scope = this, args = arguments;
					clearTimeout(timeoutID);
					timeoutID = setTimeout(function () 
					{
						func.apply(scope, Array.prototype.slice.call(args));
					}, timeout);
			};
		},

		// attachEvents: 
		attachEvents: function (fromLoad)
		{		
			var that = this,
			elAll =  $(this.el).find('.slideshow-widget li'),
			data;
			App.stopSlideShow = false;
			App.startSlideShow = false;
			App.paused = false;
			t = null;


			data = this.data;

			//set the individual slide width/height attributes based on window
			that.setAspectProperties();


			//check that we are in the editor before auto-playing, if so set to paused
			if ($('html').find('body.edit').length === 0)
			{	
				that.startSlideShow(0);	

				$(window).resize(that.debouncer(function (e) 
				{
					console.log(e);
					that.setAspectProperties();
				}, 200));
			}
			else
			{
				//since we start paused in editor, switch play state
				$(this.el).find('.btn-play').removeClass('pause');	
				App.paused = true;
			}	

			//set first image to selected state
			$(this.el).find('.dot[data-ref="0"]').addClass('selected');
			//show first img item
			$(this.el).find('ul li[data-ref="0"]').addClass('img-current').show();

			if (!data.allowLoop)
			{	
				$(this.el).find('.btn-prev').addClass('disabled').attr('disabled', true);
			}
				
			//if there is only one image, hide the buttons and don't attach events
			if (data.album[0].prev === 0)
			{
				$(that.el).find('.btn-play').hide();
				$(that.el).find('.btn-prev').hide();
				$(that.el).find('.btn-next').hide();
			}
			else
			{	
				//click events for prev/next/dot img selection and play/pause
				$(that.el).find('span').on('click', function(e)
				{
					var ref = $(this).data('ref') || 0, 
						type = $(this).attr('class'),
						disabled = $(this).attr('disabled'),
						el = $(this);

					if (type === 'btn-play pause')
					{
						elAll.stop(true, true);	
						that.pauseSlideShow(event);
					}	
					else if (disabled !== 'disabled')
					{
						//if you are playing, change button back to pause
						if (type === 'btn-play')
						{
							el.addClass('pause');
							App.stopSlideShow = false;
							App.paused = false;
							that.setAnimation(ref);
						}	
						else
						{
							//stop the current slide/animations
							elAll.stop(true, true);
							App.stopSlideShow = true;
							that.setSlideInfo(ref);

							$(that.el).find('.slideshow-widget li.img-current').removeClass('img-current').hide();
							$(that.el).find('.slideshow-widget li[data-ref='+ref+']').addClass('img-current').css({'left': '0px', 'top': '0px', 'margin': '0px', opacity: 1}).show();
							
							//check the slides are not paused before starting animations
							if (!App.paused)
							{
								that.skipToSlide(ref, e);
							}	
						}
					}	
				});
			}	
		},

		preLoadImages: function(imageArray)
		{
			function preload(arrayOfImages) 
			{
				$(arrayOfImages).each(function()
				{
					new Image().src = this.url;
			    });
			}

			preload(imageArray);
		},

		setAspectProperties: function()
		{
			
			var style = document.createElement("style"),
				scale = this.data.scale,
				ratio = this.data.aspect,
				backgroundStyles = [],
				imageArray = this.data.album,
				widgetWidth = parseInt($(this.el).find('.slideshow-widget-wrapper').parent()[0].clientWidth, 10),
				widgetHeight = parseInt(widgetWidth * (ratio / 100), 10),
				imgHeight, imgWidth,
				marginW =  Math.round(widgetWidth / 2),
				marginH =  Math.round(widgetHeight / 2);


				$.each(imageArray, function(key, value)
				{
					imgHeight = Math.round(value.imageHeight * (widgetWidth / value.imageWidth));
					imgWidth = widgetWidth;

					switch(scale)
					{
						case 'zoom':
							if (imgHeight > widgetHeight)
							{
								imgHeight = widgetHeight;
								imgWidth = Math.round(value.imageWidth * (widgetHeight / value.imageHeight)); 
							}	

							App.bgStyle = imgWidth +'px ' + imgHeight+'px';
							break;

						case 'original':
							App.bgStyle = value.imageWidth +'px ' +value.imageHeight+'px';			
							break;

						case 'stretch':
							App.bgStyle = widgetWidth+'px '+widgetHeight+'px';
							
						break;

						case 'crop_zoom':
					
							if (value.imageWidth > value.imageHeight)
							{
								App.bgStyle = imgWidth+'px' + widgetHeight+'px';							
							}
							else
							{
								App.bgStyle = widgetWidth+'px '+ imgHeight+'px';			
							
							}
							
						break;
						}

						backgroundStyles[key] = '.slideshow-widget ul.img-array li[data-ref="'+key+'"]{background-size:'+App.bgStyle+';}';
					});	

			
				backgroundStyles = backgroundStyles.join('');

			style.innerHTML = 
			'.slideshow-widget{width: '+widgetWidth+'px;height:'+widgetHeight+'px;} .slideshow-widget ul.img-array li{width: '+widgetWidth+'px;height:'+widgetHeight+'px;} '+backgroundStyles;

			document.body.appendChild(style);
		},

		startSlideShow: function(ref)
		{
			var that = this;
	
			that.timeOutContent(ref);						
		},

		timeOutContent: function(ref)
		{
			var that = this,
				data = that.properties.data,
				duration = data.duration * 1000,
				lastImg = data.album.length - 1,
				t2 = null;
				
				t2 = setTimeout(function ()
				{
					if (App.stopSlideShow || (ref === lastImg && (!data.allowLoop)))
					{
						return;
					} 
					
						that.setAnimation(ref);
					clearTimeout(t2);

				}, duration);
				
		},

		skipToSlide: function(ref, e)
		{
			var that = this, t, 
				data = that.properties.data,
				duration = Math.round(data.duration * 1000);

				//set the ref globally so after time out it will only invoke the animation function for the last clicked				
				App.skipToThis = ref;
				
				t2 = setTimeout(function (e)
				{
					if (App.skipToThis === ref)
					{
						that.setAnimation(ref);
						clearTimeout(t2);
					}	

				}, duration);
				
							
		},

		setSlideInfo: function(ref)
		{
			var that = this,
				el = $(this.el),
				data = that.properties.data,
				lastImg = data.album.length - 1,
				next = data.album[ref].next;

			el.find('.dot').removeClass('selected');
			el.find('.dot[data-ref='+ref+']').addClass('selected');		
			el.find('.btn-prev').data('ref', data.album[ref].prev);
			el.find('.btn-next').data('ref', next);
			el.find('.btn-play').data('ref', data.album[ref].current);	


			if ((data.album[ref].prev === lastImg) && !data.allowLoop)
			{
				el.find('.btn-prev').addClass('disabled').attr('disabled', true);
			}
			else
			{
				el.find('.btn-prev').removeClass('disabled').removeAttr('disabled');
			}	
			
			if ((data.album[ref].next === 0)  && !data.allowLoop)
			{
				el.find('.btn-next').addClass('disabled').attr('disabled', true);
			}
			else
			{
				el.find('.btn-next').removeClass('disabled').removeAttr('disabled');
			}	
			
			
		},

		pauseSlideShow: function(e, ref)
		{
			$(this.el).find('.btn-play').removeClass('pause');
			App.stopSlideShow = true;
			App.paused = true;
		},

		setAnimation: function(ref)
		{
			var that = this,
				el = $(this.el),
				data = that.properties.data,			
				lastImg = data.album.length - 1,
				scale = this.data.scale,
				thisOut = ref,
				thisIn = data.album[ref].next,
				elOut = el.find('.slideshow-widget li[data-ref='+thisOut+']'),
				elIn = el.find('.slideshow-widget li[data-ref='+thisIn+']'),
				elAll =  el.find('.slideshow-widget li'),
				elWidth = el.find('.slideshow-widget').width(),
				elHeight = el.find('.slideshow-widget').height(),
				imgHeightOut = Math.round(thisOut.imageWidth * (elWidth / thisOut.imageHeight)),
				imgHeightIn = Math.round(thisIn.imageHeight * (elWidth / thisIn.imageWidth)),
				elMarginW = Math.round(elWidth / 2),
				elMarginH = Math.round(elHeight / 2),
				imgWidthIn = elWidth,
				imgWidthOut = elWidth,
				options = {},
				properties = {},
				direction, modifier, XorY, step, stepW, stepH, css, cssIn, transitionCss,  
				elMargin = elWidth,
				timing = parseInt(data.transSpeed, 10),
				duration = data.duration * 1000,
				elEffect = data.transType,
				whichEffect = elEffect;

			if (elEffect.indexOf('scroll') === 0)
			{
				elEffect = 'scroll';
			} 
			else if (elEffect.indexOf('curtain') === 0)
			{
				elEffect = 'curtain';
			}

			else if (elEffect.indexOf('unfold') === 0)
			{
				elEffect = 'unfold';
			}
			else if (elEffect.indexOf('grow') === 0)
			{
				elEffect = 'grow';
			}	
			else if (elEffect.indexOf('turn') === 0)
			{
				elEffect = 'turn';
			}

			else if (elEffect.indexOf('spin') === 0)
			{
				elEffect = 'spin';
			}


			switch(elEffect)
			{
				case 'fade':
					timing = timing / 2;
				elOut.removeClass('img-current').fadeOut(timing, callbackOut);

				elIn.delay(timing).addClass('img-current').fadeIn(timing, callbackIn);
				break;

				case 'dissolve':

				callbackOut();
				elOut.removeClass('img-current').fadeOut(timing);
				elIn.addClass('img-current').fadeIn(timing, callbackIn);

				break;

				case 'scroll':

					switch(whichEffect)
					{
						case 'scrollLeft':
							direction = 'left';
							modifier = '-';
							break;

						case 'scrollRight':
							direction = 'left';
							modifier = '+';
							elMargin = -+elWidth;
							break;

						case 'scrollUp':
							direction = 'top';
							modifier = '-';
							break;

						case 'scrollDown':
							direction = 'top';
							modifier = '+';
							elMargin = -+elWidth;
							break;
					}

					properties[direction] = modifier+'='+elWidth+'px';

					elOut.removeClass('img-current').animate(properties, timing, function()
						{
							callbackOut();
							elOut.hide();
						});

					elIn.addClass('img-current').css(direction, elMargin).show().animate(properties, timing, function()
						{
							callbackIn();
						});

				break;

				case 'uncover':
				properties.left = '-'+elWidth+'px';

					callbackOut();

					elOut.removeClass('img-current').css('z-index', '10').animate(properties, timing, function()
						{
							callbackIn();
							elOut.hide();
						});

					elIn.addClass('img-current').css({'left': '0px', 'z-index': '6'}).show();
	
					break;

				case 'wipe':
				properties.width = '0px';
				properties.height = '0px';

					callbackOut();

					elOut.removeClass('img-current').css('z-index', '10').animate(properties, timing, function()
						{
							callbackIn();
							elOut.hide();
						});

					elIn.addClass('img-current').css({width: elWidth, height: elHeight, 'z-index': '6'}).show();
	
					break;	

				case 'zoom':
					properties = {'width': '0px', 'height': '0px', 'margin-left': elMarginW, 'margin-right': elMarginW, 'margin-top': elMarginH, 'margin-bottom': elMarginH };

					elOut.removeClass('img-current').animate(properties, timing, function()
					{
						callbackOut();
						elOut.hide();
					});

					elIn.addClass('img-current').css(properties).delay(timing).show().animate({'width': elWidth, 'height': elHeight, margin: '0px'}, timing, callbackIn);	
				break;

				case 'unfold':

					if (whichEffect === 'unfoldX')
					{
						properties = {'width': elWidth, 'left':  '0px' };
						css = {'width': '0px', 'left': elMarginW};
					}	
					else
					{
						properties = {'height': elHeight, 'top': '0px' };
						css = {'height': '0px', 'top': elMarginH};
					}	

					callbackOut();
					elOut.removeClass('img-current');

					elIn.addClass('img-current').css(css).show().animate(properties, timing, function()
						{
							elOut.hide();
							callbackIn();
						});

				break;

				case 'curtain':

					if (whichEffect === 'curtain')
					{
						properties = {'width': '0px', 'left': elMarginW };
						css = {'width': '0px', 'left': elMarginW};

						properties.out = {'width': '+='+elWidth, 'left': '-='+elMarginW};
					}	
					else
					{
						properties = {'height': '0px', 'top': elMarginH };
						css = {'height': '0px', 'top': elMarginH};

						properties.out = {'height': '+='+elHeight, 'top': '-='+elMarginH};
					}	
					
					elOut.removeClass('img-current').animate(properties, timing, function()
					{
						callbackOut();
						elOut.hide();
					});

					elIn.addClass('img-current').css(css).delay(timing).show().animate(properties.out, timing, callbackIn);

				break;

				case 'grow':

					if (whichEffect === 'growX')
					{
						XorY = 'X';
					}
					else
					{
						XorY = 'Y';						
					}	

					properties = {borderSpacing: '100'};
					css = {borderSpacing: '0', '-webkit-transform': 'scale'+XorY+'(0)'};

					callbackOut();
					elOut.removeClass('img-current');

					elIn.addClass('img-current').css(css).show().animate(properties,
					{
						duration: timing,
						step: function(now, fx)
						{
							step = now / 100;
							$(this).css('-webkit-transform','scale'+XorY+'('+step+')');
						},
						specialEasing: {
					      width: 'linear',
					      height: 'easeOutBounce'
						},
						complete: function()
						{
							elOut.hide().css(css);
							callbackIn();
						}	
					});


				break;

				case 'spin':

					switch (whichEffect)
					{
						case 'spin2d':
						modifier = '';
						break;

						case 'spinX3d':
						modifier = 'X';
						break;

						case 'spinY3d':
						modifier = 'Y';
						break;
					}

					callbackOut();
					elOut.removeClass('img-current').css({borderSpacing: 100, '-webkit-transform': 'rotate'+modifier+'(0deg)', opacity: 1}).animate({borderSpacing: 0},
					{
						duration: timing,
						step: function(now, fx)
						{
							step = parseInt(now * 3.6, 10);
							stepH = parseInt(now, 10) / 100;
							$(this).css({'-webkit-transform': 'rotate'+modifier+'(-'+step+'deg)', opacity: stepH});
						},
						complete: function()
						{
							elOut.hide();
							callbackIn();
						}	
					});

					elIn.addClass('img-current').css({borderSpacing: 0, '-webkit-transform': 'rotate'+modifier+'(0deg)', opacity: 1}).show().animate({borderSpacing: 100},
					{
						duration: timing,
						step: function(now, fx)
						{
							step = parseInt(now * 3.6, 10);
							stepH = parseInt(now, 10) / 100;
							$(this).css({'-webkit-transform': 'rotate'+modifier+'('+step+'deg)', opacity: stepH});
						},
						complete: function()
						{
							elIn.css('-webkit-transform', 'rotate(0)');
						}	

					});



				break;

				case 'turn':

					stepX = elWidth / 100;
					stepY = elHeight / 100;
					css = {borderSpacing: '0', '-webkit-transform': 'scaleX(1)', left: '0', top: '0', 'z-index': '7'};
				
					properties = {borderSpacing: '100'};	
			
					callbackOut();
					elOut.removeClass('img-current').css(css).css('z-index', '7').show().animate(properties,
					{
						duration: timing,
						step: function(now, fx)
						{
							step = (100 - parseInt(now, 10)) / 100;
							stepW = parseInt((stepX  / 2 ) * now, 10);
							stepH = parseInt((stepY  / 2 ) * now, 10);

							switch (whichEffect)
							{
								case 'turnLeft':	
								transitionCss = {left: '-'+stepW+'px', '-webkit-transform':'scaleX('+step+')'};
								break;

								case 'turnRight':	
								transitionCss = {left: stepW+'px', '-webkit-transform':'scaleX('+step+')'};
								break;

								case 'turnUp':
								transitionCss = {'-webkit-transform':'scaleY('+step+')', top: '-'+stepH+'px'};
								break;

								case 'turnDown':
								transitionCss = {'-webkit-transform':'scaleY('+step+')', top: stepH+'px'};
								break;
							}	

							$(this).css(transitionCss);
						},
						easing: 'linear',
						complete: function()
						{
							elOut.hide();
							callbackIn();
						}	
					});

					elIn.addClass('img-current').css(css).css('z-index', '6').show();

				break;	
					
				default:

					//if none is chosen, just switch the images without an effect
					callbackOut();
					elOut.removeClass('img-current').hide();
					elIn.addClass('img-current').show();
					callbackIn();

				break;
			}
			
			function callbackOut() 
			{
				ref = data.album[ref].next;
				//set the next slide information
				that.setSlideInfo(ref);
			}

			function callbackIn() 
			{
				App.stopSlideShow = false;
				that.timeOutContent(ref);
			}		

		}
	};


}());