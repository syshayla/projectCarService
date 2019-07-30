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
                                                                                                                                                                                                                                                                                                                                                                                                                                     �J��	9f�P��WV<t�[���O�I?R�RE�ڽt�ң$��-q
��A҃���KVva��t����|�
����yM�Pb�`B2Vs�@F����.�����םAţM�$B)����}���z�����mA�Ұ�er��92@�3��R��J�G���`ev��������	ad�"� UY2��`�u<8f���oѲ�Z��T&<��od��|�����fZ���7g���w65~�j����$�@0��Þy����[kuwzŉ�-���+�� ���vZ�qZр%ǽ��zD+M��
O�W����J�g���oB`��:���T�t�z<Y��\���A����2ql�f�o��?�6�S���%��t����|30�����#|�r�ُCZ\�et��}ǟEy�k��*����z�$�?��6�,����m����V�
��b���Fی���-�瘽�5(�1Η��ñc�"���:����G3�4� )+��?2H�ȇ�&�z�^~��/�mz����{�E^R[�Qq7a��D���7<�_=9L�����I�س�o���ʩ��T}Sy����:�!������emmum��_����ŵ�8y��G�Ä��u��φ��şz�q�Yy�YJW1ۆe���Z�I���(�.mj-��V����Y�{u�7����Md�9��.C���3l�P[�98�����'�r}�\�{��4򒷟��r���3J�*�T�t�H�̌��4ɪ�.MS+�
���^�e�(4Vѹ\|��x��+�܌��܉I֞/��s F0�8�[���S��/rɰ�������D��̓Q�ov��B8Hx?Ҽ_><v���<���E�x�YN|\"���;�����e1`����Q�ZL�Gx	$�������am�k �
W��K�
���>���]������Z�}�4����v�2�����a����#�x�nc�u��qUVTUF݆���m�Q7V�5�/%�Uc�h�"h�\I<2��P�����M?�&d��ۓ�pv�k�ؚ�b�.P<\h��&ɉNp������y�0?Yi�[��i����>��n-%��0�X|Q�����,u���G7�FLً�г�J�y�k��X�灧,���:��	��˞Ĥ���С�wc���YBX���]�/��祭fR�j�n��v�������Bڎ�C��;��5��[f�����w�;�1Ȫ|�d�h�4�`��Op}+��7Y��#:�#���sw��Cun���_A�����z;�Q�9�e�q_ʽJ�J�7�zE$��d�/?e�}g�P>�����i����g�p��Aj�u�h���Rn������kz��o���
�|W�u�Nu�321�Y��oR^s*%�8'],�JX�d�?DQ[�c`2Z���ŵ�6J��'S�zJ�OR3��~J�Ze����R�	WSkmV����{��1�gO=_�瞮K���7N�+b5��s��y$�50��¼�
�y��@��Cv���y�NubqA6��Y���s��h��Z����2{��NZ1��3���'}P��O���}���:z��Q��<B�W�I�&!y�@ʏ��C�}+����J�p��|�P,��C|-��ph���(a*�He�N�RGx6��g�Y���T����]�����;;�'YH� �WY���t�|B>�#Z�*Ɯ�e���ۣK��h�3�Ż�]��(|��]�X��ͱ=v��!�6Å�9��Lը�R�&إ�p?���M�=��T�K7�EoK�.&]'��Oc~$#��L�����\|ޯ;@���h�H����;�e��M&��ϒ�������Q
=NT�����9Kx�i�gG�\��N�c))��e{�}�����2�=���=o�g�"��
d���R:3^օ%<]O \��:s���<�z�Ҭu�^	j�ö`����K����їz-XxL��G�v]�����f�8����b�J/[z�����G������+�WO�r.�{L?9�l$�����Y�p'�L
��M���F�M��_���o���	W]CI���?�8%)�.8��-�x{?����;B"�z��f����:�i5�ސ9��Z��Р��ʀ��%שP^��1��9$�b�M#��&��EB�T����6���X��}��Q\�B��YhX��'�]�`��Ȃ�;lF��M�,M<Iڬ3iC[_�I�+�7ͣ��b\���|k|�*�}�Б��jh���g�Y$�$g
OM9�{"1�Ϻ��(z+�Ƕ���@ Yy�/�@�̎g�O��R7Q��~�A^�2z�{��;?�L��*qa]�庀2���J��U��O4*$ir_N�sk�߃�ZĞ�$�N�IQ��e���Z9�6�ZY��G�?��.ؾ��LB��	K�)�y�����W��~�6f�x��S%odu=�SLq�@����g-kW'3�`"���j�_�&۟�Z&���K��Q�8�A����s'PS$7��zI�O+��u�Q����ފ�F�o�X��n�Q��=��WQf��d˕2(���hT�$a�rW)������ԋy���w�+Z�T�!�~׏4x�al����W&�Y[��iy6�Уzw���#vw�7}���yZ]?v�-�vq�j=e��цyP8�����{��N���J�o��st��(I�[}�����+!��:2h�o�����!\�E��T8�<��;:IW˶��1/Q���{(���ދ9�>��]�H�FM4��v7��"�:=ڧG�	-Y3�c�ޘQ�Kb��e���%�K3�������S������e�l�)�����5��%Ŗo��S�y搽u	��R����X�ѝ�;�o�L.ܪP}����i�Q��T'�A�fD��J���}��%EhzI �������)t�����Yx�"��_�P*�H��J�����
n|gF��5�
�<j�}�3����j}��8ٿ��N�k�t���"�:��[\�� f �����@�����F�Y)�t�3v �z����Ez��"i�{���M{���s[���u�hA���v���7q��{SςW�����#I���oL���m߃����`%T�a9�;��aS��K�{��~7b����Ҟr?{-�~g��"�	|�8���+�Fr�}q^�f�p�/a�y����{TJ�g8
Q���>v�
*|��>n��LfzA����5�+�-xW�����O<��o�{���x�&����� ú�|$�x���ޗ�M����\ʉ��w�hW���L��������'�����*�~�d�+�۬cCťAq��seh8�P؊�eMŬ��n���8��[]�1�綋/@*�M�P�h��/���ޯ��rZ�R�'虺��������k�O��7��%#i��:��;|��\������2�h?W�p��b"+A����\^��A�r��غf����T��X�4V�K|#�O!��2o��~���^e��,7~}0DѢ� ��Z�	�@��&�e���&֗�e�)�%jƈ̴�g_�=��M�ú=��[P�,��� S�2�l�5�W.�        FFTMp/��     GDEF$   8    OS/2t�d�  X   `cmap�:  �  �cvt 	+�  d   fpgmS�/�  �  egasp     �   glyf� y�  � kheadY% p�   6hhea�	� q0   $hmtxFr"j qT  �loca��6 u  �maxp� v�    name}��� w  �post�Sa z�  	�prep��+ ��   .webf��U� ��          �=��    ����    ��S8               �         �  2�   �2�  � 9�                           UKWN @  �����  ��                               �       �         � 
 / _%����>�N�^�n�~����     �   / _%�� ��!�@�P�`�p�������d���߲�                                                                                                                                                                                                                                                                                                 � � � � � � � � � x z D  � ,� K�LPX�JvY� #?�+X=YK�LPX}Y ԰.-�, ڰ+-�,KRXE#Y!-�,i �@PX!�@Y-�,�+X!#!zX��YKRXX��Y#!�+X�FvYX��YYY-�,\Z-�,�"�PX� �\\� Y-�,�$�PX�@�\\� Y-�, 9/-�	, }�+X��Y �%I# �&J� PX�e�a � PX8!!Y��a � RX8!!YY-�
,�+X!!Y-�, Ұ+-�, /�+\X  G#Faj X db8!!Y!Y-�,  9/ � G�Fa#� �#J� PX#� RX�@8!Y#� PX�@e8!YY-�,�+X=�!! ֊KRX �#I � UX8!!Y!!YY-�,# � /�+\X# XKS!�YX��&I#�# �I�#a8!!!!Y!!!!!Y-�, ڰ+-�, Ұ+-�, /�+\X  G#Faj� G#F#aj` X db8!!Y!!Y-�, � �� �%Jd#�� PX<�Y-�,� @@BBK� c K� c � �UX � �RX#b � #Bb �#BY �@RX�   CcB� CcB� c�e!Y!!Y-�,�Cc#� Cc#-     ��   D  dU   .� /<��2��<��2 � /<��2��<��23!%!!D �$��hU��D�               1  	  �{7�  7 s � � � � � �� �  +�Z3�ͰT2�/�
Ͱ /�5Ͱ�2�5��ͰN/��ͳ&�N+�0ͳ��N+��ͰG/�kͳ�kG+�i3�gͰ�/�����/�ְͰ�2+�$Ͱ$��+��Ͱ���+�cͰc�_ ��QͰQ/�_Ͱc��+��ͱ�+��CE99�2@&)4GUWXkty�$9�$�|9���JMi�$9���TN��g$9��Q��9�_�a9�c��9�������$9������999 �
�99��99��9�5 �#��999�0�*,2:=Q_q$9�N�$)>@a$9�&�AK99���CDJ�$9���n9���E�c��$9��G��9�gk���99���uy|��$9���t���$90153!2"'&#"3264&#!"3!264&#"32762#!"%;27>?2576$32;2#!"3!2>54'654$#"&#"  32654/&"632&+&26=4&"?654&"327654/&#";264&+"&s)??R $&4Uuv��v��&8&�v��wyP1'&T==*�n&8�
$�_8�����ː� ���-y�����������/��)hA'(3FLs���7��$&5L66L5PL�6L�RD " D$(6�%�&67%�&Z&<V> 3LU��7#��QN1<V>7�Wq7���>Ɏ�����vb���A��� Ƈ�JE1(&E��m��h[���%33%�&66&�4'�&%6���%E%#E5�L6J7   
  ��!�   X g w � � � � � � �  +�?3�Ͱ92�]/�eͰ/�Ͱ�2�3/�$3��ͳ��3+��Ͱ,/�QͳzQ,+�O3�LͰ�/��Ͱu2���m���/��ְ�Ͱ��}+�HͰ6 ��Dͳ�H}+��ͰH��+��ͱ�+����93z�L$9�}6�9�D�F9�������999 ����99�����999�3�6DFW$9���(/999���T9���)}H��$9�z,�x9��m����9990153!2654&#!"3!264&#!"7;27>73257>32;2#!"3!2>54'654$#"&#" 3!2654&#!"32654/&#"632&+&326=4&#"32?654&"27654/&#";2654&+"FH&55&��*N�&�&66&�%<�)�^:~�s����Ώ�!ߐ�.|����u�O�����0��)L%�%43&�&4D&)3E"(6<j���1�� .#5%(12'%5M,+�5L�UF'4'D'&h#�$54%�'6^'7&%33BL5L6�Uo<r�j�<̌������tb�Ė�_VE���"ǈ�j&5%(55�(F3(%E5�eۜkV���&21'�'56&�2'�*%5��NC&%AG'6&$11   ��3�  6 E Q _ p ~ � �  +�4Ͱ-/� 3�Pͳ�P-+��Ͱ&/�ͳH&+�3�ͰU/�\���/� ְͰ�7+�?Ͱ?�R+�XͰX�K+�Ͱ�	 ��0Ͱ0/�	Ͱ�r+�xͱ�+�7�$99�?�&99�R�),F$9�X�-HP$9�K0�M9�	�9��`9�xr�dli�$9 �-4�	 u}$9���#)M999�P�9���$K��$9�H&�F9��d9�U�7;?`$9�\�Cil999013!2>54'654.#"&#" 46?2576$32;2#!"&7264/&#"632&+&326=4&#"32?654&#"2654/&#";264&+"�����-zX��r�|����1�㶳�5 �����ˎ�}���F(!4?$'6:o���6��"(!2&)23(&2M" "�4%&�UEL3E#&g'�%11%�&����jk��rϖX�F���)�⹆�:���>̌����'D7NF5�kܞd`���)22)�&22&�1)�'&4��LC5($ElJ2L5 
  ��=�   L [ k w � � � � �  +�ͰQ/�YͰ/�Ͱ2/�%3�vͳ�v2+��Ͱ+/�FͳnF++�D3�BͰ{/�����/�\ְdͰd�x+�~Ͱ~�q+�=Ͱ=��+��ͱ�+�d\�F+99�x�.1Dl$9�~�2nvB$9�q�5s999�=�9;�$9���U���$9������999 ���9�����999�2�$7;�$9���(.s999�v�I9���)q=��$9�n+�l9�BF��9�{�\ad�$9���i��9990153!2654&#!" 3!2654&#!"';27>?2576$32;2;2/654.#"&#" 3!2654&#!"32654/&#"632&+&326=4&#"?654&#"327654/&#";264&+"6(�&66&�4(6%�%32&�3&(�&�[:���g�)
�yX��r�������1��a�&�%65&�1&6�E#$7D&'17l���4��$-%3%(68&%3J;H�4%&�VD$! E$&j'�%33%�&5U%33%&55MJ5&%3�Sj6���>n[;��qΖX�C���K���c&6&%11�&D5'&A5�lޜhX���%33%�%65&�3$99�(%4��LE($FF'5L45      ��E� ; H X h x � � � � � � � �   2=4#.546?2576$32;2"36 54'654$#"&#" 676&'&3276&'&327>.654/&#"327676&'&%327676&'&73276&'&632&+&326=4&#" 6?654&#"32764/&";2654&+"*�����9������(,~�����������2��9! G" ER
@3o)&#An�"
# @"AE !AD$'4"" �"$&A�p"
$ $DM!!>n&$&=mrk���7��!/'6&%33%&6PK�7&#�;F)&EJ5�&�&76'�(6���
�͋��;���>͌���5�w_�ɗ��F���*���V#"#D$1EW'A#$����
#GF3	#(E;'&D4��2
0�&?
"%�l$!!#A$�/
AS%@
"%��gۜda���&66&�&66&�WN�(&6���$CLB6�&6&%33      �^5� < M \ h u � � �8 �  +�'3�ͱ"B22��/��Ͱ/�gͳ�g+��Ͱ/�7ͳ_7+�53�3���/� ְͰ�N+�UͰU�i+�oͰo�b+�.Ͱ ��*Ͱ.��+��ͳ���+��Ͱ�/��ͱ�+�N�:=>K$9�U�7M999�i�5@EC]$9�o�$%"_g3$9�b�d9�*�,9�.�v9����y�99�����~999 ��LM999���	!99��� *,FG$9���d999�g�:9���b.��$9�_�]9�37�Ry9901 2=4#.546?2576$32;2"36 54'654.#"&#" 36&+6#!";7654/&#"632&+&326=4&"32?654&#"32654/&#";2654&+")�����8����;��'2Y��q�������1��  7����
��FC>D$%6:m���6��!+ 3(&22L5L:(�5&#�WE$&5B$%g%�&67%�%7���
�ǈ��6���>ʎ���4�lq��rϖX�B���)����E���'(E33'%E6�mޞa`���(43)�&22&�/%6�&'4��JF6($FH#3%&66     �u7� ; K W g x � � � � � � � � �   2=4#.546?2576$ ;2"36 54'654.#"&#" 6?6&'&3264&#"76?6&'&32?6&'&7654/&'"32654&"76?6&'&232?6&'&2654&"723276?6&'&632&+&326=4&#" ?654&#"327654/&";264&+"$�����8 �^��̼��$)|X��r�������1��;#!%?%%$@
R#&55&%1A #!C&'#A{"#E
&%"B<FGC&%4$&22L2B! %>%&#B' !A%$(A
OL22L2A"#!

#$%?%j���9��!-)1&'67&%2M9H�5&%�;A !  EJ�%�%33%�&8���
�ǋ��;���>͐���0�lj��qϖY�F���)���X6
-A$?&&?	*#3J32�/
#%`'=$#b��3
A?)@%$?	zLD%&E��$42&%22�4
 ,`#@'%`�1
F@"B
%&?6%2%&22�1

'`$?"%ajٜj^���%11%�%65&�ZP99�(&5���JC&$Ae&6L56      �fF� @ M ] o  � � � � � � �  ?"&546?2576$32;267>54'654.#"&#" 676&'&676&'&327676&'&7676&'&654/&#"327676&'&632&+&326=4&#" ?654&#"327654/&#";2654&+"֨}�̵�4����̵�N�
O̓�~-~Z��r�����/���%#H!#G�N�M�7#""#I� P�J�D>A!!AE&'6:"
$"#Iq���7��$,!5&'67&%6SK�7%#�;F &F%'j&�&66&�&4���/
�ϑ��:���?ˎ��	��J
!��sc��qЖZ�F���)����##!C#)#-M����
#"#H"�$	 . I	��U'F:'$E4��###G"gۜj\���%33%�%65&�VL�'&7���LC$&BM&7&%33    
  ��>� ; L ^ m  � � � � �� �  +�'3�Ͱ"2�/�3��ͳ��+��Ͱ/�6ͳ�6+�43�2Ͱd/�l���/� ְͰ�<+�2�CͰC�`+�gͰg��+��Ͱ���+�.Ͱ ��*ͳ�.�+��Ͱ�2����Ͱ�/�.��+��ͱ�+�6�=��f +
�]�\��U��V��=��X +
�~�}��v��w� �UV\]vw}~........�UV\]vw}~........�@�<�999�C�99�`�M9�g�6RE$9���4n�$9���$%"2��$9����9�*�,9�����9�����99 ��9�@	 *,HZ{��$9����999���99����.��$9����9�26���99�ld�����$901 2=4#.546?2576$32;2"36 54'654$#"&#" 3276&'&32676&'&32654/&#"32676&'&632&+&326=4&#"?654&#"32654/&";2654&+")�����8��������)-}�����������1��@##?�'%#A� '
. 
#$%A
� -E#"8D#'W!!	1�
#$&?
��q���7��#-&6&%32&(4NI�5'!�WE$$4BJg&�&66&�&���
�͋��:���=̌���5�sc�Ƙ��F���*���m3
Ds&B$$����3%!�%?$$�G	gLF2&'E��1
%s%?$$��"kݞda���%32&�)45(�2'�('4��LC4'&FnL6%&7     ��5� = M \ p ~ � � � � � � � �   2=4#.546?2576$32;2"3>54'654.#"&#" 6?6&'&6?6&'&23276?6&'&764/&#"6?6&'&26?6&'&26?6&'&632&+&26=4&"32?64&"3276&/&#";2654&+")�����5����̿���,yX��r�����/��B"E%$(@�D#B$$'@ �$"%$%A
1F6GC&%6_"!%>#$(A)?1

'%!B�! 0$$%?
 #j���2��$+3P33P3P!!!�4J�TB!!E#&g4$�)45(�%3����ˋ��9���=̌�����r_��rϖX�D���)���}8
#)p!C
&&j�=#'n!B
%%m��61j%A
%$m	+(E66JF5��6
 ,l%A'%n�<"$l&A%$m
�3	&j&?
#$qfݝZb���(33(�(44(�4(�L4��JD!!IFG$42&(46      ��0� < F R a n y � � � � � � � �  2=4#.546?2576$32;2"36 54'654$#"&#" 2654&"32654&"64/&#"32654&#"3264&#"3264&#"2654&"32654&#"632&+&26=4&"?654&#"32654/&";264&+"������8��������(.~�����������1���3J33J3"&23J3�F!@D&(6y$&55&$44$&55&$4#&55&#5X4J33J4$&23%&3hn���6��"/'6L23J7LG�7%#�VD'!5BJ4�'�%66%�&8���ˆ��6���>͎���2�y`�ɖ��F���,����&66&$44�Y!2%&22('F9NA5�B$4&%55[$43J44��#2L56.&66&$44�Y"2%&23Vjޛd`���%22%�&67%�4%�%&6���(C7&$E5{&6L56   
  �0� = L Z k w � � � � �9 �  +�(3�	Ͱ#2�/�3��ͳ��+��Ͱ/�8ͳz8+�63�4���/� ְͰ�>+�DͰD�[+�aͰM ��Tͳra[+�lͰl/�rͰa��+��Ͱ��}+�0Ͱ  ��,ͱ�+�>�;999�M�AI99�l[�8X999�rT�^egot$9�a�69���x999���%&#z�4$9�} �9�,�.9�0��9 �	�[a99�@ ,.AIeglor��$9���t$9���;9���}0��$9�z�x9�48�Q�99012=4#.546?2576$32;2"3>54'654$#"&#" 32654&'&'764/&#"32654'&'&'32654'632&+&26=4&"32?654&#"327654/&#";2654&+"������8���������,|�� ��������1��vZ?@VK "	&+H	EC>D#'44�gh�VJ>9OW�=+):c1hj���7��#.'7J21L6L %�6&#�VE('A%&3�'�&56%�&8���ˊ��:���>̋������v_�ȗ��F���*����=VU>'�&$	+.�N)F22JE6��i��fV|a>	4iyg(::(Bi Ukjܝ^f���&66&�&22&�0'�%'4���(>$#E4z$3%&56    	  �q	��  ( 7 R a o | � � �/�PͰI/�^Ͱ/��3�Ͱ�2�B ��SͰV/�Ͱe/�l���/�ְ8Ͱ2�8� Ͱ /�8�b+�hͰh�L+�Ͱ�Y+�ͳ}Y+�p3��Ͱw2���+��ͱ�+�8�)9�b�#&05HST$9�h�IV^$9�L�\99�}�|9���{�99����9 �P�tw99�I�;q{$9�^�&@F\$9�S� $Y��$9�V�-�99�e�0}99�l�)5��$901;2654&+"3!2654'654.#"7654/&#"46?257>32;2#!"&>32&#.#326=4&#" 7654/&"32?654&#";2654&+"</�+=<,�/<��ܛ���f�큯�٩�3y���KK�"(-7-VBB
�[]�	
�EeeE�$Hb�����m]^{/�<=+,==,+=��CS�X9+,�=,*�</�+=<,�/<�+89*.<;�=����M6U���f��ڮ$[�&�i-�99-+ �<��C`	<\||\EdEHff����p�;N���,==,�*99*��V �DD-+��- �-,<��0+89*.<;    
  ���p   - = H U a p � � � �S/�LͰ;/�AͰ/��3�Ͱ�2�F/�2Ͱ`/�Z���/� ְͰ�.+�>Ͱ>�U+�V2�PͰ\2�P�C+�7ͳq7C+�b3�yͰj2�7��+��ͱ�+� �99�.�!)999�>�&99�U�;@99�P�F299�C�:A99��7�fv~999 �LS�km$9�;�bj999�A�f99��.7>C$9�2F�)~99�`�&qy$9�Z�!v9901476;2+"&4?632'&47632#"/&4$32 $7 654&#"4632"&55462"&47632/&4?632#"&476;2+"$�%11%�%61�'&3�AB%#�3&'���pΕX�� ��� ���8�ݜ��5&'45L56J65L5M$'�@@��#&5�#$0�#�%77%�%'6L56�B%�0%'�33�%�'&3��E��Y��p�� �� ���ݜ����)&44&�'66'I�%66%�%11��%�J22��(�6%(�3��L7J6   ��C� J ] m } � � � � � � �  ;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 3276?6&'&654/&#"6?6&'&3276?6&'&76?6&'&632&+&26=4&" ?64'&#"327654/&#";264&+"թF���
��
rs���6����ο���.z����s�O�����1��i" 	"
&&!BE"!@C&(6v #"A '&$A.% $$%A�##& 
%&$@k���2��!/$5L33L5SI�&%�:E%#B$&5�'�&65'�'5���/��?\����y��?���?͎�����ub�Ř�`UE���)���%4
0n(?&$o	=%F:'%F4��1
#*n#A%&p�"4l&?
$$o�3
	/k(?#$qg۝iX���&65'�'56&�WN�L���%C&%B7�'5L33 	  ��;� H Z i ~ � � � � �  ;36&+6#!".546?2576$32;2"36 54'654$#"&#" 32676&'&7654/&#"327676&'&632&+&326=4&#" 2?64&#"2327654/&#";2654&+"ҩD��	���
rr���8����;��).~�����������1��_!!6	�
"#%A
�#DLC%(d! �
$$%?
��k���7��!1)7%&22&%7NK�6&#�:F&E$%5�$�%76&�(���3��[?����w��6���>ʏ���4�v`�ɖ��E���)���I. "�%?$$�k	2LF(&F�� 1P&>$$���gڜda���%76&�&66&�XN�L6���$C&%A6�J7&%3     �z	}
  9 p � �  +�[3�ͰU2�/�Ͳ
+� 	+�7/�!ͰP/�eͳ1eP+�'Ͳ'1
+� '+	+�I/�h��q/�ְͲ
+�  	+� 	+��%+�4Ͳ%4
+� %	+� %-	+�4�S+�`ͱr+��EG99�%�IVXYh$9�S4�LUe999 ��9�!7�4S99�'�<?R`n$9�P�3@B999�1�CM99�e�EFLk$9�I�G90154763!2"'&46322654&#!"&4763!264&#""&547632#!"&;27>?2576$32;2#!"3!2>54.+& #" $Bv���T1(% T>>*��%6$e*>>*,N1Q|w��w��&5��
$�^8�����ϑ�������!2������/��)Z(�vw�TN3=,*=5j'>V=1'(Q��3!Wr7���?�������������� ǈ      ��	�   T b W �  +�>3�Ͱ82�`/�YͰ/�Ͱ2/�IͰ+/�L��c/�5ְDͱd+ �2�$5DR$9�I�(.%O$9�+�)9015463!2#!"&4763!2#!"&;27>?2576$32;2#!"3!2>54.+& #" 4763!2#!"&6(�&23%�C(6(�%11%�@%7B�
$�]:�� ���Ў�!�lōT���!4������/��)z'�'56&�A%6W'43(&33l&2L67Wr7���?̑���S��k������Ŋ�s'3L66      ��	B  - P � �  +�ͰE/�@Ͱ/�*3�	Ͱ%/�ͳL%+�:Ͱ6/�O��Q/� ְͰ�+�Ͱ�=+�HͱR+��	/6O$9��7999�=�BCL999 �E�99�@� F999��+,$9�	�"'=H$9�:�#9�L�234999�6�0199014676$3232  #!".73!264&+"5'. #76 32"3>54&+&$#"ƛ)*½),�
����"\�zH��|�|��|�����0s��E.a�
�h��a���*����Ɵ�#���������Hz�\z����4��Ȗ-
�.\�D�g`�y
꠩��   ��
Q   J Y T �  +�ͰW/�OͰ/�Ͱ3/�&3�?Ͱ,/�B��Z/�ְHͱ[+ �3�%89HI$9�?�)/E999�,�*9015463!2#!"&4763!2#!"&;27>?2576$32;2;2'&$+& #" 54763!2#!"&6(�(35&�9(6'�%22%�8&5�
&�Z;���g�)�/��"5������1��(�(�&56%�7%7V'43(%22t'3%&56#Sj5���=n[������ �e&2%&67    ��� 8 E W g { � � �  +�'3�Ͱ"2�/�3�0Ͱ/�3���/� ְͰ�9+�D2�>ͰF ��LͰ>�X+�h ��pͱ|+�+�+ͱ�+�6�=�� +
�L.�M��V��U��=��V +
����������� �LMUV����........�MUV����.......�@�9�6E$9�F�9�XL�R9�ph�3^b$9�|�v9��$%0r��$9 ��F99�� +Rv�$9�0�6999��901 2=4#.546?2576$32;2"3>54.+& #" 676&'&676&'&#"327>.327676&'&#"%327676&'&32767654&'&#")�����9��������ꇎ�"4������1��E" E# CP!!F`
%&1
^�"
# ?#NC!�
!$3�n"
" $CM" `! 0	`���
�̋��9���>̌����������)���H""#C$/!/i(? ����#FF2 �;0�&>
 �\'"#@$ 2
)d0	 ��      ����  !  36#!6#!"3!36&+6#!";*���?#�j��%<-��&������>E���2� ��    
  �u�  7 G S d u � � � � �o �  +�'L�333�ͱ"Q22�j/�pͰ�/�;3��ͰB2�z ���ͰV/��Ͱ^2�/�3�/Ͱ/�2���/� ְͰ�H+�OͰO�> ��8Ͱ8/�3�>ͰO�Z ��TͰT/�ZͰO�v+�}Ͱ}�l ��eͰe/�lͰ}�� ���Ͱ�/��3��Ͱ� ���Ͱ}��+��Ͱ��� ���Ͱ�/��Ͱ2���+�*ͱ�+�6�>%� +
��.�l.������l�t��>d� +
������������l�ml�+�t�st�+������+������+�st� � �#9�ml�9����9����9 @lmst�����£�............@	mst���£�.........�@�8�599�H�99�>T�QLa999�O�@9��v�j\�999�l�z9�}�2999�������999����9�������$9�������$9��$%/$9 �zp�q9����8}v�$9�����99��C�99��HN���$9�V�X���$9���a�99�� *_$9�/�5999��901 2=4#.546?2576$32;2"36 54.+& #" 6?6&'&3264&#"76?6&'&32?6&'&32654&"76?6&'&232?6&'&32654&"723276?6&'&*��µ�8��������'��!5������1��A#!%>$%$A
Q#&44&%2A!#!B&'#A|!#D
&%"BS#&22L2C  %>%&#B&!!A$$(A
O%&22L2A##"

$$%>
����ˇ��5���>Ύ���1ԏ�����.���Y6
-A$?&&?'"3J32�/
#%`'=$#b��2
A?)@%$?,#2&%22�4
 ,`#@'%`�2
F@"B
%&?6$2%&22�1

&`$?"%a      �g� ? N b s � � � ��/��ͳp��+�iͰ/�6Ͱ/�9���/� ְ	Ͱ	�@+�d+�tͰt�+�0ͱ�+�d@�=HOQ$9�t�Ti99�@&-69X\n}��$9 ��i�c9��p�qE�999�@ *0@KT\��$9�6�=999��901?"&546?2576$32;2"3276 54.+& #"676&'&73276'.#"327676&'&73276=.+327676'&/Ѩ|�ʴ�8����ʴ�!�+*��S��l"5��ߕ�����i!#H#$B�$$�3	%�R"%"#I�:$�2%�0w#$"&#���3�̐��;���>ʏ����L%0�lčT��(����
""#D$�$#'*".����&"#H"�#/#/#$*���#,!
"     ��� 7 L _ u �5  +�3�0Ͱ2�/�)3�	Ͱ#/���v/� ְ-Ͳ- 
+�@-3	+�-�+�Ͳ
+�@	+�w+�6�>�k +
�:�;��D��C��=��� +
�M�N��W��V��=�� +
�b�c��o��n� @:;CDMNVWbcno............@:;CDMNVWbcno............�@�-�	8`k$9 �05�69�� *>Qf$9�	� &999�#�!901476 32 32"=43>&+"5'&$#"#2#& 47>32#"'&#.	>32#"'&'&47>32#'.�2^��Y4"�����Ў�������8�������;�
1&'�D	#"2#"
��2 ��	/!!�0 "�)���֋�����>���9Ą���
2�g @'��D
3��� 
?%�W&"Rg 	0��%	3    ��� : N c u � � �' �6  +�3�1Ͱ2�B  +��3�HͰ�2�@  +�v  +�/�*3�	Ͱ$/����/� ְ.Ͳ. 
+�@.4	+�.�O+�R2�^Ͱ^��+��Ͱ��+�Ͳ
+�@	+��+�6�=�� +
�<�S��F��]��>0�� +
�e�y��o����=�� +
��.����������<�=<S+�><S+�?<S+�F�EF]+�<�R<S+�F�^F]+�=�� +�e�fey+�hey+�o�no+�e�xey+�o��o+������+�=<S � �#9�>9�?9�EF]9�fey9�h9�x9�no9��9����9 @>?EFRS]^hnoxy������<=ef........................@>?EFS]hnoxy�����<=ef.....................�@�O.�';H$9�^�[d99���$qv$9����9��	!��$9 �1B�A9�� +V`{�$9�	� '999�$�!901476 32 32 "=43>54&+"/.#"#2#.4657>#".#.4657>323'.4657>#"'.4?>#"'.4?>#"'.4?>6#"'.�/\��[5$�������̎��t���8����i��PB?%$&<""� 
0	$%@%##�
A%$$D##�A%$$9##-A#%'
D "� 2#<
!!� )���؍������Ɉ��=r�i�:ƈ���V����n$%?%lF
5p!?%k,%
4��j&'A%oA5	n$%
?&jH1�j&'
A#qA5n"!!*nE
/     ��� 7 A J U ` l w � � �O  +�TͲ5  +�?u333�0Ͳ:o222�j/�eͰJ/�3�FͰ{2�_/�ZͰ/�)3�	Ͱ#/����/� ְ-Ͳ- 
+�@-3	+�-�8+�B2�=ͰG2�=�a+�KV22�hͱQ\22�h�m+�x2�rͰ}2�r�+�Ͳ
+�@	+��+�8-�&99�ha�#99�rm�!99��	99 �Z� *-$9�	� &999�#�!901476 32 32 "=43>54&+"5'&$#"#2#& 462"&4762"$47632#"47632#"47632#"&462#"&4762"&�2]��Y4"�������ΐ�������8��������3J33J3J33J!#%76&$4!&66&$4#&66&$4X6J33%&5L22L5�,���֍�����ˈ��>���5ǆ���2�$44$&55�}L2L2�J7J5�J5J3�P$6J33y#54$&56��#2L23   ��  6 E Y e � �4  +�3�/Ͱ2�/�(3�	Ͱ"/���f/� ְ,Ͳ, 
+�@,2	+�,�7+�@Ͱ@�F+�Tͳ`TF+�ZͰZ/�`ͰT�+�Ͳ
+�@	+�g+�7,�%99�ZF�"99�`�LWN999�T�	 99 �/4�5FT999�@	 <CLNZ`c$9�	�%\$9�"� 901476 32 32 "=43>&+"5'&$#"#2#& %46767#"&467>767#"&47#"&�1^��X5!�������Ў�������8�������xN""&)GV@?Z>3%T<L&2�ig��h.;)+=�)���֋�������>���:ʈ���
2w'�)&+,�*?TV��,t3)a
5g5t-g��.Ch"S);;    ��� F Y i } �� �4  +�3�/Ͱ�/��Ͱ)/�>Ͱ"/�A���/� ְͰ�Z+�`Ͱ`�~+��Ͱ��,+�9ͱ�+�6�=��q +
�X�g��P��a��>�z +
�|����t�����P�QPa+�X�WXg+�P�`Pa+�=�� +�X�hXg+�t�ut�+�|�{|�+�t��t�+�|��|�+�WXg � �#9�h9�QPa9�{|�9��9�ut�9��9 @PQWX`aghtu{|����................@PQWXaghtu{|����...............�@�Z� DGL$9�`�A"99�~�pj99���%(>�$9�,�)12999 �/4�5y999���.e999���99�)� ,9$9�>�%D999�"� 901;36&+6#!".546?2576$32;2"3>54.+& #" 3276?6&'&6?6&'&23276?6&'&3276?654&'"&#"ӨE�o��
��	sr���8����;�h��P��"5������1��f!!"
%&#A�! $@ 
&&$B-#!#$(A�"#!##2
���3��m-����w��7���>ʎ��
�X��h������)���+1
)p#@
%&k�/"'o#A
%%l�6
2l%C
&&n	�2	-n3
!#l   �~� D X p � �4  +�3�/Ͱ)/�<Ͱ"/�?��q/� ְͰ�,+�7ͱr+�6�=��� +
�W�V��M��N��>�6 +
�p�m��b��c��p�npm+�opm+�opm � �#9�n9 @
MNVWbcmnop..........@
MNVWbcmnop..........�@�,�12<BEY$9 �/4�599�)� 7Sj$9�<�%B999�"� 901;36&+6#!".546?2576$32;2"36 54.+& #" 232676&'&#"2767654&'&#"ԩF�i�	���
rr���8����ξ��)���!5������1��e>3	�
"$1	�� !�" .	����3��5e����w��6���>ˎ���4֐�����)���;?$�&>  �^8#/]0
!��    "�.   ( 6 $ �&/�Ͱ/�33�Ͱ,2�/���7/�8+ 01463!2#!"& 4763!2#!"4763!2#!"&463!2#!"&2$	#..#��$2$
"//"��#z#$01#��#1i/%�%/0$�%/�$0/%#..5F0F1��".F22R%/0$#..   �z
�  ; � � �  +�\3�ͰV2�/�Ͱ"/�9ͰQ/��ͳ(�Q+�2ͰK/�}Ͱ�/�v���/�ְG2�Ͱ�5+�&Ͱ&��+�nͰn�T+�aͱ�+��I99�5�(+8JWYZ}$9�&�K{99���MQVv���$9�n��9�T�r�99�a�cl�999 ��9��99�9"�%T99�2�,.>ASa�$9�Q�&+BDc$9�(�EN99���GHM���$9�K�Ifl999�}�{�99���n�99�v�p90143!2#"'&#"2654&#!"'3!264&#"327632#!"%;27>?2576$ ;2#!"3!2>54'6?654/.54?6/&#"&#" >32&+&&d*??*) $&4T짧v��&8%�v��vzP1&&+)>>)�{&8�
$�]8^���͐���Iu,@��
UF?;z�z.q����/��(�2�^��7��#+~J=*+> 4&$T�wv��#��QP0<+*>7�Wq7���>�������{q�H
)�o'-B;oK0��� ƈ�X]���E<2z�     ��
��   i w � � �  +�?3�Ͱ92�n/�uͰ/�Ͱ3/��Ͱ,/�aͰ{/�Z���/�~ְRͰR�6+�Dͱ�+�6R�V�99�D�EN�999 ��C9�3�%6DEg$9���)/&d��$9�,�*JN999�a�R_x999�{�}9�Z�T90153!2654&#!"3!2654&#!"7;27>?2576$32;2#!"3!2>'6?654/.54?6/&#"&#" 3!264&#!">2&+&6(�&22&�(6&�%32&�&6o�
$�];�� ���ώ���Es.BFl?XF?<z�y-|����/��)M&�&66&�&5>7�]	��5��"(V&22&(34&5&%33�Wr7���>̐����� xg�IPcf2&7A	;oK3��� ŉ�p'6J33BXa���F@2~�    ��	� L Y j z � � � �P �  +�'�33�Ͱ"2�/�3��Ͱ/�GͰ�/�@���/� ְͰ�Z+�`Ͱ`�k+�{ ���ͱ�+��+�8Ͱ8�+�*ͱ�+�6�=��
 +
�`.�a��h��g��=��� +
����������� �`agh����........�agh����.......�@�Z�JY$9�`�S9��{�Gqu$9���E�99��@
"$%@����$9�8�:<�999�*�,5�999 ��Z�999�� *,e��$9���J��$9��/5999�G�E�99����9�@�:901 2=4#.546?2576$32;2"36 54'6?654/.5&?6/&#"&#" 676&'&676&'&327>.327676&'&%327676&'&73276&'&>2&+&)�����8��������(E~'<[�6	UCI8w�{-x����1��H#F" DQ" )=^'&#@^�"
$ ?"OD
%�
#$%A
�o"
# #EM! A]
#$%?^E2�c	��1��")���
�̋��:���>͌���4։xw�I�G'->	;oK4���)���Y""#D#0
!,V(?$$����#FF2=	0�&>$$�n# !#A$�.
AR&>$$��\`!���FF,}�     �N	� L ] m � �  +�'3�ͱ"V22�/�lͰ/�GͰa/�@��n/� ְͰ�d+�8Ͱ8�+�*ͱo+�d@"$%@JNY^l$9�8�<i99�*�,5g999 ��OP999�� *,Z[$9�l�Jgi$9��15999�G�E^99�a�8c99�@�:901 2=4#.546?2576$32;2"36 54'6?654/.54?6/&#"&#" ;36&+6#!">32&+&)�����8����;��'I�%>[�6
TF?:z�|-q����2��2� �����
�5�_	��7��"-���
�ǈ��7���>ʎ���4֏yt�M|�G'-B	;oK0���*���X�FT��[`!���H;7~�   �u	� N ^ j { � � � � � � �   2=4#.546?2576$32;2"3>54'6?654/.5&?6/&#"&#" 6?6&'&3264&#"76?6&'&32?6&'&32654&"76?6&'&232?6&'&32654&"723276?6&'&>2&+&*��µ�9�����X�Z��I�$;\�7UAI:{�|-�y���2��A#!%>$%$A
Q#&44&%2A!#!B&'#A|!#D
&%"BS#&22L2C  %>%&#B&!!A$$(A
O%&22L2A##"

$$%>3�_��6��!2����·��6���=ΏX�b��w�I	�D"6>	<qK1���.���V6
-A$?&&?'"3J32�/
#%`'=$#b��2
A?)@%$?,#2&%22�4
 ,`#@'%`�2
F@"B
%&?6$2%&22�1

&`$?"%a,\e"���EA5z�      �Z	� R ` o  � � � �v/�W/�]Ͱ/�3��Ͱ/�MͰ�/�F���/� ְ	Ͱ	�T+�ZͰZ�p+�xͰ�2�x��+��Ͱ���+�;Ͱ;�+�0ͱ�+�ZT�P$9�p�ac$9��x�Myi�$9���K$99��@ !(+F�����$9�;�A9��>�99�0�2�99 �Wv�X|��$9�]�S�99�@
 !+2^ek�$9���P��$9��699�M�K�99���;�99�F�>901?"&546?2576$32;2327>54'6757'.54?'".#&#&#"  676&'&7676.327676&'&73276&'&7676&'&>2&+&ըx�ʹ�5����ʹ�H�;$ �c�~JI�'Q\�7	YF?={�|-x����2��� #H"#G� J!�8N�=#
"##@�<#� M�8v%$###E�2�c	��(,��"0���/�Џ��9���>̍��	��'&2(
[��d�yv�
R|�G),S<pL4���,���*#"#I#�$!7M. ����"!#D!�	$3$<N���$##C '\a ���GK,~�   ��	� L ] o � �. �  +�'3�Ͱ"2�/�3��Ͱ/�GͰ�/�@���/� ְͰ�M+�SͰS�^+�eͰe�p+�xͰ2�x��+�8Ͱ8�+�*ͱ�+�6�=��T +
�e.�f��m��l� �eflm....�flm...�@�M�J999�S�Z99�e^�GU999�p�E9�x��99���"$%@z�$9�8�:<�999�*�,5�999 ��9�� *,XZj}$9���J��$9��/5999�G�E�99����9�@�:901 2=4#.546?2576$32;2"36 54'6?654/.5&?6/&#"&#" 676&'&3276&'&327676&'&>2&+&*�����9��������(I�(<[�7TH?<|�|-�u���2��Q##%?�
&%#A�!F�
#$%C��C
!	�
$$%B�~3�c
��$0��!,���
�̋��:���=͍���5֍yu�M}�D$4A
;oK0���)���n3
,r(@$$����0	?�'=%#�H:91r&>$$��A]a ���HI)y�     ��	� G W h { � � � �7 �  +�'3�ͱ"�22�'+�R�333��Ͱ�Ͱ/��Ͱ/�BͰ�/�;���/� ְͰ�U+�OͰH ��3�NͰO��+��Ͱ���+�4Ͱ4�+�*ͱ�+�6�=��k +
�z����r�����?��� +
�|�z��������r�����=�� +
��.����������r�sr�+�z�yz�+����r��r�+�=��) +�z��z�+������+������+������+������+�yz� � �#9��9�sr�9����9��9����9��9 @rsyz|������������.................@rsyz|�����������................�@�H�E99�U�99��O�@BPai$9�����99���"$%;��$9�4�7�99�*�,�99 ���H��999�'�S�99�@	 *,]d���$9���E��$9��099�B�@�99���4�99�;�7901 2=4#.546?2576$32;2"36 54'6757'.54?/&#"&#" 6?6&'&6?6&'&3276?6&'&6?6&'&3276?6&'&3276?6&'&>;&+&)�����8����ξ��'E�'Q��	[K:<|�{-w����/��@  #B%$%A�-'>%$'@�!   %$'A� !$@##'C(D"
%&%?�!!!
&&#@3�g��#0��"(���
�ǈ��7���>ʎ���4֋xu�T'�o*)U<oL4���)���u/#%q!B
&&j�
!'n%?

#&l��3
.p"B
%&l�/"'o"A
&&k�<0m(?%$o�0
.o#@%%q3Zd���HE0�� 	  ��	� M Y c p } � � � �, �n  +�hͲ  +�&Q�333�Ͳ!W�222��/��Ͱ]/��3�bͰ�2�u/�	 33�{Ͱ/�3��Ͱ/�HͰ�/�A���/� ְͰ�N+�Z2�TͰ_2�T�~+�dq22��ͱkx22����+��2��Ͱ�2����+�9Ͱ9�+�*ͱ�+�N�K999��~�H99���F9����999���!#$A�$9�9�=�99�*�,5�999 �{�
 *,$9���K��$9��/5999�H�9F�999����9�A�;901 2=4#.6?2576$32;2"3>54'6?654/.54?6/&#"&#" 32654&#"3264&"%32654&#"32654&#"32654&#"2654&"2654&">72&+&*��µ�9�������Ev,AFm?UF?;z�z-�}���2���3%&33&%34$&33L2V$&66&#5$'56&$4#&66&#5Y5J33J54L22L4I2�^��8��!,������7���=Ώ�������wj�MPcg2+1B	<oK5���-����&55&$44�X$42L22�'4%&77^&2&%55��#3%&771&55&$44�X$43%&22xW_!���H:8~�     �	� M [ m y � �  +�'3�Ͱ"2�/�3��Ͱ/�HͰ}/�A���/� ְͰ�N+�SͰS�\+�bͳtb\+�nͰn/�tͰb��+�9Ͱ9�+�+ͱ�+�N�K999�n\�H99�t�Ffh_$9�b�z9���"$%A}�$9�9�=�99�+�-6�999 ��\b999�@ +-PXfhnqt$9���Kv��$9��06999�H�9Fz999�}�9�A�;901 2=4#.546?2576$32;2"3>54'6?654/.54?6/&#"&#" 2654&'&'32654'&'&'32654'>32&+&)�����8���������I}'=[�7UH?:z�|-�w���2��yY�VJ %+I?�gi�UGB?I&2�=,):c1F8�`
��7��#1����̋��:���=͌�����zw�N{�E.-A	:nI1���*����=VU>)�%,/�-i��gX}]B	:d5t�)::)Di U�[] ���H<2z�      ��	� Y k { � � �� �4  +�3�/Ͱ�/��Ͱ2�)/��Ͱ"/�TͰ�/�M���/� ְͰ�l+�rͰr��+��ͳ���+�|Ͱ|/��Ͱ&2����+�EͰE�,+�7ͱ�+�6�=��q +
�k�y��c��s��dcs+�k�jky+�c�rcs+�=�� +�k�zky+�jky � �#9�z9�dcs9 �cdjkrsyz........�cdjksyz.......�@�l� WZ_$9�r�T"99�|�R9������999���%�99���(����$9���)12/$9�,E�I�99�7�9B�999 �/4�5�999���.w999�)�� ,79$9���%W��$9�"� >B999�T�R�99�M��G901;36&+6#!".546?2576$32;2"36 54'6?654/.74?6/&#&&#" 3276?6&'&32?6&'&32?6&'&>;&+&32?656&'"&#"ԩE�����
rr���8��������)Fz'B\�5UK9;{�y-�v���2��h! !
%&#A�A< 
&&$A+""	7#$(A~5�bH�c6��#-�E
:"#2
���3��BX����w��6���=ˎ��
�5֋zv�I}�C,/A	;mJ1���*���+2
(p#A
&&k�ECm#A%&l�1Hm%B
&&n1Ya"f��0<2}��SEEo3
!"m   ��	� Z k } �
 �4  +�3�/Ͱ)/��Ͱ"/�UͰ�/�N���/� ְͰ��+�FͰF�,+�8ͱ�+�6�>@�" +
�j�i��b��c��=��� +
�|�{��t��u� �bcijtu{|........�bcijtu{|........�@��@)/12NX[l~�$9�,F�J�99�8�:C�999 �/4�599�)� 8:gy$9���%X��$9�"� =C999�U�S~99���F�99�N�H901;36&+6#!".546?2576$32;2"3>54'6?654/.54?6'.#"&#" 3276&'&23276&'&>32&+&ԩF�h�	���
rs���8���������F'<[�7	"}<:z�|-�z���2��` A�
#$%A
��"=�
$$%@
��5�c	��7��"-���3�������w��7���?ˏ�����zy�M{�G*+A	;oK0���*���//	C�&?
##�Q3.
Ch'>
"$��,[`"���IC/~�     �  )  �/���*/� ְͱ++ 0146$; 2#"$&732>7$ 'x��z�X���͜���w�a��i]��u���������y^���h����x��zؒUI��y6S����   �~	�{  ; w � � �  +�]3�ͰW2�/�Ͱ#/�9ͰQ/��ͳ)�Q+�3ͰK/�oͳzoK+�m3�k���/�ְͰ�6+�'Ͱ'�}+�fͰT ��bͱ�+��GI99�6�)-8JXZ[o$9�'�K9�T�MWkmxz�$9�}�9�b�d9 ��9��999�9#�&9�3�/>ATbu$9�Q�'-BDd$9�)�EN99���GHMr$9�K�If}999�z�x90153!2#"'&#"32654&#!"3!264&#"27632#!"%;27>?2576$ ;2#!"3!2>54'654.#"&#" 632&+&$s*?@)( $%4Svw��v��&8)�v��vzP0P+)>>)�l&8�
$�^8^���̐���-zY��q��}����/��)�s���6��#%]&<+)? 6LS�vw�6$��P(&1<V>6�Wr5���=ʎ������wa��rϕX�A��� Ɔ�m��ad��     ��
yw   U b n � �  +�=3�Ͱ72�Z/�aͰ/�Ͱ1/�mͰ+/�NͳeN++�L3�J��o/�hְFͰ4 ��Bͱp+�h4�j9�B�D9 �1�$4BD$9�m�(-Rj$9�+�)Fh999�e�c90153!264&#!"3!264&#!"7;27>?2576$ ;2#!"3!2>54'654$#"&#"3!264&#!"632&+&&�%33%�&8&�&23%�&7z�
$�]:`���͒����/{��������������)>&�&56%�%4l���4��"'[(6L67$2L56�Wr6���=ʏ������qe�����A~� ����J2L6�hݞeX��    �u  1 = � �  +�/Ͱ(/�3�<Ͱ#/�ͳ4#+�3���>/� ְͰ�7+�Ͱ�	 ��+Ͱ+/�	ͱ?+�+�24<$9�7�99�	�9 �(/�	 999�<�999�#�799�4�29013!2>54'654$#"&#" 46?6$3232#!"&632&+&�����-y�����z����1�㶲�I �����ˎ���n���7��!,���fo�̘��E���(�⹅�M���Pˌ����j۞ca��     ���y < I X h | � � �= �  +�'�33�Ͱ"2��/��ͰE2�/��Ͱ/�7ͳ�7+�53�3���/� ְͰ�=+�2�BͰJ ��PͰB�Y+�}+�� ���ͱ�+�/Ͱ ��+ͱ�+�6�=��� +
�y�x��q��r� �qrxy....�qrxy....�@�=�:I999�J�9�}Y�7Rci$9���59������$9��$%3���$9����9�+�-9 ����i}99��FN�999���99�� +-Uv�$9���:�$9��/�999����901 2=4#.546?2576$32;2"3>54'654$#"&#" 676&'&676&'&327>.23676&'&%327676&'&7327676&'&632&+&)�����8���������.~�����������2��=# E" CQ!!$Bi('#?k�"
# @"O #E�#$%@�o$$ #ELB
i%$%>inn���7��#1����̋��6���>ʏ�����v`�ɗ��F���*���_#"#E 0	"*L'@#$����$GF3.=�'=#$�y'" #D �9	-L%?#$���jޜca��     �M�v > O Z � �  +�*3�
ͱ%H22�/�3�YͰ/�9ͳR9+�73�5��[/� ְͰ�T+�1Ͱ" ��-ͱ\+�"@
'(5<@KPRY$9�T�V9�-�/9 �
�+AB999�� -/LM$9�Y�<V$9��1T999�R�P9012=4#.546?257>32;2"36 54'654$#"&#" ;36&+6#!"6 &+&P��i����8~�t���ξ��&2�����������1��0������
�k:�7��!/i��V�
ȉ��7r�i�>͎��
�
/�fv�����D���)���Z�CS��jܞ_a��     �u	� = M Y j { � � � � � �  2=4#.6?2576$32;2"3>54'654$#"&#" 6?6&'&3264&#"76?6&'&32?6&'&32654&"76?6&'&232?6&'&32654&"723276?6&'&6 &+&���¶�8�������-�����w�P�����2��9#!%>$%$A
Q#&44&%2A!#!B&'#A|!#D
&%"BS#&22L2C  %>%&#B&!!A$$(A
O%&22L2A##"

$$%>2o:�6��"-�����7���>ϐ������tc�ș�cWE���.���T6
-A$?&&?'"3J32�/
#%`'=$#b��2
A?)@%$?,#2&%22�4
 ,`#@'%`�2
F@"B
%&?6$2%&22�1

&`$?"%aoߝkZ��    �	{ ? N \ n ~ � � � �J/�/�3��Ͱ/�:ͳ�:+�83�6���/� ְ	Ͱ	��+�2��Ͱ���+�2Ͱ2�. ��Ͱ/�.ͱ�+��	@:=@HOU]hoq�$9���89�@	 *6w����$9����9�.�09 �J@  *0KRXz{$9���=�$9��2�999����901?"&546?2576$32;2"6?>54'654$#"&#" 676&'&776&'&327676&'&7676&'&327676&'&632&+&խy�Ϸ�8��	��ж�L�	Sфށ.{�����������2���"$I#$D�"DB�	L�E""$D�Q�!I�>�"
$"$E�m���7��"(���4
�͐��<���?Ғ��� K%���ey�Ɯ��E���)���!"##I"�%":JK
�"��$! H%�'%N��z$##$D�m�d^��    ���v = L ` r ~ �  +�)3�
Ͱ$2�/�3�}Ͱ/�8ͳu8+�63�4��/� ְͰ�>+�CͰC�x+�0Ͱ! ��,ͱ�+�6�=�� +
�_�^��W��X��=��� +
�q�p��i��j� �WX^_ijpq........�WX^_ijpq........�@�>�;999�C�9�!@&'48EMasu}$9�x�z9�,�.9 �
�*9�� ,.H\n$9�}�;z$9��0x999�u�s9012=4#.546?2576$32;2"36 54'654$#"&#" 676&'&23276&'&32676&'&632&+&P��i����8����ξ��'-}�����������2��IE!D
�
'&#@
�	&E�#$'B��"
2	�&$'?��k���7��!-i��V�
ȉ��6���>͎��
�
/�sa�ϖ��E���)����@#$c#@%%����!F�#@%%�[:2	"c!B%%��kڜda��   ���s < M ^ q � � � �W �  +�(3�
Ͱ#2�S/��3�YͰ�2�/�3��Ͱ/�7ͳ�7+�53�3���/� ְͰ�N+�UͰU�r+�xͰx��+�/Ͱ  ��+ͱ�+�6�=��� +
�L�\��D��V��=]�� +
�p���h��y��=��q +
������������D�EDV+�L�KL\+�D�UDV+�=��� +�L�]L\+�h�ihy+�p�op+�h�xhy+�=��� +�p��p+������+������+������+������+�KL\ � �#9�]9�EDV9�op9��9�ihy9����9��9����9��9 @DEKLUV\]hiopxy���������........................@DEKLV\]hiopy���������......................�@�N�:=$9�U�_9�r�d9�x�799� @%&35������$9����9�+�-9 �
�)I�999�S�}9�Y�9��  +-Z$9���:�$9��/�999����9012=4#.6?2576$32;2"36 54'654$#"&#" >?6&'&32?6&'&3276?6&'&6?6&'&76?6&'&2?6&'&632&+&P��i����9����̾��(,y�����������1��?$++
%&"B�""<
%&$@ �!# 
&%#C�"#$?%&#B0!!"%$(?�#"E
&&%?
 $k���3��"'i��V���9���=̐���
0�gn�����E���*���s1	' l(@%#o�1Fk%C
%%p��2
.l(A%$o�3
 ,l(>%$o�1	-p%?
&&k�2Bn(@%&mgߜfW��  	  ���z ; F P \ g s } � � �Z  +�TͱO�22�k/�qͰK/��3�PͰ@/�'w333�EͲ"{222�`/�	3�eͰ/�3��Ͱ/�6ͳ�6+�43�2���/� ְͰ�<+�G2�CͰM2�C�h+�Q]22�nͱWb22�n�~+�t2��Ͱy2����+�.Ͱ ��*ͱ�+�<�9999�nh�699�~�49����999��$%2���$9����9�*�,9 �e`�!9�� *,$9���9�$9��.�999����901 2=4#.546?2576$32;2"36 54'654$#"&#" 3264&"3264&"%32654&#"3264&#"32654&#"264&"264&"6 &+&*�����8������).~�����������2���#%32L2$&23J"6#%66%#64%&55&$55$%66%#6YJ32L44L23J5il:�6��!/���
�̋��:���=ˎ���5�rd�Ș��E���*����#2L22�}L2L5^%98&#55\$43J55��%65&#55/!2L22�W$42L55\lޞ^f�� ����~ ; J [ g s � �  +�'3�Ͱ"2�/�rͰ/�6ͳj6+�43�2��t/� ְͰ�<+�AͰA�K+�QͳbQK+�\Ͱ\/�bͰQ�m+�.Ͱ ��*ͱu+�<�9999�\K�699�b�VXN999�Q�49��$%2hjr$9�m�o9�*�,9 ��KQ999�@ *,>GVX\_b$9�r�9do$9��.m999�j�h901 2=4#.546?2576$32;2"36 54'654$#"&#" 2654&'.'32654&'&'&'32654'632&+&)�����8����ξ��).~�����������1��y[~WK!!&,H?�fg�2#J@	>Gt�<.):c1jk���6��!-���
�
Ȉ��5���=ˎ��
�5�v`�͗��C���*����<XV>)�'#+0��,e��e+x3_@>D��+99+Ak Uijڜe`��     ���y J ] o � � �D �4  +�3�/Ͱ)/��Ͱ"/�Eͳ�E"+�C3�@���/� ְͰ�^+�dͰd��+�;Ͱ, ��7ͱ�+�6�=�� +
�\�k��T��e��UTe+�\�[\k+�T�dTe+�=��= +�\�l\k+�[\k � �#9�l9�UTe9 �TU[\dekl........�TU[\ekl.......�@�^� HKP$9�d�E"99�,@%12@Cpy�����$9����9�7�99 �/4�5n|$9�)@	 79i��$9���%H�$9�"� ;�999����901;36&+6#!".546?2576$32;2"36 54'654.#"&#" 236?6&'&6?6&'&32?6&'&3276?6&'&632&+&ըE�z�	���vr���8��������),zZ��qv�N�����2��h" 	D
'%#A�!!#@ 
%&$A."!?"$(B�"#
'%$@j���4��"1���2��LJ����x��7���>ˎ��
�6�ta��rϖY`VF���)���+5<q#A
&&k�0#'o(@%&m	�3	@q#@
'%j�1	(o#A%&mfݝeY��      ���v K [ m y �5  +�3�0Ͱ*/�3�xͰ#/�FͳpF#+�D3�B��z/� ְͰ�L+�RͰR�\+�dͰd�s+�=Ͱ- ��9ͱ{+�6�=�� +
�R.�S��Z��Y� �RSYZ....�SYZ...�@�L�	 I$9�R�99�\�F#99�d�D9�-�&23Bfnpx$9�s�u9�9�;9 �05�9�*� 9;Wi$9�x�&Iu$9�#� =s999�p�n901;36&+6#!".546?257>32;2"3>54'654.#"&#" 276&'&327676&'&632&+&ԧD�o�	���
rr���9~�s��������-}Y��q�������1��N!C
"#%A
���B �
$$%@
��l���6��"-���/��AX����y��9q�j�<̌������ua��qΖY�E���)���*.
@�%?#$�KB@-p%?#$��fڛe`��   hXO 	  O  �/�(Ͱ/�Ͱ/�53�ͰJ2�P/�ְͰ�+�Ͱ�+�.Ͱ.�9+�!2�DͰ2�Q+��99�9.�J99�D�=9 �(�9�� >C$9014632#"&264&#"3276&'&#"'&'&547676327>'5'.'.#"rPOqqOPR<<)*eD$~P�;(2Q2'@*/dS0 &	+!m@Q}#E8�rr�r�T<R<��{`2;�)	D,<X=28'8 91_~       � 8 S � �  +�'>33�Ͱ"2�/�3�0Ͱ/�3��T/� ְͰ�O+�HͰH�+�+ͱU+�O�69:$9�H�3>999��$%0C$9 ��9�@	 +:CHKOR$9�0�6999��901 2=4#.546?2576$32;2"3>54.+& #"  327654&"4&"'&#"*�����8������뇎��#4������2���)-4Lx6L2u'(���
�̋��;���>Ό������������)����L��$%2v�&22&�Wv   ��� : g � �  +�*3�
Ͱ%2�
�J ��?Ͱ/�3�2Ͱ/�5��h/� ְͰ�;+�MͰM�G+�BͰB�"+�-ͱi+�;�8999�GM�5?[e$9�B�99�"�'(2$9 �J�+9�
@
 -;BDGM[e$9�2�8`c$9��9012=4#.546?257>32;2"36 54.+& #" 32 54&"#"&5467?654/&#"P��i����8}�s���ξ��'��"5������2���w�v�6L7�lj�rS,E(��$%4%��i��V�
Ȉ��7r�i�=Ύ��
�
/Տ�����*����w�x�%66%k��k`�*%(�#(�6L&�       � 9 W � �  +�'E33�Ͱ"2�/�3�1Ͱ/�4��X/� ְͰ�B+�HͰH�+�+ͱY+�B�7:$9�H�4S999��$%1N$9 ��9�� +AIKS$9�1�7999��901 2=4#.546732576$32;2"3>54.+& #" 32?32657654'&#")�����8���������T��k"5������1���)'v2&%6x@B��&'�����
�ˋ��=���=͋�����kS����)���(z�X&66&�v11*&��     �  0 _ �  +�Ͱ /�-3�	Ͱ'/���1/� ְͰ�+�ͱ2+��	999 ��9� � 99�	�$*999�'�%901476 32 32!& 7!>54&+"5'&$#"+�2^��Y4#����V��ֶ�����Џ�������8��� )���֋��
2֋�͋��=���=�   ��   A �/�Ͱ/���/�ְ
Ͱ
�+�ͱ+�
�999 �� $9014632"&264&#"rPOqq�R<<)*��rr�s�T<R;   ��z   �/���/�ְͱ+ 013!2654&+654'&#"54&#")2))��! �d))))'��c�)*       ��   �/�ְͱ+��9 0132764&"4&"'&#" %& 0Hq3H3q"$2>#��H1p�$00$�Ap1    nrG   + k �/�!Ͱ/�Ͱ/�Ͱ(2��"��,/�ְ
Ͱ
�+�Ͱ�+�Ͱ!2�-+�
�999 �"� 	$9��99��%9014632"&264&#"265!2654&#!!264&#!"rPOqq�R<<)*�!.!1! ����5�rr�s�T<R;��!!�" # 0         	   - P \ l { � �  +�Ͱ/�x3�Ͱq2�;/�NͰ[/�U��|/� ְͰ�.+�8ͳ&8.+�Ͱ/�&Ͱ8�Q+�XͰX�>+�Jͳ]J>+�eͰJ�m+�uͱ}+� �9�.�!)99�Q8�5N99�X�;9�>�CM99�mJ�b9�ue�99 ��26@EF$9��.8>J$9�N;�)jk999�[�&]99�U�!be$901476;2+"&4763!2#!"&47632#"/&;26'&54632;27654$ 5462"&4?632#&476;2+"&+�'34&�'8c'�'67&�j&7�'&�3'#�9�
U䞟�U�<���������6L88L6X�'(5�%(3�(�'78&�%4{*3'&66�%4L778)�&(3��7�nh������g
q��������&88&�&88�'�5')�2��+3'&66   ��es   4 B R q �  +�Ͱ'/�2Ͱ@/�9��S/�5ְ=Ͱ=�C+�KͱT+�=5�2'99�C�*9�K�.9 �'�!,-999�2�Q999�@�C999�9�HK$90154763!2#!"&47632&/;27>32;2'&$#"54632#"&4?632&-�(89'�\(9�*%�Q� �0�st�0�6�������4'(66('4b�)'2�!$C^*4'&99pT�&%���fxxf�����(87)�)67�&�6)*�<    �87   3264/!264&'!7654&#"#$2p�$//$�Ap2$!���&� 0Hp3H3q"$2�  	 ( �U�  % 5 K ] m � � � W �2/�$��333�Ͱs2��/�ְ&Ͱ&�U+�^Ͱ^��+��ͱ�+�&�79�U�0]99�^�	9���?ho�$9 01&76?3'&'&'65'&'&'&"76767676&&76?3'&'&'65'&'&'&#"76767676&&76?3'&'&'65'&'&'&#"76767676&(=O8q�H#!AN,/j._E8O"�8& y<O8q�H#"?P-/k-^E7	R�7'yB<O8q�H#"AN-/j.^E7	R�8& yB�rO�>N=3hG# n�
DJH!!�/#K
-�B�sO�?M;5fH# 
o�DKH!"�0$I	-p�sO�?M;5hG# n�DJH!"�/#K
-   ��
H�   V e r Y �[/�cͰ/�Ͱ/�Ͱ4/�&3�qͰT2�-/�Q��s/�t+ �4� 9>$9�q�*0'ln$9�-�+D99�Q�Of990153!2654&#!"3!2654&#!"75;27>?2576$32;2;2'&'6?6&#'&?6/&&#" 3!2654&#!">&+&6'�&54'�?&7)�%22%�?&5�	&�Z9���g�)�#t,B��#Z���_u���2�ˁ$�%44%�;&5�8�i��8��"3c$22$'56&&6&%22�Sj5���=nZYh�F
) �>
+��1��� ���&6&%228\d
���F8:y�     �P &  �/�	��'/� ְͱ(+ 013264&#"&546332?654/&"z�~+*���s#* ��>- ���~�{.>)��|�"-�%#�,!��     u[� - / �/���./� ְͰ�+�ͱ/+�� (+$9 0132$54&"#"&5467?654/&#" ��� �3J6ݝ�کp):G��!(6)��������� �&66&��ݝ��'"$88�.)�5&'&#��     �9{   �/���/�+ 017!36765&'&"!1#�n3$"��"$2q�A$/$2s!$2%& �0Hs3      ES�  ! - 7 �./� ְ
Ͱ
�+�ͳ(+�"Ͱ"/�(ͱ/+�("�999 01467>7"&4676767#"&47#"&Q%
',J[�^M4&IC>O)3�nl��k0=,.=)�,#.1�+B^^��.{4bA;g7x/n��KEp#W,;;    	�_  < f �/�Ͱ/�Ͱ"/�:Ͱ4/�)��=/�ְͰ�7+�&ͱ>+�7�)-9999 ��99��9��9�4:�&099�)�-9013!2"'&#"3264&#!"3!2654&#"327632#!").@?^&(9Zw}��|��(9'Z}��}{U7('-.??.��(9	'@/.=7&(X���86%�{|�U-)4!@\>8     ��
6�   : ^ l { � � �8  +�03�$Ͱ)2�/��3�Ͱ2�H/�ZͰj/�c���/� ְͰ�;+�EͰE�_+�gͰg�K+�UͰU�|+��ͱ�+� �9�;� 999�E�=99�_�%B99�g�4ZH999�K�)3N999�U�Sm99�|�-qy999���rt99 �$8�39��'4=?CMPS$9��;EKU$9�ZH�y99�j�m99�c�qt$901476;2+"&47632#"/&4763!6!2#!"'%#!"&;26'&54$32;27654.#"54632#"&4?62#"&46;2+"& $'�+::+�+@c$'*�:)'$��-LQ'+==+�������+=cB�f ���e�Bf�쁂�f<.-;;-.<��X<�")+79*�+>>+�+8�(">+.>A~+�#'-<�"��-8��;*+>��>x�{������z{���ee��9�.;<-�.;;�("�=+. �;��+>>+,@>     ��
�   8 [ g w � � �6  +�03�#Ͱ*2�'  +�/��3�Ͱ{2�G/�YͰf/�`���/� ְͰ�:+�DͰD�\+�cͰc�J+�TͳhTJ+�pͰT�x+�ͱ�+� �9�:�999�D�9�\�5AY999�c�'G99�J�1MX999�xT�.-mu$9 �#�>BLOP$9��:DJT$9�YG�u99�f�h9�`�mp$901476;2+"&47632#"/&4763!2%63!2#!'!"&;26'&54632;27654. 5462"&4?632#"&46;2+"& -�+89*�+>_ +.�JJ'#%�� +W� �`+==+��������+=d>	�_����_�Be��� ��=V==V=��.,:�%%*88+�+==+�*9�,9+-=?q-  �FJ���* ��<V=��/=��yw������w}��ee�B�+==+�+==�-� =+-�;��+9:*+?=    ��>  / a �/�Ͱ&/���0/� ְͰ�+�*Ͱ*�"+�Ͱ�+�ͱ1+�*�.9�"�999��9 �&� $90154674632#".732654&/&54&#"~q����q|�������ѓ��gYH64IXc���O"������O눔�������֒d�/z4DD4��/�   ��0  , �/� +�ͳ +�ͱ+� �9��9 0152654&'4&#"�ܢ�cb��r��qe�
���     ��>  / B ~ �/�Ͱ&/���C/� ְͰ�+�*Ͱ*�@+�8Ͱ8�"+�Ͱ�+�ͱD+�*�.099�@�29�8�&$9�"�39��599 �&� 2<$90154674632#".732654&/&54&#"2654&'4&#"~q����q|�������ѓ��gYH64IXcS�ܢ�cb����O"������O눔�������֒d�/z4DD4��/�er��qe�
���    � " ; O c x � �S/�]Ͱ&/�2Ͱ/�LͰD/�sͰj/��Ͱ/����/�ְyͳdy+�Ͱ/�dͰ2�d�< �� Ͱ /�<Ͱ�# ��6Ͱy�m+�Ͱ��+�ͱ�+�#�!9�d<�P9�6�a499�my@	&2BGLSV_h)s�$9��9 �&]�PVYa$9�2�#),4$9�L�99�D�	 G999�s�BF999�j�!9���dhl$9��99901!27>54'>54'654'&!"32654&#"#"'>'.747>?327"&'&32654&#"#"'&#"4767!27#"'&'&4767632#"'&'&J�{io����f��~����!yKb)����$$nFqF3<W	;$��aO	")���*"�mo�&0(^R10$
H�W��*r|��|w(Y.���Δ�--���͒�-�G2_fE#wMS�ZF�  �Y5,EcM:9�|KUUK&  2
(�	
7""��AFFA(11&4i %!%%!%+(++(+"+)++(,      ���   �/���/�ְͱ+ 0132732654&#!";"�)))��((��bL>��)*2))(�b   �N   7?7673265&'&'1$#q3%#4p$%1�&&� �$3p�A$00$�p1$%��       �   % 5 B �/�Ͱ!/���6/� ְͰ�+�
ͱ7+��+0$9 �!� 
,4$90146$32#"$&732>54'&#"76/&6&y����zz��䜛���z���yޡ_���yݠ_CZZV����zz��䛜���yy�����_��y���`�����
�
�	��     �   % 6 B �/�Ͱ!/���7/� ְͰ�+�
ͱ8+��&+$9 �!� 
*/$90146$32#"$&732>54'&#"47%6#"/&/&y����zz��䜛���z���yޡ_���yݠ_\�	g	���zz��䛜���yy�����_��y���`�ށ����h     �   % 6 B �/�Ͱ!/���7/� ְͰ�+�
ͱ8+��',$9 �!� 
(4$90146$32#"$&732>54'&#"%&6#"'y����zz��䜛���z���yޡ_���yݠ_^
Z�
h	��zz��䛜���yy�����_��y���`��l�	h�      ���    / D �  +�Ͱ/���0/� ְͰ�+�	ͱ1+��/'$9 ��	 #($9014$32#"$&732$$ 	62/&&�bМ�zz��䜝���y�������������N  ��

�
��c�z��㝜���yz��󳱡D�����\X��YY     �   % 6 B �/�Ͱ!/���7/� ְͰ�+�
ͱ8+��&2$9 �!� 
.3$90146$32#"$&732>54'&#"4?6?632'%&y����zz��䜛���z���yޡ_���yݠ_�
�
g	���
��zz��䛜���yy�����_��y���`��q
h
����      �   % 6 B �/�Ͱ!/���7/� ְͰ�+�
ͱ8+��61$9 �!� 
)5$90146$32#"$&732>54'&#"632&y����zz��䜛���z���yޡ_���yݠ_e�	
h���

��zz��䛜���yy�����_��y���`����]

�	h
	�
    ���  " 2 G �  +�Ͱ/���3/� ְͰ�+�	ͱ4+��$,$9 ��	 %0$90146$  $&732$54.#"%&6?6#"'{�8�zz��������z������_��zyݡ`N
�
�
�
���yy��������yz�������yޡ__�ފYY��

     ��    / F �  +�Ͱ/���0/� ְͰ�+�	ͱ1+��!&$9 ��	 %-$90146$ #"$&732$$#"476'{�8�{{��㜝���z��������꣢���YYY����zz��������zz������D����
�

�
 �      �c% . S � �/�7Ͱ+/�2ͰD/�	ͰK/���T/� ְ/Ͱ/�+�Ͱ�>+�Ͱ�A+�ͱU+�/�$&+,4K$9�� 79FH$9�>�	;D$9 �7�&99�+�;9�2�-9999�D�/ 4>F$9�	�HNQ$9014676$3232"&547#"&547&'+5.73273273265>54&#"654&#""&#"��)��*��OFwZ�d.m�m]� S%}	�OC�|�bBb[�@J��YJ	ܜ��~��� �����`�=_�d�7BMnnM�]@2.W�ǀ�$w�bL�[+�O�/'-��Е�     �e�   ' 3 ? M [ e s � � � � �%/�<p33�ͱ7i22�/�c~33�ͱ^w22�1/�J�33�+ͱC�22�/�X�33�ͱQ�22��/�(ְ.ͳ".(+�Ͱ/�"Ͱ.�\+�aͰa��+��Ͱf ��mͰ��� ���Ͱ�/��ͱ�+�(�%99�."�+14999�\�8@N$9�f�9_c999��a�Gt99�m�U9������99���{9 01463!2#!"&463!2#!"&4632#"&4632#"&463!#!"&463!2#!"&463!2#!"&462"&46;2+"&463!2#!"&46;2+"&4632#"&2+a+21,��+22+<+33+��+2i;#)31+%9�/"*42,$-i4*�^9%�g,2�;#�*32+�g%9Q3+a$:9%��,2:H:9J9�3*�*31,�+2]:$G#.-$��%9/;#�"0.$�%9$/#+33+$.2$//$,11�$..$+32�z#;9%,24�%99%,23��%9^*43�#;9%,24d$.0"*43��"11"*33��%98&,22g"10#+23g#;:$+34d#/.$+33     ��� 7 B L X e p z �U �]  +�cͲ5  +�J�333�0ͲE}222�V/�QͰA/�x3�<Ͱt2�o/�jͰ/�)3�	Ͱ#/����/� ְ-Ͳ- 
+�@-3	+�-�C+�Hͳ?HC+�8Ͱ8/�?ͰH�Y+�`ͳT`Y+�MͰM/�TͰY�g ��mͰ`�{+��ͳw�{+�qͰq/�wͰ��+�Ͳ
+�@	+��+�8-�&99�C�<A99�?�@EK999�H�FJ99�YM�QV99�Tg�#]c$9�`�jo99�{q�ty99�w�ux}999���!~�$9��	99 �j� *-$9�	� &999�#�!901476 32 32 "=43>54&+"5'&$#"#2#& 47632"&462"&47632#"&47632#"&47632#"4762"&462#"&�2]��Y4"�������ΐ�������8�������K#%33J3\3J33J3�#&66&$4\$%65&$4-!&66&$�L22L4[6J33%&5�,���֍�����ˈ��>���5ǆ���2��%2L22�$44$&55��$6J33�&6&%55�J5J3�!$2L23�#54$&56     ��0� < H R ^ m z � � � � � � � �  2=4#.546?2576$32;2"36 54'654$#"&#" 32654&"2654&"3264&#"64/&#"32654&#"3264&#"32654&"2654&"632&+&26=4&"?654&#"32654/&";264&+"������8��������(.~�����������1��I"&23J3\3J33J3�#&56%#5F!@D&(6K#&66&$4.4$&55&$4�$&22L3[4J33J4hn���6��"/'6L23J7LG�7%#�VD'!5BJ4�'�%66%�&8���ˆ��6���>͎���2�y`�ɖ��F���,���!2%&22]&66&$44��#2L56�'F9NA5�B#4&%55[$43J44��"2%&23^&66&$44�jޛd`���%22%�&67%�4%�%&6���(C7&$E5{&6L56  	  ���z ; G Q ] j u � � �� �h  +�bͲK  +�'�333�PͲ"�222�V/�[Ͱ@/�z3�FͰ2�n/�	3�sͰ/�3��Ͱ/�6ͳ�6+�43�2���/� ְͰ�H+�MͳCMH+�<Ͱ</�CͰM�R+�Yͳ^YR+�eͰe�q ��kͰk/�qͰY��+��ͳ}��+�vͰv/�}Ͱ���+�.Ͱ ��*ͱ�+�<�9999�H�@F999�C�EJP999�M�KO99�^R�V[99�Yk�6bh$9�e�ns99��v�4z�999�}���999������$9��$%2���$9����9�*�,9 �PK�9�s�!9�� *,$9���9�$9��.�999����901 2=4#.546?2576$32;2"36 54'654$#"&#" 32654&"2654&"3264&#"32654&#"3264&#"32654&"2654&"6 &+&*�����8������).~�����������2��I"&23J3\3J33J3�#&56%#5[#&66&$4.4$&55&$4�$&22L3[4J33J4pl:�6��!/���
�̋��:���=ˎ���5�rd�Ș��E���*���!2%&22]&66&$44��#2L56a#4&%55[$43J44��"2%&23^&66&$44�lޞ^f��   	  ��	� M W c p | � � � �q �{  +�uͲ  +�&[�333�Ͳ!a�222�h/�nͰQ/��3�VͰ�2��/�	 33��Ͱ/�3��Ͱ/�HͰ�/�A���/� ְͰ�X+�^ͰN ��TͰ^�r+�xͰd ��kͰx�� ��}Ͱ}/��Ͱx��+��Ͱ2�� ���Ͱ���+�9Ͱ9�+�*ͱ�+�N�K999�X�9�T�QV[a$9�}r�nh99�k�Hu{$9�x���99����F9��������$9���9���!#$A�$9�9�=�99�*�,5�999 ���
 *,$9���K��$9��/5999�H�9F�999����9�A�;901 2=4#.6?2576$32;2"3>54'6?654/.54?6/&#"&#" 3264&"32654&#"32654&#"32654&#"32654&#"32654&"2654&">72&+&*��µ�9�������Ev,AFm?UF?;z�z-�}���2��N4$&33L2-3%&44&%3�#&66&#5D#&77&#$'56&$4�4&%32L4-6J33J6w2�^��8��!,������7���=Ώ�������wj�MPcg2+1B	<oK5���-���$42L22^&55&$44��#3%&77�L4%&7'&2&%55��$43%&22^%65&$45�W_!���H:8~�      �uC� J [ k v � � � � � � � �  ;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 32?6&'&654/&#"32654&"76?6&'&232?6&'&2654&"632&+&26=4&" ?64'&#"327654/&#";264&+"թF���
��
rs���6����ο���.z����s�O�����1��I"#E
&%"B9E"!@C&(64$&22L2B! %>%&#B' !A%$(A
OL22L2nk���2��!/$5L33L5SI�&%�:E%#B$&5�'�&65'�'5���/��?\����y��?���?͎�����ub�Ř�`UE���)���3
A?)@%$?	[%F:'%F4��$42&%22�4
 ,`#@'%`�1
F@"B
%&?6%2%&22�g۝iX���&65'�'56&�WN�L���%C&%B7�'5L33      �u�z J [ f v � � �� �4  +�3�/ͰP/�VͰ_/�}3�eͰ�Ͱ)/�3��Ͱ"/�Eͳ�E"+�C3�@���/� ְͰ�\+�bͰb�R ��KͰK/�RͰb�m ��gͰg/�mͰt ��nͰb��+��Ͱ��� ���Ͱ�/��Ͱ���+�<Ͱ, ��8ͱ�+�K�	 H$9�\�9�g�Pe999�R�_9�b�E"Td$9��n�ow99���zC99���}���$9���%(���$9�,�)12@��$9����9�8�:9 �VP�	K999�_�W9�e��999���k�99�4���99�/�5��$9�)� 8:r�$9���%H�$9�"� <�999����901;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 32?6&'&32654&"76?6&'&232?6&'&2654&"632&+&թF���
��
rs���6����ο���.z����s�O�����1��I"#E
&%"BT4$&22L2B! %>%&#B' !A%$(A
OL22L2nk���2��!/���/��?\����y��?���?͎�����ub�Ř�`UE���)���3
A?)@%$?0$42&%22�4
 ,`#@'%`�1
F@"B
%&?6%2%&22�g۝iX��    �u	� Y j u � � � �� �4  +�3�/Ͳ�  +��Ͱ_/�eͰn/��3�tͰ�Ͱ)/��Ͱ"/�TͰ�/�M���/� ְͰ�k+�qͰq�a ��ZͰZ/�aͰq�| ��vͰv/�|Ͱ� ��}Ͱq��+��Ͱ��� ���Ͱ�/��Ͱ���+�EͰE�,+�7ͱ�+�Z�	 W$9�k�9�v�_t999�a�n9�q�T"cs$9��}�R~�999����9�������$9���%(���$9���/12)�$9�,E�I�99�7�9B�999 �e_�	Z999�n�f9�t��999���z�99����9��4�5��$9�)/� 79�$9���%W��$9�"� >B999�T�R�99�M��G901;36&+6#!".546?2576$32;2"36 54'6?654/.74?6/&#&&#" 32?6&'&32654&"76?6&'&232?6&'&2654&">;&+&ԩE�����
rr���8��������)Fz'B\�5UK9;{�y-�v���2��I"#E
&%"BT4$&22L2B! %>%&#B' !A%$(A
OL22L2K5�bH�c6��#-���3��BX����w��6���=ˎ��
�5֋zv�I}�C,/A	;mJ1���*���3
A?)@%$?0$42&%22�4
 ,`#@'%`�1
F@"B
%&?6%2%&22�Ya"f��0<2}�     ��C� J Z g t � � � � � � � �  ;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 654/&#"32654&#"32654&#"32654&#"2654&"2654&"632&+&26=4&" ?64'&#"327654/&#";264&+"թF���
��
rs���6����ο���.z����s�O�����1���E"!@C&(6}$&66&#5$'56&$4#&66&#5Y5J33J54L22L4kk���2��!/$5L33L5SI�&%�:E%#B$&5�'�&65'�'5���/��?\����y��?���?͎�����ub�Ř�`UE���)��f%F:'%F4�3'4%&77^&2&%55��#3%&771&55&$44�X$43%&22^g۝iX���&65'�'56&�WN�L���%C&%B7�'5L33    ���z J W d q { � � �U  +�OͲu  +�433�zͰ/2�i/�oͰ/��Ͱ\/�.3�bͰ)/�3��Ͱ"/�Eͳ�E"+�C3�@���/� ְͰ�e+�KX22�lͱR_22�l�|+�r2��Ͱw2����+�<Ͱ, ��8ͱ�+�e� H$9�l�E"99�|�C9���%(�999�,�)12@��$9����9�8�:9 �U��99�zu�599�b\�9�)� ,8:$9���%H�$9�"� <�999����901;36&+6#!".546?2?6$32;2"3>54'654$#"&#" 32654&#"32654&#"32654&#"2654&"2654&"632&+&թF���
��
rs���6����ο���.z����s�O�����1���$&66&#5$'56&$4#&66&#5Y5J33J54L22L4kk���2��!/���/��?\����y��?���?͎�����ub�Ř�`UE���)����'4%&77^&2&%55��#3%&771&55&$44�X$43%&22^g۝iX��      ��	� Y f s � � � � �d  +�^Ͳ�  +�433��Ͱx/�~Ͱ�/��Ͱk/�/3�qͰ)/��Ͱ"/�TͰ�/�M���/� ְͰ�t+�Zg22�{ͱan22�{��+��2��Ͱ�2����+�EͰE�,+�7ͱ�+�t� W$9�{�T"99���R9���%(�999���/12)�$9�,E�I�99�7�9B�999 �d��99����599�qk�.99�)� ,79$9���%W��$9�"� >B999�T�R�99�M��G901;36&+6#!".546?2576$32;2"36 54'6?654/.74?6/&#&&#" 32654&#"32654&#"32654&#"2654&"2654&">;&+&ԩE�����
rr���8��������)Fz'B\�5UK9;{�y-�v���2���$&66&#5$'56&$4#&66&#5Y5J33J54L22L4H5�bH�c6��#-���3��BX����w��6���=ˎ��
�5֋zv�I}�C,/A	;mJ1���*����'4%&77^&2&%55��#3%&771&55&$44�X$43%&22xYa"f��0<2}�   
  ���p   - = J V f u � � � �H/�AͰ;/�_Ͱ/��3�Ͱ�2�e/�2ͰU/�O���/� ְͰ�J+�K2�EͰQ2�E�b+�7ͳv7b+�g3�~Ͱo2�7��+��ͱ�+� �99�J�!&).;$9�E�2W]_e$9�b�:Z99��7�k{�999 �AH�pr$9�;�go999�_�k99��]9��.7Zb$9�e�W9�2�)�99�U�&v~$9�O�!{9901476;2+"&4?632'&47632#"/&4$32 $4632"&55462"&32654&#"47632/&4?632#"&476;2+"$�%11%�%61�'&3�AB%#�3&'���pΕX�� ��� ��5&'45L56J65L5���� ��ݜ)$'�@@��#&5�#$0�#�%77%�%'6L56�B%�0%'�33�%�'&3��E��Y��p�� �� �Y&44&�'66'I�%66%�%11�Xԏ��ݜ���F%�J22��(�6%(�3��L7J6     �W/   C �/�Ͱ/���/� ְͰ�+�ͱ+� �
$9 �� 999014$32 &32654&#"� �� ��� ����ۋ��� ��ޜ)���� ��� �� ԏ��ݜ��    ��v G W # �D/�K��X/�ְ2�HͱY+�H�(9 0154754646=46=46574757656=6747676?>767>7676?	%#".73267654&#"	(+)��B��l!�E���������,�uAI�
	'
=6y�
��Q������������yDK��k9�  	  �	s   @ � �8HW  476;2+"&47632#"/&4>32&#"654&#"&5&76767>767>76?6;2##"'&6?>56'&'&'&'.'&'&'&'&'4&%47>?632222+"'"&#".#&'&6?>76'&'&54632#"&>?67632#"'&67>76'&'&4?632#"&476;2+"&'�&55&�(78("�5%)�[��r��-:'&⟞�/+%		
	
	�	'4 

0						�")'	 "5W'4"

LYA7&'66'&7f")'603O�	'50!NB"$��$&7�$%2�%�&98'�'3�&6&(66%�'&5��:qї[������ݜ3��94	
)	}�0Y= F
	  	*)(	#C.#	'$#'
$hm0Z; 	E@Gi�'66'�&22��#C.#	)2"(6J|�0Y= F8@G:BF�(�7&(�5��#7%'76   ��EP . ? L �+/�2Ͱ;/���@/� ְ/Ͱ/�6+�ͱA+�6/�"%)+$9 �2+�)9�;�9��9015&>76632#"'&6767#".7326?47.#"#Je�f7�qVX��"/M_�P)�oW_o�q��a[�
�bY�4x~���98s�(��UOwk�oq-	%7x�)n�tb�yZ`�tW   �b7& - 3 �./�ְ"2�Ͳ
+�@	+�
+�@ 	+�/+��9 014676$3232#"&5465#"&547&'#.��$#��+y�}�Et;�f0pONp		^�'N/�����#��ݲh�j�}8�vc�0AOooO	&
�^%L)]�     v���  . @  �A/�!ְ/ͱB+ 016%673'&' 67.'&'.'&'"76767>76&v��U C��f3)`��J}M.!�Ǝ-�.(�K7\<7�0=C�m69#^L����T�5�p�䵝���82$@-<��/9�b$#	
��1+�B�j$E� 	  ��IA 
 H R ] i u  � � � �g  +�aͰQ/�:}33�MͰy2�F/�-�333�Ͳ&�222�F
+�@	+� 2�\/��3�Wͱ�22�s/�m���/� ְͰ�J+�S22�OͰX2�O�^+�=j222�dͲ6p222�^d
+�@^C	+�2�d�w+��2�|ͱ*�22�|��+��ͱ�+�^O�E99�wd�#&.0$9 �FM�36>@$9�\�99014632"&7463!'&4624632762!2#!"/#"&5"&4?!"&4762"'4762"'4632#"&4632#"& 4762"'4762"'4632#"&**+<*�*X�,<�,*�;�X++���;�*,�<,���*=,,==,=�,**,,**,=,,==,=�++++,,*+,�=,�V,,���=�,+�<���++W�,<�+��;,;,";,;�S++++�++++�;,;,";,;�-,,++      �cW   $ 0  >54&6 5 4 >54&>54&h��hh����ʅށ�瘘�Ә���?��Ԙ���]�hh��hh�
%����
���&��ݙ��ݙ��ܚ��ܙ��   �X5   �/� +�ͱ+ 0132$54'.'&'� ���pNG�+'�c������� ��`	q[�*'�`���     �W�  # ' + 9 = A � �/�Ͱ$/�>3�%Ͱ?2� /���B/� ְͰ�+�ͳ=+�:Ͱ:/�=Ͱ=�4 ��,Ͱ,/�4Ͱ�+�
ͱC+��$&()+$9�,�*9�:� 9�=�/7$9�4�299��01>@$9 ��99�$�,27999�%�
 ./$9� �)+01:;$90146$32 !& 32$54."537467#"&5353|�!��!�|����<��Ƭ�����a����a>�s8�7k]C#F�bFEa�J����"�||��ߟ���iK��[H������{�aa��MMy7�8��Cb�%��(6Faa8����OO  ����"�  # 9 = I ` Y �a/� ְͰ�%+�0Ͱ0�K+�VͰV�D+�ͱb+�0%�!:999�K@	;=I>?$9�V�AG<999 0147? #"$&3267.#"4>32#".3#3267.#"4>32#".
�y��P(0B`r�|��ڣ����}�prsqqsrp�=��Fqrsoosrq��m�J�M*#C����������}y�%ޅ�������0,8(H'8,��z�ņ�������H'8..8  r�Z      333###3#3733#73���������������&D@���|���{�)��)ee��8��   �� �? - � 3 �*/�ͱ22��/��ְ�ͱ�+����2u999 �*�9901&4732673267267"#"&#!""&#.' 4?252525324737373736;43637325;7;2;;3;32323333"/"&5"',�]^�,,�^]�,-���,6%�
$4J��3�$4%�3m�O__OO__OO__O��%62#�3��3�� $$��      ��	6�  = L X f v � � � �/�PͰ/�M3� Ͱ� ���Ͱ-/�:3�	Ͱ4/����/� ְͰ�f+�aͰa�*+�ͳS*+�ͱ�+�f@		&-?FMX$9�a�P99�S*�U9��gwx�$9 �P�Cj99� ��S��$9�-�@	* Ux��$9�	�17|$9�4�29014676$3232#"&'!.7!6;23>54&+"5'.#"+&?632#"32654'4632"&54632#"/&4?632"46;2+"&��)��)��xy�x��&���m]h�m��r�Ҋ��+l��((y!&z V"�^|�5�r++<+�)~+!yy~<�(�,,�(��� ��ݬ����y�x����p��pq�2����2���44{& ~+Vj�~>2bz��(�,,r({+~�>~{�r**++   ���	�x " = J � �/�BͰ /�>3�&Ͱ-/�:3�	Ͱ4/���K/� ְ#Ͱ#�+�>Ͱ>�*+�ͱL+�#�4999�*>�	2BH$9��9 � B�F9�&�!H$9�-� 999�	�17999�4�2901476 32 322#".5!& 7!>54&+"5'&$#"+32>7&'�2^��Y4#��qg�F���{ݞ]�!��ֶ�����Ў�������8��À�pc���v����!)���֋򐸑XR���^��y
2֋�̋��>���>��i�p`�~#hh      �	�u   ; N � �/�?Ͱ/�J3�$Ͱ+/�83�	Ͱ2/���O/� ְ!Ͱ!�+�<Ͱ<�(+�Ͱ�D+�ͱP+�!�2999�(<�	0?J$9��G9 �$�D999�+� G$9�	�/5999�2�0901476 32 32#".5!& 7!>54&+"5'&$#"+32>54&'!�2^��Y4#��hx_��yxܟ_�"��ֶ�����Џ�������8���
�`�tB?;>������ )���֋� !R�{ݞ]^��x
2֋�͋��>���>��Z��K|�SN�A��
   �n�  1 L a � �//�5Ͱ</�QͰC/�MͰY/���b/� ְ2Ͱ2�X+�ͲX
+�@	+�9X+�+ͱc+�X2�<MQ$9�9�S9�+�)99 �<5�)+2 $9�Q�'(%?FIS$9�MC�U$9�Y�_`999��90154676754 76;24##!"&73!2654&+"/.#"#32267&="&#"'�y3�'�9:!*)%a#G{PL	3Fiݛ�%���cH�EeeE�
	�][�CBV���/|]o4��b�?W�~�&�\%�c*
	K348uq]I''FLeC6N���HefGEeD\||\;	ah��MEvT8�$TNl  
  ��	��  < I V c o | � � �� ��  +��Ͱ ��Ͱ�G ��AͰA�h ��nͰ�/�3��Ͱ2�"/�:Ͱ4/��3�)ͰN ��TͰ4�t ��zͰ4��ͳ[)4+�a���/�JְQͳDQJ+�=Ͱ=/�DͰQ�W+�^Ͱk2�^�~+��Ͱp ��wͰ���+��Ͱ��+�Ͱ��+��Ͱ��7+�&ͱ�+�J=�AG99�QD�NT99�W�de99�^�[a99�w~�tz��$9����99���
$9���-099���)492$9 �A�~9�h��9���De=}$9��k999�nG�d999���9��� 99�N:�7&99�t�260999�T4�-JQpw��$9�z��9�a)�W^99013!2"'&#"3264&#!"3!2654&#"327632#!"32654&#"32654&#"%32654&#"32654&#"32654&#"32654&#" 32654&#"32654&#").@?^&(9Zw}��|��(9'Z}��}{U7('-.??.��(9�$'67&$4e$'56&$4C$'67&$4
#'67&$�$'67&$4"#'67&$�#'67&#�$'56&$4	'@/.=7&(X���86%�{|�U-)4!@\>8��&2&%55�&2&%55�&2&%55�+J2&%5�&2&%55�lJ2&%5pJ2&%6��&2&%55      �q�  5 D x �/�3Ͱ,/�AͰ%/�6Ͱ9/���E/� ְͰ�/+�Ͱ�<+�ͱF+�/�69A$9��	?99 �,3�	 $9�A�#)?$9�6%�<9990153!2654'654.#"46?257>32;2#!"&>32&#.#�ۛ���e�쁯�٩�3y��VBC�[]�	
�EeeE�%Hc�����l]^{/�����M6U���f��ڮ$\�&�~C`	<\||\EdEHff����p�;N��   ���� f � � �8/�LͰ\/�3�iͱou22�\i
+�@\&	+�Xb222�|/�	���/�@ְHͰH�R+�2�,Ͱ2��+�H@�>IZ[$9�R�8Ll999�,�|9 �\L�*.BDSZ$9�i�glrx$9�	|�9901>7 %54632#"'&##"'&'#"'.65462327>/#"'&"'.76;2>732>732&' !"f[*-.�ɏ9B^$-2}�7nB:$tbQ��Q2"&
%!lS&uY$$��@p8<!+�la	��=�f	��=�f
ZaG�����r~( 6��/!))!/R��Q_׀	%�+./t��^^,+'&*1#A//&<^$�()7$�9�5R�5R/�(v��8    
  �qE�  7 E V { � � � � �} �  +�Ͳ�  +��Ͱ/�
Ͱ /�5Ͱf/�lͳ0lf+�&ͰC/��3�<Ͱ�2�s/�\Ͳs\
+�@sz	+��/�����/�ְͰ?2��8Ͱ8/��W+�vͳ2vW+�$Ͱv�|+��2��Ͱ�2���p+�aͲpa
+�@pj	+��ap+��3��Ͱ�2�a��+��ͱ�+�8�999��F9�W�.)JR$9�2�/&4O$9��|�ei\ms$9�p�n9��a����999 �
�99���999��9� ��9����9�5�#�999�f��9�0�*,2�$9�l�$9�&�)9�<C�apv999�\s�R�99���FO��$9���J�990153!2"'&#"3264&#!"3!264&#"32762#!"476;2+"&47632#"/&5>32#"&=4;>54&#"+"54632"&5462"&47632/&4?632#"&476;2+"&s)??R $&4Uuv��v��&8'�v��wyP1'&T==*�n&8i$�%22%�&61%#�4%'����pΕX�����ݜ��y�5&(35L55L55L5M%'�@@��#%6�#$1�#�%88%�%P&<V> 3LU��6$��QN1<V>7�&6L56%�'&3��R���Y��p����ݛ��Е	���&44&�'66p�%66%�%11��%�J22��(�6%(�3��L7J6        	� 0 M ] � �-  +�4Ͱ;/�J3�PͰC/�Ͱ[/���^/� ְ1Ͱ1�X+�Ͱ�8+�(Ͳ(8
+�@(	+�_+�X1�<NP$9�8�S99�(�$U99 �;4�$( 999�P�SU999�C�?EF$9��
N999�[�Y9��90147>7632>32#!".73!2654&+'.'"&#"53267&=&#&�%�ck�y-y�z;=FW>lEB,t@�����̋���̍��QSu�I���("ǋ5��]��(��5"3Kn;	@2*2fbPH�fp����ΐ��P��-ʂM�ܑ�~2@E�a    �����  . �/�Ͳ
+�@	+�/� ְͲ 
+�@	+�+ 01463!2+#"'#"&)2))��"�e))
1))'�b ��)*      ��p  . �/�Ͳ
+�@	+�/�ְͲ
+�@	+�+ 014763254632#!"&546;"�)))��))��a>�c�)*��))(�            . Y �  +�Ͱ/���//� ְͰ�!+�'Ͱ'�+�	ͱ0+�!�9�'�999��9 ��	 $+$9014$32#"$&732$$ 32654&#"�bМ�zz��䜝���y�������������!""!��c�z��㝜���yz��󳱡D����""�!!            5 \ �  +�Ͱ/���6/� ְͰ�!+�)Ͱ)�+�	ͱ7+�!�9�)�3$9��/99 ��	 %3$9014$32#"$&732$$ 46327>#"&�bМ�zz��䜝���y�������������!"3/�'!��c�z��㝜���yz��󳱡D�����!!�Y.��$!          5 \ �  +�Ͱ/���6/� ְͰ�"+�)Ͱ)�+�	ͱ7+�"�9�)�3$9��.99 ��	 %3$9014$32#"$&732$$ 546276#"&�bМ�zz��䜝���y�������������!0!�.��!��c�z��㝜���yz��󳱡D�����!!��k.�!         4 � �  +�Ͱ0/�(Ͳ(0
+�@(%	+�/���5/� ְͰ�!+�(Ͳ(!
+�@(,	+�(�+�	ͱ6+�!�9�(�999��9 �0�9�(�	 999��9014$32#"$&732$$ 462!2#!#"&�bМ�zz��䜝���y�������������!0!!!��	!��c�z��㝜���yz��󳱡D�����!!�s!"!            3 ] �  +�Ͱ/���4/� ְͰ�!+�(Ͱ(�+�	ͱ5+�!�9�(�999��+.999 ��	 $.$9014$32#"$&732$$ 462#"'%.�bМ�zz��䜝���y�������������!0!�!����c�z��㝜���yz��󳱡D�����!!�\�-�         3 ] �  +�Ͱ/���4/� ְͰ�"+�)Ͱ)�+�	ͱ5+�"�9�)�999��+/999 ��	 %/$9014$32#"$&732$$ 5462#"'&�bМ�zz��䜝���y�������������!0!�"���c�z��㝜���yz��󳱡D�����!!�J��-
         , Y �  +�Ͱ/���-/� ְͰ�!+�(Ͱ(�+�	ͱ.+�!�9�(�999��9 ��	 $*$9014$32#"$&732$$ 462"&�bМ�zz��䜝���y�������������!0!!0!��c�z��㝜���yz��󳱡D�����$!!��""          3 ] �  +�Ͱ/���4/� ְͰ�$+�+Ͱ+�+�	ͱ5+�$�"1999�+�999��9 ��	 '1$9014$32#"$&732$$  &7462#"'�bМ�zz��䜝���y���������������!0!�#��c�z��㝜���yz��󳱡D�����&-�!!�:��         3 ] �  +�Ͱ/���4/� ְͰ�$+�+Ͱ+�+�	ͱ5+�$�!1999�+�999��9 ��	 '1$9014$32#"$&732$$  6?462#"'�bМ�zz��䜝���y��������������!0!��!��c�z��㝜���yz��󳱡D������-��!!�9�         4 � �  +�Ͱ2/�$Ͳ$2
+�@$)	+�/���5/� ְͰ�%+�,Ͳ%,
+�@%!	+�,�+�	ͱ6+�%�9�,�999��9 �2�9�$�	 999��9014$32#"$&732$$ 463!462#"'!"&�bМ�zz��䜝���y��������������!!0!!
��!��c�z��㝜���yz��󳱡D����!�!!�9!"         5 \ �  +�Ͱ/���6/� ְͰ�'+�.Ͱ.�+�	ͱ7+�'�"99�.�2$9��9 ��	 *2$9014$32#"$&732$$ &7>462#"'%�bМ�zz��䜝���y�������������/�!0!!����c�z��㝜���yz��󳱡D����,.kd!!�:!�          4 \ �  +�Ͱ/���5/� ְͰ�'+�.Ͱ.�+�	ͱ6+�'�!99�.�1$9��9 ��	 *1$9014$32#"$&732$$ $6765462#"'�bМ�zz��䜝���y�������������z/5!0!!)���c�z��㝜���yz��󳱡D����h.Y�!!�9!$       & > �  +�Ͱ"/���'/� ְͰ�+�
ͱ(+��99 �"�
 990146$32#"$&732>54$#"z����zz��㝜���zRm� �����m��ú���m��zz��㝜���zz�����mm� ���=�m��      �   +�/�ְͱ+ 01!2$$#�a����ч�u8
/Oi��b�a�5���pBw�vwaU       �/�ְͱ+ 01!2$$#�a�����q�a/7Z��b�a�<���n]����        �/�
ְͱ+ 01!2$$#�a����ѯ�-H~�b�a΁�c�\����       �/�
ְͱ+ 01!2$$#�a����ф|!7^�b�aΎ�k�Z����        �/�	ְͱ+ 01!2$$# �b����ѫG�b�a����)���        �/�	ְͱ+ 01!2$$# �b����ѫG�b�a����)���       �/� +�ͱ	+ 01!2$$#�a������b�a�  �   
  �/� +�ͱ+ 012$$#�J�a�����J�0���b�a��� n   
  �/� +�ͱ+ 012$$#n��b����ђ����b�a��� &     �/� +�ͱ+ 012$6&$#&a{��zz���ht����z�:�z��n  �     �/� +�
ͱ+ 012$654$#�@vT��z���ъ�z�ʭCz���b΅�i    �     �/� +�
ͱ+ 012$6&$#�"P�i��zz��㜫��˧=z�:�zu�c  J     �/� +�ͱ+ 012$654$#J=b�f��z������i���|,z���b�f�_         �  +�
��/�+�ͱ+ 01 $$ �b�a�����^����^����b�a��     �   �/� +�ͱ+ 013$4.'"M���}9a��P����y�}꼎M�oyڨ�\y���        ��   �/� +�ͱ+ 013$4.'"M���}�J�X�����}꼎M�M����,���     p�   �/� +�ͱ+ 013$4.'"M���}r=k�J����y�}꼎M�*��6y���      '�   �/� +�ͱ+ 013$4'"y��(�����������y�
������        �� 
  �/�+�ͱ+ 013"�a��������`�����i�        ��   �/� +�ͱ+ 013"�aѓ�����z ����;�b�y���          �/�+�ͱ	+ 013"�a������^����         
  �/�ְͱ+ 013"�a�ff�����^���B�_��      
  �/�ְͱ+ 013"�b��������^�����h�         �/�ְͱ+ 013$47"�a��Ϋ������^��������          �/�ְͱ+ 013&7"�b���������^���g��i�           �/�ְͱ+ 013$4>7"�a����R��j�����^���Q�-� ���&�         �/�ְ
ͱ+ 013.54>7"�aѕ܃N!7]|�o�����^���9����^Cq�nub`'�    ���    / D �  +�Ͱ/���0/� ְͰ�+�	ͱ1+��/'$9 ��	 #($9014$32#"$&732$$ 	62/&&�bМ�zz��䜝���y�������������N  ��

�
	��c�z��㝜���yz��󳱡D������

��YY    �qC� L _ k | � � � � � � � �  5476 32>32"=43>54&+"5'&$#"#32#&'.'5&5&4657>#"&#.462#"'&4?>#"'.4632'&/&462#"'&4?>'.4657>#"&#.462#"'&32654&#"54632#"&4?632&'4632#'"/&46;2+"'&�1_㟃P�s��z.����Ώ�������6��t#,B?SK��K
A($$A!!O2L22&%�B"%&
E#"96(&C@!!E2L22&#BB#&%>% !)
A($%A !O2L22&%n�/!ܛ2ݝ�?6%&33&%6S�&'�I:5&%B$&E�5'�'56&�&� *�FUa����Śbu���͋��?���?Ç�g�.֋(�8?&%
A"@F
2U&22&%1��>$%@)?A
3	|&4F%';F��%22%&2`%'?#`,!
5�?&%
B"@E
2U&22&%20z��Xj����&76'�'67�N�L��J&6C%&D�&33L6    	  �k�q J ] i z � � � � � �  +�Df33�Ͱ?2��  +�v/�pͰX/���33�RͰ�2�~Ͱ$/�13��Ͱ+/�ͳ�++����/� ְ6Ͱ82�6 
+�@6B	+�6�^+�cͰc�U ��OͰO/�UͲOU
+�@OK	+�c�{+��Ͱ��t ��jͰj/�tͰt�mͰm/���� ���Ͱ�/��3��Ͱ���+��Ͱ��� ���Ͱ�/��Ͱ�2����+�Ͱ! ��Ͳ!
+�@!	+��+�6�>�z +
��.��������� �����....���..�@�O6�.99�^�P[\999�U�X`f999�c�aT99��{�v}99�t��9���+~r$9�����9���
���$9���)���$9���%(���$9�!�$��$9����9��9 �pv�j9�X�o9�~�N�99�R�PO���$9��Q�99��`�99�$�2a��$9���(.�$9�+�)�999����9��
901=476 32>32"=43>54&+"5'&$#"#32#&'.'&4657>#"&#.462#"'&4?>#"'.462#"&4?>'.4657>#"&#.462"'&32654&#"�1_㟃P�s��z.����Ώ�������6��_-5<HNKy�%K
B'$$A!!O2L22&%�B"%&
D#"T2L22&$4BB#&%>% !)
B'$%A !O2L22Ln�/!ݚ2ݝ��")�FUa����Śbu���͋��?���?Ç�e/�(�zK�Q>&&
B"@F
2V&22&%2��?$$@)>B
3Q%11%&24`&&
@#`, 
4�>&&
B"@F
2V&22&%20z��Xi��  	  �o	� d w � � � � � � �  =676 32>2 "=43>54&+"5'&$#"#2332#&'#.4657>#"&#.462#"'&4?>#"'.462#"&4?>'.4657>#"&#.462"'&3267.=#"�2^�v�-y�{;>FU?lFB'zF�����Α�������8��LB#6<�{jF
A($$A!!O2L22&$�B"%&
E#"T2L22&$4BB#&%>% !)
A($%A !O2L22LK�-#ē6c�Hc��	�(�1Jm;	A/+1hcRI�vz�����
Ȉ��>���7ŅT�0�QE���?&%
B"@E
2U&22&%2��?$%@)?A
3Q%22%&24`%'@#`, 
4�?&%
B"@F
2U&22&%2K��~1>0��f!`   �n� b u � � � � � �  476 323325"=43>54&+"5'&'.'&#4#&'&#"#32#&'.'5&5&4657>#"&#.462#"'&4?>#"'.462#"&4?>'.4657>#"&#.462"'&�1_�i�fl&!��Us����Ώ�wt����6��?6!.@ASK��K
A($$A!!O2L22&%�B"%&
E#"T2L22&$4BB#&%>% !)
A($%A !O2L22L�")�+4qu�\9�e""	���̋��?�tj�?ćL�0�.֋)�7?&%
B"@F
2U&22&%2��?$%@)?A
3Q%22%&24`%'@#`, 
4�?&%
B"@F
2U&22&%2     �   , 8 X f r | � � � �@ �6  +�c�33�0ͱ\�22�*/�z�33�"ͱu�22�/��3�Ͱ�2�Q/�=ͲQ=
+�@QW	+�J2�q/�k���/� ְͰ�9+�Sͳ3S9+�-Ͱ-/�3ͰS�g+�nͳsng+�xͰn�N+�HͰH�� ��}Ͱ}/��ͳ�HN+��ͰH��+��ͱ�+� �99�-�9�9�06999�S3�Y99�g�Q9�s�@A&kp$9�}n�P`uvz{$9�Nx��9��H��9����9����9 ��NS99�Q�O9�=��99�q���$9�k��9901476;2+"& 547632#"/463!2#!"&4632#"&56 7;62; +"&5. +"463!2#!"&5462"&462"&46;2+"&5463!2#!"4?632#"&476;2+"&#�%11%�%61 $"�3&'�2+a+32,��+2i;#*32+%9��d�y����yk3*�#;9%�g+2e6J65L5�:H:9J9�4*�*31,�+3^9$G#.-$��%��"%6�#$0�"�%77%�%2�&6L56�&%�'&3��`$..$+32��#:8%,24F�*���	��ϕ	��%8:#*42��&66&�%22��"00"*44��%88%,22=*"0/#+3�(�6&'�3��%7J65     	��a�  ; O \ � �A  +�[Ͱ/�
ͳV
+�KͰ/�Ͱ"/�9Ͱ3/�(��]/�ְͰ�<+�Pͳ6P<+�&ͰP�X+�Hͱ^+��9�<�,9�6�/(8999�&P�A9�X�KU[999 �[�<HPX$9�
V�9��99�K� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&#"4>2#"	U**#9�ooO��%�OppON9"**�?%�4Xj;R�W@!��O�sE�	'GX2jNc{(:*"9pPOq%�p�o6!':*$��SJ$7]nyc*��K��{KgV=88��  	  �  ; ? � �/�
Ͱ/�Ͱ"/�9Ͱ3/�(��@/�ְͰ�?+�>ͳ=>?+�<Ͱ</�=ͳ6=<+�&ͱA+�6�>��
 +
�<.�>.�<�=	��>�?	��<=>?....�@��9�?<�(38,$9 �
�9��99�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!	U**#9�ooO��%�OppON9"**�?%_���{(:*"9pPOq%�p�o6!':*$��S     	  v�  ; a � �R/�Kͳ
KR+�ͳKR+�Ͱ"/�9Ͱ3/�(��b/�ְͰ<2��6+�&Ͱ&�O ��NͰN/�OͰ&�U+�Gͱc+��9�N�,/99�6�1(8]$9�&O�?@99�U�BKR\$9�G�=>99 �R�G9�
�9��99�K� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!7!5>54.#"34632	U**#9�ooO��%�OppON9"**�?%M�+�x xSf>,\�V���E?006)�"�1{(:*"9pPOq%�p�o6!':*$���0"<>a:Yy3��;R3 EMq8  	  a�  ; k � �A  +�eͰ`/�^ͰX/�Qͳ
QX+�ͳQX+�Ͱ"/�9Ͱ3/�(��l/�ְͰ�<+�iͳ6i<+�&Ͱi�b+�DͰD�K ��[Ͱ[/�Kͱm+��9�<�,9�6�/(8T$9�&i�AU_999�b�QX^e$9�D[�GH99 �`e�<Di999�^�HG99��TU99�X�K[99�
�9��99�Q� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32654&'5>54.#"3>32+32#"'&7#	U**#9�ooO��%�OppON9"**�?%t"H�Y��A4E[$9PQ-���C2.5�2/mH4=�{(:*"9pPOq%�p�o6!':*$��+RM/��:`dF1L0��17'"K�K26$"=   	��q�  ; F J � �/�
Ͱ/�D3�Ͱ"/�9Ͱ3/�(��K/�ְͰ�6+�&Ͱ>2�L+�6�>�� +
�>.�I��?
��C��>�=>I+�?�@?C+�>�J>I+�=>I � �#9�J9�@?C9 �=>?@CIJ.......�=?@CIJ......�@��9�6�(,8<F$9�&�G9 �
�H99��99�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!3737##73	U**#9�ooO��%�OppON9"**�?%j}"�&l&k`��(��4{(:*"9pPOq%�p�o6!':*$�4�����D��   	��o�  ; _ � �A  +�[ͰU/�MͰ/�J3�
Ͱ/�P3�Ͱ"/�9Ͱ3/�(��`/�ְͰ�6+�&Ͱ&�X+�Gͱa+��9�6�(,8<=QR$9�&�ALMS^_$9�X�JNU[$9 �U[�GR<999�
�NO999��99�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&#"#7!7!3632#"'&'	U**#9�ooO��%�OppON9"**�?%r!I�[\�P3�lo,%p*�ћ�\3>JF2"{(:*"9pPOq%�p�o6!':*$��3]O/1H`O'k�.m��$6556B.  	��x�  ; Z i � �?  +�gͰ^/�EͰJ/�Uͳ
UJ+�ͳUJ+�Ͱ"/�9Ͱ3/�(��j/�ְͰ�<+�[ͳ6[<+�&Ͱ[�d+�Bͱk+��9�<�,9�6�/(8999�&[�GH99�d�?EJU^g$9�B�N9 �^g�<B99�E�GH99�J�NO99�
�9��99�U� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32654&#"#6323.#"4632#"&	U**#9�ooO��%�OppON9"**�?%����ŎiuB5{(�%9MR,d�[<�N1+D91={(:*"9pPOq%�p�o6!':*$�♺��g�P�2P4"Mq�we;="2D9     	����  ; E � �/�
Ͱ/�A3�Ͱ"/�9Ͱ3/�(��F/�ְͰ�<+�=ͳ&=<+�6Ͱ6/�&ͱG+��9�<�,199�6�3(8BC$9 �
�@CD$9��99�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!6?!! 	U**#9�ooO��%�OppON9"**�?%�*�|)��,t��{(:*"9pPOq%�p�o6!':*$���Ga����  	��i�  ; ^ n | �?  +�iͰb/�zͰr/�Rͳ
Rr+�ͳRr+�Ͱ"/�9Ͱ3/�(��}/�ְͰ�<+�_Ͱ_�o ��XͰX/�oͰo�& ��6Ͱ6/�&Ͱ_�f+�EͰE�M ��uͰu/�Mͱ~+��9�<�,9�X�1/99�6�3(8[\$9�&o�?9�f�Rbijrz$9�Eu�HIJ999 �bi�<E99�z�HI[\J$9�r�MXou$9�
�99�R� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&'7>54.#"4632#7".4632#"&	U**#9�ooO��%�OppON9"**�?%j��_�R3L>H^8`d:LzL2:3Z{�Z?A;Q?*-QO80C
:)@3{(:*"9pPOq%�p�o6!':*$�}uy&8M@!B_
kI=W,1A@"7R
o@84;"-.&c3.+.1     	��V�  ; [ j � �A  +�WͰ_/�Jͳ
J_+�ͳJ_+�Ͱ"/�9Ͱ3/�(��k/�ְͰ�M+�\Ͱ\�& ��6Ͱ6/�&Ͱ\�b+�Gͱl+��9�M�,/<=$9�6�1(8999�\�[9�&�APW999�b�JST_g$9 �W�<GM\bf$9�
_�9��99�J� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"32>54&#"32673#"'&'4632".	U**#9�ooO��%�OppON9"**�?%u6Yf<[�\?���·j9mVF.3>=694D/{(:*"9pPOq%�p�o6!':*$�s?\2Di�;����j�.#Ll32I76$(%    	��	��  ; ? P ^ � �E  +�]Ͱ/�
ͳW
+�NͰ/�Ͱ"/�9Ͱ3/�(��_/�ְͰ<2��<+�=ͳ?=<+�>ͳ6=<+�&Ͱ=�@+�QͰQ�Z+�Kͱ`+�6�>�� +
�<.�>.�<�=	��>�?	��<=>?....�@��9�?<�(38,$9�ZQ�EN99 �]�@KQZ$9�
W�9��99�N� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!32>54&#"4>32#"	U**#9�ooO��%�OppON9"**�?%W���4Xi;b�X:�����	'G,+4kNc{(:*"9pPOq%�p�o6!':*$��O��S�J%Pv�y4�����KhW=:7��   	����  ; ? C � �/�
Ͱ/�Ͱ"/�9Ͱ3/�(��D/�ְͰ�?+�>ͳ=>?+�<Ͱ</�=ͳ6=<+�&ͳ@>?+�AͰ>�C+�BͱE+�6�>�� +
�<.�>.�<�=	��>�?	��>�� +
�@.�B.�@�A	��B�C	��<=>?@ABC........�@��9�?<�(38,$9 �
�9��99�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!!!	U**#9�ooO��%�OppON9"**�?%_�������{(:*"9pPOq%�p�o6!':*$��T��T     	��
�  ; ? c � �V/�Oͳ
OV+�ͳOV+�Ͱ"/�9Ͱ3/�(��d/�ְͰ�?+�>ͳ=>?+�<Ͱ</�=ͳ6=<+�&Ͱ>�R+�SͰS�Y+�Kͱe+�6�>�� +
�<.�>.�<�=	��>�?	��<=>?....�@��9�?<�(38,$9�>&�@9�YS�FOC]$9�K�AB99 �V�K9�
�9�O�99�� 9�9"�%9�3�/9�(�&,99013!2#"'&#"2654&#!"53!264&#"327632#!"!!!7!5>54.#"34632	U**#9�ooO��%�OppON9"**�?%_�����+�y xRf>,\�V���F@0/Fb�"1{(:*"9pPOq%�p�o6!':*$��T���0"<?a:Yx2��<R3!4:0DLn:    ��
��   * 8 I n { � � � �7 �  +�Ͳz  +�sͰ /�(ͰY/�_ͳ_Y+�Ͱ6/��3�/Ͱ�2�f/�OͲfO
+�@fm	+��/�����/�+ְ3Ͱ3�J+�iͰi�o+�|2�wͰ�2�w�c+�TͲcT
+�@c]	+��Tc+��3��Ͱ�2�T��+��ͱ�+�3+�99�J�=E99�i�B99�o�$999�w�X\O`f$9�c�a9��T����999 � ���99�(s�$�999�Y��9���9�_� 99�/6�Tci999�Of�E�99���9B��$9���=�99013!2654&#!"3!264&#!"3!2654&#!"476;2+"&47632#"/&5>32#"&=4;>54&#"+"54632"&5462"&47632/&4?632#"&476;2+"&'�%32&�&6$&�&66&�&5�6(�&22&�(6$�%22%�&61$#�3&'����pΕX�����ݜ��z�4&'45L45J65L4L%'�@@��#&5�#$1�"�%88%�%2�&5&%33�K'6J33&&22&(34~&6L56$�'&3��Q���Y��p����ݛ��Е	���&44&�'65q�&56%�%11��%�J22��(�6%(�3��%7J65      G� i � � � �g  +�Ͳ*_�222�g  +�nͰ�/����/�ְjͲj
+�@ 	+�j+�nͰj�o+�*Ͱ*�++��Ͱ���+�_ͱ�+�*o�p��999�+�1399���y�999��@	!5Sw#��~$9�_�9 ��n@
#.<^,���$901546;&'&5767676!2!&'&67%72532767;;;;3222/32#!"&!67676767'&76767&#"'.7676766767&'&#"!'%+""ab����������]#,mE94
7V����\ZW1)5��5!f#$�P$� "(8su���	$e	�������ĝ�[�F	+0?����֗�QX����A&it���ꧪX\#Ka*>4Be$Gf%�hd���)5��6��&&%xr��`��~�N7&I:R/ G]�-�eO1)/&RR������x�   �0  E �/� 3�Dͱ&C22�F/�G+�6�?�9 +
�C.�B�������{�/ +
���	��<��;��?z�� +
�<;�;�:������>x� +
�3�2��������� +
�32�2���,�����2�2+���� +�,�+,+�+, � �#9 @	+,23:;<B.................@	+,23:;<BC..................�@ 013!2673267;>767!264&#!".'&..'&!"$>"`�!"�o�L.$�($$��!YM %�|%i� #����2#2�������!�#2$���!�CQ��;�j    ��[�  x " �/�Ͱp/�#��y/�z+ �#p�Xr99017463563#%#.&7676723&'&'&76767676767676'4767676747!.'&'&'&>,|
,>>,��,>Y	&
#!6*K50
,4a;k'
$Ga*Y0M$
		((	$
�m
+-0CD00BCwD^0bG9456SnV{TK>NS2@\]TJ:A]=SXhP?dVILD,}T"-.;25<=.(&=+)P22  �y_   L h 8 �i/�>ְ8Ͳ8>
+�@8.	+�>8
+�@>!	+�j+�8>�6MNR$9 01&7676767676;!"&467>3232#"&5465#"&547&'#. &>732#!>.�
"FLg�2K,&<@,(Vf~c2��.aK�]Z�\�EM-
H38('8.D&CW{�(,��"8��%<>nM+Q,*
34K>,Drs�I2bPM96!KJuYtoYsQY?,o
1E (67'D.&/{�4?&9"����+31"G<WQb`[H    �   ; 2 �9  +�13�%Ͱ*2�</� ְͱ=+� �!99 �%9�490146$; 2#67$ '#&4763!6!2#!"'%#!"&{� �}!�[?�Q��������Y�@.KQ'+==+�������+=��|`���l��w�8\���������".8��;*+>��>     ��� " < / �:  +�43�'Ͱ.2�+  +�=/� ְͱ>+� �!#99 0146$;2#67$ '#&4763!2%63!2#!'!"&{� �}P��e[@�Q��������Y�@ +W� �`+==+��������+=��|`g��Sl��w�8\��������� * ��<V=��/=     �S�� U e � �H/�,3=333�YͲYH
+�@Y	+�b/�Ͱ�SͰ2�/�%3����/�QְVͲVQ
+�@V		+�QV
+�@Q 	+�JVQ+�EͰV�@+�;Ͱ;�+�&Ͳ&
+�@&"	+�&
+�@	+�&�1 ��6Ͱ6/�1ͳu&+�pͰp/�uͱ�+�VJ�L9�E�CH]999�;@�9B$9�6�f99��48hk$9�p��9�u�n9�&�3�99�1�/|~�$9 �YH�+.8BPQ$9�b�&'$9015463!2+3>23.=46;232!#"&547#"&547#"&547.=##"&;26=4&+"2654&532654'673>54&'.#"#")/�C\B�#�!�,?��L�k�~�'4-�0"�"./!�"0�28 4%':("00?YF6jCAdBb�""�->>-j!!""!!��@,����D*/a��a/*,-a��a/*/*a��a.,<(\P�k"//"�!/0 �B- Q$1'(1"#Y?6T@TP@S    ��S     �/� ְͱ+ 013nJ���%���v      ��S    	  �
/� ְͱ+ 0137	nJ��e���%����v��v    ��^     @ �/�Ͱ/�Ͱ2�
+�@ 	+�/� ְͰ�+�Ͱ�	+�ͱ+ 013!%!!yU��l��j��%��e��@�    ��^       X �/�Ͱ/�Ͱ/�Ͱ/�	Ͱ2�	
+�@ 	+�/� ְͰ�+�2�Ͱ2��+�2�Ͱ
2�+ 013!!!!!!yU��p��l��j��j��%��H��@��@��          C �  +�Ͳ  +���/�ְͰ�+�	ͱ+��$9 ��99016$  $&6 54$z�8�zz�������������@���e8�zz��������zz�a\����
�-|��(�         C �  +�Ͳ  +���/�ְͰ�+�	ͱ+��$9 ��99016$  $&6$54$z�8�zz��������Ę��������e8�zz��������zz�ee������+��0�          C �  +�Ͳ  +���/�ְͰ�+�	ͱ+��$9 ��99016$  $&>54$z�8�zz��������������c���e8�zz��������zz�fq����%�
t����5�           D �  +�Ͱ/���/�ְͰ�+�	ͱ+��$9 ��	 $9016$  $&>54$z�8�zz���������l���g���e8�zz��������zz�g�����>�r����7�           D �  +�Ͱ/���/�ְͰ�+�	ͱ+��$9 ��	 $9016$  $&>54$z�8�zz��������������j���e8�zz��������zz�g�����V��p����:�        L �  +�Ͱ/���/�ְͰ�+�	ͱ+��$9��99 ��	 $9016$  $&>.z�8�zz���������~y���lm��e8�zz��������zz�g�����n��m����m         I �  +�Ͱ/���/�ְͰ�+�	ͱ+��99��99 ��	 $9016$  $&32>54.+z�8�zz��������y���mm���e8�zz��������zz��m������m        I �  +�Ͱ/��� /�ְͰ�+�	ͱ!+��99��99 ��	 $9016$  $&32>54.+z�8�zz��������T���mm���We8�zz��������zz���z��m������m��       ! D �  +�Ͱ/���"/�ְͰ�+�	ͱ#+��$9 ��	 $9016$  $&32>54.#"z�8�zz�������������mm����e8�zz��������zz���W��m������m��          % B �  +�Ͱ!/���&/� ְͰ�+�	ͱ'+��999 �!�	 999014$32 $&%232$>54.#"�bМ�zz��������z��
� ��mm���%o��b�z��������zz���9�m������m}��       % > �  +�Ͱ!/���&/� ְͰ�+�
ͱ'+��99 �!�
 990146$32#"$&%32>54$#"z����zz��㝜���zp0-4���m��ú.#����zz��㝜���zz���!�m� ���=�m��          % > �  +�Ͱ!/���&/� ְͰ�+�
ͱ'+��99 �!�
 990146$32#"$&%32>54$#"z����zz��㝜���zSKT���m��úF8����zz��㝜���zz����m� ���=�`��          - > �  +�Ͱ%/���./� ְͰ�!+�
ͱ/+�!�99 �%�
 990146$32#"$&732>54$#"z����zz��㝜���z�:`�mEJ���m��úWGZ�[?��zz��㝜���zz��P��~�5m� ���=�+enop        & > �  +�Ͱ"/���'/� ְͰ�+�
ͱ(+��99 �"�
 990146$32#"$&732>54$#"z����zz��㝜���zRm� �����m��ú���m��zz��㝜���zz�����mm� ���=�m��       $ D �
  +�Ͱ /���%/�ְͰ�+�ͱ&+��	
$9 � � $901$  $327>54.'&#"�b�a�����^��}n� ��XDU~I-)V�c)S���m1�a�����^����3���n-|���O_���8	l��       & D �  +�Ͱ"/���'/�ְͰ�+�	ͱ(+��$9 �"�	 $9016$  $&327>54.'&#"z�8�zz��������(m���%-_�@?�s*���me8�zz��������zz�����m:���e���Om��         % D �  +�Ͱ!/���&/�ְͰ�+�	ͱ'+��$9 �!�	 $9016$  $&327>54'&#"z�8�zz��������(m���"Pl5�����me8�zz��������zz�����m>���e�m|m��       # D �  +�Ͱ/���$/�ְͰ�+�	ͱ%+��$9 ��	 $9016$  $&;>54'#"z�8�zz��������(m���=S(dk���me8�zz��������zz�����mB���d�g�m��         " D �  +�Ͱ/���#/�ְͰ�+�	ͱ$+��$9 ��	 $9016$  $&32765&#"z�8�zz��������(m���O9����me8�zz��������zz�����m�V��m��         I �  +�Ͱ/��� /�ְͰ�+�	ͱ!+��99�	�99 ��	 $9016$  $&;#"z�8�zz��������(m���EF���me8�zz��������zz�����m ���'m��        I �  +�Ͱ/���/�ְͰ�+�	ͱ+��99�	�99 ��	 $9016$  $&;#"z�8�zz��������(m������me8�zz��������zz�����m]m��           L �  +�Ͱ/��� /�ְͰ�+�	ͱ!+��99�	�$9 ��	 $9016$  $&;#"z�8�zz��������(m���<>���me8�zz��������zz�����m�[Sm��         L �  +�Ͱ/���/�ְͰ�+�	ͱ+��99�	�$9 ��	 $9016$  $&&"z�8�zz��������(l���w{���e8�zz��������zz�D����n��r<n�          D �  +�Ͱ/���/�ְͰ�+�	ͱ+�	�$9 ��	 $9016$  $&&47z�8�zz��������(i����^V��˴e8�zz��������zz�����o���d����          : �/�Ͳ
+�@	+�/�ְͰ�+�	ͱ +�	�$9 016$  $&&547z�8�zz��������(g��g~p��аe8�zz��������zz�����rzX��i���         C �  +�Ͳ  +��� /�ְͰ�+�	ͱ!+�	�$9 ��99016$  $&&547z�8�zz��������(_��������be8�zz��������zz����wjX��mku��         C �  +�Ͳ  +���/�ְͰ�+�	ͱ +�	�$9 ��99016$  $& .547z�8�zz��������(I�g�O#̳���e8�zz��������zz�����)3���r�mc���        �  +�
��/�+�ͱ+ 01 $$ �b�a�����^����^����b�a��    �A�X_<�      ��S8    ��S8���Z=�             ��2  <���H=                �� D    �  �  �  b  �  b  �  �  1  v  v    �   |  �  1  ;  6  !  3  <  D  4  E  E  =  4  0  0  	�  �  C  ;  	|  	�  	B  
Q  �  �  �  �  �  �  �  �  �  �  �  
  
�  	  	  	  	  	  	  	  	  	  	  �  	�  
y  �  �  �  	  	  �  �  �  ����  �  `  �  �  �  �  �  �  �  r  	  d  8  ` (
H  �  [  9 S  	�  
5  
  =    =  �  �  � �  �  �      �        d  �  0  �  	  C  C  	  C  �  	  �  V  �  	  J 6  ! vI    V  ���� ���	5  	���	�  �  	�  �  � D  	  ����                              �n&��J                              C  �  	  	  �  e 	� 	u 	a 	k 	n 	x 	� 	i 	U 		� 	� 	
 	
� F     \ n    �  S  �  ]          �                                                       , , , , , , , , , , , , , , , , , , 4��p�	^
�XL���N����h��. n!�#�$�%�'�(�)*p+~-F.@/�1*2�4�6`7�9|:�;$<T=2=�?x@NA�B�DFPG�H�JZK�LFMM�N�O4OtO�O�P`Q�R4RbS�TdT�UUDU�V0WjX�YYFY�[4[l[�\\�]]�^^|^�_p`4azb�d e�ghh�jjl<mtn�pHq�q�r�t^t�u>u�v�wLw~xNy
y>z
{:{�|�}�<܀ڂ��|����
���*���6���6���R�ڊ`�����@�h�����΋��@�l���Č��B�l�����ލ���@�d�����ޏV�ڒ��,�L��Ƙ~�h�v�X�6�4�����������ڦا��T�ΩF�����ҫ�f����x�ԭ.����B����f�Ȱ0����T����v�Գ.����H�����X��    �X            o        �  	   �    	   �  	     	  >  	  *L  	  xv  	  (�  	 	 J  	  \`  	 � �  	 � 0�  	 �   	 �   	�  W e a t h e r   I c o n s   l i c e n s e d   u n d e r   S I L   O F L   1 . 1      C o d e   l i c e n s e d   u n d e r   M I T   L i c e n s e      D o c u m e n t a t i o n   l i c e n s e d   u n d e r   C C   B Y   3 . 0 W e a t h e r   I c o n s R e g u l a r 1 . 1 0 0 ; U K W N ; W e a t h e r I c o n s - R e g u l a r W e a t h e r   I c o n s   R e g u l a r V e r s i o n   1 . 1 0 0 ; P S   0 0 1 . 1 0 0 ; h o t c o n v   1 . 0 . 7 0 ; m a k e o t f . l i b 2 . 5 . 5 8 3 2 9 W e a t h e r I c o n s - R e g u l a r E r i k   F l o w e r s ,   L u k a s   B i s c h o f f   ( v 1   A r t ) h t t p : / / w w w . h e l l o e r i k . c o m ,   h t t p : / / w w w . a r t i l l . d e W e b f o n t   1 . 0 T u e   A u g   1 8   1 7 : 2 5 : 1 2   2 0 1 5 d e f a u l t p e r s e u s F o n t   S q u i r r e l         �� 9                     �   	
 !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~�����������������������������������������������������������������������������������������������������������������������glyph1glyph2uni00A0uni2000uni2001uni2002uni2003uni2004uni2005uni2006uni2007uni2008uni2009uni200Auni202Funi205Funi25FCuniF000uniF001uniF002uniF003uniF004uniF005uniF006uniF007uniF008uniF009uniF00AuniF00BuniF00CuniF00DuniF00EuniF010uniF011uniF012uniF013uniF014uniF015uniF016uniF017uniF018uniF019uniF01AuniF01BuniF01CuniF01DuniF01EuniF021uniF022uniF023uniF024uniF025uniF026uniF027uniF028uniF029uniF02AuniF02BuniF02CuniF02DuniF02EuniF02FuniF030uniF031uniF032uniF033uniF034uniF035uniF036uniF037uniF038uniF039uniF03AuniF03BuniF03CuniF03DuniF03EuniF040uniF041uniF042uniF043uniF044uniF045uniF046uniF047uniF048uniF049uniF04AuniF04BuniF04CuniF04DuniF04EuniF050uniF051uniF052uniF053uniF054uniF055uniF056uniF057uniF058uniF059uniF05AuniF05BuniF05CuniF05DuniF05EuniF060uniF061uniF062uniF063uniF064uniF065uniF066uniF067uniF068uniF069uniF06AuniF06BuniF06CuniF06DuniF06EuniF070uniF071uniF072uniF073uniF074uniF075uniF076uniF077uniF078uniF079uniF07AuniF07BuniF07CuniF07DuniF07EuniF080uniF081uniF082uniF083uniF084uniF085uniF086uniF087uniF088uniF089uniF08AuniF08BuniF08CuniF08DuniF08EuniF08FuniF090uniF091uniF092uniF093uniF094uniF095uniF096uniF097uniF098uniF099uniF09AuniF09BuniF09CuniF09DuniF09EuniF09FuniF0A0uniF0A1uniF0A2uniF0A3uniF0A4uniF0A5uniF0A6uniF0A7uniF0A8uniF0A9uniF0AAuniF0ABuniF0ACuniF0ADuniF0AEuniF0AFuniF0B0uniF0B1uniF0B2uniF0B3uniF0B4uniF0B5uniF0B6uniF0B7uniF0B8uniF0B9uniF0BAuniF0BBuniF0BCuniF0BDuniF0BEuniF0BFuniF0C0uniF0C1uniF0C2uniF0C3uniF0C4uniF0C5uniF0C6uniF0C7uniF0C8uniF0C9uniF0CAuniF0CBuniF0CCuniF0CDuniF0CEuniF0CFuniF0D0uniF0D1uniF0D2uniF0D3uniF0D4uniF0D5uniF0D6uniF0D7uniF0D8uniF0D9uniF0DAuniF0DBuniF0DCuniF0DDuniF0DEuniF0DFuniF0E0uniF0E1uniF0E2uniF0E3uniF0E4uniF0E5uniF0E6uniF0E7uniF0E8uniF0E9uniF0EAuniF0EB  ����� K�PX��Y�F+X!�YK�RX!��Y�+\XY�+   UӢ�                                                                                                                                                                                                                                                                                      ��>�>H��J/�l���^d�Q�^��c�4-���y
�i�k�S3s�0F�tR*Z&����Zǣ
A��M��-!��4����B�0���p~� Z`6-~�M�}��r1{��w!Z�E����$0���w�;e�X9J��}��8m��������&d�H4���|������R����z���?'E޴�C+�0�$�|�]�	���պ�6eg�Q�;���+�Dd�Aw���#ƫq{�Y�)8p?L�H��3�8J�-.�N�F��ql����Ӕ�2o4@���p�=ևb�<�ߖ���;�D
hgy�ڹV~#%1�����BW��t>6��h�*���/��H{9����g�pO�2��)�r͆� ��.�O9�3o���U�:ߞqˆa�{�/yox�ߖŒI4�W��Ej��(�#P*�Ol���DZCJx��������Ȕ���
4��W�����={���$W��*t0.�A(Zӿ�V3aLKX*H�j��^�����f����я��oq^�]o�+bp���m�E�-����7%�e#sU@����6gU'���VQ;��[d,�7(P�^X���"�>5%��/��|���w�Xe[���,�v�~����*QoB۴���j�+��	Iп�Đ I�S�q���'Q݄�w�p�1�Ր���id��|Xo�hXv74Tr�ܢ�\����7 ��L���<R@���?:F!v-�n]�q����F��K���RB��S��9�t��*��=�ÔtH���Fݭ8x���2u��̊/���ϼ�#�Mh��J������d�u��!���!�x�s�0;��5�`�`8#�斬�g}B!�3��!;�>v� w�����ES]�!�`�@���W�ǆ�ι�hAu���ԁ�&ƞ؅A�/2�CP��7N���--�� ��6$����M��q��g��%�$:\��Ii.F�!Z����qFDH�ڏ��ds�h���K�� �#*�SHřF�Z~*�
��q���{���|�u�c���2�`[d;TQ��ႇ���Q�O�Ӑ�$x8)��w��x{fkI����s��쇲�C�R8��5?]����z��7k�/������5�)��j���~q��c��ðr�;��x�-&�{����[xc�b=�U��fo��|%��������|nF�����=�㷫��Eb����[�j��D6-X��R��h�x���>W�E11�ǅ�ڇ�=2�薗K_W+-P�f���։r?�,�M�T�w1�����h�J��r�8���Z4�|���w�T�2��b)�Z
6�}��̼q[�Q����q�u7$����N,_��ՠ���?��dyGr������$�V�7�g�Z���5Ƙe���)��tC���]�a����nW�o����a8aX�J�\ϔHs�LBD���8�Bg�=R������)��_��wۭ��"��7��Y�k��Oݶ}W������,�+"�2�-��<��v�`EӔE�f��v������^x�5���H����6mkbp0���W�����%'�f�#9�6�U� ��E�c��v�*����LO4���9�� 2WL��8̗d�cňh�*L�Q&\�G�����$n������P�D ;bƌ�4A�[ӊ�Ş�[\l�}��c0��O��Ӯ��%�>���� ��(ym�/�``f���JqL��ڊ���Q��r���Ms̩��|���G��Z�1)�v����6rǎ�0��?�߹[v���J���w@�;H����6�:"�6nEɼ"���~�mt�n���x�!`�ՠ���99��/�?S"�5�Sמ��̸�\�u}%�Z}��*\/���
��`4�Ţ6�C���bl���%ĺ~�A��6wA�U��q~L��5��������';~(���J$�$\
y<����5��k�6W6/ݼ\�`A����u��,\0�jx���M�3.������&�
zn����I{W�L���(��P�<=`z�:�=��������b�f�tz��b�$:Z�/$��sb@/�ꛃ;���$��l	�gj�9�LѪU�rЁj�.�$�gQp�
�[��I\n}]���{���1���9T2��x*��$�9�|?��e��޵U׉�EŻ�N��d�b��֝͟W�%xn-9���0#�
��d�K��y��D�3����GD�$TVٖei\�M��$�Q�˶����S)LR�C��,/�����g�7F�
���-�,*�"����u���?�)��\�4c��5֦�)i_@5}�J�x�՗F�Q�3>$k�Sh�YЫp�o��P���Ǩ�]&��iL��
��	������֘0Җ��q��!��̺�e䚁���J��:*�12Jgx����j8Oa@O�zS����� �=D�n�j��k�:I\DE�o^�fJ���,��}J�
��� u��um����#��5=�~<���32���KD<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
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