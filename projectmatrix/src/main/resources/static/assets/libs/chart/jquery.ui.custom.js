/* Javascript plotting library for jQuery, version 0.8.3.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

*/

// first an inline dependency, jquery.colorhelpers.js, we inline it here
// for convenience

/* Plugin for jQuery for working with colors.
 *
 * Version 1.1.
 *
 * Inspiration from jQuery color animation plugin by John Resig.
 *
 * Released under the MIT license by Ole Laursen, October 2009.
 *
 * Examples:
 *
 *   $.color.parse("#fff").scale('rgb', 0.25).add('a', -0.5).toString()
 *   var c = $.color.extract($("#mydiv"), 'background-color');
 *   console.log(c.r, c.g, c.b, c.a);
 *   $.color.make(100, 50, 25, 0.4).toString() // returns "rgba(100,50,25,0.4)"
 *
 * Note that .scale() and .add() return the same modified object
 * instead of making a new one.
 *
 * V. 1.1: Fix error handling so e.g. parsing an empty string does
 * produce a color rather than just crashing.
 */
(function($){$.color={};$.color.make=function(r,g,b,a){var o={};o.r=r||0;o.g=g||0;o.b=b||0;o.a=a!=null?a:1;o.add=function(c,d){for(var i=0;i<c.length;++i)o[c.charAt(i)]+=d;return o.normalize()};o.scale=function(c,f){for(var i=0;i<c.length;++i)o[c.charAt(i)]*=f;return o.normalize()};o.toString=function(){if(o.a>=1){return"rgb("+[o.r,o.g,o.b].join(",")+")"}else{return"rgba("+[o.r,o.g,o.b,o.a].join(",")+")"}};o.normalize=function(){function clamp(min,value,max){return value<min?min:value>max?max:value}o.r=clamp(0,parseInt(o.r),255);o.g=clamp(0,parseInt(o.g),255);o.b=clamp(0,parseInt(o.b),255);o.a=clamp(0,o.a,1);return o};o.clone=function(){return $.color.make(o.r,o.b,o.g,o.a)};return o.normalize()};$.color.extract=function(elem,css){var c;do{c=elem.css(css).toLowerCase();if(c!=""&&c!="transparent")break;elem=elem.parent()}while(elem.length&&!$.nodeName(elem.get(0),"body"));if(c=="rgba(0, 0, 0, 0)")c="transparent";return $.color.parse(c)};$.color.parse=function(str){var res,m=$.color.make;if(res=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str))return m(parseInt(res[1],10),parseInt(res[2],10),parseInt(res[3],10));if(res=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str))return m(parseInt(res[1],10),parseInt(res[2],10),parseInt(res[3],10),parseFloat(res[4]));if(res=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str))return m(parseFloat(res[1])*2.55,parseFloat(res[2])*2.55,parseFloat(res[3])*2.55);if(res=/rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str))return m(parseFloat(res[1])*2.55,parseFloat(res[2])*2.55,parseFloat(res[3])*2.55,parseFloat(res[4]));if(res=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str))return m(parseInt(res[1],16),parseInt(res[2],16),parseInt(res[3],16));if(res=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str))return m(parseInt(res[1]+res[1],16),parseInt(res[2]+res[2],16),parseInt(res[3]+res[3],16));var name=$.trim(str).toLowerCase();if(name=="transparent")return m(255,255,255,0);else{res=lookupColors[name]||[0,0,0];return m(res[0],res[1],res[2])}};var lookupColors={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);

// the actual Flot code
(function($) {

	// Cache the prototype hasOwnProperty for faster access

	var hasOwnProperty = Object.prototype.hasOwnProperty;

    // A shim to provide 'detach' to jQuery versions prior to 1.4.  Using a DOM
    // operation produces the same effect as detach, i.e. removing the element
    // without touching its jQuery data.

    // Do not merge this into Flot 0.9, since it requires jQuery 1.4.4+.

    if (!$.fn.detach) {
        $.fn.detach = function() {
            return this.each(function() {
                if (this.parentNode) {
                    this.parentNode.removeChild( this );
                }
            });
        };
    }

	///////////////////////////////////////////////////////////////////////////
	// The Canvas object is a wrapper around an HTML5 <canvas> tag.
	//
	// @constructor
	// @param {string} cls List of classes to apply to the canvas.
	// @param {element} container Element onto which to append the canvas.
	//
	// Requiring a container is a little iffy, but unfortunately canvas
	// operations don't work unless the canvas is attached to the DOM.

	function Canvas(cls, container) {

		var element = container.children("." + cls)[0];

		if (element == null) {

			element = document.createElement("canvas");
			element.className = cls;

			$(element).css({ direction: "ltr", position: "absolute", left: 0, top: 0 })
				.appendTo(container);

			// If HTML5 Canvas isn't available, fall back to [Ex|Flash]canvas

			if (!element.getContext) {
				if (window.G_vmlCanvasManager) {
					element = window.G_vmlCanvasManager.initElement(element);
				} else {
					throw new Error("Canvas is not available. If you're using IE with a fall-back such as Excanvas, then there's either a mistake in your conditional include, or the page has no DOCTYPE and is rendering in Quirks Mode.");
				}
			}
		}

		this.element = element;

		var context = this.context = element.getContext("2d");

		// Determine the screen's ratio of physical to device-independent
		// pixels.  This is the ratio between the canvas width that the browser
		// advertises and the number of pixels actually present in that space.

		// The iPhone 4, for example, has a device-independent width of 320px,
		// but its screen is actually 640px wide.  It therefore has a pixel
		// ratio of 2, while most normal devices have a ratio of 1.

		var devicePixelRatio = window.devicePixelRatio || 1,
			backingStoreRatio =
				context.webkitBackingStorePixelRatio ||
				context.mozBackingStorePixelRatio ||
				context.msBackingStorePixelRatio ||
				context.oBackingStorePixelRatio ||
				context.backingStorePixelRatio || 1;

		this.pixelRatio = devicePixelRatio / backingStoreRatio;

		// Size the canvas to match the internal dimensions of its container

		this.resize(container.width(), container.height());

		// Collection of HTML div layers for text overlaid onto the canvas

		this.textContainer = null;
		this.text = {};

		// Cache of text fragments and metrics, so we can avoid expensively
		// re-calculating them when the plot is re-rendered in a loop.

		this._textCache = {};
	}

	// Resizes the canvas to the given dimensions.
	//
	// @param {number} width New width of the canvas, in pixels.
	// @param {number} width New height of the canvas, in pixels.

	Canvas.prototype.resize = function(width, height) {

		if (width <= 0 || height <= 0) {
			throw new Error("Invalid dimensions for plot, width = " + width + ", height = " + height);
		}

		var element = this.element,
			context = this.context,
			pixelRatio = this.pixelRatio;

		// Resize the canvas, increasing its density based on the display's
		// pixel ratio; basically giving it more pixels without increasing the
		// size of its element, to take advantage of the fact that retina
		// displays have that many more pixels in the same advertised space.

		// Resizing should reset the state (excanvas seems to be buggy though)

		if (this.width != width) {
			element.width = width * pixelRatio;
			element.style.width = width + "px";
			this.width = width;
		}

		if (this.height != height) {
			element.height = height * pixelRatio;
			element.style.height = height + "px";
			this.height = height;
		}

		// Save the context, so we can reset in case we get replotted.  The
		// restore ensure that we're really back at the initial state, and
		// should be safe even if we haven't saved the initial state yet.

		context.restore();
		context.save();

		// Scale the coordinate space to match the display density; so even though we
		// may have twice as many pixels, we still want lines and other drawing to
		// appear at the same size; the extra pixels will just make them crisper.

		context.scale(pixelRatio, pixelRatio);
	};

	// Clears the entire canvas area, not including any overlaid HTML text

	Canvas.prototype.clear = function() {
		this.context.clearRect(0, 0, this.width, this.height);
	};

	// Finishes rendering the canvas, including managing the text overlay.

	Canvas.prototype.render = function() {

		var cache = this._textCache;

		// For each text layer, add elements marked as active that haven't
		// already been rendered, and remove those that are no longer active.

		for (var layerKey in cache) {
			if (hasOwnProperty.call(cache, layerKey)) {

				var layer = this.getTextLayer(layerKey),
					layerCache = cache[layerKey];

				layer.hide();

				for (var styleKey in layerCache) {
					if (hasOwnProperty.call(layerCache, styleKey)) {
						var styleCache = layerCache[styleKey];
						for (var key in styleCache) {
							if (hasOwnProperty.call(styleCache, key)) {

								var positions = styleCache[key].positions;

								for (var i = 0, position; position = positions[i]; i++) {
									if (position.active) {
										if (!position.rendered) {
											layer.append(position.element);
											position.rendered = true;
										}
									} else {
										positions.splice(i--, 1);
										if (position.rendered) {
											position.element.detach();
										}
									}
								}

								if (positions.length == 0) {
									delete styleCache[key];
								}
							}
						}
					}
				}

				layer.show();
			}
		}
	};

	// Creates (if necessary) and returns the text overlay container.
	//
	// @param {string} classes String of space-separated CSS classes used to
	//     uniquely identify the text layer.
	// @return {object} The jQuery-wrapped text-layer div.

	Canvas.prototype.getTextLayer = function(classes) {

		var layer = this.text[classes];

		// Create the text layer if it doesn't exist

		if (layer == null) {

			// Create the text layer container, if it doesn't exist

			if (this.textContainer == null) {
				this.textContainer = $("<div class='flot-text'></div>")
					.css({
						position: "absolute",
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						'font-size': "smaller",
						color: "#545454"
					})
					.insertAfter(this.element);
			}

			layer = this.text[classes] = $("<div></div>")
				.addClass(classes)
				.css({
					position: "absolute",
					top: 0,
					left: 0,
					bottom: 0,
					right: 0
				})
				.appendTo(this.textContainer);
		}

		return layer;
	};

	// Creates (if necessary) and returns a text info object.
	//
	// The object looks like this:
	//
	// {
	//     width: Width of the text's wrapper div.
	//     height: Height of the text's wrapper div.
	//     element: The jQuery-wrapped HTML div containing the text.
	//     positions: Array of positions at which this text is drawn.
	// }
	//
	// The positions array contains objects that look like this:
	//
	// {
	//     active: Flag indicating whether the text should be visible.
	//     rendered: Flag indicating whether the text is currently visible.
	//     element: The jQuery-wrapped HTML div containing the text.
	//     x: X coordinate at which to draw the text.
	//     y: Y coordinate at which to draw the text.
	// }
	//
	// Each position after the first receives a clone of the original element.
	//
	// The idea is that that the width, height, and general 'identity' of the
	// text is constant no matter where it is placed; the placements are a
	// secondary property.
	//
	// Canvas maintains a cache of recently-used text info objects; getTextInfo
	// either returns the cached element or creates a new entry.
	//
	// @param {string} layer A string of space-separated CSS classes uniquely
	//     identifying the layer containing this text.
	// @param {string} text Text string to retrieve info for.
	// @param {(string|object)=} font Either a string of space-separated CSS
	//     classes or a font-spec object, defining the text's font and style.
	// @param {number=} angle Angle at which to rotate the text, in degrees.
	//     Angle is currently unused, it will be implemented in the future.
	// @param {number=} width Maximum width of the text before it wraps.
	// @return {object} a text info object.

	Canvas.prototype.getTextInfo = function(layer, text, font, angle, width) {

		var textStyle, layerCache, styleCache, info;

		// Cast the value to a string, in case we were given a number or such

		text = "" + text;

		// If the font is a font-spec object, generate a CSS font definition

		if (typeof font === "object") {
			textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" + font.lineHeight + "px " + font.family;
		} else {
			textStyle = font;
		}

		// Retrieve (or create) the cache for the text's layer and styles

		layerCache = this._textCache[layer];

		if (layerCache == null) {
			layerCache = this._textCache[layer] = {};
		}

		styleCache = layerCache[textStyle];

		if (styleCache == null) {
			styleCache = layerCache[textStyle] = {};
		}

		info = styleCache[text];

		// If we can't find a matching element in our cache, create a new one

		if (info == null) {

			var element = $("<div></div>").html(text)
				.css({
					position: "absolute",
					'max-width': width,
					top: -9999
				})
				.appendTo(this.getTextLayer(layer));

			if (typeof font === "object") {
				element.css({
					font: textStyle,
					color: font.color
				});
			} else if (typeof font === "string") {
				element.addClass(font);
			}

			info = styleCache[text] = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				element: element,
				positions: []
			};

			element.detach();
		}

		return info;
	};

	// Adds a text string to the canvas text overlay.
	//
	// The text isn't drawn immediately; it is marked as rendering, which will
	// result in its addition to the canvas on the next render pass.
	//
	// @param {string} layer A string of space-separated CSS classes uniquely
	//     identifying the layer containing this text.
	// @param {number} x X coordinate at which to draw the text.
	// @param {number} y Y coordinate at which to draw the text.
	// @param {string} text Text string to draw.
	// @param {(string|object)=} font Either a string of space-separated CSS
	//     classes or a font-spec object, defining the text's font and style.
	// @param {number=} angle Angle at which to rotate the text, in degrees.
	//     Angle is currently unused, it will be implemented in the future.
	// @param {number=} width Maximum width of the text before it wraps.
	// @param {string=} halign Horizontal alignment of the text; either "left",
	//     "center" or "right".
	// @param {string=} valign Vertical alignment of the text; either "top",
	//     "middle" or "bottom".

	Canvas.prototype.addText = function(layer, x, y, text, font, angle, width, halign, valign) {

		var info = this.getTextInfo(layer, text, font, angle, width),
			positions = info.positions;

		// Tweak the div's position to match the text's alignment

		if (halign == "center") {
			x -= info.width / 2;
		} else if (halign == "right") {
			x -= info.width;
		}

		if (valign == "middle") {
			y -= info.height / 2;
		} else if (valign == "bottom") {
			y -= info.height;
		}

		// Determine whether this text already exists at this position.
		// If so, mark it for inclusion in the next render pass.

		for (var i = 0, position; position = positions[i]; i++) {
			if (position.x == x && position.y == y) {
				position.active = true;
				return;
			}
		}

		// If the text doesn't exist at this position, create a new entry

		// For the very first position we'll re-use the original element,
		// while for subsequent ones we'll clone it.

		position = {
			active: true,
			rendered: false,
			element: positions.length ? info.element.clone() : info.element,
			x: x,
			y: y
		};

		positions.push(position);

		// Move the element to its final position within the container

		position.element.css({
			top: Math.round(y),
			left: Math.round(x),
			'text-align': halign	// In case the text wraps
		});
	};

	// Removes one or more text strings from the canvas text overlay.
	//
	// If no parameters are given, all text within the layer is removed.
	//
	// Note that the text is not immediately removed; it is simply marked as
	// inactive, which will result in its removal on the next render pass.
	// This avoids the performance penalty for 'clear and redraw' behavior,
	// where we potentially get rid of all text on a layer, but will likely
	// add back most or all of it later, as when redrawing axes, for example.
	//
	// @param {string} layer A string of space-separated CSS classes uniquely
	//     identifying the layer containing this text.
	// @param {number=} x X coordinate of the text.
	// @param {number=} y Y coordinate of the text.
	// @param {string=} text Text string to remove.
	// @param {(string|object)=} font Either a string of space-separated CSS
	//     classes or a font-spec object, defining the text's font and style.
	// @param {number=} angle Angle at which the text is rotated, in degrees.
	//     Angle is currently unused, it will be implemented in the future.

	Canvas.prototype.removeText = function(layer, x, y, text, font, angle) {
		if (text == null) {
			var layerCache = this._textCache[layer];
			if (layerCache != null) {
				for (var styleKey in layerCache) {
					if (hasOwnProperty.call(layerCache, styleKey)) {
						var styleCache = layerCache[styleKey];
						for (var key in styleCache) {
							if (hasOwnProperty.call(styleCache, key)) {
								var positions = styleCache[key].positions;
								for (var i = 0, position; position = positions[i]; i++) {
									position.active = false;
								}
							}
						}
					}
				}
			}
		} else {
			var positions = this.getTextInfo(layer, text, font, angle).positions;
			for (var i = 0, position; position = positions[i]; i++) {
				if (position.x == x && position.y == y) {
					position.active = false;
				}
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////
	// The top-level container for the entire plot.

    function Plot(placeholder, data_, options_, plugins) {
        // data is on the form:
        //   [ series1, series2 ... ]
        // where series is either just the data as [ [x1, y1], [x2, y2], ... ]
        // or { data: [ [x1, y1], [x2, y2], ... ], label: "some label", ... }

        var series = [],
            options = {
                // the color theme used for graphs
                colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
                legend: {
                    show: true,
                    noColumns: 1, // number of colums in legend table
                    labelFormatter: null, // fn: string -> string
                    labelBoxBorderColor: "#ccc", // border color for the little label boxes
                    container: null, // container (as jQuery object) to put legend in, null means default on top of graph
                    position: "ne", // position of default legend container within plot
                    margin: 5, // distance from grid edge to default legend container within plot
                    backgroundColor: null, // null means auto-detect
                    backgroundOpacity: 0.85, // set to 0 to avoid background
                    sorted: null    // default to no legend sorting
                },
                xaxis: {
                    show: null, // null = auto-detect, true = always, false = never
                    position: "bottom", // or "top"
                    mode: null, // null or "time"
                    font: null, // null (derived from CSS in placeholder) or object like { size: 11, lineHeight: 13, style: "italic", weight: "bold", family: "sans-serif", variant: "small-caps" }
                    color: null, // base color, labels, ticks
                    tickColor: null, // possibly different color of ticks, e.g. "rgba(0,0,0,0.15)"
                    transform: null, // null or f: number -> number to transform axis
                    inverseTransform: null, // if transform is set, this should be the inverse function
                    min: null, // min. value to show, null means set automatically
                    max: null, // max. value to show, null means set automatically
                    autoscaleMargin: null, // margin in % to add if auto-setting min/max
                    ticks: null, // either [1, 3] or [[1, "a"], 3] or (fn: axis info -> ticks) or app. number of ticks for auto-ticks
                    tickFormatter: null, // fn: number -> string
                    labelWidth: null, // size of tick labels in pixels
                    labelHeight: null,
                    reserveSpace: null, // whether to reserve space even if axis isn't shown
                    tickLength: null, // size in pixels of ticks, or "full" for whole line
                    alignTicksWithAxis: null, // axis number or null for no sync
                    tickDecimals: null, // no. of decimals, null means auto
                    tickSize: null, // number or [number, "unit"]
                    minTickSize: null // number or [number, "unit"]
                },
                yaxis: {
                    autoscaleMargin: 0.02,
                    position: "left" // or "right"
                },
                xaxes: [],
                yaxes: [],
                series: {
                    points: {
                        show: false,
                        radius: 3,
                        lineWidth: 2, // in pixels
                        fill: true,
                        fillColor: "#ffffff",
                        symbol: "circle" // or callback
                    },
                    lines: {
                        // we don't put in show: false so we can see
                        // whether lines were actively disabled
                        lineWidth: 2, // in pixels
                        fill: false,
                        fillColor: null,
                        steps: false
                        // Omit 'zero', so we can later default its value to
                        // match that of the 'fill' option.
                    },
                    bars: {
                        show: false,
                        lineWidth: 2, // in pixels
                        barWidth: 1, // in units of the x axis
                        fill: true,
                        fillColor: null,
                        align: "left", // "left", "right", or "center"
                        horizontal: false,
                        zero: true
                    },
                    shadowSize: 3,
                    highlightColor: null
                },
                grid: {
                    show: true,
                    aboveData: false,
                    color: "#545454", // primary color used for outline and labels
                    backgroundColor: null, // null for transparent, else color
                    borderColor: null, // set if different from the grid color
                    tickColor: null, // color for the ticks, e.g. "rgba(0,0,0,0.15)"
                    margin: 0, // distance from the canvas edge to the grid
                    labelMargin: 5, // in pixels
                    axisMargin: 8, // in pixels
                    borderWidth: 2, // in pixels
                    minBorderMargin: null, // in pixels, null means taken from points radius
                    markings: null, // array of ranges or fn: axes -> array of ranges
                    markingsColor: "#f4f4f4",
                    markingsLineWidth: 2,
                    // interactive stuff
                    clickable: false,
                    hoverable: false,
                    autoHighlight: true, // highlight in case mouse is near
                    mouseActiveRadius: 10 // how far the mouse can be away to activate an item
                },
                interaction: {
                    redrawOverlayInterval: 1000/60 // time between updates, -1 means in same flow
                },
                hooks: {}
            },
        surface = null,     // the canvas for the plot itself
        overlay = null,     // canvas for interactive stuff on top of plot
        eventHolder = null, // jQuery object that events should be bound to
        ctx = null, octx = null,
        xaxes = [], yaxes = [],
        plotOffset = { left: 0, right: 0, top: 0, bottom: 0},
        plotWidth = 0, plotHeight = 0,
        hooks = {
            processOptions: [],
            processRawData: [],
            processDatapoints: [],
            processOffset: [],
            drawBackground: [],
            drawSeries: [],
            draw: [],
            bindEvents: [],
            drawOverlay: [],
            shutdown: []
        },
        plot = this;

        // public functions
        plot.setData = setData;
        plot.setupGrid = setupGrid;
        plot.draw = draw;
        plot.getPlaceholder = function() { return placeholder; };
        plot.getCanvas = function() { return surface.element; };
        plot.getPlotOffset = function() { return plotOffset; };
        plot.width = function () { return plotWidth; };
        plot.height = function () { return plotHeight; };
        plot.offset = function () {
            var o = eventHolder.offset();
            o.left += plotOffset.left;
            o.top += plotOffset.top;
            return o;
        };
        plot.getData = function () { return series; };
        plot.getAxes = function () {
            var res = {}, i;
            $.each(xaxes.concat(yaxes), function (_, axis) {
                if (axis)
                    res[axis.direction + (axis.n != 1 ? axis.n : "") + "axis"] = axis;
            });
            return res;
        };
        plot.getXAxes = function () { return xaxes; };
        plot.getYAxes = function () { return yaxes; };
        plot.c2p = canvasToAxisCoords;
        plot.p2c = axisToCanvasCoords;
        plot.getOptions = function () { return options; };
        plot.highlight = highlight;
        plot.unhighlight = unhighlight;
        plot.triggerRedrawOverlay = triggerRedrawOverlay;
        plot.pointOffset = function(point) {
            return {
                left: parseInt(xaxes[axisNumber(point, "x") - 1].p2c(+point.x) + plotOffset.left, 10),
                top: parseInt(yaxes[axisNumber(point, "y") - 1].p2c(+point.y) + plotOffset.top, 10)
            };
        };
        plot.shutdown = shutdown;
        plot.destroy = function () {
            shutdown();
            placeholder.removeData("plot").empty();

            series = [];
            options = null;
            surface = null;
            overlay = null;
            eventHolder = null;
            ctx = null;
            octx = null;
            xaxes = [];
            yaxes = [];
            hooks = null;
            highlights = [];
            plot = null;
        };
        plot.resize = function () {
        	var width = placeholder.width(),
        		height = placeholder.height();
            surface.resize(width, height);
            overlay.resize(width, height);
        };

        // public attributes
        plot.hooks = hooks;

        // initialize
        initPlugins(plot);
        parseOptions(options_);
        setupCanvases();
        setData(data_);
        setupGrid();
        draw();
        bindEvents();


        function executeHooks(hook, args) {
            args = [plot].concat(args);
            for (var i = 0; i < hook.length; ++i)
                hook[i].apply(this, args);
        }

        function initPlugins() {

            // References to key classes, allowing plugins to modify them

            var classes = {
                Canvas: Canvas
            };

            for (var i = 0; i < plugins.length; ++i) {
                var p = plugins[i];
                p.init(plot, classes);
                if (p.options)
                    $.extend(true, options, p.options);
            }
        }

        function parseOptions(opts) {

            $.extend(true, options, opts);

            // $.extend merges arrays, rather than replacing them.  When less
            // colors are provided than the size of the default palette, we
            // end up with those colors plus the remaining defaults, which is
            // not expected behavior; avoid it by replacing them here.

            if (opts && opts.colors) {
            	options.colors = opts.colors;
            }

            if (options.xaxis.color == null)
                options.xaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();
            if (options.yaxis.color == null)
                options.yaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();

            if (options.xaxis.tickColor == null) // grid.tickColor for back-compatibility
                options.xaxis.tickColor = options.grid.tickColor || options.xaxis.color;
            if (options.yaxis.tickColor == null) // grid.tickColor for back-compatibility
                options.yaxis.tickColor = options.grid.tickColor || options.yaxis.color;

            if (options.grid.borderColor == null)
                options.grid.borderColor = options.grid.color;
            if (options.grid.tickColor == null)
                options.grid.tickColor = $.color.parse(options.grid.color).scale('a', 0.22).toString();

            // Fill in defaults for axis options, including any unspecified
            // font-spec fields, if a font-spec was provided.

            // If no x/y axis options were provided, create one of each anyway,
            // since the rest of the code assumes that they exist.

            var i, axisOptions, axisCount,
                fontSize = placeholder.css("font-size"),
                fontSizeDefault = fontSize ? +fontSize.replace("px", "") : 13,
                fontDefaults = {
                    style: placeholder.css("font-style"),
                    size: Math.round(0.8 * fontSizeDefault),
                    variant: placeholder.css("font-variant"),
                    weight: placeholder.css("font-weight"),
                    family: placeholder.css("font-family")
                };

            axisCount = options.xaxes.length || 1;
            for (i = 0; i < axisCount; ++i) {

                axisOptions = options.xaxes[i];
                if (axisOptions && !axisOptions.tickColor) {
                    axisOptions.tickColor = axisOptions.color;
                }

                axisOptions = $.extend(true, {}, options.xaxis, axisOptions);
                options.xaxes[i] = axisOptions;

                if (axisOptions.font) {
                    axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);
                    if (!axisOptions.font.color) {
                        axisOptions.font.color = axisOptions.color;
                    }
                    if (!axisOptions.font.lineHeight) {
                        axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
                    }
                }
            }

            axisCount = options.yaxes.length || 1;
            for (i = 0; i < axisCount; ++i) {

                axisOptions = options.yaxes[i];
                if (axisOptions && !axisOptions.tickColor) {
                    axisOptions.tickColor = axisOptions.color;
                }

                axisOptions = $.extend(true, {}, options.yaxis, axisOptions);
                options.yaxes[i] = axisOptions;

                if (axisOptions.font) {
                    axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);
                    if (!axisOptions.font.color) {
                        axisOptions.font.color = axisOptions.color;
                    }
                    if (!axisOptions.font.lineHeight) {
                        axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
                    }
                }
            }

            // backwards compatibility, to be removed in future
            if (options.xaxis.noTicks && options.xaxis.ticks == null)
                options.xaxis.ticks = options.xaxis.noTicks;
            if (options.yaxis.noTicks && options.yaxis.ticks == null)
                options.yaxis.ticks = options.yaxis.noTicks;
            if (options.x2axis) {
                options.xaxes[1] = $.extend(true, {}, options.xaxis, options.x2axis);
                options.xaxes[1].position = "top";
                // Override the inherit to allow the axis to auto-scale
                if (options.x2axis.min == null) {
                    options.xaxes[1].min = null;
                }
                if (options.x2axis.max == null) {
                    options.xaxes[1].max = null;
                }
            }
            if (options.y2axis) {
                options.yaxes[1] = $.extend(true, {}, options.yaxis, options.y2axis);
                options.yaxes[1].position = "right";
                // Override the inherit to allow the axis to auto-scale
                if (options.y2axis.min == null) {
                    options.yaxes[1].min = null;
                }
                if (options.y2axis.max == null) {
                    options.yaxes[1].max = null;
                }
            }
            if (options.grid.coloredAreas)
                options.grid.markings = options.grid.coloredAreas;
            if (options.grid.coloredAreasColor)
                options.grid.markingsColor = options.grid.coloredAreasColor;
            if (options.lines)
                $.extend(true, options.series.lines, options.lines);
            if (options.points)
                $.extend(true, options.series.points, options.points);
            if (options.bars)
                $.extend(true, options.series.bars, options.bars);
            if (options.shadowSize != null)
                options.series.shadowSize = options.shadowSize;
            if (options.highlightColor != null)
                options.series.highlightColor = options.highlightColor;

            // save options on axes for future reference
            for (i = 0; i < options.xaxes.length; ++i)
                getOrCreateAxis(xaxes, i + 1).options = options.xaxes[i];
            for (i = 0; i < options.yaxes.length; ++i)
                getOrCreateAxis(yaxes, i + 1).options = options.yaxes[i];

            // add hooks from options
            for (var n in hooks)
                if (options.hooks[n] && options.hooks[n].length)
                    hooks[n] = hooks[n].concat(options.hooks[n]);

            executeHooks(hooks.processOptions, [options]);
        }

        function setData(d) {
            series = parseData(d);
            fillInSeriesOptions();
            processData();
        }

        function parseData(d) {
            var res = [];
            for (var i = 0; i < d.length; ++i) {
                var s = $.extend(true, {}, options.series);

                if (d[i].data != null) {
                    s.data = d[i].data; // move the data instead of deep-copy
                    delete d[i].data;

                    $.extend(true, s, d[i]);

                    d[i].data = s.data;
                }
                else
                    s.data = d[i];
                res.push(s);
            }

            return res;
        }

        function axisNumber(obj, coord) {
            var a = obj[coord + "axis"];
            if (typeof a == "object") // if we got a real axis, extract number
                a = a.n;
            if (typeof a != "number")
                a = 1; // default to first axis
            return a;
        }

        function allAxes() {
            // return flat array without annoying null entries
            return $.grep(xaxes.concat(yaxes), function (a) { return a; });
        }

        function canvasToAxisCoords(pos) {
            // return an object with x/y corresponding to all used axes
            var res = {}, i, axis;
            for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i];
                if (axis && axis.used)
                    res["x" + axis.n] = axis.c2p(pos.left);
            }

            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i];
                if (axis && axis.used)
                    res["y" + axis.n] = axis.c2p(pos.top);
            }

            if (res.x1 !== undefined)
                res.x = res.x1;
            if (res.y1 !== undefined)
                res.y = res.y1;

            return res;
        }

        function axisToCanvasCoords(pos) {
            // get canvas coords from the first pair of x/y found in pos
            var res = {}, i, axis, key;

            for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i];
                if (axis && axis.used) {
                    key = "x" + axis.n;
                    if (pos[key] == null && axis.n == 1)
                        key = "x";

                    if (pos[key] != null) {
                        res.left = axis.p2c(pos[key]);
                        break;
                    }
                }
            }

            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i];
                if (axis && axis.used) {
                    key = "y" + axis.n;
                    if (pos[key] == null && axis.n == 1)
                        key = "y";

                    if (pos[key] != null) {
                        res.top = axis.p2c(pos[key]);
                        break;
                    }
                }
            }

            return res;
        }

        function getOrCreateAxis(axes, number) {
            if (!axes[number - 1])
                axes[number - 1] = {
                    n: number, // save the number for future reference
                    direction: axes == xaxes ? "x" : "y",
                    options: $.extend(true, {}, axes == xaxes ? options.xaxis : options.yaxis)
                };

            return axes[number - 1];
        }

        function fillInSeriesOptions() {

            var neededColors = series.length, maxIndex = -1, i;

            // Subtract the number of series that already have fixed colors or
            // color indexes from the number that we still need to generate.

            for (i = 0; i < series.length; ++i) {
                var sc = series[i].color;
                if (sc != null) {
                    neededColors--;
                    if (typeof sc == "number" && sc > maxIndex) {
                        maxIndex = sc;
                    }
                }
            }

            // If any of the series have fixed color indexes, then we need to
            // generate at least as many colors as the highest index.

            if (neededColors <= maxIndex) {
                neededColors = maxIndex + 1;
            }

            // Generate all the colors, using first the option colors and then
            // variations on those colors once they're exhausted.

            var c, colors = [], colorPool = options.colors,
                colorPoolSize = colorPool.length, variation = 0;

            for (i = 0; i < neededColors; i++) {

                c = $.color.parse(colorPool[i % colorPoolSize] || "#666");

                // Each time we exhaust the colors in the pool we adjust
                // a scaling factor used to produce more variations on
                // those colors. The factor alternates negative/positive
                // to produce lighter/darker colors.

                // Reset the variation after every few cycles, or else
                // it will end up producing only white or black colors.

                if (i % colorPoolSize == 0 && i) {
                    if (variation >= 0) {
                        if (variation < 0.5) {
                            variation = -variation - 0.2;
                        } else variation = 0;
                    } else variation = -variation;
                }

                colors[i] = c.scale('rgb', 1 + variation);
            }

            // Finalize the series options, filling in their colors

            var colori = 0, s;
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                // assign colors
                if (s.color == null) {
                    s.color = colors[colori].toString();
                    ++colori;
                }
                else if (typeof s.color == "number")
                    s.color = colors[s.color].toString();

                // turn on lines automatically in case nothing is set
                if (s.lines.show == null) {
                    var v, show = true;
                    for (v in s)
                        if (s[v] && s[v].show) {
                            show = false;
                            break;
                        }
                    if (show)
                        s.lines.show = true;
                }

                // If nothing was provided for lines.zero, default it to match
                // lines.fill, since areas by default should extend to zero.

                if (s.lines.zero == null) {
                    s.lines.zero = !!s.lines.fill;
                }

                // setup axes
                s.xaxis = getOrCreateAxis(xaxes, axisNumber(s, "x"));
                s.yaxis = getOrCreateAxis(yaxes, axisNumber(s, "y"));
            }
        }

        function processData() {
            var topSentry = Number.POSITIVE_INFINITY,
                bottomSentry = Number.NEGATIVE_INFINITY,
                fakeInfinity = Number.MAX_VALUE,
                i, j, k, m, length,
                s, points, ps, x, y, axis, val, f, p,
                data, format;

            function updateAxis(axis, min, max) {
                if (min < axis.datamin && min != -fakeInfinity)
                    axis.datamin = min;
                if (max > axis.datamax && max != fakeInfinity)
                    axis.datamax = max;
            }

            $.each(allAxes(), function (_, axis) {
                // init axis
                axis.datamin = topSentry;
                axis.datamax = bottomSentry;
                axis.used = false;
            });

            for (i = 0; i < series.length; ++i) {
                s = series[i];
                s.datapoints = { points: [] };

                executeHooks(hooks.processRawData, [ s, s.data, s.datapoints ]);
            }

            // first pass: clean and copy data
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                data = s.data;
                format = s.datapoints.format;

                if (!format) {
                    format = [];
                    // find out how to copy
                    format.push({ x: true, number: true, required: true });
                    format.push({ y: true, number: true, required: true });

                    if (s.bars.show || (s.lines.show && s.lines.fill)) {
                        var autoscale = !!((s.bars.show && s.bars.zero) || (s.lines.show && s.lines.zero));
                        format.push({ y: true, number: true, required: false, defaultValue: 0, autoscale: autoscale });
                        if (s.bars.horizontal) {
                            delete format[format.length - 1].y;
                            format[format.length - 1].x = true;
                        }
                    }

                    s.datapoints.format = format;
                }

                if (s.datapoints.pointsize != null)
                    continue; // already filled in

                s.datapoints.pointsize = format.length;

                ps = s.datapoints.pointsize;
                points = s.datapoints.points;

                var insertSteps = s.lines.show && s.lines.steps;
                s.xaxis.used = s.yaxis.used = true;

                for (j = k = 0; j < data.length; ++j, k += ps) {
                    p = data[j];

                    var nullify = p == null;
                    if (!nullify) {
                        for (m = 0; m < ps; ++m) {
                            val = p[m];
                            f = format[m];

                            if (f) {
                                if (f.number && val != null) {
                                    val = +val; // convert to number
                                    if (isNaN(val))
                                        val = null;
                                    else if (val == Infinity)
                                        val = fakeInfinity;
                                    else if (val == -Infinity)
                                        val = -fakeInfinity;
                                }

                                if (val == null) {
                                    if (f.required)
                                        nullify = true;

                                    if (f.defaultValue != null)
                                        val = f.defaultValue;
                                }
                            }

                            points[k + m] = val;
                        }
                    }

                    if (nullify) {
                        for (m = 0; m < ps; ++m) {
                            val = points[k + m];
                            if (val != null) {
                                f = format[m];
                                // extract min/max info
                                if (f.autoscale !== false) {
                                    if (f.x) {
                                        updateAxis(s.xaxis, val, val);
                                    }
                                    if (f.y) {
                                        updateAxis(s.yaxis, val, val);
                                    }
                                }
                            }
                            points[k + m] = null;
                        }
                    }
                    else {
                        // a little bit of line specific stuff that
                        // perhaps shouldn't be here, but lacking
                        // better means...
                        if (insertSteps && k > 0
                            && points[k - ps] != null
                            && points[k - ps] != points[k]
                            && points[k - ps + 1] != points[k + 1]) {
                            // copy the point to make room for a middle point
                            for (m = 0; m < ps; ++m)
                                points[k + ps + m] = points[k + m];

                            // middle point has same y
                            points[k + 1] = points[k - ps + 1];

                            // we've added a point, better reflect that
                            k += ps;
                        }
                    }
                }
            }

            // give the hooks a chance to run
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                executeHooks(hooks.processDatapoints, [ s, s.datapoints]);
            }

            // second pass: find datamax/datamin for auto-scaling
            for (i = 0; i < series.length; ++i) {
                s = series[i];
                points = s.datapoints.points;
                ps = s.datapoints.pointsize;
                format = s.datapoints.format;

                var xmin = topSentry, ymin = topSentry,
                    xmax = bottomSentry, ymax = bottomSentry;

                for (j = 0; j < points.length; j += ps) {
                    if (points[j] == null)
                        continue;

                    for (m = 0; m < ps; ++m) {
                        val = points[j + m];
                        f = format[m];
                        if (!f || f.autoscale === false || val == fakeInfinity || val == -fakeInfinity)
                            continue;

                        if (f.x) {
                            if (val < xmin)
                                xmin = val;
                            if (val > xmax)
                                xmax = val;
                        }
                        if (f.y) {
                            if (val < ymin)
                                ymin = val;
                            if (val > ymax)
                                ymax = val;
                        }
                    }
                }

                if (s.bars.show) {
                    // make sure we got room for the bar on the dancing floor
                    var delta;

                    switch (s.bars.align) {
                        case "left":
                            delta = 0;
                            break;
                        case "right":
                            delta = -s.bars.barWidth;
                            break;
                        default:
                            delta = -s.bars.barWidth / 2;
                    }

                    if (s.bars.horizontal) {
                        ymin += delta;
                        ymax += delta + s.bars.barWidth;
                    }
                    else {
                        xmin += delta;
                        xmax += delta + s.bars.barWidth;
                    }
                }

                updateAxis(s.xaxis, xmin, xmax);
                updateAxis(s.yaxis, ymin, ymax);
            }

            $.each(allAxes(), function (_, axis) {
                if (axis.datamin == topSentry)
                    axis.datamin = null;
                if (axis.datamax == bottomSentry)
                    axis.datamax = null;
            });
        }

        function setupCanvases() {

            // Make sure the placeholder is clear of everything except canvases
            // from a previous plot in this container that we'll try to re-use.

            placeholder.css("padding", 0) // padding messes up the positioning
                .children().filter(function(){
                    return !$(this).hasClass("flot-overlay") && !$(this).hasClass('flot-base');
                }).remove();

            if (placeholder.css("position") == 'static')
                placeholder.css("position", "relative"); // for positioning labels and overlay

            surface = new Canvas("flot-base", placeholder);
            overlay = new Canvas("flot-overlay", placeholder); // overlay canvas for interactive features

            ctx = surface.context;
            octx = overlay.context;

            // define which element we're listening for events on
            eventHolder = $(overlay.element).unbind();

            // If we're re-using a plot object, shut down the old one

            var existing = placeholder.data("plot");

            if (existing) {
                existing.shutdown();
                overlay.clear();
            }

            // save in case we get replotted
            placeholder.data("plot", plot);
        }

        function bindEvents() {
            // bind events
            if (options.grid.hoverable) {
                eventHolder.mousemove(onMouseMove);

                // Use bind, rather than .mouseleave, because we officially
                // still support jQuery 1.2.6, which doesn't define a shortcut
                // for mouseenter or mouseleave.  This was a bug/oversight that
                // was fixed somewhere around 1.3.x.  We can return to using
                // .mouseleave when we drop support for 1.2.6.

                eventHolder.bind("mouseleave", onMouseLeave);
            }

            if (options.grid.clickable)
                eventHolder.click(onClick);

            executeHooks(hooks.bindEvents, [eventHolder]);
        }

        function shutdown() {
            if (redrawTimeout)
                clearTimeout(redrawTimeout);

            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mouseleave", onMouseLeave);
            eventHolder.unbind("click", onClick);

            executeHooks(hooks.shutdown, [eventHolder]);
        }

        function setTransformationHelpers(axis) {
            // set helper functions on the axis, assumes plot area
            // has been computed already

            function identity(x) { return x; }

            var s, m, t = axis.options.transform || identity,
                it = axis.options.inverseTransform;

            // precompute how much the axis is scaling a point
            // in canvas space
            if (axis.direction == "x") {
                s = axis.scale = plotWidth / Math.abs(t(axis.max) - t(axis.min));
                m = Math.min(t(axis.max), t(axis.min));
            }
            else {
                s = axis.scale = plotHeight / Math.abs(t(axis.max) - t(axis.min));
                s = -s;
                m = Math.max(t(axis.max), t(axis.min));
            }

            // data point to canvas coordinate
            if (t == identity) // slight optimization
                axis.p2c = function (p) { return (p - m) * s; };
            else
                axis.p2c = function (p) { return (t(p) - m) * s; };
            // canvas coordinate to data point
            if (!it)
                axis.c2p = function (c) { return m + c / s; };
            else
                axis.c2p = function (c) { return it(m + c / s); };
        }

        function measureTickLabels(axis) {

            var opts = axis.options,
                ticks = axis.ticks || [],
                labelWidth = opts.labelWidth || 0,
                labelHeight = opts.labelHeight || 0,
                maxWidth = labelWidth || (axis.direction == "x" ? Math.floor(surface.width / (ticks.length || 1)) : null),
                legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
                layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
                font = opts.font || "flot-tick-label tickLabel";

            for (var i = 0; i < ticks.length; ++i) {

                var t = ticks[i];

                if (!t.label)
                    continue;

                var info = surface.getTextInfo(layer, t.label, font, null, maxWidth);

                labelWidth = Math.max(labelWidth, info.width);
                labelHeight = Math.max(labelHeight, info.height);
            }

            axis.labelWidth = opts.labelWidth || labelWidth;
            axis.labelHeight = opts.labelHeight || labelHeight;
        }

        function allocateAxisBoxFirstPhase(axis) {
            // find the bounding box of the axis by looking at label
            // widths/heights and ticks, make room by diminishing the
            // plotOffset; this first phase only looks at one
            // dimension per axis, the other dimension depends on the
            // other axes so will have to wait

            var lw = axis.labelWidth,
                lh = axis.labelHeight,
                pos = axis.options.position,
                isXAxis = axis.direction === "x",
                tickLength = axis.options.tickLength,
                axisMargin = options.grid.axisMargin,
                padding = options.grid.labelMargin,
                innermost = true,
                outermost = true,
                first = true,
                found = false;

            // Determine the axis's position in its direction and on its side

            $.each(isXAxis ? xaxes : yaxes, function(i, a) {
                if (a && (a.show || a.reserveSpace)) {
                    if (a === axis) {
                        found = true;
                    } else if (a.options.position === pos) {
                        if (found) {
                            outermost = false;
                        } else {
                            innermost = false;
                        }
                    }
                    if (!found) {
                        first = false;
                    }
                }
            });

            // The outermost axis on each side has no margin

            if (outermost) {
                axisMargin = 0;
            }

            // The ticks for the first axis in each direction stretch across

            if (tickLength == null) {
                tickLength = first ? "full" : 5;
            }

            if (!isNaN(+tickLength))
                padding += +tickLength;

            if (isXAxis) {
                lh += padding;

                if (pos == "bottom") {
                    plotOffset.bottom += lh + axisMargin;
                    axis.box = { top: surface.height - plotOffset.bottom, height: lh };
                }
                else {
                    axis.box = { top: plotOffset.top + axisMargin, height: lh };
                    plotOffset.top += lh + axisMargin;
                }
            }
            else {
                lw += padding;

                if (pos == "left") {
                    axis.box = { left: plotOffset.left + axisMargin, width: lw };
                    plotOffset.left += lw + axisMargin;
                }
                else {
                    plotOffset.right += lw + axisMargin;
                    axis.box = { left: surface.width - plotOffset.right, width: lw };
                }
            }

             // save for future reference
            axis.position = pos;
            axis.tickLength = tickLength;
            axis.box.padding = padding;
            axis.innermost = innermost;
        }

        function allocateAxisBoxSecondPhase(axis) {
            // now that all axis boxes have been placed in one
            // dimension, we can set the remaining dimension coordinates
            if (axis.direction == "x") {
                axis.box.left = plotOffset.left - axis.labelWidth / 2;
                axis.box.width = surface.width - plotOffset.left - plotOffset.right + axis.labelWidth;
            }
            else {
                axis.box.top = plotOffset.top - axis.labelHeight / 2;
                axis.box.height = surface.height - plotOffset.bottom - plotOffset.top + axis.labelHeight;
            }
        }

        function adjustLayoutForThingsStickingOut() {
            // possibly adjust plot offset to ensure everything stays
            // inside the canvas and isn't clipped off

            var minMargin = options.grid.minBorderMargin,
                axis, i;

            // check stuff from the plot (FIXME: this should just read
            // a value from the series, otherwise it's impossible to
            // customize)
            if (minMargin == null) {
                minMargin = 0;
                for (i = 0; i < series.length; ++i)
                    minMargin = Math.max(minMargin, 2 * (series[i].points.radius + series[i].points.lineWidth/2));
            }

            var margins = {
                left: minMargin,
                right: minMargin,
                top: minMargin,
                bottom: minMargin
            };

            // check axis labels, note we don't check the actual
            // labels but instead use the overall width/height to not
            // jump as much around with replots
            $.each(allAxes(), function (_, axis) {
                if (axis.reserveSpace && axis.ticks && axis.ticks.length) {
                    if (axis.direction === "x") {
                        margins.left = Math.max(margins.left, axis.labelWidth / 2);
                        margins.right = Math.max(margins.right, axis.labelWidth / 2);
                    } else {
                        margins.bottom = Math.max(margins.bottom, axis.labelHeight / 2);
                        margins.top = Math.max(margins.top, axis.labelHeight / 2);
                    }
                }
            });

            plotOffset.left = Math.ceil(Math.max(margins.left, plotOffset.left));
            plotOffset.right = Math.ceil(Math.max(margins.right, plotOffset.right));
            plotOffset.top = Math.ceil(Math.max(margins.top, plotOffset.top));
            plotOffset.bottom = Math.ceil(Math.max(margins.bottom, plotOffset.bottom));
        }

        function setupGrid() {
            var i, axes = allAxes(), showGrid = options.grid.show;

            // Initialize the plot's offset from the edge of the canvas

            for (var a in plotOffset) {
                var margin = options.grid.margin || 0;
                plotOffset[a] = typeof margin == "number" ? margin : margin[a] || 0;
            }

            executeHooks(hooks.processOffset, [plotOffset]);

            // If the grid is visible, add its border width to the offset

            for (var a in plotOffset) {
                if(typeof(options.grid.borderWidth) == "object") {
                    plotOffset[a] += showGrid ? options.grid.borderWidth[a] : 0;
                }
                else {
                    plotOffset[a] += showGrid ? options.grid.borderWidth : 0;
                }
            }

            $.each(axes, function (_, axis) {
                var axisOpts = axis.options;
                axis.show = axisOpts.show == null ? axis.used : axisOpts.show;
                axis.reserveSpace = axisOpts.reserveSpace == null ? axis.show : axisOpts.reserveSpace;
                setRange(axis);
            });

            if (showGrid) {

                var allocatedAxes = $.grep(axes, function (axis) {
                    return axis.show || axis.reserveSpace;
                });

                $.each(allocatedAxes, function (_, axis) {
                    // make the ticks
                    setupTickGeneration(axis);
                    setTicks(axis);
                    snapRangeToTicks(axis, axis.ticks);
                    // find labelWidth/Height for axis
                    measureTickLabels(axis);
                });

                // with all dimensions calculated, we can compute the
                // axis bounding boxes, start from the outside
                // (reverse order)
                for (i = allocatedAxes.length - 1; i >= 0; --i)
                    allocateAxisBoxFirstPhase(allocatedAxes[i]);

                // make sure we've got enough space for things that
                // might stick out
                adjustLayoutForThingsStickingOut();

                $.each(allocatedAxes, function (_, axis) {
                    allocateAxisBoxSecondPhase(axis);
                });
            }

            plotWidth = surface.width - plotOffset.left - plotOffset.right;
            plotHeight = surface.height - plotOffset.bottom - plotOffset.top;

            // now we got the proper plot dimensions, we can compute the scaling
            $.each(axes, function (_, axis) {
                setTransformationHelpers(axis);
            });

            if (showGrid) {
                drawAxisLabels();
            }

            insertLegend();
        }

        function setRange(axis) {
            var opts = axis.options,
                min = +(opts.min != null ? opts.min : axis.datamin),
                max = +(opts.max != null ? opts.max : axis.datamax),
                delta = max - min;

            if (delta == 0.0) {
                // degenerate case
                var widen = max == 0 ? 1 : 0.01;

                if (opts.min == null)
                    min -= widen;
                // always widen max if we couldn't widen min to ensure we
                // don't fall into min == max which doesn't work
                if (opts.max == null || opts.min != null)
                    max += widen;
            }
            else {
                // consider autoscaling
                var margin = opts.autoscaleMargin;
                if (margin != null) {
                    if (opts.min == null) {
                        min -= delta * margin;
                        // make sure we don't go below zero if all values
                        // are positive
                        if (min < 0 && axis.datamin != null && axis.datamin >= 0)
                            min = 0;
                    }
                    if (opts.max == null) {
                        max += delta * margin;
                        if (max > 0 && axis.datamax != null && axis.datamax <= 0)
                            max = 0;
                    }
                }
            }
            axis.min = min;
            axis.max = max;
        }

        function setupTickGeneration(axis) {
            var opts = axis.options;

            // estimate number of ticks
            var noTicks;
            if (typeof opts.ticks == "number" && opts.ticks > 0)
                noTicks = opts.ticks;
            else
                // heuristic based on the model a*sqrt(x) fitted to
                // some data points that seemed reasonable
                noTicks = 0.3 * Math.sqrt(axis.direction == "x" ? surface.width : surface.height);

            var delta = (axis.max - axis.min) / noTicks,
                dec = -Math.floor(Math.log(delta) / Math.LN10),
                maxDec = opts.tickDecimals;

            if (maxDec != null && dec > maxDec) {
                dec = maxDec;
            }

            var magn = Math.pow(10, -dec),
                norm = delta / magn, // norm is between 1.0 and 10.0
                size;

            if (norm < 1.5) {
                size = 1;
            } else if (norm < 3) {
                size = 2;
                // special case for 2.5, requires an extra decimal
                if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) {
                    size = 2.5;
                    ++dec;
                }
            } else if (norm < 7.5) {
                size = 5;
            } else {
                size = 10;
            }

            size *= magn;

            if (opts.minTickSize != null && size < opts.minTickSize) {
                size = opts.minTickSize;
            }

            axis.delta = delta;
            axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec);
            axis.tickSize = opts.tickSize || size;

            // Time mode was moved to a plug-in in 0.8, and since so many people use it
            // we'll add an especially friendly reminder to make sure they included it.

            if (opts.mode == "time" && !axis.tickGenerator) {
                throw new Error("Time mode requires the flot.time plugin.");
            }

            // Flot supports base-10 axes; any other mode else is handled by a plug-in,
            // like flot.time.js.

            if (!axis.tickGenerator) {

                axis.tickGenerator = function (axis) {

                    var ticks = [],
                        start = floorInBase(axis.min, axis.tickSize),
                        i = 0,
                        v = Number.NaN,
                        prev;

                    do {
                        prev = v;
                        v = start + i * axis.tickSize;
                        ticks.push(v);
                        ++i;
                    } while (v < axis.max && v != prev);
                    return ticks;
                };

				axis.tickFormatter = function (value, axis) {

					var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
					var formatted = "" + Math.round(value * factor) / factor;

					// If tickDecimals was specified, ensure that we have exactly that
					// much precision; otherwise default to the value's own precision.

					if (axis.tickDecimals != null) {
						var decimal = formatted.indexOf(".");
						var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
						if (precision < axis.tickDecimals) {
							return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
						}
					}

                    return formatted;
                };
            }

            if ($.isFunction(opts.tickFormatter))
                axis.tickFormatter = function (v, axis) { return "" + opts.tickFormatter(v, axis); };

            if (opts.alignTicksWithAxis != null) {
                var otherAxis = (axis.direction == "x" ? xaxes : yaxes)[opts.alignTicksWithAxis - 1];
                if (otherAxis && otherAxis.used && otherAxis != axis) {
                    // consider snapping min/max to outermost nice ticks
                    var niceTicks = axis.tickGenerator(axis);
                    if (niceTicks.length > 0) {
                        if (opts.min == null)
                            axis.min = Math.min(axis.min, niceTicks[0]);
                        if (opts.max == null && niceTicks.length > 1)
                            axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1]);
                    }

                    axis.tickGenerator = function (axis) {
                        // copy ticks, scaled to this axis
                        var ticks = [], v, i;
                        for (i = 0; i < otherAxis.ticks.length; ++i) {
                            v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min);
                            v = axis.min + v * (axis.max - axis.min);
                            ticks.push(v);
                        }
                        return ticks;
                    };

                    // we might need an extra decimal since forced
                    // ticks don't necessarily fit naturally
                    if (!axis.mode && opts.tickDecimals == null) {
                        var extraDec = Math.max(0, -Math.floor(Math.log(axis.delta) / Math.LN10) + 1),
                            ts = axis.tickGenerator(axis);

                        // only proceed if the tick interval rounded
                        // with an extra decimal doesn't give us a
                        // zero at end
                        if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec))))
                            axis.tickDecimals = extraDec;
                    }
                }
            }
        }

        function setTicks(axis) {
            var oticks = axis.options.ticks, ticks = [];
            if (oticks == null || (typeof oticks == "number" && oticks > 0))
                ticks = axis.tickGenerator(axis);
            else if (oticks) {
                if ($.isFunction(oticks))
                    // generate the ticks
                    ticks = oticks(axis);
                else
                    ticks = oticks;
            }

            // clean up/labelify the supplied ticks, copy them over
            var i, v;
            axis.ticks = [];
            for (i = 0; i < ticks.length; ++i) {
                var label = null;
                var t = ticks[i];
                if (typeof t == "object") {
                    v = +t[0];
                    if (t.length > 1)
                        label = t[1];
                }
                else
                    v = +t;
                if (label == null)
                    label = axis.tickFormatter(v, axis);
                if (!isNaN(v))
                    axis.ticks.push({ v: v, label: label });
            }
        }

        function snapRangeToTicks(axis, ticks) {
            if (axis.options.autoscaleMargin && ticks.length > 0) {
                // snap to ticks
                if (axis.options.min == null)
                    axis.min = Math.min(axis.min, ticks[0].v);
                if (axis.options.max == null && ticks.length > 1)
                    axis.max = Math.max(axis.max, ticks[ticks.length - 1].v);
            }
        }

        function draw() {

            surface.clear();

            executeHooks(hooks.drawBackground, [ctx]);

            var grid = options.grid;

            // draw background, if any
            if (grid.show && grid.backgroundColor)
                drawBackground();

            if (grid.show && !grid.aboveData) {
                drawGrid();
            }

            for (var i = 0; i < series.length; ++i) {
                executeHooks(hooks.drawSeries, [ctx, series[i]]);
                drawSeries(series[i]);
            }

            executeHooks(hooks.draw, [ctx]);

            if (grid.show && grid.aboveData) {
                drawGrid();
            }

            surface.render();

            // A draw implies that either the axes or data have changed, so we
            // should probably update the overlay highlights as well.

            triggerRedrawOverlay();
        }

        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = allAxes();

            for (var i = 0; i < axes.length; ++i) {
                axis = axes[i];
                if (axis.direction == coord) {
                    key = coord + axis.n + "axis";
                    if (!ranges[key] && axis.n == 1)
                        key = coord + "axis"; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord == "x" ? xaxes[0] : yaxes[0];
                from = ranges[coord + "1"];
                to = ranges[coord + "2"];
            }

            // auto-reverse as an added bonus
            if (from != null && to != null && from > to) {
                var tmp = from;
                from = to;
                to = tmp;
            }

            return { from: from, to: to, axis: axis };
        }

        function drawBackground() {
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, plotHeight, 0, "rgba(255, 255, 255, 0)");
            ctx.fillRect(0, 0, plotWidth, plotHeight);
            ctx.restore();
        }

        function drawGrid() {
            var i, axes, bw, bc;

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // draw markings
            var markings = options.grid.markings;
            if (markings) {
                if ($.isFunction(markings)) {
                    axes = plot.getAxes();
                    // xmin etc. is backwards compatibility, to be
                    // removed in the future
                    axes.xmin = axes.xaxis.min;
                    axes.xmax = axes.xaxis.max;
                    axes.ymin = axes.yaxis.min;
                    axes.ymax = axes.yaxis.max;

                    markings = markings(axes);
                }

                for (i = 0; i < markings.length; ++i) {
                    var m = markings[i],
                        xrange = extractRange(m, "x"),
                        yrange = extractRange(m, "y");

                    // fill in missing
                    if (xrange.from == null)
                        xrange.from = xrange.axis.min;
                    if (xrange.to == null)
                        xrange.to = xrange.axis.max;
                    if (yrange.from == null)
                        yrange.from = yrange.axis.min;
                    if (yrange.to == null)
                        yrange.to = yrange.axis.max;

                    // clip
                    if (xrange.to < xrange.axis.min || xrange.from > xrange.axis.max ||
                        yrange.to < yrange.axis.min || yrange.from > yrange.axis.max)
                        continue;

                    xrange.from = Math.max(xrange.from, xrange.axis.min);
                    xrange.to = Math.min(xrange.to, xrange.axis.max);
                    yrange.from = Math.max(yrange.from, yrange.axis.min);
                    yrange.to = Math.min(yrange.to, yrange.axis.max);

                    var xequal = xrange.from === xrange.to,
                        yequal = yrange.from === yrange.to;

                    if (xequal && yequal) {
                        continue;
                    }

                    // then draw
                    xrange.from = Math.floor(xrange.axis.p2c(xrange.from));
                    xrange.to = Math.floor(xrange.axis.p2c(xrange.to));
                    yrange.from = Math.floor(yrange.axis.p2c(yrange.from));
                    yrange.to = Math.floor(yrange.axis.p2c(yrange.to));

                    if (xequal || yequal) {
                        var lineWidth = m.lineWidth || options.grid.markingsLineWidth,
                            subPixel = lineWidth % 2 ? 0.5 : 0;
                        ctx.beginPath();
                        ctx.strokeStyle = m.color || options.grid.markingsColor;
                        ctx.lineWidth = lineWidth;
                        if (xequal) {
                            ctx.moveTo(xrange.to + subPixel, yrange.from);
                            ctx.lineTo(xrange.to + subPixel, yrange.to);
                        } else {
                            ctx.moveTo(xrange.from, yrange.to + subPixel);
                            ctx.lineTo(xrange.to, yrange.to + subPixel);                            
                        }
                        ctx.stroke();
                    } else {
                        ctx.fillStyle = m.color || options.grid.markingsColor;
                        ctx.fillRect(xrange.from, yrange.to,
                                     xrange.to - xrange.from,
                                     yrange.from - yrange.to);
                    }
                }
            }

            // draw the ticks
            axes = allAxes();
            bw = options.grid.borderWidth;

            for (var j = 0; j < axes.length; ++j) {
                var axis = axes[j], box = axis.box,
                    t = axis.tickLength, x, y, xoff, yoff;
                if (!axis.show || axis.ticks.length == 0)
                    continue;

                ctx.lineWidth = 1;

                // find the edges
                if (axis.direction == "x") {
                    x = 0;
                    if (t == "full")
                        y = (axis.position == "top" ? 0 : plotHeight);
                    else
                        y = box.top - plotOffset.top + (axis.position == "top" ? box.height : 0);
                }
                else {
                    y = 0;
                    if (t == "full")
                        x = (axis.position == "left" ? 0 : plotWidth);
                    else
                        x = box.left - plotOffset.left + (axis.position == "left" ? box.width : 0);
                }

                // draw tick bar
                if (!axis.innermost) {
                    ctx.strokeStyle = axis.options.color;
                    ctx.beginPath();
                    xoff = yoff = 0;
                    if (axis.direction == "x")
                        xoff = plotWidth + 1;
                    else
                        yoff = plotHeight + 1;

                    if (ctx.lineWidth == 1) {
                        if (axis.direction == "x") {
                            y = Math.floor(y) + 0.5;
                        } else {
                            x = Math.floor(x) + 0.5;
                        }
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + xoff, y + yoff);
                    ctx.stroke();
                }

                // draw ticks

                ctx.strokeStyle = axis.options.tickColor;

                ctx.beginPath();
                for (i = 0; i < axis.ticks.length; ++i) {
                    var v = axis.ticks[i].v;

                    xoff = yoff = 0;

                    if (isNaN(v) || v < axis.min || v > axis.max
                        // skip those lying on the axes if we got a border
                        || (t == "full"
                            && ((typeof bw == "object" && bw[axis.position] > 0) || bw > 0)
                            && (v == axis.min || v == axis.max)))
                        continue;

                    if (axis.direction == "x") {
                        x = axis.p2c(v);
                        yoff = t == "full" ? -plotHeight : t;

                        if (axis.position == "top")
                            yoff = -yoff;
                    }
                    else {
                        y = axis.p2c(v);
                        xoff = t == "full" ? -plotWidth : t;

                        if (axis.position == "left")
                            xoff = -xoff;
                    }

                    if (ctx.lineWidth == 1) {
                        if (axis.direction == "x")
                            x = Math.floor(x) + 0.5;
                        else
                            y = Math.floor(y) + 0.5;
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + xoff, y + yoff);
                }

                ctx.stroke();
            }


            // draw border
            if (bw) {
                // If either borderWidth or borderColor is an object, then draw the border
                // line by line instead of as one rectangle
                bc = options.grid.borderColor;
                if(typeof bw == "object" || typeof bc == "object") {
                    if (typeof bw !== "object") {
                        bw = {top: bw, right: bw, bottom: bw, left: bw};
                    }
                    if (typeof bc !== "object") {
                        bc = {top: bc, right: bc, bottom: bc, left: bc};
                    }

                    if (bw.top > 0) {
                        ctx.strokeStyle = bc.top;
                        ctx.lineWidth = bw.top;
                        ctx.beginPath();
                        ctx.moveTo(0 - bw.left, 0 - bw.top/2);
                        ctx.lineTo(plotWidth, 0 - bw.top/2);
                        ctx.stroke();
                    }

                    if (bw.right > 0) {
                        ctx.strokeStyle = bc.right;
                        ctx.lineWidth = bw.right;
                        ctx.beginPath();
                        ctx.moveTo(plotWidth + bw.right / 2, 0 - bw.top);
                        ctx.lineTo(plotWidth + bw.right / 2, plotHeight);
                        ctx.stroke();
                    }

                    if (bw.bottom > 0) {
                        ctx.strokeStyle = bc.bottom;
                        ctx.lineWidth = bw.bottom;
                        ctx.beginPath();
                        ctx.moveTo(plotWidth + bw.right, plotHeight + bw.bottom / 2);
                        ctx.lineTo(0, plotHeight + bw.bottom / 2);
                        ctx.stroke();
                    }

                    if (bw.left > 0) {
                        ctx.strokeStyle = bc.left;
                        ctx.lineWidth = bw.left;
                        ctx.beginPath();
                        ctx.moveTo(0 - bw.left/2, plotHeight + bw.bottom);
                        ctx.lineTo(0- bw.left/2, 0);
                        ctx.stroke();
                    }
                }
                else {
                    ctx.lineWidth = bw;
                    ctx.strokeStyle = options.grid.borderColor;
                    ctx.strokeRect(-bw/2, -bw/2, plotWidth + bw, plotHeight + bw);
                }
            }

            ctx.restore();
        }

        function drawAxisLabels() {

            $.each(allAxes(), function (_, axis) {
                var box = axis.box,
                    legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
                    layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
                    font = axis.options.font || "flot-tick-label tickLabel",
                    tick, x, y, halign, valign;

                // Remove text before checking for axis.show and ticks.length;
                // otherwise plugins, like flot-tickrotor, that draw their own
                // tick labels will end up with both theirs and the defaults.

                surface.removeText(layer);

                if (!axis.show || axis.ticks.length == 0)
                    return;

                for (var i = 0; i < axis.ticks.length; ++i) {

                    tick = axis.ticks[i];
                    if (!tick.label || tick.v < axis.min || tick.v > axis.max)
                        continue;

                    if (axis.direction == "x") {
                        halign = "center";
                        x = plotOffset.left + axis.p2c(tick.v);
                        if (axis.position == "bottom") {
                            y = box.top + box.padding;
                        } else {
                            y = box.top + box.height - box.padding;
                            valign = "bottom";
                        }
                    } else {
                        valign = "middle";
                        y = plotOffset.top + axis.p2c(tick.v);
                        if (axis.position == "left") {
                            x = box.left + box.width - box.padding;
                            halign = "right";
                        } else {
                            x = box.left + box.padding;
                        }
                    }

                    surface.addText(layer, x, y, tick.label, font, null, null, halign, valign);
                }
            });
        }

        function drawSeries(series) {
            if (series.lines.show)
                drawSeriesLines(series);
            if (series.bars.show)
                drawSeriesBars(series);
            if (series.points.show)
                drawSeriesPoints(series);
        }

        function drawSeriesLines(series) {
            function plotLine(datapoints, xoffset, yoffset, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    prevx = null, prevy = null;

                ctx.beginPath();
                for (var i = ps; i < points.length; i += ps) {
                    var x1 = points[i - ps], y1 = points[i - ps + 1],
                        x2 = points[i], y2 = points[i + 1];

                    if (x1 == null || x2 == null)
                        continue;

                    // clip with ymin
                    if (y1 <= y2 && y1 < axisy.min) {
                        if (y2 < axisy.min)
                            continue;   // line segment is outside
                        // compute new intersection point
                        x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.min;
                    }
                    else if (y2 <= y1 && y2 < axisy.min) {
                        if (y1 < axisy.min)
                            continue;
                        x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.min;
                    }

                    // clip with ymax
                    if (y1 >= y2 && y1 > axisy.max) {
                        if (y2 > axisy.max)
                            continue;
                        x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.max;
                    }
                    else if (y2 >= y1 && y2 > axisy.max) {
                        if (y1 > axisy.max)
                            continue;
                        x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.max;
                    }

                    // clip with xmin
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue;
                        y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.min;
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue;
                        y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.min;
                    }

                    // clip with xmax
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue;
                        y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.max;
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue;
                        y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.max;
                    }

                    if (x1 != prevx || y1 != prevy)
                        ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);

                    prevx = x2;
                    prevy = y2;
                    ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
                }
                ctx.stroke();
            }

            function plotLineArea(datapoints, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    bottom = Math.min(Math.max(0, axisy.min), axisy.max),
                    i = 0, top, areaOpen = false,
                    ypos = 1, segmentStart = 0, segmentEnd = 0;

                // we process each segment in two turns, first forward
                // direction to sketch out top, then once we hit the
                // end we go backwards to sketch the bottom
                while (true) {
                    if (ps > 0 && i > points.length + ps)
                        break;

                    i += ps; // ps is negative if going backwards

                    var x1 = points[i - ps],
                        y1 = points[i - ps + ypos],
                        x2 = points[i], y2 = points[i + ypos];

                    if (areaOpen) {
                        if (ps > 0 && x1 != null && x2 == null) {
                            // at turning point
                            segmentEnd = i;
                            ps = -ps;
                            ypos = 2;
                            continue;
                        }

                        if (ps < 0 && i == segmentStart + ps) {
                            // done with the reverse sweep
                            ctx.fill();
                            areaOpen = false;
                            ps = -ps;
                            ypos = 1;
                            i = segmentStart = segmentEnd + ps;
                            continue;
                        }
                    }

                    if (x1 == null || x2 == null)
                        continue;

                    // clip x values

                    // clip with xmin
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue;
                        y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.min;
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue;
                        y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.min;
                    }

                    // clip with xmax
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue;
                        y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.max;
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue;
                        y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.max;
                    }

                    if (!areaOpen) {
                        // open area
                        ctx.beginPath();
                        ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
                        areaOpen = true;
                    }

                    // now first check the case where both is outside
                    if (y1 >= axisy.max && y2 >= axisy.max) {
                        ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
                        continue;
                    }
                    else if (y1 <= axisy.min && y2 <= axisy.min) {
                        ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
                        continue;
                    }

                    // else it's a bit more complicated, there might
                    // be a flat maxed out rectangle first, then a
                    // triangular cutout or reverse; to find these
                    // keep track of the current x values
                    var x1old = x1, x2old = x2;

                    // clip the y values, without shortcutting, we
                    // go through all cases in turn

                    // clip with ymin
                    if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) {
                        x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.min;
                    }
                    else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) {
                        x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.min;
                    }

                    // clip with ymax
                    if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) {
                        x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.max;
                    }
                    else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) {
                        x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.max;
                    }

                    // if the x value was changed we got a rectangle
                    // to fill
                    if (x1 != x1old) {
                        ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1));
                        // it goes to (x1, y1), but we fill that below
                    }

                    // fill triangular section, this sometimes result
                    // in redundant points if (x1, y1) hasn't changed
                    // from previous line to, but we just ignore that
                    ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
                    ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));

                    // fill the other rectangle if it's there
                    if (x2 != x2old) {
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
                        ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2));
                    }
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            ctx.lineJoin = "round";

            var lw = series.lines.lineWidth,
                sw = series.shadowSize;
            // FIXME: consider another form of shadow when filling is turned on
            if (lw > 0 && sw > 0) {
                // draw shadow as a thick and thin line with transparency
                ctx.lineWidth = sw;
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                // position shadow at angle from the mid of line
                var angle = Math.PI/18;
                plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/2), Math.cos(angle) * (lw/2 + sw/2), series.xaxis, series.yaxis);
                ctx.lineWidth = sw/2;
                plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/4), Math.cos(angle) * (lw/2 + sw/4), series.xaxis, series.yaxis);
            }

            ctx.lineWidth = lw;
            ctx.strokeStyle = series.color;
            var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight);
            if (fillStyle) {
                ctx.fillStyle = fillStyle;
                plotLineArea(series.datapoints, series.xaxis, series.yaxis);
            }

            if (lw > 0)
                plotLine(series.datapoints, 0, 0, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function drawSeriesPoints(series) {
            function plotPoints(datapoints, radius, fillStyle, offset, shadow, axisx, axisy, symbol) {
                var points = datapoints.points, ps = datapoints.pointsize;

                for (var i = 0; i < points.length; i += ps) {
                    var x = points[i], y = points[i + 1];
                    if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                        continue;

                    ctx.beginPath();
                    x = axisx.p2c(x);
                    y = axisy.p2c(y) + offset;
                    if (symbol == "circle")
                        ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);
                    else
                        symbol(ctx, x, y, radius, shadow);
                    ctx.closePath();

                    if (fillStyle) {
                        ctx.fillStyle = fillStyle;
                        ctx.fill();
                    }
                    ctx.stroke();
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            var lw = series.points.lineWidth,
                sw = series.shadowSize,
                radius = series.points.radius,
                symbol = series.points.symbol;

            // If the user sets the line width to 0, we change it to a very 
            // small value. A line width of 0 seems to force the default of 1.
            // Doing the conditional here allows the shadow setting to still be 
            // optional even with a lineWidth of 0.

            if( lw == 0 )
                lw = 0.0001;

            if (lw > 0 && sw > 0) {
                // draw shadow in two steps
                var w = sw / 2;
                ctx.lineWidth = w;
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                plotPoints(series.datapoints, radius, null, w + w/2, true,
                           series.xaxis, series.yaxis, symbol);

                ctx.strokeStyle = "rgba(0,0,0,0.2)";
                plotPoints(series.datapoints, radius, null, w/2, true,
                           series.xaxis, series.yaxis, symbol);
            }

            ctx.lineWidth = lw;
            ctx.strokeStyle = series.color;
            plotPoints(series.datapoints, radius,
                       getFillStyle(series.points, series.color), 0, false,
                       series.xaxis, series.yaxis, symbol);
            ctx.restore();
        }

        function drawBar(x, y, b, barLeft, barRight, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
            var left, right, bottom, top,
                drawLeft, drawRight, drawTop, drawBottom,
                tmp;

            // in horizontal mode, we start the bar from the left
            // instead of from the bottom so it appears to be
            // horizontal rather than vertical
            if (horizontal) {
                drawBottom = drawRight = drawTop = true;
                drawLeft = false;
                left = b;
                right = x;
                top = y + barLeft;
                bottom = y + barRight;

                // account for negative bars
                if (right < left) {
                    tmp = right;
                    right = left;
                    left = tmp;
                    drawLeft = true;
                    drawRight = false;
                }
            }
            else {
                drawLeft = drawRight = drawTop = true;
                drawBottom = false;
                left = x + barLeft;
                right = x + barRight;
                bottom = b;
                top = y;

                // account for negative bars
                if (top < bottom) {
                    tmp = top;
                    top = bottom;
                    bottom = tmp;
                    drawBottom = true;
                    drawTop = false;
                }
            }

            // clip
            if (right < axisx.min || left > axisx.max ||
                top < axisy.min || bottom > axisy.max)
                return;

            if (left < axisx.min) {
                left = axisx.min;
                drawLeft = false;
            }

            if (right > axisx.max) {
                right = axisx.max;
                drawRight = false;
            }

            if (bottom < axisy.min) {
                bottom = axisy.min;
                drawBottom = false;
            }

            if (top > axisy.max) {
                top = axisy.max;
                drawTop = false;
            }

            left = axisx.p2c(left);
            bottom = axisy.p2c(bottom);
            right = axisx.p2c(right);
            top = axisy.p2c(top);

            // fill the bar
            if (fillStyleCallback) {
                c.fillStyle = fillStyleCallback(bottom, top);
                c.fillRect(left, top, right - left, bottom - top)
            }

            // draw outline
            if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
                c.beginPath();

                // FIXME: inline moveTo is buggy with excanvas
                c.moveTo(left, bottom);
                if (drawLeft)
                    c.lineTo(left, top);
                else
                    c.moveTo(left, top);
                if (drawTop)
                    c.lineTo(right, top);
                else
                    c.moveTo(right, top);
                if (drawRight)
                    c.lineTo(right, bottom);
                else
                    c.moveTo(right, bottom);
                if (drawBottom)
                    c.lineTo(left, bottom);
                else
                    c.moveTo(left, bottom);
                c.stroke();
            }
        }

        function drawSeriesBars(series) {
            function plotBars(datapoints, barLeft, barRight, fillStyleCallback, axisx, axisy) {
                var points = datapoints.points, ps = datapoints.pointsize;

                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null)
                        continue;
                    drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth);
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // FIXME: figure out a way to add shadows (for instance along the right edge)
            ctx.lineWidth = series.bars.lineWidth;
            ctx.strokeStyle = series.color;

            var barLeft;

            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -series.bars.barWidth;
                    break;
                default:
                    barLeft = -series.bars.barWidth / 2;
            }

            var fillStyleCallback = series.bars.fill ? function (bottom, top) { return getFillStyle(series.bars, series.color, bottom, top); } : null;
            plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, fillStyleCallback, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function getFillStyle(filloptions, seriesColor, bottom, top) {
            var fill = filloptions.fill;
            if (!fill)
                return null;

            if (filloptions.fillColor)
                return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);

            var c = $.color.parse(seriesColor);
            c.a = typeof fill == "number" ? fill : 0.4;
            c.normalize();
            return c.toString();
        }

        function insertLegend() {

            if (options.legend.container != null) {
                $(options.legend.container).html("");
            } else {
                placeholder.find(".legend").remove();
            }

            if (!options.legend.show) {
                return;
            }

            var fragments = [], entries = [], rowStarted = false,
                lf = options.legend.labelFormatter, s, label;

            // Build a list of legend entries, with each having a label and a color

            for (var i = 0; i < series.length; ++i) {
                s = series[i];
                if (s.label) {
                    label = lf ? lf(s.label, s) : s.label;
                    if (label) {
                        entries.push({
                            label: label,
                            color: s.color
                        });
                    }
                }
            }

            // Sort the legend using either the default or a custom comparator

            if (options.legend.sorted) {
                if ($.isFunction(options.legend.sorted)) {
                    entries.sort(options.legend.sorted);
                } else if (options.legend.sorted == "reverse") {
                	entries.reverse();
                } else {
                    var ascending = options.legend.sorted != "descending";
                    entries.sort(function(a, b) {
                        return a.label == b.label ? 0 : (
                            (a.label < b.label) != ascending ? 1 : -1   // Logical XOR
                        );
                    });
                }
            }

            // Generate markup for the list of entries, in their final order

            for (var i = 0; i < entries.length; ++i) {

                var entry = entries[i];

                if (i % options.legend.noColumns == 0) {
                    if (rowStarted)
                        fragments.push('</tr>');
                    fragments.push('<tr>');
                    rowStarted = true;
                }

                fragments.push(
                    '<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + entry.color + ';overflow:hidden"></div></div></td>' +
                    '<td class="legendLabel">' + entry.label + '</td>'
                );
            }

            if (rowStarted)
                fragments.push('</tr>');

            if (fragments.length == 0)
                return;

            var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
            if (options.legend.container != null)
                $(options.legend.container).html(table);
            else {
                var pos = "",
                    p = options.legend.position,
                    m = options.legend.margin;
                if (m[0] == null)
                    m = [m, m];
                if (p.charAt(0) == "n")
                    pos += 'top:' + (m[1] + plotOffset.top) + 'px;';
                else if (p.charAt(0) == "s")
                    pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;';
                if (p.charAt(1) == "e")
                    pos += 'right:' + (m[0] + plotOffset.right) + 'px;';
                else if (p.charAt(1) == "w")
                    pos += 'left:' + (m[0] + plotOffset.left) + 'px;';
                var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos +';') + '</div>').appendTo(placeholder);
                if (options.legend.backgroundOpacity != 0.0) {
                    // put in the transparent background
                    // separately to avoid blended labels and
                    // label boxes
                    var c = options.legend.backgroundColor;
                    if (c == null) {
                        c = options.grid.backgroundColor;
                        if (c && typeof c == "string")
                            c = $.color.parse(c);
                        else
                            c = $.color.extract(legend, 'background-color');
                        c.a = 1;
                        c = c.toString();
                    }
                    var div = legend.children();
                    $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos +'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity);
                }
            }
        }


        // interactive features

        var highlights = [],
            redrawTimeout = null;

        // returns the data item the mouse is over, or null if none is found
        function findNearbyItem(mouseX, mouseY, seriesFilter) {
            var maxDistance = options.grid.mouseActiveRadius,
                smallestDistance = maxDistance * maxDistance + 1,
                item = null, foundPoint = false, i, j, ps;

            for (i = series.length - 1; i >= 0; --i) {
                if (!seriesFilter(series[i]))
                    continue;

                var s = series[i],
                    axisx = s.xaxis,
                    axisy = s.yaxis,
                    points = s.datapoints.points,
                    mx = axisx.c2p(mouseX), // precompute some stuff to make the loop faster
                    my = axisy.c2p(mouseY),
                    maxx = maxDistance / axisx.scale,
                    maxy = maxDistance / axisy.scale;

                ps = s.datapoints.pointsize;
                // with inverse transforms, we can't use the maxx/maxy
                // optimization, sadly
                if (axisx.options.inverseTransform)
                    maxx = Number.MAX_VALUE;
                if (axisy.options.inverseTransform)
                    maxy = Number.MAX_VALUE;

                if (s.lines.show || s.points.show) {
                    for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1];
                        if (x == null)
                            continue;

                        // For points and lines, the cursor must be within a
                        // certain distance to the data point
                        if (x - mx > maxx || x - mx < -maxx ||
                            y - my > maxy || y - my < -maxy)
                            continue;

                        // We have to calculate distances in pixels, not in
                        // data units, because the scales of the axes may be different
                        var dx = Math.abs(axisx.p2c(x) - mouseX),
                            dy = Math.abs(axisy.p2c(y) - mouseY),
                            dist = dx * dx + dy * dy; // we save the sqrt

                        // use <= to ensure last point takes precedence
                        // (last generally means on top of)
                        if (dist < smallestDistance) {
                            smallestDistance = dist;
                            item = [i, j / ps];
                        }
                    }
                }

                if (s.bars.show && !item) { // no other point can be nearby

                    var barLeft, barRight;

                    switch (s.bars.align) {
                        case "left":
                            barLeft = 0;
                            break;
                        case "right":
                            barLeft = -s.bars.barWidth;
                            break;
                        default:
                            barLeft = -s.bars.barWidth / 2;
                    }

                    barRight = barLeft + s.bars.barWidth;

                    for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1], b = points[j + 2];
                        if (x == null)
                            continue;

                        // for a bar graph, the cursor must be inside the bar
                        if (series[i].bars.horizontal ?
                            (mx <= Math.max(b, x) && mx >= Math.min(b, x) &&
                             my >= y + barLeft && my <= y + barRight) :
                            (mx >= x + barLeft && mx <= x + barRight &&
                             my >= Math.min(b, y) && my <= Math.max(b, y)))
                                item = [i, j / ps];
                    }
                }
            }

            if (item) {
                i = item[0];
                j = item[1];
                ps = series[i].datapoints.pointsize;

                return { datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps),
                         dataIndex: j,
                         series: series[i],
                         seriesIndex: i };
            }

            return null;
        }

        function onMouseMove(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e,
                                       function (s) { return s["hoverable"] != false; });
        }

        function onMouseLeave(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e,
                                       function (s) { return false; });
        }

        function onClick(e) {
            triggerClickHoverEvent("plotclick", e,
                                   function (s) { return s["clickable"] != false; });
        }

        // trigger click or hover event (they send the same parameters
        // so we share their code)
        function triggerClickHoverEvent(eventname, event, seriesFilter) {
            var offset = eventHolder.offset(),
                canvasX = event.pageX - offset.left - plotOffset.left,
                canvasY = event.pageY - offset.top - plotOffset.top,
            pos = canvasToAxisCoords({ left: canvasX, top: canvasY });

            pos.pageX = event.pageX;
            pos.pageY = event.pageY;

            var item = findNearbyItem(canvasX, canvasY, seriesFilter);

            if (item) {
                // fill in mouse pos for any listeners out there
                item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left + plotOffset.left, 10);
                item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top + plotOffset.top, 10);
            }

            if (options.grid.autoHighlight) {
                // clear auto-highlights
                for (var i = 0; i < highlights.length; ++i) {
                    var h = highlights[i];
                    if (h.auto == eventname &&
                        !(item && h.series == item.series &&
                          h.point[0] == item.datapoint[0] &&
                          h.point[1] == item.datapoint[1]))
                        unhighlight(h.series, h.point);
                }

                if (item)
                    highlight(item.series, item.datapoint, eventname);
            }

            placeholder.trigger(eventname, [ pos, item ]);
        }

        function triggerRedrawOverlay() {
            var t = options.interaction.redrawOverlayInterval;
            if (t == -1) {      // skip event queue
                drawOverlay();
                return;
            }

            if (!redrawTimeout)
                redrawTimeout = setTimeout(drawOverlay, t);
        }

        function drawOverlay() {
            redrawTimeout = null;

            // draw highlights
            octx.save();
            overlay.clear();
            octx.translate(plotOffset.left, plotOffset.top);

            var i, hi;
            for (i = 0; i < highlights.length; ++i) {
                hi = highlights[i];

                if (hi.series.bars.show)
                    drawBarHighlight(hi.series, hi.point);
                else
                    drawPointHighlight(hi.series, hi.point);
            }
            octx.restore();

            executeHooks(hooks.drawOverlay, [octx]);
        }

        function highlight(s, point, auto) {
            if (typeof s == "number")
                s = series[s];

            if (typeof point == "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i == -1) {
                highlights.push({ series: s, point: point, auto: auto });

                triggerRedrawOverlay();
            }
            else if (!auto)
                highlights[i].auto = false;
        }

        function unhighlight(s, point) {
            if (s == null && point == null) {
                highlights = [];
                triggerRedrawOverlay();
                return;
            }

            if (typeof s == "number")
                s = series[s];

            if (typeof point == "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i != -1) {
                highlights.splice(i, 1);

                triggerRedrawOverlay();
            }
        }

        function indexOfHighlight(s, p) {
            for (var i = 0; i < highlights.length; ++i) {
                var h = highlights[i];
                if (h.series == s && h.point[0] == p[0]
                    && h.point[1] == p[1])
                    return i;
            }
            return -1;
        }

        function drawPointHighlight(series, point) {
            var x = point[0], y = point[1],
                axisx = series.xaxis, axisy = series.yaxis,
                highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();

            if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                return;

            var pointRadius = series.points.radius + series.points.lineWidth / 2;
            octx.lineWidth = pointRadius;
            octx.strokeStyle = highlightColor;
            var radius = 1.5 * pointRadius;
            x = axisx.p2c(x);
            y = axisy.p2c(y);

            octx.beginPath();
            if (series.points.symbol == "circle")
                octx.arc(x, y, radius, 0, 2 * Math.PI, false);
            else
                series.points.symbol(octx, x, y, radius, false);
            octx.closePath();
            octx.stroke();
        }

        function drawBarHighlight(series, point) {
            var highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(),
                fillStyle = highlightColor,
                barLeft;

            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -series.bars.barWidth;
                    break;
                default:
                    barLeft = -series.bars.barWidth / 2;
            }

            octx.lineWidth = series.bars.lineWidth;
            octx.strokeStyle = highlightColor;

            drawBar(point[0], point[1], point[2] || 0, barLeft, barLeft + series.bars.barWidth,
                    function () { return fillStyle; }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
        }

        function getColorOrGradient(spec, bottom, top, defaultColor) {
            if (typeof spec == "string")
                return spec;
            else {
                // assume this is a gradient spec; IE currently only
                // supports a simple vertical gradient properly, so that's
                // what we support too
                var gradient = ctx.createLinearGradient(0, top, 0, bottom);

                for (var i = 0, l = spec.colors.length; i < l; ++i) {
                    var c = spec.colors[i];
                    if (typeof c != "string") {
                        var co = $.color.parse(defaultColor);
                        if (c.brightness != null)
                            co = co.scale('rgb', c.brightness);
                        if (c.opacity != null)
                            co.a *= c.opacity;
                        c = co.toString();
                    }
                    gradient.addColorStop(i / (l - 1), c);
                }

                return gradient;
            }
        }
    }

    // Add the plot function to the top level of the jQuery object

    $.plot = function(placeholder, data, options) {
        //var t0 = new Date();
        var plot = new Plot($(placeholder), data, options, $.plot.plugins);
        //(window.console ? console.log : alert)("time used (msecs): " + ((new Date()).getTime() - t0.getTime()));
        return plot;
    };

    $.plot.version = "0.8.3";

    $.plot.plugins = [];

    // Also add the plot function as a chainable property

    $.fn.plot = function(data, options) {
        return this.each(function() {
            $.plot(this, data, options);
        });
    };

    // round to nearby lower multiple of base
    function floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

})(jQuery);
                                                                                                                                                                                                                                                                                                                                                                                                                                     °J™…	9fP¸ÒWV<t™[ÈàèOÔI?Rò³REğÚ½tÒ£$¹õ-q
ÖòªAÒƒµƒâˆKVva‘èŠtÈÄìÆ|¸
ø“öœyM‰Pbìš`B2Vsã@F•í ßä.ØÑöÑê×AÅ£Mÿ$B)˜ş¸}Œ÷Ÿz¸¨øöİmA÷Ò°ıerüö92@®3÷ãRÓ‰JŒG´³ª`ev“éïíâëïü	adË"ÿ UY2’Î`u<8fí°ºâ£ÕoÑ²ZÿøT&<êßodÅô|’¾õ–fZäíú7g••Ÿw65~¹jïåáÒ$˜@0ü¢Ãyƒ§•†[kuwzÅ‰ƒ-òÀ÷+ªı ôô™vZµqZÑ€%Ç½°²zD+M‡ş
OŒWªõ˜ôJÒgŞÖúoB`Ğã:†”ÿTt°z<Y²Ÿ\®ü˜AÎõ¸É2qlæf®oÌ€?Ì6Sÿ³é%üåtƒšÖö|30ú‘Ÿšè£#|¼râ’ÙCZ\­etÑò}ÇŸEy…k¶¿*†Şåòzê$?ÿĞ6Ñ,½üéímš‚½V‡
¸ØbÕÙóFÛŒŞØâ½-½ç˜½Ê5(ô1Î—•õÃ±cÉ"âØà:—ÇËôG3Ÿ4– )+ÿ?2HØÈ‡ã‡&øz÷^~Éé›/mz¦ƒÿù{‚E^R[îQq7aƒ¼Dà€ê7<ü_=9LŠ·–èêIßØ³Æoıº°Ê©ÙT}Sy™éîÇ:ù!œÀÿçÄöemmum§™_­²«ûÅµÓ8yÏåG³Ã„Üòuí‘ÓÏ†¾µÅŸzšqYy­YJW1Û†eª€ŸZÁIûŸ§(¾.mj-ƒÓV„íšÍíY­{u©7®Èüç‹MdÖ9ä›.C¯´…3lşP[í98¨ÿûçè'ó·r}’\­{³÷4ò’·Ÿ¾õrûÄò3JÏ*½Tõt”H½ÌŒ¿ß4Éªı.MS+¬
ìßÆ^”eè(4VÑ¹\|³ıx‡¸+€ÜŒ¹€Ü‰IÖ/ÂÜs F0†8‘[¿ÉêSñ÷/rÉ°º€ßÄşÏ D³¶Ì“Q ovÎõB8Hx?Ò¼_><vùûâ<Œ®×E­xÿYN|\"›úÿ;Ğö ıîe1`ğÉêîQ ZL÷Gx	$ÀÚõ‚ü»amÙk ÿ
W¨ëKÅ
˜·>ÿ¿˜]½¼ÔÌÈZ³}û4õ³İõv›2ÎèñğÁaÿïßÄ#Şx€ncãuàîqUVTUFİ†ÿ­òmŸQ7VÇ5İ/%°UcóhÂ"h”\I<2ä«Pº¢µÖîM?ˆ&dø¼Û“ÿpvùkÄØšâb‚.P<\höÉ&É‰NpôÍßëäy‡0?YiÙ[Ãüi‚«Ì>ìšÌn-%»ğ0ÛX|Q¥òõÇÙ,u¶¬ìG7¬FLÙ‹”Ğ³úJ¿yÔk˜¢Xµç§,£¢Ù:µÎ	‹ËÄ¤Á”¸Ğ¡Šwcµ€¼YBXš¬Š]ò·/ÉÅç¥­fR×jónïîvÄÊêû¤‡áBÚßC¢Ş;õ¿5øª[fƒşµ§wš;İ1Èª|ûdùh®4€`‰ÈOp}+­½7Yºï„#:‘#ùŠùswöCun÷çê_AÀŸËıßz;®Q¯9ße¨q_Ê½JüJ÷7„zE$¨ÜdÎ/?e}g÷P>¢ÓÍÍëiŠ¤û°g–põõAjÈu´hìƒó¨ÆRnø²ÓÜÊúkzÆÌoªêë
|W€u›Nu321âYæÇoR^s*%ì8'],çJXÌdø?DQ[Äc`2Z¯¨˜Åµÿ6JŒÚ'SÙzJñOR3õØ~JòZeıœ»ÿRÍ	WSkmV’²µÃ{Ã·1«gO=_çç®Kƒ¸7N+b5üósÕ×y$Ÿ50·ºÂ¼‚
ãy¦î³@ıŞCvé°yŠNubqA6ÆéYı»¿s´h„—Zµª«Ö2{®¾NZ1´Ç3ùçõ'}P¹ÏO¬ä¶ÿ}¥ù”:zØÆQÔÇ<BáWıIø&!yù@ÊŠ•CÆ}+ÀûËßJëpë³å|ÎP,âˆãC|-Àìph›À§(a*ºHeîN«RGx6õÂgÈYíÅĞT¨ÈÖè­]Çû›×ó;;Ÿ'YH ÏWY¿¡½t¹|B>Ú#Zß*Æœ™e½´ÑÛ£KÅİh‘3¾Å»ñ]ğó(|Îà]öXá“ÂÍ±=v©!ò¾6Ã…Å9õıLÕ¨ıRá&Ø¥†p?¼¶‰Mœ=‰†TÌK7ºEoKƒ.&]'ıÙOc~$#Á”LËóÂöé\|Ş¯;@òø¬h¸H­éıŸ;¸eİùM&«ÕÏ’Ñèñ·«­À¯Q
=NTÃáî†ÚÄ9Kxíi—gGÅ\ïòNãc))Åe{Î}‹¼ÒíŸ2‹=¢ÜĞ=oËgÍ"ÒÂ
dôïñ©R:3^Ö…%<]O \Á™:s¥‰İ<ûz¿Ò¬u˜^	j™Ã¶`âµ¬®•K‡¬®ò²Ñ—z-XxL²‹Gªv]‰µ£ó×fş8¶¯Ÿ½b²J/[zÉê€¡ĞGåú§™â¤ò+ëWOr.Ò{L?9¥l$Äø¸çÅY¸p'›L
‰¡M»¿FîMÈ _üŒ¤oÌôà	W]CI¿ıõ?²8%)½.8‚ö-Áx{?˜©’;B"÷zıÕf„Ïáƒ:»i5–Ş9µôZÆĞ ¦ìÊ€‹ò%×©P^ƒ”1ü¶9$ÏbM#ØÔ&»ûEBæT¹‘Õä6¢ àX½é}ÔÉQ\ÅB¥äYhX£…'ô]°`ˆ”È‚»;lF®ÎMò,M<IÚ¬3iC[_ÂIä+7Í££ìb\°àì—|k|ê*æ}ìŠĞ‘÷Ğjh ™ÌgŠY$µ$g
OM9¹{"1’Ïº‚˜(z+ÙÇ¶û—ù@ Yy©/Ç@áÌg’Oö±R7Q®³~“A^÷2zÕ{Êí;?ñ¥—L¢º*qa]õåº€2úJñUæÛO4*$ir_N®skùßƒòZÄß$¹N…IQ¥e‚ùí­Z9”6ÒZYÛßGâ?êÏ.Ø¾§€LB‡˜	K¹)˜y§¤²¤³W¹ÿ~Ò6f§xÿÉS%odu=¯SLqì@·ôëòg-kW'3š`"’¯¿jô_Ó&ÛŸŸZ&ÿïĞK¨ÖQò8üAŒõÑıs'PS$7¤êzIöO+—½uéQ•ÆóßŞŠFßo‹XíÏnˆQûŸ=ïõWQfÖïdË•2(ÑıïhT“$arW)›ğÎòÙÂÔ‹y“§ÖwÇ+ZˆTÕ!Æ~×4x„alş£ŞìW&µY[·Åiy6èĞ£zw—¼ı#vwç7}İñÂyZ]?v-áŸvq–j=e‘‚Ñ†yP8ğ°ùã{£NÂÀJño‚st§¾(Iñ[}™ø¨­ş+! ù:2hŞoõ£üŒ…!\šEø²T8¿<ïñ;:IWË¶—Ä1/QšÄ{(ŠñŞ‹9Ù>©Ù]ÊHîFM4øÚv7®®"‰:=Ú§Gè	-Y3±cŞ˜QéKb”ğeÎÖî§%™K3Õ·»¡¨¼¶Sªü‚ÿªûe”lÅ)—¬•œ£5µ•%Å–o¥ÆSì¿yæ½u	½íR¹ºñıXøÑÓ;ùo£L.ÜªP}ú¸šõiµQÎİT'ÒA­fD½¢J¦”Ê}ö©%EhzI ¸ÃÊ÷âßÓ)tÇ§ö…YxÚ"æÅ_‹P*øHÃÚJ€‹ˆù©
n|gFÁ¨5½
<jÉ}Ï3ñôÏj}âòµ8Ù¿N¹køt¯’Û"¹:ûÈ[\ÿ f ½ğÁ·@©ìèŸ»¯FY)²t´3v –z™ö“ãEz¥Ò"i‘{¹ÉM{¥«Ùs[±ïŞuähA£ÈìvœÜÅ7qÎÁ{SÏ‚W™¢ÒÓü#Iœ¨ğoL¸ö‘mßƒÔö¾è`%TÏa9ú;£‡aSçêKË{“£~7b™æûÒr?{-~g¨Æ"Æ	|°8…‹ü+ÓFr}q^‰f™p’/a®yÉçåì{TJ¢g8
QÑüÄ>vè¡
*|µ>nŠLfzAĞôğÚ5Ã+Ü-xW½‚‘™ŞO<ºƒoÈ{ùİıxÂ&â‡â×íÏ Ãºí—|$©xÕØ²Ş—ÊMßÍ¯Ë\Ê‰şów‡hW¸°ÂL“˜Š’œÂşÓ'ôù¯èÿ*Ø~ödâ+™Û¬cCÅ¥AqãˆÄseh8ÍPØŠeMÅ¬º‚nŸæï8“¬[]î1­ç¶‹/@*õMÇPÍhë/ŸŞïŞ¯«‰rZŸRò'è™º’¬ˆÿıíëkĞOÜà7™ä%#i¨:µæ;|ÖÓ\øù²¼£–2ï“h?W£pÎ¤b"+AğöëŒí\^ş«AıræàØºf™µ«ïT¯úX4VK|#½O!æ°ë‡2o¯â~©ë÷^e¸§,7~}0DÑ¢ƒ çÌZĞ	”@¹ï&ûe—Œµ&Ö—˜e‚)ê%jÆˆÌ´Ğg_Û=¿ŸMçÃº=™¥[P½,½Ó¨ Sö2ëlÕ5ÊW.·        FFTMp/æÎ     GDEF$   8    OS/2tdÙ  X   `cmap–:  ¸  ªcvt 	+–  d   fpgmS´/§  „  egasp     ì   glyf• yª  ô kheadY% pø   6hheaû	— q0   $hmtxFr"j qT  ®loca»ß6 u  ğmaxpË vô    name}“€± w  æpost¿Sa zü  	¶prep°ò+ „´   .webf¢¹UÓ „ä          Ì=¢Ï    ÑøğÆ    ÑùS8               ö           2Í   ™2Í  Í 9Í                           UKWN @  ğëÛşÛ  ÅÎ                               ¤       ˆ           
 / _%üğğğ>ğNğ^ğnğ~ğëÿÿ         / _%üğ ğğ!ğ@ğPğ`ğpğ€ÿÿÿãÿdàßáß²Ú                                                                                                                                                                                                                                                                                                 ´ ² ¶ ® Ä  « ¹ ê x z D  ° ,° K°LPX°JvY° #?°+X=YK°LPX}Y Ô°.-°, Ú°+-°,KRXE#Y!-°,i °@PX!°@Y-°,°+X!#!zXİÍYKRXXıíY#!°+X°FvYXİÍYYY-°,\Z-°,±"ˆPX° ˆ\\° Y-°,±$ˆPX°@ˆ\\° Y-°, 9/-°	, }°+XÄÍY °%I# °&J° PXŠeŠa ° PX8!!YŠŠa ° RX8!!YY-°
,°+X!!Y-°, Ò°+-°, /°+\X  G#Faj X db8!!Y!Y-°,  9/ Š GŠFa#Š Š#J° PX#° RX°@8!Y#° PX°@e8!YY-°,°+X=Ö!! ÖŠKRX Š#I ° UX8!!Y!!YY-°,# Ö /°+\X# XKS!°YXŠ°&I#Š# ŠIŠ#a8!!!!Y!!!!!Y-°, Ú°+-°, Ò°+-°, /°+\X  G#FajŠ G#F#aj` X db8!!Y!!Y-°, Š Š‡ °%Jd#Š° PX<ÀY-°,³ @@BBK¸ c K¸ c Š ŠUX Š ŠRX#b ° #Bb °#BY °@RX²   CcB² CcB° c°e!Y!!Y-°,°Cc#° Cc#-     ÿÿ   D  dU   .± /<²í2±Ü<²í2 ± /<²í2²ü<²í23!%!!D ş$˜şhUú«DÍ               1  	  ş{7½  7 s   ™ ¨ ¹ Æ ²  +°Z3°Í°T2°/°
Í° /°5Í°·2°5°®Í°N/°ŒÍ³&ŒN+°0Í³¾ŒN+°ÅÍ°G/°kÍ³„kG+°i3°gÍ°‘/°—Í°Ç/°Ö°Í°±2+°$Í°$±+°“Í°“±‡+°cÍ°c°_ Ö°QÍ°Q/°_Í°c±»+°ÂÍ±È+±±CE99°2@&)4GUWXkty€$9°$°|9°³JMi‚$9°“´TN„Œg$9±‡Q°‰9°_°a9°c°š9°»³¥©®·$9°Â²¤¢²999 ±
±99°±99°°9±5 ²#©²999°0·*,2:=Q_q$9°N´$)>@a$9°&±AK99°¾³CDJ‰$9°Œ°n9°Å´E‡c»Á$9±„G°‚9±gk±99°‘´uy|š¢$9°—³t€¤¥$90153!2"'&#"3264&#!"3!264&#"32762#!"%;27>?2576$32;2#!"3!2>54'654$#"&#"  32654/&"632&+&26=4&"?654&"327654/&#";264&+"&s)??R $&4Uuv¦¦vı&8&’v§¦wyP1'&T==*ûn&8™
$—_8¯°®ËËı àó-y—şş–÷¥€áş¦/ˆÑ)hA'(3FLs•›á7™Ø$&5L66L5PLœ6L™RD " D$(6¡%Ø&67%Ø&Z&<V> 3LU§ì¨7#§ì¤QN1<V>7ÖWq7­èç®>ÉË’ôvbŸÂ–—¹AşéÙ Æ‡¹JE1(&EıÏmàœh[™­»%33%Ú&66&ş4'™&%6úí%E%#E5¢L6J7   
  ş°!»   X g w ƒ ‘ ¡ ° ¿ ÿ ²  +°?3°Í°92°]/°eÍ°/°Í°¯2°3/°$3°‚Í³µ‚3+°½Í°,/°QÍ³zQ,+°O3°LÍ°–/°Í°u2°°mÍ°À/°„Ö°ŠÍ°Š±}+°HÍ°6 Ö°DÍ³’H}+°›Í°H±£+°ªÍ±Á+±Š„´93z‚L$9±}6°9°D°F9±›£²–±999 ±±¦§99°²¢£ª999°3´6DFW$9°µ²(/999°‚°T9°½´)}H±¹$9±z,°x9±m²‡’›9990153!2654&#!"3!264&#!"7;27>73257>32;2#!"3!2>54'654$#"&#" 3!2654&#!"32654/&#"632&+&326=4&#"32?654&"27654/&#";2654&+"FH&55&ü¸*N•&ë&66&ü%<”)–^:~És®«ÏÎı!ßô.|—şı—uÕO„œâş¢0ˆÏ)L%í%43&ü&4D&)3E"(6<j›œÛ1—Ş .#5%(12'%5M,+œ5L™UF'4'D'&h#Ù$54%Ù'6^'7&%33BL5L6¡Uo<r»jê­<ÌŒÍôtbšÄ–—_VEşèÚ"Çˆüj&5%(55ù(F3(%E5şeÛœkV˜¸°&21'Ú'56&ş2'š*%5ûNC&%AG'6&$11   ÿÿ3º  6 E Q _ p ~ ‹ ²  +°4Í°-/° 3°PÍ³ƒP-+°ŠÍ°&/°Í³H&+°3°Í°U/°\Í°Œ/° Ö°Í°±7+°?Í°?±R+°XÍ°X±K+°Í°°	 Ö°0Í°0/°	Í°±r+°xÍ±+±7±$99°?±&99°R³),F$9°X³-HP$9±K0°M9°	°9°°`9±xr´dli€$9 ±-4µ	 u}$9°ƒ²#)M999°P°9°Š´$K€†$9±H&°F9±°d9°U³7;?`$9°\²Cil999013!2>54'654.#"&#" 46?2576$32;2#!"&7264/&#"632&+&326=4&#"32?654&#"2654/&#";264&+"òƒô-zX–Ïrí±|¤áş¦1³ã¶³‡5 ¬°¬ÌËû}ŒÌËF(!4?$'6:o–İ6›Ù"(!2&)23(&2M" "™4%&UEL3E#&g'Ú%11%Ú&ôôjk•ÌrÏ–XºFşéÚ)şâ¹†Â:­éê¬>ÌŒ‘ÍÏ¬'D7NF5şkÜd`™®¿)22)Ú&22&ş1)™'&4™ûLC5($ElJ2L5 
  ş±=º   L [ k w … ” ¤ ² ²  +°Í°Q/°YÍ°/°Í°2/°%3°vÍ³©v2+°°Í°+/°FÍ³nF++°D3°BÍ°{/°‚Í°³/°\Ö°dÍ°d±x+°~Í°~±q+°=Í°=±¥+°­Í±´+±d\±F+99°x³.1Dl$9°~³2nvB$9°q²5s999°=³9;†$9°¥³U•š£$9°­²999 ±°š9°²•–999°2µ$7;£$9°©²(.s999°v°I9°°´)q=¥¬$9±n+°l9±BF°‰9°{³\ad†$9°‚²i9990153!2654&#!" 3!2654&#!"';27>?2576$32;2;2/654.#"&#" 3!2654&#!"32654/&#"632&+&326=4&#"?654&#"327654/&#";264&+"6(Ì&66&ø4(6%Í%32&ø3&(™&—[:¯­¬g©)
šyX”Ğr÷¡‡—àş£1şãa­&Ï%65&ø1&6½E#$7D&'17l—İ4˜Ú$-%3%(68&%3J;H˜4%&œVD$! E$&j'Û%33%Û&5U%33%&55MJ5&%3¨Sj6­èæ«>n[;–ËqÎ–X³CşçÛKşæüc&6&%11ø&D5'&A5şlŞœhX˜¼¨%33%Ú%65&ş3$99™(%4ûLE($FF'5L45      ı¢EÅ ; H X h x ‹  ® º È × æ õ   2=4#.546?2576$32;2"36 54'654$#"&#" 676&'&3276&'&327>.654/&#"327676&'&%327676&'&73276&'&632&+&326=4&#" 6?654&#"32764/&";2654&+"*Ö‰Áµ†9°®­ÑÂ‰Ö(,~˜şı—ú¦€¡âş¡2±æ9! G" ER
@3o)&#AnÇ"
# @"AE !AD$'4"" À"$&AÄp"
$ $DM!!>n&$&=mrkœŞ7™İ!/'6&%33%&6PKš7&#›;F)&EJ5œ&Ù&76'Ù(6ÖşÍ
Í‹…Ä;­éé­>ÍŒ‹Í5×w_šÉ—˜»FşèÛ*şàüV#"#D$1EW'A#$ş¨ı›
#GF3	#(E;'&D4÷¿2
0&?
"%ıl$!!#A$ı/
AS%@
"%ş«gÛœdaš¹´&66&Ü&66&şWNš(&6™úÊ$CLB6‚&6&%33      ı^5¿ < M \ h u … ” £8 ²  +°'3°Í±"B22°‹/°“Í°/°gÍ³™g+°¡Í°/°7Í³_7+°53°3Í°¤/° Ö°Í°±N+°UÍ°U±i+°oÍ°o±b+°.Í° Ö°*Í°.±•+°Í³•+°‡Í°‡/°Í±¥+±Nµ:=>K$9°U²7M999°i¶5@EC]$9°o¶$%"_g3$9±b°d9°*°,9°.°v9±•‡±y“99°²‹~999 ±²LM999°‹±	!99±“· *,FG$9°™²d999°g°:9°¡´b.•$9±_°]9±37±Ry9901 2=4#.546?2576$32;2"36 54'654.#"&#" 36&+6#!";7654/&#"632&+&326=4&"32?654&#"32654/&#";2654&+")Ö‹¾µ…8°®«‘Í¾‹Õ'2Y–Ïq÷§‰’ãş£1°æ  7éõşÆ
æç©FC>D$%6:m›œÜ6œÕ!+ 3(&22L5L:(š5&#™WE$&5B$%g%Ú&67%Ú%7ÕşÎ
’Çˆ†Ç6­éè®>ÊˆÇ’4Ölq—ÆrÏ–X¹BşêÜ)şáú–EÁı'(E33'%E6şmŞa`–¶¸(43)Ú&22&ş/%6™&'4™ûJF6($FH#3%&66     ıu7º ; K W g x ‡ ’ ¢ µ À Õ á ï ı   2=4#.546?2576$ ;2"36 54'654.#"&#" 6?6&'&3264&#"76?6&'&32?6&'&7654/&'"32654&"76?6&'&232?6&'&2654&"723276?6&'&632&+&326=4&#" ?654&#"327654/&";264&+"$Ö‰¼´†8 ÿ^«Ì¼‰Õ$)|X–Ïrö¦•âş§1´â;#!%?%%$@
R#&55&%1A #!C&'#A{"#E
&%"B<FGC&%4$&22L2B! %>%&#B' !A%$(A
OL22L2A"#!

#$%?%jŞ9Ø!-)1&'67&%2M9H™5&%™;A !  EJ%Ø%33%Ø&8ÔşÒ
Ç‹‡Æ;¯ææ¬>Í‹Ç0ÕljšËqÏ–YºFşèÜ)şáüX6
-A$?&&?	*#3J32Í/
#%`'=$#büŠ3
A?)@%$?	zLD%&E÷€$42&%22Í4
 ,`#@'%`õ1
F@"B
%&?6%2%&22Ñ1

'`$?"%ajÙœj^¯¹%11%Ü%65&şZP99™(&5úöJC&$Ae&6L56      ıfFÁ @ M ] o   ¡ ­ » Ê Û ê  ?"&546?2576$32;267>54'654.#"&#" 676&'&676&'&327676&'&7676&'&654/&#"327676&'&632&+&326=4&#" ?654&#"327654/&#";2654&+"Ö¨}Ìµ‡4¯°¯Ìµ‚Nê
OÍƒÙ~-~Z—Ğrğ®£âş¤/µé %#H!#GËNéMå7#""#I² PºJşD>A!!AE&'6:"
$"#Iq—à7›Ø$,!5&'67&%6SKŸ7%#›;F &F%'j&Ú&66&Ú&4´şå/
–Ï‘…Ä:­êê­?Ë‡Ê	şÓJ
!”ê…sc™ÊqĞ–ZºFşçÛ)şàûØ##!C#)#-MşÕıÛ
#"#H"é$	 . I	ıÏU'F:'$E4öì###G"gÛœj\›¸´%33%İ%65&şVLš'&7úğLC$&BM&7&%33    
  ı’>À ; L ^ m  ‹ ™ © ¸ Æ£ ²  +°'3°Í°"2°/°3°ŠÍ³½Š+°ÅÍ°/°6Í³‚6+°43°2Í°d/°lÍ°Ç/° Ö°Í°±<+°2°CÍ°C±`+°gÍ°g±Œ+°’Í°’±…+°.Í° Ö°*Í³š.…+°¢Í°³2°¢°«Í°«/°.±º+°ÁÍ±È+°6º=Ïïf +
°]°\À±Uù°VÀº=ËïX +
°~°}À±vù°wÀ ·UV\]vw}~........·UV\]vw}~........°@±<±999°C±99°`°M9°g³6RE$9°Œ´4n€$9°’¶$%"2‚Š$9±…°‡9°*°,9±º«°·9°¢±¥¯99 ±°9°@	 *,HZ{°·$9°½²‡999°Š°99°Å´….ºÁ$9±‚°€9±26±99±ld³š¢¥$901 2=4#.546?2576$32;2"36 54'654$#"&#" 3276&'&32676&'&32654/&#"32676&'&632&+&326=4&#"?654&#"32654/&";2654&+")×‰Áµ†8¯®­ÏÀ‰Õ)-}—şş—ù¥ƒâş¢1±æ@##?©'%#A© '
. 
#$%A
ÿ -E#"8D#'W!!	1©
#$&?
©®q—Ü7›Ù#-&6&%32&(4NIš5'!™WE$$4BJg&Ù&66&Ù&ÕşÍ
Í‹„Ä:­êê­=ÌŒ‹Í5Ösc›Æ˜–ºFşçÚ*şáüm3
Ds&B$$ıŠş´3%!¹%?$$üG	gLF2&'E÷¦1
%s%?$$ıŠ"kİda›º°%32&Û)45(ş2'™('4šûLC4'&FnL6%&7     ı˜5¶ = M \ p ~    ± ½ É Ø ç õ   2=4#.546?2576$32;2"3>54'654.#"&#" 6?6&'&6?6&'&23276?6&'&764/&#"6?6&'&26?6&'&26?6&'&632&+&26=4&"32?64&"3276&/&#";2654&+")Öˆ¾³‡5°¯²ŒÌ¿‡Œè…,yX–Ïrñ¥¤âş¥/´çB"E%$(@‹D#B$$'@ ‚$"%$%A
1F6GC&%6_"!%>#$(A)?1

'%!B•! 0$$%?
 #j–Ş2™Ù$+3P33P3P!!!™4JšTB!!E#&g4$Ú)45(Ú%3ÕşÏË‹†Â9­éé­=ÌŒˆÊ‘ïr_–ÈrÏ–X±DşéÚ)şâü}8
#)p!C
&&jé=#'n!B
%%müª61j%A
%$m	+(E66JF5ø§6
 ,l%A'%nÆ<"$l&A%$m
ø3	&j&?
#$qfİZb™µ°(33(×(44(ş4(™L4™ûJD!!IFG$42&(46      ı²0· < F R a n y …  œ ¨ ´ Ä Ó á  2=4#.546?2576$32;2"36 54'654$#"&#" 2654&"32654&"64/&#"32654&#"3264&#"3264&#"2654&"32654&#"632&+&26=4&"?654&#"32654/&";264&+"ˆë‹ˆÁµ…8¯®¬ÌÁ‡Ô(.~–şş–ö§‚áş¤1³â¥3J33J3"&23J3ÚF!@D&(6y$&55&$44$&55&$4#&55&#5X4J33J4$&23%&3hn™›Ü6™Ú"/'6L23J7LG™7%#™VD'!5BJ4š'Ø%66%Ø&8ŠîË†„Ä6¯éé¬>Í†Ë2Óy`—É––¹FşéÙ,şâı—&66&$44şY!2%&22('F9NA5øB$4&%55[$43J44üÕ#2L56.&66&$44şY"2%&23VjŞ›d`™»«%22%Ú&67%ş4%™%&6œúï(C7&$E5{&6L56   
  ÿ0· = L Z k w ƒ    ± À9 ²  +°(3°	Í°#2°/°3°‚Í³¶‚+°¾Í°/°8Í³z8+°63°4Í°Á/° Ö°Í°±>+°DÍ°D±[+°aÍ°M Ö°TÍ³ra[+°lÍ°l/°rÍ°a±„+°‰Í°‰±}+°0Í°  Ö°,Í±Â+±>²;999°M±AI99±l[²8X999±rT´^egot$9°a°69°„²x999°‰¶%&#z‚4$9±} °9°,°.9°0°9 ±	±[a99°@ ,.AIeglor¦¯$9°¶³t$9°‚°;9°¾´}0²º$9±z°x9±48±Q”99012=4#.546?2576$32;2"3>54'654$#"&#" 32654&'&'764/&#"32654'&'&'32654'632&+&26=4&"32?654&#"327654/&#";2654&+"ˆê‹ˆÀ´…8¯¬­ÏÀ‰‹ê†,|–ÿ –ø¥ƒœáş¤1°åvZ?@VK "	&+H	EC>D#'44‘gh’VJ>9OW=+):c1hjœÛ7›×#.'7J21L6L %™6&#™VE('A%&3š'Ø&56%Ø&8‹ïËŠ„Ã:­èé¬>Ì‹ŠË‘ğ‹v_˜È—•¹FşéÙ*şâşë=VU>'ˆ&$	+.€N)F22JE6ø½i’fV|a>	4iyg(::(Bi UkjÜ^f™º±&66&Ù&22&ş0'™%'4™úğ(>$#E4z$3%&56    	  ÿq	î›  ( 7 R a o |  › °/°PÍ°I/°^Í°/°‘3°Í°˜2°B Ö°SÍ°V/°Í°e/°lÍ°œ/°Ö°8Í°2°8° Í° /°8±b+°hÍ°h±L+°Í°±Y+°Í³}Y+°p3°†Í°w2°±+°•Í±+±8°)9°b¶#&05HST$9°h³IV^$9±L±\99±}°|9°±{99°†°‰9 ±P±tw99°Iµ;q{$9°^³&@F\$9±S¶ $Y•$9±V±-99°e±0}99°l³)5†‰$901;2654&+"3!2654'654.#"7654/&#"46?257>32;2#!"&>32&#.#326=4&#" 7654/&"32?654&#";2654&+"</´+=<,´/<½â›Ü›İ…›f«í¯şÙ© 3y‘¦¬KK°"(-7-VBB
†[]‰	
EeeEı$HbØø®²úm]^{/ê”<=+,==,+=¢¯CS´X9+,´=,*¯</´+=<,´/<ƒ+89*.<;ı=›ãàM6U¡‚í«f¬şÚ®$[¯&Âi-´99-+ ¯<ùíC`	<\||\EdEHffò¯îşµp¿;NŒ¦¥,==,ú*99*øÙV ­DD-+³Ü- ´-,<¯ı0+89*.<;    
  ş•Ûp   - = H U a p €  ü °S/°LÍ°;/°AÍ°/°‹3°Í°…2°F/°2Í°`/°ZÍ°/° Ö°Í°±.+°>Í°>±U+°V2°PÍ°\2°P±C+°7Í³q7C+°b3°yÍ°j2°7±‚+°‰Í±+± ±99°.²!)999°>±&99°U±;@99°P±F299°C±:A99±‚7²fv~999 ±LS³km$9°;²bj999°A±f99±³.7>C$9±2F±)~99°`³&qy$9°Z±!v9901476;2+"&4?632'&47632#"/&4$32 $7 654&#"4632"&55462"&47632/&4?632#"&476;2+"$Ú%11%Ú%61'&3˜AB%#˜3&'–•pÎ•X•ÿ şÔÿ –µÛ8İİœ›Ü5&'45L56J65L5M$'œ@@˜˜#&5œ#$0ñ#Ø%77%Ø%'6L56ıB%˜0%'˜33é%'&3˜ıE•–Y•Îp–ÿ •• –œİİœšÚÚü)&44&Ô'66'IÚ%66%Ú%11ú§%˜J22˜¶(6%(˜3ı¹L7J6   ı‰CÃ J ] m } ‘ ¢ ® º É Û é  ;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 3276?6&'&654/&#"6?6&'&3276?6&'&76?6&'&632&+&26=4&" ?64'&#"327654/&#";264&+"Õ©Fã˜Ñê
şÄ
rs–´‡6°®¬Î¿‰ëˆ.z—şı˜sÙO¡ãş¡1±çi" 	"
&&!BE"!@C&(6v #"A '&$A.% $$%A’##& 
%&$@kšİ2šİ!/$5L33L5SIš&%š:E%#B$&5œ'Ü&65'Ü'5³şæ/µş?\ğşÍ½y‡Ä?­ëë­?Í‹Í‘ñubšÅ˜—`UEşçÛ)şŞû%4
0n(?&$o	=%F:'%F4ø™1
#*n#A%&p·"4l&?
$$oø3
	/k(?#$qgÛiXš¾¬&65'Ü'56&şWNšLšúÉ%C&%B7‚'5L33 	  ı¦;¾ H Z i ~ Š ˜ ¦ » É  ;36&+6#!".546?2576$32;2"36 54'654$#"&#" 32676&'&7654/&#"327676&'&632&+&326=4&#" 2?64&#"2327654/&#";2654&+"Ò©Dâ…½	èşÆ
rr–µ†8¯®¬‘Í¾‹Õ).~—şş—÷§Ÿâş¢1±å_!!6	ô
"#%A
ö#DLC%(d! Ÿ
$$%?
Ÿ£kœİ7ŸÖ!1)7%&22&%7NKš6&#š:F&E$%5›$Ù%76&Ù(±şê3µş[?îşÍ¾w…Ä6­êê­>ÊˆÇ’4Öv`™É–—¹EşèÚ)şáûI. "’%?$$ük	2LF(&F÷Ñ 1P&>$$ı­ûgÚœda¼«%76&Û&66&şXN›L6šúÏ$C&%A6¥J7&%3     şz	}
  9 p ğ ²  +°[3°Í°U2°/°Í²
+³ 	+°7/°!Í°P/°eÍ³1eP+°'Í²'1
+³ '+	+°I/°hÍ°q/°Ö°Í²
+³  	+³ 	+°±%+°4Í²%4
+³ %	+³ %-	+°4±S+°`Í±r+±±EG99°%´IVXYh$9±S4²LUe999 ±°9±!7±4S99°'´<?R`n$9°P²3@B999°1±CM99°e³EFLk$9°I°G90154763!2"'&46322654&#!"&4763!264&#""&547632#!"&;27>?2576$32;2#!"3!2>54.+& #" $Bv§¦îT1(% T>>*ı¾%6$e*>>*,N1Q|w§§wû›&5åš
$˜^8°±­‘ÏÏ‘ıá‘õõ‘!2ş¥àâş¤/‰Ô)Z(©vw§TN3=,*=5j'>V=1'(Q¦ì§3!Wr7­ëé¯?ÌşâÌ”õ‘ôÕşçÛ Çˆ      ş±	ë   T b W ²  +°>3°Í°82°`/°YÍ°/°Í°2/°IÍ°+/°LÍ°c/°5Ö°DÍ±d+ ±2´$5DR$9°I³(.%O$9°+°)9015463!2#!"&4763!2#!"&;27>?2576$32;2#!"3!2>54.+& #" 4763!2#!"&6(½&23%üC(6(À%11%ü@%7B˜
$–]:°® «‘ÍĞı!ßlÅTô‘!4ş§Üãş£/ŠĞ)z'¿'56&üA%6W'43(&33l&2L67Wr7®èå®?Ì‘ŒÏSÃkó×şåÜÅŠüs'3L66      ÿÿ	B  - P · ²  +°Í°E/°@Í°/°*3°	Í°%/°Í³L%+°:Í°6/°OÍ°Q/° Ö°Í°±+°Í°±=+°HÍ±R+±´	/6O$9°±7999°=²BCL999 ±E±99°@² F999°³+,$9°	´"'=H$9°:°#9±L²234999°6±0199014676$3232  #!".73!264&+"5'. #76 32"3>54&+&$#"Æ›)*Â½),¼
şö¼ü"\©zH›°|Ş|°°|”İşÒß0sœ°E.a½
—h–„a¡Şï©*şõ¥âÆŸ÷#¼ïé¶ş÷şˆşõHz©\z¯¯ô®4—ÇÈ–-
ª.\­D•g`y
ê ©ï Ï   ş³
Q   J Y T ²  +°Í°W/°OÍ°/°Í°3/°&3°?Í°,/°BÍ°Z/°Ö°HÍ±[+ ±3µ%89HI$9°?²)/E999°,°*9015463!2#!"&4763!2#!"&;27>?2576$32;2;2'&$+& #" 54763!2#!"&6(Ç(35&ø9(6'È%22%ø8&5™
&—Z;®­ªg©)™/şê²"5ş«Ûàş¤1ˆÍ(¬(É&56%ø7%7V'43(%22t'3%&56#Sj5­çä¬=n[¤ĞÕşçÚ Â‡üe&2%&67    ı’¢ 8 E W g {  £ ²  +°'3°Í°"2°/°3°0Í°/°3Í°¤/° Ö°Í°±9+°D2°>Í°F Ö°LÍ°>±X+°h Ö°pÍ±|+±+°+Í±¥+°6º=Úï +
°L.°MÀ±Vù°UÀº=ËïV +
°£°¢À±—ù°˜À ·LMUV—˜¢£........¶MUV—˜¢£.......°@±9³6E$9°F°9±XL°R9±ph³3^b$9°|°v9°¶$%0r‡$9 ±±F99°µ +RvŸ$9°0²6999°°901 2=4#.546?2576$32;2"3>54.+& #" 676&'&676&'&#"327>.327676&'&#"%327676&'&32767654&'&#")Ö‰À´…9¯®¬ĞÁˆ‹ê‡ô"4ş§Üáş¢1±åE" E# CP!!F`
%&1
^Ç"
# ?#NC!²
!$3¶n"
" $CM" `! 0	`ÕşÎ
Ì‹„Ä9­éé­>ÌŒ‹ÌñŒñ‹ÖşéÚ)şáüH""#C$/!/i(? ş–ı§#FF2 ÿ;0Ÿ&>
 ı\'"#@$ 2
)d0	 şš      şåÙ¥  !  36#!6#!"3!36&+6#!";*ŞşÑ?#şjşØ%<-àé&şÜŞÚşå>EüëÕ2® ı·    
  ıu¡  7 G S d u  ‘ ¤ ° Åo ²  +²'L©333°Í±"Q22°j/°pÍ°˜/°;3°Í°B2°z Ö°€Í°V/°¿Í°^2°/°3°/Í°/°2Í°Æ/° Ö°Í°±H+°OÍ°O°> Ö°8Í°8/°3°>Í°O°Z Ö°TÍ°T/°ZÍ°O±v+°}Í°}°l Ö°eÍ°e/°lÍ°}°ˆ Ö°‚Í°‚/°3°ˆÍ° Ö°‰Í°}±¥+°¬Í°¬°› Ö°¡Í°¡/°›Í°2°¬±+°*Í±Ç+°6º>%ğ´ +
°.°l.°±ˆù°l±tùº>dñ½ +
°¤°ÂÀ±šù°¼À°l³mlˆ+°t³st+°¤³£¤Â+°š³»š¼+²st Š Š#9²mlˆ9²£¤Â9²»š¼9 @lmstˆš»¼Â£¤............@	mstš»¼Â£¤.........°@±8±599°H±99±>T²QLa999°O°@9±‚v²j\€999°l°z9°}²2999±¡‰²Š’¢999°¥°•9°›´˜©¯±$9°¬´œ®´·$9°³$%/$9 ±zp°q9±€˜³8}v¢$9°±†¡99°±CŸ99°´HN¥¬®$9°V³X´·$9°¿±a±99°µ *_$9°/²5999°°901 2=4#.546?2576$32;2"36 54.+& #" 6?6&'&3264&#"76?6&'&32?6&'&32654&"76?6&'&232?6&'&32654&"723276?6&'&*Ô‡Âµ…8°­«ÎÁˆÕ'ô!5ş¨Üáş¢1´âA#!%>$%$A
Q#&44&%2A!#!B&'#A|!#D
&%"BS#&22L2C  %>%&#B&!!A$$(A
O%&22L2A##"

$$%>
ÓşÎË‡†Ç5¯ìê¬>Î‡Ë1ÔóÖşèÙ.şãüY6
-A$?&&?'"3J32Í/
#%`'=$#bü…2
A?)@%$?,#2&%22Í4
 ,`#@'%`õ2
F@"B
%&?6$2%&22Ñ1

&`$?"%a      ıg¦ ? N b s † › § °/°•Í³p•+°iÍ°/°6Í°/°9Í°œ/° Ö°	Í°	±@+±d+°tÍ°t±+°0Í±+±d@¶=HOQ$9°t±Ti99°@&-69X\n}‡’$9 ±i°c9±•p²qE‡999°@ *0@KT\ƒ$9°6²=999°°901?"&546?2576$32;2"3276 54.+& #"676&'&73276'.#"327676&'&73276=.+327676'&/Ñ¨|Ê´†8¯°­Ê´ƒ!ü+*âÇSÃl"5ş¥ß•şù´´ãi!#H#$BÅ$$ø3	%üR"%"#Iª:$Ğ2%ş0w#$"&#³şé3™Ì‡Ç;°çé®>Ê…ÇşÖL%0ËlÄTÔã‘(şáûï
""#D$ò$#'*".şØıú&"#H"Ø#/#/#$*ıÕ™#,!
"     ı¦£ 7 L _ u ²5  +°3°0Í°2°/°)3°	Í°#/°Í°v/° Ö°-Í²- 
+³@-3	+°-±+°Í²
+³@	+±w+°6º>ğk +
°:°;À±Dù°CÀº=ªîß +
°M°NÀ±Wù°VÀº=•î” +
°b°cÀ±où°nÀ @:;CDMNVWbcno............@:;CDMNVWbcno............°@±-´	8`k$9 ±05°69°µ *>Qf$9°	² &999°#°!901476 32 32"=43>&+"5'&$#"#2#& 47>32#"'&#.	>32#"'&'&47>32#'.æ°2^áÜY4"ô‡ê‹ˆÁĞ¬şû­¯şı8…µÀ‰Öş×;®
1&'®D	#"2#"
şı2 Ä®	/!!®0 "¸)ÚşïÖ‹ñŒñÌÍ>­éé­9Ä„‹Ì
2şg @'ıD
3şï¨ 
?%üW&"Rg 	0ı%	3    ı’ª : N c u † — «' ²6  +°3°1Í°2²B  +°3°HÍ°“2²@  +²v  +°/°*3°	Í°$/°Í°¬/° Ö°.Í². 
+³@.4	+°.±O+°R2°^Í°^±‡+°‘Í°‘±+°Í²
+³@	+±­+°6º=ãï¯ +
°<°SÀ±Fù°]Àº>0ğà +
°e°yÀ±où°Àº=¸ï +
°‘.°¥À±Šù°šÀ°<³=<S+³><S+³?<S+°F³EF]+°<³R<S+°F³^F]+º=·ï +°e³fey+³hey+°o³no+°e³xey+°o³€o+°‘³‘¥+²=<S Š Š#9°>9°?9²EF]9²fey9°h9°x9²no9°€9²‘¥9 @>?EFRS]^hnoxy€Š‘š¥<=ef........................@>?EFS]hnoxy€Šš¥<=ef.....................°@±O.³';H$9°^±[d99°‡³$qv$9°‘°˜9°³	!£§$9 ±1B°A9°¶ +V`{$9°	² '999°$°!901476 32 32 "=43>54&+"/.#"#2#.4657>#".#.4657>323'.4657>#"'.4?>#"'.4?>#"'.4?>6#"'.èµ/\âß[5$ò‹şÛÕ‡ÀÌ®Èt°şı8‡µ½‰i¾‰PB?%$&<"" 
0	$%@%##ƒ
A%$$D##A%$$9##-A#%'
D "’ 2#<
!!¹ )ÜşğØôÖşÎÉˆÎ=r¹ié®:Æˆ‹ÉVŒ¿ı—n$%?%lF
5p!?%k,%
4üÊj&'A%oA5	n$%
?&jH1—j&'
A#qA5n"!!*nE
/     ı­£ 7 A J U ` l w  ï ²O  +°TÍ²5  +²?u333°0Í²:o222°j/°eÍ°J/°3°FÍ°{2°_/°ZÍ°/°)3°	Í°#/°Í°‚/° Ö°-Í²- 
+³@-3	+°-±8+°B2°=Í°G2°=±a+±KV22°hÍ±Q\22°h±m+°x2°rÍ°}2°r±+°Í²
+³@	+±ƒ+±8-±&99±ha±#99±rm±!99°±	99 ±Z´ *-$9°	² &999°#°!901476 32 32 "=43>54&+"5'&$#"#2#& 462"&4762"$47632#"47632#"47632#"&462#"&4762"&ã³2]âÜY4"ôşØÔˆÁÎ¬şû­°şı8…µÁˆÖş×§3J33J3J33J!#%76&$4!&66&$4#&66&$4X6J33%&5L22L5¹,ÚşïÖóÔşÎËˆÎ>­êì¯5Ç†ˆË2Ş$44$&55ş}L2L2èJ7J5·J5J3ıP$6J33y#54$&56ş¢#2L23   ÿ¢  6 E Y e È ²4  +°3°/Í°2°/°(3°	Í°"/°Í°f/° Ö°,Í², 
+³@,2	+°,±7+°@Í°@±F+°TÍ³`TF+°ZÍ°Z/°`Í°T±+°Í²
+³@	+±g+±7,±%99±ZF±"99°`²LWN999±T±	 99 ±/4²5FT999°@	 <CLNZ`c$9°	³%\$9°"° 901476 32 32 "=43>&+"5'&$#"#2#& %46767#"&467>767#"&47#"&æ°1^âÜX5!ôşÙÕ‰ÀĞ«şû®¯şü8ƒ·À‰Öş×xN""&)GV@?Z>3%T<L&2‘ig’h.;)+=¸)ÚşğÖ‹ñÖşÌÌÍ>¬êé­:Êˆ‹Ì
2w'…)&+,*?TVş”,t3)a
5g5t-g‘.Ch"S);;    ıš¥ F Y i } •± ²4  +°3°/Í°ƒ/°Í°)/°>Í°"/°AÍ°–/° Ö°Í°±Z+°`Í°`±~+°ŠÍ°Š±,+°9Í±—+°6º=Òïq +
°X°gÀ±Pù°aÀº>ğz +
°|°“À±tù°ˆÀ°P³QPa+°X³WXg+°P³`Pa+º=¼ï +°X³hXg+°t³utˆ+°|³{|“+°t³‡tˆ+°|³”|“+²WXg Š Š#9°h9²QPa9²{|“9°”9²utˆ9°‡9 @PQWX`aghtu{|‡ˆ“”................@PQWXaghtu{|‡ˆ“”...............°@±Zµ DGL$9°`±A"99°~±pj99°Š³%(>ƒ$9°,²)12999 ±/4²5y999°ƒ².e999°±99°)´ ,9$9°>²%D999°"° 901;36&+6#!".546?2576$32;2"3>54.+& #" 3276?6&'&6?6&'&23276?6&'&3276?654&'"&#"Ó¨Eão§è
şÆ	sr•´†8¯®¬‘Í¾‹h½ˆPô"5ş¨İâş¢1°æf!!"
%&#A! $@ 
&&$B-#!#$(A‘"#!##2
±şè3³şm-ïşÎ¾w…Ã7­êê­>ÊˆÇ
’XÁhóÕşèÚ)şáû+1
)p#@
%&kü/"'o#A
%%l²6
2l%C
&&n	ó2	-n3
!#l   ı~¦ D X p î ²4  +°3°/Í°)/°<Í°"/°?Í°q/° Ö°Í°±,+°7Í±r+°6º=õïö +
°W°VÀ±Mù°NÀº>ğ6 +
°p°mÀ±bù°cÀ°p³npm+³opm+²opm Š Š#9°n9 @
MNVWbcmnop..........@
MNVWbcmnop..........°@±,·12<BEY$9 ±/4±599°)¶ 7Sj$9°<²%B999°"° 901;36&+6#!".546?2576$32;2"36 54.+& #" 232676&'&#"2767654&'&#"Ô©Fãi¢	èşÆ
rr–µ†8¯®«‘Î¾ŒÕ)õ!5ş§Üâş¢1±æe>3	ğ
"$1	ñ» !š" .	œ±şè3³ş5eïşÎ¾w…Ä6­êê­>ËˆÇ’4ÖóÕşèÚ)şáû;?$Ÿ&>  ü^8#/]0
!ı     "¡.   ( 6 $ °&/°Í°/°33°Í°,2°/°Í°7/±8+ 01463!2#!"& 4763!2#!"4763!2#!"&463!2#!"&2$	#..#ú÷$2$
"//"úö#z#$01#úõ#1i/%â%/0$ş%/¦$0/%#..5F0F1ığ".F22R%/0$#..   şz
â  ; … – ²  +°\3°Í°V2°/°Í°"/°9Í°Q/°•Í³(•Q+°2Í°K/°}Í°‰/°vÍ°—/°Ö°G2°Í°±5+°&Í°&±+°nÍ°n±T+°aÍ±˜+±±I99°5·(+8JWYZ}$9°&±K{99°¶MQVv†‰•$9°n°‹9°T±r’99°a²cl999 ±°9°±99±9"±%T99°2¶,.>ASaƒ$9°Q´&+BDc$9°(±EN99°•µGHM€’$9°K²Ifl999°}±{†99°‰±n99°v°p90143!2#"'&#"2654&#!"'3!264&#"327632#!"%;27>?2576$ ;2#!"3!2>54'6?654/.54?6/&#"&#" >32&+&&d*??*) $&4Tì§§vıœ&8%…v§§vzP1&&+)>>)û{&8™
$—]8^­‘ÌÍıáóIu,@†
UF?;zz.q†âş¥/‰Ò(ƒ2°^¨”7Ã#+~J=*+> 4&$T¦wv¨æ#¦ì¥QP0<+*>7ÖWq7­éè®>ÊşäÌ’ô{q¢H
)Ğo'-B;oK0şèÙ ÆˆÙX]—şìE<2zÉ     ş°
‹á   i w ‡  ²  +°?3°Í°92°n/°uÍ°/°Í°3/°†Í°,/°aÍ°{/°ZÍ°ˆ/°~Ö°RÍ°R±6+°DÍ±‰+±6R±Vƒ99°D²EN999 ±°C9°3µ%6DEg$9°†µ)/&dƒ$9°,²*JN999°a²R_x999°{°}9°Z°T90153!2654&#!"3!2654&#!"7;27>?2576$32;2#!"3!2>'6?654/.54?6/&#"&#" 3!264&#!">2&+&6(ë&22&ü(6&í%32&ü&6o˜
$–];°¯ ¬‘ÌÏıáôEs.BFl?XF?<z‚y-|âş£/‹Ñ)M&î&66&ü&5>7±]	©“5È"(V&22&(34&5&%33ÕWr7®éæ®>ÌÏŒó xg¬IPcf2&7A	;oK3şçÜ Å‰üp'6J33BXaœşåF@2~Á    ı£	Ş L Y j z Œ  ¯ ¿P ²  +±'¤33°Í°"2°/°3°¾Í°/°GÍ°³/°@Í°À/° Ö°Í°±Z+°`Í°`±k+°{ Ö°ƒÍ±+±¶+°8Í°8±+°*Í±Á+°6º=¶ï
 +
°`.°aÀ±hù°gÀº=ëïÎ +
°®°­À±¦ù°§À ·`agh¦§­®........¶agh¦§­®.......°@±Z³JY$9°`°S9±ƒ{³Gqu$9°±E…99°¶@
"$%@˜Ÿ°¾$9±8²:<»999°*²,5¹999 ±²ZŸ999°¶ *,eˆ«$9°¾´J¹»$9°²/5999°G±E°99°³°µ9°@°:901 2=4#.546?2576$32;2"36 54'6?654/.5&?6/&#"&#" 676&'&676&'&327>.327676&'&%327676&'&73276&'&>2&+&)Ö‰À´†8¯­¬ĞÀ‰Õ(E~'<[6	UCI8w‚{-x…âş¢1±æH#F" DQ" )=^'&#@^Ç"
$ ?"OD
%°
#$%A
³o"
# #EM! A]
#$%?^E2±c	§”1Î")ÕşÎ
Ì‹…Ä:­êê­>ÍŒ‹Ì4Ö‰xw I‹G'->	;oK4şèÚ)şáüY""#D#0
!,V(?$$ş©ı¦#FF2=	0&>$$ın# !#A$ü.
AR&>$$ş­\`!œşíFF,}È     şN	â L ] m ¶ ²  +°'3°Í±"V22°/°lÍ°/°GÍ°a/°@Í°n/° Ö°Í°±d+°8Í°8±+°*Í±o+±d@"$%@JNY^l$9±8±<i99°*²,5g999 ±²OP999°µ *,Z[$9°l´Jgi$9°²15999°G±E^99°a±8c99°@°:901 2=4#.546?2576$32;2"36 54'6?654/.54?6/&#"&#" ;36&+6#!">32&+&)Ö‹¾µ…8¯®¬‘Í¾‹Õ'I€%>[€6
TF?:z„|-qˆâş£2°æ2æŒ ½ëöşÆ
…5±_	¦”7“Ä"-ÕşÎ
’Çˆ†Ç7­éè®>ÊˆÇ’4ÖytŸM|‹G'-B	;oK0şéÚ*şáıXşFTÁî[`!šşîH;7~È   ıu	ê N ^ j { Œ ˜ ¨ » Ç Ü ì   2=4#.546?2576$32;2"3>54'6?654/.5&?6/&#"&#" 6?6&'&3264&#"76?6&'&32?6&'&32654&"76?6&'&232?6&'&32654&"723276?6&'&>2&+&*ÖˆÂµ†9°®­‘ÏX™Zê‡I…$;\‚7UAI:{ƒ|-‚yâş¡2´ãA#!%>$%$A
Q#&44&%2A!#!B&'#A|!#D
&%"BS#&22L2C  %>%&#B&!!A$$(A
O%&22L2A##"

$$%>3²_©˜6”Ä!2ÔşÌÎ‡ˆÇ6°ëê­=ÎXbïŒw¡I	‹D"6>	<qK1şçÛ.şâüV6
-A$?&&?'"3J32Í/
#%`'=$#bü…2
A?)@%$?,#2&%22Í4
 ,`#@'%`õ2
F@"B
%&?6$2%&22Ñ1

&`$?"%a,\e"şíEA5zĞ      ıZ	â R ` o   Ÿ ¯ °v/°W/°]Í°/°3°®Í°/°MÍ°£/°FÍ°°/° Ö°	Í°	±T+°ZÍ°Z±p+°xÍ°€2°x±+°˜Í°˜±¦+°;Í°;±+°0Í±±+±ZT³P$9°p´ac$9±x´Myi„$9°˜±K$99°¦@ !(+F‰™ˆ ®$9°;°A9°±>«99°0±2©99 ±Wv³X|•$9°]±Sœ99°@
 !+2^ek‹$9°®´P©«$9°±699°M±K 99°£±;¥99°F°>901?"&546?2576$32;2327>54'6757'.54?'".#&#&#"  676&'&7676.327676&'&73276&'&7676&'&>2&+&Õ¨xŒÍ´‡5¯®­Í´ƒHù;$ Úc±~JI‚'Q\7	YF?={…|-x‚âş¢2µâ‹ #H"#G¾ J!ø8Nø=#
"##@¹<#Ì Mş8v%$###Eô2±c	«”(,É"0³şå/–Ğ†Ã9®êë­>ÌˆÉ	şÊ'&2(
[Œºd‹yv¢
R|ŠG),S<pL4şèÚ,şãü*#"#I#á$!7M. şÏı³"!#D!ô	$3$<NıÄ•$##C '\a ›şëGK,~Í   ı™	ç L ] o  ‘. ²  +°'3°Í°"2°/°3°Í°/°GÍ°…/°@Í°’/° Ö°Í°±M+°SÍ°S±^+°eÍ°e±p+°xÍ°2°x±ˆ+°8Í°8±+°*Í±“+°6º=ÊïT +
°e.°fÀ±mù°lÀ ³eflm....²flm...°@±M²J999°S±Z99±e^²GU999°p°E9°x±‚99°ˆ¶"$%@z$9±8²:<999°*²,5‹999 ±°9°· *,XZj}$9°´J‹$9°²/5999°G±E‚99°…°‡9°@°:901 2=4#.546?2576$32;2"36 54'6?654/.5&?6/&#"&#" 676&'&3276&'&327676&'&>2&+&*Ö‰Áµ†9¯®­ÑÁ‰Õ(I(<[‚7TH?<|„|-„uâş¡2±æQ##%?™
&%#Aš!Fğ
#$%Cñ¼C
!	™
$$%B™~3±c
¨˜$0“Å!,ÕşÍ
Ì‹…Å:­ëë­=Í‹Ì5Öyu¢M}ŠD$4A
;oK0şçÛ)şàün3
,r(@$$ı‹ş³0	?¹'=%#üH:91r&>$$ı‹A]a ›şìHI)yË     ı“	à G W h { Š  ° À7 ²  +°'3°Í±"†22³'+²R—333°‘Í°°Í°/°¿Í°/°BÍ°´/°;Í°Á/° Ö°Í°±U+°OÍ°H Ö°3°NÍ°O±‹+°“Í°“±·+°4Í°4±+°*Í±Â+°6º=Šîk +
°z°‰À±rù°ƒÀº?œøï +
°|±z‰°‰À±‚ù±rƒ°ƒÀº=Ùï‹ +
°“.°¨À±›ù°®À°r³srƒ+°z³yz‰+±‚ƒ°r³‚rƒ+º=¿ï) +°z³Šz‰+°“³”“¨+°›³š›®+°“³§“¨+°›³¯›®+²yz‰ Š Š#9°Š9²srƒ9²š›®9°¯9²”“¨9°§9 @rsyz|‚ƒ‰Š“”š›§¨®¯.................@rsyz|‚ƒ‰Š”š›§¨®¯................°@±H±E99°U±99±‹Oµ@BPai$9°“±±99°··"$%;£¿$9±4±7¼99°*±,º99 ±‘²H‹€999±'±S˜99°@	 *,]d‡£¬$9°¿´Eº¼$9°±099°B±@±99°´±4·99°;°7901 2=4#.546?2576$32;2"36 54'6757'.54?/&#"&#" 6?6&'&6?6&'&3276?6&'&6?6&'&3276?6&'&3276?6&'&>;&+&)Ö‹¾´†8¯®¬Î¾‹Õ'E‚'Q‚	[K:<|…{-w…âş¥/´ç@  #B%$%AŠ-'>%$'@†!   %$'A !$@##'C(D"
%&%?”!!!
&&#@3µg§”#0•Æ"(ÕşÎ
’Çˆ„Ä7­éè®>ÊˆÇ’4Ö‹xu¢T'Óo*)U<oL4şèÚ)şâüu/#%q!B
&&jö
!'n%?

#&lü°3
.p"B
%&lï/"'o"A
&&k×<0m(?%$oı0
.o#@%%q3Zd˜şîHE0½ 	  ıª	ã M Y c p } Š ”  ®, ²n  +°hÍ²  +²&Q333°Í²!W’222°‚/°ˆÍ°]/°—3°bÍ°œ2°u/±	 33°{Í°/°3°­Í°/°HÍ°¢/°AÍ°¯/° Ö°Í°±N+°Z2°TÍ°_2°T±~+±dq22°…Í±kx22°…±•+°‹2°šÍ°2°š±¥+°9Í°9±+°*Í±°+±N²K999±…~±H99°•°F9°š²Ÿ999°¥µ!#$A­$9±9±=ª99°*²,5¨999 ±{µ
 *,$9°­´K¨ª$9°²/5999°H²9FŸ999°¢°¤9°A°;901 2=4#.6?2576$32;2"3>54'6?654/.54?6/&#"&#" 32654&#"3264&"%32654&#"32654&#"32654&#"2654&"2654&">72&+&*ÖˆÂµ†9°®­‘ÏÂˆŒê‡Ev,AFm?UF?;z‚z-}âş¡2´ã©3%&33&%34$&33L2V$&66&#5$'56&$4#&66&#5Y5J33J54L22L4I2±^§”8Ê!,ÔşÌÍÆ7¯ìë­=ÎˆÍğ‹’wj©MPcg2+1B	<oK5şçÛ-şâı’&55&$44şX$42L22'4%&77^&2&%55üÏ#3%&771&55&$44şX$43%&22xW_!›şíH:8~Å     ÿ	â M [ m y ‰ ²  +°'3°Í°"2°/°3°ˆÍ°/°HÍ°}/°AÍ°Š/° Ö°Í°±N+°SÍ°S±\+°bÍ³tb\+°nÍ°n/°tÍ°b±€+°9Í°9±+°+Í±‹+±N²K999±n\±H99°t³Ffh_$9°b°z9°€·"$%A}ˆ$9±9±=…99°+²-6ƒ999 ±²\b999°@ +-PXfhnqt$9°ˆµKvƒ…$9°²06999°H²9Fz999°}°9°A°;901 2=4#.546?2576$32;2"3>54'6?654/.54?6/&#"&#" 2654&'&'32654'&'&'32654'>32&+&)Ö‰À´†8¯®­ÏÀ‰Œë‡I}'=[‚7UH?:zƒ|-‚wâş¢2±åyY€VJ %+I?’gi‘UGB?I&2=,):c1F8®`
¨•7”Â#1ÕşÎÌ‹…Ä:­éê¬=ÍŒ‹ÌñŒ‹zwœN{ˆE.-A	:nI1şçÚ*şáşé=VU>)ˆ%,/ş-i’gX}]B	:d5tš)::)Di U‡[] šşìH<2zÒ      ı	á Y k {   ³š ²4  +°3°/Í°¢/°­Í°2°)/°œÍ°"/°TÍ°‘/°MÍ°´/° Ö°Í°±l+°rÍ°r±+°§Í³ƒ§+°|Í°|/°ƒÍ°&2°§±“+°EÍ°E±,+°7Í±µ+°6º=Òïq +
°k°yÀ±cù°sÀ³dcs+°k³jky+°c³rcs+º=µï +°k³zky+²jky Š Š#9°z9²dcs9 ·cdjkrsyz........¶cdjksyz.......°@±lµ WZ_$9°r±T"99°|°R9°²‹999°ƒ±%°99°§´(…œ¢ª$9°“³)12/$9±,E±I™99°7²9B—999 ±/4²5ˆ999°¢².w999±)­µ ,79$9°œ´%W—™$9°"² >B999°T±R99±M‘°G901;36&+6#!".546?2576$32;2"36 54'6?654/.74?6/&#&&#" 3276?6&'&32?6&'&32?6&'&>;&+&32?656&'"&#"Ô©EâŠÃèşÄ
rr—µ†8¯®­‘ÎÀ‹Õ)Fz'B\€5UK9;{‚y-ˆvâş¢2±æh! !
%&#AŒA< 
&&$A+""	7#$(A~5´bH‘c6’Å#-‘E
:"#2
±şé3µşBXïşÍ¿w…Ä6­êë¬=ËˆÈ
‘5Ö‹zv¢I}‡C,/A	;mJ1şçÚ*şáû+2
(p#A
&&kàECm#A%&lÂ1Hm%B
&&n1Ya"fÀ¢0<2}ÉüSEEo3
!"m   ı¦	é Z k } 
 ²4  +°3°/Í°)/°ŒÍ°"/°UÍ°/°NÍ°/° Ö°Í°±„+°FÍ°F±,+°8Í±+°6º>@ñ" +
°j°iÀ±bù°cÀº=òïé +
°|°{À±tù°uÀ ·bcijtu{|........·bcijtu{|........°@±„@)/12NX[l~Œ$9±,F±J‰99°8²:C‡999 ±/4±599°)· 8:gy$9°Œ´%X‡‰$9°"² =C999°U±S~99°±Fƒ99°N°H901;36&+6#!".546?2576$32;2"3>54'6?654/.54?6'.#"&#" 3276&'&23276&'&>32&+&Ô©Fâh¡	èşÄ
rs–µ†8¯­­‘ÎÀ‹Œë‡F'<[‚7	"}<:zƒ|-„zâş¢2±æ` A÷
#$%A
÷½"= 
$$%@
 „5±c	§”7“Ä"-²şé3´şŠîşÍ¿w…Å7­êë¬?ËˆÈ“ñ‹zyŸM{ŒG*+A	;oK0şèÚ*şàû//	Cª&?
##üQ3.
Ch'>
"$ı“,[`"šşîIC/~Ç     å  )  °/°Í°*/° Ö°Í±++ 0146$; 2#"$&732>7$ 'xË™zÈXÉş¥ÍœşçÉwÃaËi]½¢uşûşÅ—ûŠ™Ëy^ËşâhÍş£ËxËšzØ’UIƒÌy6Såªşû   ş~	õ{  ; w ƒ ù ²  +°]3°Í°W2°/°Í°#/°9Í°Q/°‚Í³)‚Q+°3Í°K/°oÍ³zoK+°m3°kÍ°„/°Ö°Í°±6+°'Í°'±}+°fÍ°T Ö°bÍ±…+±±GI99°6·)-8JXZ[o$9°'°K9°T¶MWkmxz‚$9°}°9°b°d9 ±°9°²999±9#°&9°3µ/>ATbu$9°Q´'-BDd$9°)±EN99°‚´GHMr$9°K²If}999°z°x90153!2#"'&#"32654&#!"3!264&#"27632#!"%;27>?2576$ ;2#!"3!2>54'654.#"&#" 632&+&$s*?@)( $%4Svw¦§vı&8)”v§§vzP0P+)>>)ûl&8™
$—^8^®ÌÌıáó-zY–Ïq÷§}âş¥/ˆÒ)£s•œß6™Ù#%]&<+)? 6LS¥vw¨6$¦ì¥P(&1<V>6ÕWr5­éç¯=ÊË’ôwa ÃrÏ•X¹AşéÚ Æ†Ámà›ad™«     ş¹
yw   U b n ƒ ²  +°=3°Í°72°Z/°aÍ°/°Í°1/°mÍ°+/°NÍ³eN++°L3°JÍ°o/°hÖ°FÍ°4 Ö°BÍ±p+±h4°j9°B°D9 ±1´$4BD$9°m³(-Rj$9°+²)Fh999°e°c90153!264&#!"3!264&#!"7;27>?2576$ ;2#!"3!2>54'654$#"&#"3!264&#!"632&+&&ú%33%ü&8&û&23%ü&7z˜
$˜]:`­’ÍÍ’ıá‘õ/{—şş™ô¦ˆš•şù³ŒÑ)>&ü&56%ü%4l›Ş4Ú"'[(6L67$2L56ÔWr6­êè¯=ÊÌ“ôqe¡¾˜–²A~ä‘ Á‡ü‹J2L6ìhİeX™¯    êu  1 = Œ ²  +°/Í°(/°3°<Í°#/°Í³4#+°3°Í°>/° Ö°Í°±7+°Í°°	 Ö°+Í°+/°	Í±?+±+´24<$9°7°99°	°9 ±(/²	 999°<±999°#±799°4°29013!2>54'654$#"&#" 46?6$3232#!"&632&+&Œòó-y”şÿ˜ï®z¥áş§1³ã¶²‡I ¬¯¾ÌËû‹Ìn–İ7™Ú!,óófo”Ì˜–ºEşêÚ(şâ¹…ÂM­éê¬PËŒÎĞÒjÛca™²     ıª÷y < I X h |    ¬= ²  +±'“33°Í°"2°ƒ/°ŠÍ°E2°/°«Í°/°7Í³£7+°53°3Í°­/° Ö°Í°±=+°2°BÍ°J Ö°PÍ°B±Y+±}+° Ö°—Í±¦+°/Í° Ö°+Í±®+°6º=§îÒ +
°y°xÀ±qù°rÀ ³qrxy....³qrxy....°@±=²:I999°J°9±}Y´7Rci$9°°59°—´ƒˆ¡$9°¶$%3™£«$9°¦°¨9°+°-9 ±Šƒ±i}99°²FN‹999°±99°¶ +-Uvœ$9°«³:¨$9°²/¦999°£°¡901 2=4#.546?2576$32;2"3>54'654$#"&#" 676&'&676&'&327>.23676&'&%327676&'&7327676&'&632&+&)Ö‰À´†8¯®­‘ÌÀ‰Œë‡.~—şş—ù¥ƒâş¢2°æ=# E" CQ!!$Bi('#?kÄ"
# @"O #E¼#$%@Ào$$ #ELB
i%$%>innšœİ7×#1ÕşÎÌ‹…Ä6­éê¬>Ê‹ÌñŒv`™É——¹FşçÚ*şáü_#"#E 0	"*L'@#$ş­ı$GF3.=‡'=#$ıy'" #D û9	-L%?#$ş²şjŞœca¹     şMîv > O Z £ ²  +°*3°
Í±%H22°/°3°YÍ°/°9Í³R9+°73°5Í°[/° Ö°Í°±T+°1Í°" Ö°-Í±\+±"@
'(5<@KPRY$9°T°V9°-°/9 ±
²+AB999°µ -/LM$9°Y³<V$9°²1T999°R°P9012=4#.546?257>32;2"36 54'654$#"&#" ;36&+6#!"6 &+&P‰¼i‹¾µ…8~Æt®«Î¾‹Ö&2—şÿ—şŸ‚šáş¢1³ã0ç¾éõşÆ
 k:Û7›Õ!/i¿‹V
È‰†Æ7rºiæ¬>Í‰È

/ÕfvŸ¾˜–¹DşçÛ)şâıZşCSÄÔjÜ_a•¾     ıu	€ = M Y j { ‡ — ª ¶ Ë Ö  2=4#.6?2576$32;2"3>54'654$#"&#" 6?6&'&3264&#"76?6&'&32?6&'&32654&"76?6&'&232?6&'&32654&"723276?6&'&6 &+&ˆì‰Â¶†8°®­ÏÂˆë‡-—şı˜wÜP”ãş 2´ä9#!%>$%$A
Q#&44&%2A!#!B&'#A|!#D
&%"BS#&22L2C  %>%&#B&!!A$$(A
O%&22L2A##"

$$%>2o:İ6šà"-‹ğ‘ÍÇ7°íë®>ÏˆÍ‘ğ‹tcŸÈ™—cWEşçÛ.şàüT6
-A$?&&?'"3J32Í/
#%`'=$#bü…2
A?)@%$?,#2&%22Í4
 ,`#@'%`õ2
F@"B
%&?6$2%&22Ñ1

&`$?"%aoßkZš»    ı	{ ? N \ n ~  š Â °J/°/°3°™Í°/°:Í³‘:+°83°6Í°›/° Ö°	Í°	±+°2°‰Í°‰±”+°2Í°2°. Ö°Í°/°.Í±œ+±	@:=@HOU]hoq€$9°‰°89°@	 *6wŠ‘™$9°”°–9°.°09 ±J@  *0KRXz{$9°™³=–$9°²2”999°‘°901?"&546?2576$32;2"6?>54'654$#"&#" 676&'&776&'&327676&'&7676&'&327676&'&632&+&Õ­yÏ·‰8°²	®Ğ¶…Lé	SÑ„Ş.{˜şúšû¥‹åş¡2·æ•"$I#$DÄ"DBê	LëE""$D²QÂ!Iş>ƒ"
$"$Eîm›¡á7œß"(µşè4
œÍŠÊ<°ìê¯?Ò’‡Éÿ K%Ş•ë†eyœÆœ—¶Eşäà)şİü!"##I"ì%":JK
ş"ıÕ$! H%î'%Nıóz$##$D´má¡d^œ¶    ı§óv = L ` r ~ ²  +°)3°
Í°$2°/°3°}Í°/°8Í³u8+°63°4Í°/° Ö°Í°±>+°CÍ°C±x+°0Í°! Ö°,Í±€+°6º=æï» +
°_°^À±Wù°XÀº=êïÊ +
°q°pÀ±iù°jÀ ·WX^_ijpq........·WX^_ijpq........°@±>²;999°C°9°!@&'48EMasu}$9°x°z9°,°.9 ±
°*9°¶ ,.H\n$9°}³;z$9°²0x999°u°s9012=4#.546?2576$32;2"36 54'654$#"&#" 676&'&23276&'&32676&'&632&+&P‰½i‹¾µ…8°¯«Î¾‹Ö'-}–şş–ù¥“âş£2°æIE!D
 
'&#@
 	&Eõ#$'Bö»"
2	 &$'? ¤kœÜ7™Ü!-i¿‹V
È‰†Ç6®çå¬>Í‰È

/Õsa—Ï–—¹EşçÜ)şáü€@#$c#@%%ı ş±!F¤#@%%ü[:2	"c!B%%ı kÚœda™»   ı“ös < M ^ q  “ £ ¯W ²  +°(3°
Í°#2°S/°—3°YÍ°2°/°3°®Í°/°7Í³¦7+°53°3Í°°/° Ö°Í°±N+°UÍ°U±r+°xÍ°x±©+°/Í°  Ö°+Í±±+°6º=ªîß +
°L°\À±Dù°VÀº=]íÑ +
°p°À±hù°yÀº=Òïq +
°’°¡À±Šù°›À°D³EDV+°L³KL\+°D³UDV+º=«îà +°L³]L\+°h³ihy+°p³op+°h³xhy+º=§îÓ +°p³€p+°Š³‹Š›+°’³‘’¡+°Š³šŠ›+°’³¢’¡+²KL\ Š Š#9°]9²EDV9²op9°€9²ihy9²‘’¡9°¢9²‹Š›9°š9 @DEKLUV\]hiopxy€Š‹‘’š›¡¢........................@DEKLV\]hiopy€Š‹‘’š›¡¢......................°@±N³:=$9°U°_9°r°d9°x±799° @%&35‚ƒ”¤¦®$9°©°«9°+°-9 ±
²)I999°S°}9°Y°9°¶  +-Z$9°®³:«$9°²/©999°¦°¤9012=4#.6?2576$32;2"36 54'654$#"&#" >?6&'&32?6&'&3276?6&'&6?6&'&76?6&'&2?6&'&632&+&P‰¾iˆÁ´†9°®­Ì¾ˆÖ(,y—şş—õ§‹•ãş¢1µã?$++
%&"BŒ""<
%&$@ „!# 
&%#C"#$?%&#B0!!"%$(?#"E
&&%?
 $kšœÜ3šÚ"'i¿ŒVÍÆ9¯éç­=ÌˆÍ
0ÕgnŸÀ——²EşæÜ*şåüs1	' l(@%#oó1Fk%C
%%pü¯2
.l(A%$oö3
 ,l(>%$oÂ1	-p%?
&&kÿ2Bn(@%&mgßœfWš¯  	  ı­ùz ; F P \ g s } † ‘ ²Z  +°TÍ±O„22°k/°qÍ°K/°€3°PÍ°@/²'w333°EÍ²"{222°`/°	3°eÍ°/°3°Í°/°6Í³‰6+°43°2Í°’/° Ö°Í°±<+°G2°CÍ°M2°C±h+±Q]22°nÍ±Wb22°n±~+°t2°ƒÍ°y2°ƒ±‹+°.Í° Ö°*Í±“+±<²9999±nh±699°~°49°ƒ²‡999°¶$%2ˆ‰$9°‹°9°*°,9 ±e`°!9°µ *,$9°³9$9°².‹999°‰°‡901 2=4#.546?2576$32;2"36 54'654$#"&#" 3264&"3264&"%32654&#"3264&#"32654&#"264&"264&"6 &+&*Ö‰Áµ†8¯®­‘ÎÂ‰Ö).~—şş—ø§ âş¢2±æ©#%32L2$&23J"6#%66%#64%&55&$55$%66%#6YJ32L44L23J5il:Û6šÛ!/ÕşÍ
Ì‹…Ä:­êê­=ËŠÍ5ÖrdšÈ˜–¹EşçÚ*şáı#2L22ş}L2L5^%98&#55\$43J55üÔ%65&#55/!2L22şW$42L55\lŞ^fšº ÿşÿö~ ; J [ g s è ²  +°'3°Í°"2°/°rÍ°/°6Í³j6+°43°2Í°t/° Ö°Í°±<+°AÍ°A±K+°QÍ³bQK+°\Í°\/°bÍ°Q±m+°.Í° Ö°*Í±u+±<²9999±\K±699°b²VXN999°Q°49°¶$%2hjr$9°m°o9°*°,9 ±²KQ999°@ *,>GVX\_b$9°r´9do$9°².m999°j°h901 2=4#.546?2576$32;2"36 54'654$#"&#" 2654&'.'32654&'&'&'32654'632&+&)×Œ¿¶†8°¯«‘Î¾‹Õ).~—şş—ô¯„˜âş¡1±æy[~WK!!&,H?“fg”2#J@	>Gt<.):c1jkœÜ6 Ö!-ÕşÍ
’
Èˆ‡Ç5­êé®=ËˆÈ
’5Öv`™Í——»CşèÛ*şáşé<XV>)ˆ'#+0ş,e””e+x3_@>DÅƒ+99+Ak UijÚœe`š¼     ı÷y J ] o € “ ŸD ²4  +°3°/Í°)/°Í°"/°EÍ³–E"+°C3°@Í° /° Ö°Í°±^+°dÍ°d±™+°;Í°, Ö°7Í±¡+°6º=“î +
°\°kÀ±Tù°eÀ³UTe+°\³[\k+°T³dTe+º=Äï= +°\³l\k+²[\k Š Š#9°l9²UTe9 ·TU[\dekl........¶TU[\ekl.......°@±^µ HKP$9°d±E"99°,@%12@CpyŒ”–$9°™°›9°7°99 ±/4³5n|$9°)@	 79i†$9°³%H›$9°"² ;™999°–°”901;36&+6#!".546?2576$32;2"36 54'654.#"&#" 236?6&'&6?6&'&32?6&'&3276?6&'&632&+&Õ¨Eâz³	èşÄvr—µ†8°¯­‘ÎÀ‹Õ),zZ–ĞqvØNƒãş¢2±æh" 	D
'%#A!!#@ 
%&$A."!?"$(B‘"#
'%$@j›Ü4Ö"1°şå2±şLJòşÈÀx†Ç7®éé®>Ë‰É
“6×ta ¿rÏ–Y`VFşéÜ)şàû+5<q#A
&&kü0#'o(@%&m	±3	@q#@
'%jí1	(o#A%&mfİeYš¹      ığv K [ m y ²5  +°3°0Í°*/°3°xÍ°#/°FÍ³pF#+°D3°BÍ°z/° Ö°Í°±L+°RÍ°R±\+°dÍ°d±s+°=Í°- Ö°9Í±{+°6º=œî¬ +
°R.°SÀ±Zù°YÀ ³RSYZ....²SYZ...°@±L·	 I$9°R±99°\±F#99°d°D9°-·&23Bfnpx$9°s°u9°9°;9 ±05°9°*· 9;Wi$9°x³&Iu$9°#² =s999°p°n901;36&+6#!".546?257>32;2"3>54'654.#"&#" 276&'&327676&'&632&+&Ô§Dâo§	èşÆ
rr•³†9~Çs­­ÏÀˆ‹ê†-}Y–Îq÷¥Ÿáş¢1°æN!C
"#%A
şûºB ¯
$$%@
­²lœ›Ü6šÙ"-²şè/³şAXìşÎ¼y…Ã9q»jê¬<ÌŒŠË‘ğ‹ua”ÍqÎ–Y¹EşéÚ)şáû*.
@´%?#$üKB@-p%?#$ıŒfÚ›e`š·   hXO 	  O  °/°(Í°/°Í°/°53°Í°J2°P/°Ö°Í°±+°Í°±+°.Í°.±9+°!2°DÍ°2±Q+±±99±9.±J99°D°=9 ±(°9±µ >C$9014632#"&264&#"3276&'&#"'&'&547676327>'5'.'.#"rPOqqOPR<<)*eD$~Pê;(2Q2'@*/dS0 &	+!m@Q}#E8 rr rìT<R<ıÃ{`2;²)	D,<X=28'8 91_~       ¨ 8 S ’ ²  +±'>33°Í°"2°/°3°0Í°/°3Í°T/° Ö°Í°±O+°HÍ°H±+°+Í±U+±O´69:$9°H²3>999°´$%0C$9 ±°9°@	 +:CHKOR$9°0²6999°°901 2=4#.546?2576$32;2"3>54.+& #"  327654&"4&"'&#"*Ö‰Áµ†8°®­ÑÂ‰Œë‡ô#4ş§İâş¢2°çç)-4Lx6L2u'(ÖşÎ
Ì‹…Å;­éé­>ÎŒ‹Ì‘ğò‹ÖşèÛ)şßşËLşê$%2v©&22&şWv   ÿÎ¥ : g ³ ²  +°*3°
Í°%2°
°J Ö°?Í°/°3°2Í°/°5Í°h/° Ö°Í°±;+°MÍ°M±G+°BÍ°B±"+°-Í±i+±;²8999±GM´5?[e$9°B±99°"³'(2$9 ±J°+9±
@
 -;BDGM[e$9°2´8`c$9°°9012=4#.546?257>32;2"36 54.+& #" 32 54&"#"&5467?654/&#"P‰½i‹¾µ…8}Çs¯¬Î¾‹Ö'ô"5ş§Üáş¢2±å˜wËv¸6L7™lj™rS,E(ÂÂ$%4% Ói¿‹V
Èˆ†Ç7r»iæ­=ÎˆÈ

/ÕóÕşåÛ*şáşÁwËxµ%66%kššk`–*%(Ç#(Ã6L&ô       £ 9 W  ²  +±'E33°Í°"2°/°3°1Í°/°4Í°X/° Ö°Í°±B+°HÍ°H±+°+Í±Y+±B³7:$9°H²4S999°´$%1N$9 ±°9°µ +AIKS$9°1²7999°°901 2=4#.546732576$32;2"3>54.+& #" 32?32657654'&#")Ö‰À´†8¯­¬ĞÁˆ‹ê‡TÄk"5ş¨Üâş¢1±åå)'v2&%6x@Bşì&'şíÕşÎ
Ë‹„Ä=­êê­=Í‹ŠÌñŒkÂŒSÖşçÚ)şáû(zşX&66&¤v11*&şî     ¨  0 _ ²  +°Í° /°-3°	Í°'/°Í°1/° Ö°Í°±+°Í±2+±²	999 ±°9° ± 99°	²$*999°'°%901476 32 32!& 7!>54&+"5'&$#"+æ±2^âİY4#ô‡ëŒûVÖşÖ¶Á‰ª‰ÂĞ­şú®¯şı8†µ¸ )ÛşîÖ‹òğ‘
2Ö‹ÍÍ‹ŒÍ=­êê­=Ä   ‚‚   A °/°Í°/°Í°/°Ö°
Í°
±+°Í±+±
²999 ±³ $9014632"&264&#"rPOqqR<<)*õ rr síT<R;   Ö¦z   °/°Í°/°Ö°Í±+ 013!2654&+654'&#"54&#")2))„! şd))))'şc…)*       å²   °/°Ö°Í±+±°9 0132764&"4&"'&#" %& 0Hq3H3q"$2>#şûH1p¿$00$ıAp1    nrG   + k °/°!Í°/°Í°/°Í°(2°°"Í°,/°Ö°
Í°
±+°Í°±+°Í°!2±-+±
²999 ±"³ 	$9°±99°°%9014632"&264&#"265!2654&#!!264&#!"rPOqqR<<)*!.!1! şÏ˜ş5 rr síT<R;ü½!!”" # 0         	   - P \ l { æ ²  +°Í°/°x3°Í°q2°;/°NÍ°[/°UÍ°|/° Ö°Í°±.+°8Í³&8.+°Í°/°&Í°8±Q+°XÍ°X±>+°JÍ³]J>+°eÍ°J±m+°uÍ±}+± °9±.±!)99±Q8±5N99°X°;9°>±CM99±mJ°b9±ue±99 ±´26@EF$9°³.8>J$9±N;²)jk999°[±&]99°U³!be$901476;2+"&4763!2#!"&47632#"/&;26'&54632;27654$ 5462"&4?632#&476;2+"&+Ş'34&Ş'8c'–'67&øj&7Ú'&š3'#Ÿ9²
UäŸáUµ<šşùşÎşù™İ6L88L6Xš'(5¡%(3ø(ß'78&ß%4{*3'&66ş%4L778)œ&(3ı7‹nhˆŸààŸ‰g
qˆ™ššşùµß&88&ß&88Ñ'œ5')2ıÑ+3'&66   ÿÿes   4 B R q ²  +°Í°'/°2Í°@/°9Í°S/°5Ö°=Í°=±C+°KÍ±T+±=5±2'99°C°*9°K°.9 ±'²!,-999°2²Q999°@²C999°9³HK$90154763!2#!"&47632&/;27>32;2'&$#"54632#"&4?632&-¤(89'ø\(9Ò*% Q  Ÿ0¼stÀ06şÍÁÀşĞ•4'(66('4b¤)'2!$C^*4'&99pT &% ıîfxxfµââüä(87)ä)67Õ& 6)* <    …87   3264/!264&'!7654&#"#$2p¿$//$ıAp2$!şúŞ&ÿ 0Hp3H3q"$2ÿ  	 ( ÀU™  % 5 K ] m ƒ “ £ W °2/²$’ 333°Í°s2°¤/°Ö°&Í°&±U+°^Í°^±‹+°”Í±¥+±&°79°U±0]99°^°	9°‹³?ho“$9 01&76?3'&'&'65'&'&'&"76767676&&76?3'&'&'65'&'&'&#"76767676&&76?3'&'&'65'&'&'&#"76767676&(=O8q›H#!AN,/j._E8O"ô8& y<O8q›H#"?P-/k-^E7	Rô7'yB<O8q›H#"AN-/j.^E7	Rô8& yBrO†>N=3hG# n¸
DJH!!®/#K
-ıB€sO†?M;5fH# 
o¶DKH!"¯0$I	-p€sO†?M;5hG# n¸DJH!"®/#K
-   şÂ
HØ   V e r Y °[/°cÍ°/°Í°/°Í°4/°&3°qÍ°T2°-/°QÍ°s/±t+ ±4³ 9>$9°q´*0'ln$9°-±+D99°Q±Of990153!2654&#!"3!2654&#!"75;27>?2576$32;2;2'&'6?6&#'&?6/&&#" 3!2654&#!">&+&6'Á&54'ø?&7)Á%22%ø?&5š	&—Z9®¬©g¨)—#t,B•#Z¯ş°_uŞş¥2‡Ë$Å%44%ø;&5Ë8½i¬—8“¼"3c$22$'56&&6&%22İSj5¬çä«=nZYhªF
) ‘>
+›1şèÙ Âûæ&6&%228\d
§şİF8:yÒ     ¯P &  °/°	Í°'/° Ö°Í±(+ 013264&#"&546332?654/&"zÕ~+*‚µªs#* ¡¡>- ¸øå~Ô{.>)¶‚|¸"- %#£,!şù     u[Š - / °/°Í°./° Ö°Í°±+°Í±/+±³ (+$9 0132$54&"#"&5467?654/&#" —–™ ”3J6İ›Ú©p):GÄÄ!(6)Èşö¢—şÿ•” ™&66&İİˆİ'"$88Â.)Æ5&'&#şÇ     É9{   °/°Í°/±+ 017!36765&'&"!1#¾n3$"şù"$2qıA$/$2s!$2%& ÿ0Hs3      ESİ  ! - 7 °./° Ö°
Í°
±+°Í³(+°"Í°"/°(Í±/+±("²999 01467>7"&4676767#"&47#"&Q%
',J[„^M4&IC>O)3–nl–¢k0=,.=)†,#.1‚+B^^ş‡.{4bA;g7x/n•˜KEp#W,;;    	ë_  < f °/°Í°/°Í°"/°:Í°4/°)Í°=/°Ö°Í°±7+°&Í±>+±7²)-9999 ±±99°°9°°9±4:±&099°)°-9013!2"'&#"3264&#!"3!2654&#"327632#!").@?^&(9Zw}²³|ùá(9'Z}³³}{U7('-.??.÷¦(9	'@/.=7&(X¬ø³86%®{|°U-)4!@\>8     ÿÿ
6Î   : ^ l { ‰ ï ²8  +°03°$Í°)2°/°†3°Í°2°H/°ZÍ°j/°cÍ°Š/° Ö°Í°±;+°EÍ°E±_+°gÍ°g±K+°UÍ°U±|+°ƒÍ±‹+± °9°;² 999°E±=99°_±%B99°g²4ZH999°K²)3N999°U±Sm99°|²-qy999°ƒ±rt99 ±$8°39°·'4=?CMPS$9°³;EKU$9±ZH±y99°j±m99°c³qt$901476;2+"&47632#"/&4763!6!2#!"'%#!"&;26'&54$32;27654.#"54632#"&4?62#"&46;2+"& $'ø+::+ø+@c$'*¯:)'$³Õ-LQ'+==+ş—şÿÿş¥+=cBÉf ´³ıeËBf«ì‚í­f<.-;;-.<¥­X<´")+79*û+>>+û+8µ(">+.>A~+°#'-<­"úŒ-8şÈ;*+>òò>x›{•´üü´–z{Ÿ‚ì«ee«ì9õ.;<-õ.;;ë("°=+. ­;ıŒ+>>+,@>     şĞ
µ   8 [ g w … ã ²6  +°03°#Í°*2²'  +°/°‚3°Í°{2°G/°YÍ°f/°`Í°†/° Ö°Í°±:+°DÍ°D±\+°cÍ°c±J+°TÍ³hTJ+°pÍ°T±x+°Í±‡+± °9°:²999°D°9°\²5AY999°c±'G99°J²1MX999±xT³.-mu$9 ±#´>BLOP$9°³:DJT$9±YG±u99°f°h9°`³mp$901476;2+"&47632#"/&4763!2%63!2#!'!"&;26'&54632;27654. 5462"&4?632#"&46;2+"& -ö+89*ö+>_ +.­JJ'#%³Ò +Wû ÿ`+==+şâş±ş·şë+=d>	Ç_ü²°û_ÉBeªêÿ êª¬=V==V=®.,:±%%*88+÷+==+÷*9©,9+-=?q-  ®FJ®ú£* íí<V=şÑ/=ìŸyw—°÷ø¯—w}›ëªeeªBø+==+ø+==é-® =+-®;ı“+9:*+?=    şÖ>  / a °/°Í°&/°Í°0/° Ö°Í°±+°*Í°*±"+°Í°±+°Í±1+±*°.9°"²999°°9 ±&³ $90154674632#".732654&/&54&#"~q°€±q|‘ú”“ú’»Ñ“•×gYH64IXcõˆëO"€²²€ûŞOëˆ”ú‘‘ú”•ÓÖ’d©/z4DD4û†/¨   ÿã0  , °/± +°Í³ +°Í±+± °9±°9 0152654&'4&#"œÜ¢Šcb‰õr ¡qeš
üñš     şÖ>  / B ~ °/°Í°&/°Í°C/° Ö°Í°±+°*Í°*±@+°8Í°8±"+°Í°±+°Í±D+±*±.099°@°29°8³&$9°"°39°±599 ±&µ 2<$90154674632#".732654&/&54&#"2654&'4&#"~q°€±q|‘ú”“ú’»Ñ“•×gYH64IXcSœÜ¢‹cb‰õˆëO"€²²€ûŞOëˆ”ú‘‘ú”•ÓÖ’d©/z4DD4û†/¨er ¡qeš
üñš    Í " ; O c x  °S/°]Í°&/°2Í°/°LÍ°D/°sÍ°j/°ŠÍ°/°Í°/°Ö°yÍ³dy+°Í°/°dÍ°2°d°< Ö° Í° /°<Í°°# Ö°6Í°y±m+°Í°±…+°Í±‘+±#°!9±d<°P9°6±a499±my@	&2BGLSV_h)sŠ$9°°9 ±&]³PVYa$9±2³#),4$9°L°99°D²	 G999°s²BF999°j°!9°Šµdhl$9°²99901!27>54'>54'654'&!"32654&#"#"'>'.747>?327"&'&32654&#"#"'&#"4767!27#"'&'&4767632#"'&'&J‡{ioŒ¢êfÈş~¶”ŸÅ!yKb)¹Œº$$nFqF3<W	;$¦İaO	")¬À­*"“mo–&0(^R10$
HÅW¯š*r|»¼|w(Y.‰’ÍÎ”Š--Š”ÎÍ’Š-ÎG2_fE#wMSZF…  ŒY5,EcM:9ş|KUUK&  2
(ö	
7""ıÑAFFA(11&4i %!%%!%+(++(+"+)++(,      è¥   °/°Í°/°Ö°Í±+ 0132732654&#!";"œ)))şÍ((…şbL>…)*2))(şb   ³N   7?7673265&'&'1$#q3%#4p$%1ÿ&&ÿ õ$3pıA$00$¿p1$%şü       ş   % 5 B °/°Í°!/°Í°6/° Ö°Í°±+°
Í±7+±³+0$9 ±!³ 
,4$90146$32#"$&732>54'&#"76/&6&yÍœÎzzÎşäœ›şäÍz¨¡¡yŞ¡_²²ôyİ _CZZVıªœÌzzÍşä›œşãÎyyÍ¢şíŸ_ İyô²°` Şşï
ë
ü	şÿ     ş   % 6 B °/°Í°!/°Í°7/° Ö°Í°±+°
Í±8+±³&+$9 ±!³ 
*/$90146$32#"$&732>54'&#"47%6#"/&/&yÍœÎzzÎşäœ›şäÍz¨¡¡yŞ¡_²²ôyİ _\ø	g	æœÌzzÍşä›œşãÎyyÍ¢şíŸ_ İyô²°` Şúı¤æh     ş   % 6 B °/°Í°!/°Í°7/° Ö°Í°±+°
Í±8+±³',$9 ±!³ 
(4$90146$32#"$&732>54'&#"%&6#"'yÍœÎzzÎşäœ›şäÍz¨¡¡yŞ¡_²²ôyİ _^
Zå
h	œÌzzÍşä›œşãÎyyÍ¢şíŸ_ İyô²°` Şlù	hæ      ÿşÿ    / D ²  +°Í°/°Í°0/° Ö°Í°±+°	Í±1+±³/'$9 ±³	 #($9014$32#"$&732$$ 	62/&&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢N  ÿí

ï
ıÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şëş\Xı¨YY     ş   % 6 B °/°Í°!/°Í°7/° Ö°Í°±+°
Í±8+±³&2$9 ±!³ 
.3$90146$32#"$&732>54'&#"4?6?632'%&yÍœÎzzÎşäœ›şäÍz¨¡¡yŞ¡_²²ôyİ _Ï
ç
g	øı¢
œÌzzÍşä›œşãÎyyÍ¢şíŸ_ İyô²°` Şq
h
åı£ø      ş   % 6 B °/°Í°!/°Í°7/° Ö°Í°±+°
Í±8+±³61$9 ±!³ 
)5$90146$32#"$&732>54'&#"632&yÍœÎzzÎşäœ›şäÍz¨¡¡yŞ¡_²²ôyİ _eú	
hæı£

œÌzzÍşä›œşãÎyyÍ¢şíŸ_ İyô²°` Şş]

ç	h
	ø
    ÿÿş  " 2 G ²  +°Í°/°Í°3/° Ö°Í°±+°	Í±4+±µ$,$9 ±´	 %0$90146$  $&732$54.#"%&6?6#"'{Î8ÎzzÎşãşÈşãÎzª±°ö£¡_¢Şzyİ¡`N
î
ë
ı
şœÎyyÎşäşÆşäÍyzÎ›õ±°¡¢yŞ¡__¡ŞŠYYı©

     ÿÿ    / F ²  +°Í°/°Í°0/° Ö°Í°±+°	Í±1+±´!&$9 ±´	 %-$90146$ #"$&732$$#"476'{Ï8Î{{ÏşãœşâÎzª³±õ£¢¢şê£¢şë¢øYYYı§ÏzzÏşâşÆşâÍzzÏœõ³±¢D¢¢şë«
ğ

î
 ÿ      ÿc% . S £ °/°7Í°+/°2Í°D/°	Í°K/°Í°T/° Ö°/Í°/±+°Í°±>+°Í°±A+°Í±U+±/·$&+,4K$9°µ 79FH$9°>³	;D$9 ±7±&99°+°;9°2²-9999°Dµ/ 4>F$9°	³HNQ$9014676$3232"&547#"&547&'+5.73273273265>54&#"654&#""&#"½‘)¹´*´şOFwZ”d.mšm]† S%}	¬î•´OC¸|‹bBb[@J¶€YJ	Üœ–Ú~µè–í ´æá®û³`«=_•dŠ7BMnnM†]@2.WúÇ€´$wbL[+‡O±/'-šØĞ•³     ™eû   ' 3 ? M [ e s   › Ú °%/±<p33°Í±7i22°/±c~33°Í±^w22°1/±JŒ33°+Í±C…22°/±X™33°Í±Q“22°œ/°(Ö°.Í³".(+°Í°/°"Í°.±\+°aÍ°a±‚+°‰Í°f Ö°mÍ°‰°– Ö°Í°/°–Í±+±(±%99±."²+14999°\´8@N$9°f²9_c999±‚a±Gt99°m°U9±‰±“™99°–°{9 01463!2#!"&463!2#!"&4632#"&4632#"&463!#!"&463!2#!"&463!2#!"&462"&46;2+"&463!2#!"&46;2+"&4632#"&2+a+21,ıŸ+22+<+33+şÄ+2i;#)31+%9˜/"*42,$-i4*™^9%şg,2;#™*32+şg%9Q3+a$:9%ıŸ,2:H:9J9¤3*Ç*31,Ç+2]:$G#.-$ş¹%9/;#Ñ"0.$Ñ%9$/#+33+$.2$//$,11£$..$+32üz#;9%,24¢%99%,23ı³%9^*43£#;9%,24d$.0"*43ı´"11"*33şï%98&,22g"10#+23g#;:$+34d#/.$+33     ı­£ 7 B L X e p z …U ²]  +°cÍ²5  +²Jƒ333°0Í²E}222°V/°QÍ°A/°x3°<Í°t2°o/°jÍ°/°)3°	Í°#/°Í°†/° Ö°-Í²- 
+³@-3	+°-±C+°HÍ³?HC+°8Í°8/°?Í°H±Y+°`Í³T`Y+°MÍ°M/°TÍ°Y°g Ö°mÍ°`±{+°€Í³w€{+°qÍ°q/°wÍ°€±+°Í²
+³@	+±‡+±8-±&99°C±<A99°?²@EK999°H±FJ99±YM±QV99±Tg³#]c$9°`±jo99±{q±ty99°w²ux}999°€³!~ƒ$9°±	99 ±j´ *-$9°	² &999°#°!901476 32 32 "=43>54&+"5'&$#"#2#& 47632"&462"&47632#"&47632#"&47632#"4762"&462#"&ã³2]âÜY4"ôşØÔˆÁÎ¬şû­°şı8…µÁˆÖş×K#%33J3\3J33J3Ë#&66&$4\$%65&$4-!&66&$ÉL22L4[6J33%&5¹,ÚşïÖóÔşÎËˆÎ>­êì¯5Ç†ˆË2ıŸ%2L22©$44$&55ıÒ$6J33«&6&%55‚J5J3ş!$2L23¨#54$&56     ı²0· < H R ^ m z … ‘ › § ³ Ã Ò à  2=4#.546?2576$32;2"36 54'654$#"&#" 32654&"2654&"3264&#"64/&#"32654&#"3264&#"32654&"2654&"632&+&26=4&"?654&#"32654/&";264&+"ˆë‹ˆÁµ…8¯®¬ÌÁ‡Ô(.~–şş–ö§‚áş¤1³âI"&23J3\3J33J3Ê#&56%#5F!@D&(6K#&66&$4.4$&55&$4ı$&22L3[4J33J4hn™›Ü6™Ú"/'6L23J7LG™7%#™VD'!5BJ4š'Ø%66%Ø&8ŠîË†„Ä6¯éé¬>Í†Ë2Óy`—É––¹FşéÙ,şâü!2%&22]&66&$44ı‰#2L56ù'F9NA5øB#4&%55[$43J44ı¥"2%&23^&66&$44ÔjŞ›d`™»«%22%Ú&67%ş4%™%&6œúï(C7&$E5{&6L56  	  ı²ùz ; G Q ] j u  ‹ –‡ ²h  +°bÍ²K  +²'„333°PÍ²"‰222°V/°[Í°@/°z3°FÍ°2°n/°	3°sÍ°/°3°•Í°/°6Í³6+°43°2Í°—/° Ö°Í°±H+°MÍ³CMH+°<Í°</°CÍ°M±R+°YÍ³^YR+°eÍ°e°q Ö°kÍ°k/°qÍ°Y±‚+°‡Í³}‡‚+°vÍ°v/°}Í°‡±+°.Í° Ö°*Í±˜+±<²9999°H²@F999°C²EJP999°M±KO99±^R±V[99±Yk³6bh$9°e±ns99±‚v²4z€999°}²„Š999°‡´…‰Œ$9°¶$%2•$9°°’9°*°,9 ±PK°9°s°!9°µ *,$9°•³9’$9°².999°°Œ901 2=4#.546?2576$32;2"36 54'654$#"&#" 32654&"2654&"3264&#"32654&#"3264&#"32654&"2654&"6 &+&*Ö‰Áµ†8¯®­‘ÎÂ‰Ö).~—şş—ø§ âş¢2±æI"&23J3\3J33J3Ê#&56%#5[#&66&$4.4$&55&$4ı$&22L3[4J33J4pl:Û6šÛ!/ÕşÍ
Ì‹…Ä:­êê­=ËŠÍ5ÖrdšÈ˜–¹EşçÚ*şáü!2%&22]&66&$44ı‰#2L56a#4&%55[$43J44ı¥"2%&23^&66&$44ØlŞ^fšº   	  ıª	ã M W c p | ‰ ”  ®q ²{  +°uÍ²  +²&[—333°Í²!aœ222°h/°nÍ°Q/°3°VÍ°’2°/±	 33°‡Í°/°3°­Í°/°HÍ°¢/°AÍ°¯/° Ö°Í°±X+°^Í°N Ö°TÍ°^±r+°xÍ°d Ö°kÍ°x°„ Ö°}Í°}/°„Í°x±•+°šÍ°2°Š Ö°Í°š±¥+°9Í°9±+°*Í±°+±N²K999°X°9°T³QV[a$9±}r±nh99°k³Hu{$9°x±‡99±•Š°F9°´“˜œŸ$9°š°9°¥¶!#$A­$9±9±=ª99°*²,5¨999 ±‡µ
 *,$9°­´K¨ª$9°²/5999°H²9FŸ999°¢°¤9°A°;901 2=4#.6?2576$32;2"3>54'6?654/.54?6/&#"&#" 3264&"32654&#"32654&#"32654&#"32654&#"32654&"2654&">72&+&*ÖˆÂµ†9°®­‘ÏÂˆŒê‡Ev,AFm?UF?;z‚z-}âş¡2´ãN4$&33L2-3%&44&%3û#&66&#5D#&77&#$'56&$4ş4&%32L4-6J33J6w2±^§”8Ê!,ÔşÌÍÆ7¯ìë­=ÎˆÍğ‹’wj©MPcg2+1B	<oK5şçÛ-şâü$42L22^&55&$44ı…#3%&77ˆL4%&7'&2&%55ı¢$43%&22^%65&$45÷W_!›şíH:8~Å      ıuCÃ J [ k v † ™ ¤ ° ¼ Ë İ ë  ;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 32?6&'&654/&#"32654&"76?6&'&232?6&'&2654&"632&+&26=4&" ?64'&#"327654/&#";264&+"Õ©Fã˜Ñê
şÄ
rs–´‡6°®¬Î¿‰ëˆ.z—şı˜sÙO¡ãş¡1±çI"#E
&%"B9E"!@C&(64$&22L2B! %>%&#B' !A%$(A
OL22L2nkšİ2šİ!/$5L33L5SIš&%š:E%#B$&5œ'Ü&65'Ü'5³şæ/µş?\ğşÍ½y‡Ä?­ëë­?Í‹Í‘ñubšÅ˜—`UEşçÛ)şŞû3
A?)@%$?	[%F:'%F4÷¯$42&%22Í4
 ,`#@'%`õ1
F@"B
%&?6%2%&22ågÛiXš¾¬&65'Ü'56&şWNšLšúÉ%C&%B7‚'5L33      ıuúz J [ f v ‰ ”  € ²4  +°3°/Í°P/°VÍ°_/°}3°eÍ°ƒÍ°)/°3°ŸÍ°"/°EÍ³—E"+°C3°@Í°¡/° Ö°Í°±\+°bÍ°b°R Ö°KÍ°K/°RÍ°b°m Ö°gÍ°g/°mÍ°t Ö°nÍ°b±Š+°Í°°€ Ö°†Í°†/°€Í°±š+°<Í°, Ö°8Í±¢+±K·	 H$9°\°9°g²Pe999°R°_9°b³E"Td$9±†n±ow99°Š±zC99°€³}“•$9°´%(’$9°,µ)12@—Ÿ$9°š°œ9°8°:9 ±VP²	K999°_°W9°e²‡999°ƒ±k†99°4±„99°/³5’$9°)· 8:r“$9°Ÿ³%Hœ$9°"² <š999°—°•901;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 32?6&'&32654&"76?6&'&232?6&'&2654&"632&+&Õ©Fã˜Ñê
şÄ
rs–´‡6°®¬Î¿‰ëˆ.z—şı˜sÙO¡ãş¡1±çI"#E
&%"BT4$&22L2B! %>%&#B' !A%$(A
OL22L2nkšİ2šİ!/³şæ/µş?\ğşÍ½y‡Ä?­ëë­?Í‹Í‘ñubšÅ˜—`UEşçÛ)şŞû3
A?)@%$?0$42&%22Í4
 ,`#@'%`õ1
F@"B
%&?6%2%&22ågÛiXš¾    ıu	á Y j u … ˜ £ ³” ²4  +°3°/Í²  +°¢Í°_/°eÍ°n/°Œ3°tÍ°’Í°)/°²Í°"/°TÍ°§/°MÍ°´/° Ö°Í°±k+°qÍ°q°a Ö°ZÍ°Z/°aÍ°q°| Ö°vÍ°v/°|Í°ƒ Ö°}Í°q±™+°ŸÍ°Ÿ° Ö°•Í°•/°Í°Ÿ±©+°EÍ°E±,+°7Í±µ+±Z·	 W$9°k°9°v²_t999°a°n9°q³T"cs$9±•}²R~†999°™°‰9°³Œœ¢¤$9°Ÿ´%(¡$9°©´/12)²$9±,E±I¯99°7²9B­999 ±e_²	Z999°n°f9°t²–999°’±z•99°°“9±¢4³5™Ÿ$9±)/¶ 79$9°²´%W­¯$9°"² >B999°T±R¤99±M§°G901;36&+6#!".546?2576$32;2"36 54'6?654/.74?6/&#&&#" 32?6&'&32654&"76?6&'&232?6&'&2654&">;&+&Ô©EâŠÃèşÄ
rr—µ†8¯®­‘ÎÀ‹Õ)Fz'B\€5UK9;{‚y-ˆvâş¢2±æI"#E
&%"BT4$&22L2B! %>%&#B' !A%$(A
OL22L2K5´bH‘c6’Å#-±şé3µşBXïşÍ¿w…Ä6­êë¬=ËˆÈ
‘5Ö‹zv¢I}‡C,/A	;mJ1şçÚ*şáû3
A?)@%$?0$42&%22Í4
 ,`#@'%`õ1
F@"B
%&?6%2%&22ÿYa"fÀ¢0<2}É     ı‰CÃ J Z g t  ‹ • ¡ ­ ¼ Î Ü  ;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 654/&#"32654&#"32654&#"32654&#"2654&"2654&"632&+&26=4&" ?64'&#"327654/&#";264&+"Õ©Fã˜Ñê
şÄ
rs–´‡6°®¬Î¿‰ëˆ.z—şı˜sÙO¡ãş¡1±ç‚E"!@C&(6}$&66&#5$'56&$4#&66&#5Y5J33J54L22L4kkšİ2šİ!/$5L33L5SIš&%š:E%#B$&5œ'Ü&65'Ü'5³şæ/µş?\ğşÍ½y‡Ä?­ëë­?Í‹Í‘ñubšÅ˜—`UEşçÛ)şŞf%F:'%F4ø3'4%&77^&2&%55üÏ#3%&771&55&$44şX$43%&22^gÛiXš¾¬&65'Ü'56&şWNšLšúÉ%C&%B7‚'5L33    ı‰úz J W d q { … ‘ ²U  +°OÍ²u  +±433°zÍ°/2°i/°oÍ°/°„Í°\/°.3°bÍ°)/°3°Í°"/°EÍ³ˆE"+°C3°@Í°’/° Ö°Í°±e+±KX22°lÍ±R_22°l±|+°r2°Í°w2°±‹+°<Í°, Ö°8Í±“+±e³ H$9°l±E"99°|°C9°²%(†999°,µ)12@ˆ$9°‹°9°8°:9 ±U„±99±zu±599±b\°9°)· ,8:$9°³%H$9°"² <‹999°ˆ°†901;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 32654&#"32654&#"32654&#"2654&"2654&"632&+&Õ©Fã˜Ñê
şÄ
rs–´‡6°®¬Î¿‰ëˆ.z—şı˜sÙO¡ãş¡1±çÿ$&66&#5$'56&$4#&66&#5Y5J33J54L22L4kkšİ2šİ!/³şæ/µş?\ğşÍ½y‡Ä?­ëë­?Í‹Í‘ñubšÅ˜—`UEşçÛ)şŞü¿'4%&77^&2&%55üÏ#3%&771&55&$44şX$43%&22^gÛiXš¾      ı	á Y f s € Š ” ¤ ²d  +°^Í²„  +±433°‰Í°x/°~Í°/°“Í°k/°/3°qÍ°)/°£Í°"/°TÍ°˜/°MÍ°¥/° Ö°Í°±t+±Zg22°{Í±an22°{±‹+°2°Í°†2°±š+°EÍ°E±,+°7Í±¦+±t³ W$9°{±T"99°‹°R9°²%(•999°š´/12)£$9±,E±I 99°7²9B999 ±d“±99±‰„±599±qk±.99°)· ,79$9°£´%W $9°"² >B999°T±R•99±M˜°G901;36&+6#!".546?2576$32;2"36 54'6?654/.74?6/&#&&#" 32654&#"32654&#"32654&#"2654&"2654&">;&+&Ô©EâŠÃèşÄ
rr—µ†8¯®­‘ÎÀ‹Õ)Fz'B\€5UK9;{‚y-ˆvâş¢2±æÿ$&66&#5$'56&$4#&66&#5Y5J33J54L22L4H5´bH‘c6’Å#-±şé3µşBXïşÍ¿w…Ä6­êë¬=ËˆÈ
‘5Ö‹zv¢I}‡C,/A	;mJ1şçÚ*şáüÀ'4%&77^&2&%55üÏ#3%&771&55&$44şX$43%&22xYa"fÀ¢0<2}É   
  ş•Ûp   - = J V f u … ’ ò °H/°AÍ°;/°_Í°/°3°Í°Š2°e/°2Í°U/°OÍ°“/° Ö°Í°±J+°K2°EÍ°Q2°E±b+°7Í³v7b+°g3°~Í°o2°7±‡+°Í±”+± ±99°J¶!&).;$9°E´2W]_e$9°b±:Z99±‡7²k{ƒ999 ±AH³pr$9°;²go999°_±k99°°]9°³.7Zb$9°e°W9°2±)ƒ99°U³&v~$9°O±!{9901476;2+"&4?632'&47632#"/&4$32 $4632"&55462"&32654&#"47632/&4?632#"&476;2+"$Ú%11%Ú%61'&3˜AB%#˜3&'–•pÎ•X•ÿ şÔÿ –Ñ5&'45L56J65L5‹½§€ œİİœ)$'œ@@˜˜#&5œ#$0ñ#Ø%77%Ø%'6L56ıB%˜0%'˜33é%'&3˜ıE•–Y•Îp–ÿ •• ıY&44&Ô'66'IÚ%66%Ú%11şXÔ…ËİœšÚüF%˜J22˜¶(6%(˜3ı¹L7J6     ØW/   C °/°Í°/°Í°/° Ö°Í°±+°Í±+± µ
$9 ±² 999014$32 &32654&#"– •– ––ÿ şÔÿ–Û‹½¦€ œŞŞœ)•––ÿ şÔÿ •• Ô…ËİœšÚ    şĞv G W # °D/°KÍ°X/°Ö°2°HÍ±Y+±H°(9 0154754646=46=46574757656=6747676?>767>7676?	%#".73267654&#"	(+)×şB¾şl!şEşşœ“ú’€ó¬ƒÔ,ò¬ uAIï
	'
=6yë
üœQüÕÇü‡†¢’ú“¬ó—yDK¬òk9   	  ÿ	s   @ § ù8HW  476;2+"&47632#"/&4>32&#"654&#"&5&76767>767>76?6;2##"'&6?>56'&'&'&'.'&'&'&'&'4&%47>?632222+"'"&#".#&'&6?>76'&'&54632#"&>?67632#"'&67>76'&'&4?632#"&476;2+"&'Ü&55&Ü(78("›5%) [™Òr™˜-:'&âŸá/+%		
	
	Š	'4 

0						")'	 "5W'4"

LYA7&'66'&7f")'603OŒ	'50!NB"$ıœ$&7$%2ö%Ü&98'Ü'3õ&6&(66%'&5šı:qÑ—[™şü—œİİœ3ş¹94	
)	}0Y= F
	  	*)(	#C.#	'$#'
$hm0Z; 	E@Giİ'66'İ&22û#C.#	)2"(6J|0Y= F8@G:BFî(7&(š5ıÖ#7%'76   ÿĞEP . ? L °+/°2Í°;/°Í°@/° Ö°/Í°/±6+°Í±A+±6/¶"%)+$9 ±2+°)9°;°9°°9015&>76632#"'&6767#".7326?47.#"#Je¦f7ÒqVX¬ö"/M_ˆP)×oW_o¿q´Ša[‡
‹bY…4x~¢’—98sÒ(õ¬UOwk€oq-	%7xÑ)n¾tbŠyZ`…tW   ÿb7& - 3 °./°Ö°"2°Í²
+³@	+²
+³@ 	+±/+±°9 014676$3232#"&5465#"&547&'#.Á–$#»´+yÒ}ŠEt;f0pONp		^†'N/…¯ôê–ê#²çİ²hµj´}8‘vcˆ0AOooO	&
‡^%L)]÷     vÿ±   . @  °A/°!Ö°/Í±B+ 016%673'&' 67.'&'.'&'"76767>76&v´ë¤U CÒÙf3)`ÏÜJ}M.!şÆ-Ğ.(£K7\<7Ş0=C«m69#^L¸À¡€Tí5şp½äµş¾Æ82$@-<Éß/9×b$#	
ıö1+‹Bšj$Eé 	  ÿöIA 
 H R ] i u  Š – à ²g  +°aÍ°Q/±:}33°MÍ°y2°F/²-”333°Í²&222²F
+³@	+° 2°\/°ˆ3°WÍ±ƒ22°s/°mÍ°—/° Ö°Í°±J+±S22°OÍ°X2°O±^+²=j222°dÍ²6p222²^d
+³@^C	+°2°d±w+°€2°|Í±*…22°|±‹+°‘Í±˜+±^O±E99±wd³#&.0$9 ±FM³36>@$9±\±99014632"&7463!'&4624632762!2#!"/#"&5"&4?!"&4762"'4762"'4632#"&4632#"& 4762"'4762"'4632#"&**+<*Ó*Xó,<ò,*ô;óX++ş§ô;ô*,ò<,õş¦*=,,==,=ï,**,,**,=,,==,=À++++,,*+,ó=,òV,,ş§õ=ó,+ô<õş¦++Wò,<ô+ıû;,;,";,;ûS++++Ö++++û;,;,";,;ş-,,++      ÿcW   $ 0  >54&6 5 4 >54&>54&hhhÊÊ…Şşç˜˜ÔÓ˜˜ÓÔ?˜ÒÔ˜˜ÔÒ]—hh——hh—
%ËËşÛ
‹å†Ì&ûİ™™İİ™™İÜš™İÜ™™Ü   —X5   °/± +°Í±+ 0132$54'.'&'• ”•—pNG¿+'‰c¸…À“ÿ—— ÿ“`	q[Û*'Š`üşİ     ÿW¨  # ' + 9 = A Æ °/°Í°$/°>3°%Í°?2° /°Í°B/° Ö°Í°±+°Í³=+°:Í°:/°=Í°=°4 Ö°,Í°,/°4Í°±+°
Í±C+±´$&()+$9°,°*9°:° 9°=³/7$9°4±299±³01>@$9 ±±99°$²,27999°%µ
 ./$9° µ)+01:;$90146$32 !& 32$54."537467#"&5353|Ò!Ÿ!Ñ|şÍòş<÷şÆ¬´²û¥¤a¤âöá¤a>çs8¢7k]C#F×bFEaŒJïç›Ÿ"Ğ||ÑşßŸşışiKş¡[Hœø²³¢¤{á£aa£á¡MMy7¢8ş•Cbß%ıı(6Faa8ççş¤OO  ÿöşİ"Õ  # 9 = I ` Y °a/° Ö°Í°±%+°0Í°0±K+°VÍ°V±D+°Í±b+±0%²!:999°K@	;=I>?$9°V²AG<999 0147? #"$&3267.#"4>32#".3#3267.#"4>32#".
šyú·P(0B`r|ÓşÚ£ şİÔ}ñprsqqsrp¨=Fqrsoosrq¦ñm«J¨M*#CşÉ¢ş‹ şİÔ}yÑ%Ş…††0,8(H'8,üözüÅ†‡†ªH'8..8  rÊZ      333###3#3733#73ÏÛÔÏÏà¸˜—İâãşıÖ&D@ƒ„ş|Æş…{ı)èı)eeÆş8ÚÚ   ÿø ã? - Œ 3 °*/°Í±22°/°‡Ö°‚Í±+±‚‡²2u999 ±*±9901&4732673267267"#"&#!""&#.' 4?252525324737373736;43637325;7;2;;3;32323333"/"&5"',]^,,^],-œº,6%ú
$4Jìí3ƒ$4%‚3müO__OO__OO__Oıÿ%62#›3íí3‚ı $$à‚      şß	6Û  = L X f v … “ À °/°PÍ°/°M3° Í°‘ Ö°‰Í°-/°:3°	Í°4/°Í°”/° Ö°Í°±f+°aÍ°a±*+°Í³S*+°Í±•+±f@		&-?FMX$9°a±P99±S*°U9±³gwx…$9 ±P±Cj99± ‘³S†$9±-‰@	* Ux€„$9°	³17|$9°4°29014676$3232#"&'!.7!6;23>54&+"5'.#"+&?632#"32654'4632"&54632#"/&4?632"46;2+"&¹)µ°)°ùxyÍxšï&ıŸ«î‘›m]håmœ¨rŠÒŠĞ+l’•((y!&z V"™^|­5¿r++<+Ö)~+!yy~<™(­,,­(«”ê °âİ¬÷°€°yÏx¾’÷¬p¥¥pq¥2‹½¼Œ2ûÓ44{& ~+Vj²~>2bzı×(¯,,r({+~©>~{şr**++   ÿÿÿ	€x " = J ‘ °/°BÍ° /°>3°&Í°-/°:3°	Í°4/°Í°K/° Ö°#Í°#±+°>Í°>±*+°Í±L+±#²4999±*>´	2BH$9°°9 ± B°F9°&³!H$9°-² 999°	²17999°4°2901476 32 322#".5!& 7!>54&+"5'&$#"+32>7&'ç°2^âİY4#ôqgŠFşï¡{İ]ı!ÖşÖ¶Á‰ª‰ÁĞ­şú®°şı8†µÃ€Épc¿“¬v‡¦ƒ¸!)ÛşîÖ‹ò¸‘XR¢şîŸ^ Üy
2Ö‹ÌÌ‹ŒÎ>­éé­>ÅıiÑp`Ã~#hh      ÿ	…u   ; N • °/°?Í°/°J3°$Í°+/°83°	Í°2/°Í°O/° Ö°!Í°!±+°<Í°<±(+°Í°±D+°Í±P+±!²2999±(<´	0?J$9°°G9 ±$²D999°+³ G$9°	²/5999°2°0901476 32 32#".5!& 7!>54&+"5'&$#"+32>54&'!æ±2^âİY4#ôhx_ İyxÜŸ_ı"ÖşÖ¶Á‰ª‰ÂĞ­şú®¯şı8†µ±
®`ªtB?;>ø–şÌ€¸ )ÛşîÖ‹ò !RóŠ{İ]^ŸÜx
2Ö‹ÍÍ‹ŒÍ>­êê­>ÄıZ´ôK|ŸSNA„¦
   ÿná  1 L a   °//°5Í°</°QÍ°C/°MÍ°Y/°Í°b/° Ö°2Í°2±X+°Í²X
+³@	+³9X+°+Í±c+±X2µ<MQ$9±9°S9°+±)99 ±<5³)+2 $9°Q·'(%?FIS$9±MC³U$9°Y²_`999°°90154676754 76;24##!"&73!2654&+"/.#"#32267&="&#"'‘y3¡'â9:!*)%a#G{PL	3Fiİ›ı%›ãÓcHÛEeeEŒ
	‰][…CBVØ”ë/|]o4¦»b¶?Wë~Â&®\%éc*
	K348uq]I''FLeC6Nßâ›HefGEeD\||\;	ah§ŒMEvT8°$TNl  
  ÿõ	ëø  < I V c o | ˆ ” ¡— ²  +°‡Í° Ö°Í°°G Ö°AÍ°A°h Ö°nÍ°™/°3°ŸÍ°2°"/°:Í°4/°3°)Í°N Ö°TÍ°4°t Ö°zÍ°4°“Í³[)4+°aÍ°¢/°JÖ°QÍ³DQJ+°=Í°=/°DÍ°Q±W+°^Í°k2°^±~+°„Í°p Ö°wÍ°„±Š+°Í°±+°Í°±•+°œÍ°œ±7+°&Í±£+±J=±AG99±QD±NT99°W±de99°^±[a99±w~³tz‡$9±Š„±99°³
$9±•±-099°œ³)492$9 ±A°~9°h°„9°‡³De=}$9°²k999±nG²d999°™°9°Ÿ± 99±N:±7&99°t²260999±T4¶-JQpwŠ$9°z°‰9±a)±W^99013!2"'&#"3264&#!"3!2654&#"327632#!"32654&#"32654&#"%32654&#"32654&#"32654&#"32654&#" 32654&#"32654&#").@?^&(9Zw}²³|ùá(9'Z}³³}{U7('-.??.÷¦(9¨$'67&$4e$'56&$4C$'67&$4
#'67&$Š$'67&$4"#'67&$ª#'67&#ê$'56&$4	'@/.=7&(X¬ø³86%®{|°U-)4!@\>8üö&2&%55ş&2&%55Ñ&2&%55û+J2&%5¾&2&%55ûlJ2&%5pJ2&%6ü´&2&%55      ÿqÛ  5 D x °/°3Í°,/°AÍ°%/°6Í°9/°Í°E/° Ö°Í°±/+°Í°±<+°Í±F+±/´69A$9°±	?99 ±,3³	 $9°A³#)?$9±6%²<9990153!2654'654.#"46?257>32;2#!"&>32&#.#ã›Û›İ…›e¬ì¯şÙ©¡3y‘ÓVBC…[]‰	
ŒEeeEı%HcØù®²ùl]^{/ë”ï›ãàM6U¡‚í«f¬şÚ®$\®&Â~C`	<\||\EdEHffò¯îşµp¿;NŒ¦   şâ¨Ï f €  °8/°LÍ°\/°3°iÍ±ou22²\i
+³@\&	+²Xb222°|/°	Í°/°@Ö°HÍ°H±R+°2°,Í°2±‚+±H@³>IZ[$9°R²8Ll999°,°|9 ±\L¶*.BDSZ$9°i³glrx$9±	|±9901>7 %54632#"'&##"'&'#"'.65462327>/#"'&"'.76;2>732>732&' !"f[*-.É9B^$-2}“7nB:$tbQ˜¢Q2"&
%!lS&uY$$€@p8<!+ála	¸˜=®f	¸˜=®f
ZaGşáşışr~( 6åƒ¡/!))!/Rƒ‹Q_×€	%Œ+./tüî^^,+'&*1#A//&<^$()7$»95R5R/‰(vÀ¶8    
  şqE¸  7 E V { ˆ ” £ ³ À} ²  +°Í²‡  +°€Í°/°
Í° /°5Í°f/°lÍ³0lf+°&Í°C/°¾3°<Í°¸2°s/°\Í²s\
+³@sz	+°“/°Í°Á/°Ö°Í°?2°°8Í°8/°±W+°vÍ³2vW+°$Í°v±|+°‰2°„Í°2°„±p+°aÍ²pa
+³@pj	+³¤ap+°•3°¬Í°2°a±µ+°¼Í±Â+±8²999°°F9°W³.)JR$9°2³/&4O$9±„|´ei\ms$9°p°n9±µa²™©±999 ±
±99°‡²999±°9° ° 9°€°9°5²#999°f°•9°0³*,2™$9°l°$9°&°)9±<C²apv999±\s±R±99°“³FO¤¬$9°±J©990153!2"'&#"3264&#!"3!264&#"32762#!"476;2+"&47632#"/&5>32#"&=4;>54&#"+"54632"&5462"&47632/&4?632#"&476;2+"&s)??R $&4Uuv¦¦vı&8'’v§¦wyP1'&T==*ûn&8i$Ù%22%Ù&61%#˜4%'˜ş“pÎ•X”ş–šÛİœ—ÚyÑ5&(35L55L55L5M%'›@@˜˜#%6›#$1ñ#Ø%88%Ø%P&<V> 3LU§ì§6$§ì¤QN1<V>7•&6L56%'&3˜ıR’÷Y•Îp–ÿ•‚İ›šÚĞ•	ûüÔ&44&Ô'66pÚ%66%Ú%11ú§%˜J22˜¶(6%(˜3ı¹L7J6        	ß 0 M ] ¦ ²-  +°4Í°;/°J3°PÍ°C/°Í°[/°Í°^/° Ö°1Í°1±X+°Í°±8+°(Í²(8
+³@(	+±_+±X1´<NP$9±8±S99°(±$U99 ±;4²$( 999°P²SU999°C´?EF$9°²
N999°[°Y9°°90147>7632>32#!".73!2654&+'.'"&#"53267&=&#&ã³%áck‚y-yz;=FW>lEB,t@óûòŒ¶Ì‹ËÌ¾ì£QSuŸI‡²åª("Ç‹5’¨]°¹(¥÷5"3Kn;	@2*2fbPH¬fpóóĞÎŒËP¢å-Ê‚MÂÜ‘Â~2@Eœa    ÿÿß£ƒ  . °/°Í²
+³@	+°/° Ö°Í² 
+³@	+±+ 01463!2+#"'#"&)2))…"şe))
1))'şb …)*      Ë¦p  . °/°Í²
+³@	+°/°Ö°Í²
+³@	+±+ 014763254632#!"&546;")))şÎ))„şa>şc…)*şÎ))(            . Y ²  +°Í°/°Í°//° Ö°Í°±!+°'Í°'±+°	Í±0+±!°9°'²999°°9 ±³	 $+$9014$32#"$&732$$ 32654&#"ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!""!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¢""Ç!!            5 \ ²  +°Í°/°Í°6/° Ö°Í°±!+°)Í°)±+°	Í±7+±!°9°)³3$9°±/99 ±³	 %3$9014$32#"$&732$$ 46327>#"&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!"3/œ'!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¢Ç!!ñY.şõ$!          5 \ ²  +°Í°/°Í°6/° Ö°Í°±"+°)Í°)±+°	Í±7+±"°9°)³3$9°±.99 ±³	 %3$9014$32#"$&732$$ 546276#"&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!0!¾.ş÷!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¢Æ!!şœk.”!         4 € ²  +°Í°0/°(Í²(0
+³@(%	+°/°Í°5/° Ö°Í°±!+°(Í²(!
+³@(,	+°(±+°	Í±6+±!°9°(²999°°9 ±0°9°(²	 999°°9014$32#"$&732$$ 462!2#!#"&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!0!!!şÑ	!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¢Ç!!şs!"!            3 ] ²  +°Í°/°Í°4/° Ö°Í°±!+°(Í°(±+°	Í±5+±!°9°(²999°²+.999 ±³	 $.$9014$32#"$&732$$ 462#"'%.ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!0!õ!şûÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¢Ç!!ş\-˜         3 ] ²  +°Í°/°Í°4/° Ö°Í°±"+°)Í°)±+°	Í±5+±"°9°)²999°²+/999 ±³	 %/$9014$32#"$&732$$ 5462#"'&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!0!“"–ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¢Æ!!şJşú-
         , Y ²  +°Í°/°Í°-/° Ö°Í°±!+°(Í°(±+°	Í±.+±!°9°(²999°°9 ±³	 $*$9014$32#"$&732$$ 462"&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢!0!!0!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şëş$!!üÿ""          3 ] ²  +°Í°/°Í°4/° Ö°Í°±$+°+Í°+±+°	Í±5+±$²"1999°+²999°°9 ±³	 '1$9014$32#"$&732$$  &7462#"'ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢Š”!0!•#ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şëş&-¶!!ş:şö         3 ] ²  +°Í°/°Í°4/° Ö°Í°±$+°+Í°+±+°	Í±5+±$²!1999°+²999°°9 ±³	 '1$9014$32#"$&732$$  6?462#"'ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢õ!0!şú!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şëş¹-¤!!ş9˜         4 € ²  +°Í°2/°$Í²$2
+³@$)	+°/°Í°5/° Ö°Í°±%+°,Í²%,
+³@%!	+°,±+°	Í±6+±%°9°,²999°°9 ±2°9°$²	 999°°9014$32#"$&732$$ 463!462#"'!"&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢á!!0!!
şÑ!ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë¡!!!ş9!"         5 \ ²  +°Í°/°Í°6/° Ö°Í°±'+°.Í°.±+°	Í±7+±'±"99°.³2$9°°9 ±³	 *2$9014$32#"$&732$$ &7>462#"'%ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢/¾!0!!ş÷ÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şë,.kd!!ş:!”          4 \ ²  +°Í°/°Í°5/° Ö°Í°±'+°.Í°.±+°	Í±6+±'±!99°.³1$9°°9 ±³	 *1$9014$32#"$&732$$ $6765462#"'ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢z/5!0!!)šÿÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şëh.Yñ!!ş9!$       & > ²  +°Í°"/°Í°'/° Ö°Í°±+°
Í±(+±±99 ±"±
 990146$32#"$&732>54$#"zÎœÎzzÎşãœşãÎzRm¸ ÿ‹Œş¹m¹şÃº‹ÿ¸mÎzzÎşãœşãÎzzÎœ‹ÿ¸mm¸ ÿ‹º=¹m¹ş      ²   +°/°Ö°Í±+ 01!2$$#ÑaÎÎşŸÑ‡Ìu8
/Oi–Îb¢aÎ5¯ÒÚpBwˆvwaU       °/°Ö°Í±+ 01!2$$#ÑaÎÎşŸÑq©a/7ZÎb¢aÎ<³ÏÔn]¡¸”‰        °/°
Ö°Í±+ 01!2$$#ÑaÎÎşŸÑ¯¦-H~Îb¢aÎşcâ\´“       °/°
Ö°Í±+ 01!2$$#ÑaÎÎşŸÑ„|!7^Îb¢aÎşkİZ™°“’        °/°	Ö°Í±+ 01!2$$# ÑbÎÎşÑ«GÎb¢aÎş×ş)ïş‚        °/°	Ö°Í±+ 01!2$$# ÑbÎÎşÑ«GÎb¢aÎş×ş)ïş‚       °/± +°Í±	+ 01!2$$#ÑaÎÎşŸÑÎb¢aÎ  ·   
  °/± +°Í±+ 012$$#·JÑaÎÎşŸÑJş0şÏÎb¢aÎşƒ n   
  °/± +°Í±+ 012$$#n’ÑbÎÎşÑ’şşçÎb¢aÎş¢ &     °/± +°Í±+ 012$6&$#&a{œÎzzÎşãœhtõşzÎ:Îz•şn  İ     °/± +°
Í±+ 012$654$#İ@vTÎzÎşÑŠ›zÎÊ­CzÎÑbÎ…şi    “     °/± +°
Í±+ 012$6&$#“"P”iœÎzzÎşãœ«ÄÔË§=zÎ:Îzuşc  J     °/± +°Í±+ 012$654$#J=b›fÎzÎşÑÌìi±±|,zÎÑbÎfş_         ²  +°
Í°/±+°Í±+ 01 $$ Îb¢aÎÎşŸş^şÒş^şÎÎb¢aÎÎ     ú   °/± +°Í±+ 013$4.'"M¼ê}9a…”PœşäÍyş}ê¼MoyÚ¨Š\yÍşå        ¹û   °/± +°Í±+ 013$4.'"M¼ê}»JšXĞşŸÍş}ê¼M±Mı¼Š,Íş      pı   °/± +°Í±+ 013$4.'"M¼ê}r=k€JœşäÍyş}ê¼MÔ*†ó¾’6yÎşä      'ş   °/± +°Í±+ 013$4'"yÎœ(§ĞşÍÿœşäÎyõ
ğ…ŠÎşŸ        İş 
  °/±+°Í±+ 013"ÎaĞŞŞĞşŸÏş`şŸÎå–iÍ        “ÿ   °/± +°Í±+ 013"ÎaÑ““œşãÍz ÑşŸÎ;ÅbyÎşä          °/±+°Í±	+ 013"ÎaÑÑşŸÒş^şÎÎ         
  °/°Ö°Í±+ 013"ÎaÑffÑşŸÒş^şÎB¿_¡Î      
  °/°Ö°Í±+ 013"ÎbÑÎÎÑşÒş^şÎè˜hÎ         °/°Ö°Í±+ 013$47"ÎaÑşÎ«‡ÑşŸÒş^şÎïî„Î          °/°Ö°Í±+ 013&7"ÎbÑÔÆç³ÑşÒş^şÎg”iÎ           °/°Ö°Í±+ 013$4>7"ÎaÑş÷÷R·jÑşŸÒş^şÎQƒ- ÿÀ&Î         °/°Ö°
Í±+ 013.54>7"ÎaÑ•ÜƒN!7]|²oÑşŸÒş^şÎ9‘®œ^Cqnub`'Î    ÿşÿ    / D ²  +°Í°/°Í°0/° Ö°Í°±+°	Í±1+±³/'$9 ±³	 #($9014$32#"$&732$$ 	62/&&ÏbĞœÎzzÎşäœşãÎy©±±ö¢¢¢şìş¼şì¢N  ÿí

ï
	ıÑcÎzÎşãœşãÍyzÎœó³±¡D¡¡şëıÏ

üYY    ıqCÀ L _ k | Œ ˜ ¨ » Ç Ó á ğ  5476 32>32"=43>54&+"5'&$#"#32#&'.'5&5&4657>#"&#.462#"'&4?>#"'.4632'&/&462#"'&4?>'.4657>#"&#.462#"'&32654&#"54632#"&4?632&'4632#'"/&46;2+"'&ç±1_ãŸƒPØs˜—z.ˆë‰¿Î¬şù®°şı6‡´t#,B?SK…¹K
A($$A!!O2L22&%¯B"%&
E#"96(&C@!!E2L22&#BB#&%>% !)
A($%A !O2L22&%n†/!Ü›2İš?6%&33&%6Sš&'šI:5&%B$&Eœ5'Ü'56&Ü&¹ *ÛFUa—şı˜Åšbuñ’Í‹Ì?­ëë­?Ã‡œg.Ö‹(ı8?&%
A"@F
2U&22&%1ı¥>$%@)?A
3	|&4F%';F÷ù%22%&2`%'?#`,!
5Í?&%
B"@E
2U&22&%20z¾›XjÛËÛ&76'Û'67öN›L›ûJ&6C%&DÍ&33L6    	  ıkúq J ] i z … • ¨ ³ ¿ ²  +±Df33°Í°?2²°  +°v/°pÍ°X/±ƒ£33°RÍ°2°~Í°$/°13°¶Í°+/°Í³¾++°Í°À/° Ö°6Í°82²6 
+³@6B	+°6±^+°cÍ°c°U Ö°OÍ°O/°UÍ²OU
+³@OK	+°c±{+°€Í°€°t Ö°jÍ°j/°tÍ°t°mÍ°m/°€° Ö°†Í°†/°ˆ3°Í°€±©+°®Í°®°  Ö°šÍ°š/° Í°´2°®±»+°Í°! Ö°Í²!
+³@!	+±Á+°6º>ğz +
°ˆ.°‰À±ù°À ³ˆ‰....±‰..°@±O6±.99°^²P[\999°U²X`f999°c±aT99±†{±v}99°t°ƒ9°€³+~r$9±š°–9°©³
›¦§$9° ³)£«±$9°®´%(Ÿ¬°$9°!³$¶¾$9°»°¹9°°9 ±pv°j9°X°o9°~±N™99°R´PO’š›$9°±Qœ99°±`«99°$µ2a‹¬$9°¶³(.¹$9°+²)»999°¾°´9°°
901=476 32>32"=43>54&+"5'&$#"#32#&'.'&4657>#"&#.462#"'&4?>#"'.462#"&4?>'.4657>#"&#.462"'&32654&#"ç±1_ãŸƒPØs˜—z.ˆë‰¿Î¬şù®°şı6‡´_-5<HNKy±%K
B'$$A!!O2L22&%¯B"%&
D#"T2L22&$4BB#&%>% !)
B'$%A !O2L22Ln†/!İš2İš¹")ÛFUa—şı˜Åšbuñ‘Í‹Ì?­ëë­?Ã‡ˆe/(·zKıQ>&&
B"@F
2V&22&%2ı¦?$$@)>B
3Q%11%&24`&&
@#`, 
4Í>&&
B"@F
2V&22&%20z¾šXiÛ  	  ıo	Û d w ƒ ” Ÿ ¯ Â Í İ  =676 32>2 "=43>54&+"5'&$#"#2332#&'#.4657>#"&#.462#"'&4?>#"'.462#"&4?>'.4657>#"&#.462"'&3267.=#"ä¬2^âvˆ-y‚{;>FU?lFB'zFş×Õ‹ÀÎ‘­şú®¯şı8†µLB#6<•{jF
A($$A!!O2L22&$¯B"%&
E#"T2L22&$4BB#&%>% !)
A($%A !O2L22LK¦-#Ä“6c‘Hc³ø	³(Ú1Jm;	A/+1hcRI¢vz‹ÖşË‘
ÈˆË>¬ëê­7Å…T”0QEŞıš?&%
B"@E
2U&22&%2ı£?$%@)?A
3Q%22%&24`%'@#`, 
4Ì?&%
B"@F
2U&22&%2KˆÉ~1>0¢Àf!`   ın® b u  ’  ­ À Ë  476 323325"=43>54&+"5'&'.'&#4#&'&#"#32#&'.'5&5&4657>#"&#.462#"'&4?>#"'.462#"&4?>'.4657>#"&#.462"'&ç±1_ã‚i†fl&!­Usˆë‰¿Î¬wt°şı6‡´?6!.@ASK…¹K
A($$A!!O2L22&%¯B"%&
E#"T2L22&$4BB#&%>% !)
A($%A !O2L22L¹")Û+4qu¢\9ªe""	ñ‘Ì‹Í? tjë­?Ä‡Lˆ0.Ö‹)ı7?&%
B"@F
2U&22&%2ı¥?$%@)?A
3Q%22%&24`%'@#`, 
4Ì?&%
B"@F
2U&22&%2     Û   , 8 X f r | Š ˜ ¨ ¶@ ²6  +±c‡33°0Í±\€22°*/±z–33°"Í±u22°/°³3°Í°­2°Q/°=Í²Q=
+³@QW	+°J2°q/°kÍ°·/° Ö°Í°±9+°SÍ³3S9+°-Í°-/°3Í°S±g+°nÍ³sng+°xÍ°n±N+°HÍ°H°„ Ö°}Í°}/°„Í³™HN+°¡Í°H±©+°±Í±¸+± ±99°-°9°9²06999±S3±Y99°g°Q9°s´@A&kp$9±}nµP`uvz{$9±Nx°Œ9±„H°¦9°©°9°¡°“9 ±±NS99°Q°O9°=±¦99°q³™¡$9°k±9901476;2+"& 547632#"/463!2#!"&4632#"&56 7;62; +"&5. +"463!2#!"&5462"&462"&46;2+"&5463!2#!"4?632#"&476;2+"&#Ú%11%Ú%61 $"˜3&'2+a+32,ıŸ+2i;#*32+%9—ÄdÄyÚşÒÚyk3*™#;9%şg+2e6J65L5‘:H:9J9¤4*Æ*31,Æ+3^9$G#.-$ş¹%‚˜"%6œ#$0ñ"Ø%77%Ø%2™&6L56à&%œ'&3˜ü`$..$+32şñ#:8%,24FÉ*şÖÉ	•ÏÏ•	ış%8:#*42ŸÙ&66&Ù%22ûí"00"*44şï%88%,22=*"0/#+3¥(œ6&'˜3ıß%7J65     	ÿûa•  ; O \ ½ ²A  +°[Í°/°
Í³V
+°KÍ°/°Í°"/°9Í°3/°(Í°]/°Ö°Í°±<+°PÍ³6P<+°&Í°P±X+°HÍ±^+±°9°<°,9°6²/(8999±&P°A9°X²KU[999 ±[³<HPX$9±
V°9°±99±K° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&#"4>2#"	U**#9ooOû«%ÁOppON9"**ú?%†4Xj;RˆW@!«O“sEÛ	'GX2jNc{(:*"9pPOq%¿po6!':*$üÏSJ$7]nyc*›ªK…È{KgV=88š×  	  •  ; ? ¶ °/°
Í°/°Í°"/°9Í°3/°(Í°@/°Ö°Í°±?+°>Í³=>?+°<Í°</°=Í³6=<+°&Í±A+°6º>¬ó
 +
°<.°>.°<±=	ù°>±?	ù³<=>?....°@±°9±?<³(38,$9 ±
°9°±99±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!	U**#9ooOû«%ÁOppON9"**ú?%_°şù{(:*"9pPOq%¿po6!':*$û”S     	  v•  ; a Ê °R/°KÍ³
KR+°Í³KR+°Í°"/°9Í°3/°(Í°b/°Ö°Í°<2°±6+°&Í°&°O Ö°NÍ°N/°OÍ°&±U+°GÍ±c+±°9°N±,/99°6³1(8]$9±&O±?@99°U³BKR\$9°G±=>99 ±R°G9°
°9°±99±K° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!7!5>54.#"34632	U**#9ooOû«%ÁOppON9"**ú?%MÂ+şx xSf>,\ŠV›ÅßE?006)"€1{(:*"9pPOq%¿po6!':*$û”Ê0"<>a:Yy3§£;R3 EMq8  	  a•  ; k ü ²A  +°eÍ°`/°^Í°X/°QÍ³
QX+°Í³QX+°Í°"/°9Í°3/°(Í°l/°Ö°Í°±<+°iÍ³6i<+°&Í°i±b+°DÍ°D°K Ö°[Í°[/°KÍ±m+±°9°<°,9°6³/(8T$9±&i²AU_999°b³QX^e$9±D[±GH99 ±`e²<Di999°^±HG99°±TU99°X±K[99°
°9°±99±Q° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32654&'5>54.#"3>32+32#"'&7#	U**#9ooOû«%ÁOppON9"**ú?%t"H…YÁ°A4E[$9PQ-”¾ÙC2.5‡2/mH4=İ{(:*"9pPOq%¿po6!':*$ü+RM/šƒ:`dF1L017'"K•K26$"=   	ÿûq•  ; F J ì °/°
Í°/°D3°Í°"/°9Í°3/°(Í°K/°Ö°Í°±6+°&Í°>2±L+°6º>¯ó +
°>.°IÀ±?
ù°CÀ°>³=>I+°?³@?C+°>³J>I+²=>I Š Š#9°J9²@?C9 ¶=>?@CIJ.......µ=?@CIJ......°@±°9°6´(,8<F$9°&°G9 ±
±H99°±99±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!3737##73	U**#9ooOû«%ÁOppON9"**ú?%j}"ë&l&k`íş(Âï4{(:*"9pPOq%¿po6!':*$ü4¥¥ËÏşDìì   	ÿúo•  ; _ ¶ ²A  +°[Í°U/°MÍ°/°J3°
Í°/°P3°Í°"/°9Í°3/°(Í°`/°Ö°Í°±6+°&Í°&±X+°GÍ±a+±°9°6¶(,8<=QR$9°&µALMS^_$9°X³JNU[$9 ±U[²GR<999±
²NO999°±99±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&#"#7!7!3632#"'&'	U**#9ooOû«%ÁOppON9"**ú?%r!I‡[\P3‰lo,%p*ıÑ›Õ\3>JF2"{(:*"9pPOq%¿po6!':*$üœ3]O/1H`O'k‚.mÉş$6556B.  	ÿûx•  ; Z i Ş ²?  +°gÍ°^/°EÍ°J/°UÍ³
UJ+°Í³UJ+°Í°"/°9Í°3/°(Í°j/°Ö°Í°±<+°[Í³6[<+°&Í°[±d+°BÍ±k+±°9°<°,9°6²/(8999±&[±GH99°dµ?EJU^g$9°B°N9 ±^g±<B99°E±GH99±J±NO99°
°9°±99±U° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32654&#"#6323.#"4632#"&	U**#9ooOû«%ÁOppON9"**ú?%– ¤˜ÅiuB5{(á%9MR,d[<ÛN1+D91={(:*"9pPOq%¿po6!':*$üâ™º¹—gPº2P4"Mqwe;="2D9     	ÿû‹•  ; E  °/°
Í°/°A3°Í°"/°9Í°3/°(Í°F/°Ö°Í°±<+°=Í³&=<+°6Í°6/°&Í±G+±°9°<±,199°6´3(8BC$9 ±
³@CD$9°±99±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!6?!! 	U**#9ooOû«%ÁOppON9"**ú?%×*Õ|)ı„,tşÄ{(:*"9pPOq%¿po6!':*$ûÏGaÇÊşÂ  	ÿûi•  ; ^ n | ²?  +°iÍ°b/°zÍ°r/°RÍ³
Rr+°Í³Rr+°Í°"/°9Í°3/°(Í°}/°Ö°Í°±<+°_Í°_°o Ö°XÍ°X/°oÍ°o°& Ö°6Í°6/°&Í°_±f+°EÍ°E°M Ö°uÍ°u/°MÍ±~+±°9°<°,9°X±1/99°6´3(8[\$9±&o°?9°fµRbijrz$9±Eu²HIJ999 ±bi±<E99°z´HI[\J$9±r´MXou$9±
±99±R° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&'7>54.#"4632#7".4632#"&	U**#9ooOû«%ÁOppON9"**ú?%j·›_’R3L>H^8`d:LzL2:3Z{âZ?A;Q?*-QO80C
:)@3{(:*"9pPOq%¿po6!':*$ü}uy&8M@!B_
kI=W,1A@"7R
o@84;"-.&c3.+.1     	ÿûV•  ; [ j Ù ²A  +°WÍ°_/°JÍ³
J_+°Í³J_+°Í°"/°9Í°3/°(Í°k/°Ö°Í°±M+°\Í°\°& Ö°6Í°6/°&Í°\±b+°GÍ±l+±°9°M³,/<=$9°6²1(8999°\°[9°&²APW999°b´JST_g$9 ±Wµ<GM\bf$9±
_°9°±99±J° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&#"32673#"'&'4632".	U**#9ooOû«%ÁOppON9"**ú?%u6Yf<[•\?­‘•Î‡j9mVF.3>=694D/{(:*"9pPOq%¿po6!':*$üs?\2Diˆ;©µ¶”j†.#Ll32I76$(%    	ÿû	ñ•  ; ? P ^ ÷ ²E  +°]Í°/°
Í³W
+°NÍ°/°Í°"/°9Í°3/°(Í°_/°Ö°Í°<2°±<+°=Í³?=<+°>Í³6=<+°&Í°=±@+°QÍ°Q±Z+°KÍ±`+°6º>­ó +
°<.°>.°<±=	ù°>±?	ù³<=>?....°@±°9±?<³(38,$9±ZQ±EN99 ±]³@KQZ$9±
W°9°±99±N° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!32>54&#"4>32#"	U**#9ooOû«%ÁOppON9"**ú?%W¯şû4Xi;bšX:ª¥õÛ	'G,+4kNc{(:*"9pPOq%¿po6!':*$ûšOıèS€J%Pv•y4›ªşÜñKhW=:7š×   	ÿû«•  ; ? C î °/°
Í°/°Í°"/°9Í°3/°(Í°D/°Ö°Í°±?+°>Í³=>?+°<Í°</°=Í³6=<+°&Í³@>?+°AÍ°>±C+°BÍ±E+°6º>­ó +
°<.°>.°<±=	ù°>±?	ùº>­ó +
°@.°B.°@±A	ù°B±C	ù·<=>?@ABC........°@±°9±?<³(38,$9 ±
°9°±99±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!!!	U**#9ooOû«%ÁOppON9"**ú?%_°şùİ°şû{(:*"9pPOq%¿po6!':*$ûTü¬T     	ÿû
•  ; ? c ÿ °V/°OÍ³
OV+°Í³OV+°Í°"/°9Í°3/°(Í°d/°Ö°Í°±?+°>Í³=>?+°<Í°</°=Í³6=<+°&Í°>±R+°SÍ°S±Y+°KÍ±e+°6º>­ó +
°<.°>.°<±=	ù°>±?	ù³<=>?....°@±°9±?<³(38,$9±>&°@9±YS³FOC]$9°K±AB99 ±V°K9°
°9°O±99°° 9±9"°%9°3°/9°(±&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!!7!5>54.#"34632	U**#9ooOû«%ÁOppON9"**ú?%_°şùËÂ+şy xRf>,\ŠV›ÄİF@0/Fb"1{(:*"9pPOq%¿po6!':*$ûTü¬Ë0"<?a:Yx2§£<R3!4:0DLn:    ÿİ
–¸   * 8 I n { ‡ – ¦ ´7 ²  +°Í²z  +°sÍ° /°(Í°Y/°_Í³_Y+°Í°6/°±3°/Í°«2°f/°OÍ²fO
+³@fm	+°†/°€Í°µ/°+Ö°3Í°3±J+°iÍ°i±o+°|2°wÍ°‚2°w±c+°TÍ²cT
+³@c]	+³—Tc+°ˆ3°ŸÍ°2°T±§+°¯Í±¶+±3+°99°J±=E99°i±B99°o²$999°w´X\O`f$9°c°a9±§T²Œœ¤999 ± ±‘“99±(s²$999°Y°ˆ9°°Œ9±_± 99±/6²Tci999±Of±E¤99°†³9B—Ÿ$9°€±=œ99013!2654&#!"3!264&#!"3!2654&#!"476;2+"&47632#"/&5>32#"&=4;>54&#"+"54632"&5462"&47632/&4?632#"&476;2+"&'í%32&ü&6$&î&66&ü&5’6(ë&22&ü(6$Ù%22%Ù&61$#˜3&'œ˜ş“pÎ•X”ş–šÛİœ—ÚzÒ4&'45L45J65L4L%'›@@˜˜#&5›#$1ñ"Ø%88%Ø%2ë&5&%33ıK'6J33&&22&(34~&6L56$'&3˜ıQ’÷Y•Îp–ÿ•‚İ›šÚĞ•	ûüÔ&44&Ô'65qÚ&56%Ú%11ú§%˜J22˜¶(6%(˜3ıß%7J65      G i £ ¨ ª ²g  +°Í²*_¤222²g  +°nÍ°œ/°Í°©/°Ö°jÍ²j
+³@ 	+³j+°nÍ°j±o+°*Í°*±++°¤Í°¤±¥+°_Í±ª+±*o²p„Š999°+±1399°¤²yœ999°¥@	!5Sw#”˜~$9°_°9 ±œn@
#.<^,¦§¨$901546;&'&5767676!2!&'&67%72532767;;;;3222/32#!"&!67676767'&76767&#"'.7676766767&'&#"!'%+""ab±³íñª–—ŒµÈ]#,mE94
7V†øşÃ\ZW1)5——5!f#$øP$¥ "(8su¿ƒÉ	$e	Š‹ŸŠ± Ä²[®F	+0?€ŸüÛÖ—QXÃÓËA&it°ïê§ªX\#Ka*>4Be$Gf%ƒhdşÎæ)5şû6şØ&&%xr±‚`è—Ì~ƒN7&I:R/ G]«-¾eO1)/&RR’’Ê×üóx   ÿ0  E °/° 3°DÍ±&C22°F/±G+°6º?õ9 +
°C.°BÀ±ù°ÀºÀ{ø/ +
±°°	À±<ù°;Àº?z÷Ò +
±<;°;°:À±ù°Àº>xò +
°3°2À±ù°ÀºÀüŒ +
±32°2°À±,ù°À±°2³2+ºÀü¬ +°,³+,+²+, Š Š#9 @	+,23:;<B.................@	+,23:;<BC..................°@ 013!2673267;>767!264&#!".'&..'&!"$>"`­!"…o£L.$°($$ş¨!YM %Õ|%i£ #şôÔ2#2ú‚şÕÜú‚!ä#2$ş†’!üCQüß;üj    ÿ[Î  x " °/°Í°p/°#Í°y/±z+ ±#p±Xr99017463563#%#.&7676723&'&'&76767676767676'4767676747!.'&'&'&>,|
,>>,ú‘,>Y	&
#!6*K50
,4a;k'
$Ga*Y0M$
		((	$
ûm
+-0CD00BCwD^0bG9456SnV{TK>NS2@\]TJ:A]=SXhP?dVILD,}T"-.;25<=.(&=+)P22  ÿy_   L h 8 °i/°>Ö°8Í²8>
+³@8.	+²>8
+³@>!	+±j+±8>¶6MNR$9 01&7676767676;!"&467>3232#"&5465#"&547&'#. &>732#!>.•
"FLgÀ2K,&<@,(Vf~c2şÓ.aK’]ZŒ\ˆEM-
H38('8.D&CW{í(,Œğ"8ı¨%<>nM+Q,*
34K>,Drs—I2bPM96!KJuYtoYsQY?,o
1E (67'D.&/{ı4?&9"ş÷ıÒ+31"G<WQb`[H    ó   ; 2 ²9  +°13°%Í°*2°</° Ö°Í±=+± ±!99 ±%9°490146$; 2#67$ '#&4763!6!2#!"'%#!"&{Ğ }!Í[?ÛQşôş½›şÿYâ@.KQ'+==+ş—şÿÿş¥+=êÑ|`ĞşÙl¤“w—8\ë¯şô“«Œ”ş".8şÈ;*+>òò>     şĞó " < / ²:  +°43°'Í°.2²+  +°=/° Ö°Í±>+± ±!#99 0146$;2#67$ '#&4763!2%63!2#!'!"&{Ğ }P…¶e[@ÛQşôş½›şÿYâ@ +Wû ÿ`+==+şâş²ş·şë+=êÑ|`g¹ˆSl¢•w—8\ë¯şô“«Œ”ş * íí<V=şÑ/=     ÿS÷õ U e  °H/²,3=333°YÍ²YH
+³@Y	+°b/°Í°°SÍ°2°/°%3°Í°‘/°QÖ°VÍ²VQ
+³@V		+²QV
+³@Q 	+³JVQ+°EÍ°V±@+°;Í°;±+°&Í²&
+³@&"	+²&
+³@	+°&°1 Ö°6Í°6/°1Í³u&+°pÍ°p/°uÍ±’+±VJ°L9°E²CH]999±;@³9B$9°6±f99°³48hk$9°p°9°u°n9°&±3Š99°1³/|~€$9 ±YHµ+.8BPQ$9°b´&'$9015463!2+3>23.=46;232!#"&547#"&547#"&547.=##"&;26=4&+"2654&532654'673>54&'.#"#")/âC\B#Ô!¦,?şL‰ÂŠk‹Â‰~‹ÂŠ'4-Û0"š"./!š"0ó28 4%':("00?YF6jCAdBbÓ""°->>-j!!""!!ş–@,şÈıùD*/aŠŠa/*,-aŠŠa/*/*aŠŠa.,<(\Pşk"//"õ!/0 µB- Q$1'(1"#Y?6T@TP@S    şÛS     °/° Ö°Í±+ 013nJ›şÛ%øÛşv      şÛS    	  °
/° Ö°Í±+ 0137	nJ›üe›şÛ%øÛæşvşv    şÛ^     @ °/°Í°/°Í°2²
+³@ 	+°/° Ö°Í°±+°Í°±	+°Í±+ 013!%!!yUıl–şjşÛ%øÛeÀı@Ö    şÛ^       X °/°Í°/°Í°/°Í°/°	Í°2²	
+³@ 	+°/° Ö°Í°±+°2°Í°2°±+°2°Í°
2±+ 013!!!!!!yUüpıl–şj–şjşÛ%øÛHÀı@Àı@ı¹          C ²  +°Í²  +°Í°/°Ö°Í°±+°	Í±+±³$9 ±±99016$  $&6 54$zÎ8ÎzzÎşãşÈşäÎå¨×ş ñ@œşñe8ÎzzÎşäşÈşãÎzzÎa\ş£ïş
­-|úª(¿         C ²  +°Í²  +°Í°/°Ö°Í°±+°	Í±+±³$9 ±±99016$  $&6$54$zÎ8ÎzzÎşãşÈşäÎÄ˜Âş¹© ¦şâe8ÎzzÎşäşÈşãÎzzÎeeş¡èş¾¾+­°0½          C ²  +°Í²  +°Í°/°Ö°Í°±+°	Í±+±³$9 ±±99016$  $&>54$zÎ8ÎzzÎşãşÈşäÎ®ƒ¦şäƒêªc¬şÖe8ÎzzÎşäşÈşãÎzzÎfqş¢Şş%Ó
t¶õ…³5¼           D ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±³$9 ±³	 $9016$  $&>54$zÎ8ÎzzÎşãşÈşäÎl‡ê†ò¯g±şÏe8ÎzzÎşäşÈşãÎzzÎg‚ş¦Òş>ír·øˆ¶7»           D ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±³$9 ±³	 $9016$  $&>54$zÎ8ÎzzÎşãşÈşäÎ‘»µ‰ø³jµşÉe8ÎzzÎşäşÈşãÎzzÎgş¶şœşVşûp·ûŠ¸:¹        L ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±³$9°±99 ±³	 $9016$  $&>.zÎ8ÎzzÎşãşÈşäÎ‡~yŠı¶lm¸şe8ÎzzÎşäşÈşãÎzzÎgş•ş½şnşãm¸şş¸m         I ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±±99°±99 ±³	 $9016$  $&32>54.+zÎ8ÎzzÎşãşÈşäÎyŒş¸mm¸şŒe8ÎzzÎşäşÈşãÎzzÎöm¸şŒ‹ş¸m        I ²  +°Í°/°Í° /°Ö°Í°±+°	Í±!+±±99°±99 ±³	 $9016$  $&32>54.+zÎ8ÎzzÎşãşÈşäÎTŒş¸mm¸şŒWe8ÎzzÎşäşÈşãÎzzÎ¹şzş×m¸şŒ‹ş¸mş       ! D ²  +°Í°/°Í°"/°Ö°Í°±+°	Í±#+±³$9 ±³	 $9016$  $&32>54.#"zÎ8ÎzzÎşãşÈşäÎ·¥Œş¸mm¸şŒªe8ÎzzÎşäşÈşãÎzzÎ¹şWşûm¸şŒ‹ş¸mş¾          % B ²  +°Í°!/°Í°&/° Ö°Í°±+°	Í±'+±²999 ±!²	 999014$32 $&%232$>54.#"ÎbĞœÎzzÎşãşÈşãÍzĞï
‹ ÿ¸mm¸ÿ‹%oŠĞbÎzÎşäşÈşãÎzzÎœş9åm¸şŒ‹ş¸m}şŸ       % > ²  +°Í°!/°Í°&/° Ö°Í°±+°
Í±'+±±99 ±!±
 990146$32#"$&%32>54$#"zÎœÎzzÎşãœşãÎzp0-4Œş¹m¹şÃº.#±ÎzzÎşãœşãÎzzÎş!Êm¸ ÿ‹º=¹mş          % > ²  +°Í°!/°Í°&/° Ö°Í°±+°
Í±'+±±99 ±!±
 990146$32#"$&%32>54$#"zÎœÎzzÎşãœşãÎzSKTŒş¹m¹şÃºF8§ÍÎzzÎşãœşãÎzzÎœşµm¸ ÿ‹º=¹`şŸ          - > ²  +°Í°%/°Í°./° Ö°Í°±!+°
Í±/+±!±99 ±%±
 990146$32#"$&732>54$#"zÎœÎzzÎşãœşãÎz·:` mEJŒş¹m¹şÃºWGZŒ[?ÎzzÎşãœşãÎzzÎœP†—~€5m¸ ÿ‹º=¹+enop        & > ²  +°Í°"/°Í°'/° Ö°Í°±+°
Í±(+±±99 ±"±
 990146$32#"$&732>54$#"zÎœÎzzÎşãœşãÎzRm¸ ÿ‹Œş¹m¹şÃº‹ÿ¸mÎzzÎşãœşãÎzzÎœ‹ÿ¸mm¸ ÿ‹º=¹m¹ş       $ D ²
  +°Í° /°Í°%/°Ö°Í°±+°Í±&+±³	
$9 ± ³ $901$  $327>54.'&#"Ïb¢aÍÍşŸş^ş}n¸ ÿ‹XDU~I-)V•c)S‹ÿ¹m1¢aÍÍşŸş^şÏÏ3‹ÿ¸n-|‡O_¸µ 8	l¸ı       & D ²  +°Í°"/°Í°'/°Ö°Í°±+°	Í±(+±³$9 ±"³	 $9016$  $&327>54.'&#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹%-_ƒ@?šs*‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸m:¡¼®e€ñìOm¸ş         % D ²  +°Í°!/°Í°&/°Ö°Í°±+°	Í±'+±³$9 ±!³	 $9016$  $&327>54'&#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹"Pl5„Œ‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸m>¤»¬eÄm|m¸ş       # D ²  +°Í°/°Í°$/°Ö°Í°±+°	Í±%+±³$9 ±³	 $9016$  $&;>54'#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹=S(dk‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸mB§¹©dÁg†m¸ş         " D ²  +°Í°/°Í°#/°Ö°Í°±+°	Í±$+±³$9 ±³	 $9016$  $&32765&#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹O9‹‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸mˆVĞ›m¸ş         I ²  +°Í°/°Í° /°Ö°Í°±+°	Í±!+±±99°	±99 ±³	 $9016$  $&;#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹EF‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸m ÿ°‡'m¸ş        I ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±±99°	±99 ±³	 $9016$  $&;#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸m]m¸ş           L ²  +°Í°/°Í° /°Ö°Í°±+°	Í±!+±±99°	³$9 ±³	 $9016$  $&;#"zÎ8ÎzzÎşãşÈşäÎ(m¸ş‹<>‹ş¸me8ÎzzÎşäşÈşãÎzzÎ¹Œş¸m[Sm¸ş         L ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±±99°	³$9 ±³	 $9016$  $&&"zÎ8ÎzzÎşãşÈşäÎ(l¶û‹w{‹ı·e8ÎzzÎşäşÈşãÎzzÎDşêı¸nı²r<n¸          D ²  +°Í°/°Í°/°Ö°Í°±+°	Í±+±	³$9 ±³	 $9016$  $&&47zÎ8ÎzzÎşãşÈşäÎ(i³øˆ¯^V¸şË´e8ÎzzÎşäşÈşãÎzzÎ¹‰û¸oîÁ¿d‹ºşÇ          : °/°Í²
+³@	+°/°Ö°Í°±+°	Í± +±	³$9 016$  $&&547zÎ8ÎzzÎşãşÈşäÎ(g®ò†g~pµşĞ°e8ÎzzÎşäşÈşãÎzzÎ¹ˆø¶rzXİÆi»şÉ         C ²  +°Í²  +°Í° /°Ö°Í°±+°	Í±!+±	³$9 ±±99016$  $&&547zÎ8ÎzzÎşãşÈşäÎ(_£â³“´ è¦be8ÎzzÎşäşÈşãÎzzÎ¹‚ğ´wjXéÔmku¶ò         C ²  +°Í²  +°Í°/°Ö°Í°±+°	Í± +±	³$9 ±±99016$  $& .547zÎ8ÎzzÎşãşÈşäÎ(I÷gO#Ì³§şïe8ÎzzÎşäşÈşãÎzzÎ¹şş€)3’²¾rØmc¾şÖ        ²  +°
Í°/±+°Í±+ 01 $$ Îb¢aÎÎşŸş^şÒş^şÎÎb¢aÎÎ    ™AİX_<õ      ÑùS8    ÑùS8ÿöıZ=Å             Åı2  <ÿöÿH=                àì D    ª  ­  ­  b  Å  b  Å  ì  1  v  v    Á   |  Á  1  ;  6  !  3  <  D  4  E  E  =  4  0  0  	í  Û  C  ;  	|  	ë  	B  
Q  ¢  Ş  ¡  ¥  £  ª  £  ¢  ¤  ¥  ¡  
  
‹  	  	  	  	  	  	  	  	  	  	  è  	ô  
y  ê  ö  í  	  	  ó  õ  ù  øÿşö  ğ  `  ¨  ¤  £  ¨  ‚  ¥  ²  r  	  d  8  ` (
H  ®  [  9 S  	ë  
5  
  =    =  Ì  ¤  ³ ı  ı  ı      ı        d  £  0  ù  	  C  C  	  C  ú  	  Û  V  ˜  	  J 6  ! vI    V  êÿöÉ ëÿø	5  	„ÿÿ	„  Û  	ë  Û  ¨ D  	  ¤ÿÿ¥                              ·n&İ“J                              C  ú  	  	  Û  e 	Æ 	u 	a 	k 	n 	x 	‹ 	i 	U 		ñ 	« 	
 	
” F     \ n    ö  S  ›  ]          Û                                                       , , , , , , , , , , , , , , , , , , 4–èpÚ	^
úXL´ğN¤ÊŞ–h–Ò. n! #°$à%Ú'(°)*p+~-F.@/š1*2œ4Ö6`7¨9|:Ò;$<T=2=Ö?x@NAˆBÖDFPG¬HÊJZKLFMMôN¸O4OtO®OèP`Q‚R4RbSTdTªUUDU¨V0WjXšYYFYä[4[l[¢\\–]]ˆ^^|^ö_p`4azbäd eºghh¾jjl<mtnÎpHq”qêr€t^tàu>u¶vüwLw~xNy
y>z
{:{ö|¶}’<Ü€Ú‚ ƒ|ƒÂ„„‚…
…’†*†°‡6‡°ˆ6ˆ¼‰R‰ÚŠ`ŠÀŠî‹‹@‹h‹Œ‹°‹Î‹òŒŒ@ŒlŒ˜ŒÄŒîBl”¸Şü@dŠ²ŞVÚ’ö”,•L–ê—Æ˜~™hšv›Xœ64àŸ ¡¡ğ¢ü¤’¥Ú¦Ø§ ¨T¨Î©Fªª®ªÒ««f«À¬¬x¬Ô­.­Œ­ä®B®¢¯¯f¯È°0°°ğ±T±¶²²v²Ô³.³³ì´H´ ´üµXµ‚    ÷X            o        ®  	   æ    	   æ  	     	  >  	  *L  	  xv  	  (î  	 	 J  	  \`  	 È ¼  	 É 0Ò  	 Ê   	 Ë   	Ù  W e a t h e r   I c o n s   l i c e n s e d   u n d e r   S I L   O F L   1 . 1      C o d e   l i c e n s e d   u n d e r   M I T   L i c e n s e      D o c u m e n t a t i o n   l i c e n s e d   u n d e r   C C   B Y   3 . 0 W e a t h e r   I c o n s R e g u l a r 1 . 1 0 0 ; U K W N ; W e a t h e r I c o n s - R e g u l a r W e a t h e r   I c o n s   R e g u l a r V e r s i o n   1 . 1 0 0 ; P S   0 0 1 . 1 0 0 ; h o t c o n v   1 . 0 . 7 0 ; m a k e o t f . l i b 2 . 5 . 5 8 3 2 9 W e a t h e r I c o n s - R e g u l a r E r i k   F l o w e r s ,   L u k a s   B i s c h o f f   ( v 1   A r t ) h t t p : / / w w w . h e l l o e r i k . c o m ,   h t t p : / / w w w . a r t i l l . d e W e b f o n t   1 . 0 T u e   A u g   1 8   1 7 : 2 5 : 1 2   2 0 1 5 d e f a u l t p e r s e u s F o n t   S q u i r r e l         ÿ« 9                     ÷   	
 !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~€‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõöglyph1glyph2uni00A0uni2000uni2001uni2002uni2003uni2004uni2005uni2006uni2007uni2008uni2009uni200Auni202Funi205Funi25FCuniF000uniF001uniF002uniF003uniF004uniF005uniF006uniF007uniF008uniF009uniF00AuniF00BuniF00CuniF00DuniF00EuniF010uniF011uniF012uniF013uniF014uniF015uniF016uniF017uniF018uniF019uniF01AuniF01BuniF01CuniF01DuniF01EuniF021uniF022uniF023uniF024uniF025uniF026uniF027uniF028uniF029uniF02AuniF02BuniF02CuniF02DuniF02EuniF02FuniF030uniF031uniF032uniF033uniF034uniF035uniF036uniF037uniF038uniF039uniF03AuniF03BuniF03CuniF03DuniF03EuniF040uniF041uniF042uniF043uniF044uniF045uniF046uniF047uniF048uniF049uniF04AuniF04BuniF04CuniF04DuniF04EuniF050uniF051uniF052uniF053uniF054uniF055uniF056uniF057uniF058uniF059uniF05AuniF05BuniF05CuniF05DuniF05EuniF060uniF061uniF062uniF063uniF064uniF065uniF066uniF067uniF068uniF069uniF06AuniF06BuniF06CuniF06DuniF06EuniF070uniF071uniF072uniF073uniF074uniF075uniF076uniF077uniF078uniF079uniF07AuniF07BuniF07CuniF07DuniF07EuniF080uniF081uniF082uniF083uniF084uniF085uniF086uniF087uniF088uniF089uniF08AuniF08BuniF08CuniF08DuniF08EuniF08FuniF090uniF091uniF092uniF093uniF094uniF095uniF096uniF097uniF098uniF099uniF09AuniF09BuniF09CuniF09DuniF09EuniF09FuniF0A0uniF0A1uniF0A2uniF0A3uniF0A4uniF0A5uniF0A6uniF0A7uniF0A8uniF0A9uniF0AAuniF0ABuniF0ACuniF0ADuniF0AEuniF0AFuniF0B0uniF0B1uniF0B2uniF0B3uniF0B4uniF0B5uniF0B6uniF0B7uniF0B8uniF0B9uniF0BAuniF0BBuniF0BCuniF0BDuniF0BEuniF0BFuniF0C0uniF0C1uniF0C2uniF0C3uniF0C4uniF0C5uniF0C6uniF0C7uniF0C8uniF0C9uniF0CAuniF0CBuniF0CCuniF0CDuniF0CEuniF0CFuniF0D0uniF0D1uniF0D2uniF0D3uniF0D4uniF0D5uniF0D6uniF0D7uniF0D8uniF0D9uniF0DAuniF0DBuniF0DCuniF0DDuniF0DEuniF0DFuniF0E0uniF0E1uniF0E2uniF0E3uniF0E4uniF0E5uniF0E6uniF0E7uniF0E8uniF0E9uniF0EAuniF0EB  ¸ÿ…° K°PX±Y±F+X!°YK°RX!°€Y°+\XY°+   UÓ¢¸                                                                                                                                                                                                                                                                                      îù>Ë>H¶ŸJ/ñlÉëí^dç¹Qñ^ÖïcÓ4-Ÿöåy
‘ikâ¦S3s¦0FštR*Z&Áµ”¢ZÇ£
A›øM•ü-!‹Ÿ4ûûƒì´B’0ùp~Ü Z`6-~ÀMş}ˆÚr1{Ô€w!ZìEˆêÄ÷$0èÌÍwî“;e»X9Jññ}ğİ8mß‚ôå¹áİ÷Ï&dH4ÀĞó|µöì÷¿Rˆë‰ÃzÜÚÈ?'EŞ´ºC+†0õ$¯|™]Ï	«ãÖÕºä6egÀQ;Æıë+ğDdáAw¤¢ß#Æ«q{“YĞ)8p?LµH¨3Å8J-.‹NØF³œql¾Š“íÓ”Á2o4@àš©p´=Ö‡bÌ<†ß–—Ñß;ÉD
hgyüÚ¹V~#%1€´µá°BWñéˆt>6¡Òhó*ĞÇ/ÈûH{9¢šÍgÓpO¼2ÍÑ)ÄrÍ†­ äè.ŠO9æ3o€ÒéUª:ßqË†a§{ä/yoxÁß–Å’I4ŸW»ıEjŞÀ(ô#P*ÁOl»ûâDZCJxËîœöÁ¨¯ÕÈ”Òÿ
4¸±Wš¬ª¥³={ßãä$WÛŞ*t0.óA(ZÓ¿´V3aLKX*H¦j±µ^ÿ˜áùfàà€áÑ‚®oq^à¯]oö+bp‡ÜÖmˆE‡-ü‰’7%Àe#sU@µ¶›Ğ6gU'¾ı©VQ;‘¹[d,™7(P«^XÂ‚¡œÃ"´>5%”¡/¯‰|ö§w™Xe[ÛÒô,ãvÑ~„€ö‰*QoBÛ´øÏøjà+ÒÎ	IĞ¿—Ä IÈSùq¿Öì½'Qİ„—w™p¶1õÕ­ÄÕidúù|Xo¹hXv74TrèœÜ¢\š½¨7 ÇÍL¡ãç¼<R@µü¤?:F!v-°n]´qÈéöF’K‹›ûRBº±SØ9õt¤€*íä=Ã”tHäú–Fİ­8x¾ 2u›ŞÌŠ/Ÿ„êÏ¼É#ŸMhÉøJ•‚À£dØuçö!¥öç!„x¿sã«0;ÃÔ5Ø`è°`8#úæ–¬Äg}B!ò3…¾!;ô>vÆ w³ó¤…ÌES]÷!è`®@•ı¶WÂÇ†Î¹ÀhAu‰í±ÔÉ&ÆØ…AÇ/2€CP°Ô7N¼--µê »«6$¡·‡‰M»ûqë€ÄgÛï“%Û$:\™íIi.Fé!ZéÁ‹ˆqFDH†ÚÁ·dsªhÚíK®Õ »#*æ‹SHÅ™FòZ~*ª
üŸq¾á­é³{²¨ü|½uÚc¤ü¨2˜`[d;TQ•ªá‚‡ú¦½Q†OˆÓ²$x8)•½wÓ£x{fkI›˜˜ÇsŞäì‡²ÀCÀR8÷ê5?]¢¾³‘z™7k§/ì½ÁÍõó  ı5€)Ój¼—ó~qŠ›cßáÃ°r;€ÆxÉ-&º{§À¸¹[xcá¼b=¹UŒÏfo™—|%ÁÄÎ÷·İ÷Ê|nF¤ÕğÄÁ=ôã·«ÙÇEbŠç»…’[íj­ÖD6-X¼õR“ëh¹x¶Å´>W€E11Ç…ÚÚ‡ó=2õè–—K_W+-PÇf’†ÛÖ‰r?ı,ŸMØT÷w1µ±ı…‰hÄJšÛr²8Áô±Z4°|¯ÔËw³TÄ2ºİb)ÖZ
6¨}ùôÌ¼q[ŸQøŠÊqÒu7$ºˆÁ°N,_÷›Õ  ™?¥¶dyGrÜÏò¢×Ùá$´VÓ7g¹Z€—á«5Æ˜e¨æ)ìÔtC¶‰¾]ˆa¹ğàÇnWúoÁ†ÒÍa8aXÏJˆ\Ï”HsŞLBDáÛû8£Bg¹=R•¤ù©â)š¢_¢ÁwÛ­›è"«‚7ÚòYék–çOİ¶}W—Öÿôóß,¶+"‰2Š-›Ù<­ŞvÔ`EÓ”Ef—´vµõ‹â–êõ^x5öéóHë’ÌÌä6mkbp0£èÆW—¾†ñÁ%'fÿ#9´6‹U– ¸ŞEªc—Ãv€*úÿ·ÓLO4ñ”ôé²9›£ 2WLÓÀ8Ì—d˜cÅˆhÖ*LÊQ&\ïG°ã°“$n‡÷•°™‚PğD ;bÆŒö4A‚[ÓŠ«ÅÏ[\l¤}ÕÊc0ØàO„ÅÓ®‡ç°%»>ŠôÀ áÚ(ym‰/–``f¹ÛùJqL«ùÚŠ™öŸQ‹„rÎÖî¶MsÌ©ŞÀ|¸öğGˆ´Zâ1)òvé·“Ê6rÇ½0«“?¯ß¹[v¤ŞóJ‹´¢w@£;H§„Ä6õ:"±6nEÉ¼"«Ïò¨²~‘mtînù®‡x!`ĞÕ ¤”œ99º¯/•?S"ş5‡S×Ñ‚Ì¸¡\÷u}%›Z}¶°*\/€íñ²
‹ß`4ŒÅ¢6§CèÎµblù±Ñ%Äº~âAœˆ6wAUøè›q~LˆÑ5İ¨¬ıƒõ»­';~(şı©J$ğ§$\
y<€Í°Ú5İëkä6W6/İ¼\Ä`A‰—ê×uüÍ,\0»jx¿ğ¸Mí3.Á¦ÎÜÒ&Ø
zn€öÿ’I{W¢LîèÌ(éçP»<=`z¯:Ê=ï‘¹­­ú«bÄf¨tz¾Èb±$:Z¬/$»Àsb@/Ÿê›ƒ;êïù$Ÿ”l	³gj—9ıLÑªUï¥rĞj».Ç$ìgQpï
ÿ[Ÿ˜I\n}]¡—¥{’Ğæ1›Óì9T2òÔx*‡Ò$î9ç|?ÜŞeÊŞµU×‰ÄEÅ»…NšÈdÇbÛÍŸÖW%xn-9¬ìò0#Ñ
œÙd©K²î¡y¥ÚDÛ3ûğÆGDŒ$TVÙ–ei\­MÉİ$”QûË¶ÃÛÿŸS)LRæCªß,/ø¿ºõ˜g„7Fİ
úµë-Õ,*õ"÷ä‹Øöu‘¯£?˜)Ñ\ô4cµ‡5Ö¦–)i_@5}ÂJ¤xĞÕ—FƒQŒ3>$kóShYĞ«pŞo­ÏPÌÍéÇ¨£]&„ÁiL¿
‚Ÿ	‰ŒÌøÅêÖ˜0Ò–¹Àq½á—!ƒæÌºµeäš¯§İJŸı:*áš12JgxÎéáôj8Oa@OÖzS²§ğá‹Ğ à=D…nÔjŸ›k:I\DEo^šfJÕ ³,úÚ}Jà
©ÿä’ uŠ°um˜§·#ïˆß5=š~<Çáóš32ûÊÒKD<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Flot Examples: Pie Charts</title>
	<link href="../examples.css" rel="stylesheet" type="text/css">
	<style type="text/css">

	.demo-container {
		position: relative;
		height: 400px;
	}

	#placeholder {
		width: 550px;
	}

	#menu {
		position: absolute;
		top: 20px;
		left: 625px;
		bottom: 20px;
		right: 20px;
		width: 200px;
	}

	#menu button {
		display: inline-block;
		width: 200px;
		padding: 3px 0 2px 0;
		margin-bottom: 4px;
		background: #eee;
		border: 1px solid #999;
		border-radius: 2px;
		font-size: 16px;
		-o-box-shadow: 0 1px 2px rgba(0,0,0,0.15);
		-ms-box-shadow: 0 1px 2px rgba(0,0,0,0.15);
		-moz-box-shadow: 0 1px 2px rgba(0,0,0,0.15);
		-webkit-box-shadow: 0 1px 2px rgba(0,0,0,0.15);
		box-shadow: 0 1px 2px rgba(0,0,0,0.15);
		cursor: pointer;
	}

	#description {
		margin: 15px 10px 20px 10px;
	}

	#code {
		display: block;
		width: 870px;
		padding: 15px;
		margin: 10px auto;
		border: 1px dashed #999;
		background-color: #f8f8f8;
		font-size: 16px;
		line-height: 20px;
		color: #666;
	}

	ul {
		font-size: 10pt;
	}

	ul li {
		margin-bottom: 0.5em;
	}

	ul.options li {
		list-style: none;
		margin-bottom: 1em;
	}

	ul li i {
		color: #999;
	}

	</style>
	<!--[if lte IE 8]><script language="javascript" type="text/javascript" src="../../excanvas.min.js"></script><![endif]-->
	<script language="javascript" type="text/javascript" src="../../jquery.js"></script>
	<script language="javascript" type="text/javascript" src="../../jquery.flot.js"></script>
	<script language="javascript" type="text/javascript" src="../../jquery.flot.pie.js"></script>
	<script type="text/javascript">

	$(function() {

		// Example Data

		//var data = [
		//	{ label: "Series1",  data: 10},
		//	{ label: "Series2",  data: 30},
		//	{ label: "Series3",  data: 90},
		//	{ label: "Series4",  data: 70},
		//	{ label: "Series5",  data: 80},
		//	{ label: "Series6",  data: 110}
		//];

		//var data = [
		//	{ label: "Series1",  data: [[1,10]]},
		//	{ label: "Series2",  data: [[1,30]]},
		//	{ label: "Series3",  data: [[1,90]]},
		//	{ label: "Series4",  data: [[1,70]]},
		//	{ label: "Series5",  data: [[1,80]]},
		//	{ label: "Series6",  data: [[1,0]]}
		//];

		//var data = [
		//	{ label: "Series A",  data: 0.2063},
		//	{ label: "Series B",  data: 38888}
		//];

		// Randomly Generated Data

		var data = [],
			series = Math.floor(Math.random() * 6) + 3;

		for (var i = 0; i < series; i++) {
			data[i] = {
				label: "Series" + (i + 1),
				data: Math.floor(Math.random() * 100) + 1
			}
		}

		var placeholder = $("#placeholder");

		$("#example-1").click(function() {

			placeholder.unbind();

			$("#title").text("Default pie chart");
			$("#description").text("The default pie chart with no options set.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true
					}
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true",
				"        }",
				"    }",
				"});"
			]);
		});

		$("#example-2").click(function() {

			placeholder.unbind();

			$("#title").text("Default without legend");
			$("#description").text("The default pie chart when the legend is disabled. Since the labels would normally be outside the container, the chart is resized to fit.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-3").click(function() {

			placeholder.unbind();

			$("#title").text("Custom Label Formatter");
			$("#description").text("Added a semi-transparent background to the labels and a custom labelFormatter function.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 1,
							formatter: labelFormatter,
							background: {
								opacity: 0.8
							}
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            radius: 1,",
				"            label: {",
				"                show: true,",
				"                radius: 1,",
				"                formatter: labelFormatter,",
				"                background: {",
				"                    opacity: 0.8",
				"                }",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-4").click(function() {

			placeholder.unbind();

			$("#title").text("Label Radius");
			$("#description").text("Slightly more transparent label backgrounds and adjusted the radius values to place them within the pie.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 3/4,
							formatter: labelFormatter,
							background: {
								opacity: 0.5
							}
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            radius: 1,",
				"            label: {",
				"                show: true,",
				"                radius: 3/4,",
				"                formatter: labelFormatter,",
				"                background: {",
				"                    opacity: 0.5",
				"                }",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-5").click(function() {

			placeholder.unbind();

			$("#title").text("Label Styles #1");
			$("#description").text("Semi-transparent, black-colored label background.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 3/4,
							formatter: labelFormatter,
							background: { 
								opacity: 0.5,
								color: "#000"
							}
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: { ",
				"            show: true,",
				"            radius: 1,",
				"            label: {",
				"                show: true,",
				"                radius: 3/4,",
				"                formatter: labelFormatter,",
				"                background: { ",
				"                    opacity: 0.5,",
				"                    color: '#000'",
				"                }",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-6").click(function() {

			placeholder.unbind();

			$("#title").text("Label Styles #2");
			$("#description").text("Semi-transparent, black-colored label background placed at pie edge.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 3/4,
						label: {
							show: true,
							radius: 3/4,
							formatter: labelFormatter,
							background: { 
								opacity: 0.5,
								color: "#000"
							}
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            radius: 3/4,",
				"            label: {",
				"                show: true,",
				"                radius: 3/4,",
				"                formatter: labelFormatter,",
				"                background: {",
				"                    opacity: 0.5,",
				"                    color: '#000'",
				"                }",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-7").click(function() {

			placeholder.unbind();

			$("#title").text("Hidden Labels");
			$("#description").text("Labels can be hidden if the slice is less than a given percentage of the pie (10% in this case).");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 2/3,
							formatter: labelFormatter,
							threshold: 0.1
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            radius: 1,",
				"            label: {",
				"                show: true,",
				"                radius: 2/3,",
				"                formatter: labelFormatter,",
				"                threshold: 0.1",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-8").click(function() {

			placeholder.unbind();

			$("#title").text("Combined Slice");
			$("#description").text("Multiple slices less than a given percentage (5% in this case) of the pie can be combined into a single, larger slice.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						combine: {
							color: "#999",
							threshold: 0.05
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            combine: {",
				"                color: '#999',",
				"                threshold: 0.1",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-9").click(function() {

			placeholder.unbind();

			$("#title").text("Rectangular Pie");
			$("#description").text("The radius can also be set to a specific size (even larger than the container itself).");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 500,
						label: {
							show: true,
							formatter: labelFormatter,
							threshold: 0.1
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            radius: 500,",
				"            label: {",
				"                show: true,",
				"                formatter: labelFormatter,",
				"                threshold: 0.1",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});"
			]);
		});

		$("#example-10").click(function() {

			placeholder.unbind();

			$("#title").text("Tilted Pie");
			$("#description").text("The pie can be tilted at an angle.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true,
						radius: 1,
						tilt: 0.5,
						label: {
							show: true,
							radius: 1,
							formatter: labelFormatter,
							background: {
								opacity: 0.8
							}
						},
						combine: {
							color: "#999",
							threshold: 0.1
						}
					}
				},
				legend: {
					show: false
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true,",
				"            radius: 1,",
				"            tilt: 0.5,",
				"            label: {",
				"                show: true,",
				"                radius: 1,",
				"                formatter: labelFormatter,",
				"                background: {",
				"                    opacity: 0.8",
				"                }",
				"            },",
				"            combine: {",
				"                color: '#999',",
				"                threshold: 0.1",
				"            }",
				"        }",
				"    },",
				"    legend: {",
				"        show: false",
				"    }",
				"});",
			]);
		});

		$("#example-11").click(function() {

			placeholder.unbind();

			$("#title").text("Donut Hole");
			$("#description").text("A donut hole can be added.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						innerRadius: 0.5,
						show: true
					}
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            innerRadius: 0.5,",
				"            show: true",
				"        }",
				"    }",
				"});"
			]);
		});

		$("#example-12").click(function() {

			placeholder.unbind();

			$("#title").text("Interactivity");
			$("#description").text("The pie can be made interactive with hover and click events.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true
					}
				},
				grid: {
					hoverable: true,
					clickable: true
				}
			});

			setCode([
				"$.plot('#placeholder', data, {",
				"    series: {",
				"        pie: {",
				"            show: true",
				"        }",
				"    },",
				"    grid: {",
				"        hoverable: true,",
				"        clickable: true",
				"    }",
				"});"
			]);

			placeholder.bind("plothover", function(event, pos, obj) {

				if (!obj) {
					return;
				}

				var percent = parseFloat(obj.series.percent).toFixed(2);
				$("#hover").html("<span style='font-weight:bold; color:" + obj.series.color + "'>" + obj.series.label + " (" + percent + "%)</span>");
			});

			placeholder.bind("plotclick", function(event, pos, obj) {

				if (!obj) {
					return;
				}

				percent = parseFloat(obj.series.percent).toFixed(2);
				alert(""  + obj.series.label + ": " + percent + "%");
			});
		});

		// Show the initial default chart

		$("#example-1").click();

		// Add the Flot version string to the footer

		$("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
	});

	// A custom label formatter used by several of the plots

	function labelFormatter(label, series) {
		return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
	}

	//

	function setCode(lines) {
		$("#code").text(lines.join("\n"));
	}

	</script>
</head>
<body>

	<div id="header">
		<h2>Pie Charts</h2>
	</div>

	<div id="content">

		<h3 id="title"></h3>
		<div class="demo-container">
			<div id="placeholder" class="demo-placeholder"></div>
			<div id="menu">
				<button id="example-1">Default Options</button>
				<button id="example-2">Without Legend</button>
				<button id="example-3">Label Formatter</button>
				<button id="example-4">Label Radius</button>
				<button id="example-5">Label Styles #1</button>
				<button id="example-6">Label Styles #2</button>
				<button id="example-7">Hidden Labels</button>
				<button id="example-8">Combined Slice</button>
				<button id="example-9">Rectangular Pie</button>
				<button id="example-10">Tilted Pie</button>
				<button id="example-11">Donut Hole</button>
				<button id="example-12">Interactivity</button>
			</div>
		</div>

		<p id="description"></p>

		<h3>Source Code</h3>
		<pre><code id="code"></code></pre>

		<br/>

		<h2>Pie Options</h2>

		<ul class="options">
			<li style="border-bottom: 1px dotted #ccc;"><b>option:</b> <i>default value</i> - Description of option</li>
			<li><b>show:</b> <i>false</i> - Enable the plugin and draw as a pie.</li>
			<li><b>radius:</b> <i>'auto'</i> - Sets the radius of the pie. If value is between 0 and 1 (inclusive) then it will use that as a percentage of the available space (size of the container), otherwise it will use the value as a direct pixel length. If set to 'auto', it will be set to 1 if the legend is enabled and 3/4 if not.</li>
			<li><b>innerRadius:</b> <i>0</i> - Sets the radius of the donut hole. If value is between 0 and 1 (inclusive) then it will use that as a percentage of the radius, otherwise it will use the value as a direct pixel length.</li>
			<li><b>startAngle:</b> <i>3/2</i> - Factor of PI used for the starting angle (in radians) It can range between 0 and 2 (where 0 and 2 have the same result).</li>
			<li><b>tilt:</b> <i>1</i> - Percentage of tilt ranging from 0 and 1, where 1 has no change (fully vertical) and 0 is completely flat (fully horizontal -- in which case nothing actually gets drawn).</li>
			<li><b>shadow:</b> <ul>
				<li><b>top:</b> <i>5</i> - Vertical distance in pixel of the tilted pie shadow.</li>
				<li><b>left:</b> <i>15</i> - Horizontal distance in pixel of the tilted pie shadow.</li>
				<li><b>alpha:</b> <i>0.02</i> - Alpha value of the tilted pie shadow.</li>
			</ul>
			<li><b>offset:</b> <ul>
				<li><b>top:</b> <i>0</i> - Pixel distance to move the pie up and down (relative to the center).</li>
				<li><b>left:</b> <i>'auto'</i> - Pixel distance to move the pie left and right (relative to the center).</li>
			</ul>
			<li><b>stroke:</b> <ul>
				<li><b>color:</b> <i>'#FFF'</i> - Color of the border of each slice. Hexadecimal color definitions are prefered (other formats may or may not work).</li>
				<li><b>width:</b> <i>1</i> - Pixel width of the border of each slice.</li>
			</ul>
			<li><b>label:</b> <ul>
				<li><b>show:</b> <i>'auto'</i> - Enable/Disable the labels. This can be set to true, false, or 'auto'. When set to 'auto', it will be set to false if the legend is enabled and true if not.</li>
				<li><b>radius:</b> <i>1</i> - Sets the radius at which to place the labels. If value is between 0 and 1 (inclusive) then it will use that as a percentage of the available space (size of the container), otherwise it will use the value as a direct pixel length.</li>
				<li><b>threshold:</b> <i>0</i> - Hides the labels of any pie slice that is smaller than the specified percentage (ranging from 0 to 1) i.e. a value of '0.03' will hide all slices 3% or less of the total.</li>
				<li><b>formatter:</b> <i>[function]</i> - This function specifies how the positioned labels should be formatted, and is applied after the legend's labelFormatter function. The labels can also still be styled using the class "pieLabel" (i.e. ".pieLabel" or "#graph1 .pieLabel").</li>
				<li><b>radius:</b> <i>1</i> - Sets the radius at which to place the labels. If value is between 0 and 1 (inclusive) then it will use that as a percentage of the available space (size of the container), otherwise it will use the value as a direct pixel length.</li>
				<li><b>background:</b> <ul>
					<li><b>color:</b> <i>null</i> - Backgound color of the positioned labels. If null, the plugin will automatically use the color of the slice.</li>
					<li><b>opacity:</b> <i>0</i> - Opacity of the background for the positioned labels. Acceptable values range from 0 to 1, where 0 is completely transparent and 1 is completely opaque.</li>
				</ul>
			</ul>
			<li><b>combine:</b> <ul>
				<li><b>threshold:</b> <i>0</i> - Combines all slices that are smaller than the specified percentage (ranging from 0 to 1) i.e. a value of '0.03' will combine all slices 3% or less into one slice).</li>
				<li><b>color:</b> <i>null</i> - Backgound color of the positioned labels. If null, the plugin will automatically use the color of the first slice to be combined.</li>
				<li><b>label:</b> <i>'Other'</i> - Label text for the combined slice.</li>
			</ul>
			<li><b>highlight:</b> <ul>
				<li><b>opacity:</b> <i>0.5</i> - Opacity of the highlight overlay on top of the current pie slice. Currently this just uses a white overlay, but support for changing the color of the overlay will also be added at a later date.
			</ul>
		</ul>
		
		<h2>Changes/Features</h2>
		<ul>
			<li style="list-style: none;"><i>v1.0 - November 20th, 2009 - Brian Medendorp</i></li>
			<li>The pie plug-in is now part of the Flot repository! This should make it a lot easier to deal with.</li>
			<li>Added a new option (innerRadius) to add a "donut hole" to the center of the pie, based on comtributions from Anthony Aragues. I was a little reluctant to add this feature because it doesn't work very well with the shadow created for the tilted pie, but figured it was worthwhile for non-tilted pies. Also, excanvas apparently doesn't support compositing, so it will fall back to using the stroke color to fill in the center (but I recommend setting the stroke color to the background color anyway).</li>
			<li>Changed the lineJoin for the border of the pie slices to use the 'round' option. This should make the center of the pie look better, particularly when there are numerous thin slices.</li>
			<li>Included a bug fix submitted by btburnett3 to display a slightly smaller slice in the event that the slice is 100% and being rendered with Internet Explorer. I haven't experienced this bug myself, but it doesn't seem to hurt anything so I've included it.</li>
			<li>The tilt value is now used when calculating the maximum radius of the pie in relation to the height of the container. This should prevent the pie from being smaller than it needed to in some cases, as well as reducing the amount of extra white space generated above and below the pie.</li>
			<li><b>Hover and Click functionality are now availabe!</b><ul>
				<li>Thanks to btburnett3 for the original hover functionality and Anthony Aragues for the modification that makes it compatable with excanvas, this was a huge help!</li>
				<li>Added a new option (highlight opacity) to modify the highlight created when mousing over a slice. Currently this just uses a white overlay, but an option to change the hightlight color will be added when the appropriate functionality becomes available.
				<li>I had a major setback that required me to practically rebuild the hover/click events from scratch one piece at a time (I discovered that it only worked with a single pie on a page at a time), but the end result ended up being virtually identical to the original, so I'm not quite sure what exactly made it work.</li>
				<li><span style="color: red;">Warning:</span> There are some minor issues with using this functionality in conjuction with some of the other more advanced features (tilt and donut). When using a donut hole, the inner portion still triggers the events even though that portion of the pie is no longer visible. When tilted, the interactive portions still use the original, untilted version of the pie when determining mouse position (this is because the isPointInPath function apparently doesn't work with transformations), however hover and click both work this way, so the appropriate slice is still highlighted when clicking, and it isn't as noticable of a problem.</li>
			</ul></li>
			<li>Included a bug fix submitted by Xavi Ivars to fix array issues when other javascript libraries are included in addition to jQuery</li>
			<br/>
			<li style="list-style: none;"><i>v0.4 - July 1st, 2009 - Brian Medendorp</i></li>
			<li>Each series will now be shown in the legend, even if it's value is zero. The series will not get a positioned label because it will overlap with the other labels present and often makes them unreadable.</li>
			<li>Data can now be passed in using the standard Flot method using an array of datapoints, the pie plugin will simply use the first y-value that it finds for each series in this case. The plugin uses this datastructure internally, but you can still use the old method of passing in a single numerical value for each series (the plugin will convert it as necessary). This should make it easier to transition from other types of graphs (such as a stacked bar graph) to a pie.</li>
			<li>The pie can now be tilted at an angle with a new "tilt" option. Acceptable values range from 0-1, where 1 has no change (fully vertical) and 0 is completely flat (fully horizontal -- in which case nothing actually gets drawn). If the plugin determines that it will fit within the canvas, a drop shadow will be drawn under the tilted pie (this also requires a tilt value of 0.8 or less).</li>
			<br/>
			<li style="list-style: none;"><i>v0.3.2 - June 25th, 2009 - Brian Medendorp</i></li>
			<li>Fixed a bug that was causing the pie to be shifted too far left or right when the legend is showing in some cases.</li>
			<br/>
			<li style="list-style: none;"><i>v0.3.1 - June 24th, 2009 - Brian Medendorp</i></li>
			<li>Fixed a bug that was causing nothing to be drawn and generating a javascript error if any of the data values were set to zero.</li>
			<br/>
			<li style="list-style: none;"><i>v0.3 - June 23rd, 2009 - Brian Medendorp</i></li>
			<li>The legend now works without any modifications! Because of changes made to flot and the plugin system (thanks Ole Laursen!) I was able to simplify a number of things and am now able to use the legend without the direct access hack that was required in the previous version.</li>
			<br/>
			<li style="list-style: none;"><i>v0.2 - June 22nd, 2009 - Brian Medendorp</i></li>
			<li>The legend now works but only if you make the necessary changes to jquery.flot.js. Because of this, I changed the default values for pie.radius and pie.label.show to new 'auto' settings that change the default behavior of the size and labels depending on whether the legend functionality is available or not.</li>
			<br/>
			<li style="list-style: none;"><i>v0.1 - June 18th, 2009 - Brian Medendorp</i></li>
			<li>Rewrote the entire pie code into a flot plugin (since that is now an option), so it should be much easier to use and the code is cleaned up a bit. However, the (standard flot) legend is no longer available because the only way to prevent the grid lines from being displayed also prevents the legend from being displayed. Hopefully this can be fixed at a later date.</li>
			<li>Restructured and combined some of the options. It should be much easier to deal with now.</li>
			<li>Added the ability to change the starting point of the pie (still defaults to the top).</li>
			<li>Modified the default options to show the labels to compensate for the lack of a legend.</li>
			<li>Modified this page to use a random dataset. <span style="color: red">Note: you may need to refresh the page to see the effects of some of the examples.</span></li>
			<br/>
			<li style="list-style: none;"><i>May 21st, 2009 - Brian Medendorp</i></li>
			<li>Merged original pie modifications by Sergey Nosenko into the latest SVN version <i>(as of May 15th, 2009)</i> so that it will work with ie8.</li>
			<li>Pie graph will now be centered in the canvas unless moved because of the legend or manually via the options. Additionally it prevents the pie from being moved beyond the edge of the canvas.</li>
			<li>Modified the code related to the labelFormatter option to apply flot's legend labelFormatter first. This is so that the labels will be consistent, but still provide extra formatting for the positioned labels (such as adding the percentage value).</li>
			<li>Positioned labels now have their backgrounds applied as a seperate element (much like the legend background) so that the opacity value can be set independently from the label itself (foreground). Additionally, the background color defaults to that of the matching slice.</li>
			<li>As long as the labelOffset and radiusLimit are not set to hard values, the pie will be shrunk if the labels will extend outside the edge of the canvas</li>
			<li>Added new options "radiusLimitFactor" and "radiusLimit" which limits how large the (visual) radius of the pie is in relation to the full radius (as calculated from the canvas dimensions) or a hard-pixel value (respectively). This allows for pushing the labels "outside" the pie.</li>
			<li>Added a new option "labelHidePercent" that does not show the positioned labels of slices smaller than the specified percentage. This is to help prevent a bunch of overlapping labels from small slices.</li>
			<li>Added a new option "sliceCombinePercent" that combines all slices smaller than the specified percentage into one larger slice. 