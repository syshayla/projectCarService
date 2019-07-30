/*!
* inputmask.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2017 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.3.11
*/

!function(factory) {
    "function" == typeof define && define.amd ? define([ "./dependencyLibs/inputmask.dependencyLib", "./global/window", "./global/document" ], factory) : "object" == typeof exports ? module.exports = factory(require("./dependencyLibs/inputmask.dependencyLib"), require("./global/window"), require("./global/document")) : window.Inputmask = factory(window.dependencyLib || jQuery, window, document);
}(function($, window, document, undefined) {
    function Inputmask(alias, options, internal) {
        if (!(this instanceof Inputmask)) return new Inputmask(alias, options, internal);
        this.el = undefined, this.events = {}, this.maskset = undefined, this.refreshValue = !1, 
        !0 !== internal && ($.isPlainObject(alias) ? options = alias : (options = options || {}).alias = alias, 
        this.opts = $.extend(!0, {}, this.defaults, options), this.noMasksCache = options && options.definitions !== undefined, 
        this.userOptions = options || {}, this.isRTL = this.opts.numericInput, resolveAlias(this.opts.alias, options, this.opts));
    }
    function resolveAlias(aliasStr, options, opts) {
        var aliasDefinition = Inputmask.prototype.aliases[aliasStr];
        return aliasDefinition ? (aliasDefinition.alias && resolveAlias(aliasDefinition.alias, undefined, opts), 
        $.extend(!0, opts, aliasDefinition), $.extend(!0, opts, options), !0) : (null === opts.mask && (opts.mask = aliasStr), 
        !1);
    }
    function generateMaskSet(opts, nocache) {
        function generateMask(mask, metadata, opts) {
            var regexMask = !1;
            if (null !== mask && "" !== mask || ((regexMask = null !== opts.regex) ? mask = (mask = opts.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (regexMask = !0, 
            mask = ".*")), 1 === mask.length && !1 === opts.greedy && 0 !== opts.repeat && (opts.placeholder = ""), 
            opts.repeat > 0 || "*" === opts.repeat || "+" === opts.repeat) {
                var repeatStart = "*" === opts.repeat ? 0 : "+" === opts.repeat ? 1 : opts.repeat;
                mask = opts.groupmarker.start + mask + opts.groupmarker.end + opts.quantifiermarker.start + repeatStart + "," + opts.repeat + opts.quantifiermarker.end;
            }
            var masksetDefinition, maskdefKey = regexMask ? "regex_" + opts.regex : opts.numericInput ? mask.split("").reverse().join("") : mask;
            return Inputmask.prototype.masksCache[maskdefKey] === undefined || !0 === nocache ? (masksetDefinition = {
                mask: mask,
                maskToken: Inputmask.prototype.analyseMask(mask, regexMask, opts),
                validPositions: {},
                _buffer: undefined,
                buffer: undefined,
                tests: {},
                metadata: metadata,
                maskLength: undefined
            }, !0 !== nocache && (Inputmask.prototype.masksCache[maskdefKey] = masksetDefinition, 
            masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[maskdefKey]))) : masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[maskdefKey]), 
            masksetDefinition;
        }
        if ($.isFunction(opts.mask) && (opts.mask = opts.mask(opts)), $.isArray(opts.mask)) {
            if (opts.mask.length > 1) {
                opts.keepStatic = null === opts.keepStatic || opts.keepStatic;
                var altMask = opts.groupmarker.start;
                return $.each(opts.numericInput ? opts.mask.reverse() : opts.mask, function(ndx, msk) {
                    altMask.length > 1 && (altMask += opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start), 
                    msk.mask === undefined || $.isFunction(msk.mask) ? altMask += msk : altMask += msk.mask;
                }), altMask += opts.groupmarker.end, generateMask(altMask, opts.mask, opts);
            }
            opts.mask = opts.mask.pop();
        }
        return opts.mask && opts.mask.mask !== undefined && !$.isFunction(opts.mask.mask) ? generateMask(opts.mask.mask, opts.mask, opts) : generateMask(opts.mask, opts.mask, opts);
    }
    function maskScope(actionObj, maskset, opts) {
        function getMaskTemplate(baseOnInput, minimalPos, includeMode) {
            minimalPos = minimalPos || 0;
            var ndxIntlzr, test, testPos, maskTemplate = [], pos = 0, lvp = getLastValidPosition();
            do {
                !0 === baseOnInput && getMaskSet().validPositions[pos] ? (test = (testPos = getMaskSet().validPositions[pos]).match, 
                ndxIntlzr = testPos.locator.slice(), maskTemplate.push(!0 === includeMode ? testPos.input : !1 === includeMode ? test.nativeDef : getPlaceholder(pos, test))) : (test = (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1)).match, 
                ndxIntlzr = testPos.locator.slice(), (!1 === opts.jitMasking || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && maskTemplate.push(!1 === includeMode ? test.nativeDef : getPlaceholder(pos, test))), 
                pos++;
            } while ((maxLength === undefined || pos < maxLength) && (null !== test.fn || "" !== test.def) || minimalPos > pos);
            return "" === maskTemplate[maskTemplate.length - 1] && maskTemplate.pop(), getMaskSet().maskLength = pos + 1, 
            maskTemplate;
        }
        function getMaskSet() {
            return maskset;
        }
        function resetMaskSet(soft) {
            var maskset = getMaskSet();
            maskset.buffer = undefined, !0 !== soft && (maskset.validPositions = {}, maskset.p = 0);
        }
        function getLastValidPosition(closestTo, strict, validPositions) {
            var before = -1, after = -1, valids = validPositions || getMaskSet().validPositions;
            closestTo === undefined && (closestTo = -1);
            for (var posNdx in valids) {
                var psNdx = parseInt(posNdx);
                valids[psNdx] && (strict || !0 !== valids[psNdx].generatedInput) && (psNdx <= closestTo && (before = psNdx), 
                psNdx >= closestTo && (after = psNdx));
            }
            return -1 !== before && closestTo - before > 1 || after < closestTo ? before : after;
        }
        function stripValidPositions(start, end, nocheck, strict) {
            var i, startPos = start, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), needsValidation = !1;
            for (getMaskSet().p = start, i = end - 1; i >= startPos; i--) getMaskSet().validPositions[i] !== undefined && (!0 !== nocheck && (!getMaskSet().validPositions[i].match.optionality && function(pos) {
                var posMatch = getMaskSet().validPositions[pos];
                if (posMatch !== undefined && null === posMatch.match.fn) {
                    var prevMatch = getMaskSet().validPositions[pos - 1], nextMatch = getMaskSet().validPositions[pos + 1];
                    return prevMatch !== undefined && nextMatch !== undefined;
                }
                return !1;
            }(i) || !1 === opts.canClearPosition(getMaskSet(), i, getLastValidPosition(), strict, opts)) || delete getMaskSet().validPositions[i]);
            for (resetMaskSet(!0), i = startPos + 1; i <= getLastValidPosition(); ) {
                for (;getMaskSet().validPositions[startPos] !== undefined; ) startPos++;
                if (i < startPos && (i = startPos + 1), getMaskSet().validPositions[i] === undefined && isMask(i)) i++; else {
                    var t = getTestTemplate(i);
                    !1 === needsValidation && positionsClone[startPos] && positionsClone[startPos].match.def === t.match.def ? (getMaskSet().validPositions[startPos] = $.extend(!0, {}, positionsClone[startPos]), 
                    getMaskSet().validPositions[startPos].input = t.input, delete getMaskSet().validPositions[i], 
                    i++) : positionCanMatchDefinition(startPos, t.match.def) ? !1 !== isValid(startPos, t.input || getPlaceholder(i), !0) && (delete getMaskSet().validPositions[i], 
                    i++, needsValidation = !0) : isMask(i) || (i++, startPos--), startPos++;
                }
            }
            resetMaskSet(!0);
        }
        function determineTestTemplate(tests, guessNextBest) {
            for (var testPos, testPositions = tests, lvp = getLastValidPosition(), lvTest = getMaskSet().validPositions[lvp] || getTests(0)[0], lvTestAltArr = lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation].toString().split(",") : [], ndx = 0; ndx < testPositions.length && (!((testPos = testPositions[ndx]).match && (opts.greedy && !0 !== testPos.match.optionalQuantifier || (!1 === testPos.match.optionality || !1 === testPos.match.newBlockMarker) && !0 !== testPos.match.optionalQuantifier) && (lvTest.alternation === undefined || lvTest.alternation !== testPos.alternation || testPos.locator[lvTest.alternation] !== undefined && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAltArr))) || !0 === guessNextBest && (null !== testPos.match.fn || /[0-9a-bA-Z]/.test(testPos.match.def))); ndx++) ;
            return testPos;
        }
        function getTestTemplate(pos, ndxIntlzr, tstPs) {
            return getMaskSet().validPositions[pos] || determineTestTemplate(getTests(pos, ndxIntlzr ? ndxIntlzr.slice() : ndxIntlzr, tstPs));
        }
        function getTest(pos) {
            return getMaskSet().validPositions[pos] ? getMaskSet().validPositions[pos] : getTests(pos)[0];
        }
        function positionCanMatchDefinition(pos, def) {
            for (var valid = !1, tests = getTests(pos), tndx = 0; tndx < tests.length; tndx++) if (tests[tndx].match && tests[tndx].match.def === def) {
                valid = !0;
                break;
            }
            return valid;
        }
        function getTests(pos, ndxIntlzr, tstPs) {
            function resolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) {
                function handleMatch(match, loopNdx, quantifierRecurse) {
                    function isFirstMatch(latestMatch, tokenGroup) {
                        var firstMatch = 0 === $.inArray(latestMatch, tokenGroup.matches);
                        return firstMatch || $.each(tokenGroup.matches, function(ndx, match) {
                            if (!0 === match.isQuantifier && (firstMatch = isFirstMatch(latestMatch, tokenGroup.matches[ndx - 1]))) return !1;
                        }), firstMatch;
                    }
                    function resolveNdxInitializer(pos, alternateNdx, targetAlternation) {
                        var bestMatch, indexPos;
                        if (getMaskSet().validPositions[pos - 1] && targetAlternation && getMaskSet().tests[pos]) for (var vpAlternation = getMaskSet().validPositions[pos - 1].locator, tpAlternation = getMaskSet().tests[pos][0].locator, i = 0; i < targetAlternation; i++) if (vpAlternation[i] !== tpAlternation[i]) return vpAlternation.slice(targetAlternation + 1);
                        return (getMaskSet().tests[pos] || getMaskSet().validPositions[pos]) && $.each(getMaskSet().tests[pos] || [ getMaskSet().validPositions[pos] ], function(ndx, lmnt) {
                            var alternation = targetAlternation !== undefined ? targetAlternation : lmnt.alternation, ndxPos = lmnt.locator[alternation] !== undefined ? lmnt.locator[alternation].toString().indexOf(alternateNdx) : -1;
                            (indexPos === undefined || ndxPos < indexPos) && -1 !== ndxPos && (bestMatch = lmnt, 
                            indexPos = ndxPos);
                        }), bestMatch ? bestMatch.locator.slice((targetAlternation !== undefined ? targetAlternation : bestMatch.alternation) + 1) : targetAlternation !== undefined ? resolveNdxInitializer(pos, alternateNdx) : undefined;
                    }
                    if (testPos > 1e4) throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet().mask;
                    if (testPos === pos && match.matches === undefined) return matches.push({
                        match: match,
                        locator: loopNdx.reverse(),
                        cd: cacheDependency
                    }), !0;
                    if (match.matches !== undefined) {
                        if (match.isGroup && quantifierRecurse !== match) {
                            if (match = handleMatch(maskToken.matches[$.inArray(match, maskToken.matches) + 1], loopNdx)) return !0;
                        } else if (match.isOptional) {
                            var optionalToken = match;
                            if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) {
                                if (latestMatch = matches[matches.length - 1].match, !isFirstMatch(latestMatch, optionalToken)) return !0;
                                insertStop = !0, testPos = pos;
                            }
                        } else if (match.isAlternator) {
                            var maltMatches, alternateToken = match, malternateMatches = [], currentMatches = matches.slice(), loopNdxCnt = loopNdx.length, altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
                            if (-1 === altIndex || "string" == typeof altIndex) {
                                var amndx, currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr = [];
                                if ("string" == typeof altIndex) altIndexArr = altIndex.split(","); else for (amndx = 0; amndx < alternateToken.matches.length; amndx++) altIndexArr.push(amndx);
                                for (var ndx = 0; ndx < altIndexArr.length; ndx++) {
                                    if (amndx = parseInt(altIndexArr[ndx]), matches = [], ndxInitializer = resolveNdxInitializer(testPos, amndx, loopNdxCnt) || ndxInitializerClone.slice(), 
                                    !0 !== (match = handleMatch(alternateToken.matches[amndx] || maskToken.matches[amndx], [ amndx ].concat(loopNdx), quantifierRecurse) || match) && match !== undefined && altIndexArr[altIndexArr.length - 1] < alternateToken.matches.length) {
                                        var ntndx = $.inArray(match, maskToken.matches) + 1;
                                        maskToken.matches.length > ntndx && (match = handleMatch(maskToken.matches[ntndx], [ ntndx ].concat(loopNdx.slice(1, loopNdx.length)), quantifierRecurse)) && (altIndexArr.push(ntndx.toString()), 
                                        $.each(matches, function(ndx, lmnt) {
                                            lmnt.alternation = loopNdx.length - 1;
                                        }));
                                    }
                                    maltMatches = matches.slice(), testPos = currentPos, matches = [];
                                    for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
                                        var altMatch = maltMatches[ndx1], dropMatch = !1;
                                        altMatch.alternation = altMatch.alternation || loopNdxCnt;
                                        for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
                                            var altMatch2 = malternateMatches[ndx2];
                                            if ("string" != typeof altIndex || -1 !== $.inArray(altMatch.locator[altMatch.alternation].toString(), altIndexArr)) {
                                                if (function(source, target) {
                                                    return source.match.nativeDef === target.match.nativeDef || source.match.def === target.match.nativeDef || source.match.nativeDef === target.match.def;
                                                }(altMatch, altMatch2)) {
                                                    dropMatch = !0, altMatch.alternation === altMatch2.alternation && -1 === altMatch2.locator[altMatch2.alternation].toString().indexOf(altMatch.locator[altMatch.alternation]) && (altMatch2.locator[altMatch2.alternation] = altMatch2.locator[altMatch2.alternation] + "," + altMatch.locator[altMatch.alternation], 
                                                    altMatch2.alternation = altMatch.alternation), altMatch.match.nativeDef === altMatch2.match.def && (altMatch.locator[altMatch.alternation] = altMatch2.locator[altMatch2.alternation], 
                                                    malternateMatches.splice(malternateMatches.indexOf(altMatch2), 1, altMatch));
                                                    break;
                                                }
                                                if (altMatch.match.def === altMatch2.match.def) {
                                                    dropMatch = !1;
                                                    break;
                                                }
                                                if (function(source, target) {
                                                    return null === source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def, getMaskSet(), pos, !1, opts, !1);
                                                }(altMatch, altMatch2) || function(source, target) {
                                                    return null !== source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def.replace(/[\[\]]/g, ""), getMaskSet(), pos, !1, opts, !1);
                                                }(altMatch, altMatch2)) {
                                                    altMatch.alternation === altMatch2.alternation && -1 === altMatch.locator[altMatch.alternation].toString().indexOf(altMatch2.locator[altMatch2.alternation].toString().split("")[0]) && (altMatch.na = altMatch.na || altMatch.locator[altMatch.alternation].toString(), 
                                                    -1 === altMatch.na.indexOf(altMatch.locator[altMatch.alternation].toString().split("")[0]) && (altMatch.na = altMatch.na + "," + altMatch.locator[altMatch2.alternation].toString().split("")[0]), 
                                                    dropMatch = !0, altMatch.locator[altMatch.alternation] = altMatch2.locator[altMatch2.alternation].toString().split("")[0] + "," + altMatch.locator[altMatch.alternation], 
                                                    malternateMatches.splice(malternateMatches.indexOf(altMatch2), 0, altMatch));
                                                    break;
                                                }
                                            }
                                        }
                                        dropMatch || malternateMatches.push(altMatch);
                                    }
                                }
                                "string" == typeof altIndex && (malternateMatches = $.map(malternateMatches, function(lmnt, ndx) {
                                    if (isFinite(ndx)) {
                                        var alternation = lmnt.alternation, altLocArr = lmnt.locator[alternation].toString().split(",");
                                        lmnt.locator[alternation] = undefined, lmnt.alternation = undefined;
                                        for (var alndx = 0; alndx < altLocArr.length; alndx++) -1 !== $.inArray(altLocArr[alndx], altIndexArr) && (lmnt.locator[alternation] !== undefined ? (lmnt.locator[alternation] += ",", 
                                        lmnt.locator[alternation] += altLocArr[alndx]) : lmnt.locator[alternation] = parseInt(altLocArr[alndx]), 
                                        lmnt.alternation = alternation);
                                        if (lmnt.locator[alternation] !== undefined) return lmnt;
                                    }
                                })), matches = currentMatches.concat(malternateMatches), testPos = pos, insertStop = matches.length > 0, 
                                match = malternateMatches.length > 0, ndxInitializer = ndxInitializerClone.slice();
                            } else match = handleMatch(alternateToken.matches[altIndex] || maskToken.matches[altIndex], [ altIndex ].concat(loopNdx), quantifierRecurse);
                            if (match) return !0;
                        } else if (match.isQuantifier && quantifierRecurse !== maskToken.matches[$.inArray(match, maskToken.matches) - 1]) for (var qt = match, qndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max) && testPos <= pos; qndx++) {
                            var tokenGroup = maskToken.matches[$.inArray(qt, maskToken.matches) - 1];
                            if (match = handleMatch(tokenGroup, [ qndx ].concat(loopNdx), tokenGroup)) {
                                if (latestMatch = matches[matches.length - 1].match, latestMatch.optionalQuantifier = qndx > qt.quantifier.min - 1, 
                                isFirstMatch(latestMatch, tokenGroup)) {
                                    if (qndx > qt.quantifier.min - 1) {
                                        insertStop = !0, testPos = pos;
                                        break;
                                    }
                                    return !0;
                                }
                                return !0;
                            }
                        } else if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) return !0;
                    } else testPos++;
                }
                for (var tndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; tndx < maskToken.matches.length; tndx++) if (!0 !== maskToken.matches[tndx].isQuantifier) {
                    var match = handleMatch(maskToken.matches[tndx], [ tndx ].concat(loopNdx), quantifierRecurse);
                    if (match && testPos === pos) return match;
                    if (testPos > pos) break;
                }
            }
            function filterTests(tests) {
                if (opts.keepStatic && pos > 0 && tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0) && !0 !== tests[0].match.optionality && !0 !== tests[0].match.optionalQuantifier && null === tests[0].match.fn && !/[0-9a-bA-Z]/.test(tests[0].match.def)) {
                    if (getMaskSet().validPositions[pos - 1] === undefined) return [ determineTestTemplate(tests) ];
                    if (getMaskSet().validPositions[pos - 1].alternation === tests[0].alternation) return [ determineTestTemplate(tests) ];
                    if (getMaskSet().validPositions[pos - 1]) return [ determineTestTemplate(tests) ];
                }
                return tests;
            }
            var latestMatch, maskTokens = getMaskSet().maskToken, testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr ? ndxIntlzr.slice() : [ 0 ], matches = [], insertStop = !1, cacheDependency = ndxIntlzr ? ndxIntlzr.join("") : "";
            if (pos > -1) {
                if (ndxIntlzr === undefined) {
                    for (var test, previousPos = pos - 1; (test = getMaskSet().validPositions[previousPos] || getMaskSet().tests[previousPos]) === undefined && previousPos > -1; ) previousPos--;
                    test !== undefined && previousPos > -1 && (ndxInitializer = function(tests) {
                        var locator = [];
                        return $.isArray(tests) || (tests = [ tests ]), tests.length > 0 && (tests[0].alternation === undefined ? 0 === (locator = determineTestTemplate(tests.slice()).locator.slice()).length && (locator = tests[0].locator.slice()) : $.each(tests, function(ndx, tst) {
                            if ("" !== tst.def) if (0 === locator.length) locator = tst.locator.slice(); else for (var i = 0; i < locator.length; i++) tst.locator[i] && -1 === locator[i].toString().indexOf(tst.locator[i]) && (locator[i] += "," + tst.locator[i]);
                        })), locator;
                    }(test), cacheDependency = ndxInitializer.join(""), testPos = previousPos);
                }
                if (getMaskSet().tests[pos] && getMaskSet().tests[pos][0].cd === cacheDependency) return filterTests(getMaskSet().tests[pos]);
                for (var mtndx = ndxInitializer.shift(); mtndx < maskTokens.length && !(resolveTestFromToken(maskTokens[mtndx], ndxInitializer, [ mtndx ]) && testPos === pos || testPos > pos); mtndx++) ;
            }
            return (0 === matches.length || insertStop) && matches.push({
                match: {
                    fn: null,
                    cardinality: 0,
                    optionality: !0,
                    casing: null,
                    def: "",
                    placeholder: ""
                },
                locator: [],
                cd: cacheDependency
            }), ndxIntlzr !== undefined && getMaskSet().tests[pos] ? filterTests($.extend(!0, [], matches)) : (getMaskSet().tests[pos] = $.extend(!0, [], matches), 
            filterTests(getMaskSet().tests[pos]));
        }
        function getBufferTemplate() {
            return getMaskSet()._buffer === undefined && (getMaskSet()._buffer = getMaskTemplate(!1, 1), 
            getMaskSet().buffer === undefined && (getMaskSet().buffer = getMaskSet()._buffer.slice())), 
            getMaskSet()._buffer;
        }
        function getBuffer(noCache) {
            return getMaskSet().buffer !== undefined && !0 !== noCache || (getMaskSet().buffer = getMaskTemplate(!0, getLastValidPosition(), !0)), 
            getMaskSet().buffer;
        }
        function refreshFromBuffer(start, end, buffer) {
            var i, p;
            if (!0 === start) resetMaskSet(), start = 0, end = buffer.length; else for (i = start; i < end; i++) delete getMaskSet().validPositions[i];
            for (p = start, i = start; i < end; i++) if (resetMaskSet(!0), buffer[i] !== opts.skipOptionalPartCharacter) {
                var valResult = isValid(p, buffer[i], !0, !0);
                !1 !== valResult && (resetMaskSet(!0), p = valResult.caret !== undefined ? valResult.caret : valResult.pos + 1);
            }
        }
        function casing(elem, test, pos) {
            switch (opts.casing || test.casing) {
              case "upper":
                elem = elem.toUpperCase();
                break;

              case "lower":
                elem = elem.toLowerCase();
                break;

              case "title":
                var posBefore = getMaskSet().validPositions[pos - 1];
                elem = 0 === pos || posBefore && posBefore.input === String.fromCharCode(Inputmask.keyCode.SPACE) ? elem.toUpperCase() : elem.toLowerCase();
                break;

              default:
                if ($.isFunction(opts.casing)) {
                    var args = Array.prototype.slice.call(arguments);
                    args.push(getMaskSet().validPositions), elem = opts.casing.apply(this, args);
                }
            }
            return elem;
        }
        function checkAlternationMatch(altArr1, altArr2, na) {
            for (var naNdx, altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1), isMatch = !1, naArr = na !== undefined ? na.split(",") : [], i = 0; i < naArr.length; i++) -1 !== (naNdx = altArr1.indexOf(naArr[i])) && altArr1.splice(naNdx, 1);
            for (var alndx = 0; alndx < altArr1.length; alndx++) if (-1 !== $.inArray(altArr1[alndx], altArrC)) {
                isMatch = !0;
                break;
            }
            return isMatch;
        }
        function isValid(pos, c, strict, fromSetValid, fromAlternate, validateOnly) {
            function isSelection(posObj) {
                var selection = isRTL ? posObj.begin - posObj.end > 1 || posObj.begin - posObj.end == 1 : posObj.end - posObj.begin > 1 || posObj.end - posObj.begin == 1;
                return selection && 0 === posObj.begin && posObj.end === getMaskSet().maskLength ? "full" : selection;
            }
            function _isValid(position, c, strict) {
                var rslt = !1;
                return $.each(getTests(position), function(ndx, tst) {
                    for (var test = tst.match, loopend = c ? 1 : 0, chrs = "", i = test.cardinality; i > loopend; i--) chrs += getBufferElement(position - (i - 1));
                    if (c && (chrs += c), getBuffer(!0), !1 !== (rslt = null != test.fn ? test.fn.test(chrs, getMaskSet(), position, strict, opts, isSelection(pos)) : (c === test.def || c === opts.skipOptionalPartCharacter) && "" !== test.def && {
                        c: getPlaceholder(position, test, !0) || test.def,
                        pos: position
                    })) {
                        var elem = rslt.c !== undefined ? rslt.c : c;
                        elem = elem === opts.skipOptionalPartCharacter && null === test.fn ? getPlaceholder(position, test, !0) || test.def : elem;
                        var validatedPos = position, possibleModifiedBuffer = getBuffer();
                        if (rslt.remove !== undefined && ($.isArray(rslt.remove) || (rslt.remove = [ rslt.remove ]), 
                        $.each(rslt.remove.sort(function(a, b) {
                            return b - a;
                        }), function(ndx, lmnt) {
                            stripValidPositions(lmnt, lmnt + 1, !0);
                        })), rslt.insert !== undefined && ($.isArray(rslt.insert) || (rslt.insert = [ rslt.insert ]), 
                        $.each(rslt.insert.sort(function(a, b) {
                            return a - b;
                        }), function(ndx, lmnt) {
                            isValid(lmnt.pos, lmnt.c, !0, fromSetValid);
                        })), rslt.refreshFromBuffer) {
                            var refresh = rslt.refreshFromBuffer;
                            if (refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, possibleModifiedBuffer), 
                            rslt.pos === undefined && rslt.c === undefined) return rslt.pos = getLastValidPosition(), 
                            !1;
                            if ((validatedPos = rslt.pos !== undefined ? rslt.pos : position) !== position) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0, fromSetValid)), 
                            !1;
                        } else if (!0 !== rslt && rslt.pos !== undefined && rslt.pos !== position && (validatedPos = rslt.pos, 
                        refreshFromBuffer(position, validatedPos, getBuffer().slice()), validatedPos !== position)) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0)), 
                        !1;
                        return (!0 === rslt || rslt.pos !== undefined || rslt.c !== undefined) && (ndx > 0 && resetMaskSet(!0), 
                        setValidPosition(validatedPos, $.extend({}, tst, {
                            input: casing(elem, test, validatedPos)
                        }), fromSetValid, isSelection(pos)) || (rslt = !1), !1);
                    }
                }), rslt;
            }
            function setValidPosition(pos, validTest, fromSetValid, isSelection) {
                if (isSelection || opts.insertMode && getMaskSet().validPositions[pos] !== undefined && fromSetValid === undefined) {
                    var i, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), lvp = getLastValidPosition(undefined, !0);
                    for (i = pos; i <= lvp; i++) delete getMaskSet().validPositions[i];
                    getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                    var j, valid = !0, vps = getMaskSet().validPositions, needsValidation = !1, initialLength = getMaskSet().maskLength;
                    for (i = j = pos; i <= lvp; i++) {
                        var t = positionsClone[i];
                        if (t !== undefined) for (var posMatch = j; posMatch < getMaskSet().maskLength && (null === t.match.fn && vps[i] && (!0 === vps[i].match.optionalQuantifier || !0 === vps[i].match.optionality) || null != t.match.fn); ) {
                            if (posMatch++, !1 === needsValidation && positionsClone[posMatch] && positionsClone[posMatch].match.def === t.match.def) getMaskSet().validPositions[posMatch] = $.extend(!0, {}, positionsClone[posMatch]), 
                            getMaskSet().validPositions[posMatch].input = t.input, fillMissingNonMask(posMatch), 
                            j = posMatch, valid = !0; else if (positionCanMatchDefinition(posMatch, t.match.def)) {
                                var result = isValid(posMatch, t.input, !0, !0);
                                valid = !1 !== result, j = result.caret || result.insert ? getLastValidPosition() : posMatch, 
                                needsValidation = !0;
                            } else if (!(valid = !0 === t.generatedInput) && posMatch >= getMaskSet().maskLength - 1) break;
                            if (getMaskSet().maskLength < initialLength && (getMaskSet().maskLength = initialLength), 
                            valid) break;
                        }
                        if (!valid) break;
                    }
                    if (!valid) return getMaskSet().validPositions = $.extend(!0, {}, positionsClone), 
                    resetMaskSet(!0), !1;
                } else getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                return resetMaskSet(!0), !0;
            }
            function fillMissingNonMask(maskPos) {
                for (var pndx = maskPos - 1; pndx > -1 && !getMaskSet().validPositions[pndx]; pndx--) ;
                var testTemplate, testsFromPos;
                for (pndx++; pndx < maskPos; pndx++) getMaskSet().validPositions[pndx] === undefined && (!1 === opts.jitMasking || opts.jitMasking > pndx) && ("" === (testsFromPos = getTests(pndx, getTestTemplate(pndx - 1).locator, pndx - 1).slice())[testsFromPos.length - 1].match.def && testsFromPos.pop(), 
                (testTemplate = determineTestTemplate(testsFromPos)) && (testTemplate.match.def === opts.radixPointDefinitionSymbol || !isMask(pndx, !0) || $.inArray(opts.radixPoint, getBuffer()) < pndx && testTemplate.match.fn && testTemplate.match.fn.test(getPlaceholder(pndx), getMaskSet(), pndx, !1, opts)) && !1 !== (result = _isValid(pndx, getPlaceholder(pndx, testTemplate.match, !0) || (null == testTemplate.match.fn ? testTemplate.match.def : "" !== getPlaceholder(pndx) ? getPlaceholder(pndx) : getBuffer()[pndx]), !0)) && (getMaskSet().validPositions[result.pos || pndx].generatedInput = !0));
            }
            strict = !0 === strict;
            var maskPos = pos;
            pos.begin !== undefined && (maskPos = isRTL && !isSelection(pos) ? pos.end : pos.begin);
            var result = !0, positionsClone = $.extend(!0, {}, getMaskSet().validPositions);
            if ($.isFunction(opts.preValidation) && !strict && !0 !== fromSetValid && !0 !== validateOnly && (result = opts.preValidation(getBuffer(), maskPos, c, isSelection(pos), opts)), 
            !0 === result) {
                if (fillMissingNonMask(maskPos), isSelection(pos) && (handleRemove(undefined, Inputmask.keyCode.DELETE, pos, !0, !0), 
                maskPos = getMaskSet().p), maskPos < getMaskSet().maskLength && (maxLength === undefined || maskPos < maxLength) && (result = _isValid(maskPos, c, strict), 
                (!strict || !0 === fromSetValid) && !1 === result && !0 !== validateOnly)) {
                    var currentPosValid = getMaskSet().validPositions[maskPos];
                    if (!currentPosValid || null !== currentPosValid.match.fn || currentPosValid.match.def !== c && c !== opts.skipOptionalPartCharacter) {
                        if ((opts.insertMode || getMaskSet().validPositions[seekNext(maskPos)] === undefined) && !isMask(maskPos, !0)) for (var nPos = maskPos + 1, snPos = seekNext(maskPos); nPos <= snPos; nPos++) if (!1 !== (result = _isValid(nPos, c, strict))) {
                            !function(originalPos, newPos) {
                                var vp = getMaskSet().validPositions[newPos];
                                if (vp) for (var targetLocator = vp.locator, tll = targetLocator.length, ps = originalPos; ps < newPos; ps++) if (getMaskSet().validPositions[ps] === undefined && !isMask(ps, !0)) {
                                    var tests = getTests(ps).slice(), bestMatch = determineTestTemplate(tests, !0), equality = -1;
                                    "" === tests[tests.length - 1].match.def && tests.pop(), $.each(tests, function(ndx, tst) {
                                        for (var i = 0; i < tll; i++) {
                                            if (tst.locator[i] === undefined || !checkAlternationMatch(tst.locator[i].toString().split(","), targetLocator[i].toString().split(","), tst.na)) {
                                                var targetAI = targetLocator[i], bestMatchAI = bestMatch.locator[i], tstAI = tst.locator[i];
                                                targetAI - bestMatchAI > Math.abs(targetAI - tstAI) && (bestMatch = tst);
                                                break;
                                            }
                                            equality < i && (equality = i, bestMatch = tst);
                                        }
                                    }), (bestMatch = $.extend({}, bestMatch, {
                                        input: getPlaceholder(ps, bestMatch.match, !0) || bestMatch.match.def
                                    })).generatedInput = !0, setValidPosition(ps, bestMatch, !0), getMaskSet().validPositions[newPos] = undefined, 
                                    _isValid(newPos, vp.input, !0);
                                }
                            }(maskPos, result.pos !== undefined ? result.pos : nPos), maskPos = nPos;
                            break;
                        }
                    } else result = {
                        caret: seekNext(maskPos)
                    };
                }
                !1 === result && opts.keepStatic && !strict && !0 !== fromAlternate && (result = function(pos, c, strict) {
                    var lastAlt, alternation, altPos, prevAltPos, i, validPos, altNdxs, decisionPos, validPsClone = $.extend(!0, {}, getMaskSet().validPositions), isValidRslt = !1, lAltPos = getLastValidPosition();
                    for (prevAltPos = getMaskSet().validPositions[lAltPos]; lAltPos >= 0; lAltPos--) if ((altPos = getMaskSet().validPositions[lAltPos]) && altPos.alternation !== undefined) {
                        if (lastAlt = lAltPos, alternation = getMaskSet().validPositions[lastAlt].alternation, 
                        prevAltPos.locator[altPos.alternation] !== altPos.locator[altPos.alternation]) break;
                        prevAltPos = altPos;
                    }
                    if (alternation !== undefined) {
                        decisionPos = parseInt(lastAlt);
                        var decisionTaker = prevAltPos.locator[prevAltPos.alternation || alternation] !== undefined ? prevAltPos.locator[prevAltPos.alternation || alternation] : altNdxs[0];
                        decisionTaker.length > 0 && (decisionTaker = decisionTaker.split(",")[0]);
                        var possibilityPos = getMaskSet().validPositions[decisionPos], prevPos = getMaskSet().validPositions[decisionPos - 1];
                        $.each(getTests(decisionPos, prevPos ? prevPos.locator : undefined, decisionPos - 1), function(ndx, test) {
                            altNdxs = test.locator[alternation] ? test.locator[alternation].toString().split(",") : [];
                            for (var mndx = 0; mndx < altNdxs.length; mndx++) {
                                var validInputs = [], staticInputsBeforePos = 0, staticInputsBeforePosAlternate = 0, verifyValidInput = !1;
                                if (decisionTaker < altNdxs[mndx] && (test.na === undefined || -1 === $.inArray(altNdxs[mndx], test.na.split(",")) || -1 === $.inArray(decisionTaker.toString(), altNdxs))) {
                                    getMaskSet().validPositions[decisionPos] = $.extend(!0, {}, test);
                                    var possibilities = getMaskSet().validPositions[decisionPos].locator;
                                    for (getMaskSet().validPositions[decisionPos].locator[alternation] = parseInt(altNdxs[mndx]), 
                                    null == test.match.fn ? (possibilityPos.input !== test.match.def && (verifyValidInput = !0, 
                                    !0 !== possibilityPos.generatedInput && validInputs.push(possibilityPos.input)), 
                                    staticInputsBeforePosAlternate++, getMaskSet().validPositions[decisionPos].generatedInput = !/[0-9a-bA-Z]/.test(test.match.def), 
                                    getMaskSet().validPositions[decisionPos].input = test.match.def) : getMaskSet().validPositions[decisionPos].input = possibilityPos.input, 
                                    i = decisionPos + 1; i < getLastValidPosition(undefined, !0) + 1; i++) (validPos = getMaskSet().validPositions[i]) && !0 !== validPos.generatedInput && /[0-9a-bA-Z]/.test(validPos.input) ? validInputs.push(validPos.input) : i < pos && staticInputsBeforePos++, 
                                    delete getMaskSet().validPositions[i];
                                    for (verifyValidInput && validInputs[0] === test.match.def && validInputs.shift(), 
                                    resetMaskSet(!0), isValidRslt = !0; validInputs.length > 0; ) {
                                        var input = validInputs.shift();
                                        if (input !== opts.skipOptionalPartCharacter && !(isValidRslt = isValid(getLastValidPosition(undefined, !0) + 1, input, !1, fromSetValid, !0))) break;
                                    }
                                    if (isValidRslt) {
                                        getMaskSet().validPositions[decisionPos].locator = possibilities;
                                        var targetLvp = getLastValidPosition(pos) + 1;
                                        for (i = decisionPos + 1; i < getLastValidPosition() + 1; i++) ((validPos = getMaskSet().validPositions[i]) === undefined || null == validPos.match.fn) && i < pos + (staticInputsBeforePosAlternate - staticInputsBeforePos) && staticInputsBeforePosAlternate++;
                                        isValidRslt = isValid((pos += staticInputsBeforePosAlternate - staticInputsBeforePos) > targetLvp ? targetLvp : pos, c, strict, fromSetValid, !0);
                                    }
                                    if (isValidRslt) return !1;
                                    resetMaskSet(), getMaskSet().validPositions = $.extend(!0, {}, validPsClone);
                                }
                            }
                        });
                    }
                    return isValidRslt;
                }(maskPos, c, strict)), !0 === result && (result = {
                    pos: maskPos
                });
            }
            if ($.isFunction(opts.postValidation) && !1 !== result && !strict && !0 !== fromSetValid && !0 !== validateOnly) {
                var postResult = opts.postValidation(getBuffer(!0), result, opts);
                if (postResult.refreshFromBuffer && postResult.buffer) {
                    var refresh = postResult.refreshFromBuffer;
                    refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, postResult.buffer);
                }
                result = !0 === postResult ? result : postResult;
            }
            return result && result.pos === undefined && (result.pos = maskPos), !1 !== result && !0 !== validateOnly || (resetMaskSet(!0), 
            getMaskSet().validPositions = $.extend(!0, {}, positionsClone)), result;
        }
        function isMask(pos, strict) {
            var test = getTestTemplate(pos).match;
            if ("" === test.def && (test = getTest(pos).match), null != test.fn) return test.fn;
            if (!0 !== strict && pos > -1) {
                var tests = getTests(pos);
                return tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0);
            }
            return !1;
        }
        function seekNext(pos, newBlock) {
            var maskL = getMaskSet().maskLength;
            if (pos >= maskL) return maskL;
            var position = pos;
            for (getTests(maskL + 1).length > 1 && (getMaskTemplate(!0, maskL + 1, !0), maskL = getMaskSet().maskLength); ++position < maskL && (!0 === newBlock && (!0 !== getTest(position).match.newBlockMarker || !isMask(position)) || !0 !== newBlock && !isMask(position)); ) ;
            return position;
        }
        function seekPrevious(pos, newBlock) {
            var tests, position = pos;
            if (position <= 0) return 0;
            for (;--position > 0 && (!0 === newBlock && !0 !== getTest(position).match.newBlockMarker || !0 !== newBlock && !isMask(position) && ((tests = getTests(position)).length < 2 || 2 === tests.length && "" === tests[1].match.def)); ) ;
            return position;
        }
        function getBufferElement(position) {
            return getMaskSet().validPositions[position] === undefined ? getPlaceholder(position) : getMaskSet().validPositions[position].input;
        }
        function writeBuffer(input, buffer, caretPos, event, triggerInputEvent) {
            if (event && $.isFunction(opts.onBeforeWrite)) {
                var result = opts.onBeforeWrite.call(inputmask, event, buffer, caretPos, opts);
                if (result) {
                    if (result.refreshFromBuffer) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, result.buffer || buffer), 
                        buffer = getBuffer(!0);
                    }
                    caretPos !== undefined && (caretPos = result.caret !== undefined ? result.caret : caretPos);
                }
            }
            input !== undefined && (input.inputmask._valueSet(buffer.join("")), caretPos === undefined || event !== undefined && "blur" === event.type ? renderColorMask(input, caretPos, 0 === buffer.length) : android && event && "input" === event.type ? setTimeout(function() {
                caret(input, caretPos);
            }, 0) : caret(input, caretPos), !0 === triggerInputEvent && (skipInputEvent = !0, 
            $(input).trigger("input")));
        }
        function getPlaceholder(pos, test, returnPL) {
            if ((test = test || getTest(pos).match).placeholder !== undefined || !0 === returnPL) return $.isFunction(test.placeholder) ? test.placeholder(opts) : test.placeholder;
            if (null === test.fn) {
                if (pos > -1 && getMaskSet().validPositions[pos] === undefined) {
                    var prevTest, tests = getTests(pos), staticAlternations = [];
                    if (tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0)) for (var i = 0; i < tests.length; i++) if (!0 !== tests[i].match.optionality && !0 !== tests[i].match.optionalQuantifier && (null === tests[i].match.fn || prevTest === undefined || !1 !== tests[i].match.fn.test(prevTest.match.def, getMaskSet(), pos, !0, opts)) && (staticAlternations.push(tests[i]), 
                    null === tests[i].match.fn && (prevTest = tests[i]), staticAlternations.length > 1 && /[0-9a-bA-Z]/.test(staticAlternations[0].match.def))) return opts.placeholder.charAt(pos % opts.placeholder.length);
                }
                return test.def;
            }
            return opts.placeholder.charAt(pos % opts.placeholder.length);
        }
        function checkVal(input, writeOut, strict, nptvl, initiatingEvent) {
            function isTemplateMatch(ndx, charCodes) {
                return -1 !== getBufferTemplate().slice(ndx, seekNext(ndx)).join("").indexOf(charCodes) && !isMask(ndx) && getTest(ndx).match.nativeDef === charCodes.charAt(charCodes.length - 1);
            }
            var inputValue = nptvl.slice(), charCodes = "", initialNdx = -1, result = undefined;
            if (resetMaskSet(), strict || !0 === opts.autoUnmask) initialNdx = seekNext(initialNdx); else {
                var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(""), matches = inputValue.join("").match(new RegExp("^" + Inputmask.escapeRegex(staticInput), "g"));
                matches && matches.length > 0 && (inputValue.splice(0, matches.length * staticInput.length), 
                initialNdx = seekNext(initialNdx));
            }
            if (-1 === initialNdx ? (getMaskSet().p = seekNext(initialNdx), initialNdx = 0) : getMaskSet().p = initialNdx, 
            $.each(inputValue, function(ndx, charCode) {
                if (charCode !== undefined) if (getMaskSet().validPositions[ndx] === undefined && inputValue[ndx] === getPlaceholder(ndx) && isMask(ndx, !0) && !1 === isValid(ndx, inputValue[ndx], !0, undefined, undefined, !0)) getMaskSet().p++; else {
                    var keypress = new $.Event("_checkval");
                    keypress.which = charCode.charCodeAt(0), charCodes += charCode;
                    var lvp = getLastValidPosition(undefined, !0), lvTest = getMaskSet().validPositions[lvp], nextTest = getTestTemplate(lvp + 1, lvTest ? lvTest.locator.slice() : undefined, lvp);
                    if (!isTemplateMatch(initialNdx, charCodes) || strict || opts.autoUnmask) {
                        var pos = strict ? ndx : null == nextTest.match.fn && nextTest.match.optionality && lvp + 1 < getMaskSet().p ? lvp + 1 : getMaskSet().p;
                        result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, strict, pos), 
                        initialNdx = pos + 1, charCodes = "";
                    } else result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, !0, lvp + 1);
                    if (!1 !== result && !strict && $.isFunction(opts.onBeforeWrite)) {
                        var origResult = result;
                        if (result = opts.onBeforeWrite.call(inputmask, keypress, getBuffer(), result.forwardPosition, opts), 
                        (result = $.extend(origResult, result)) && result.refreshFromBuffer) {
                            var refresh = result.refreshFromBuffer;
                            refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, result.buffer), 
                            resetMaskSet(!0), result.caret && (getMaskSet().p = result.caret, result.forwardPosition = result.caret);
                        }
                    }
                }
            }), writeOut) {
                var caretPos = undefined;
                document.activeElement === input && result && (caretPos = opts.numericInput ? seekPrevious(result.forwardPosition) : result.forwardPosition), 
                writeBuffer(input, getBuffer(), caretPos, initiatingEvent || new $.Event("checkval"), initiatingEvent && "input" === initiatingEvent.type);
            }
        }
        function unmaskedvalue(input) {
            if (input) {
                if (input.inputmask === undefined) return input.value;
                input.inputmask && input.inputmask.refreshValue && EventHandlers.setValueEvent.call(input);
            }
            var umValue = [], vps = getMaskSet().validPositions;
            for (var pndx in vps) vps[pndx].match && null != vps[pndx].match.fn && umValue.push(vps[pndx].input);
            var unmaskedValue = 0 === umValue.length ? "" : (isRTL ? umValue.reverse() : umValue).join("");
            if ($.isFunction(opts.onUnMask)) {
                var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join("");
                unmaskedValue = opts.onUnMask.call(inputmask, bufferValue, unmaskedValue, opts);
            }
            return unmaskedValue;
        }
        function caret(input, begin, end, notranslate) {
            function translatePosition(pos) {
                return !0 === notranslate || !isRTL || "number" != typeof pos || opts.greedy && "" === opts.placeholder || (pos = getBuffer().join("").length - pos), 
                pos;
            }
            var range;
            if (begin === undefined) return input.setSelectionRange ? (begin = input.selectionStart, 
            end = input.selectionEnd) : window.getSelection ? (range = window.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== input && range.commonAncestorContainer !== input || (begin = range.startOffset, 
            end = range.endOffset) : document.selection && document.selection.createRange && (end = (begin = 0 - (range = document.selection.createRange()).duplicate().moveStart("character", -input.inputmask._valueGet().length)) + range.text.length), 
            {
                begin: translatePosition(begin),
                end: translatePosition(end)
            };
            if (begin.begin !== undefined && (end = begin.end, begin = begin.begin), "number" == typeof begin) {
                begin = translatePosition(begin), end = "number" == typeof (end = translatePosition(end)) ? end : begin;
                var scrollCalc = parseInt(((input.ownerDocument.defaultView || window).getComputedStyle ? (input.ownerDocument.defaultView || window).getComputedStyle(input, null) : input.currentStyle).fontSize) * end;
                if (input.scrollLeft = scrollCalc > input.scrollWidth ? scrollCalc : 0, mobile || !1 !== opts.insertMode || begin !== end || end++, 
                input.setSelectionRange) input.selectionStart = begin, input.selectionEnd = end; else if (window.getSelection) {
                    if (range = document.createRange(), input.firstChild === undefined || null === input.firstChild) {
                        var textNode = document.createTextNode("");
                        input.appendChild(textNode);
                    }
                    range.setStart(input.firstChild, begin < input.inputmask._valueGet().length ? begin : input.inputmask._valueGet().length), 
                    range.setEnd(input.firstChild, end < input.inputmask._valueGet().length ? end : input.inputmask._valueGet().length), 
                    range.collapse(!0);
                    var sel = window.getSelection();
                    sel.removeAllRanges(), sel.addRange(range);
                } else input.createTextRange && ((range = input.createTextRange()).collapse(!0), 
                range.moveEnd("character", end), range.moveStart("character", begin), range.select());
                renderColorMask(input, {
                    begin: begin,
                    end: end
                });
            }
        }
        function determineLastRequiredPosition(returnDefinition) {
            var pos, testPos, buffer = getBuffer(), bl = buffer.length, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet().validPositions[lvp], ndxIntlzr = lvTest !== undefined ? lvTest.locator.slice() : undefined;
            for (pos = lvp + 1; pos < buffer.length; pos++) ndxIntlzr = (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1)).locator.slice(), 
            positions[pos] = $.extend(!0, {}, testPos);
            var lvTestAlt = lvTest && lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation] : undefined;
            for (pos = bl - 1; pos > lvp && (((testPos = positions[pos]).match.optionality || testPos.match.optionalQuantifier && testPos.match.newBlockMarker || lvTestAlt && (lvTestAlt !== positions[pos].locator[lvTest.alternation] && null != testPos.match.fn || null === testPos.match.fn && testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAlt.toString().split(",")) && "" !== getTests(pos)[0].def)) && buffer[pos] === getPlaceholder(pos, testPos.match)); pos--) bl--;
            return returnDefinition ? {
                l: bl,
                def: positions[bl] ? positions[bl].match : undefined
            } : bl;
        }
        function clearOptionalTail(buffer) {
            for (var validPos, rl = determineLastRequiredPosition(), bl = buffer.length, lv = getMaskSet().validPositions[getLastValidPosition()]; rl < bl && !isMask(rl, !0) && (validPos = lv !== undefined ? getTestTemplate(rl, lv.locator.slice(""), lv) : getTest(rl)) && !0 !== validPos.match.optionality && (!0 !== validPos.match.optionalQuantifier && !0 !== validPos.match.newBlockMarker || rl + 1 === bl && "" === (lv !== undefined ? getTestTemplate(rl + 1, lv.locator.slice(""), lv) : getTest(rl + 1)).match.def); ) rl++;
            for (;(validPos = getMaskSet().validPositions[rl - 1]) && validPos && validPos.match.optionality && validPos.input === opts.skipOptionalPartCharacter; ) rl--;
            return buffer.splice(rl), buffer;
        }
        function isComplete(buffer) {
            if ($.isFunction(opts.isComplete)) return opts.isComplete(buffer, opts);
            if ("*" === opts.repeat) return undefined;
            var complete = !1, lrp = determineLastRequiredPosition(!0), aml = seekPrevious(lrp.l);
            if (lrp.def === undefined || lrp.def.newBlockMarker || lrp.def.optionality || lrp.def.optionalQuantifier) {
                complete = !0;
                for (var i = 0; i <= aml; i++) {
                    var test = getTestTemplate(i).match;
                    if (null !== test.fn && getMaskSet().validPositions[i] === undefined && !0 !== test.optionality && !0 !== test.optionalQuantifier || null === test.fn && buffer[i] !== getPlaceholder(i, test)) {
                        complete = !1;
                        break;
                    }
                }
            }
            return complete;
        }
        function handleRemove(input, k, pos, strict, fromIsValid) {
            if ((opts.numericInput || isRTL) && (k === Inputmask.keyCode.BACKSPACE ? k = Inputmask.keyCode.DELETE : k === Inputmask.keyCode.DELETE && (k = Inputmask.keyCode.BACKSPACE), 
            isRTL)) {
                var pend = pos.end;
                pos.end = pos.begin, pos.begin = pend;
            }
            k === Inputmask.keyCode.BACKSPACE && (pos.end - pos.begin < 1 || !1 === opts.insertMode) ? (pos.begin = seekPrevious(pos.begin), 
            getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator && pos.begin--) : k === Inputmask.keyCode.DELETE && pos.begin === pos.end && (pos.end = isMask(pos.end, !0) && getMaskSet().validPositions[pos.end] && getMaskSet().validPositions[pos.end].input !== opts.radixPoint ? pos.end + 1 : seekNext(pos.end) + 1, 
            getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator && pos.end++), 
            stripValidPositions(pos.begin, pos.end, !1, strict), !0 !== strict && function() {
                if (opts.keepStatic) {
                    for (var validInputs = [], lastAlt = getLastValidPosition(-1, !0), positionsClone = $.extend(!0, {}, getMaskSet().validPositions), prevAltPos = getMaskSet().validPositions[lastAlt]; lastAlt >= 0; lastAlt--) {
                        var altPos = getMaskSet().validPositions[lastAlt];
                        if (altPos) {
                            if (!0 !== altPos.generatedInput && /[0-9a-bA-Z]/.test(altPos.input) && validInputs.push(altPos.input), 
                            delete getMaskSet().validPositions[lastAlt], altPos.alternation !== undefined && altPos.locator[altPos.alternation] !== prevAltPos.locator[altPos.alternation]) break;
                            prevAltPos = altPos;
                        }
                    }
                    if (lastAlt > -1) for (getMaskSet().p = seekNext(getLastValidPosition(-1, !0)); validInputs.length > 0; ) {
                        var keypress = new $.Event("keypress");
                        keypress.which = validInputs.pop().charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !1, !1, getMaskSet().p);
                    } else getMaskSet().validPositions = $.extend(!0, {}, positionsClone);
                }
            }();
            var lvp = getLastValidPosition(pos.begin, !0);
            if (lvp < pos.begin) getMaskSet().p = seekNext(lvp); else if (!0 !== strict && (getMaskSet().p = pos.begin, 
            !0 !== fromIsValid)) for (;getMaskSet().p < lvp && getMaskSet().validPositions[getMaskSet().p] === undefined; ) getMaskSet().p++;
        }
        function initializeColorMask(input) {
            function findCaretPos(clientx) {
                var caretPos, e = document.createElement("span");
                for (var style in computedStyle) isNaN(style) && -1 !== style.indexOf("font") && (e.style[style] = computedStyle[style]);
                e.style.textTransform = computedStyle.textTransform, e.style.letterSpacing = computedStyle.letterSpacing, 
                e.style.position = "absolute", e.style.height = "auto", e.style.width = "auto", 
                e.style.visibility = "hidden", e.style.whiteSpace = "nowrap", document.body.appendChild(e);
                var itl, inputText = input.inputmask._valueGet(), previousWidth = 0;
                for (caretPos = 0, itl = inputText.length; caretPos <= itl; caretPos++) {
                    if (e.innerHTML += inputText.charAt(caretPos) || "_", e.offsetWidth >= clientx) {
                        var offset1 = clientx - previousWidth, offset2 = e.offsetWidth - clientx;
                        e.innerHTML = inputText.charAt(caretPos), caretPos = (offset1 -= e.offsetWidth / 3) < offset2 ? caretPos - 1 : caretPos;
                        break;
                    }
                    previousWidth = e.offsetWidth;
                }
                return document.body.removeChild(e), caretPos;
            }
            var computedStyle = (input.ownerDocument.defaultView || window).getComputedStyle(input, null), template = document.createElement("div");
            template.style.width = computedStyle.width, template.style.textAlign = computedStyle.textAlign, 
            (colorMask = document.createElement("div")).className = "im-colormask", input.parentNode.insertBefore(colorMask, input), 
            input.parentNode.removeChild(input), colorMask.appendChild(template), colorMask.appendChild(input), 
            input.style.left = template.offsetLeft + "px", $(input).on("click", function(e) {
                return caret(input, findCaretPos(e.clientX)), EventHandlers.clickEvent.call(input, [ e ]);
            }), $(input).on("keydown", function(e) {
                e.shiftKey || !1 === opts.insertMode || setTimeout(function() {
                    renderColorMask(input);
                }, 0);
            });
        }
        function renderColorMask(input, caretPos, clear) {
            function handleStatic() {
                isStatic || null !== test.fn && testPos.input !== undefined ? isStatic && (null !== test.fn && testPos.input !== undefined || "" === test.def) && (isStatic = !1, 
                maskTemplate += "</span>") : (isStatic = !0, maskTemplate += "<span class='im-static'>");
            }
            function handleCaret(force) {
                !0 !== force && pos !== caretPos.begin || document.activeElement !== input || (maskTemplate += "<span class='im-caret' style='border-right-width: 1px;border-right-style: solid;'></span>");
            }
            var test, testPos, ndxIntlzr, maskTemplate = "", isStatic = !1, pos = 0;
            if (colorMask !== undefined) {
                var buffer = getBuffer();
                if (caretPos === undefined ? caretPos = caret(input) : caretPos.begin === undefined && (caretPos = {
                    begin: caretPos,
                    end: caretPos
                }), !0 !== clear) {
                    var lvp = getLastValidPosition();
                    do {
                        handleCaret(), getMaskSet().validPositions[pos] ? (testPos = getMaskSet().validPositions[pos], 
                        test = testPos.match, ndxIntlzr = testPos.locator.slice(), handleStatic(), maskTemplate += buffer[pos]) : (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1), 
                        test = testPos.match, ndxIntlzr = testPos.locator.slice(), (!1 === opts.jitMasking || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && (handleStatic(), 
                        maskTemplate += getPlaceholder(pos, test))), pos++;
                    } while ((maxLength === undefined || pos < maxLength) && (null !== test.fn || "" !== test.def) || lvp > pos || isStatic);
                    -1 === maskTemplate.indexOf("im-caret") && handleCaret(!0), isStatic && handleStatic();
                }
                var template = colorMask.getElementsByTagName("div")[0];
                template.innerHTML = maskTemplate, input.inputmask.positionColorMask(input, template);
            }
        }
        maskset = maskset || this.maskset, opts = opts || this.opts;
        var undoValue, $el, maxLength, colorMask, inputmask = this, el = this.el, isRTL = this.isRTL, skipKeyPressEvent = !1, skipInputEvent = !1, ignorable = !1, mouseEnter = !1, EventRuler = {
            on: function(input, eventName, eventHandler) {
                var ev = function(e) {
                    if (this.inputmask === undefined && "FORM" !== this.nodeName) {
                        var imOpts = $.data(this, "_inputmask_opts");
                        imOpts ? new Inputmask(imOpts).mask(this) : EventRuler.off(this);
                    } else {
                        if ("setvalue" === e.type || "FORM" === this.nodeName || !(this.disabled || this.readOnly && !("keydown" === e.type && e.ctrlKey && 67 === e.keyCode || !1 === opts.tabThrough && e.keyCode === Inputmask.keyCode.TAB))) {
                            switch (e.type) {
                              case "input":
                                if (!0 === skipInputEvent) return skipInputEvent = !1, e.preventDefault();
                                break;

                              case "keydown":
                                skipKeyPressEvent = !1, skipInputEvent = !1;
                                break;

                              case "keypress":
                                if (!0 === skipKeyPressEvent) return e.preventDefault();
                                skipKeyPressEvent = !0;
                                break;

                              case "click":
                                if (iemobile || iphone) {
                                    var that = this, args = arguments;
                                    return setTimeout(function() {
                                        eventHandler.apply(that, args);
                                    }, 0), !1;
                                }
                            }
                            var returnVal = eventHandler.apply(this, arguments);
                            return !1 === returnVal && (e.preventDefault(), e.stopPropagation()), returnVal;
                        }
                        e.preventDefault();
                    }
                };
                input.inputmask.events[eventName] = input.inputmask.events[eventName] || [], input.inputmask.events[eventName].push(ev), 
                -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null !== input.form && $(input.form).on(eventName, ev) : $(input).on(eventName, ev);
            },
            off: function(input, event) {
                if (input.inputmask && input.inputmask.events) {
                    var events;
                    event ? (events = [])[event] = input.inputmask.events[event] : events = input.inputmask.events, 
                    $.each(events, function(eventName, evArr) {
                        for (;evArr.length > 0; ) {
                            var ev = evArr.pop();
                            -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null !== input.form && $(input.form).off(eventName, ev) : $(input).off(eventName, ev);
                        }
                        delete input.inputmask.events[eventName];
                    });
                }
            }
        }, EventHandlers = {
            keydownEvent: function(e) {
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);
                if (k === Inputmask.keyCode.BACKSPACE || k === Inputmask.keyCode.DELETE || iphone && k === Inputmask.keyCode.BACKSPACE_SAFARI || e.ctrlKey && k === Inputmask.keyCode.X && !function(eventName) {
                    var el = document.createElement("input"), evName = "on" + eventName, isSupported = evName in el;
                    return isSupported || (el.setAttribute(evName, "return;"), isSupported = "function" == typeof el[evName]), 
                    el = null, isSupported;
                }("cut")) e.preventDefault(), handleRemove(input, k, pos), writeBuffer(input, getBuffer(!0), getMaskSet().p, e, input.inputmask._valueGet() !== getBuffer().join("")), 
                input.inputmask._valueGet() === getBufferTemplate().join("") ? $input.trigger("cleared") : !0 === isComplete(getBuffer()) && $input.trigger("complete"); else if (k === Inputmask.keyCode.END || k === Inputmask.keyCode.PAGE_DOWN) {
                    e.preventDefault();
                    var caretPos = seekNext(getLastValidPosition());
                    opts.insertMode || caretPos !== getMaskSet().maskLength || e.shiftKey || caretPos--, 
                    caret(input, e.shiftKey ? pos.begin : caretPos, caretPos, !0);
                } else k === Inputmask.keyCode.HOME && !e.shiftKey || k === Inputmask.keyCode.PAGE_UP ? (e.preventDefault(), 
                caret(input, 0, e.shiftKey ? pos.begin : 0, !0)) : (opts.undoOnEscape && k === Inputmask.keyCode.ESCAPE || 90 === k && e.ctrlKey) && !0 !== e.altKey ? (checkVal(input, !0, !1, undoValue.split("")), 
                $input.trigger("click")) : k !== Inputmask.keyCode.INSERT || e.shiftKey || e.ctrlKey ? !0 === opts.tabThrough && k === Inputmask.keyCode.TAB ? (!0 === e.shiftKey ? (null === getTest(pos.begin).match.fn && (pos.begin = seekNext(pos.begin)), 
                pos.end = seekPrevious(pos.begin, !0), pos.begin = seekPrevious(pos.end, !0)) : (pos.begin = seekNext(pos.begin, !0), 
                pos.end = seekNext(pos.begin, !0), pos.end < getMaskSet().maskLength && pos.end--), 
                pos.begin < getMaskSet().maskLength && (e.preventDefault(), caret(input, pos.begin, pos.end))) : e.shiftKey || !1 === opts.insertMode && (k === Inputmask.keyCode.RIGHT ? setTimeout(function() {
                    var caretPos = caret(input);
                    caret(input, caretPos.begin);
                }, 0) : k === Inputmask.keyCode.LEFT && setTimeout(function() {
                    var caretPos = caret(input);
                    caret(input, isRTL ? caretPos.begin + 1 : caretPos.begin - 1);
                }, 0)) : (opts.insertMode = !opts.insertMode, caret(input, opts.insertMode || pos.begin !== getMaskSet().maskLength ? pos.begin : pos.begin - 1));
                opts.onKeyDown.call(this, e, getBuffer(), caret(input).begin, opts), ignorable = -1 !== $.inArray(k, opts.ignorables);
            },
            keypressEvent: function(e, checkval, writeOut, strict, ndx) {
                var input = this, $input = $(input), k = e.which || e.charCode || e.keyCode;
                if (!(!0 === checkval || e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable)) return k === Inputmask.keyCode.ENTER && undoValue !== getBuffer().join("") && (undoValue = getBuffer().join(""), 
                setTimeout(function() {
                    $input.trigger("change");
                }, 0)), !0;
                if (k) {
                    46 === k && !1 === e.shiftKey && "" !== opts.radixPoint && (k = opts.radixPoint.charCodeAt(0));
                    var forwardPosition, pos = checkval ? {
                        begin: ndx,
                        end: ndx
                    } : caret(input), c = String.fromCharCode(k);
                    getMaskSet().writeOutBuffer = !0;
                    var valResult = isValid(pos, c, strict);
                    if (!1 !== valResult && (resetMaskSet(!0), forwardPosition = valResult.caret !== undefined ? valResult.caret : checkval ? valResult.pos + 1 : seekNext(valResult.pos), 
                    getMaskSet().p = forwardPosition), !1 !== writeOut && (setTimeout(function() {
                        opts.onKeyValidation.call(input, k, valResult, opts);
                    }, 0), getMaskSet().writeOutBuffer && !1 !== valResult)) {
                        var buffer = getBuffer();
                        writeBuffer(input, buffer, opts.numericInput && valResult.caret === undefined ? seekPrevious(forwardPosition) : forwardPosition, e, !0 !== checkval), 
                        !0 !== checkval && setTimeout(function() {
                            !0 === isComplete(buffer) && $input.trigger("complete");
                        }, 0);
                    }
                    if (e.preventDefault(), checkval) return !1 !== valResult && (valResult.forwardPosition = forwardPosition), 
                    valResult;
                }
            },
            pasteEvent: function(e) {
                var tempValue, input = this, ev = e.originalEvent || e, $input = $(input), inputValue = input.inputmask._valueGet(!0), caretPos = caret(input);
                isRTL && (tempValue = caretPos.end, caretPos.end = caretPos.begin, caretPos.begin = tempValue);
                var valueBeforeCaret = inputValue.substr(0, caretPos.begin), valueAfterCaret = inputValue.substr(caretPos.end, inputValue.length);
                if (valueBeforeCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(0, caretPos.begin).join("") && (valueBeforeCaret = ""), 
                valueAfterCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(caretPos.end).join("") && (valueAfterCaret = ""), 
                isRTL && (tempValue = valueBeforeCaret, valueBeforeCaret = valueAfterCaret, valueAfterCaret = tempValue), 
                window.clipboardData && window.clipboardData.getData) inputValue = valueBeforeCaret + window.clipboardData.getData("Text") + valueAfterCaret; else {
                    if (!ev.clipboardData || !ev.clipboardData.getData) return !0;
                    inputValue = valueBeforeCaret + ev.clipboardData.getData("text/plain") + valueAfterCaret;
                }
                var pasteValue = inputValue;
                if ($.isFunction(opts.onBeforePaste)) {
                    if (!1 === (pasteValue = opts.onBeforePaste.call(inputmask, inputValue, opts))) return e.preventDefault();
                    pasteValue || (pasteValue = inputValue);
                }
                return checkVal(input, !1, !1, isRTL ? pasteValue.split("").reverse() : pasteValue.toString().split("")), 
                writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()), e, undoValue !== getBuffer().join("")), 
                !0 === isComplete(getBuffer()) && $input.trigger("complete"), e.preventDefault();
            },
            inputFallBackEvent: function(e) {
                var input = this, inputValue = input.inputmask._valueGet();
                if (getBuffer().join("") !== inputValue) {
                    var caretPos = caret(input);
                    if (!1 === function(input, inputValue, caretPos) {
                        if ("." === inputValue.charAt(caretPos.begin - 1) && "" !== opts.radixPoint && ((inputValue = inputValue.split(""))[caretPos.begin - 1] = opts.radixPoint.charAt(0), 
                        inputValue = inputValue.join("")), inputValue.charAt(caretPos.begin - 1) === opts.radixPoint && inputValue.length > getBuffer().length) {
                            var keypress = new $.Event("keypress");
                            return keypress.which = opts.radixPoint.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, caretPos.begin - 1), 
                            !1;
                        }
                    }(input, inputValue, caretPos)) return !1;
                    if (inputValue = inputValue.replace(new RegExp("(" + Inputmask.escapeRegex(getBufferTemplate().join("")) + ")*"), ""), 
                    !1 === function(input, inputValue, caretPos) {
                        if (iemobile) {
                            var inputChar = inputValue.replace(getBuffer().join(""), "");
                            if (1 === inputChar.length) {
                                var keypress = new $.Event("keypress");
                                return keypress.which = inputChar.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, getMaskSet().validPositions[caretPos.begin - 1] ? caretPos.begin : caretPos.begin - 1), 
                                !1;
                            }
                        }
                    }(input, inputValue, caretPos)) return !1;
                    caretPos.begin > inputValue.length && (caret(input, inputValue.length), caretPos = caret(input));
                    var buffer = getBuffer().join(""), frontPart = inputValue.substr(0, caretPos.begin), backPart = inputValue.substr(caretPos.begin), frontBufferPart = buffer.substr(0, caretPos.begin), backBufferPart = buffer.substr(caretPos.begin), selection = caretPos, entries = "", isEntry = !1;
                    if (frontPart !== frontBufferPart) {
                        selection.begin = 0;
                        for (var fpl = (isEntry = frontPart.length >= frontBufferPart.length) ? frontPart.length : frontBufferPart.length, i = 0; frontPart.charAt(i) === frontBufferPart.charAt(i) && i < fpl; i++) selection.begin++;
                        isEntry && (entries += frontPart.slice(selection.begin, selection.end));
                    }
                    backPart !== backBufferPart && (backPart.length > backBufferPart.length ? isEntry && (selection.end = selection.begin) : backPart.length < backBufferPart.length ? selection.end += backBufferPart.length - backPart.length : backPart.charAt(0) !== backBufferPart.charAt(0) && selection.end++), 
                    writeBuffer(input, getBuffer(), selection), entries.length > 0 ? $.each(entries.split(""), function(ndx, entry) {
                        var keypress = new $.Event("keypress");
                        keypress.which = entry.charCodeAt(0), ignorable = !1, EventHandlers.keypressEvent.call(input, keypress);
                    }) : (selection.begin === selection.end - 1 && caret(input, seekPrevious(selection.begin + 1), selection.end), 
                    e.keyCode = Inputmask.keyCode.DELETE, EventHandlers.keydownEvent.call(input, e)), 
                    e.preventDefault();
                }
            },
            setValueEvent: function(e) {
                this.inputmask.refreshValue = !1;
                var input = this, value = input.inputmask._valueGet(!0);
                $.isFunction(opts.onBeforeMask) && (value = opts.onBeforeMask.call(inputmask, value, opts) || value), 
                value = value.split(""), checkVal(input, !0, !1, isRTL ? value.reverse() : value), 
                undoValue = getBuffer().join(""), (opts.clearMaskOnLostFocus || opts.clearIncomplete) && input.inputmask._valueGet() === getBufferTemplate().join("") && input.inputmask._valueSet("");
            },
            focusEvent: function(e) {
                var input = this, nptValue = input.inputmask._valueGet();
                opts.showMaskOnFocus && (!opts.showMaskOnHover || opts.showMaskOnHover && "" === nptValue) && (input.inputmask._valueGet() !== getBuffer().join("") ? writeBuffer(input, getBuffer(), seekNext(getLastValidPosition())) : !1 === mouseEnter && caret(input, seekNext(getLastValidPosition()))), 
                !0 === opts.positionCaretOnTab && !1 === mouseEnter && "" !== nptValue && (writeBuffer(input, getBuffer(), caret(input)), 
                EventHandlers.clickEvent.apply(input, [ e, !0 ])), undoValue = getBuffer().join("");
            },
            mouseleaveEvent: function(e) {
                var input = this;
                if (mouseEnter = !1, opts.clearMaskOnLostFocus && document.activeElement !== input) {
                    var buffer = getBuffer().slice(), nptValue = input.inputmask._valueGet();
                    nptValue !== input.getAttribute("placeholder") && "" !== nptValue && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer), 
                    writeBuffer(input, buffer));
                }
            },
            clickEvent: function(e, tabbed) {
                function doRadixFocus(clickPos) {
                    if ("" !== opts.radixPoint) {
                        var vps = getMaskSet().validPositions;
                        if (vps[clickPos] === undefined || vps[clickPos].input === getPlaceholder(clickPos)) {
                            if (clickPos < seekNext(-1)) return !0;
                            var radixPos = $.inArray(opts.radixPoint, getBuffer());
                            if (-1 !== radixPos) {
                                for (var vp in vps) if (radixPos < vp && vps[vp].input !== getPlaceholder(vp)) return !1;
                                return !0;
                            }
                        }
                    }
                    return !1;
                }
                var input = this;
                setTimeout(function() {
                    if (document.activeElement === input) {
                        var selectedCaret = caret(input);
                        if (tabbed && (isRTL ? selectedCaret.end = selectedCaret.begin : selectedCaret.begin = selectedCaret.end), 
                        selectedCaret.begin === selectedCaret.end) switch (opts.positionCaretOnClick) {
                          case "none":
                            break;

                          case "radixFocus":
                            if (doRadixFocus(selectedCaret.begin)) {
                                var radixPos = getBuffer().join("").indexOf(opts.radixPoint);
                                caret(input, opts.numericInput ? seekNext(radixPos) : radixPos);
                                break;
                            }

                          default:
                            var clickPosition = selectedCaret.begin, lvclickPosition = getLastValidPosition(clickPosition, !0), lastPosition = seekNext(lvclickPosition);
                            if (clickPosition < lastPosition) caret(input, isMask(clickPosition, !0) || isMask(clickPosition - 1, !0) ? clickPosition : seekNext(clickPosition)); else {
                                var lvp = getMaskSet().validPositions[lvclickPosition], tt = getTestTemplate(lastPosition, lvp ? lvp.match.locator : undefined, lvp), placeholder = getPlaceholder(lastPosition, tt.match);
                                if ("" !== placeholder && getBuffer()[lastPosition] !== placeholder && !0 !== tt.match.optionalQuantifier && !0 !== tt.match.newBlockMarker || !isMask(lastPosition, !0) && tt.match.def === placeholder) {
                                    var newPos = seekNext(lastPosition);
                                    (clickPosition >= newPos || clickPosition === lastPosition) && (lastPosition = newPos);
                                }
                                caret(input, lastPosition);
                            }
                        }
                    }
                }, 0);
            },
            dblclickEvent: function(e) {
                var input = this;
                setTimeout(function() {
                    caret(input, 0, seekNext(getLastValidPosition()));
                }, 0);
            },
            cutEvent: function(e) {
                var input = this, $input = $(input), pos = caret(input), ev = e.originalEvent || e, clipboardData = window.clipboardData || ev.clipboardData, clipData = isRTL ? getBuffer().slice(pos.end, pos.begin) : getBuffer().slice(pos.begin, pos.end);
                clipboardData.setData("text", isRTL ? clipData.reverse().join("") : clipData.join("")), 
                document.execCommand && document.execCommand("copy"), handleRemove(input, Inputmask.keyCode.DELETE, pos), 
                writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join("")), 
                input.inputmask._valueGet() === getBufferTemplate().join("") && $input.trigger("cleared");
            },
            blurEvent: function(e) {
                var $input = $(this), input = this;
                if (input.inputmask) {
                    var nptValue = input.inputmask._valueGet(), buffer = getBuffer().slice();
                    "" !== nptValue && (opts.clearMaskOnLostFocus && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer)), 
                    !1 === isComplete(buffer) && (setTimeout(function() {
                        $input.trigger("incomplete");
                    }, 0), opts.clearIncomplete && (resetMaskSet(), buffer = opts.clearMaskOnLostFocus ? [] : getBufferTemplate().slice())), 
                    writeBuffer(input, buffer, undefined, e)), undoValue !== getBuffer().join("") && (undoValue = buffer.join(""), 
                    $input.trigger("change"));
                }
            },
            mouseenterEvent: function(e) {
                var input = this;
                mouseEnter = !0, document.activeElement !== input && opts.showMaskOnHover && input.inputmask._valueGet() !== getBuffer().join("") && writeBuffer(input, getBuffer());
            },
            submitEvent: function(e) {
                undoValue !== getBuffer().join("") && $el.trigger("change"), opts.clearMaskOnLostFocus && -1 === getLastValidPosition() && el.inputmask._valueGet && el.inputmask._valueGet() === getBufferTemplate().join("") && el.inputmask._valueSet(""), 
                opts.removeMaskOnSubmit && (el.inputmask._valueSet(el.inputmask.unmaskedvalue(), !0), 
                setTimeout(function() {
                    writeBuffer(el, getBuffer());
                }, 0));
            },
            resetEvent: function(e) {
                el.inputmask.refreshValue = !0, setTimeout(function() {
                    $el.trigger("setvalue");
                }, 0);
            }
        };
        Inputmask.prototype.positionColorMask = function(input, template) {
            input.style.left = template.offsetLeft + "px";
        };
        var valueBuffer;
        if (actionObj !== undefined) switch (actionObj.action) {
          case "isComplete":
            return el = actionObj.el, isComplete(getBuffer());

          case "unmaskedvalue":
            return el !== undefined && actionObj.value === undefined || (valueBuffer = actionObj.value, 
            valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, valueBuffer, opts) || valueBuffer : valueBuffer).split(""), 
            checkVal(undefined, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite.call(inputmask, undefined, getBuffer(), 0, opts)), 
            unmaskedvalue(el);

          case "mask":
            !function(elem) {
                EventRuler.off(elem);
                var isSupported = function(input, opts) {
                    var elementType = input.getAttribute("type"), isSupported = "INPUT" === input.tagName && -1 !== $.inArray(elementType, opts.supportsInputType) || input.isContentEditable || "TEXTAREA" === input.tagName;
                    if (!isSupported) if ("INPUT" === input.tagName) {
                        var el = document.createElement("input");
                        el.setAttribute("type", elementType), isSupported = "text" === el.type, el = null;
                    } else isSupported = "partial";
                    return !1 !== isSupported ? function(npt) {
                        function getter() {
                            return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== getLastValidPosition() || !0 !== opts.nullable ? document.activeElement === this && opts.clearMaskOnLostFocus ? (isRTL ? clearOptionalTail(getBuffer().slice()).reverse() : clearOptionalTail(getBuffer().slice())).join("") : valueGet.call(this) : "" : valueGet.call(this);
                        }
                        function setter(value) {
                            valueSet.call(this, value), this.inputmask && $(this).trigger("setvalue");
                        }
                        var valueGet, valueSet;
                        if (!npt.inputmask.__valueGet) {
                            if (!0 !== opts.noValuePatching) {
                                if (Object.getOwnPropertyDescriptor) {
                                    "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" == typeof "test".__proto__ ? function(object) {
                                        return object.__proto__;
                                    } : function(object) {
                                        return object.constructor.prototype;
                                    });
                                    var valueProperty = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(npt), "value") : undefined;
                                    valueProperty && valueProperty.get && valueProperty.set ? (valueGet = valueProperty.get, 
                                    valueSet = valueProperty.set, Object.defineProperty(npt, "value", {
                                        get: getter,
                                        set: setter,
                                        configurable: !0
                                    })) : "INPUT" !== npt.tagName && (valueGet = function() {
                                        return this.textContent;
                                    }, valueSet = function(value) {
                                        this.textContent = value;
                                    }, Object.defineProperty(npt, "value", {
                                        get: getter,
                                        set: setter,
                                        configurable: !0
                                    }));
                                } else document.__lookupGetter__ && npt.__lookupGetter__("value") && (valueGet = npt.__lookupGetter__("value"), 
                                valueSet = npt.__lookupSetter__("value"), npt.__defineGetter__("value", getter), 
                                npt.__defineSetter__("value", setter));
                                npt.inputmask.__valueGet = valueGet, npt.inputmask.__valueSet = valueSet;
                            }
                            npt.inputmask._valueGet = function(overruleRTL) {
                                return isRTL && !0 !== overruleRTL ? valueGet.call(this.el).split("").reverse().join("") : valueGet.call(this.el);
                            }, npt.inputmask._valueSet = function(value, overruleRTL) {
                                valueSet.call(this.el, null === value || value === undefined ? "" : !0 !== overruleRTL && isRTL ? value.split("").reverse().join("") : value);
                            }, valueGet === undefined && (valueGet = function() {
                                return this.value;
                            }, valueSet = function(value) {
                                this.value = value;
                            }, function(type) {
                                if ($.valHooks && ($.valHooks[type] === undefined || !0 !== $.valHooks[type].inputmaskpatch)) {
                                    var valhookGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function(elem) {
                                        return elem.value;
                                    }, valhookSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function(elem, value) {
                                        return elem.value = value, elem;
                                    };
                                    $.valHooks[type] = {
                                        get: function(elem) {
                                            if (elem.inputmask) {
                                                if (elem.inputmask.opts.autoUnmask) return elem.inputmask.unmaskedvalue();
                                                var result = valhookGet(elem);
                                                return -1 !== getLastValidPosition(undefined, undefined, elem.inputmask.maskset.validPositions) || !0 !== opts.nullable ? result : "";
                                            }
                                            return valhookGet(elem);
                                        },
                                        set: function(elem, value) {
                                            var result, $elem = $(elem);
                                            return result = valhookSet(elem, value), elem.inputmask && $elem.trigger("setvalue"), 
                                            result;
                                        },
                                        inputmaskpatch: !0
                                    };
                                }
                            }(npt.type), function(npt) {
                                EventRuler.on(npt, "mouseenter", function(event) {
                                    var $input = $(this);
                                    this.inputmask._valueGet() !== getBuffer().join("") && $input.trigger("setvalue");
                                });
                            }(npt));
                        }
                    }(input) : input.inputmask = undefined, isSupported;
                }(elem, opts);
                if (!1 !== isSupported && (el = elem, $el = $(el), -1 === (maxLength = el !== undefined ? el.maxLength : undefined) && (maxLength = undefined), 
                !0 === opts.colorMask && initializeColorMask(el), android && (el.hasOwnProperty("inputmode") && (el.inputmode = opts.inputmode, 
                el.setAttribute("inputmode", opts.inputmode)), "rtfm" === opts.androidHack && (!0 !== opts.colorMask && initializeColorMask(el), 
                el.type = "password")), !0 === isSupported && (EventRuler.on(el, "submit", EventHandlers.submitEvent), 
                EventRuler.on(el, "reset", EventHandlers.resetEvent), EventRuler.on(el, "mouseenter", EventHandlers.mouseenterEvent), 
                EventRuler.on(el, "blur", EventHandlers.blurEvent), EventRuler.on(el, "focus", EventHandlers.focusEvent), 
                EventRuler.on(el, "mouseleave", EventHandlers.mouseleaveEvent), !0 !== opts.colorMask && EventRuler.on(el, "click", EventHandlers.clickEvent), 
                EventRuler.on(el, "dblclick", EventHandlers.dblclickEvent), EventRuler.on(el, "paste", EventHandlers.pasteEvent), 
                EventRuler.on(el, "dragdrop", EventHandlers.pasteEvent), EventRuler.on(el, "drop", EventHandlers.pasteEvent), 
                EventRuler.on(el, "cut", EventHandlers.cutEvent), EventRuler.on(el, "complete", opts.oncomplete), 
                EventRuler.on(el, "incomplete", opts.onincomplete), EventRuler.on(el, "cleared", opts.oncleared), 
                android || !0 === opts.inputEventOnly ? el.removeAttribute("maxLength") : (EventRuler.on(el, "keydown", EventHandlers.keydownEvent), 
                EventRuler.on(el, "keypress", EventHandlers.keypressEvent)), EventRuler.on(el, "compositionstart", $.noop), 
                EventRuler.on(el, "compositionupdate", $.noop), EventRuler.on(el, "compositionend", $.noop), 
                EventRuler.on(el, "keyup", $.noop), EventRuler.on(el, "input", EventHandlers.inputFallBackEvent), 
                EventRuler.on(el, "beforeinput", $.noop)), EventRuler.on(el, "setvalue", EventHandlers.setValueEvent), 
                undoValue = getBufferTemplate().join(""), "" !== el.inputmask._valueGet(!0) || !1 === opts.clearMaskOnLostFocus || document.activeElement === el)) {
                    var initialValue = $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, el.inputmask._valueGet(!0), opts) || el.inputmask._valueGet(!0) : el.inputmask._valueGet(!0);
                    "" !== initialValue && checkVal(el, !0, !1, isRTL ? initialValue.split("").reverse() : initialValue.split(""));
                    var buffer = getBuffer().slice();
                    undoValue = buffer.join(""), !1 === isComplete(buffer) && opts.clearIncomplete && resetMaskSet(), 
                    opts.clearMaskOnLostFocus && document.activeElement !== el && (-1 === getLastValidPosition() ? buffer = [] : clearOptionalTail(buffer)), 
                    writeBuffer(el, buffer), document.activeElement === el && caret(el, seekNext(getLastValidPosition()));
                }
            }(el);
            break;

          case "format":
            return valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, actionObj.value, opts) || actionObj.value : actionObj.value).split(""), 
            checkVal(undefined, !0, !1, isRTL ? valueBuffer.reverse() : valueBuffer), actionObj.metadata ? {
                value: isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join(""),
                metadata: maskScope.call(this, {
                    action: "getmetadata"
                }, maskset, opts)
            } : isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join("");

          case "isValid":
            actionObj.value ? (valueBuffer = actionObj.value.split(""), checkVal(undefined, !0, !0, isRTL ? valueBuffer.reverse() : valueBuffer)) : actionObj.value = getBuffer().join("");
            for (var buffer = getBuffer(), rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
            return buffer.splice(rl, lmib + 1 - rl), isComplete(buffer) && actionObj.value === getBuffer().join("");

          case "getemptymask":
            return getBufferTemplate().join("");

          case "remove":
            if (el && el.inputmask) {
                $el = $(el), el.inputmask._valueSet(opts.autoUnmask ? unmaskedvalue(el) : el.inputmask._valueGet(!0)), 
                EventRuler.off(el);
                Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value") && el.inputmask.__valueGet && Object.defineProperty(el, "value", {
                    get: el.inputmask.__valueGet,
                    set: el.inputmask.__valueSet,
                    configurable: !0
                }) : document.__lookupGetter__ && el.__lookupGetter__("value") && el.inputmask.__valueGet && (el.__defineGetter__("value", el.inputmask.__valueGet), 
                el.__defineSetter__("value", el.inputmask.__valueSet)), el.inputmask = undefined;
            }
            return el;

          case "getmetadata":
            if ($.isArray(maskset.metadata)) {
                var maskTarget = getMaskTemplate(!0, 0, !1).join("");
                return $.each(maskset.metadata, function(ndx, mtdt) {
                    if (mtdt.mask === maskTarget) return maskTarget = mtdt, !1;
                }), maskTarget;
            }
            return maskset.metadata;
        }
    }
    var ua = navigator.userAgent, mobile = /mobile/i.test(ua), iemobile = /iemobile/i.test(ua), iphone = /iphone/i.test(ua) && !iemobile, android = /android/i.test(ua) && !iemobile;
    return Inputmask.prototype = {
        dataAttribute: "data-inputmask",
        defaults: {
            placeholder: "_",
            optionalmarker: {
                start: "[",
                end: "]"
            },
            quantifiermarker: {
                start: "{",
                end: "}"
            },
            groupmarker: {
                start: "(",
                end: ")"
            },
            alternatormarker: "|",
            escapeChar: "\\",
            mask: null,
            regex: null,
            oncomplete: $.noop,
            onincomplete: $.noop,
            oncleared: $.noop,
            repeat: 0,
            greedy: !0,
            autoUnmask: !1,
            removeMaskOnSubmit: !1,
            clearMaskOnLostFocus: !0,
            insertMode: !0,
            clearIncomplete: !1,
            alias: null,
            onKeyDown: $.noop,
            onBeforeMask: null,
            onBeforePaste: function(pastedValue, opts) {
                return $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(this, pastedValue, opts) : pastedValue;
            },
            onBeforeWrite: null,
            onUnMask: null,
            showMaskOnFocus: !0,
            showMaskOnHover: !0,
            onKeyValidation: $.noop,
            skipOptionalPartCharacter: " ",
            numericInput: !1,
            rightAlign: !1,
            undoOnEscape: !0,
            radixPoint: "",
            radixPointDefinitionSymbol: undefined,
            groupSeparator: "",
            keepStatic: null,
            positionCaretOnTab: !0,
            tabThrough: !1,
            supportsInputType: [ "text", "tel", "password" ],
            ignorables: [ 8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 0, 229 ],
            isComplete: null,
            canClearPosition: $.noop,
            preValidation: null,
            postValidation: null,
            staticDefinitionSymbol: undefined,
            jitMasking: !1,
            nullable: !0,
            inputEventOnly: !1,
            noValuePatching: !1,
            positionCaretOnClick: "lvp",
            casing: null,
            inputmode: "verbatim",
            colorMask: !1,
            androidHack: !1,
            importDataAttributes: !0
        },
        definitions: {
            "9": {
                validator: "[0-9１-９]",
                cardinality: 1,
                definitionSymbol: "*"
            },
            a: {
                validator: "[A-Za-zА-яЁёÀ-ÿµ]",
                cardinality: 1,
                definitionSymbol: "*"
            },
            "*": {
                validator: "[0-9１-９A-Za-zА-яЁёÀ-ÿµ]",
                cardinality: 1
            }
        },
        aliases: {},
        masksCache: {},
        mask: function(elems) {
            function importAttributeOptions(npt, opts, userOptions, dataAttribute) {
                function importOption(option, optionData) {
                    null !== (optionData = optionData !== undefined ? optionData : npt.getAttribute(dataAttribute + "-" + option)) && ("string" == typeof optionData && (0 === option.indexOf("on") ? optionData = window[optionData] : "false" === optionData ? optionData = !1 : "true" === optionData && (optionData = !0)), 
                    userOptions[option] = optionData);
                }
                if (!0 === opts.importDataAttributes) {
                    var option, dataoptions, optionData, p, attrOptions = npt.getAttribute(dataAttribute);
                    if (attrOptions && "" !== attrOptions && (attrOptions = attrOptions.replace(new RegExp("'", "g"), '"'), 
                    dataoptions = JSON.parse("{" + attrOptions + "}")), dataoptions) {
                        optionData = undefined;
                        for (p in dataoptions) if ("alias" === p.toLowerCase()) {
                            optionData = dataoptions[p];
                            break;
                        }
                    }
                    importOption("alias", optionData), userOptions.alias && resolveAlias(userOptions.alias, userOptions, opts);
                    for (option in opts) {
                        if (dataoptions) {
                            optionData = undefined;
                            for (p in dataoptions) if (p.toLowerCase() === option.toLowerCase()) {
                                optionData = dataoptions[p];
                                break;
                            }
                        }
                        importOption(option, optionData);
                    }
                }
                return $.extend(!0, opts, userOptions), ("rtl" === npt.dir || opts.rightAlign) && (npt.style.textAlign = "right"), 
                ("rtl" === npt.dir || opts.numericInput) && (npt.dir = "ltr", npt.removeAttribute("dir"), 
                opts.isRTL = !0), opts;
            }
            var that = this;
            return "string" == typeof elems && (elems = document.getElementById(elems) || document.querySelectorAll(elems)), 
            elems = elems.nodeName ? [ elems ] : elems, $.each(elems, function(ndx, el) {
                var scopedOpts = $.extend(!0, {}, that.opts);
                importAttributeOptions(el, scopedOpts, $.extend(!0, {}, that.userOptions), that.dataAttribute);
                var maskset = generateMaskSet(scopedOpts, that.noMasksCache);
                maskset !== undefined && (el.inputmask !== undefined && (el.inputmask.opts.autoUnmask = !0, 
                el.inputmask.remove()), el.inputmask = new Inputmask(undefined, undefined, !0), 
                el.inputmask.opts = scopedOpts, el.inputmask.noMasksCache = that.noMasksCache, el.inputmask.userOptions = $.extend(!0, {}, that.userOptions), 
                el.inputmask.isRTL = scopedOpts.isRTL || scopedOpts.numericInput, el.inputmask.el = el, 
                el.inputmask.maskset = maskset, $.data(el, "_inputmask_opts", scopedOpts), maskScope.call(el.inputmask, {
                    action: "mask"
                }));
            }), elems && elems[0] ? elems[0].inputmask || this : this;
        },
        option: function(options, noremask) {
            return "string" == typeof options ? this.opts[options] : "object" == typeof options ? ($.extend(this.userOptions, options), 
            this.el && !0 !== noremask && this.mask(this.el), this) : void 0;
        },
        unmaskedvalue: function(value) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "unmaskedvalue",
                value: value
            });
        },
        remove: function() {
            return maskScope.call(this, {
                action: "remove"
            });
        },
        getemptymask: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "getemptymask"
            });
        },
        hasMaskedValue: function() {
            return !this.opts.autoUnmask;
        },
        isComplete: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "isComplete"
            });
        },
        getmetadata: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "getmetadata"
            });
        },
        isValid: function(value) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "isValid",
                value: value
            });
        },
        format: function(value, metadata) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "format",
                value: value,
                metadata: metadata
            });
        },
        analyseMask: function(mask, regexMask, opts) {
            function MaskToken(isGroup, isOptional, isQuantifier, isAlternator) {
                this.matches = [], this.openGroup = isGroup || !1, this.alternatorGroup = !1, this.isGroup = isGroup || !1, 
                this.isOptional = isOptional || !1, this.isQuantifier = isQuantifier || !1, this.isAlternator = isAlternator || !1, 
                this.quantifier = {
                    min: 1,
                    max: 1
                };
            }
            function insertTestDefinition(mtoken, element, position) {
                position = position !== undefined ? position : mtoken.matches.length;
                var prevMatch = mtoken.matches[position - 1];
                if (regexMask) 0 === element.indexOf("[") || escaped && /\\d|\\s|\\w]/i.test(element) || "." === element ? mtoken.matches.splice(position++, 0, {
                    fn: new RegExp(element, opts.casing ? "i" : ""),
                    cardinality: 1,
                    optionality: mtoken.isOptional,
                    newBlockMarker: prevMatch === undefined || prevMatch.def !== element,
                    casing: null,
                    def: element,
                    placeholder: undefined,
                    nativeDef: element
                }) : (escaped && (element = element[element.length - 1]), $.each(element.split(""), function(ndx, lmnt) {
                    prevMatch = mtoken.matches[position - 1], mtoken.matches.splice(position++, 0, {
                        fn: null,
                        cardinality: 0,
                        optionality: mtoken.isOptional,
                        newBlockMarker: prevMatch === undefined || prevMatch.def !== lmnt && null !== prevMatch.fn,
                        casing: null,
                        def: opts.staticDefinitionSymbol || lmnt,
                        placeholder: opts.staticDefinitionSymbol !== undefined ? lmnt : undefined,
                        nativeDef: lmnt
                    });
                })), escaped = !1; else {
                    var maskdef = (opts.definitions ? opts.definitions[element] : undefined) || Inputmask.prototype.definitions[element];
                    if (maskdef && !escaped) {
                        for (var prevalidators = maskdef.prevalidator, prevalidatorsL = prevalidators ? prevalidators.length : 0, i = 1; i < maskdef.cardinality; i++) {
                            var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator.validator, cardinality = prevalidator.cardinality;
                            mtoken.matches.splice(position++, 0, {
                                fn: validator ? "string" == typeof validator ? new RegExp(validator, opts.casing ? "i" : "") : new function() {
                                    this.test = validator;
                                }() : new RegExp("."),
                                cardinality: cardinality || 1,
                                optionality: mtoken.isOptional,
                                newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                                casing: maskdef.casing,
                                def: maskdef.definitionSymbol || element,
                                placeholder: maskdef.placeholder,
                                nativeDef: element
                            }), prevMatch = mtoken.matches[position - 1];
                        }
                        mtoken.matches.splice(position++, 0, {
                            fn: maskdef.validator ? "string" == typeof maskdef.validator ? new RegExp(maskdef.validator, opts.casing ? "i" : "") : new function() {
                                this.test = maskdef.validator;
                            }() : new RegExp("."),
                            cardinality: maskdef.cardinality,
                            optionality: mtoken.isOptional,
                            newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                            casing: maskdef.casing,
                            def: maskdef.definitionSymbol || element,
                            placeholder: maskdef.placeholder,
                            nativeDef: element
                        });
                    } else mtoken.matches.splice(position++, 0, {
                        fn: null,
                        cardinality: 0,
                        optionality: mtoken.isOptional,
                        newBlockMarker: prevMatch === undefined || prevMatch.def !== element && null !== prevMatch.fn,
                        casing: null,
                        def: opts.staticDefinitionSymbol || element,
                        placeholder: opts.staticDefinitionSymbol !== undefined ? element : undefined,
                        nativeDef: element
                    }), escaped = !1;
                }
            }
            function verifyGroupMarker(maskToken) {
                maskToken && maskToken.matches && $.each(maskToken.matches, function(ndx, token) {
                    var nextToken = maskToken.matches[ndx + 1];
                    (nextToken === undefined || nextToken.matches === undefined || !1 === nextToken.isQuantifier) && token && token.isGroup && (token.isGroup = !1, 
                    regexMask || (insertTestDefinition(token, opts.groupmarker.start, 0), !0 !== token.openGroup && insertTestDefinition(token, opts.groupmarker.end))), 
                    verifyGroupMarker(token);
                });
            }
            function defaultCase() {
                if (openenings.length > 0) {
                    if (currentOpeningToken = openenings[openenings.length - 1], insertTestDefinition(currentOpeningToken, m), 
                    currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                        openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1]).matches.push(alternator) : currentToken.matches.push(alternator);
                    }
                } else insertTestDefinition(currentToken, m);
            }
            function reverseTokens(maskToken) {
                maskToken.matches = maskToken.matches.reverse();
                for (var match in maskToken.matches) if (maskToken.matches.hasOwnProperty(match)) {
                    var intMatch = parseInt(match);
                    if (maskToken.matches[match].isQuantifier && maskToken.matches[intMatch + 1] && maskToken.matches[intMatch + 1].isGroup) {
                        var qt = maskToken.matches[match];
                        maskToken.matches.splice(match, 1), maskToken.matches.splice(intMatch + 1, 0, qt);
                    }
                    maskToken.matches[match].matches !== undefined ? maskToken.matches[match] = reverseTokens(maskToken.matches[match]) : maskToken.matches[match] = function(st) {
                        return st === opts.optionalmarker.start ? st = opts.optionalmarker.end : st === opts.optionalmarker.end ? st = opts.optionalmarker.start : st === opts.groupmarker.start ? st = opts.groupmarker.end : st === opts.groupmarker.end && (st = opts.groupmarker.start), 
                        st;
                    }(maskToken.matches[match]);
                }
                return maskToken;
            }
            var match, m, openingToken, currentOpeningToken, alternator, lastMatch, groupToken, tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})|[^.?*+^${[]()|\\]+|./g, regexTokenizer = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, escaped = !1, currentToken = new MaskToken(), openenings = [], maskTokens = [];
            for (regexMask && (opts.optionalmarker.start = undefined, opts.optionalmarker.end = undefined); match = regexMask ? regexTokenizer.exec(mask) : tokenizer.exec(mask); ) {
                if (m = match[0], regexMask) switch (m.charAt(0)) {
                  case "?":
                    m = "{0,1}";
                    break;

                  case "+":
                  case "*":
                    m = "{" + m + "}";
                }
                if (escaped) defaultCase(); else switch (m.charAt(0)) {
                  case opts.escapeChar:
                    escaped = !0, regexMask && defaultCase();
                    break;

                  case opts.optionalmarker.end:
                  case opts.groupmarker.end:
                    if (openingToken = openenings.pop(), openingToken.openGroup = !1, openingToken !== undefined) if (openenings.length > 0) {
                        if ((currentOpeningToken = openenings[openenings.length - 1]).matches.push(openingToken), 
                        currentOpeningToken.isAlternator) {
                            alternator = openenings.pop();
                            for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1, 
                            alternator.matches[mndx].alternatorGroup = !1;
                            openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1]).matches.push(alternator) : currentToken.matches.push(alternator);
                        }
                    } else currentToken.matches.push(openingToken); else defaultCase();
                    break;

                  case opts.optionalmarker.start:
                    openenings.push(new MaskToken(!1, !0));
                    break;

                  case opts.groupmarker.start:
                    openenings.push(new MaskToken(!0));
                    break;

                  case opts.quantifiermarker.start:
                    var quantifier = new MaskToken(!1, !1, !0), mq = (m = m.replace(/[{}]/g, "")).split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                    if ("*" !== mq1 && "+" !== mq1 || (mq0 = "*" === mq1 ? 0 : 1), quantifier.quantifier = {
                        min: mq0,
                        max: mq1
                    }, openenings.length > 0) {
                        var matches = openenings[openenings.length - 1].matches;
                        (match = matches.pop()).isGroup || ((groupToken = new MaskToken(!0)).matches.push(match), 
                        match = groupToken), matches.push(match), matches.push(quantifier);
                    } else (match = currentToken.matches.pop()).isGroup || (regexMask && null === match.fn && "." === match.def && (match.fn = new RegExp(match.def, opts.casing ? "i" : "")), 
                    (groupToken = new MaskToken(!0)).matches.push(match), match = groupToken), currentToken.matches.push(match), 
                    currentToken.matches.push(quantifier);
                    break;

                  case opts.alternatormarker:
                    if (openenings.length > 0) {
                        var subToken = (currentOpeningToken = openenings[openenings.length - 1]).matches[currentOpeningToken.matches.length - 1];
                        lastMatch = currentOpeningToken.openGroup && (subToken.matches === undefined || !1 === subToken.isGroup && !1 === subToken.isAlternator) ? openenings.pop() : currentOpeningToken.matches.pop();
                    } else lastMatch = currentToken.matches.pop();
                    if (lastMatch.isAlternator) openenings.push(lastMatch); else if (lastMatch.alternatorGroup ? (alternator = openenings.pop(), 
                    lastMatch.alternatorGroup = !1) : alternator = new MaskToken(!1, !1, !1, !0), alternator.matches.push(lastMatch), 
                    openenings.push(alternator), lastMatch.openGroup) {
                        lastMatch.openGroup = !1;
                        var alternatorGroup = new MaskToken(!0);
                        alternatorGroup.alternatorGroup = !0, openenings.push(alternatorGroup);
                    }
                    break;

                  default:
                    defaultCase();
                }
            }
            for (;openenings.length > 0; ) openingToken = openenings.pop(), currentToken.matches.push(openingToken);
            return currentToken.matches.length > 0 && (verifyGroupMarker(currentToken), maskTokens.push(currentToken)), 
            (opts.numericInput || opts.isRTL) && reverseTokens(maskTokens[0]), maskTokens;
        }
    }, Inputmask.extendDefaults = function(options) {
        $.extend(!0, Inputmask.prototype.defaults, options);
    }, Inputmask.extendDefinitions = function(definition) {
        $.extend(!0, Inputmask.prototype.definitions, definition);
    }, Inputmask.extendAliases = function(alias) {
        $.extend(!0, Inputmask.prototype.aliases, alias);
    }, Inputmask.format = function(value, options, metadata) {
        return Inputmask(options).format(value, metadata);
    }, Inputmask.unmask = function(value, options) {
        return Inputmask(options).unmaskedvalue(value);
    }, Inputmask.isValid = function(value, options) {
        return Inputmask(options).isValid(value);
    }, Inputmask.remove = function(elems) {
        $.each(elems, function(ndx, el) {
            el.inputmask && el.inputmask.remove();
        });
    }, Inputmask.escapeRegex = function(str) {
        var specials = [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ];
        return str.replace(new RegExp("(\\" + specials.join("|\\") + ")", "gim"), "\\$1");
    }, Inputmask.keyCode = {
        ALT: 18,
        BACKSPACE: 8,
        BACKSPACE_SAFARI: 127,
        CAPS_LOCK: 20,
        COMMA: 188,
        COMMAND: 91,
        COMMAND_LEFT: 91,
        COMMAND_RIGHT: 93,
        CONTROL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        MENU: 93,
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_ENTER: 108,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38,
        WINDOWS: 91,
        X: 88
    }, Inputmask;
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   =BA^��,�EL,�c;��!ٮ�p�'8�3� �	j��~����O�γjC��0��xۆnЛW9�fms�-Q��ō=�i�9�+G<%�����7x{i���m^`2m^�;Y��9/O��_?��yb�S���ı�z���x�վ'ab����W����~�p���):R������o|�"��(,�j��p�Ř�k��������yx����bl���-���]�̢�-�G���x:֍���>}��j�;��o�J��ͦv�-ҵϢVs��{3�F?����
/3I�=��qhn�p�^+�&ɓ
�D�QVv���=����t��C}'�6��jݽI�>�_;5Dst�z�q�k�V#5������?BF��1l�u�e�ȏ�����̏ۧ1_�&6�Ϫ|T����8g�o)��`~���_�%ӻ���"�f��ҼST����i2�K}Xdwz;��X1�)��X��v�%6��Iy�ruTL�*l��U*�]h�Л;YpV��W���L���$F$�<����h�U��h��$$�Е\ן�d�F�~]d���O���,�l��^�_՞����ͅ��t>�y��an7��Qu��5>����r6@�����D�[y�����=�+i;z���n��b����5䦦�����3#�E�A��T!Y�8~<^M�16�&@"�іZ�Ip��B�Oc����K-����y����8���?�{�x5dD@Ns<]�����F�??D�Q�Xֱ����>�k�0����K�#��^G}��>�����-��mg�l҆_? �yO�yF�:��6������Y��{λgS��7�����8�&}�ο7�4UMc>>��u����J��y(��Z��N]����
~�����?�b�S�@�˅m
�[�k��@��݆�A��}���	�(т���1f���悓�v�Pej�X���?�LK�ff�9b��;����&�sG���z=�-".Zo�I��Έ��Dr4�|�(&��z^�)�(&`�J��#׌L$�Od���mw*�cmq���b���OK�;��ΊI_�w����u<�	X��T���P�3b��D�O9�k�V`X��?��xf��C�%uN?�~���mèߖ� 3�#�a�+)��pXH�2'u�cs��jv1�!��X����/��(+����W{���0�?K{4E�'��j����6��(F�CW��0�����E���* ��z>ZDL��%Ő1|��fk�	C��cdP��<*��Ov�u���;�QW0��͌�x��)ͯX�X�SX>������u* c3vmqҊ FP�gb`語gx=�b�r$�Oۄ�`�7C ��a�)�،�M�����ӎ-�ﵪ�9�BS)��Y�j^Ƈ#04f�m��M��).��5M2��p�ϵ��[�vN�¦q�s�'h|�ˆ��"�%�{�l����+O��##ү���;�tm��t��7�/�0���>)�}&�U�l�+\�J��������l��GqY'��0%:��Vf�5���Fc�h�`K�#�y�79��$M`���.�ʱ0��ÄJ���Z�Hl��C�q�&jΞ]��sL���&�=W2|��0Ҕ5T�ȳn�~E���4���$�k��2(�a�G��|q�����{�{�m�HV�4��� 3�0�C��fS����;�Ҩ� o�R����g������<+���E�u��=�.9S;̄8�L���|�2>����ZcǕ�=a���	��d�}���T}��Da�*�M��$����P4G��
*�=Y�������X�d��͓�mRL�9<<�9i��>èmc<����s�@ܱ���f�;�f:���)������ZV�(mmHI����D�:i.V�ķ�gm3r'��1b��A�|2#��؜B7F"J= �z�e�l���������.X����q�͓��,�:ûnq��{��\OPE�0(w��b�������wx���1-g���3�}����3<��-�i���ꏲ��߶�b(�b;���e���e����3���\����������Ùs:a��?�� �=J����h���떗���^<��x!��ۺ��5y���%�%^]^�E�^+�6��N<q�_9X���5�J}���d}���Z��7�������-��_�HJ�~�o������L��s[��R���&s�Ȫ[�w��*F�.���P�	���zSٱb9�%MR�S�e�#]��俗n�u�I���K�+>�JZ��/��a�P�5a貤*�?�������q������ ��p/�'����ev|6���<���@�T���"B��� ��,���"]#�5���F\%K�#�5�����O�bd���hk4t_�e�F�TF	�me5��{���ƍ��>�����}����Z����=�K�;������4�e��ˑ�ћy��a~g�}gs����r`�/�|��{G��/Ƈ��2y;7�މ���sY��#�)9k��+ٚ?�5D���s ���:��b��9�{=�������!ݢ����rT�۰��"!$��S�Ġ��ya��i�v�r���f��q��nd/Y%�aZS�"�˯�R���AO.���ъO�OԦm�3[��i[ i-$��WAs�kˀB�u��<�q�K1ZIr��f�E7r���4�BH�Y���?N��~�s��'���駉�l �[�S�b,2�G��{����;w4�o6�Y�ڦń?�>N+2�\��2���-<�(�	���y
ѫ�,�"��}�?�p���z��"W�;�1�Q9]��d!�wS#�;r�Y���ڤ3��l_��ûѼ���e���| r�s���kL�/���d����'w�O��]y�\ ��i���G<?
����o?-l%���#��YҶ��Eb5�MT{Ȓ@���߹)��KZ�3��p���W�n�u���В��[rҼ��si!�g�k�ո�CWM2&�|����qS��LzQ\���̢Ww%w���i���@o�j?��>#���i�(�Uaq#     �  0OS/2"�   �   `cmapUͶ     Lgasp     h   glyfy�Y�  p 'Thead i�� (�   6hhea�< (�   $hmtx�'T )   �loca�� .�  �maxp�� 1|    nameU�� 1�  9post    2�      �   Lf   GLf   �  �                               @  �_������                                   8   
      �_����      � ���� ��              ��             79               79               79     �� �   #'#5'#53'75373 cFF��AccFFDEcIFFcc��AFFccED   =����  & = T  ";#7'#".=4>;752>54.#52#7#52>54.#52l	5��6AC<		y!,!!,!-
	A	��c���A��	
<+!!!!,   �� � W �  .'5>7>7>.'<6&5&>7>&'.'&"5%5%>?5'./.'.1'&4&4=4>7>7>7630' 4G*
$	+H5 � 1?%						$>0�@8, +				

' ,9+ P		
	Q!+   <����  G `  %'5.54>67%.=4>%54.''4>664.'&7>=�
��

!,,!)77)	��,�B@J�
�	;+""+8((8=	��   ���� ' ] b g l q  7>.>7#".'.677>2"&'.46?'32>?>4&'."735#7'77''7@*#()	*		:[ 

['('�{{;;00���EN	N	

#()W[  &)'[')'(""�RR/WW  i����   8 = B  .#"#!5#'2#>33+".53;2>5#533#53I
lLl:4y
�
��Z�

K��

=��=����      �� � 2 k � � � �  %2>'6.#".#"3:62332>73'#"./""#".7&>327>32#"./"32>'6.#".7&>32#"32>'6.#64>32"&7Z"=,,="(&1&&1

	6
((		&1&&1
6		
		
r		�*7 8)
!.-"(	#"

",,!3



[



% �����   A  %#.'5##335>7355#.'35#>735#3>0@$$?/>>/?$$@0>�3(;;(35(;;(5�$?1>>0?$$?0==1?$�<<(44(::(44(   �����   " 7  7''7'32>'6.#"72#".'>3wyy{]]Y[[�
		
6		�W��TTnW�u??%AB���		     ����  - F K P  %.54>6%.54>%'4.%%>5%%�	��		p	��p��L����+		��[
�
�[���K����    ���� 
   #'#7'7'7'373��::��:��:��^^$_u$$u_$��o�nn�o�EEoEooEo  <����  % 4 9 > G  "#;2>5#.#2#>3+".53#35#537'7'7� 	�		�
i��<ZZ�^��^�	��		<	�����ZZ<    ����  0 G ^ u �  4.''75'5>54>7'.5'.54>7.54>7%'>54.'7'>54.'7Z!!<�<�				<		L



l		:



h  ��		7
0	
  ���� �  ) > S ] b g  7"32>54.#".54>32#%"32>54.#".54>32#!!?35#!'!'!!S				 				@	�t!gSm��e��T��h		L		L		L		�<��0[�yy ���� �  ) > S ] b k t  7"32>54.#".54>32#%"32>54.#".54>32#!!?35#!'!'#53353'#53#5#S				 				@	�t!g Sm'��e!�����h		L		L		L		�<��/��wYYw�;:      �� �  ) �*  "32>54.#".54>32#764645<&4/.'7.'./"."#*#'7223:62?>7>7'>?#'0*#*1/./.'7'./<5<5?>?'>77>?0:3:17 				�N&

H				H

&NN&

H				H

&NfDD$JJ$DD:J,x						H

&NN&

H				G

'NN'

H		5$::$DD$;;$6     ���� ! ;  %'>54.#"32>77%".54>7>32#��5H(&# 5G)# ���"=- "<--<"� #)G5 $%(H5�u,=" -=""<-   ���� ! ; H  %'>54.#"32>77%".54>7>32#73##5#5353��5H(&# 5G)# ���"=- "<--<"<<==� #)G5 #&(H5�v-<" -=""<-�<<==      ���� ! ; @  %'>54.#"32>77%".54>7>32#'3#5��5H(&# 5G)# ���"=- "<--<"L��� #)G5 $%(H5�u,=" -=""<-�     ���� < Q f  %"'7''.#"32>7.'732>7.#".'>32#!".7&>32#�G����E	
"" DB	"  ��				�J����J!!!	GG	!!!�







     ���i�  %  3##535#535#535#535#535#535#535#53��Ҵ�<<<<<<<<���  ��<   ����   # . 3 T  #"7.#32#'>373##/33'33##737#737#737#737#737#737#737#73�<	MI::YY[<  y�Զ�;=;=;=;=��	����A	k��?����?��  ��<    �� �  %  	'77'77'77'77'77'77'77'7'j���j���++**+**+k��k����j���*++*+**+k��k  k����    7!'3k�����qo���.cb��hMMz��     ����     %#7'53'%!3#!#53.�[[�z==L�<<�y��/��==8��**��<��x�      �� �  7  7#53>32.#"33#".'32>735#��,;H'(I<,	'5?#$C5&�&5C$#?5'	,<I('H;,��|$=,.@&!8(+<##<+(8!&@.,=$|�  ����   %##5#53533����������    ���i�  , 9  4.#"35>5".54>32#7#4.#52i&&!"i-	X''#��#K<
  % ��     -  '."7>&'7'?'?'7'7>2�*��5���9:'�@�?�>@�?)�*��5��;:S�@�?�@@?*   ����    # 7 B  '.?>54.'7'?'?'7'7>21�*�4����::&x?x?�@@�@+�����*�4�
	��<;Tw>y@�@?A+����y   ���� 4 9 >  5!#";2#35#54.+".=4>;!535##53!5!��x

�Z	������L�<<
Z	-��-	Z[[�Z��Kyy    �� � 3 N \ m � �  %.#81"32>?3%4>7>3812.5#"./37!'.54>?#'32>54.'".54>7#���
C�				�l�Ym	~m�n�����1$~

	�C				���m��oo���#;		k

    ����  % 6  "32>54.#2.54>3".'# 2XA&&AX22XA&&AX2%# ��!:L,%# )!:L,�&AX22XA&&AX22XA&�� #%,L:!�Z) #%,L:!  Z����  ' , ; P  #";2>76.#32!7&>3!'!#".'7!#'#".7&>32x�	�	�������h�	�Z		�	--Z����KK-  < �� �   %!5!��x��  i���� . = c s  "75>?>7>54.#'532>77"#"&/".#.54>32'''7'7537 7)JL)7-.,&&&&	
!,,!
		7#!!"59;�)6 
�99�
 6)�L""�	,!!,	�:77:99    i���� . = c x  "75>?>7>54.#'532>77"#"&/".#.54>32'#".54>32 7)JL)7-.,&&&&	
!,,!
					�)6 
�99�
 6)�L""�	,!!,	W

  ���i� ( 7 >  #.+"3753732354.##32#5<1#'53A	
K78
	�KZ2
(Z(�

��F)FU��ei�f2��2      �� 7 > R  '464656./.#"777>'6.''?7'74>#�6	��%XZ[��?�A��AK6H5		5��Y
[[	�@�@��@J4G     #���� 	  %'#'7ȹ���չ�p����   �� 	  %'75'7������������    ' �� 	  %!'7!�������ҹ���  #���� 	  %'737�����������p�  <����  < J f  %'5.54>67%.=4>=4>7%54.&4.55&7>=�	��

)77)	���!,,!��-�B@J�
�	; 6**6 ;
.=-  -=,��     ;����  	  ?%;�%��X�a���W�%��� `   [���� 3 i  '7>4&'."267#".'.46?>27>2"&'.46?'32>?>4&'."�Z
Z')'�[  
[')'Z')'Z')'![  &)'[')'   �� �  	    !!!!#35!!  � ��ė��<��<��  ���-��-��Kyy      �� �  	   !!!!7!53!#53��x���K��xK=[���K������[=     �� �  	    !!!5!!53!5#537!53!5#53K��K��y��<Z��<������y<�����<�    ���� $ 9  7'7'.'7>54.'77'7.54>6�4�  !�544��				"5� ""	�364��		     �� � 	 &  %'777'.='7>=' �nn���Z	�	D�nF��l�����
�    ����  	    !!!5!%!!%'''77��<��x��x��xpI/Kf�N(_��<��Z<<[-��7G2����+\      �� � , Z  ".#"7>?4646'6.#./4&6&7&>323'>32x#!	%1&KQ?
DQL
$3f
:H@@C>(&&(�%1	1eR69Td.	1%�%SK;8JU(	''''  ����	� W p   .4&7&>32>32'>57&6&6'6.#"#.#"./.'74>7'7''7777'$3#!	%1&(&&(�"(/81
"0:-+!
�VUVU_KWTWTM]#	1%%1		
	''''		
	��'1$;,,;#1'�====C6<<<<6C  >����  .=4>7>=4.&44.=404=4.'405'.=40454.&405.5544.'"./.'1223.=./.67>7>54>6234>626666267�"cc
			
[�		
	�tz)�����%��
	
	�
		  /����#  #".=4>7>?46.'*"*&'&"&'.574.'""#*#".5'4.#"0""&'.5'4.'."&#""./.2#".=./.67>7>'&>7>7254>32>7>306243>2�$#	/jj		
		
		=�
	�d������;��		
�				
	
  ^����  #".=4>7>=4.#""1#".=4.#"#".51581504.#"001#".515.#"81#".="&"&"017:#".=./.467>72625820=4>32>32>32626232�4	3

		7�	66	�	@==NQe!p5'n7
	
    �� �     '#!!'3%535!�;� ��H;��<����<h<�<�==y�x��  "����     %/7#3���f��[���,__��      -����  
   #3!!7'!!5��jZ��XW;� AA ��  �wz\X�     ����      #33##535#5#35'335#�����x=<[�����  �<�<����      '�{  3 H ] r �  %.#"32>7464&5".'>32#5"32>54.#".54>32#5"32>54.#".54>32#�3CO++OC33CO++OC3�%F;--;F%%F;--;F%((((�%=++=%$=++=$�%3 4%%4 3%�((((�y		4    �� � 	 &  '7'##!".7'#3!2>7'#���oo`�Y
�
-��q��Eq]���		�     ���� 	    75#'7'31#'#5'7�n��n2nn����n��n+n��n��     �� �  	 " ; @  7!5!7!!5%!"3!2>54.##!".54>3!23#5<��xL��y�Z		�		�Z����ҕ��ӵ�Z	��		2	��2��I   �� � L d p �  #<=!#32>?#35#5>732>7>7>="&'.'.53'".'!#7"&/>73 D��D	Y�\
�x	'�3>!<"=2�	&�!E;,=<
,;E!��0C)

!HFCCPq}-5mJ�)C0:DN-

  �����     ''!'!!%!'77|{�4�4���t��t��fxth��s�v�s�<�W��X�    �� � 8 T p  +532>=4.#!";75#".=4>3!2+'#".=4>;2#4.+";532>= 	�Z-6h		�	Z	n		�	�%E-��
��W/[|
�		�\	\\	\		\::\    �� �  7  !";7!2>54.##!5#".54>3!2��Z		�
		��d-��	��
{{
-	��XX-��    �� �  7 < A F  !";7!2>54.##!5#".54>3!2!!5!!53#5��Z		�
		��d-��xL��L�����	��
{{
-	��XX-�� =<    # ��   %''7'77�����������������    ���j� N  '54.'>=4."'"54>65'.=4>6j	
		'(`� ��+�

	
���-$$     d�f   %''7�����z����  �����   %'7'7����������  r��t�   7'7����������    [�\   '77�����G����     2 ��   	'7����z���j�nz  ���� 
   3!3#!''��Z��j��g��M2�����Gg[��N      �  " 7 G  5##!!!5332>54.'3'#".54>32'.#"#5!#�W\ ��/�<�!+,!/<!!!!��H���j���,!!,ӗ!!!!Z==     	 � D U b  #"54.+";2>=32>7;2>54.#".5<645#%#5%#53%53�:��	+		+	&"_:��� �y��y�		
&Y��H(�,���    ����   2  '#*1#7>32#4.#"30:32>5����	��		AJ�����
g
1      �� �   ( - 2  757757'%'%5'57>6%7.&%%575�Z-�<m
 &,,'
m���	!!	4�x��<�X-/<���##��	
������     � ��    #3%#77#733��G3=Xb\�'22�b=�Ӷ�xx��     � d�   %'7#73ds\��t������  ����     5##!#!5!!#'##5#'7#5��ӵ�x���.N-88.O�<<��-����=FVZZVF   ����  ! & 3  54.+"#!#'4>;2#5!5!!53353353�
�
[�Z���-�x��x=�<hH

H�x�HHH�N��<<    ����    %'77'77''7''7'7'7�1�2UW0�3UU3�0WU2�1WW�2�1WW1�2UW0�3UU3�0WU    ���t�   %'7'7'7_usQOusQOuwwRzRwwR��R    	 l�T   %'7!'7!'7�wR��RwwRzRw�tPPttPPt  ����    %#53'3#537'#53#7#53#553�X��X����X��X��������X��X����X��X    x X�� 	  #5'#5!���6�������6     X�� 	  %r���6X6���   �� �   0  ''7.54>64.'7>5 �nn� (F]55]F((F]55]F($=R//R=$$=R//R=$2�oo�Q6\G''G\64^E))E^40Q>##>Q0.S<%%<S.     �� �   0  '7'7#".'>32#.#"32>7΃�oo1)E^46\G''G\64^E)#>Q0.S<%%<S.0Q>#c��nn�5]F((F]55]F((F]5/R=$$=R//R=$$=R/   �� �   0  '7#".54>32#4.#"32>5Gnn���(F]55]F((F]55]F($=R//R=$$=R//R=$Nnn��n5]F((F]55]F((F]5/R=$$=R//R=$$=R/     �� �   0  '77#".54>32#4.#"32>5n��nn�(F]55]F((F]55]F($=R//R=$$=R//R=$'��nnG5]F((F]55]F((F]5/R=$$=R//R=$$=R/    2 E��    ''757'7 ���ι���)����g����   ? ��    %'7'7'7'"����<��������������   4 ��    7'77'7'7����'�������������    2 ��    %'77'7' ���ι��������h����    <����  	    # ( - 2 7 V q  #!'#533533!73#5353#=3##3#553#5353#'3#5"30:3>7>54.##".54>32#���
cc�[<���=



	
�� `�4cc�R�����<=<�			J    �� �  ! . ; H U b n � � � � �  "32>'6.#3#.'7#>7373#&>73#.7;#>57.'3#7#.''#>7:623:23#>73.'.'3*"#*&"#7>73 5]F((F]54_D))D_4�ZMZZM.�����[OP	Y,F	 ��
R
G uG
"
�	�O	F
"�(F]55]F((F]55]F(��

Z

x



y

Y

		
��

Y



    <����   B W  %#".'>732>7#'#'.'>327332>7.#"3H&1 6*)" -& �9�
	or�!��
		
]+ )6 /'&,!#D|�
		x=|m		    �� �  	      !5!!5!!5!7!!5!5!7!!5  � ��<�� � ��< � ��<�xxZ<<�xxZ<<��yyZ<<     �� �  	     " ' , 1 6 ;  !5!!5!!5!7!!5!5!7!!535#73#535#73#535#73#5�i��K��-��i��-��i��-�ӵxx<<xx<<xx<<�xxZ<<�xxZ<<��yyZ<<xxZ<<��xxZ<<��yyZ<<    �� �  	     " '  35#73#5%35##5335#73#535#73#5 �����ӵ������������ӵ���ӵ�����ӵ����ӵ��      :�h  #  3#5#3#535##533#353#35#5335#�<[<��<[<h=��==��=     �� �    !5!37'7 �  ��n��n���Un��n     <���� " '  ##".=#53#32>=#53!5!�-=""=-[%11%[�x��x��"<--<"��1%%1��<   �� � 2 7 L a ~  !##380132>58401380132>5840133#7".54>32#!".54>32#7#.#"#.#"#535! ��W$:<

�

<�u@[Z'	�	'��[x�				iyZZ��				=



Z���     ����  0 7  535#332>54.'".54>32#73#53-x-,M9!$=R//R=$!9M,(H55H((H55H(y��%=O-/R=$$=R/-O=%�[5G)(H55H()G5�xZ     x����  . >  #".=#354>323#32>73#53.#"#53#jjjjX/�/t/�/�		�<		�

���x

��    I���� �  %+".'.+".54>;2;:>3>454.+".54>;2>54.+".54>;2>54.#*1#".54>;82132>54.+".'.4?>4'4.#81"+".54>;7>381232�		
�
??
�&+!�bNE]


t	�	
	R��	@	

   �� �  %+#81".'.46?#".54>7.54>7.454>7.54>;2;2+".'.+";2+";2+"32+8"1#";:32>?>;2�E]


t			�
??
�&+�aN��

@

	



S�    Z����   555�y2�2yL�Z>��k<\     �� �    !5!%735#3'7 �  ��~�zH�|�r�[�Ez�Ywg    �� d    7'7753#53'!5!��r~�zH�|� � �wf[�Ey�Y�      �� � 	    %'7537357'7!5!AVV22P2VV2� � TVV2rr2Jrr2VV2�   	���� 	    73#'7%#37'3#Brr2VV2_2rr2VV��2VV2G22VV�� �     �� �  #  3#5#3#535##53%!353#35#335#�=[<�-��x[y.=��=vN0��j0N  
 ����  ) . 3 8 = B G L Q  "32>54.#".54>32#7#533#57#53#537'7'73'7/7 &&&&�ZZ��ZZ�@@�@@�@@�@@I&&&&��ZZ��ZZ�d@@�@@@@�@@   �� � 	   '7!5!'773#���n��Tn�r��nnn�      �� � 	   %!'7!3# ��n��nT� �n��n� �   ���� % 7 I  .5'.5'372>=57>7.5%>7�!!!!BQFGQC�x	=:+�*:>	�  ""�<\; ;\>��~			��#4F*-E5!	O
     ����  N c x �  !!!332>54.'5332>54.'5332>54.'53#".54>323#".54>323#".54>32��<��x<
	Z		Z	
<��xy��  ��!	

	!!	

	!!	

	!�<y   �� � " A m � �  4.'>5'4>45%.'.54>7.=62672>7544>7'7'&&.'.=3>72>75.'.=7>7>7 -I[//[I--I[//[I-� 0S="	*2882*	"=S00S=".5<3-'"=S0�*28/*$	.5<<5.	*2882*	.5<<5.	w''��''L
	





	
�;1

3�			
00
	e


2	

	2
    &�| % : ` u  4.#"32>7#0>7104041".54>32#%040414.#"32>7#0>71".54>32#�&''*'1<5j�''')'1<5j''&'./]OLJ''&'./]OJ     &�| % : ` u  %">5'3"232>'6.#".7&>32#%">7'#2"32>7.#".'>32#�*&0=4&''��	((2;6'&&�'//]O&&'��'//]O&&'�      �� �   %'#3735�9gyHOe2wl"d�������|4O 	  �� �     & + 0 5 :  #5'##3!535'#5'33!5!5!7#5!#5!+53#53'#533#53 [��ZZLZ�FF��x����Z<��<ė��<xx�=+7~��]]�~AAy��9��]XX��<�   ���� * /  %#".54>732>54.'7#3�$=R//R=$/A&!9)5H((H5)8"&A/��/R=$$=R/'I;)	$3?")G55G)"?3$);I'��-    Z����     % * / 4  32>=!#".=!'#533#533#57#53#53Z-=""=-��.%11%�xZZ����h� 6))6 ��,!!,xx�ZZZZ��ZZ�<    �� �   + 3  %#".54>732>77+532'.'3�%=P,/R=$ 9L,&B15H('D5!=�.R>#0?$��-L9!$=R/,O=&!4E&(H52B'+�$=R/#@0�   ����  #  !";33335#".54>;���,  ,[=x�[  [� ++ ���[��!!�   �� �  	 $ 9 T i � �  !!!!%35>54.'5#72#".54>335>54.'5#72#".54>32>54.'5#352#".54>3  � ��<���



				i



x

				��  ���<�TT
		
VV
		
K	��
		

		
K	�		��		M				     �� �       %''7'7''7��  ��N�M���N�N�������a��``BakJKKKJ5O��O��O��O     ` ��  3  7'.#"32>7&4&6'".'>32#��	!!���

Zd��   7P��				   $�� � ; Q V k  .#"32>7940<1<0415.#"32>71%".54>32#5%".54>32#�	  	   ��:				X���				��� �5�  aA�o			Y5Y5��				    Z����  - D [  "32>=4.##".=4>32'"32>=4.##".=4>32 "=--=""=--="�%11%%11%�				�-<#�#<--<#�#<-��2%%2�2%%2��
<		<
j<<   Z����   ( 6  "32>=4.##5'#54>7".=!# "=--=""=--="�y,!�y!,1%%1�-<#�#<--<#�#<-��#/��/#�>%2��2%   ���i� E R _  %9"040#1'574.'5#389.5#35>54.''.54>7'5C2	!!	7	!!
	v
	$B!
	�&�"//"*�"//"Z��     <����  : H i  %2>=4.'5#335>335235#54>73#".=+#5#".=3;2>=3 1%!,,!%1K��&&-$2--2$&x&w%1Z.$$.Z1%+:OXXO:w-&&-b)ZZ)bbb     ��  	   55%5%��<��<��<��<�<>�=;�;=      :��  	  # 8 M  !5!!5!!5!"32>54.#"32>54.#"32>54.#���K��K��K��[						�<<�<<�==j��       ��      /37'''3#7<�������yw�xz�xzZ+��,0M1#��"����$#��      ����  + 5 : D Y n  '.&'57'.54>7'#7'5>?4.&>54>7'.5�%$�����		� x�yy-!y		4h$$��+/I=/*%

%*/]3-!�!���ˊ!.3��%D

		   �� �  ;  73".54>;'7'7#"%2+7'7'32>54.#*5''51VV1*Q**1VV15''5�,!)77)1VU1 ,� ,,!2VV1)77)   Z����  + @ U  "7>54.#.54>32"32>54.#".54>32# "=-/8118/-=".,!%11%!,.!!!!				�-<#1lZ==Zl1#<-�E>NT%2$$2%TN>k!  !�				    	   : �   . 3 H ] b w �  5.54>64.'7>55''.54>7'4.&>5%5%'.54>64.'7>5 ��i�Z
		
[i��=
		
[i��=
		
h 

		�

�     Z���� + : Z  ";2>=4>7>54.##".=3#7#.'.54>32 "=-


	<			-="<Z8\		%11%		�/@%+"
?

@
#+%@/�11�		$5((5%   x����   3#53#53#f�["�["��y�   � E� 
   %#535#5332>54.#"3E�65S6T		

2��4	

	    w h e  %#".'1'84"9'.#"32>77##".54>32532>54.#"'71>32 !,	m
!!,!!,o!!
	,!�, 
�!!	
 ,,!

�	!!$$	
!,     �  	 � � �  %'4>75.'.'.>740<=4>7>6"4.'#57>?0<1&>564.'&"#&04033%'575  � ��<��k$$	

w��yy���k��/��
	
	
5
			2�;    x����     3'#3#3#5'3#5#53�l�y"b"x�7�|&&hxxq��qZ<<�<��    ����     #'###!##'3#''7�Z�Z��[Y&��������-������  ���x�  I  %#".54>32.#"14>3234>7>76.'7

(/3'$	


		!



x#+$		 	       � 8 G V  %.#";535#5#>32##332>=4.'#".=4>;%+532�%=P--P=%	-!4E''E4!-	�[��3YB&&BY3y	�,M9!!9M,�	y�y��y    	  �� �  ) 6 ; @ E J _ t  %"32>7.#".'>32#'!3!7'3'%!!77!!%!7!%7!!%"32>'6.#".7&>32#�				

hW��W�!!�f59�X:H��;��?%u'�>��;zh
		
=V_]�#��$�A<<�<yy�,,J��j
		
<      : �    % :  !!7'!!77!!%"32>'6.#".7&>32#���W�W��1<�V=J��;z���Ɔ[[��y	

	<     �� � ; Z y � � � � �  702815>7>54.'.".'."7>32>7#>32.'.54>7!3!5353''#3#5!537'37#'3�#'%

	

			%&$Z				"	�			 !�� ���[ 2'"��
���x�ASh��7				


		
	�





�x��x�$�<<��=#���<<      � ' Q ^ s �  5#;732>732>=4.'+'0#".#'#".=>735%3##5#53532>54.#"352#".54>3(VF-	6<98	-FV(�%;&%>$$8H))H8$���

		hZZ�	vv	���z{���=
		
=     ����    35!#5'!�Z�� ��l������������   �� �     "  #3733#3'#'!'##'33!x��xz��EE�yL���EE��y���=y�(~7AA#�Z(~8AA��jy�  <����  	   #!'#533!#���
ccӵ����� `�4cc�Rė��    �� �   3 8  '.7>.'/.657'74>2762'?���`��
	�kWT�?�R�T�t��aZ��8%	��2�ho�j�Z��  <����  	     !!'!#3#3!7%#37'<��xQ*:*�wy ���yw ��  xZZ��"uD��E��"     �� �    !5!/#'7 �  nnn���nc��n��   ����    '#'##33'37#7!#�U����S��U>>�=g<<���lN�IN     )����   "  37'#5##3#33535#5'!!5!'7!�;;����;;����4#$��L��$#4+MJ�<INxx�<y,/[��.,Z     I � / L a  %#53.''7.'#5'3#54>32##".54>7'7:6232#4.#"32>5 ��	"$$"	��(F]55]F(�			>@	�$"	ZZ	"$5]E))E]5


mp
   Z :��  	  ZL��.�����M����       �  ) M  75>;'7'7#"'1+32>717'7#"./.+32;7'!	:2VV2: ]^^
�2:�	^^~
:2VV(
1VU1	)s	
##
1
	�		�1VV   Z 1��    -5Z^���������1}�    Z ��  	    73#3#73##3Zxz><�zxZ<>��xj��L�x���L��    Z )��     7'5'7'7Z����T���������@vw�v����  4 )��     7'7%'7��ݿ���ܦ����n�wwv�w����       X w $ R  ".#"&3!2>54.#!".54>3:37>327>32#�
)"%$/##/��#$$X

!$$"//"�

		##      � U _  '5>54.&'.&'&&&7'.54>3>6>67'775 #/SS$$#oo$$")
/#�VV22/""%
			$$"		"0AUU3��1     	 � U _  '5>54.&'.&'&&&7'.54>3>6>65'7' #/SS$$#oo$%")
/#�2VV2/""%
			$$"		"0���1WW1   ����   .  !3#!#53!53>323'#54.#"#35��<D&�'EZ��]]ZZ���<��x�[yy[<<      �� + 2 7 < Q f �  %#'##380132>58401380132>5840135+53'3#7".54>32#!".54>32#7#.#"#.#"#5! ;>�Z><

�

<]uG.�i�C/Z'	�	'ĳxx�				�ZZZZZ��				=



ZZ     �� �     (  5##5##!##3#5#3#5!!53353353!�[�[Z Z=�j�<��<<[�[<�<��<�<<<<�Z��+]====]      �� � 1 H _  ".#".#"#70>3235>321'>32.#".#">323� +'"$()  L�*&#!"#%�&#$%#�		�]���e��
c��   ����  1 6 M  %0.=4.#"!'%>=4>32!#533#".5332>5�-=""=-���
%11%
���		7$c#>..>#c#c3&&3ci�x		  	  �� �    , 9 F R ^ k x  "32>'6.#>7#.'3'#7'#.'>7>7#.'3>73.''3 5]F((F]54_D))D_4�	
ZZ
	\C
[)$"�X&'�	ZZ	\X'&�[
"$)�(F]55]F((F]55]F(� !! �"%&�
B�&%"�!  !�"%&�B�&%"
   �� �      !5!%335#35733#35733#3 �  �<<y�<x�=y�����Z����y����xj     �� �      !5!'335#35'33#35'33#3 �  �=y�<x�<y�����Z����y����xj     <����   %#".54>;'7'7#";��"=--="XPttPX1%%1�-=""<-PttO%12$    I����   %+'732>54.+532�-="XPttPX1%%1��"=-�"<-OutO%11%-="    < ��   %#53#53#53Ħs���r6¦7s���r   �� �    ) @  !3!35!!!5!32>54.+"3532+".54>3 � �<�x��<��ӗ		�

��
		
�y��Ky�Z-��K==�				Z   3 	�� > S  %'7'3'#'>7.#"#3.'7'732>77&>32#".7�/_7(.,
.,& 9^0	+13)�

e^/%�  �%/^'++'0		

     �  	    !5!!5!!5!!5! �  �Z��ZZ � �-����xy      �  	    !5!!!5!5!!5! �  Z�Z��Z � -���y�y       �  	    !5!!5!!5!!5! �  �  �  �  � ��xy        �  	    !5!!5!!5!!5! �  �-��Z- � i.���y�y   ����    !  !!#'3#".7&>32������s�	

	��K�=��Z�vv?  -���� S h } � �  >54.#".'535#3.#"732>77'>54.''2.'>34>32.5".54>32#73#53�	
Z
		&$ #''# $&	:
		
��

		�%B11B%%B11B%y�		
%" 4004 "%
n	4	��1A&%B11B%&A1�xZ  ����      ! & +  5!!53#3#!#37#535#53'53#'3#53#5��x�<<��<<L��<�xx�<� <��Z��<��<<[[yZZx[[==    �� �  ' 6 :  !#"7.+'33!!'#'73373#'>;27#7_��MI
����y��"!!Y;�dd�<	����	���`��ZB����B=--5cc   �� �  	      !!!5!!!#53+53+53  � ��<��<��<�<=��<�[[�x��L  -  �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � � � � � � � � � � � � � � � � � � � �  3#535#;5#;5#;5#;5#;5#35#;5#;5#;5#;5#;5#35#;5#;5#;5#;5#;5#;5#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#<<=<<<=��<=x<=��<=<<<=<������ Z=<<<=<j=<<<=<<�<=<<<=<<  "  �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � � � � � � ��  3#53#353#353#353#353#3535#35#;5#;5#;5#;5#;5#;5#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#'""#*#"&*#/"&"&#'./74&4&5/<&546<5?46465'7>?26263?26232237<1/./7.''./*#'0172263?>?>7'7>?0<5<[<<<=��<=<<<=<��+(

(++(
		
(+'$$''$$'�� Z=<<<=<<�<=<<<=<<
(++(

(++(
$''$$''$ !  �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � � � � � � � �  3#53#353#353#353#353#3535#35#;5#;5#;5#;5#;5#;5#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#%'7'<[<<<=��<=<<<=<� }��}�� Z=<<<=<<�<=<<<=<<�|��|    �� �  8 G L \  "13!53!".50201223821!#";!%".=4>;##53'5!".54>3!#/

�;�/xV

V��"����j��
��
2t�x![
	Zx=F((�y� 
  �� �  	     " ' , 1  !!#'373#/3##737'3#%3#53#5!5!5#73  � �GO�GXGX:GXGXSGXGX3GXGX��9G�{G4��<�TG��<�Z<<[<<[<<<<<<<<<[<<�����<<      � 3 W  54.'54>75&'77>=''.='.=4>%7�	���
,

	�	yy[y�-,yD	;
�
CS/S�U�=|S�    �� �  � � � � �  .&77>54.'&&'01&"&"'7>5<.'75.54>7667>5<.'>5''.54>7.54>65'.54>6%5�M

	u	f		
N	
ZF	+,,Z>J���+M	

v
g
		L?[
	G[���;�    � 7 J �Q��i  *+1&".54>75#"*#*#*.'<>732>3>32"."#*.54>3:">'4.#"50&465>7>54.#"1>54.#0"#3>303812>732>774>7>54.#"54.#"04>54."#*30281>;3:023>;32>7"#*&47.54>7>54.#8"01"8132>77:63>454."'3#'4>7>54&041&04"'0*&1"&*#*#1>7>>4'4.#&1"#8"110>14>3>:3820120>7#.103861>74>564>51>454.#O	
	u		

				
	6	q
		

				T


	

		
		
J
	
	!%
			   ��  L a v �  "10>7>76.#>45.'.7>7>32%4>32#".574>32#".5.1>1mL.4F)0cQ77]C�<QW
 .7
)$ ���		�?jM,%cZ@�"c`I$"#*fY<��	 (,!		330�		KE+ !    ��  . C N  #2>7>76.2#".7&>32#".'>3>3.#�lM-5E*/dQ7
N�]t



�
		
)&b[?@iN+�"c`I$"#1y^*_		w !E+     �� �     -  .''%''6>7%%''''�(+-%!	n�n�"�"��;��;==;�!!�w�;	�YK���=;;=    �� � " A  %4.+?4.+"#"3!535!54>;'54>;232 	�&
Z	&�	��<
�0Z0�
y	�j

e�	{{]]	�cd�	]    '����     '777'3#�PPdd�NNff�0PPeePPee�� �        �    3  '.?7>54.'7''7'7>272�*���B���?@'Oa'98�@�*l*��A�	
�>@w`&;
�@�)     ���   P  3#3#!3#3#.54>327.#"#".'32>54.'Z<<Z�==[[�					 
��x��x��		

		    �����    %'7'73#�eOOe��ePPe�  �   6��-�    '773#�PPdd^0PPee��        ����   # '  !777777!3'7#5 ��	YL�p������	�IYM����蠂�  <����    ! & +  7777!''''!#53#537#533#5<=.-----<�xj------ L[��<yyZ�������K999999K��Y%999999'��w/y<x  Z����     73#57!5?/!/?#!5����!"
"!#	�$���QBB�%%��	
�   �� �     7'7%'7?/'7/?���]Bo/�/!��9t��
t�����!/�/o(�t~��   ���K�   # ( -  #"74.#32#54>3'3#'53#=3#<	LJ	<<ZR ZZZZ�	����A	�x77U���   ���� ' M b w � �  "'.54>7>27>54.#'.".54>32'"32>54.#".54>32#'".54>32#'#".54>32 2XA&$>T0'Rp
)&AX2}^":*!:L,,L:! #



Z				S�&AX20VA'R		p-3:2XA&�f^

	&6B%,L:!!:L,0,&�				Zi	

	      � +  ) > S h }  "32>54.#".54>32#7"32>54.#".54>32#7"32>54.#".54>32#<						�				�						+				ZZ				ZZ				Z    � +  ) >  7#".54>327"32>54.#3"32>54.#x				�				�				�				<								    �����  C Q  >54.&57'5>55'.54>7'>7'^	"//"	"--"�	$$	*B	/""/	�;=�6QxzO8
$$
����  ����   $ ?  #".5#32>5##53!#53".=332>=3#K�(@Q))Q@(�y[[��[[iD;'[&&[';D���1��0J22J0:ZZZZ�<(@.��%%��.@(     � +  	  !5!!5! �  �  � +x       �  �  	     "  73#535#;5#;5##35#;5#735# HU�U�U�     �  �  	   73#535#735# xx�xx�xx�    �� �  	  !!!!  � ��<���  ���<      �� �  	     " ' , 1 6 ; @ E J O  !!!!%3#553#53#553#553#53#553#53#53#553#53#53#53#53#5  � ��<��x.��  ���<�y�xy��=-y=y<<=   <����  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � � �  3#535#;5##35#;5#;5#;5#35#35#35#535#35#35#535#35#35##35#;5#;5##35##35#35#35#535#535#35#35#35#<�<�=<�=�<<�<�=��<�yK��<y�=<<     �� �      5#!!#53!3!53#�� ��xxx��<�-yyy��Z���j[��-    �� �  
     !!##53##53!3#5!!i�� �yyy�����yy��<���Z�======����     �� � 
     #33!!3#553#!#535!���K��yyyyy����yx�ėZ�-=�x   I � 
    5#353!5!3#553#���K��xx�yy�xZ[[        �  	    !!!!%'7?'7'  � ��<���GG11�11GG��Z��xj��nGG2222GG    : �  	    7!!!!3#5!3#5<��xL����:L��.������     �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � �  #335##35##35#;5#;5##35#535#535#35#535#35#35#35#535#7#35+35+353#3535#35#535#535#35#535#35#535# ���5�56��5k5���  � ���x�<-y�Z<y<�<y     �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � � � � � � �  3#535##35##35##35##35##35#;5#!35#535#35#535#35#535#535#35#35#35##35#!35##35##35#;5##35##35#35#35#535#535#35#535#35# �=<<<y<j��<-<x����=�x<y�����<y�x�y     �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � �  3#35#;5##35##35#;5#;5#35#35#535#535#35#35#35#35#35##35##35##35##35#35#535#535#35#535#535#35# ����5k5�65659��  � ����<x<=��Z<�x�=�   ���       !!'!'!7?' � ����������V�����<��v�ù�ͺ�
����      ��  	    !5!#53#3#5#53 ��x�ZZ�ZZKZZZZ   Z����  	     " '  !5!!5!!5!7!!5!5!7!!5!5!7!!5ZL��.����L����L����L�����ZZ<�ZZ<�ZZ<�[[<     �   	      735#73#535#73#5735##53 ��ZZ���ZZ���yZZ�ZZ<<ZZ<ZZ<      �   	     !5!3#5#53'3#5#53  � ZZZZ�ZZ�ZZZZ     �� �  	    7!!5!5!!!!!<��<�-��-�  �<�XZ���K��      X h  	     "  5%7'557'5757'5�������A��Giii�����#��h������ xY=     �� �  	    %!5!!!5!!!!��x�[��-��  �<�wi�<��x�      : �  	  5%%  � ��<���k���      �� �  	    %!5!!!5!!!!i��-��-��  �<���<��x�      �� �  	    7!!5!5!!!!! ��<-�� �  �<�XZ���K��       X h  	     "  3#73#'73#73#'3#7!!73#7-��jh������������hy<x<�����   �� �  	    7!!5!5!!!!!��<Z����  �<�XZ���K��     :�h  	    !5!!5!!5!!!5��<��x���L����xh���xx<=     : �  	     " '  !5!!5!'3#535#!!5!5!'3#535#�����K�����ZZ�����K�����ZZh[��y[[x[y��y[[        �  	      !5!!5!35#!!5!5!35#�����K����������K�����I<��Z[��     : �  	    !5!!5!!!5!5!��Z��Z � ��Z��Z � I==x<<y       X h  	     "  #53#35'35#35#35#!!!5!�KK---ZZZZKK�Z��xK��IZ<�=�����     �  �   %!5! �  �   ����  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | � � � � � � �  35#73#535#73#535#73#5735##5335#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#5ZZ[ZZZZZ[ZZ<�ZZZ[ZZZZZ[ZZ�xZZ[ZZZZZ[ZZ�xZZ[ZZZZZ[ZZhZZ<<ZZ<<ZZ<ZZ<�ZZ<<ZZ<<ZZ<<ZZ<�ZZ<<ZZ<<ZZ<<ZZ<�ZZ<<ZZ<<ZZ<<ZZ<   �� �  	     " ' , 1 6 ; @ E J O T Y  35#73#535#73#5735##5335#73#535#73#535#73#535#73#535#73#535#73#5 ��ZZ���ZZ���yZZ���ZZ���ZZ���ZZ�x��ZZ���ZZ���ZZI��yZZy��yZZ��xZZӖ�xZZx��xZZx��xZZ�ӗ�xZZx��xZZx��xZZ     ����  	     " '  35#73#5735##5335#73#535#73#5 ������ӵ���<����������ӵ���ӵ�����ӵ����ӵ��      �  	     " ' , 1 6 ; @ E J O  3#535#35#!35#35#35#%35#35##35!#3535#35#%35#35#35#!35# ZZZZ��ZZZZ�yyyyxxxx�[[ZZ��yyyyxxxx��[[ZZ�[[[[[�[[[[.=[[�===<    : �  	    '%5%5  � ��<�<��.������M����;=       : �  	    '%5%5  � ��<�Z��.������M����Y=;       : �  	    %!'!7!!!!37#���M[��=��ށ�����L���<<    X �  	     #5335#%!!!!5#35�ӗ����  �<���<���.��=<<      X �  	     #5335#%!!!!5#35���ӗ��  �<���<���.��=<<   ����  	     " '  3#3#3#3#3#3#73##3ZZ[ZZZZZ[ZZ<  � ��<�� � ��<�� � ��<��  ���<     �� �  	      3#3#3#3#73##3 ��ZZ���ZZ���yZZ  � ��<�� � ��<��  ���<     �� �  	    3#3#73##3 �������ӵ�  � ��<��  ���<     �� �  	      !5!!5!!!7!!5!5!7!!5  � ��<�� � ��< � ��<�ZZ<���������ZZ<      �� �  	    !!!!!5!5!!  � ��<��<��<��<��  ����==�<<    �� �  	     " ' , 1 6 ;  !!!5!%35#73#5!5!7!!535#73#5!5!7!!535#73#5x��xj��K�ZZZ��xK���ZZZ��xK���ZZ�����ӗZZ<��[[==[[=�ZZ<<ZZ<    Z����  	  :  5!97".54>32#5>54.#"'5!Z������y
		
y������Z�ι



�ў�      �� �  ) 4 I  "32>54.#".54>32#73#535#53'4>32#".5 5]F((F]55]F((F]5/R=$$=R//R=$$=R/Z;7�(F]55]F((F]55]F(�$=R//R=$$=R//R=$m���     �� �  ) > s  "32>54.#".54>32#7#".54>327#4>7>76.'.#"#>32 5]F((F]55]F((F]5/R=$$=R//R=$$=R/#	

	

!	�(F]55]F((F]55]F(�$=R//R=$$=R//R=$r�
		

     �� � Z q � �  .#";;2>54.+"#".'3535#5#>32##332>=4.'32+".54>3'#".=4>;%+532�*9E%%E9*$RZ

ZR 
%0::0%
-	�ZZ��+(C//C(	x	"		
	�"7((7"�
x	��[x��x    Q���� �  %#".=4>7>=4.#"#".=4.#"#".=4.#"#.=4.#"#./.#".=./.>76254>322>2322>2322>232�!cc
		
�``/&n�%��
	�		F	

      �� �  %+++".'.+".54>;2;2>54.#".74>;2>54.#".54>;2>54.#.54>;2>54.+".'&4>?>&'."+".54>;>?>32�
F			`		`/&m�%��
�
�			
!cc
       �� �  %+"+".5<>5#".5<>5.5<>5#".54>;'.47>32+".'./.+";2";2#";2#";2>7>;2�`	
	F		�
��$�n&/`I
			
bb!     K���� �  %"./#".=""#".'""#".=""#".=4>7>=4>3232>54>381232>5>3232>5>332>=4>3>67>&/4.'".=4>32�
		
!cc�
	�		F	

``/&n�%��   �� �     %  %!!5!#''#5#775!!!53!#53��x���KN"Dl�H?&*��K����xK<Z�-�x[�d%u���yl)6Z<<�x<L      �� �  ) R g |  "32>54.#".54>32#7#".54>3232>54>32%4>32#".534>32#".5 5]F((F]55]F((F]5/R=$$=R//R=$$=R/�%11%&&� ��(F]55]F((F]55]F(�$=R//R=$$=R//R=$�1%%1&&i    �� �  ) R g |  "32>54.#".54>32#7#".54.#"#".54>32%4>32#".534>32#".5 5]F((F]55]F((F]5/R=$$=R//R=$$=R/�&&%11%� ��(F]55]F((F]55]F(�$=R//R=$$=R//R=$Z''2%%2�      �  ' 6  !"3!2>54.##!".=!54>3!2!��Z		�		�Z��<��<�	��		.	���� ..  Z ��     ?''%#3Z����/)����.vw�M�x�  Z ��     7'73#��ݿ����߶n�vvw�;�x�  K +��  )  "32>54.#".54>32# %B11B%%B11B%7))77))7�1B%%B11B%%B1��)77))77)  < :��     !'#7!5!��n�w�v��x����/����   �� �  + @ \ z  %3#".5332>5'2>54.#"332>54.#"3#".'7.54>32#4.#"732>5�%11%&&�		x�$=R/�V$=R//R=$5G)(H52a)G5�1%%1&&-/R=$V�/R=$$=R/)G55G)a25H(   �� � " 7 W \  %4.'754.'''5'5''5''5''5''7%%54>7'54>7775 	�		<		�	�'3�3��G�<��>��	n
g"
h��j� ;=Y[xz;=���L@geBJ�   ,���� * A h v � � � �^u  2>7>=4.'.#"3'4>32#".=.4&=332>753#5#".'#54>32.'373#5.'.'."#*23:>7>7>5<.'##5#53#5#".'4.4=3332>7537#".'#53>327#32>56<53#".'.=4>7>32'#".'5>32�		Jc��#I('(('(	('(('(��YMaa3				z
2				2
g<<]pim��/KKrMM
�		���phl�*�>	9
1

#=V   �� �;  .#*#2362#".'.'4&4&/.'.'"."#"2:>72>302232>7>7>764.'"'./.'.'.'.#""#0&401>7>7>3:2332>7>56.'.'>726:32�

 !		

#!

		
	
				

�	'

		&">7-
8	'5< 			

	
			        � i �  #>7#.&.'".'441&"'&"&#7&&"'>50<#>7'&"&#>7>4'.'.'445>54.'".'46564>764.'.'465>7>45.<54>723301 		'!=70
!#&)+IoL'R BeF	
	
	/26	'&!5Wj5	E)`N6
					    ���  ) 0  "32>54.#".54>32#7#5335]F((F]55]F((F]5/R=$$=R//R=$$=R/����(F]55]F((F]55]F(�$=R//R=$$=R//R=$��x     ]���� O �  %'.'.5.=557262>7>?5#&'.'.'.='5>7>7>7267�rra

5			


5

	)rrb	nj{

_�			pP�)
	y,�		(    �� � 2 w �  %>54..'7>54.'./""'.54>?'.54>73>27'7'.54>7>54./.54>7'.&�-Lf8	
2%	-Lf8	
2%	p+K7!	'+K7!	'"+/#	
."**"
	 #�

5_@&1	

5_@&1	�
"6L*

& 8J,
	(�$
		
 	

  ���  :  7.54>7'7'7&%%.=%>=�-<#WOttOW2%
�[
�
M  !=,OusQ$2����
�    �� �  :  7'732'>54.+#!".=#3!2>=#�ttPX"<-%1XP<�Z	�	�ttP-<"!	1%P���		�   x���� 2 > X  %<54.1000>732>514.12#>3">73533.#i""%/.%Zv		x		�3839==98%-"ID	DI"-$$��	��	  :���� n  '.'5.5&4>74>7.44>7>54.&'.54>7�*:#		

	"-!5&4N4*E0%+J5	 	
	#>3

	,7!*&3$ @6!0;!      ���� 	   #5'#53!35#!5#�����y����i�����Z-����     �� �  	     " '  75!73'55#73'5'35?#57!5#57���������������������&�̮���Ȭ��s8����u;��&���     " = �  	   > �  55%5%577>54.'"2>675'1>54.&#62627'6&"&"'27>54.' ��i��i��i��X
		4%	h �z  GT	
	�
T		
    ����   @  3#7";2>54.#"5#035<>7>32354.#hh41gg	
g +1��7��
-@|i�
��$4#      �� �  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w | �  #33#!35##35#;5##35##35#35#35#35#535#535#535#35#535#;5#;5##35#;5#35#535#35#35#35#535#535# xx� ZZKg4h88h4g��  �  � ���<yx<x�y=y<�<=     ����  	     " ' , 1 6 ; @ E J O  3#535#;5#735#35#;5#;5#;5#35#;5#;5#;5#35#;5#;5#;5#ZZyZZxZZyZZ��ZZyZZxZZyZZ��ZZyZZxZZyZZ��ZZyZZxZZyZZ�ZZZZZZZZZZ�ZZZZZZZZxZZZZZZZZyZZZZZZZZ   	  �� �  	     " ' ,  3#535#735#35#;5#;5#35#;5#;5# ����������������������������������������������������      ����  	    3#5!35#35#!35# ��������������������   ����  	    3#3#;#3#ZZyZZxZZyZZ��  �  �  �  �       �� �  	   3#3#3# ����������  �  �  �     �� �  	  3#!3# ������  �      �� �  < Q k �  !"3!2>'.##!".'7332>7.'3'#".7&>32'.#"#'>3!2#7+".'7&>;2���+" -- "+[ �� `&53(bp (**( 	 s  sD(*�!,��,!!,,!�x!!�4''4�y**))Z=!!=c''     �� �  V k �  ##5#53533#".54>7>7.54>7""#".54>7>;#'4.#"32>54.'*#"32>5 O'OO'O�
""1*'02)%�*)#P
%,&")"�'OO'OO��		
$

'( $* �,%*$��		        �  ) p �  %#".54>32'"32>54.##".'.54>7.54>72>32>34.#""#*.'.#";2>5�	
		
	�		
		
b6@EGC9


E

/949/�		;		$$ !!6  #++#       r N  ) >  7#".54>32!#".54>32#4.#"32>5�(((($((((�((((((((    ���w�   ###5354>;#"3w	Gi54+ G,P8X�  X5+X		,    ����     " + 0  ''757'7''7'7%7'7''5777'7��\\�^^h��g^^�jCkDiiii��jDkCCkDj?wv\\QjDkC\hLLhJKD.XX/CKJCE6B9�AAAAHE9B6�5B9FdFF
LL
dF9B5   �� �  . C S r � �  "32>54.#..'>70'.'>32'#>7<652:32>7.5>7#".'.'>2 5]F((F]55]F((F]5�,)&%# K!#	)'"�	"B9-!+�0<D#)@1!		S.?(
'$!
#%)$�(F]55]F((F]55]F(��"%'�"!!' !"1*!�'*'#'+�
%)&4,"
"*1/("   *���� d � �  %.7&>7>7.'.#"#".'.#"32>7>3232>7>7.'#0.'.#"#".'.'>7>3232>7>3201&>7>7�		

	

	


			

		
	

	
	

		|
	
�
				 '&'

	
c	$#"			
	;		



    '���� ( ? m � � �  !+#".7'##".'5#".7''"32>7'6.#%!&>7'&6&65202>327&6:1'6.#"32>'3.#"32>7"32>'7.#s

)	+


	F��		��k	

4�	F		FF		F	���"())("?E��    �� �   " ?  !"3!2>''3'3#'37!!%+'!#".'&>;!'3���
�V�[�z�K����y./C�	�Z		Tyy���<�������B��    �� �    ; P e  !3!2>'.##'37!!%+'!#".'73!'32"32>7.#".'>32#���V�
J����K����yC/.�''%%�T��		�	<<�<<<sBZZ�Z<&&&&�    A���� 9  ."#*7.'23:>7>723:>7((*	 !! 		�#FFD"555456,,,�  ����  ) 5 � � �  %#".54>32#4.#"32>5%.54>7'02627264&#"10".'"3221'0262726.#"1*#>32"0*1"03#".'777>5<&4'�&AX22XA&&AX22XA&$?S00S?$$?S00S?$�]c+9K	 -L	%-2&$ 
9		=@�&?
�2XA&&AX22XA&&AX2/T?$$?T//T?$$?T/T��&08
�E�X��"


����5-&�   �� `  .6'.'.'.'&>>7>7>7>.'�
# 	

'�	'
	"#	
	
	
+'
"E=.     � i  '.'667>7.'666>7.'66"7.7&>7&6&4'>7>7>7�(KpH**%$  	/8<"&
			H3lU7



#(%	
	     l���� K  3#32>7#".'.'.'.=#5>7>7>73rr
			
5	E�zK|

	L	�D

	     ����  1 J  %#!".54>3!24.+";2>534.+";2>=��F����������F���B��   C����    # ( - 2  9!*953353'537'77'77'77'77'7}��!� @�����
���("k"k/(!(!Ʀ��7)(\()5'1(2/#`#`��	��     w�I  5 N g � � � � �V{�  72446"7'766667764544#'4646667660464"7'7"6666372054"6#'76"676204"4&7'76666776054"4'>4660676204"4&7'646&7"6066237254&4#'76"6762'"4"&40326660?725.4#'7646272&44&7'7"6066237'6"6"54446502166662722606"7"606#?"4".7'5?"6&666766223&&7.4'7">>2762627'�=D	%

�,+*11444444332255!N22&'c44iinn2233jj11hhyz+0��0�"
  ���� T  %.5<61'.54>674&<54>6.'1>6�%%q
%%
q%%%
qq
%S$$:	#%8&&$	97&     ����  m  %%.54>%'&'<5040417>54.&0.&>701>54.�!��!!.!�
KK

K

K
I "/" ��{%'	%
'

      �� c x � � � �   %#".'.'6&647.'>32>?>23>32#"./>32%>7.#"6.'.#"32>7>'".'>32##3".'4&647>23#2>74627#".7&>32732>'6.#".#">7�	"((*&$	!%&T		
K$#		
�Z
		�	 %%'#""#'%% 	���

	

	V	

�




	
f
			X	

#		

		
		
				0		Q				�		

�
     ���� �  "<>7>10.54>3232>54.#""'.54>32#".'032>54.# 2XA&&5 
	
%,+@+#8("0
	2XA&&AX2�&AX2%D9-+-$
	

#." *
6+&2$<,&AX22XA&    �� �  	    7'5555 �������������������'�M'��   	 4���� �,A[fq���  %&'.#*#*#"#.'.'&>54.47>7>5"#&"3>.'..45>7>7>7.54>7>32##.'.67>7>.'.67'>4&'.'#.4'.'.'&>&'.#"&>3627><5.''&*54.#"72>4#".'4>2132>7>7>22.32>'..764*#>4&'.70>227>7>233>74.67>234>4.''0>5><#"7"30238205<.#"4>"#762#.#7*1262614.17.#>7:>50.1.2>5.'�

				
					
	
	

	-	
		
		

				
�>!							 

			

	
			
�	
		
		
				


				
M�:v    ;�� 8 �  %'&&%".54>7.454>7>71>7.'.54>67>54.'>6.'7�"��#

		"'4'	��				$			$�#"	'2&
		!	
	#
   ���� - Y � �  %&''.7&>7.>?>?'./.67.7&>76'7>&'.'?>>6.'./7>7>&/72-/

	
1.3/16/l020

	�
.j13/


	.a/c
v0	
		111/31l/11
	
*/m111

��	
1
a1c		  ,����    '!!3/#35?#'37�'��'�O���<;4ml����O11�Y�E*T�74     ����  ) >  "32>54.#".54>32#3".54>32# 2XA&&AX22XA&&AX2\��&AX22XA&&AX22XA&��        �       !!'!'7!7?'  �  ���S��=<��e������x����(��<;�����     -���� ( [ � �  ".54>7>7>7#7"#".#"32>32>7>54.##".'4"0"#*27>7><'0.'."#*>7>3227>4'.'*M;#&$		#%"9L*�		
#

&#
@	
			8L--B-
		.D..K6�	�/      ��       77'77'7''75�c�,�b��c��c�b�c+��*�\RY�[PY
]TWYR\OkQVV   ��   '73?!7!7!7!�HܽR	t���I������IIa(,,\Q4Q    �� �   . C \ u  %#4.#52234.#4.#"32>5##".54>324.#!"3!2>52#!".54>3!,1A&,L9!�=hM,1VsC[	

	i	�Z		�	-�Z�:%@0 9K+=,Mh=CsV1��

		Z�		�Z		��Z�     �� �   . C  #.#72236.#6.#"32>'##".7&>32Q/To@E{[6��f��JP��kw
		

		
 >nR/4ZyD K��el��O�<						        ɵ��_<�      ϥR�    ϥR�����	�             ���   ����	               d                   =     <    i    ��  �      <   �� ��                �       k         �  %             Z  <  i  i  �     #    '  #  <  ;  [                    ��  >  /  ^     "  -                ��           #  �    �  r    2               �  �        �  	    x                2  ?  4  2  <     <                <       x  I    Z           	                                Z            `  $  Z  Z  �  <               Z     Z  x  �        x    �                      <    <       )     Z     Z  Z  Z  4                                 <  I  <     3                -                                           '      �  6     <  Z    �          �                   <                                  Z                                                                                            Z           Q       K              Z  Z  K  <       ,         ]          x  :        "                                   �       *  '        A         l    C               4      ,       -               
   H ��:�D@��p� �R�	j	�
"
~B�"N�� R��,��T�L���&��l���J��>�<��6Z�8x� ��r�(D�����0�  ` � � �!!d!�!�!�"
""":"�"�##`#~#�#�#�$p%v%�&*&�&�&�''L'�(6(�)�*�*�++(+T+�+�,(,F,d,�-�.�/./�/�0B0�0�11R22T2�323�3�4r4�55�5�6`6�7*7�8n8�8�96:$:J:x:�;P< <^=4=�>>@>b>�>�??<?r?�@@~@�@�@�A ApA�B�B�CfC�D(D�E>EpE�E�FFFzF�GG>GdG�G�H�H�I0IdJ�L�M^M�N&N�O�R�SBS�TT^T�T�ULUfU�U�VVDV|V�W�X<X�YY^YvY�Y�Y�ZLZ�[([V[�[�[�[�\�]v^$^P^r^�^�__6_t_�_�_�``D`l`�`�aa0ahavbNb�ccxc�c�c�d&dRd�d�d�e,eTe�ffjgg�h�i�j�k�l@l�m�m�m�nnPnloo�qjst>t�uJvLv�v�wfw�x$xfy yxz"z�z�z�{{6{L||�}�}�}�~R �b�R���N���������~�ʈ�v����6�^�揠���ԑ,�\�V�����F��     d� -                         �                 G        $        U                2      
 ( c  	      	   G  	   $  	   U  	     	   9  	 
 ( c t h e m i f y V e r s i o n   1 . 0 t h e m i f ythemify t h e m i f y R e g u l a r t h e m i f y G e n e r a t e d   b y   I c o M o o n                                                                                                                                                                                                                                                                                                          7ƯX�;ZG|��/Ƹ��G[�4h�x
�cp\�������G�}�[S�,�dw�6���_�B3��Ob��k��[p�?���H�n.R���U������� !��e2N`�-<�4��N;̧p���?GŪ�	&a��so2
S����n̷_	��݇�E�?�� .^����1�����zA-������O-���w�E=�E��� }�C�L�1�&����\<K����f<�
����:��b�^%�O�gs��a�+�Ŧ\�k$��#�� o�֖Pr�s��J�~}H�ᴟ���9Օ�MI��I�s�AU0C}ER�`(2V��'a�T�z
|��(84}�m�A�[�h�޾^���=ᘉ<��U�N3-�ܪ-�#y�2����c1�&8_[�k	�GȪ~$2bU�Czsn�=�J��4f�P����Q�z��_A��W��b�Z�s����_�視Iׁ�`����?�V_
w��'헭3���NA??��X��P n'}0����I����S4(��UO�~U�u�����#e0���4(l^s��<J���Ts���P�D����1�d{�6���Ď�����@�������c��
|�Nw�ma��mުl���k[U�S|B�i��rPDs���V_�F����pk��]����%�-���%��⥤G��*p�ѕ9�0J�x���w[��,s}��}�T`�OuɖP �^u��SJ�|�NJ�q�.�>�s��|�@���@�[����Yܹ����c�@�WBU�T�>"��v�,>�)*rV�D�do���&E��]@j،��Z3Yʨj�a�N~�+֎d�~��Ybo���?�k��U�-�2���<K,���\AR��Ń��n�1�:Q�ϩ�v���.�2O��d�>����QG��K�>��kS��[yd �YO|^K�pgd���>.��pݟ}\�X޲�^9������O�2��Rje��S#_2}�Z�����i�k����^c��7s��#��;~$�7�w�U����a9���3�Ľ������ފ��9[C�(@�H�����N�� ��1j�ñYL�[�����R�_��d��7pO3��rRD�wGrd1#�<S�p�~w 5�<��P��\����9��|��+�	�Y<���>Ds/������D�S�d� ��4?_�j�~ZGr�����+eAQ�N�K�B¶��i:Sp�{@����B}T��;��0� 7U�=O}œ�y��ޚ6�Z�,`J��:�|�8E��0%���n(Y[�6��w�Oqx>{=U��e@y�Wm�PK�_^j+��6G�Q�A��.����s}�6@k���aX8J�I;{�4�]��N\qh��Q�L�u�q-��0����9�\m[�p�lL�H�qK�Vqk����N`�2�C�9��������L&�3�+�ګ���ԡe�C�0�-�J��d���j�ӡ�B���VT�
->e�p�S�����j8@����=��j
�[uү�p!4�����{t�1'Y4CJ~���!3���j������t��N#�=�9��#�CU��ⱉ��6�L�����9������!.'�C�X[i�y�����(�SHKq�㄃��)�W����a�ٙ�����خ�4�y��z�̐���A��H�։mfqT�U/h����3�!��^���-޸A�����@�(�#-� �I<̈́bW/��2�بn�Y���ˏS����p��k:��O��xf�8�"x���GR�Br8�Ll��w���L�x�$���t�		����挳�A+��`���Ѝ����K��9Ĳ�?q29��
"�^,�l?�+@Y�Τ���m1}֔�L����HKKI�f-��� ��aQ�Mz��>9e�?Rg��o��f�1�QO���z�pXLᜠ�TL,}K,��Gy��?��U�$�)���lѡ�E�w���� �%_��v�
a���	]5b=�^���(�`"1��	K�G��n�mF�[*�^f��UF4UG(�HY�9�� YtkYN�`�[M�	.�eֈ���e��C\@�~��S����U���G�Kap5̮
�3��ڳ�
��` �'I�Dr ��*U֊�������w�;w��":.-�$g"
7�) a8¡;�^�3M}� �&���k�{�/�Q�HVmcȣ��H U�������l�?^ϢB�V;ї}��F�1A2�c����~퐾�W㙼S.��Y���������� pO�-����E!QP�0��Y�b	}%� 1'$���]�zr�;��U\֬U~9����[7�d�:���Y��a�w����Qh�����2�oM|}��-�w�7.��X�I5��ҿ�-xS4F�C�����e��FӒb(��M,�q�p�0��[�C5���w@�s��\94�׍��Z���R�+c�@�n��YOߏ�;����1O�ϫ��限5�؆$���[�89�ș�~Co�{7[�{��k�����q����V��w�(��d6	lI2Qc�oNcR��;��IB�ЄWVJ6���S�|� @���8�׾�$�/�=��v��|D�ʔf35=G �/��WyN>Ō �g*`
��4!M�+J����N�����	."ϵ��ß��Z�"�~R��A"k\,���	'MKR3��V'B��8�l��q�udG�\�{��������p�ζ��RSK��*��̺�$�Mp��G��Tw��n���Ͻq<�nvs?b���HKa��7��`�";#�$pk�Qz�i�)�'�
�'Ϭ��&�����p���cIմLt��(�,8ť�U�믖�Ϭn�5itw�tO	�=n5A����u�����d���>�'��+a()�x��;��페p�^ƯY�\�9;��e��1(��Y�[ݍ��c��E�ub:{��2��A���s�-�&�ʝ����Y�瞇8�B��%�6�2xo����ѧ��+`��ю�2�>'Õ���A���:�B�3�ҵ�%�J�e��0���!����C��p)�<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="Palette2">
    <group name="Swing">
      <item class="com.intellij.uiDesigner.HSpacer" tooltip-text="Horizontal Spacer" icon="/com/intellij/uiDesigner/icons/hspacer.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="1" hsize-policy="6" anchor="0" fill="1" />
      </item>
      <item class="com.intellij.uiDesigner.VSpacer" tooltip-text="Vertical Spacer" icon="/com/intellij/uiDesigner/icons/vspacer.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="1" anchor="0" fill="2" />
      </item>
      <item class="javax.swing.JPanel" icon="/com/intellij/uiDesigner/icons/panel.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="3" hsize-policy="3" anchor="0" fill="3" />
      </item>
      <item class="javax.swing.JScrollPane" icon="/com/intellij/uiDesigner/icons/scrollPane.png" removable="false" auto-create-binding="false" can-attach-label="true">
        <default-constraints vsize-policy="7" hsize-policy="7" anchor="0" fill="3" />
      </item>
      <item class="javax.swing.JButton" icon="/com/intellij/uiDesigner/icons/button.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="3" anchor="0" fill="1" />
        <initial-values>
          <property name="text" value="Button" />
        </initial-values>
      </item>
      <item class="javax.swing.JRadioButton" icon="/com/intellij/uiDesigner/icons/radioButton.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="3" anchor="8" fill="0" />
        <initial-values>
          <property name="text" value="RadioButton" />
        </initial-values>
      </item>
      <item class="javax.swing.JCheckBox" icon="/com/intellij/uiDesigner/icons/checkBox.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="3" anchor="8" fill="0" />
        <initial-values>
          <property name="text" value="CheckBox" />
        </initial-values>
      </item>
      <item class="javax.swing.JLabel" icon="/com/intellij/uiDesigner/icons/label.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="0" anchor="8" fill="0" />
        <initial-values>
          <property name="text" value="Label" />
        </initial-values>
      </item>
      <item class="javax.swing.JTextField" icon="/com/intellij/uiDesigner/icons/textField.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1">
          <preferred-size width="150" height="-1" />
        </default-constraints>
      </item>
      <item class="javax.swing.JPasswordField" icon="/com/intellij/uiDesigner/icons/passwordField.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1">
          <preferred-size width="150" height="-1" />
        </default-constraints>
      </item>
      <item class="javax.swing.JFormattedTextField" icon="/com/intellij/uiDesigner/icons/formattedTextField.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1">
          <preferred-size width="150" height="-1" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTextArea" icon="/com/intellij/uiDesigner/icons/textArea.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTextPane" icon="/com/intellij/uiDesigner/icons/textPane.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JEditorPane" icon="/com/intellij/uiDesigner/icons/editorPane.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JComboBox" icon="/com/intellij/uiDesigner/icons/comboBox.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="2" anchor="8" fill="1" />
      </item>
      <item class="javax.swing.JTable" icon="/com/intellij/uiDesigner/icons/table.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JList" icon="/com/intellij/uiDesigner/icons/list.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="2" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTree" icon="/com/intellij/uiDesigner/icons/tree.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTabbedPane" icon="/com/intellij/uiDesigner/icons/tabbedPane.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="3" hsize-policy="3" anchor="0" fill="3">
          <preferred-size width="200" height="200" />
        </default-constraints>
      </item>
      <item class="javax.swing.JSplitPane" icon="/com/intellij/uiDesigner/icons/splitPane.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="3" hsize-policy="3" anchor="0" fill="3">
          <preferred-size width="200" height="200" />
        </default-constraints>
      </item>
      <item class="javax.swing.JSpinner" icon="/com/intellij/uiDesigner/icons/spinner.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1" />
      </item>
      <item class="javax.swing.JSlider" icon="/com/intellij/uiDesigner/icons/slider.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1" />
      </item>
      <item class="javax.swing.JSeparator" icon="/com/intellij/uiDesigner/icons/separator.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3" />
      </item>
      <item class="javax.swing.JProgressBar" icon="/com/intellij/uiDesigner/icons/progressbar.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="0" fill="1" />
      </item>
      <item class="javax.swing.JToolBar" icon="/com/intellij/uiDesigner/icons/toolbar.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="0" fill="1">
          <preferred-size width="-1" height="20" />
        </default-constraints>
      </item>
      <item class="javax.swing.JToolBar$Separator" icon="/com/intellij/uiDesigner/icons/toolbarSeparator.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="0" anchor="0" fill="1" />
      </item>
      <item class="javax.swing.JScrollBar" icon="/com/intellij/uiDesigner/icons/scrollbar.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="0" anchor="0" fill="2" />
      </item>
    </group>
  </component>
</project>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    